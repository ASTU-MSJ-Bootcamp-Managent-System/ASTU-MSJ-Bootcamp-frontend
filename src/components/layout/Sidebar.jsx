import { LogOut, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function Sidebar({ links, open, onClose, onLogout }) {
  return (
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
        <button onClick={onClose} className="ml-auto lg:hidden">
          <X />
        </button>
      </div>

      <nav className="space-y-1">
        {links.map(([label, to, Icon]) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-3 text-sm ${
                isActive
                  ? 'bg-brand text-white shadow-sm'
                  : 'text-sand/75 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={onLogout}
        className="mt-8 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-sand/75 hover:bg-white/10 hover:text-white"
      >
        <LogOut size={18} />
        Logout
      </button>
    </aside>
  );
}
