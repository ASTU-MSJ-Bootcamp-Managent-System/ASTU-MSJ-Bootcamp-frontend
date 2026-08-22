import { useState } from 'react';
import { Navigate, NavLink, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import {
  Bell,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { authService, userService } from './services/resources';
import { message } from './services/api';

const rolePaths = {
  admin: '/admin/dashboard',
  mentor: '/mentor/dashboard',
  student: '/student/dashboard',
};
const nav = {
  admin: [
    ['Dashboard', '/admin/dashboard', LayoutDashboard],
    ['Users', '/admin/users', Users],
    ['Batches', '/admin/batches', Users],
    ['Announcements', '/admin/announcements', Bell],
    ['Profile', '/admin/profile', GraduationCap],
  ],
  mentor: [
    ['Dashboard', '/mentor/dashboard', LayoutDashboard],
    ['Students', '/mentor/students', Users],
    ['Attendance', '/mentor/attendance', CalendarCheck],
    ['Progress', '/mentor/progress', CheckCircle2],
    ['Assignments', '/mentor/assignments', ClipboardList],
    ['Submissions', '/mentor/submissions', BookOpen],
    ['Announcements', '/mentor/announcements', Bell],
    ['Profile', '/mentor/profile', GraduationCap],
  ],
  student: [
    ['Dashboard', '/student/dashboard', LayoutDashboard],
    ['Attendance', '/student/attendance', CalendarCheck],
    ['Progress', '/student/progress', CheckCircle2],
    ['Assignments', '/student/assignments', ClipboardList],
    ['Grades', '/student/grades', BookOpen],
    ['Announcements', '/student/announcements', Bell],
    ['Profile', '/student/profile', GraduationCap],
    ['Change password', '/student/change-password', GraduationCap],
  ],
};
const data = {
  admin: {
    stats: [
      ['Students', '86', 'up 12%'],
      ['Mentors', '8', 'across 3 batches'],
      ['Active batches', '3', 'Summer 2026'],
      ['Attendance', '91%', 'this week'],
    ],
    activity: [
      'Marta Bekele joined Web Development A',
      'Week 4 attendance was recorded',
      'React Fundamentals assignment published',
    ],
  },
  mentor: {
    stats: [
      ['Assigned students', '24', 'Web Development A'],
      ['Attendance', '89%', 'this week'],
      ['Pending review', '7', 'submissions'],
      ['At risk', '3', 'need attention'],
    ],
    activity: [
      '7 assignment submissions await grading',
      'Attendance is due for Friday',
      'Three students need progress updates',
    ],
  },
  student: {
    stats: [
      ['Attendance', '92%', '22 of 24 sessions'],
      ['Progress', '71%', '5 of 7 topics'],
      ['Average grade', '84%', '3 graded tasks'],
      ['Open assignments', '2', 'one due this week'],
    ],
    activity: [
      'React Fundamentals feedback posted',
      'Node.js project due Friday',
      'New bootcamp announcement',
    ],
  },
};
function Protected({ roles, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return roles.includes(user.role) ? children : <Navigate to={rolePaths[user.role]} replace />;
}
function Layout({ children }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const links = nav[user.role];
  const title = links.find((x) => location.pathname.startsWith(x[1]))?.[0] || 'Bootcamp';
  return (
    <div className="min-h-screen lg:flex">
      <aside
        className={`${open ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 z-30 w-72 border-r border-white/10 bg-ink px-4 py-6 text-white shadow-soft transition lg:static lg:translate-x-0`}
      >
        <div className="mb-9 flex items-center gap-3 px-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand font-bold shadow-lg shadow-brand/25">
            MSJ
          </div>
          <div>
            <p className="font-bold">ASTU MSJ</p>
            <p className="text-xs text-sand/65">Summer Bootcamp</p>
          </div>
          <button onClick={() => setOpen(false)} className="ml-auto lg:hidden">
            <X />
          </button>
        </div>
        <nav className="space-y-1">
          {links.map(([label, to, Icon]) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-sm ${isActive ? 'bg-brand text-white shadow-sm' : 'text-sand/75 hover:bg-white/10 hover:text-white'}`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={logout}
          className="mt-8 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-sand/75 hover:bg-white/10 hover:text-white"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>
      {open && (
        <button
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-20 bg-slate-900/40 lg:hidden"
          aria-label="Close menu"
        />
      )}
      <main className="min-w-0 flex-1">
        <header className="flex h-20 items-center justify-between border-b border-sand/70 bg-white/90 px-5 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <button className="lg:hidden" onClick={() => setOpen(true)}>
              <Menu />
            </button>
            <div><h1 className="font-bold text-ink">{title}</h1><p className="text-xs text-slate-500">Welcome back, {user.name.split(' ')[0]}</p></div>
          </div>
          <button className="relative rounded-xl p-2 text-moss hover:bg-mist"><Bell size={20}/><span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-rose-500" /></button>
        </header>
        <div className="p-5 sm:p-8">{children}</div>
      </main>
    </div>
  );
}
function Landing() {
  return (
    <div className="bg-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <b className="text-xl text-ink">
          ASTU <span className="text-brand">MSJ</span>
        </b>
        <div className="flex gap-3">
          <NavLink to="/login" className="btn-secondary">
            Log in
          </NavLink>
          <NavLink to="/register" className="btn-primary">
            Join bootcamp
          </NavLink>
        </div>
      </header>
      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-2 md:items-center">
        <div>
          <p className="mb-4 font-semibold text-brand">SUMMER BOOTCAMP 2026</p>
          <h1 className="text-4xl font-extrabold leading-tight text-ink sm:text-6xl">
            Build skills that launch careers.
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            A practical learning community for ASTU students—guided by mentors, projects, and real
            feedback.
          </p>
          <div className="mt-8 flex gap-3">
            <NavLink to="/register" className="btn-primary">
              Apply now
            </NavLink>
            <a href="#tracks" className="btn-secondary">
              Explore tracks
            </a>
          </div>
        </div>
        <div className="rounded-3xl bg-ink p-8 text-white shadow-soft">
          <p className="text-sand/80">This summer at a glance</p>
          <div className="mt-8 grid grid-cols-2 gap-5">
            {[
              ['7', 'core technologies'],
              ['8', 'expert mentors'],
              ['3', 'active batches'],
              ['100%', 'project based'],
            ].map((x) => (
              <div key={x[0]} className="rounded-2xl bg-white/10 p-5">
                <b className="text-3xl">{x[0]}</b>
                <p className="mt-1 text-sm text-slate-300">{x[1]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="tracks" className="bg-mist px-5 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-ink">Your learning path</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              'HTML & CSS',
              'JavaScript',
              'React',
              'Node.js',
              'Express.js',
              'MongoDB',
              'Git & GitHub',
            ].map((t, i) => (
              <div className="card p-5" key={t}>
                <span className="text-sm font-bold text-brand">0{i + 1}</span>
                <h3 className="mt-5 font-bold">{t}</h3>
                <p className="mt-1 text-sm text-slate-500">Learn by building.</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-3xl font-bold text-ink">Questions, answered</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            ['Who can join?', 'ASTU students interested in practical software development.'],
            ['How does learning work?', 'Weekly sessions, mentor support, and hands-on projects.'],
            ['How do I apply?', 'Create an account and complete the registration form.'],
          ].map((x) => (
            <div className="card p-5" key={x[0]}>
              <h3 className="font-bold">{x[0]}</h3>
              <p className="mt-2 text-sm text-slate-600">{x[1]}</p>
            </div>
          ))}
        </div>
      </section>
      <footer className="bg-ink px-5 py-10 text-center text-sm text-slate-400">
        ASTU MSJ Summer Bootcamp · Adama Science and Technology University
      </footer>
    </div>
  );
}
function Auth({ register = false, forgot = false }) {
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
        if (import.meta.env.VITE_API_URL) await authService.forgotPassword({ email: form.email });
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
      const u = await login(form);
      navigate(rolePaths[u.role]);
    } catch (e) {
      setError(message(e) || e.message);
    }
  };
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
            <input
              required
              className="field"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
        )}
        <label className="label mt-5 block">
          Email
          <input
            required
            type="email"
            className="field"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
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
              onChange={(e) => setForm({ ...form, password: e.target.value })}
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
function Dashboard({ role }) {
  const d = data[role];
  return (
    <>
      <div className="mb-7">
        <h2 className="text-2xl font-bold text-ink">Good morning</h2>
        <p className="mt-1 text-slate-500">Here is what is happening in your bootcamp.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {d.stats.map(([label, value, note]) => (
          <div className="card p-5" key={label}>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-bold text-ink">{value}</p>
            <p className="mt-1 text-xs text-emerald-600">{note}</p>
          </div>
        ))}
      </div>
      <div className="card mt-6 p-6">
        <h3 className="font-bold text-ink">Recent activity</h3>
        <div className="mt-4 divide-y">
          {d.activity.map((x) => (
            <div key={x} className="py-4 text-sm text-slate-600">
              {x}
              <span className="float-right text-xs text-slate-400">Recently</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
const initialUsers = [
  { id: '1', name: 'Marta Bekele', email: 'marta@astu.edu.et', role: 'student', status: 'Active' },
  { id: '2', name: 'Abel Tesfaye', email: 'abel@astu.edu.et', role: 'mentor', status: 'Active' },
  { id: '3', name: 'Hana Worku', email: 'hana@astu.edu.et', role: 'student', status: 'Suspended' },
];
function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-4">
      <div className="card w-full max-w-lg p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-ink">{title}</h3>
          <button onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
function AdminUsers() {
  const [users, setUsers] = useState(initialUsers),
    [query, setQuery] = useState(''),
    [editing, setEditing] = useState(null),
    [confirm, setConfirm] = useState(null),
    [notice, setNotice] = useState('');
  const visible = users.filter((u) =>
    `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(query.toLowerCase()),
  );
  const persist = async (method, ...args) => {
    if (import.meta.env.VITE_API_URL) await userService[method](...args);
  };
  const save = async (form) => {
    try {
      if (editing?.id) {
        await persist('update', editing.id, form);
        setUsers((v) => v.map((u) => (u.id === editing.id ? { ...u, ...form } : u)));
        setNotice('User updated successfully.');
      } else {
        const entry = { ...form, id: crypto.randomUUID(), status: 'Active' };
        await persist('create', entry);
        setUsers((v) => [...v, entry]);
        setNotice('User created successfully.');
      }
      setEditing(null);
    } catch (e) {
      setNotice(message(e));
    }
  };
  const act = async () => {
    try {
      if (confirm.kind === 'remove') {
        await persist('remove', confirm.user.id);
        setUsers((v) => v.filter((u) => u.id !== confirm.user.id));
        setNotice(`${confirm.user.name} was removed.`);
      } else {
        const status =
          confirm.kind === 'ban' ? 'Banned' : confirm.kind === 'suspend' ? 'Suspended' : 'Active';
        await persist('update', confirm.user.id, { status });
        setUsers((v) => v.map((u) => (u.id === confirm.user.id ? { ...u, status } : u)));
        setNotice(`${confirm.user.name} is now ${status.toLowerCase()}.`);
      }
      setConfirm(null);
    } catch (e) {
      setNotice(message(e));
    }
  };
  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-ink">User management</h2>
          <p className="mt-1 text-sm text-slate-500">
            Create and control student, mentor, and administrator accounts.
          </p>
        </div>
        <button
          onClick={() => setEditing({ name: '', email: '', role: 'student' })}
          className="btn-primary"
        >
          <Plus size={16} className="mr-1" />
          Create user
        </button>
      </div>
      {notice && (
        <div className="mb-4 rounded-xl border border-moss/15 bg-moss/10 px-4 py-3 text-sm text-moss">
          {notice}
        </div>
      )}
      <input
        className="field mb-4 max-w-md"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name, email, or role…"
      />
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-sand/70 bg-mist/80 text-slate-500">
            <tr>
              {['Name', 'Role', 'Status', 'Actions'].map((x) => (
                <th className="px-5 py-3 font-semibold" key={x}>
                  {x}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((u) => (
              <tr className="border-b last:border-0" key={u.id}>
                <td className="px-5 py-4">
                  <b>{u.name}</b>
                  <p className="mt-0.5 text-xs text-slate-500">{u.email}</p>
                </td>
                <td className="px-5 py-4 capitalize">{u.role}</td>
                <td className="px-5 py-4">{status(u.status)}</td>
                <td className="space-x-2 px-5 py-4">
                  <button onClick={() => setEditing(u)} className="text-brand">
                    Edit
                  </button>
                  {u.status === 'Active' && (
                    <>
                      <button
                        onClick={() => setConfirm({ kind: 'suspend', user: u })}
                        className="text-amber-700"
                      >
                        Suspend
                      </button>
                      <button
                        onClick={() => setConfirm({ kind: 'ban', user: u })}
                        className="text-rose-600"
                      >
                        Ban
                      </button>
                    </>
                  )}
                  {u.status !== 'Active' && (
                    <button
                      onClick={() => setConfirm({ kind: 'activate', user: u })}
                      className="text-emerald-700"
                    >
                      Reactivate
                    </button>
                  )}
                  <button
                    onClick={() => setConfirm({ kind: 'remove', user: u })}
                    className="text-rose-600"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && (
        <Modal title={editing.id ? 'Edit user' : 'Create user'} onClose={() => setEditing(null)}>
          <UserForm user={editing} onCancel={() => setEditing(null)} onSave={save} />
        </Modal>
      )}
      {confirm && (
        <Modal
          title={`${confirm.kind[0].toUpperCase() + confirm.kind.slice(1)} user`}
          onClose={() => setConfirm(null)}
        >
          <p className="text-sm leading-6 text-slate-600">
            Are you sure you want to {confirm.kind} <b>{confirm.user.name}</b>?{' '}
            {confirm.kind === 'remove' && 'This cannot be undone.'}
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button className="btn-secondary" onClick={() => setConfirm(null)}>
              Cancel
            </button>
            <button className="btn bg-rose-700 text-white hover:bg-rose-800" onClick={act}>
              Confirm
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
function UserForm({ user, onCancel, onSave }) {
  const [form, setForm] = useState(user);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
      className="grid gap-4"
    >
      <label className="label">
        Full name
        <input
          required
          className="field"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </label>
      <label className="label">
        Email
        <input
          required
          type="email"
          className="field"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </label>
      <label className="label">
        Role
        <select
          className="field"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="student">Student</option>
          <option value="mentor">Mentor</option>
          <option value="admin">Admin</option>
        </select>
      </label>
      <div className="mt-2 flex justify-end gap-3">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn-primary">Save user</button>
      </div>
    </form>
  );
}
const status = (s) => (
  <span
    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${s.includes('Completed') || s === 'Present' || s === 'Published' || s === 'Active' ? 'bg-moss/10 text-moss' : s.includes('Late') || s.includes('Improvement') || s === 'Suspended' ? 'bg-amber-50 text-amber-800' : s === 'Banned' ? 'bg-rose-50 text-rose-700' : 'bg-brand/10 text-brand'}`}
  >
    {s}
  </span>
);
function Records({ type }) {
  const { user } = useAuth();
  const isStudent = user.role === 'student';
  const cfg = {
    users: [
      'Users',
      ['Name', 'Email', 'Role', 'Status'],
      [
        ['Marta Bekele', 'marta@astu.edu.et', 'Student', 'Active'],
        ['Abel Tesfaye', 'abel@astu.edu.et', 'Mentor', 'Active'],
        ['Selam Desta', 'selam@astu.edu.et', 'Admin', 'Active'],
      ],
    ],
    batches: [
      'Batches',
      ['Batch', 'Mentor', 'Students', 'Status'],
      [
        ['Web Development A', 'Abel Tesfaye', '24', 'Active'],
        ['Full-stack B', 'Meron Tadesse', '28', 'Active'],
      ],
    ],
    students: [
      'Assigned students',
      ['Student', 'Attendance', 'Progress', 'Status'],
      [
        ['Marta Bekele', '92%', 'Completed React', 'On track'],
        ['Yonas Ali', '78%', 'In Progress', 'Needs attention'],
        ['Sara Mohammed', '95%', 'Completed React', 'On track'],
      ],
    ],
    attendance: [
      'Attendance',
      ['Student', 'Date', 'Status', 'Percentage'],
      [
        ['Marta Bekele', 'Aug 20, 2026', 'Present', '92%'],
        ['Yonas Ali', 'Aug 20, 2026', 'Late', '78%'],
        ['Sara Mohammed', 'Aug 20, 2026', 'Present', '95%'],
      ],
    ],
    progress: [
      'Progress',
      ['Topic', 'Status', 'Note'],
      [
        ['HTML/CSS', 'Completed', 'Strong layout fundamentals'],
        ['JavaScript', 'Completed', 'Ready for advanced concepts'],
        ['React', 'In Progress', 'Finish state management practice'],
        ['Node.js', 'Not Started', 'Starts next week'],
      ],
    ],
    assignments: [
      'Assignments',
      ['Assignment', 'Deadline', 'Max score', 'Status'],
      [
        ['React Task Manager', 'Aug 29, 2026', '100', 'Submitted'],
        ['REST API Integration', 'Sep 05, 2026', '100', 'Open'],
      ],
    ],
    submissions: [
      'Submissions',
      ['Student', 'Assignment', 'Submitted', 'Status'],
      [
        ['Marta Bekele', 'React Task Manager', 'Aug 20', 'Needs review'],
        ['Yonas Ali', 'React Task Manager', 'Aug 21', 'Needs review'],
      ],
    ],
    grades: [
      'Grades',
      ['Assignment', 'Score', 'Feedback'],
      [
        ['HTML Portfolio', '88 / 100', 'Clean, responsive work.'],
        ['JavaScript Quiz', '80 / 100', 'Review array methods.'],
      ],
    ],
    announcements: [
      'Announcements',
      ['Title', 'Audience', 'Published', 'Status'],
      [
        ['React workshop schedule', 'Web Development A', 'Aug 19, 2026', 'Published'],
        ['Project submission reminder', 'All students', 'Aug 18, 2026', 'Published'],
      ],
    ],
  }[type];
  const [title, heads, rows] = cfg;
  return (
    <>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-ink">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {isStudent
              ? 'Your personal bootcamp information.'
              : 'Manage and review your bootcamp records.'}
          </p>
        </div>
        {!isStudent && (
          <button className="btn-primary">
            <Plus size={16} className="mr-1" />
            New {title.slice(0, -1)}
          </button>
        )}
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-sand/70 bg-mist/80 text-slate-500">
            <tr>
              {heads.map((h) => (
                <th className="px-5 py-3 font-semibold" key={h}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b last:border-0">
                {r.map((c, j) => (
                  <td className="px-5 py-4" key={j}>
                    {j === r.length - 1 &&
                    ['Status', 'Feedback', 'Note'].includes(heads[j]) &&
                    heads[j] !== 'Feedback' &&
                    heads[j] !== 'Note'
                      ? status(c)
                      : c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {type === 'attendance' && !isStudent && (
        <button className="btn-primary mt-5">Save attendance</button>
      )}
    </>
  );
}
function Profile() {
  const { user } = useAuth();
  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-ink">My profile</h2>
      <form className="card mt-6 grid gap-5 p-6 sm:grid-cols-2">
        <label className="label">
          Full name
          <input className="field" defaultValue={user.name} />
        </label>
        <label className="label">
          Email
          <input className="field" defaultValue={user.email} />
        </label>
        <label className="label">
          Phone
          <input className="field" placeholder="+251..." />
        </label>
        <label className="label">
          Department
          <input className="field" placeholder="Software Engineering" />
        </label>
        <button type="button" className="btn-primary sm:col-span-2 sm:w-fit">
          Save changes
        </button>
      </form>
    </div>
  );
}
function AssignmentDetail() {
  const { user } = useAuth();
  const student = user.role === 'student';
  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-ink">React Task Manager</h2>
      <div className="card mt-6 p-6">
        <p className="leading-7 text-slate-600">
          Build a task manager using React components, state, and local storage. Submit a GitHub
          repository and optional live demo before the deadline.
        </p>
        <div className="mt-5 flex gap-6 text-sm">
          <span>
            <b>Deadline:</b> Aug 29, 2026
          </span>
          <span>
            <b>Maximum score:</b> 100
          </span>
        </div>
      </div>
      {student && (
        <form className="card mt-5 grid gap-4 p-6">
          <h3 className="font-bold">Submit assignment</h3>
          <label className="label">
            GitHub repository URL
            <input required type="url" className="field" placeholder="https://github.com/..." />
          </label>
          <label className="label">
            Live demo URL <span className="font-normal">(optional)</span>
            <input type="url" className="field" placeholder="https://..." />
          </label>
          <label className="label">
            Notes
            <textarea className="field" rows="3" />
          </label>
          <button className="btn-primary w-fit">Submit assignment</button>
        </form>
      )}
    </div>
  );
}
function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center p-6 text-center">
      <div>
        <p className="text-6xl font-bold text-brand">404</p>
        <h1 className="mt-3 text-2xl font-bold">Page not found</h1>
        <NavLink to="/" className="btn-primary mt-6">
          Back home
        </NavLink>
      </div>
    </main>
  );
}
function Area() {
  const { user } = useAuth();
  const loc = useLocation();
  const part = loc.pathname.split('/')[2] || 'dashboard';
  if (part === 'dashboard') return <Dashboard role={user.role} />;
  if (user.role === 'admin' && part === 'users') return <AdminUsers />;
  if (part === 'profile' || part === 'change-password') return <Profile />;
  if (part === 'assignments' && loc.pathname.split('/')[3]) return <AssignmentDetail />;
  const valid = [
    'users',
    'batches',
    'announcements',
    'students',
    'attendance',
    'progress',
    'assignments',
    'submissions',
    'grades',
  ];
  return valid.includes(part) ? <Records type={part} /> : <NotFound />;
}
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/register" element={<Auth register />} />
      <Route path="/forgot-password" element={<Auth forgot />} />
      <Route path="/reset-password" element={<Auth forgot />} />
      {['admin', 'mentor', 'student'].map((role) => (
        <Route
          key={role}
          path={`/${role}/*`}
          element={
            <Protected roles={[role]}>
              <Layout>
                <Area />
              </Layout>
            </Protected>
          }
        />
      ))}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
