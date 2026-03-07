import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Shield, Home, Activity, History, Settings, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { ToggleTheme } from '@/components/ui/ToggleTheme';

const navigation = [
  { name: 'Overview', to: '/dashboard', icon: Home, end: true },
  { name: 'New Scan', to: '/dashboard/scan', icon: Activity },
  { name: 'History', to: '/dashboard/history', icon: History },
  { name: 'Settings', to: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card/40 backdrop-blur-xl border-r border-border/50 transition-transform duration-300 lg:static lg:translate-x-0 flex flex-col shadow-[1px_0_30px_rgba(0,0,0,0.2)]",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/[0.02] to-transparent pointer-events-none" />
        
        {/* Sidebar Header */}
        <div className="relative z-10 h-20 flex items-center px-6 border-b border-border/50">
          <div className="flex items-center gap-2 text-primary">
            <Shield className="w-6 h-6" />
            <span className="font-heading font-bold tracking-widest uppercase text-sm">VoiceGuard</span>
          </div>
          <button 
            className="ml-auto lg:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="relative z-10 flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-3 rounded-[14px] transition-all duration-300 text-sm font-medium relative group overflow-hidden",
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-[inset_0_1px_0_theme(colors.foreground/5%)]"
                    : "text-muted-foreground hover:bg-foreground/[0.02] border border-transparent hover:border-border/50 hover:text-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 transition-opacity duration-300",
                    isActive ? "opacity-100" : "group-hover:opacity-50"
                  )} />
                  <item.icon className={cn(
                    "w-5 h-5 relative z-10 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )} />
                  <span className="relative z-10">{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="relative z-10 p-4 border-t border-border/50 mt-auto bg-background/20">
          <div className="flex items-center gap-3 px-3 py-2 mb-3 bg-foreground/[0.05] rounded-[14px] border border-border/30">
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shadow-[inset_0_1px_0_theme(colors.foreground/10%)] border border-primary/20">
              {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground/90 truncate">{user?.displayName || 'Analyst'}</p>
              <p className="text-xs text-muted-foreground/70 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center justify-between px-2">
            <ToggleTheme />
            <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full w-9 h-9">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-background via-background to-muted/20 relative">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] mix-blend-overlay pointer-events-none"></div>
        
        {/* Mobile Header */}
        <header className="relative z-10 h-16 flex items-center justify-between px-4 sm:px-6 lg:hidden border-b border-border/50 bg-card/50 backdrop-blur-md">
          <div className="flex items-center gap-2 text-primary">
            <Shield className="w-5 h-5" />
            <span className="font-heading font-bold tracking-widest text-sm">VoiceGuard</span>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -mr-2 text-muted-foreground"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Content Router Outlet */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
