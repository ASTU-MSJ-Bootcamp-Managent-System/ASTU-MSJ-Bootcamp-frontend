const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://astu-msj-bootcamp-backend.onrender.com";

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

/* ── Auth ───────────────────────────────────────────────────────────── */

export function loginUser(credentials) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function loginAdmin(credentials) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function registerStudent(details) {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(details),
  });
}

export function requestPasswordReset(email) {
  return request("/api/auth/reset-password/request", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function logoutUser(token) {
  clearCache();
  return request("/api/auth/logout", { method: "POST", token });
}

export function getCurrentUser(token) {
  return request("/api/users/me", { token, useCache: true });
}

export function getCurrentAdmin(token) {
  return request("/api/admin/auth/me", { token });
}

/* ── Users ──────────────────────────────────────────────────────────── */

export function getUsers(token, query) {
  return protectedRequest(`/api/users${queryString(query)}`, token, {
    useCache: true,
  });
}

export function createUser(token, user) {
  clearCache("/api/users");
  return jsonRequest("/api/users", token, "POST", user);
}

export function updateUser(token, id, changes) {
  clearCache("/api/users");
  clearCache("/api/batches");
  return jsonRequest(`/api/users/${id}`, token, "PATCH", changes);
}

export function updateUserRole(token, id, role) {
  clearCache("/api/users");
  return jsonRequest(`/api/users/${id}/role`, token, "PATCH", { role });
}

export function deleteUser(token, id) {
  clearCache("/api/users");
  clearCache("/api/batches");
  clearCache("/api/attendance");
  return protectedRequest(`/api/users/${id}`, token, { method: "DELETE" });
}

/* ── Batches ────────────────────────────────────────────────────────── */

export function getBatches(token, query) {
  return protectedRequest(`/api/batches${queryString(query)}`, token, {
    useCache: true,
  });
}

export function createBatch(token, batch) {
  clearCache("/api/batches");
  return jsonRequest("/api/batches", token, "POST", batch);
}

export function updateBatch(token, id, changes) {
  clearCache("/api/batches");
  return jsonRequest(`/api/batches/${id}`, token, "PATCH", changes);
}

export function deleteBatch(token, id) {
  clearCache("/api/batches");
  clearCache("/api/attendance");
  return protectedRequest(`/api/batches/${id}`, token, { method: "DELETE" });
}

export function attachMentor(token, batchId, mentorId) {
  clearCache("/api/batches");
  return jsonRequest(`/api/batches/${batchId}/mentors`, token, "POST", {
    mentorId,
  });
}

export function detachMentor(token, batchId, mentorId) {
  clearCache("/api/batches");
  return protectedRequest(
    `/api/batches/${batchId}/mentors/${mentorId}`,
    token,
    { method: "DELETE" },
  );
}

export function enrollStudent(token, batchId, studentId) {
  clearCache("/api/batches");
  return jsonRequest(`/api/batches/${batchId}/students`, token, "POST", {
    studentId,
  });
}

export function removeStudentFromBatch(token, batchId, studentId) {
  clearCache("/api/batches");
  return protectedRequest(
    `/api/batches/${batchId}/students/${studentId}`,
    token,
    { method: "DELETE" },
  );
}

export function assignMentor(token, batchId, studentId, mentorId) {
  clearCache("/api/batches");
  return jsonRequest(
    `/api/batches/${batchId}/students/${studentId}/assign-mentor`,
    token,
    "POST",
    { mentorId },
  );
}

/* ── Attendance ─────────────────────────────────────────────────────── */

export function getAttendance(token, query) {
  return protectedRequest(`/api/attendance${queryString(query)}`, token, {
    useCache: true,
  });
}

export function getAttendanceByBatch(token, batchId) {
  return protectedRequest(`/api/attendance/batch/${batchId}`, token, {
    useCache: true,
  });
}

export function createAttendance(token, record) {
  clearCache("/api/attendance");
  return jsonRequest("/api/attendance", token, "POST", record);
}

export function updateAttendance(token, id, changes) {
  clearCache("/api/attendance");
  return jsonRequest(`/api/attendance/${id}`, token, "PATCH", changes);
}

export function deleteAttendance(token, id) {
  clearCache("/api/attendance");
  return protectedRequest(`/api/attendance/${id}`, token, { method: "DELETE" });
}

export function getAttendancePercentage(token, query) {
  return protectedRequest(
    `/api/attendance/percentage${queryString(query)}`,
    token,
    { useCache: true },
  );
}

/* ── Progress ───────────────────────────────────────────────────────── */

export function getProgress(token, query) {
  return protectedRequest(`/api/progress${queryString(query)}`, token, {
    useCache: true,
  });
}

export function getProgressByBatch(token, batchId) {
  return protectedRequest(`/api/progress/batch/${batchId}`, token, {
    useCache: true,
  });
}

export function createProgress(token, entry) {
  clearCache("/api/progress");
  return jsonRequest("/api/progress", token, "POST", entry);
}

export function updateProgress(token, id, changes) {
  clearCache("/api/progress");
  return jsonRequest(`/api/progress/${id}`, token, "PATCH", changes);
}

/* ── Assignments ────────────────────────────────────────────────────── */

export function getAssignments(token, query) {
  return protectedRequest(`/api/assignments${queryString(query)}`, token, {
    useCache: true,
  });
}

export function getAssignmentsByBatch(token, batchId) {
  return protectedRequest(`/api/assignments/batch/${batchId}`, token, {
    useCache: true,
  });
}

export function createAssignment(token, assignment) {
  clearCache("/api/assignments");
  return jsonRequest("/api/assignments", token, "POST", assignment);
}

export function updateAssignment(token, id, changes) {
  clearCache("/api/assignments");
  return jsonRequest(`/api/assignments/${id}`, token, "PATCH", changes);
}

export function deleteAssignment(token, id) {
  clearCache("/api/assignments");
  return protectedRequest(`/api/assignments/${id}`, token, {
    method: "DELETE",
  });
}

/* ── Submissions ────────────────────────────────────────────────────── */

export function getSubmissions(token, query) {
  return protectedRequest(`/api/submissions${queryString(query)}`, token, {
    useCache: true,
  });
}

export function getSubmissionsByAssignment(token, assignmentId) {
  return protectedRequest(
    `/api/submissions/assignment/${assignmentId}`,
    token,
    { useCache: true },
  );
}

export function createSubmission(token, submission) {
  clearCache("/api/submissions");
  return jsonRequest("/api/submissions", token, "POST", submission);
}

export function updateSubmission(token, id, changes) {
  clearCache("/api/submissions");
  return jsonRequest(`/api/submissions/${id}`, token, "PATCH", changes);
}

export function gradeSubmission(token, id, body) {
  clearCache("/api/submissions");
  return jsonRequest(`/api/submissions/${id}/grade`, token, "PATCH", body);
}

export function requestResubmission(token, id) {
  clearCache("/api/submissions");
  return jsonRequest(
    `/api/submissions/${id}/request-resubmission`,
    token,
    "PATCH",
  );
}

/* ── Announcements ──────────────────────────────────────────────────── */

export function getAnnouncements(token, query) {
  return protectedRequest(`/api/announcements${queryString(query)}`, token, {
    useCache: true,
  });
}

export function createAnnouncement(token, announcement) {
  clearCache("/api/announcements");
  return jsonRequest("/api/announcements", token, "POST", announcement);
}

export function updateAnnouncement(token, id, changes) {
  clearCache("/api/announcements");
  return jsonRequest(`/api/announcements/${id}`, token, "PATCH", changes);
}

export function deleteAnnouncement(token, id) {
  clearCache("/api/announcements");
  return protectedRequest(`/api/announcements/${id}`, token, {
    method: "DELETE",
  });
}

/* ── Dashboard ──────────────────────────────────────────────────────── */

export function getDashboard(token, role) {
  return protectedRequest(`/api/dashboard/${role.toLowerCase()}`, token, {
    useCache: true,
  });
}

/* ── Admin auth ─────────────────────────────────────────────────────── */

export function approveUser(token, id) {
  clearCache("/api/users");
  return jsonRequest(`/api/users/${id}/approve`, token, "PATCH");
}

export function changePassword(token, body) {
  return jsonRequest("/api/auth/change-password", token, "POST", body);
}

/* ── Profile ────────────────────────────────────────────────────────── */

export function getUserProfile(token) {
  return protectedRequest("/api/users/profile", token, { useCache: true });
}

export function updateUserProfile(token, body) {
  clearCache("/api/users");
  return jsonRequest("/api/users/profile", token, "PATCH", body);
}
