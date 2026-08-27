import { useState, useEffect } from "react";
import "../styles.css";
import Dashboard from "./components/Dashboard";
import { ForgotPortal, Login } from "./components/Auth";
import {
  loginUser,
  logoutUser,
  registerStudent,
  requestPasswordReset,
  getDashboard,
} from "../api/client";

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
  const [people, setPeople] = useState([]);
  const [requests, setRequests] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [news, setNews] = useState([]);
  const [batches, setBatches] = useState([]);
  const enter = (nextRole, nextToken) => {
    const normalizedRole = nextRole.toLowerCase();
    setRole(normalizedRole);
    setToken(nextToken);
    sessionStorage.setItem("msj-role", normalizedRole);
    sessionStorage.setItem("msj-token", nextToken);
    setScreen("app");
  };

  async function signIn(credentials) {
    const response = await loginUser(credentials);
    const { token: nextToken, user } = response.data || {};
    if (!nextToken || !user?.role)
      throw new Error("The server did not return a valid login session.");
    if (user.role === "ADMIN")
      throw new Error("Please use the administrator portal to sign in.");
    enter(user.role, nextToken);
  }

  function requestAccount(draft) {
    return registerStudent({
      ...draft,
      email: draft.email.trim().toLowerCase(),
    });
  }

  function approveRequest(request) {
    setPeople((current) => [
      ...current,
      {
        id: request.id,
        name: request.name,
        email: request.email,
        mentor: "Unassigned",
        batch: "Frontend · Batch 03",
        status: "Active",
        attendance: 100,
        progress: 0,
      },
    ]);
    setRequests((current) => current.filter((item) => item.id !== request.id));
  }

  useEffect(() => {
    if (!token) return;
    let mounted = true;
    getDashboard(token, role)
      .then((res) => {
        const data = res.data || {};
        if (!mounted) return;
        setPeople(data.users || []);
        setAssignments(data.assignments || []);
        setNews(data.announcements || []);
        setBatches(data.batches || []);
        setRequests(data.requests || []);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [token, role]);

  if (screen === "app")
    return (
      <Dashboard
        role={role}
        people={people}
        setPeople={setPeople}
        requests={requests}
        approveRequest={approveRequest}
        assignments={assignments}
        setAssignments={setAssignments}
        news={news}
        setNews={setNews}
        batches={batches}
        setBatches={setBatches}
        logout={async () => {
          try {
            if (token) await logoutUser(token);
          } catch {}
          sessionStorage.removeItem("msj-token");
          sessionStorage.removeItem("msj-role");
          setToken("");
          setScreen("login");
        }}
      />
    );
  if (screen === "forgot")
    return (
      <ForgotPortal
        back={() => setScreen("login")}
        requestReset={requestPasswordReset}
      />
    );
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
}
