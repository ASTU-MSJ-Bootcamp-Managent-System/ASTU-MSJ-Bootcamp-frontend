import { useState, useEffect, useCallback } from "react";
import "../styles.css";
import Dashboard from "./components/Dashboard";
import { ForgotPortal, Login } from "./components/Auth";
import {
  loginUser,
  logoutUser,
  registerStudent,
  requestPasswordReset,
  getDashboard,
  getUsers,
  getBatches,
  getAttendanceByBatch,
  getAssignments,
  getAssignmentsByBatch,
  getMySubmissions,
  getSubmissionsByAssignment,
  getSubmissionsByBatch,
  getAnnouncements,
  getProgressByBatch,
  getUserProfile,
  approveUser,
  createUser,
  updateUserRole,
  deleteUser,
  enrollStudent,
  removeStudentFromBatch,
  assignMentor,
  getMentorStudents,
  attachMentor,
  createAttendance,
  updateAttendance,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  createSubmission,
  gradeSubmission,
  requestResubmission,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  createProgress,
  updateProgress,
  deleteProgress,
  changePassword,
  updateUserProfile,
  clearCache,
} from "../api/client";

/* ── Throttled attendance fetch ─────────────────────────────────────── */
const CHUNK = 3;
async function fetchAttThrottled(token, batches) {
  const out = [];
  for (let i = 0; i < batches.length; i += CHUNK) {
    const chunk = batches.slice(i, i + CHUNK);
    const r = await Promise.allSettled(
      chunk.map((b) => getAttendanceByBatch(token, b._id)),
    );
    out.push(...r);
    if (i + CHUNK < batches.length) await new Promise((r) => setTimeout(r, 300));
  }
  return out;
}

