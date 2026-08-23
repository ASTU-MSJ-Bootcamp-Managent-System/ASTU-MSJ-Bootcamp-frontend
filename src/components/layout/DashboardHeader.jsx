import { Bell, Menu } from 'lucide-react';

export default function DashboardHeader({ title, userName, onMenuOpen }) {
  return (
    <header className="flex h-20 items-center justify-between border-b border-sand/70 bg-white/90 px-5 backdrop-blur sm:px-8">
      <div className="flex items-center gap-3">
        <button className="lg:hidden" onClick={onMenuOpen}>
          <Menu />
        </button>
        <div>
          <h1 className="font-bold text-ink">{title}</h1>
          <p className="text-xs text-slate-500">Welcome back, {userName.split(' ')[0]}</p>
        </div>
      </div>

      <button className="relative rounded-xl p-2 text-moss hover:bg-mist">
        <Bell size={20} />
        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-rose-500" />
      </button>
    </header>
  );
}
