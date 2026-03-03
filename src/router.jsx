import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import MarketingLayout from './layouts/MarketingLayout';
import DashboardLayout from './layouts/DashboardLayout';

/* ── Lazy-loaded pages ─────────────────────────────── */
const LandingPage = lazy(() => import('./pages/LandingPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

/* ── Route-level loading fallback ──────────────────── */
function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border/50 border-t-brand-500" />
        <span className="text-[12px] text-muted-foreground/40">Loading…</span>
      </div>
    </div>
  );
}

/**
 * Centralized route configuration.
 *
 * Layout hierarchy:
 *   / (MarketingLayout — SiteNav + Footer)
 *     ├── /           → LandingPage
 *     ├── /pricing    → PricingPage
 *     ├── /privacy    → PrivacyPage
 *     └── *           → NotFoundPage
 *   /dashboard (DashboardLayout — compact topbar)
 *     └── /dashboard  → DashboardPage
 */
export default function AppRouter() {
  const location = useLocation();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes location={location} key={location.pathname}>
        {/* Marketing pages — shared nav + footer */}
        <Route element={<MarketingLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="pricing" element={<PricingPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Dashboard — own layout with compact nav */}
        <Route path="dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

