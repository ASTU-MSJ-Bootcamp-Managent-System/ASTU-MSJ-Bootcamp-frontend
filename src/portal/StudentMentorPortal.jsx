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
  getMySubmissions,
  getSubmissionsByAssignment,
  getAnnouncements,
  getProgressByBatch,
  getUserProfile,
  approveUser,
  createUser,
  updateUser,
  updateUserRole,
  deleteUser,
  enrollStudent,
  removeStudentFromBatch,
  assignMentor,
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

      const [usersRes, batchesRes, annRes] = await Promise.all([
        getUsers(token).catch(() => ({ data: [] })),
        getBatches(token).catch(() => ({ data: [] })),
        getAnnouncements(token).catch(() => ({ data: [] })),
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
      const studentUsers = users.filter((u) => u.role === "STUDENT");
      const mentorUsers = users.filter((u) => u.role === "MENTOR");

      const enriched = studentUsers.map((u) => {
        const batch = batchList.find((b) =>
          (b.students || []).some((s) => (s._id || s) === u._id),
        );
        const batchMentors = (batch?.mentors || []);
        const perS = attRecords.filter((a) => a.studentId === u._id);
        const total = perS.length;
        const present = perS.filter(
          (a) => a.status === "PRESENT" || a.status === "LATE",
        ).length;
        const attPct = total ? Math.round((present / total) * 100) : 0;

        return {
          _id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          batch: batch?.name || "Unassigned",
          batchId: batch?._id || null,
          mentor: batchMentors[0]?.name || "Unassigned",
          mentorId: batchMentors[0]?._id || null,
          status: u.isApproved ? "Active" : "Suspended",
          attendance: attPct,
          progress: 0,
        };
      });
      setPeople(enriched);

      /* ── Assignments ──────────────────────────────────────────────── */
      const assignList = dash.assignments || [];
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
        setSubmissions(dash.submissions || []);
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

      /* ── Progress ─────────────────────────────────────────────────── */
      const progList = dash.progress || [];
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
    />
  );
}
