import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import myLordImg from "../data/my-lord.webp";

const field =
  "mt-2 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100";
const action =
  "inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-800";
export function Mark() {
  return (
    <div className="grid size-10 place-items-center rounded-full border border-current text-[10px] font-bold">
      MSJ
    </div>
  );
}
function Shell({ children }) {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden overflow-hidden rounded-2xl border-2 border-emerald-700/40 m-2 text-stone-50 lg:flex lg:flex-col">
        <div className="absolute inset-0">
          <img
            src={myLordImg}
            alt="ASTU Bootcamp"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="relative z-10 p-8">
          <div className="inline-flex items-center gap-3 rounded-xl bg-black/40 px-4 py-3 backdrop-blur-md">
            <Mark />
            <span className="text-sm font-bold tracking-widest">ASTU · MSJ</span>
          </div>
        </div>
      </section>
      <section className="grid place-items-center bg-slate-50 p-6">
        <div className="w-full max-w-md">{children}</div>
      </section>
    </main>
  );
}
const validPassword = (password) =>
  password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
function Field({ label, type = "text", value, onChange }) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      <input
        className={field}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
      />
    </label>
  );
}

export function ForgotPortal({ back, requestReset }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await requestReset(email);
      setMessage(response.message);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <Shell>
      <button
        className="mb-8 text-sm font-semibold text-emerald-700"
        onClick={back}
      >
        ← Back to sign in
      </button>
      <p className="text-xs font-semibold tracking-widest text-emerald-700">
        PASSWORD RECOVERY
      </p>
      <h2 className="mt-3 font-serif text-4xl font-semibold">
        Reset your password
      </h2>
      <form className="mt-7 space-y-5" onSubmit={submit}>
        <Field
          label="Registered work email"
          type="email"
          value={email}
          onChange={setEmail}
        />
        {message && (
          <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
            {message}
          </p>
        )}
        {error && <p className="text-sm text-rose-700">{error}</p>}
        <button disabled={submitting} className={action}>
          {submitting ? "Sending…" : "Send reset link"} <ArrowRight size={18} />
        </button>
      </form>
    </Shell>
  );
}

export function Login({
  mode,
  login,
  forgot,
  back,
  createAccount,
  requestAccount,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [registration, setRegistration] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [registered, setRegistered] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  async function submit(event) {
    event.preventDefault();
    if (!validPassword(password))
      return setError(
        "Use at least 8 characters, including an uppercase letter and a number.",
      );
    setSubmitting(true);
    setError("");
    try {
      await login({ email, password });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }
  async function register(event) {
    event.preventDefault();
    if (!validPassword(registration.password))
      return setError(
        "Use at least 8 characters, including an uppercase letter and a number.",
      );
    setSubmitting(true);
    setError("");
    try {
      await requestAccount(registration);
      setRegistered(true);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }
  if (mode === "register")
    return (
      <Shell>
        <button
          className="mb-8 text-sm font-semibold text-emerald-700"
          onClick={back}
        >
          ← Back to sign in
        </button>
        <p className="text-xs font-semibold tracking-widest text-emerald-700">
          STUDENT ENROLLMENT
        </p>
        <h2 className="mt-3 font-serif text-4xl font-semibold">
          Create your account
        </h2>
        <p className="mt-3 text-slate-500">
          New accounts are created as students.
        </p>
        {registered ? (
          <p className="mt-7 flex gap-2 rounded-lg bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
            <CheckCircle2 />
            Your account was created. You can now sign in.
          </p>
        ) : (
          <form className="mt-7 space-y-5" onSubmit={register}>
            <Field
              label="Full name"
              value={registration.name}
              onChange={(name) => setRegistration({ ...registration, name })}
            />
            <Field
              label="ASTU email"
              type="email"
              value={registration.email}
              onChange={(email) => setRegistration({ ...registration, email })}
            />
            <Field
              label="Create password"
              type="password"
              value={registration.password}
              onChange={(password) =>
                setRegistration({ ...registration, password })
              }
            />
            {error && <p className="text-sm text-rose-700">{error}</p>}
            <button disabled={submitting} className={action}>
              {submitting ? "Creating…" : "Create account"}{" "}
              <ArrowRight size={18} />
            </button>
          </form>
        )}
      </Shell>
    );
  return (
    <Shell>
      <p className="text-xs font-semibold tracking-widest text-emerald-700">
        WELCOME BACK
      </p>
      <h2 className="mt-3 font-serif text-4xl font-semibold">
        Sign in to your space
      </h2>
      <p className="mt-3 text-slate-500">
        Use your registered ASTU Bootcamp email to continue.
      </p>
      <form className="mt-6 space-y-5" onSubmit={submit}>
        <Field
          label="Email address"
          type="email"
          value={email}
          onChange={setEmail}
        />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
        />
        {error && <p className="text-sm text-rose-700">{error}</p>}
        <div className="flex justify-between text-xs text-slate-500">
          <span>Password is 8+ characters.</span>
          <button
            type="button"
            className="font-semibold text-emerald-700"
            onClick={forgot}
          >
            Forgot password?
          </button>
        </div>
        <button disabled={submitting} className={action}>
          {submitting ? "Signing in…" : "Sign in"} <ArrowRight size={18} />
        </button>
      </form>
      <p className="mt-5 text-sm text-slate-500">
        Not enrolled yet?{" "}
        <button
          className="font-semibold text-emerald-700"
          onClick={createAccount}
        >
          Create an account
        </button>
      </p>
    </Shell>
  );
}
