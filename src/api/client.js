const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000"; // default to localhost for development

/* ── Request cache ──────────────────────────────────────────────────── */
const _cache = new Map();
const CACHE_TTL = 30_000; // 30 seconds

function cacheKey(method, path, token) {
  return `${method}:${path}:${token || ""}`;
}

function getCached(key) {
  const entry = _cache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiry) {
    _cache.delete(key);
    return undefined;
  }
  return entry.value;
}

function setCache(key, value) {
  _cache.set(key, { value, expiry: Date.now() + CACHE_TTL });
}

export function clearCache(pattern) {
  if (!pattern) {
    _cache.clear();
    return;
  }
  for (const key of _cache.keys()) {
    if (key.includes(pattern)) _cache.delete(key);
  }
}

/* ── Retry helpers ──────────────────────────────────────────────────── */
const MAX_RETRIES = 2;
const BASE_DELAY = 1000; // 1 second

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/* ── Core fetch ─────────────────────────────────────────────────────── */
async function request(path, options = {}) {
  const { token, headers, useCache, ...requestOptions } = options;
  const method = requestOptions.method || "GET";

  /* Only cache GET requests when explicitly requested */
  const isCacheable = useCache && method === "GET";
  if (isCacheable) {
    const hit = getCached(cacheKey(method, path, token));
    if (hit) return hit;
  }

  let lastError;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    let response;
    try {
      response = await fetch(`${API_BASE_URL}${path}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...headers,
        },
        ...requestOptions,
      });
    } catch {
      throw new Error(
        "Unable to reach the bootcamp server. Please try again shortly.",
      );
    }

    /* Handle rate limiting (429) with backoff */
    if (response.status === 429) {
      const retryAfter = parseInt(response.headers.get("Retry-After"), 10);
      const waitMs = retryAfter
        ? retryAfter * 1000
        : BASE_DELAY * Math.pow(2, attempt);
      lastError = new Error("Too many requests. Retrying…");
      if (attempt < MAX_RETRIES) {
        await delay(waitMs);
        continue;
      }
      throw new Error(
        "Server is busy. Please wait a moment and try again.",
      );
    }

    const payload = await response.json().catch(() => null);

    if (!payload || typeof payload.success !== "boolean") {
      throw new Error("The server returned an unexpected response.");
    }

    if (!response.ok || !payload.success) {
      throw new Error(payload.message || "Request failed.");
    }

    if (isCacheable) setCache(cacheKey(method, path, token), payload);
    return payload;
  }

  throw lastError || new Error("Request failed after retries.");
}

function queryString(query = {}) {
  const params = new URLSearchParams(
    Object.entries(query).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );
  return params.size ? `?${params}` : "";
}

function protectedRequest(path, token, options = {}) {
  return request(path, { ...options, token });
}

function jsonRequest(path, token, method, body) {
  return protectedRequest(path, token, {
    method,
    body: JSON.stringify(body),
    useCache: false, // never cache mutations
  });
}

/* ═══════════════════════════════════════════════════════════════════════
   Auth — Authentication and password management
   ═══════════════════════════════════════════════════════════════════════ */

/** POST /api/auth/register — Register a student */
export function registerStudent(details) {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(details),
  });
}

/** POST /api/auth/login — Login */
export function loginUser(credentials) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function loginAdmin(credentials) {
  return loginUser(credentials);
}

/** POST /api/auth/reset-password/request — Request password reset */
export function requestPasswordReset(email) {
  return request("/api/auth/reset-password/request", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

/** POST /api/auth/reset-password/confirm — Confirm password reset */
export function resetPasswordConfirm(token, newPassword) {
  return request("/api/auth/reset-password/confirm", {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
  });
}

/** POST /api/auth/logout — Logout */
export function logoutUser(token) {
  clearCache();
  return request("/api/auth/logout", { method: "POST", token });
}

/** POST /api/auth/change-password — Change current user's password */
export function changePassword(token, body) {
  return jsonRequest("/api/auth/change-password", token, "POST", body);
}

/* ═══════════════════════════════════════════════════════════════════════
   Users — User management and profiles
   ═══════════════════════════════════════════════════════════════════════ */

/** GET /api/users — Get all users */
export function getUsers(token, query) {
  return protectedRequest(`/api/users${queryString(query)}`, token, {
    useCache: true,
  });
}

/** GET /api/users/profile — Get current user profile */
export function getUserProfile(token) {
  return protectedRequest("/api/users/profile", token, { useCache: true });
}

/** PATCH /api/users/profile — Update current user profile */
export function updateUserProfile(token, body) {
  clearCache("/api/users");
  return jsonRequest("/api/users/profile", token, "PATCH", body);
}

/** GET /api/users/:id — Get user by ID */
export function getUserById(token, id) {
  return protectedRequest(`/api/users/${id}`, token, { useCache: true });
}

/** POST /api/users — Create a user (admin only) */
export function createUser(token, user) {
  clearCache("/api/users");
  return jsonRequest("/api/users", token, "POST", user);
}

/** PATCH /api/users/:id/approve — Approve a student account */
export function approveUser(token, id) {
  clearCache("/api/users");
  return jsonRequest(`/api/users/${id}/approve`, token, "PATCH");
}

/** PATCH /api/users/:id/role — Change user role */
export function updateUserRole(token, id, role) {
  clearCache("/api/users");
  return jsonRequest(`/api/users/${id}/role`, token, "PATCH", { role });
}

/** DELETE /api/users/:id — Delete user */
export function deleteUser(token, id) {
  clearCache("/api/users");
  clearCache("/api/batches");
  clearCache("/api/attendance");
  return protectedRequest(`/api/users/${id}`, token, { method: "DELETE" });
}

/* ═══════════════════════════════════════════════════════════════════════
   Batches — Bootcamp batch and roster management
   ═══════════════════════════════════════════════════════════════════════ */

/** GET /api/batches — Get all batches */
export function getBatches(token, query) {
  return protectedRequest(`/api/batches${queryString(query)}`, token, {
    useCache: true,
  });
}

/** POST /api/batches — Create batch */
export function createBatch(token, batch) {
  clearCache("/api/batches");
  return jsonRequest("/api/batches", token, "POST", batch);
}

/** GET /api/batches/:id — Get batch by ID */
export function getBatchById(token, id) {
  return protectedRequest(`/api/batches/${id}`, token, { useCache: true });
}

/** PATCH /api/batches/:id — Update batch */
export function updateBatch(token, id, changes) {
  clearCache("/api/batches");
  return jsonRequest(`/api/batches/${id}`, token, "PATCH", changes);
}

/** DELETE /api/batches/:id — Delete batch */
export function deleteBatch(token, id) {
  clearCache("/api/batches");
  clearCache("/api/attendance");
  return protectedRequest(`/api/batches/${id}`, token, { method: "DELETE" });
}

/** POST /api/batches/:id/mentors — Attach mentor to batch */
export function attachMentor(token, batchId, mentorId) {
  clearCache("/api/batches");
  return jsonRequest(`/api/batches/${batchId}/mentors`, token, "POST", {
    mentorId,
  });
}

/** DELETE /api/batches/:id/mentors/:mentorId — Detach mentor from batch */
export function detachMentor(token, batchId, mentorId) {
  clearCache("/api/batches");
  return protectedRequest(
    `/api/batches/${batchId}/mentors/${mentorId}`,
    token,
    { method: "DELETE" },
  );
}

/** POST /api/batches/:id/students — Enroll student into batch */
export function enrollStudent(token, batchId, studentId) {
  clearCache("/api/batches");
  return jsonRequest(`/api/batches/${batchId}/students`, token, "POST", {
    studentId,
  });
}

/** DELETE /api/batches/:id/students/:studentId — Remove student from batch */
export function removeStudentFromBatch(token, batchId, studentId) {
  clearCache("/api/batches");
  return protectedRequest(
    `/api/batches/${batchId}/students/${studentId}`,
    token,
    { method: "DELETE" },
  );
}

/** POST /api/batches/:id/students/:studentId/assign-mentor — Assign mentor to student */
export function assignMentor(token, batchId, studentId, mentorId) {
  clearCache("/api/batches");
  return jsonRequest(
    `/api/batches/${batchId}/students/${studentId}/assign-mentor`,
    token,
    "POST",
    { mentorId },
  );
}

/** GET /api/batches/mentor-students — Get mentor student roster */
export function getMentorStudents(token) {
  return protectedRequest("/api/batches/mentor-students", token, {
    useCache: true,
  });
}

/* ═══════════════════════════════════════════════════════════════════════
   Attendance — Student attendance management
   ═══════════════════════════════════════════════════════════════════════ */

/** POST /api/attendance — Record attendance */
export function createAttendance(token, record) {
  clearCache("/api/attendance");
  return jsonRequest("/api/attendance", token, "POST", record);
}

/** PATCH /api/attendance/:id — Update attendance */
export function updateAttendance(token, id, changes) {
  clearCache("/api/attendance");
  return jsonRequest(`/api/attendance/${id}`, token, "PATCH", changes);
}

/** GET /api/attendance/batch/:batchId — Get attendance by batch */
export function getAttendanceByBatch(token, batchId) {
  return protectedRequest(`/api/attendance/batch/${batchId}`, token, {
    useCache: true,
  });
}

/** GET /api/attendance/batch/:batchId/student/:studentId/percentage — Get student attendance percentage */
export function getAttendancePercentage(token, batchId, studentId) {
  return protectedRequest(
    `/api/attendance/batch/${batchId}/student/${studentId}/percentage`,
    token,
    { useCache: true },
  );
}

/** DELETE /api/attendance/:id — Delete attendance */
export function deleteAttendance(token, id) {
  clearCache("/api/attendance");
  return protectedRequest(`/api/attendance/${id}`, token, { method: "DELETE" });
}

/* ═══════════════════════════════════════════════════════════════════════
   Progress — Student learning progress tracking
   ═══════════════════════════════════════════════════════════════════════ */

/** POST /api/progress — Record student progress */
export function createProgress(token, entry) {
  clearCache("/api/progress");
  return jsonRequest("/api/progress", token, "POST", entry);
}

/** GET /api/progress/batch/:batchId — Get progress by batch */
export function getProgressByBatch(token, batchId) {
  return protectedRequest(`/api/progress/batch/${batchId}`, token, {
    useCache: true,
  });
}

/** GET /api/progress/batch/:batchId/student/:studentId — Get student progress */
export function getProgressByStudent(token, batchId, studentId) {
  return protectedRequest(
    `/api/progress/batch/${batchId}/student/${studentId}`,
    token,
    { useCache: true },
  );
}

/** GET /api/progress/:id — Get progress by ID */
export function getProgressById(token, id) {
  return protectedRequest(`/api/progress/${id}`, token, { useCache: true });
}

/** PATCH /api/progress/:id — Update progress */
export function updateProgress(token, id, changes) {
  clearCache("/api/progress");
  return jsonRequest(`/api/progress/${id}`, token, "PATCH", changes);
}

/** DELETE /api/progress/:id — Delete progress */
export function deleteProgress(token, id) {
  clearCache("/api/progress");
  return protectedRequest(`/api/progress/${id}`, token, { method: "DELETE" });
}

/* ═══════════════════════════════════════════════════════════════════════
   Assignments — Assignment management
   ═══════════════════════════════════════════════════════════════════════ */

/** POST /api/assignments — Create assignment */
export function createAssignment(token, assignment) {
  clearCache("/api/assignments");
  return jsonRequest("/api/assignments", token, "POST", assignment);
}

/** GET /api/assignments/batch/:batchId — Get assignments by batch */
export function getAssignmentsByBatch(token, batchId) {
  return protectedRequest(`/api/assignments/batch/${batchId}`, token, {
    useCache: true,
  });
}

/** GET /api/assignments/:id — Get assignment by ID */
export function getAssignmentById(token, id) {
  return protectedRequest(`/api/assignments/${id}`, token, { useCache: true });
}

/** PATCH /api/assignments/:id — Update assignment */
export function updateAssignment(token, id, changes) {
  clearCache("/api/assignments");
  return jsonRequest(`/api/assignments/${id}`, token, "PATCH", changes);
}

/** DELETE /api/assignments/:id — Delete assignment */
export function deleteAssignment(token, id) {
  clearCache("/api/assignments");
  return protectedRequest(`/api/assignments/${id}`, token, {
    method: "DELETE",
  });
}

/* ═══════════════════════════════════════════════════════════════════════
   Submissions — Assignment submission and grading workflow
   ═══════════════════════════════════════════════════════════════════════ */

/** POST /api/submissions — Submit assignment */
export function createSubmission(token, submission) {
  clearCache("/api/submissions");
  return jsonRequest("/api/submissions", token, "POST", submission);
}

/** GET /api/submissions/my — Get current student's submissions */
export function getMySubmissions(token) {
  return protectedRequest("/api/submissions/my", token, { useCache: true });
}

/** GET /api/submissions/assignment/:assignmentId — Get submissions for an assignment */
export function getSubmissionsByAssignment(token, assignmentId) {
  return protectedRequest(
    `/api/submissions/assignment/${assignmentId}`,
    token,
    { useCache: true },
  );
}

/** GET /api/submissions/:id — Get submission by ID */
export function getSubmissionById(token, id) {
  return protectedRequest(`/api/submissions/${id}`, token, { useCache: true });
}

/** PATCH /api/submissions/:id/grade — Grade submission */
export function gradeSubmission(token, id, body) {
  clearCache("/api/submissions");
  return jsonRequest(`/api/submissions/${id}/grade`, token, "PATCH", body);
}

/** PATCH /api/submissions/:id/resubmit — Resubmit assignment */
export function resubmitSubmission(token, id, body) {
  clearCache("/api/submissions");
  return jsonRequest(`/api/submissions/${id}/resubmit`, token, "PATCH", body);
}

/** PATCH /api/submissions/:id/request-resubmission — Request submission resubmission */
export function requestResubmission(token, id) {
  clearCache("/api/submissions");
  return jsonRequest(
    `/api/submissions/${id}/request-resubmission`,
    token,
    "PATCH",
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Announcements — Bootcamp announcements
   ═══════════════════════════════════════════════════════════════════════ */

/** GET /api/announcements — Get announcements */
export function getAnnouncements(token, query) {
  return protectedRequest(`/api/announcements${queryString(query)}`, token, {
    useCache: true,
  });
}

/** POST /api/announcements — Create announcement */
export function createAnnouncement(token, announcement) {
  clearCache("/api/announcements");
  return jsonRequest("/api/announcements", token, "POST", announcement);
}

/** GET /api/announcements/:id — Get announcement by ID */
export function getAnnouncementById(token, id) {
  return protectedRequest(`/api/announcements/${id}`, token, {
    useCache: true,
  });
}

/** PATCH /api/announcements/:id — Update announcement */
export function updateAnnouncement(token, id, changes) {
  clearCache("/api/announcements");
  return jsonRequest(`/api/announcements/${id}`, token, "PATCH", changes);
}

/** DELETE /api/announcements/:id — Delete announcement */
export function deleteAnnouncement(token, id) {
  clearCache("/api/announcements");
  return protectedRequest(`/api/announcements/${id}`, token, {
    method: "DELETE",
  });
}

/* ═══════════════════════════════════════════════════════════════════════
   Dashboard — Role-based dashboards
   ═══════════════════════════════════════════════════════════════════════ */

/** GET /api/dashboard/:role — Get role-based dashboard (admin/mentor/student) */
export function getDashboard(token, role) {
  return protectedRequest(`/api/dashboard/${role.toLowerCase()}`, token, {
    useCache: true,
  });
}
