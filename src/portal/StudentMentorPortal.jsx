import { useState, useEffect, useCallback } from "react";
import "../styles.css";
import Dashboard from "./components/Dashboard";
import { ForgotPortal, Login, ResetPasswordConfirm } from "./components/Auth";
import {
  loginUser,
  logoutUser,
  registerStudent,
  requestPasswordReset,
  resetPasswordConfirm as apiResetPasswordConfirm,
  getDashboard,
  getUsers,
  getBatches,
  getAttendanceByBatch,
  getAssignmentsByBatch,
  getMySubmissions,
  getSubmissionsByAssignment,
  getAnnouncements,
  getProgressByBatch,
  getUserProfile,
  approveUser,
  deleteUser,
  removeStudentFromBatch,
  assignMentor,
  getMentorStudents,
  attachMentor,
  detachMentor,
  enrollStudent,
  updateUserRole,
  updateUserProfile,
  createAttendance,
  createAssignment,
  createSubmission,
  gradeSubmission,
  createAnnouncement,
  deleteAnnouncement,
  createProgress,
  updateProgress,
  deleteProgress,
  changePassword,
  clearCache,
} from "../api/client";
import { handleApiError, showSuccess } from "../api/toast";

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

/* ── Helpers ────────────────────────────────────────────────────────── */
const extractId = (v) => (v && typeof v === "object" ? v._id || v.id : v) || null;
const extractName = (v, fb) => (v && typeof v === "object" ? v.name || fb : fb);

