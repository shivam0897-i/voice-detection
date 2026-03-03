import { Outlet } from 'react-router-dom';
import SiteNav from '../components/SiteNav';
import Footer from '../components/Footer';

/**
 * Marketing layout — wraps all public pages (landing, pricing, etc.)
 * with the shared site navigation and footer.
 */
export default function MarketingLayout() {
    return (
        <div className="min-h-screen bg-background">
            <SiteNav />
            <main>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
