import { useState, useEffect, useCallback } from "react";
import { Sidebar, Header } from "./components/Layout";
import { Confirm } from "./components/Modal";
import Editor from "./components/Editor";
import OverviewPage from "./pages/OverviewPage";
import RequestsPage from "./pages/RequestsPage";
import PeoplePage from "./pages/PeoplePage";
import CoursesPage from "./pages/CoursesPage";
import AttendancePage from "./pages/AttendancePage";
import SettingsPage from "./pages/SettingsPage";
import AdminLogin from "./components/AdminLogin";
import {
  loginAdmin,
  logoutUser,
  requestPasswordReset,
  getUsers,
  getUserProfile,
  getBatches,
  createBatch,
  updateBatch,
  deleteBatch,
  attachMentor,
  detachMentor,
  enrollStudent,
  removeStudentFromBatch,
  assignMentor,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceByBatch,
  getMentorStudents,
  approveUser,
  createUser,
  updateUserProfile,
  updateUserRole,
  deleteUser,
  changePassword,
  clearCache,
} from "../../src/api/client";

/* ── Page registry ──────────────────────────────────────────────────── */
const pages = {
  overview: OverviewPage,
  requests: RequestsPage,
  people: PeoplePage,
  courses: CoursesPage,
  attendance: AttendancePage,
};

const emptyData = {
  admin: { _id: null, name: "Administrator", email: "" },
  students: [],
  mentors: [],
  requests: [],
  courses: [],
  attendance: [],
};

/* ── Helper: fetch attendance in batches of 3 to avoid burst ────────── */
const ATTENDANCE_BATCH_SIZE = 3;
async function fetchAttendanceThrottled(token, batches) {
  const results = [];
  for (let i = 0; i < batches.length; i += ATTENDANCE_BATCH_SIZE) {
    const chunk = batches.slice(i, i + ATTENDANCE_BATCH_SIZE);
    const chunkResults = await Promise.allSettled(
      chunk.map((b) => getAttendanceByBatch(token, b._id)),
    );
    results.push(...chunkResults);
    if (i + ATTENDANCE_BATCH_SIZE < batches.length) {
      await new Promise((r) => setTimeout(r, 300));
    }
  }
  return results;
}

