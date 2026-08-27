import { useState } from "react";
import { seed } from "./data/seed";
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
} from "../../src/api/client";
const pages = {
  overview: OverviewPage,
  requests: RequestsPage,
  people: PeoplePage,
  courses: CoursesPage,
  attendance: AttendancePage,
  settings: SettingsPage,
};
export default function App() {
  let [data, setData] = useState(seed),
    [authenticated, setAuthenticated] = useState(() =>
      Boolean(sessionStorage.getItem("msj-admin-token")),
    ),
    [token, setToken] = useState(
      () => sessionStorage.getItem("msj-admin-token") || "",
    ),
    [page, setPage] = useState("overview"),
    [editor, setEditor] = useState(null),
    [confirm, setConfirm] = useState(null);
  let update = (changes) => setData((d) => ({ ...d, ...changes })),
    Page = pages[page],
    open = (type, index) => setEditor({ type, index }),
    ask = (text, action) => setConfirm({ text, action });

  async function signIn(credentials) {
    const response = await loginAdmin(credentials);
    const { token: nextToken, user } = response.data || {};
    if (!nextToken || user?.role !== "ADMIN")
      throw new Error(
        "The server did not return a valid administrator session.",
      );
    setData((current) => ({ ...current, admin: user }));
    sessionStorage.setItem("msj-admin-token", nextToken);
    setToken(nextToken);
    setAuthenticated(true);
  }
  async function signOut() {
    try {
      if (token) await logoutUser(token);
    } catch {}
    sessionStorage.removeItem("msj-admin-token");
    setToken("");
    setAuthenticated(false);
  }
  if (!authenticated)
    return <AdminLogin onSignIn={signIn} requestReset={requestPasswordReset} />;
  return (
    <div className="min-h-screen bg-stone-50 lg:flex">
      <Sidebar
        page={page}
        setPage={setPage}
        pending={data.requests.length}
        signOut={signOut}
      />
      <main className="min-w-0 flex-1 p-5 sm:p-9">
        <Header page={page} admin={data.admin} />
        <Page
          data={data}
          update={update}
          open={open}
          ask={ask}
          setPage={setPage}
        />
      </main>
      {editor && (
        <Editor
          {...editor}
          data={data}
          update={update}
          close={() => setEditor(null)}
        />
      )}{" "}
      {confirm && (
        <Confirm
          text={confirm.text}
          onClose={() => setConfirm(null)}
          onConfirm={() => {
            confirm.action();
            setConfirm(null);
          }}
        />
      )}
    </div>
  );
}
