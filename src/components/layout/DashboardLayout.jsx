import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { navigation } from '../../config/navigation';
import { useAuth } from '../../context/AuthContext';
import DashboardHeader from './DashboardHeader';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const links = navigation[user.role];
  const title = links.find((item) => location.pathname.startsWith(item[1]))?.[0] || 'Bootcamp';

  return (
    <div className="min-h-screen lg:flex">
      <Sidebar links={links} open={open} onClose={() => setOpen(false)} onLogout={logout} />

      {open && (
        <button
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-20 bg-slate-900/40 lg:hidden"
          aria-label="Close menu"
        />
      )}

      <main className="min-w-0 flex-1">
        <DashboardHeader title={title} userName={user.name} onMenuOpen={() => setOpen(true)} />
        <div className="p-5 sm:p-8">{children}</div>
      </main>
    </div>
  );
}