export default function StudentMentorPortal() {
  /* Detect reset token from URL: /reset-password?token=xxx */
  const [resetToken] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('token') || '';
  });

  const [screen, setScreen] = useState(() => {
    if (sessionStorage.getItem('msj-token')) return 'app';
    if (new URLSearchParams(window.location.search).get('token')) return 'reset';
    return 'login';
  });
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
      /* ── 1. Fetch everything in parallel ─────────────────────────── */
      const [dashRes, usersRes, batchesRes, annRes, mentorStudentsRes] =
        await Promise.all([
          getDashboard(token, role).catch(() => ({ data: {} })),
          getUsers(token).catch(() => ({ data: [] })),
          getBatches(token).catch(() => ({ data: [] })),
          getAnnouncements(token).catch(() => ({ data: [] })),
          getMentorStudents(token).catch(() => ({ data: [] })),
        ]);

      const dash = dashRes.data || {};
      const users = usersRes.data || [];
      const rawBatches = batchesRes.data || [];
      const annList = annRes.data || [];

      /*
       * The dashboard may include batches/students directly for non-admin roles.
       * Merge them with the direct API results so we always have data.
       */
      const dashBatches = dash.batches || dash.batchList || [];
      const dashStudents = dash.students || dash.studentList || [];
      const batchList = rawBatches.length > 0 ? rawBatches : dashBatches;

      console.log("[Portal] role:", role);
      console.log("[Portal] users:", users.length, "batches:", batchList.length);
      console.log("[Portal] mentorStudents:", mentorStudentsRes.data);
      console.log("[Portal] dashboard keys:", Object.keys(dash));

      /* ── 2. Profile ──────────────────────────────────────────────── */
      let profile = null;
      try {
        const pRes = await getUserProfile(token);
        profile = pRes.data || null;
      } catch {
        profile = users.find((u) => u.role?.toLowerCase() === role) || null;
      }
      setMe(profile);
      setBatches(batchList);

      /* ── 3. Build userById from all sources ──────────────────────── */
      const userById = {};
      for (const u of users) userById[u._id] = u;

      /* Enrich from batch data (mentors/students embedded in batches) */
      for (const batch of batchList) {
        for (const m of batch.mentors || []) {
          const mObj = typeof m === "object" ? m : null;
          const mId = mObj?._id || m;
          if (mId) {
            if (!userById[mId]) userById[mId] = mObj || { _id: mId, name: "Mentor" };
            else if (mObj) Object.assign(userById[mId], mObj);
          }
        }
        for (const s of batch.students || []) {
          const sObj = typeof s === "object" ? s : null;
          const sId = sObj?._id || s;
          if (sId) {
            if (!userById[sId]) userById[sId] = sObj || { _id: sId, name: "Student" };
            else if (sObj) Object.assign(userById[sId], sObj);
          }
        }
      }

      /* Also include dashboard students */
      for (const s of dashStudents) {
        const sId = extractId(s);
        if (sId && !userById[sId]) {
          userById[sId] = typeof s === "object" ? s : { _id: sId, name: "Student" };
        } else if (sId && typeof s === "object") {
          Object.assign(userById[sId], s);
        }
      }

      /* ── 4. Attendance ──────────────────────────────────────────── */
      const attResults = await fetchAttThrottled(token, batchList);
      const attRecords = [];
      const batchById = Object.fromEntries(batchList.map((b) => [b._id, b]));

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

      /* ── 5. Students / People ──────────────────────────────────── */
      /*
       * We build the student registry from ALL available sources.
       * Priority: batch data > getMentorStudents > getUsers > dashboard > attendance.
       * This ensures mentors see their students even when getUsers/getBatches are empty.
       */
      const studentRegistry = {}; // studentId → user object
      const studentBatchMap = {}; // studentId → batch object
      const studentToMentorMap = {}; // studentId → mentorId

      /* Source A: batch data (works for admin and mentor if batches are returned) */
      for (const batch of batchList) {
        const mentorIds = (batch.mentors || []).map(extractId).filter(Boolean);
        for (const s of batch.students || []) {
          const sId = extractId(s);
          if (!sId) continue;
          const fromBatch = typeof s === "object" ? s : {};
          studentRegistry[sId] = { ...studentRegistry[sId], ...userById[sId], ...fromBatch, _id: sId };
          studentBatchMap[sId] = batch;
          if (mentorIds.length > 0) studentToMentorMap[sId] = mentorIds[0];
        }
      }

      /* Source B: getMentorStudents endpoint (mentor-specific) */
      const msData = mentorStudentsRes.data || [];
      for (const ms of msData) {
        /* Flat pair: { mentor, student, batch } or { mentorId, studentId } */
        const sId = extractId(ms.student) || ms.studentId || extractId(ms);
        const mId = extractId(ms.mentor) || ms.mentorId;
        const bId = extractId(ms.batch) || ms.batchId;
        if (mId && sId) {
          studentToMentorMap[sId] = mId;
          if (!studentRegistry[sId]) {
            const fromMs = typeof ms.student === "object" ? ms.student : {};
            studentRegistry[sId] = { ...userById[sId], ...fromMs, _id: sId };
          }
        }
        if (sId && bId && !studentBatchMap[sId]) {
          studentBatchMap[sId] = batchList.find((b) => b._id === bId) || { _id: bId, name: "Batch" };
        }
        /* Grouped: { _id/mentor, students: [...] } */
        if (ms.students && Array.isArray(ms.students)) {
          const groupId = extractId(ms.mentor) || ms.mentorId || ms._id;
          for (const s of ms.students) {
            const sid = extractId(s) || (typeof s === "object" ? s._id : null);
            if (!sid) continue;
            if (groupId) studentToMentorMap[sid] = groupId;
            if (!studentRegistry[sid]) {
              const fromS = typeof s === "object" ? s : {};
              studentRegistry[sid] = { ...userById[sid], ...fromS, _id: sid };
            }
          }
        }
      }

      /* Source C: getUsers (may be empty for non-admins, but include anyway) */
      for (const u of users) {
        if (u.role === "STUDENT" && !studentRegistry[u._id]) {
          studentRegistry[u._id] = u;
        } else if (u.role === "STUDENT" && studentRegistry[u._id]) {
          Object.assign(studentRegistry[u._id], u);
        }
      }

      /* Source D: dashboard students */
      for (const s of dashStudents) {
        const sId = extractId(s);
        if (sId && !studentRegistry[sId]) {
          studentRegistry[sId] = typeof s === "object" ? s : { _id: sId, name: "Student" };
          /* If dashboard student has batch info, use it */
          if (s.batch) {
            const bId = extractId(s.batch);
            if (bId && !studentBatchMap[sId]) {
              studentBatchMap[sId] = batchList.find((b) => b._id === bId) || { _id: bId, name: s.batch?.name || "Batch" };
            }
          }
          if (s.mentor || s.mentorId) {
            const mId = extractId(s.mentor) || s.mentorId;
            if (mId) studentToMentorMap[sId] = mId;
          }
        }
      }

      /* Source E: attendance records (students referenced in attendance) */
      for (const rec of attRecords) {
        const sId = rec.studentId;
        if (sId && !studentRegistry[sId]) {
          studentRegistry[sId] = { _id: sId, name: rec.studentName || "Student" };
          if (rec.batchId && !studentBatchMap[sId]) {
            studentBatchMap[sId] = batchById[rec.batchId] || { _id: rec.batchId, name: rec.batchName || "Batch" };
          }
        }
      }

      /* Also build reverse map: mentorId → Set<studentId> */
      const mentorStudentIds = {};
      for (const [sId, mId] of Object.entries(studentToMentorMap)) {
        mentorStudentIds[mId] ??= new Set();
        mentorStudentIds[mId].add(sId);
      }

      console.log("[Portal] studentRegistry:", Object.keys(studentRegistry).length, "students");
      console.log("[Portal] studentToMentorMap:", studentToMentorMap);
      console.log("[Portal] me:", profile?._id, profile?.name);

      /* ── 6. Enrich each student into the people list ────────────── */
      const enriched = Object.values(studentRegistry).map((u) => {
        const batch = studentBatchMap[u._id];
        const batchMentors = batch?.mentors || [];

        /* Use ONLY the DB's assignedMentor field — never guess from batch membership.
           If assignedMentor is null, the student has no mentor. */
        const assignedMentorId = u.assignedMentor ? String(u.assignedMentor) : null;
        const assignedMentorObj = assignedMentorId ? userById[assignedMentorId] : null;
        const assignedMentorName = assignedMentorObj?.name || "Unassigned";

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

      /* For mentors, only show their assigned students (students only, no other mentors) */
      const myId = profile?._id;
      const isMentor = role === "mentor" && myId;
      const enrichedStudents = enriched.filter((p) => p.role === "STUDENT" || p.role === "student");
      const filteredPeople = isMentor
        ? enrichedStudents.filter((p) => p.mentorId === myId)
        : enrichedStudents;

      /* Build a Set of assigned student IDs for filtering submissions & progress */
      const myStudentIds = isMentor
        ? new Set(filteredPeople.map((p) => p._id))
        : null;

      console.log("[Portal] enriched people:", enriched.length, "total, filtered:", filteredPeople.length);
      setPeople(filteredPeople);

      /* ── 7. Assignments ────────────────────────────────────────── */
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

      const myBatchIds = isMentor
        ? new Set(batchList.map((b) => b._id))
        : null;
      const mappedAssignments = assignList.map((a) => ({
          _id: a._id,
          title: a.title,
          description: a.description || "",
          instructions: a.instructions || "",
          deadline: a.deadline,
          maximumScore: a.maximumScore || 100,
          batch: a.batch?._id || a.batch || null,
          batchName: a.batch?.name || "",
        }));
      /* For mentors, only show assignments from their batches */
      setAssignments(
        myBatchIds ? mappedAssignments.filter((a) => myBatchIds.has(a.batch)) : mappedAssignments,
      );

      /* ── 8. Submissions ────────────────────────────────────────── */
      if (role === "student") {
        try {
          const subRes = await getMySubmissions(token);
          setSubmissions(
            (subRes.data || []).map((s) => ({
              _id: s._id,
              assignmentId: s.assignment?._id || s.assignment,
              studentId: s.student?._id || s.student || profile?._id,
              githubUrl: s.githubUrl,
              liveDemoUrl: s.liveDemoUrl || "",
              notes: s.notes || "",
              grade: s.score ?? s.grade ?? null,
              feedback: s.feedback || "",
              status: s.status || "SUBMITTED",
            })),
          );
        } catch {
          setSubmissions([]);
        }
      } else {
        /* Mentor / Admin: use dashboard submissions first, then fetch per-assignment */
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
        const mappedSubs = subList.map((s) => ({
            _id: s._id,
            assignmentId: s.assignment?._id || s.assignment,
            studentId: s.student?._id || s.student,
            githubUrl: s.githubUrl,
            liveDemoUrl: s.liveDemoUrl || "",
            notes: s.notes || "",
            grade: s.score ?? s.grade ?? null,
            feedback: s.feedback || "",
            status: s.status || "SUBMITTED",
          }));
        /* For mentors, only show submissions from assigned students */
        setSubmissions(
          myStudentIds ? mappedSubs.filter((s) => myStudentIds.has(s.studentId)) : mappedSubs,
        );
      }

      /* ── 9. Announcements ──────────────────────────────────────── */
      setAnnouncements(
        annList.map((a) => ({
          _id: a._id,
          title: a.title,
          content: a.content || "",
          targetAudience: a.targetAudience || "ALL",
          batch: a.batch?._id || a.batch || null,
          batchName: a.batch?.name || "",
          author: a.author?.name || "",
          publishDate: a.publishDate || a.createdAt,
          date: a.publishDate
            ? new Date(a.publishDate).toLocaleDateString()
            : a.createdAt
              ? new Date(a.createdAt).toLocaleDateString()
              : "Unknown",
        })),
      );

      /* ── 10. Progress ──────────────────────────────────────────── */
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
      const mappedProgress = progList.map((p) => ({
          _id: p._id,
          studentId: p.student?._id || p.student,
          studentName: p.student?.name || "Unknown",
          batchId: p.batch?._id || p.batch,
          batchName: p.batch?.name || "Unknown",
          topic: p.topic,
          status: p.status || "NOT_STARTED",
          notes: p.notes || "",
        }));
      /* For mentors, only show progress from assigned students */
      setProgress(
        myStudentIds ? mappedProgress.filter((p) => myStudentIds.has(p.studentId)) : mappedProgress,
      );
    } catch (err) {
      handleApiError(err, "Failed to load portal data.");
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

  /* ── Action wrappers ──────────────────────────────────────────── */
  async function handleAssignMentor(student, mentorId) {
    try {
      if (!student.batchId) throw new Error("Student is not enrolled in a batch.");
      /* Always ensure mentor is attached to the batch before assigning.
         The backend requires this. We call attachMentor unconditionally and
         ignore 409 ("already attached") so the assignment can proceed. */
      try {
        await attachMentor(token, student.batchId, mentorId);
      } catch (attachErr) {
        if (!attachErr.message?.includes('already attached')) {
          throw attachErr;
        }
      }
      await assignMentor(token, student.batchId, student._id, mentorId);
      await fetchData();
    } catch (e) { handleApiError(e); }
  }

  async function handleApproveUser(id) {
    try {
      await approveUser(token, id);
      showSuccess("Student approved.");
      await fetchData();
    } catch (e) { handleApiError(e); }
  }

  async function handleRejectUser(id) {
    try {
      await deleteUser(token, id);
      showSuccess("Student removed.");
      await fetchData();
    } catch (e) { handleApiError(e); }
  }

  async function handleCreateBatch(d) {
    try {
      await attachMentor(token, d.batchId, d.mentorId);
      showSuccess("Mentor attached to batch.");
      await fetchData();
    } catch (e) { handleApiError(e); }
  }

  async function handleRemoveStudentFromBatch(batchId, studentId) {
    try {
      await removeStudentFromBatch(token, batchId, studentId);
      showSuccess("Student removed from batch.");
      await fetchData();
    } catch (e) { handleApiError(e); }
  }

  async function handleUpdateUserRole(id, newRole) {
    try {
      await updateUserRole(token, id, newRole);
      showSuccess("Role updated.");
      await fetchData();
    } catch (e) { handleApiError(e); }
  }

  async function handleUpdateUserProfile(id, changes) {
    try {
      await updateUserProfile(token, { ...changes, userId: id });
      showSuccess("Profile updated.");
      await fetchData();
    } catch (e) { handleApiError(e); }
  }

  async function handleEnrollStudent(batchId, studentId) {
    try {
      await enrollStudent(token, batchId, studentId);
      showSuccess("Student enrolled.");
      await fetchData();
    } catch (e) { handleApiError(e); }
  }

  async function handleAttachMentor(batchId, mentorId) {
    try {
      await attachMentor(token, batchId, mentorId);
      showSuccess("Mentor attached.");
      await fetchData();
    } catch (e) { handleApiError(e); }
  }

  async function handleDetachMentor(batchId, mentorId) {
    try {
      await detachMentor(token, batchId, mentorId);
      showSuccess("Mentor detached.");
      await fetchData();
    } catch (e) { handleApiError(e); }
  }

  /* ── Auth screens ───────────────────────────────────────────────── */
  const goLogin = () => {
    // Clear the reset token from URL when going back to login
    window.history.replaceState({}, '', window.location.pathname);
    setScreen('login');
  };

  if (screen === 'forgot') {
    return (
      <ForgotPortal
        back={goLogin}
        requestReset={requestPasswordReset}
      />
    );
  }

  if (screen === 'reset') {
    return (
      <ResetPasswordConfirm
        token={resetToken}
        back={goLogin}
        onSuccess={apiResetPasswordConfirm}
      />
    );
  }

  if (screen !== "app") {
    return (
      <Login
        mode={screen === "register" ? "register" : undefined}
        login={signIn}
        forgot={() => setScreen("forgot")}
        back={() => setScreen("login")}
        createAccount={() => setScreen("register")}
        requestAccount={requestAccount}
      />
    );
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
      updateUserRole={handleUpdateUserRole}
      updateUserProfile={handleUpdateUserProfile}
      enrollStudent={handleEnrollStudent}
      attachMentor={handleAttachMentor}
      detachMentor={handleDetachMentor}
    />
  );
}
