import { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { Button, Intro, input } from "../components/ui";

export default function SettingsPage({ data, update, saveProfile, onClose }) {
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  async function save(e) {
    e.preventDefault();
    setMsg("");
    setSaving(true);

    const f = new FormData(e.currentTarget);
    const name = f.get("name");
    const email = f.get("email").trim().toLowerCase();
    const currentPassword = f.get("current");
    const newPassword = f.get("next");

    try {
      if (saveProfile) {
        await saveProfile({ name, email, currentPassword, newPassword });
        setMsg("Profile and password updated successfully.");
      } else {
        if (currentPassword !== data.admin.password)
          return setMsg("Current password is incorrect.");
        update({ admin: { name, email, password: newPassword } });
        setMsg("Profile and password updated for this session.");
      }
    } catch (err) {
      setMsg(err.message || "Failed to update. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="relative mx-auto max-w-2xl rounded-xl border border-emerald-100 bg-white p-6 shadow-sm">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-600"
          title="Close"
        >
          <X size={18} />
        </button>
      )}

      <Intro
        title="Profile & security"
        text="Update the administrator identity and sign-in password."
      />

      <form onSubmit={save} className="mt-4 space-y-4">
        <label className="block text-xs font-bold">
          Display name
          <input
            className={input}
            name="name"
            defaultValue={data.admin.name}
            required
          />
        </label>
        <label className="block text-xs font-bold">
          Administrator email
          <input
            className={input}
            name="email"
            type="email"
            defaultValue={data.admin.email}
            required
          />
        </label>

        <hr className="border-stone-100" />

        <label className="block text-xs font-bold">
          Current password
          <PasswordField inputClass={input} name="current" required />
        </label>
        <label className="block text-xs font-bold">
          New password
          <PasswordField inputClass={input} name="next" minLength="8" required />
        </label>

        {msg && (
          <p
            className={`text-sm ${
              msg.includes("Failed") || msg.includes("incorrect")
                ? "text-rose-600"
                : "text-emerald-700"
            }`}
          >
            {msg}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-stone-200 px-4 py-2 text-sm text-stone-600 transition hover:bg-stone-50"
            >
              Cancel
            </button>
          )}
          <Button disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </section>
  );
}

function PasswordField({ inputClass, ...props }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        className={inputClass}
        type={visible ? "text" : "password"}
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}
