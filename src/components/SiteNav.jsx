import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, Menu, X, Home, Tag, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MetalButton } from '@/components/ui/LiquidGlassButton';
import { ToggleTheme } from '@/components/ui/ToggleTheme';

export default function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboard = location.pathname.startsWith('/dashboard');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (isDashboard) return null;

  const navLinks = [
    { name: 'Features', url: '/#features', icon: Layers },
    { name: 'Pricing', url: '/pricing', icon: Tag },
    { name: 'How It Works', url: '/#how-it-works', icon: Home },
  ];

  const handleNavClick = (url, e) => {
    setMobileOpen(false);
    if (url.startsWith('/#')) {
      e.preventDefault();
      const hash = url.slice(1);
      if (location.pathname === '/') {
        const el = document.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/' + hash);
      }
    }
  };

  const getActiveTab = () => {
    const match = navLinks.find(
      (link) =>
        (link.url === '/pricing' && location.pathname === '/pricing')
    );
    return match?.name || null;
  };

  const activeTab = getActiveTab();

  return (
    <nav
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-background/95 border-b border-border shadow-xl shadow-foreground/5'
          : 'bg-transparent'
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link
          to="/"
          className="group flex items-center gap-3"
          aria-label="VoiceGuard home"
        >
          <div className="relative flex h-8 w-8 items-center justify-center rounded-md border border-brand-500/20 bg-brand-500/10 transition-all group-hover:border-brand-500/40 group-hover:bg-brand-500/15">
            <Shield size={15} className="text-brand-400" />
          </div>
          <span className="font-heading text-[14px] font-bold tracking-[0.2em] uppercase text-foreground/90">
            VoiceGuard
          </span>
        </Link>

        {/* Tubelight Nav — center cluster */}
        <div className="hidden md:flex">
          <div className="flex items-center gap-1 border border-border bg-accent/50 backdrop-blur-lg py-1 px-1 rounded-full">
            {navLinks.map((item) => {
              const isActive = activeTab === item.name;
              return (
                <Link
                  key={item.name}
                  to={item.url}
                  onClick={(e) => handleNavClick(item.url, e)}
                  className={cn(
                    'relative cursor-pointer text-[13px] font-medium px-5 py-1.5 rounded-full transition-colors',
                    'text-muted-foreground hover:text-foreground/90',
                    isActive && 'text-foreground',
                  )}
                >
                  {item.name}
                  {isActive && (
                    <motion.div
                      layoutId="tubelight"
                      className="absolute inset-0 w-full bg-brand-500/10 rounded-full -z-10"
                      initial={false}
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                      }}
                    >
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-brand-400 rounded-t-full">
                        <div className="absolute w-12 h-6 bg-brand-400/20 rounded-full blur-md -top-2 -left-2" />
                        <div className="absolute w-8 h-6 bg-brand-400/20 rounded-full blur-md -top-1" />
                        <div className="absolute w-4 h-4 bg-brand-400/20 rounded-full blur-sm top-0 left-2" />
                      </div>
                    </motion.div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <ToggleTheme />
          </div>
          <Link to="/dashboard" className="hidden sm:block">
            <MetalButton variant="primary">
              Try Demo
            </MetalButton>
          </Link>
          <Link to="/dashboard" className="sm:hidden">
            <MetalButton variant="primary">
              Demo
            </MetalButton>
          </Link>

          <button
            className="flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <div className={cn(
        'overflow-hidden transition-all duration-300 md:hidden',
        mobileOpen
          ? 'max-h-80 opacity-100 bg-background/98 border-t border-border/50'
          : 'max-h-0 opacity-0'
      )}>
        <div className="mx-auto max-w-7xl px-6 py-2">
          {navLinks.map(link => (
            <Link
              key={link.name}
              to={link.url}
              onClick={(e) => { handleNavClick(link.url, e); setMobileOpen(false); }}
              className="block border-b border-border/50 px-2 py-3 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground last:border-0"
            >
              {link.name}
            </Link>
          ))}
          <div className="flex justify-center py-3">
            <ToggleTheme />
          </div>
        </div>
      </div>
    </nav>
  );
}
