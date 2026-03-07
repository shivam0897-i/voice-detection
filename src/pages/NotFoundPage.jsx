import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Ghost } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-danger-500/5 blur-[120px]" />
      </div>

      <div className="relative text-center">
        <div className="relative mb-8">
          <span className="select-none font-heading text-[160px] font-black leading-none text-foreground/[0.03] sm:text-[200px]">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-border bg-muted">
              <Ghost size={36} className="text-muted-foreground/30" />
            </div>
          </div>
        </div>

        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          Page Not Found
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-muted-foreground/70">
          The resource you&apos;re looking for doesn&apos;t exist or has been moved.
          Check the URL or head back home.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <Link to="/">
            <Button variant="default" className="rounded-full shadow-md">
              <ArrowLeft size={16} className="-ml-1 mr-2 opacity-70" />
              Back to Home
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="secondary" className="rounded-full">
              <Home size={16} className="-ml-1 mr-2 opacity-70" />
              Open Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
