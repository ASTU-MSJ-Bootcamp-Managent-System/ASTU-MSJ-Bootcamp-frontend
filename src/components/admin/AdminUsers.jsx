import { useState } from 'react';
import { Plus } from 'lucide-react';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import { message } from '../../services/api';
import { userService } from '../../services/resources';

const initialUsers = [
  {
    id: '1',
    name: 'Marta Bekele',
    email: 'marta@astu.edu.et',
    role: 'student',
    status: 'Active',
  },
  {
    id: '2',
    name: 'Abel Tesfaye',
    email: 'abel@astu.edu.et',
    role: 'mentor',
    status: 'Active',
  },
  {
    id: '3',
    name: 'Hana Worku',
    email: 'hana@astu.edu.et',
    role: 'student',
    status: 'Suspended',
  },
];

const tableHeaders = ['Name', 'Role', 'Status', 'Actions'];

function getNextStatus(action) {
  if (action === 'ban') return 'Banned';
  if (action === 'suspend') return 'Suspended';
  return 'Active';
}

function UserForm({ user, onCancel, onSave }) {
  const [form, setForm] = useState(user);

  const update = (key) => (event) => {
    setForm({ ...form, [key]: event.target.value });
  };

  const submit = (event) => {
    event.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={submit} className="grid gap-4">
      <label className="label">
        Full name
        <input required className="field" value={form.name} onChange={update('name')} />
      </label>

      <label className="label">
        Email
        <input
          required
          type="email"
          className="field"
          value={form.email}
          onChange={update('email')}
        />
      </label>

      <label className="label">
        Role
        <select className="field" value={form.role} onChange={update('role')}>
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

function UserActions({ user, onEdit, onConfirm }) {
  return (
    <td className="space-x-2 px-5 py-4">
      <button onClick={() => onEdit(user)} className="text-brand">
        Edit
      </button>

      {user.status === 'Active' && (
        <>
          <button onClick={() => onConfirm({ kind: 'suspend', user })} className="text-amber-700">
            Suspend
          </button>
          <button onClick={() => onConfirm({ kind: 'ban', user })} className="text-rose-600">
            Ban
          </button>
        </>
      )}

      {user.status !== 'Active' && (
        <button onClick={() => onConfirm({ kind: 'activate', user })} className="text-emerald-700">
          Reactivate
        </button>
      )}

      <button onClick={() => onConfirm({ kind: 'remove', user })} className="text-rose-600">
        Remove
      </button>
    </td>
  );
}

function UsersTable({ users, onEdit, onConfirm }) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-sand/70 bg-mist/80 text-slate-500">
          <tr>
            {tableHeaders.map((header) => (
              <th className="px-5 py-3 font-semibold" key={header}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr className="border-b last:border-0" key={user.id}>
              <td className="px-5 py-4">
                <b>{user.name}</b>
                <p className="mt-0.5 text-xs text-slate-500">{user.email}</p>
              </td>
              <td className="px-5 py-4 capitalize">{user.role}</td>
              <td className="px-5 py-4">
                <StatusBadge value={user.status} />
              </td>
              <UserActions user={user} onEdit={onEdit} onConfirm={onConfirm} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ConfirmUserModal({ action, onCancel, onConfirm }) {
  const title = `${action.kind[0].toUpperCase() + action.kind.slice(1)} user`;

  return (
    <Modal title={title} onClose={onCancel}>
      <p className="text-sm leading-6 text-slate-600">
        Are you sure you want to {action.kind} <b>{action.user.name}</b>?{' '}
        {action.kind === 'remove' && 'This cannot be undone.'}
      </p>

      <div className="mt-6 flex justify-end gap-3">
        <button className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn bg-rose-700 text-white hover:bg-rose-800" onClick={onConfirm}>
          Confirm
        </button>
      </div>
    </Modal>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState(initialUsers);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [notice, setNotice] = useState('');

  const visibleUsers = users.filter((user) => {
    const searchable = `${user.name} ${user.email} ${user.role}`;
    return searchable.toLowerCase().includes(query.toLowerCase());
  });

  const persist = async (method, ...args) => {
    if (import.meta.env.VITE_API_URL) {
      await userService[method](...args);
    }
  };

  const saveUser = async (form) => {
    try {
      if (editing?.id) {
        await persist('update', editing.id, form);
        setUsers((items) =>
          items.map((item) => (item.id === editing.id ? { ...item, ...form } : item)),
        );
        setNotice('User updated successfully.');
      } else {
        const entry = { ...form, id: crypto.randomUUID(), status: 'Active' };
        await persist('create', entry);
        setUsers((items) => [...items, entry]);
        setNotice('User created successfully.');
      }

      setEditing(null);
    } catch (error) {
      setNotice(message(error));
    }
  };

  const applyUserAction = async () => {
    try {
      if (confirm.kind === 'remove') {
        await persist('remove', confirm.user.id);
        setUsers((items) => items.filter((item) => item.id !== confirm.user.id));
        setNotice(`${confirm.user.name} was removed.`);
      } else {
        const status = getNextStatus(confirm.kind);
        await persist('update', confirm.user.id, { status });
        setUsers((items) =>
          items.map((item) => (item.id === confirm.user.id ? { ...item, status } : item)),
        );
        setNotice(`${confirm.user.name} is now ${status.toLowerCase()}.`);
      }

      setConfirm(null);
    } catch (error) {
      setNotice(message(error));
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
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search by name, email, or role..."
      />

      <UsersTable users={visibleUsers} onEdit={setEditing} onConfirm={setConfirm} />

      {editing && (
        <Modal title={editing.id ? 'Edit user' : 'Create user'} onClose={() => setEditing(null)}>
          <UserForm user={editing} onCancel={() => setEditing(null)} onSave={saveUser} />
        </Modal>
      )}

      {confirm && (
        <ConfirmUserModal
          action={confirm}
          onCancel={() => setConfirm(null)}
          onConfirm={applyUserAction}
        />
      )}
    </>
  );
}
