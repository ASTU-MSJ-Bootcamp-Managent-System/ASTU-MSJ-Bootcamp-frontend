import { useState } from "react";
import { Button, Intro, input } from "../components/ui";
export default function SettingsPage({ data, update }) {
  let [msg, setMsg] = useState("");
  function save(e) {
    e.preventDefault();
    let f = new FormData(e.currentTarget);
    if (f.get("current") !== data.admin.password)
      return setMsg("Current password is incorrect.");
    update({
      admin: {
        name: f.get("name"),
        email: f.get("email").trim().toLowerCase(),
        password: f.get("next"),
      },
    });
    setMsg("Profile and password updated for this session.");
  }
  return (
    <>
      <Intro
        title="Profile & security"
        text="Update the administrator identity and sign-in password."
      />
      <form
        onSubmit={save}
        className="max-w-xl rounded-xl border border-emerald-100 bg-white p-6"
      >
        <label className="block text-xs font-bold">
          Display name
          <input
            className={input}
            name="name"
            defaultValue={data.admin.name}
            required
          />
        </label>
        <label className="mt-4 block text-xs font-bold">
          Administrator email
          <input
            className={input}
            name="email"
            type="email"
            defaultValue={data.admin.email}
            required
          />
        </label>
        <hr className="my-6 border-stone-100" />
        <label className="block text-xs font-bold">
          Current password
          <input className={input} name="current" type="password" required />
        </label>
        <label className="mt-4 block text-xs font-bold">
          New password
          <input
            className={input}
            name="next"
            type="password"
            minLength="8"
            required
          />
        </label>
        {msg && <p className="mt-4 text-sm text-emerald-700">{msg}</p>}
        <Button className="mt-5">Save security changes</Button>
      </form>
    </>
  );
}
