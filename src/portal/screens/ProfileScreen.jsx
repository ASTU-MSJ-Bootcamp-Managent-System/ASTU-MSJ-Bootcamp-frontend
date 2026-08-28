import { useState } from "react";
import { Toolbar, PasswordField } from "../components/Shared";
import { changePassword as apiChangePassword, updateUserProfile as apiUpdateUserProfile } from "../../api/client";

export default function ProfileScreen({ token, me, refresh }) {
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  async function save(e) {
    e.preventDefault();
    setMsg("");
    setSaving(true);
    const f = new FormData(e.currentTarget);
    const name = f.get("name");
    const email = f.get("email");
    const currentPassword = f.get("current");
    const newPassword = f.get("next");

    try {
      if (newPassword) {
        await apiChangePassword(token, { currentPassword, newPassword });
      }
      if (name || email) {
        await apiUpdateUserProfile(token, { name, email });
      }
      await refresh();
      setMsg("Profile updated successfully.");
    } catch (err) {
      setMsg(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="panel work-panel">
      <Toolbar title="Profile & security" />
      <form
        onSubmit={save}
        className="max-w-lg space-y-4"
      >
        <label className="block text-sm font-semibold text-slate-700">
          Display name
          <input
            className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
            name="name"
            defaultValue={me?.name || ""}
            required
          />
        </label>
        <label className="block text-sm font-semibold text-slate-700">
          Email
          <input
            className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
            name="email"
            type="email"
            defaultValue={me?.email || ""}
            required
          />
        </label>

        <hr className="border-slate-200" />

        <label className="block text-sm font-semibold text-slate-700">
          Current password
          <PasswordField name="current" required />
        </label>
        <label className="block text-sm font-semibold text-slate-700">
          New password (min 8 characters)
          <PasswordField name="next" minLength="8" />
        </label>

        {msg && (
          <p
            className={`text-sm ${
              msg.includes("Failed") ? "text-rose-700" : "text-emerald-700"
            }`}
          >
            {msg}
          </p>
        )}

        <button
          className="primary"
          disabled={saving}
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </section>
  );
}
