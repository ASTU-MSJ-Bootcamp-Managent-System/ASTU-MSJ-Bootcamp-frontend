import toast from "react-hot-toast";

/**
 * Standardized toast notifications for the entire app.
 * - Success: green checkmark
 * - Error: red exclamation
 * - Warning: amber triangle
 * - Info: blue info circle
 */

export function showSuccess(message) {
  toast.success(message, {
    duration: 3000,
    style: { fontSize: "14px" },
  });
}

export function showError(message) {
  toast.error(message, {
    duration: 4000,
    style: { fontSize: "14px" },
  });
}

export function showWarning(message) {
  toast(message, {
    icon: "⚠️",
    duration: 4000,
    style: { fontSize: "14px", borderColor: "#f59e0b", background: "#fffbeb" },
  });
}

export function showInfo(message) {
  toast(message, {
    icon: "ℹ️",
    duration: 3000,
    style: { fontSize: "14px" },
  });
}

/**
 * Handles API errors consistently — extracts the message and shows a toast.
 * Returns the error message for further use.
 */
export function handleApiError(err, fallback = "Something went wrong") {
  const msg = err?.message || fallback;
  showError(msg);
  return msg;
}