export default function StudentMentorPortal() {
  const [screen, setScreen] = useState(() =>
    sessionStorage.getItem("msj-token") ? "app" : "login",
  );
  const [role, setRole] = useState(
    () => sessionStorage.getItem("msj-role") || "student",
  );
  const [token, setToken] = useState(
    () => sessionStorage.getItem("msj-token") || "",
  );

  /* ── Data state ───────────────────────────────────────────────────── */
  const [me, setMe] = useState(null);
  const [people, setPeople] = useState([]);
  const [batches, setBatches] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ── Auth helpers ─────────────────────────────────────────────────── */
  const enter = (nextRole, nextToken) => {
    const r = nextRole.toLowerCase();
    setRole(r);
    setToken(nextToken);
    sessionStorage.setItem("msj-role", r);
    sessionStorage.setItem("msj-token", nextToken);
    setScreen("app");
  };

  async function signIn(credentials) {
    const res = await loginUser(credentials);
    const { token: t, user } = res.data || {};
    if (!t || !user?.role)
      throw new Error("The server did not return a valid login session.");
    if (user.role === "ADMIN")
      throw new Error("Please use the administrator portal to sign in.");
    enter(user.role, t);
  }

  function requestAccount(draft) {
    return registerStudent({
      ...draft,
      email: draft.email.trim().toLowerCase(),
    });
  }

  /* ── Fetch all data ───────────────────────────────────────────────── */
  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const dashRes = await getDashboard(token, role).catch(() => ({ data: {} }));
      const dash = dashRes.data || {};

      const [usersRes, batchesRes, annRes, mentorStudentsRes] = await Promise.all([
        getUsers(token).catch(() => ({ data: [] })),
        getBatches(token).catch(() => ({ data: [] })),
        getAnnouncements(token).catch(() => ({ data: [] })),
        getMentorStudents(token).catch(() => ({ data: [] })),
      ]);

      const users = usersRes.data || [];
      const batchList = batchesRes.data || [];
      const annList = annRes.data || [];

      /* ── Profile ──────────────────────────────────────────────────── */
      let profile = null;
      try {
        const pRes = await getUserProfile(token);
        profile = pRes.data || null;
      } catch {
        profile = users.find((u) => u.role?.toLowerCase() === role) || null;
      }
      setMe(profile);

      /* ── Attendance (throttled per batch) ─────────────────────────── */
      const attResults = await fetchAttThrottled(token, batchList);
      const attRecords = [];
      const batchById = Object.fromEntries(batchList.map((b) => [b._id, b]));
      const userById = Object.fromEntries(users.map((u) => [u._id, u]));
      /* Also populate from batch data — mentors/students may not appear in getUsers */
      for (const batch of batchList) {
        for (const m of batch.mentors || []) {
          const mObj = typeof m === "object" ? m : null;
          const mId = mObj?._id || m;
          if (mId && !userById[mId]) userById[mId] = mObj || { _id: mId, name: "Mentor" };
          if (mObj && userById[mId]) Object.assign(userById[mId], mObj);
        }
        for (const s of batch.students || []) {
          const sObj = typeof s === "object" ? s : null;
          const sId = sObj?._id || s;
          if (sId && !userById[sId]) userById[sId] = sObj || { _id: sId, name: "Student" };
          if (sObj && userById[sId]) Object.assign(userById[sId], sObj);
        }
      }

      for (const r of attResults) {
        if (r.status !== "fulfilled") continue;
        for (const rec of r.value?.data || []) {
          const sId = rec.student?._id || rec.student;
          const bId = rec.batch?._id || rec.batch;
          const bObj = rec.batch?._id ? rec.batch : batchById[bId];
          const sObj = rec.student?.name ? rec.student : userById[sId];
          attRecords.push({
            _id: rec._id,
            studentId: sId,
            studentName: sObj?.name || "Unknown",
            batchId: bId,
            batchName: bObj?.name || "Unknown",
            date: (rec.date || "").split("T")[0],
            status: rec.status,
            note: rec.note || "",
          });
        }
      }
      attRecords.sort((a, b) => b.date.localeCompare(a.date));
      setAttendance(attRecords);

      /* ── Students / People ────────────────────────────────────────── */
      /*
       * Primary source: batch data (mentors always have access to their batches).
       * getUsers() may return empty for mentors/students due to role restrictions,
       * so we derive the student list from batches as the authoritative source.
       */

      /* Helper: extract an ID from a value that may be a populated object or a plain string */
      const extractId = (v) => (v && typeof v === "object" ? v._id || v.id : v) || null;
      const extractName = (v, fallback) =>
        v && typeof v === "object" ? v.name || fallback : fallback;

      /* 1. Build student list from batch data ─────────────────────────── */
      const batchStudentMap = {}; // studentId → user object (enriched)
      const studentBatchMap = {}; // studentId → batch object

      for (const batch of batchList) {
        for (const s of batch.students || []) {
          const sId = extractId(s);
          if (!sId) continue;
          /* Merge: prefer populated object from batch, fall back to getUsers data */
          const fromBatch = typeof s === "object" ? s : {};
          const fromUsers = userById[sId] || {};
          batchStudentMap[sId] = { ...fromUsers, ...fromBatch, _id: sId };
          studentBatchMap[sId] = batch;
        }
      }

      /* 2. Also merge any students from getUsers that weren't in batches */
      for (const u of users) {
        if (u.role === "STUDENT" && !batchStudentMap[u._id]) {
          batchStudentMap[u._id] = u;
        }
        /* Keep userById populated for mentor lookups */
        userById[u._id] = u;
      }

      /* 3. Build mentor→students mapping ─────────────────────────────── */
      const studentToMentorMap = {}; // studentId → mentorId

      /* Primary: from batch data (batch.mentors → batch.students) */
      for (const batch of batchList) {
        const mentorIds = (batch.mentors || []).map(extractId).filter(Boolean);
        if (mentorIds.length === 0) continue;
        const primaryMentorId = mentorIds[0];
        for (const s of batch.students || []) {
          const sId = extractId(s);
          if (sId) studentToMentorMap[sId] = primaryMentorId;
        }
      }

      /* Supplement: from getMentorStudents endpoint */
      const mentorStudentsData = mentorStudentsRes.data || [];
      for (const ms of mentorStudentsData) {
        const mId = extractId(ms.mentor) || ms.mentorId || extractId(ms);
        /* Handle { mentor, student } pairs */
        const sId = extractId(ms.student) || ms.studentId;
        if (mId && sId) {
          studentToMentorMap[sId] = mId;
        }
        /* Handle { _id, students: [...] } groups */
        if (ms.students && Array.isArray(ms.students)) {
          const groupId = extractId(ms.mentor) || ms.mentorId || ms._id;
          for (const s of ms.students) {
            const sid = extractId(s);
            if (groupId && sid) studentToMentorMap[sid] = groupId;
          }
        }
      }

      /* Also build reverse map for mentors who need to see their mentees */
      const mentorStudentIds = {}; // mentorId → Set<studentId>
      for (const [sId, mId] of Object.entries(studentToMentorMap)) {
        mentorStudentIds[mId] ??= new Set();
        mentorStudentIds[mId].add(sId);
      }

      /* 4. Enrich each student into the people list ──────────────────── */
      const enriched = Object.values(batchStudentMap).map((u) => {
        const batch = studentBatchMap[u._id];
        const batchMentors = batch?.mentors || [];

        const assignedMentorId = studentToMentorMap[u._id] || null;
        /* Resolve mentor name: try userById first, then batch mentor object, then string */
        const assignedMentorObj = assignedMentorId ? userById[assignedMentorId] : null;
        const assignedMentorName =
          assignedMentorObj?.name ||
          extractName(batchMentors.find((m) => extractId(m) === assignedMentorId), null) ||
          extractName(batchMentors[0], "Unassigned") ||
          "Unassigned";

        const perS = attRecords.filter((a) => a.studentId === u._id);
        const total = perS.length;
        const present = perS.filter(
          (a) => a.status === "PRESENT" || a.status === "LATE",
        ).length;
        const attPct = total ? Math.round((present / total) * 100) : 0;

        return {
          _id: u._id,
          name: u.name || "Student",
          email: u.email || "",
          role: u.role || "STUDENT",
          batch: batch?.name || "Unassigned",
          batchId: batch?._id || null,
          mentor: assignedMentorName,
          mentorId: assignedMentorId,
          status: u.isApproved !== false ? "Active" : "Suspended",
          attendance: attPct,
          progress: 0,
        };
      });
      setPeople(enriched);

      /* ── Assignments (fetch by batch for accuracy) ─────────────── */
      let assignList = dash.assignments || [];
      if (assignList.length === 0 && batchList.length > 0) {
        const batchIds = batchList.map((b) => b._id);
        const assignResults = await Promise.allSettled(
          batchIds.map((bid) => getAssignmentsByBatch(token, bid)),
        );
        for (const r of assignResults) {
          if (r.status === "fulfilled") {
            assignList.push(...(r.value?.data || []));
          }
        }
      }
      setAssignments(
        assignList.map((a) => ({
          _id: a._id,
          title: a.title,
          description: a.description || "",
          instructions: a.instructions || "",
          deadline: a.deadline,
          maximumScore: a.maximumScore || 100,
          batch: a.batch?._id || a.batch || null,
          batchName: a.batch?.name || "",
        })),
      );

      /* ── Submissions ──────────────────────────────────────────────── */
      if (role === "student") {
        try {
          const subRes = await getMySubmissions(token);
          setSubmissions(
            (subRes.data || []).map((s) => ({
              _id: s._id,
              assignmentId: s.assignment?._id || s.assignment,
              studentId: s.student?._id || s.student || me?._id,
              githubUrl: s.githubUrl,
              liveDemoUrl: s.liveDemoUrl || "",
              notes: s.notes || "",
              grade: s.grade ?? null,
              feedback: s.feedback || "",
              status: s.status || "SUBMITTED",
            })),
          );
        } catch {
          setSubmissions([]);
        }
      } else {
        /* Mentor / Admin: fetch submissions per assignment from fetched assignments */
        let subList = dash.submissions || [];
        if (subList.length === 0 && assignList.length > 0) {
          const subResults = await Promise.allSettled(
            assignList.map((a) => getSubmissionsByAssignment(token, a._id)),
          );
          for (const r of subResults) {
            if (r.status === "fulfilled") {
              subList.push(...(r.value?.data || []));
            }
          }
        }
        setSubmissions(
          subList.map((s) => ({
            _id: s._id,
            assignmentId: s.assignment?._id || s.assignment,
            studentId: s.student?._id || s.student,
            githubUrl: s.githubUrl,
            liveDemoUrl: s.liveDemoUrl || "",
            notes: s.notes || "",
            grade: s.grade ?? null,
            feedback: s.feedback || "",
            status: s.status || "SUBMITTED",
          })),
        );
      }

      /* ── Announcements ────────────────────────────────────────────── */
      setAnnouncements(
        annList.map((a) => ({
          _id: a._id,
          title: a.title,
          body: a.body || a.content || "",
          audience: a.audience || "All",
          date: a.createdAt
            ? new Date(a.createdAt).toLocaleDateString()
            : "Unknown",
        })),
      );

      /* Store mentor→student map on window for screens that need it (debug) */
      if (typeof window !== "undefined") window.__mentorStudentIds = mentorStudentIds;

      /* ── Progress (fetch by batch for accuracy) ─────────────────── */
      let progList = dash.progress || [];
      if (progList.length === 0 && batchList.length > 0) {
        const progResults = await Promise.allSettled(
          batchList.map((b) => getProgressByBatch(token, b._id)),
        );
        for (const r of progResults) {
          if (r.status === "fulfilled") {
            progList.push(...(r.value?.data || []));
          }
        }
      }
      setProgress(
        progList.map((p) => ({
          _id: p._id,
          studentId: p.student?._id || p.student,
          studentName: p.student?.name || "Unknown",
          batchId: p.batch?._id || p.batch,
          batchName: p.batch?.name || "Unknown",
          topic: p.topic,
          status: p.status || "NOT_STARTED",
          notes: p.notes || "",
        })),
      );
    } catch (err) {
      console.error("Portal data fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, [token, role]);

  useEffect(() => {
    if (token && screen === "app") fetchData();
  }, [token, role, screen, fetchData]);

  /* ── Sign out ─────────────────────────────────────────────────────── */
  async function signOut() {
    try { if (token) await logoutUser(token); } catch {}
    sessionStorage.removeItem("msj-token");
    sessionStorage.removeItem("msj-role");
    clearCache();
    setToken("");
    setScreen("login");
    setMe(null);
    setPeople([]);
    setBatches([]);
    setAttendance([]);
    setAssignments([]);
    setSubmissions([]);
    setAnnouncements([]);
    setProgress([]);
  }

  /* ── Render ───────────────────────────────────────────────────────── */
  if (screen === "forgot")
    return (
      <ForgotPortal
        back={() => setScreen("login")}
        requestReset={requestPasswordReset}
      />
    );

  if (screen !== "app")
    return (
      <Login
        mode={screen}
        login={signIn}
        requestAccount={requestAccount}
        forgot={() => setScreen("forgot")}
        back={() => setScreen("login")}
        createAccount={() => setScreen("register")}
      />
    );

  /* ── Action wrappers (call API then re-fetch) ──────────────────── */
  async function handleAssignMentor(student, mentorId) {
    try {
      if (!student.batchId) throw new Error("Student is not enrolled in a batch.");
      await assignMentor(token, student.batchId, student._id, mentorId);
      await fetchData();
    } catch (e) { alert(e.message); }
  }

  async function handleApproveUser(id) {
    try {
      await approveUser(token, id);
      await fetchData();
    } catch (e) { alert(e.message); }
  }

  async function handleRejectUser(id) {
    try {
      await deleteUser(token, id);
      await fetchData();
    } catch (e) { alert(e.message); }
  }

  async function handleCreateBatch(d) {
    try {
      await attachMentor(token, d.batchId, d.mentorId);
      await fetchData();
    } catch (e) { alert(e.message); }
  }

  async function handleRemoveStudentFromBatch(batchId, studentId) {
    try {
      await removeStudentFromBatch(token, batchId, studentId);
      await fetchData();
    } catch (e) { alert(e.message); }
  }

  return (
    <Dashboard
      role={role}
      token={token}
      me={me}
      people={people}
      setPeople={setPeople}
      batches={batches}
      setBatches={setBatches}
      attendance={attendance}
      setAttendance={setAttendance}
      assignments={assignments}
      setAssignments={setAssignments}
      submissions={submissions}
      setSubmissions={setSubmissions}
      announcements={announcements}
      setAnnouncements={setAnnouncements}
      progress={progress}
      setProgress={setProgress}
      loading={loading}
      refresh={fetchData}
      logout={signOut}
      assignMentor={handleAssignMentor}
      approveUser={handleApproveUser}
      rejectUser={handleRejectUser}
      removeStudentFromBatch={handleRemoveStudentFromBatch}
    />
  );
}
