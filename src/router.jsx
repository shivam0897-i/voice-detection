import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import MarketingLayout from './layouts/MarketingLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

/* ── Lazy-loaded pages ─────────────────────────────── */
const LandingPage = lazy(() => import('./pages/LandingPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const DashboardOverview = lazy(() => import('./pages/dashboard/DashboardOverview'));
const HistoryPage = lazy(() => import('./pages/dashboard/HistoryPage'));
const SettingsPage = lazy(() => import('./pages/dashboard/SettingsPage'));
const App = lazy(() => import('./App'));
const DocsPage = lazy(() => import('./pages/DocsPage'));
const ApiReferencePage = lazy(() => import('./pages/ApiReferencePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));

/* ── Route-level loading fallback ──────────────────── */
function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border/50 border-t-primary" />
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
 *   /docs             → DocsPage (standalone layout)
 *   /api-reference    → ApiReferencePage (standalone layout)
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

        {/* Auth pages — no layout wrappers since they have custom full-screen designs */}
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />

        {/* Docs — standalone layout with own header */}
        <Route path="docs" element={<DocsPage />} />
        <Route path="api-reference" element={
          <ProtectedRoute>
            <ApiReferencePage />
          </ProtectedRoute>
        } />

        {/* Dashboard — own layout with compact nav */}
        <Route path="dashboard" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardOverview />} />
          <Route path="scan" element={<App />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

