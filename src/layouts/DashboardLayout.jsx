import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, Activity } from 'lucide-react';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard Nav */}
      <nav className="nav-surface sticky top-0 z-50">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-500/20 to-transparent" />
        <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-4 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground/70 transition-all hover:text-foreground/70"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Home</span>
          </Link>

          <Link
            to="/dashboard"
            className="group flex items-center gap-2.5"
          >
            <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500/20 to-brand-400/10">
              <Shield size={14} className="text-brand-400" />
            </div>
            <span className="font-heading text-[12px] font-bold tracking-[0.15em] text-foreground/80">
              VOICEGUARD
            </span>
            <div className="hidden items-center gap-1.5 rounded-full bg-success-500/10 px-2 py-0.5 sm:flex">
              <Activity size={10} className="text-success-400" />
              <span className="text-[10px] font-medium text-success-400">LIVE</span>
            </div>
          </Link>

          <div className="hidden sm:block w-16" />
        </div>
      </nav>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
