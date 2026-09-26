import { Logo } from './Logo';
import { useApp } from '@/store';
import type { ViewName } from '@/types';
import { ArrowLeft, LayoutDashboard, Plus, ShieldCheck, LogOut } from 'lucide-react';

export function TopNav({ activeView }: { activeView: ViewName }) {
  const { setView, setIsAdmin, isAdmin } = useApp();

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-navy-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button onClick={() => { setView('landing'); setIsAdmin(false); }}>
            <Logo />
          </button>
          <div className="hidden md:flex items-center gap-1">
            <NavBtn active={activeView === 'student'} onClick={() => setView('student')} icon={LayoutDashboard} label="My Reports" />
            <NavBtn active={activeView === 'report'} onClick={() => setView('report')} icon={Plus} label="Report Issue" />
            {isAdmin && (
              <NavBtn active={activeView === 'admin'} onClick={() => setView('admin')} icon={ShieldCheck} label="Admin" />
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <button
              className="btn-ghost text-sm"
              onClick={() => { setIsAdmin(false); setView('landing'); }}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Exit Admin</span>
            </button>
          ) : (
            <button
              className="btn-ghost text-sm"
              onClick={() => { setIsAdmin(true); setView('admin'); }}
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}
          <button className="btn-ghost text-sm" onClick={() => setView('landing')}>
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </button>
        </div>
      </div>
      {/* Mobile nav */}
      <div className="md:hidden flex items-center gap-1 px-4 pb-2">
        <NavBtn active={activeView === 'student'} onClick={() => setView('student')} icon={LayoutDashboard} label="My Reports" />
        <NavBtn active={activeView === 'report'} onClick={() => setView('report')} icon={Plus} label="Report" />
        {isAdmin && (
          <NavBtn active={activeView === 'admin'} onClick={() => setView('admin')} icon={ShieldCheck} label="Admin" />
        )}
      </div>
    </nav>
  );
}

function NavBtn({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof LayoutDashboard;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={active ? 'nav-link-active flex items-center gap-2' : 'nav-link flex items-center gap-2'}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}