/* ───────────────────────────────────────────────────────────────────── */
export default function App() {
  const [data, setData] = useState(emptyData);
  const [authenticated, setAuthenticated] = useState(() =>
    Boolean(sessionStorage.getItem("msj-admin-token")),
  );
  const [token, setToken] = useState(
    () => sessionStorage.getItem("msj-admin-token") || "",
  );
  const [page, setPage] = useState("overview");
  const [editor, setEditor] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const open = (type, index) => setEditor({ type, index });
  const ask = (text, action) => setConfirm({ text, action });
  const merge = (patch) => setData((d) => ({ ...d, ...patch }));

  /* ── Data fetcher ─────────────────────────────────────────────────── */
  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [usersRes, batchesRes, mentorStudentsRes] = await Promise.all([
        getUsers(token),
        getBatches(token),
        getMentorStudents(token).catch(() => ({ data: [] })),
      ]);

      const users = usersRes.data || [];
      const batches = batchesRes.data || [];

      /* Attendance — throttled to avoid rate limits */
      const attResults = await fetchAttendanceThrottled(token, batches);

      const batchById = Object.fromEntries(batches.map((b) => [b._id, b]));

      /* ── Students ─────────────────────────────────────────────────── */
      /* Build lookup: studentId → batchId, and studentId → mentorId */
      const studentBatchMap = {};
      for (const b of batches) {
        for (const s of b.students || []) {
          const sid = s._id || s;
          studentBatchMap[sid] = b._id;
        }
      }

      /* Use the dedicated mentor-students endpoint for accurate mentor assignments */
      const mentorStudentsData = mentorStudentsRes.data || [];
      const studentMentorMap = {};
      // Handle flat list: [{ mentor, student }, ...]
      for (const ms of mentorStudentsData) {
        const mId = ms.mentor?._id || ms.mentorId || ms.mentor;
        const sId = ms.student?._id || ms.studentId || ms.student || ms._id;
        if (mId && sId) studentMentorMap[sId] = mId;
      }
      // Handle grouped: [{ _id, students: [...] }]
      if (mentorStudentsData.length > 0 && mentorStudentsData[0]?.students) {
        for (const group of mentorStudentsData) {
          const mId = group._id || group.mentorId || group.mentor;
          for (const s of group.students || []) {
            const sId = s._id || s;
            if (mId && sId) studentMentorMap[sId] = mId;
          }
        }
      }

      const mentorsRaw = users.filter((u) => u.role === "MENTOR");
      const mentorById = Object.fromEntries(
        mentorsRaw.map((m) => [m._id, m]),
      );

      const students = users
        .filter((u) => u.role === "STUDENT")
        .map((u) => {
          const batchId = studentBatchMap[u._id];
          const batch = batchId ? batchById[batchId] : null;
          const batchMentors = batch?.mentors || [];
          const assignedMentorId = studentMentorMap[u._id];
          let mentorName = "Unassigned";
          if (assignedMentorId && mentorById[assignedMentorId]) {
            mentorName = mentorById[assignedMentorId].name;
          } else if (batchMentors[0]) {
            mentorName = batchMentors[0].name || "Unassigned";
          }
          return {
            _id: u._id,
            name: u.name,
            email: u.email,
            course: batch?.name || "Unassigned",
            mentor: mentorName,
            mentorId: assignedMentorId || batchMentors[0]?._id || null,
            status: u.isApproved ? "Active" : "Suspended",
            attendance: 0,
            _batchId: batchId || null,
          };
        });

      /* ── Mentors ──────────────────────────────────────────────────── */
      const mentors = mentorsRaw
        .map((u) => ({ _id: u._id, name: u.name, email: u.email }));

      /* ── Pending requests ─────────────────────────────────────────── */
      const requests = users
        .filter((u) => !u.isApproved)
        .map((u) => {
          const batch = batches.find((b) =>
            (b.students || []).some((s) => (s._id || s) === u._id),
          );
          return {
            _id: u._id,
            name: u.name,
            email: u.email,
            role: u.role === "MENTOR" ? "Mentor" : "Student",
            course: batch?.name || "Unknown",
          };
        });

      /* ── Courses (batches) ────────────────────────────────────────── */
      const courses = batches.map((b) => ({
        _id: b._id,
        name: b.name,
        code:
          b.description?.substring(0, 8)?.toUpperCase()?.replace(/\s/g, "") ||
          b.name.substring(0, 8).toUpperCase().replace(/\s/g, ""),
        capacity: (b.students || []).length,
        startDate: b.startDate,
        endDate: b.endDate,
        description: b.description,
      }));

      /* ── Attendance (raw per-student records) ─────────────────────── */
      const attendance = [];
      const perStudent = {};
      const userById = Object.fromEntries(users.map((u) => [u._id, u]));

      for (const r of attResults) {
        if (r.status !== "fulfilled") continue;
        for (const rec of r.value?.data || []) {
          const studentId = rec.student?._id || rec.student;
          const batchId = rec.batch?._id || rec.batch;
          const batchObj = rec.batch?._id ? rec.batch : batchById[batchId];
          const studentObj = rec.student?.name ? rec.student : userById[studentId];

          attendance.push({
            _id: rec._id,
            studentId,
            studentName: studentObj?.name || "Unknown",
            batchId,
            batchName: batchObj?.name || "Unknown",
            date: (rec.date || "").split("T")[0],
            status: rec.status,
            note: rec.note || "",
          });

          /* Track for student attendance percentage */
          if (studentId) {
            perStudent[studentId] ??= { t: 0, p: 0 };
            perStudent[studentId].t++;
            if (rec.status === "PRESENT" || rec.status === "LATE")
              perStudent[studentId].p++;
          }
        }
      }
      attendance.sort((a, b) => b.date.localeCompare(a.date));

      /* Compute student attendance percentages */
      for (const s of students) {
        const st = perStudent[s._id];
        if (st?.t) s.attendance = Math.round((st.p / st.t) * 100);
      }

      /* ── Admin profile (via /api/users/profile) ─────────────────── */
      let me = users.find((u) => u.role === "ADMIN" && u.isApproved);
      try {
        const profileRes = await getUserProfile(token);
        if (profileRes?.data) me = profileRes.data;
      } catch { /* fallback to user from list */ }

      setData({
        admin: {
          _id: me?._id || null,
          name: me?.name || "Administrator",
          email: me?.email || "",
        },
        students,
        mentors,
        requests,
        courses,
        attendance,
      });
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (authenticated && token) fetchData();
  }, [authenticated, token, fetchData]);

  /* ── Auth ─────────────────────────────────────────────────────────── */
  async function signIn(creds) {
    const res = await loginAdmin(creds);
    const { token: t, user } = res.data || {};
    if (!t || user?.role !== "ADMIN")
      throw new Error("The server did not return a valid administrator session.");
    sessionStorage.setItem("msj-admin-token", t);
    setToken(t);
    setAuthenticated(true);
  }

  async function signOut() {
    try { if (token) await logoutUser(token); } catch { /* ok */ }
    sessionStorage.removeItem("msj-admin-token");
    setToken("");
    setAuthenticated(false);
    setData(emptyData);
  }

  const refresh = () => fetchData();

  /* ── People actions ───────────────────────────────────────────────── */
  async function promoteStudentToMentor(student) {
    try { await updateUserRole(token, student._id, "MENTOR"); await refresh(); }
    catch (e) { alert(e.message); }
  }

  async function approveStudent(student) {
    try {
      await approveUser(token, student._id);
      await refresh();
    } catch (e) { alert(e.message); }
  }

  async function removeStudent(student) {
    try {
      if (student._batchId)
        await removeStudentFromBatch(token, student._batchId, student._id);
      await deleteUser(token, student._id);
      await refresh();
    } catch (e) { alert(e.message); }
  }

  async function assignMentorToStudent(student, mentorId) {
    try {
      if (!student._batchId)
        throw new Error("Student is not enrolled in a batch.");
      await assignMentor(token, student._batchId, student._id, mentorId);
      await refresh();
    } catch (e) { alert(e.message); }
  }

  async function enrollStudentInBatch(student, batchId) {
    try {
      if (student._batchId)
        await removeStudentFromBatch(token, student._batchId, student._id).catch(() => {});
      await enrollStudent(token, batchId, student._id);
      await refresh();
    } catch (e) { alert(e.message); }
  }

  async function removeMentor(mentor) {
    try {
      const res = await getBatches(token);
      for (const b of res.data || []) {
        if ((b.mentors || []).some((m) => (m._id || m) === mentor._id))
          await detachMentor(token, b._id, mentor._id).catch(() => {});
      }
      await deleteUser(token, mentor._id);
      await refresh();
    } catch (e) { alert(e.message); }
  }

  /* ── Requests actions ─────────────────────────────────────────────── */
  async function approveRequest(req) {
    try { await approveUser(token, req._id); await refresh(); }
    catch (e) { alert(e.message); }
  }

  async function rejectRequest(req) {
    try { await deleteUser(token, req._id); await refresh(); }
    catch (e) { alert(e.message); }
  }

  /* ── Course actions ───────────────────────────────────────────────── */
  async function createCourse(d) {
    try {
      await createBatch(token, {
        name: d.name,
        description: d.description || d.name,
        startDate: d.startDate || new Date().toISOString(),
        endDate: d.endDate || new Date(Date.now() + 90 * 864e5).toISOString(),
      });
      await refresh();
    } catch (e) { alert(e.message); }
  }

  async function updateCourse(id, d) {
    try {
      await updateBatch(token, id, {
        name: d.name,
        description: d.description,
        startDate: d.startDate,
        endDate: d.endDate,
      });
      await refresh();
    } catch (e) { alert(e.message); }
  }

  async function deleteCourse(id) {
    try { await deleteBatch(token, id); await refresh(); }
    catch (e) { alert(e.message); }
  }

  /* ── Attendance actions ───────────────────────────────────────────── */
  async function createAttendanceRecord(r) {
    try {
      await createAttendance(token, {
        student: r.studentId,
        batch: r.batchId,
        date: r.date,
        status: r.status || "PRESENT",
        note: r.note || "",
      });
      await refresh();
    } catch (e) { alert(e.message); }
  }

  async function updateAttendanceRecord(id, changes) {
    try {
      await updateAttendance(token, id, changes);
      await refresh();
    } catch (e) { alert(e.message); }
  }

  async function deleteAttendanceRecord(record) {
    try {
      await deleteAttendance(token, record._id);
      await refresh();
    } catch (e) { alert(e.message); }
  }

  /* ── Settings (profile) ───────────────────────────────────────────── */
  async function saveProfile({ name, email, currentPassword, newPassword }) {
    try {
      if (newPassword)
        await changePassword(token, { currentPassword, newPassword });
      if (name || email)
        await updateUserProfile(token, { name, email });
      await refresh();
    } catch (e) { throw e; }
  }

  /* ── Editor save (delegates to API) ───────────────────────────────── */
  async function handleEditorSave(type, index, v) {
    try {
      if (type === "student") {
        if (index !== undefined) {
          const s = data.students[index];
          if (v._batchId && v._batchId !== s._batchId) {
            if (s._batchId)
              await removeStudentFromBatch(token, s._batchId, s._id).catch(() => {});
            await enrollStudent(token, v._batchId, s._id);
          }
        } else {
          const res = await createUser(token, {
            name: v.name,
            email: v.email,
            password: "TempPass123!",
            role: "STUDENT",
          });
          const id = res.data?._id;
          if (id) {
            await approveUser(token, id);
            if (v._batchId) await enrollStudent(token, v._batchId, id);
          }
        }
      } else if (type === "mentor" && index === undefined) {
        const res = await createUser(token, {
          name: v.name,
          email: v.email,
          password: "TempPass123!",
          role: "MENTOR",
        });
        if (res.data?._id) await approveUser(token, res.data._id);
      } else if (type === "course") {
        if (index !== undefined) await updateCourse(data.courses[index]._id, v);
        else await createCourse(v);
      } else if (type === "attendance") {
        if (index !== undefined && data.attendance[index]?._id) {
          await updateAttendanceRecord(data.attendance[index]._id, {
            status: v.status,
            note: v.note,
          });
        } else {
          await createAttendanceRecord(v);
        }
      }
      await refresh();
      setEditor(null);
    } catch (e) { alert(e.message || "Save failed."); }
  }

  /* ── Render ───────────────────────────────────────────────────────── */
  if (!authenticated)
    return <AdminLogin onSignIn={signIn} requestReset={requestPasswordReset} />;

  const Page = pages[page];

  return (
    <div className="min-h-screen bg-stone-50 lg:flex">
      <Sidebar
        page={page}
        setPage={setPage}
        pending={data.requests.length}
        signOut={signOut}
      />

      <main className="min-w-0 flex-1 p-5 sm:p-9">
        <Header
          page={page}
          admin={data.admin}
          onToggleProfile={() => setShowProfile((v) => !v)}
          signOut={signOut}
        />

        {loading && (
          <p className="mb-4 text-xs font-semibold text-stone-400">
            Syncing with server…
          </p>
        )}

        {showProfile && (
          <SettingsPage
            data={data}
            update={merge}
            saveProfile={saveProfile}
            onClose={() => setShowProfile(false)}
          />
        )}

        {!showProfile && Page && (
          <Page
            data={data}
            update={merge}
            open={open}
            ask={ask}
            setPage={setPage}
            promoteStudent={promoteStudentToMentor}
            approveStudent={approveStudent}
            removeStudent={removeStudent}
            assignMentor={assignMentorToStudent}
            enrollStudent={enrollStudentInBatch}
            removeMentor={removeMentor}
            approveRequest={approveRequest}
            rejectRequest={rejectRequest}
            deleteCourse={deleteCourse}
            deleteAttendance={deleteAttendanceRecord}
          />
        )}
      </main>

      {editor && (
        <Editor
          {...editor}
          data={data}
          update={merge}
          close={() => setEditor(null)}
          onSave={handleEditorSave}
        />
      )}

      {confirm && (
        <Confirm
          text={confirm.text}
          onClose={() => setConfirm(null)}
          onConfirm={() => { confirm.action(); setConfirm(null); }}
        />
      )}
    </div>
  );
}
