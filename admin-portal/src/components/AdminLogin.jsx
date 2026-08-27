import { useState } from "react";
import { ArrowRight, CheckCircle2, LockKeyhole } from "lucide-react";

export default function AdminLogin({ onSignIn, requestReset }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      await onSignIn({ email, password });
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function submitReset(event) {
    event.preventDefault();
    setError("");
    try {
      await requestReset(email);
      setResetSent(true);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-stone-100 p-5">
      <section className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-7 shadow-xl sm:p-9">
        <div className="mb-7 grid size-12 place-items-center rounded-xl bg-emerald-700 text-white">
          <LockKeyhole size={22} />
        </div>
        {forgotPassword && (
          <button
            className="mb-6 text-sm font-semibold text-emerald-700"
            onClick={() => {
              setForgotPassword(false);
              setError("");
              setResetSent(false);
            }}
          >
            ← Back to sign in
          </button>
        )}
        <p className="text-xs font-bold tracking-[0.2em] text-emerald-700">
          MSJ BOOTCAMP
        </p>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-stone-900">
          {forgotPassword ? "Reset your password" : "Administrator sign in"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-stone-500">
          {forgotPassword
            ? "Enter your registered administrator email and we’ll send a reset link."
            : "This workspace is restricted to authorised bootcamp administrators."}
        </p>
        {resetSent ? (
          <div className="mt-7 flex gap-3 rounded-lg bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
            <CheckCircle2 className="shrink-0" size={20} />
            If this account exists, a password-reset link has been issued.
          </div>
        ) : (
          <form
            className="mt-7 space-y-5"
            onSubmit={forgotPassword ? submitReset : submit}
          >
            <label className="block text-sm font-semibold text-stone-700">
              Administrator email
              <input
                className="mt-2 block w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            {!forgotPassword && (
              <label className="block text-sm font-semibold text-stone-700">
                Password
                <input
                  className="mt-2 block w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </label>
            )}
            {error && (
              <p className="text-sm font-medium text-rose-700">{error}</p>
            )}
            {!forgotPassword && (
              <button
                type="button"
                className="text-sm font-semibold text-emerald-700"
                onClick={() => {
                  setForgotPassword(true);
                  setError("");
                }}
              >
                Forgot password?
              </button>
            )}
            <button className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-800">
              {forgotPassword ? "Send reset link" : "Sign in"}{" "}
              <ArrowRight size={17} />
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
