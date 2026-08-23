import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { rolePaths } from '../../config/navigation';
import { authService } from '../../services/resources';
import { message } from '../../services/api';

export default function AuthPage({ register = false, forgot = false }) {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: 'student@astu.edu.et',
    password: 'password123',
  });

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (forgot) {
        if (import.meta.env.VITE_API_URL) {
          await authService.forgotPassword({ email: form.email });
        }
        setError('If an account exists, reset instructions have been sent.');
        return;
      }

      if (register) {
        if (import.meta.env.VITE_API_URL) {
          await authService.register(form);
        } else {
          localStorage.setItem(
            'msj_registered_user',
            JSON.stringify({ name: form.name, email: form.email, role: 'student' }),
          );
        }

        navigate('/login');
        return;
      }

      const user = await login(form);
      navigate(rolePaths[user.role]);
    } catch (err) {
      setError(message(err) || err.message);
    }
  };

  const change = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <main className="grid min-h-screen place-items-center bg-mist p-5">
      <form onSubmit={submit} className="card w-full max-w-md p-7">
        <NavLink to="/" className="text-sm font-bold text-brand">
          ← ASTU MSJ
        </NavLink>

        <h1 className="mt-6 text-2xl font-bold text-ink">
          {forgot ? 'Reset your password' : register ? 'Create your account' : 'Welcome back'}
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          {forgot
            ? 'Enter your email to receive a reset link.'
            : register
              ? 'Start your bootcamp journey.'
              : 'Use admin, mentor, or student as the email prefix for demo roles.'}
        </p>

        {register && (
          <label className="label mt-5 block">
            Full name
            <input required className="field" value={form.name} onChange={change('name')} />
          </label>
        )}

        <label className="label mt-5 block">
          Email
          <input
            required
            type="email"
            className="field"
            value={form.email}
            onChange={change('email')}
          />
        </label>

        {!forgot && (
          <label className="label mt-5 block">
            Password
            <input
              required
              minLength="8"
              type="password"
              className="field"
              value={form.password}
              onChange={change('password')}
            />
          </label>
        )}

        {error && (
          <p className={`mt-4 text-sm ${forgot ? 'text-emerald-600' : 'text-rose-600'}`}>{error}</p>
        )}

        <button disabled={loading} className="btn-primary mt-6 w-full">
          {loading
            ? 'Signing in…'
            : forgot
              ? 'Send reset link'
              : register
                ? 'Create account'
                : 'Sign in'}
        </button>

        {!register && !forgot && (
          <div className="mt-4 flex justify-between text-sm">
            <NavLink to="/register" className="text-brand">
              Create account
            </NavLink>
            <NavLink to="/forgot-password" className="text-brand">
              Forgot password?
            </NavLink>
          </div>
        )}
      </form>
    </main>
  );
}
