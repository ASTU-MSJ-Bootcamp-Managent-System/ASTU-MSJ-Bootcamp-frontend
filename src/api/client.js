const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://astu-msj-bootcamp-backend.onrender.com";

async function request(path, options = {}) {
  const { token, headers, ...requestOptions } = options;
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
  const payload = await response.json().catch(() => null);

  if (!payload || typeof payload.success !== "boolean") {
    throw new Error("The server returned an unexpected response.");
  }

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Request failed.");
  }

  return payload;
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
  return protectedRequest(path, token, { method, body: JSON.stringify(body) });
}

export function loginUser(credentials) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

// export function loginAdmin(credentials) {
//   return request("/api/admin/auth/login", {
//     method: "POST",
//     body: JSON.stringify(credentials),
//   });
// }

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
  return request("/api/auth/logout", { method: "POST", token });
}

export function getCurrentUser(token) {
  return request("/api/users/me", { token });
}

export function getCurrentAdmin(token) {
  return request("/api/admin/auth/me", { token });
}

export function getUsers(token, query) {
  return protectedRequest(`/api/users${queryString(query)}`, token);
}
export function createUser(token, user) {
  return jsonRequest("/api/users", token, "POST", user);
}
export function updateUser(token, id, changes) {
  return jsonRequest(`/api/users/${id}`, token, "PATCH", changes);
}
export function updateUserRole(token, id, role) {
  return jsonRequest(`/api/users/${id}/role`, token, "PATCH", { role });
}
export function deleteUser(token, id) {
  return protectedRequest(`/api/users/${id}`, token, { method: "DELETE" });
}

export function getBatches(token, query) {
  return protectedRequest(`/api/batches${queryString(query)}`, token);
}
export function createBatch(token, batch) {
  return jsonRequest("/api/batches", token, "POST", batch);
}
export function updateBatch(token, id, changes) {
  return jsonRequest(`/api/batches/${id}`, token, "PATCH", changes);
}
export function deleteBatch(token, id) {
  return protectedRequest(`/api/batches/${id}`, token, { method: "DELETE" });
}
export function attachMentor(token, batchId, mentorId) {
  return jsonRequest(`/api/batches/${batchId}/mentors`, token, "POST", {
    mentorId,
  });
}
export function enrollStudent(token, batchId, studentId) {
  return jsonRequest(`/api/batches/${batchId}/enroll-student`, token, "POST", {
    studentId,
  });
}
export function assignMentor(token, batchId, studentId, mentorId) {
  return jsonRequest(
    `/api/batches/${batchId}/students/${studentId}/assign-mentor`,
    token,
    "POST",
    { mentorId },
  );
}

export function getAttendance(token, query) {
  return protectedRequest(`/api/attendance${queryString(query)}`, token);
}
export function createAttendance(token, record) {
  return jsonRequest("/api/attendance", token, "POST", record);
}
export function updateAttendance(token, id, changes) {
  return jsonRequest(`/api/attendance/${id}`, token, "PATCH", changes);
}
export function getAttendancePercentage(token, query) {
  return protectedRequest(
    `/api/attendance/percentage${queryString(query)}`,
    token,
  );
}

export function getProgress(token, query) {
  return protectedRequest(`/api/progress${queryString(query)}`, token);
}
export function createProgress(token, entry) {
  return jsonRequest("/api/progress", token, "POST", entry);
}
export function updateProgress(token, id, changes) {
  return jsonRequest(`/api/progress/${id}`, token, "PATCH", changes);
}

export function getAssignments(token, query) {
  return protectedRequest(`/api/assignments${queryString(query)}`, token);
}
export function createAssignment(token, assignment) {
  return jsonRequest("/api/assignments", token, "POST", assignment);
}
export function updateAssignment(token, id, changes) {
  return jsonRequest(`/api/assignments/${id}`, token, "PATCH", changes);
}
export function deleteAssignment(token, id) {
  return protectedRequest(`/api/assignments/${id}`, token, {
    method: "DELETE",
  });
}
export function getSubmissions(token, query) {
  return protectedRequest(`/api/submissions${queryString(query)}`, token);
}
export function createSubmission(token, submission) {
  return jsonRequest("/api/submissions", token, "POST", submission);
}
export function updateSubmission(token, id, changes) {
  return jsonRequest(`/api/submissions/${id}`, token, "PATCH", changes);
}

export function getAnnouncements(token, query) {
  return protectedRequest(`/api/announcements${queryString(query)}`, token);
}
export function createAnnouncement(token, announcement) {
  return jsonRequest("/api/announcements", token, "POST", announcement);
}
export function updateAnnouncement(token, id, changes) {
  return jsonRequest(`/api/announcements/${id}`, token, "PATCH", changes);
}
export function deleteAnnouncement(token, id) {
  return protectedRequest(`/api/announcements/${id}`, token, {
    method: "DELETE",
  });
}

export function getDashboard(token, role) {
  return protectedRequest(`/api/dashboard/${role.toLowerCase()}`, token);
}
