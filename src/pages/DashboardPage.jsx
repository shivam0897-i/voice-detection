import App from '../App';

/**
 * Dashboard page — thin wrapper around the existing App component.
 * All existing dashboard logic (sessions, chunks, mic recording, etc.)
 * is preserved exactly as-is.
 */
export default function DashboardPage() {
    return <App />;
}
