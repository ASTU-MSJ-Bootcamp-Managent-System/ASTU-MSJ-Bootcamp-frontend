import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import StudentMentorPortal from "./portal/StudentMentorPortal";

createRoot(document.getElementById("root")).render(
  <>
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          fontSize: "14px",
          borderRadius: "10px",
          padding: "12px 16px",
        },
        success: {
          iconTheme: { primary: "#059669", secondary: "#fff" },
        },
        error: {
          iconTheme: { primary: "#dc2626", secondary: "#fff" },
          duration: 4000,
        },
      }}
    />
    <StudentMentorPortal />
  </>,
);
