import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

const footerSections = [
  {
    title: 'Product',
    links: [
      { label: 'Features', to: '/#features', internal: true },
      { label: 'Pricing', to: '/pricing', internal: true },
      { label: 'Dashboard', to: '/dashboard', internal: true },
      { label: 'API Reference', to: '/#how-it-works', internal: true },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', to: '/#how-it-works', internal: true },
      { label: 'API Reference', to: '/#how-it-works', internal: true },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'GitHub', to: 'https://github.com/shivam0897-i/voice-detection', internal: false },
      { label: 'Report Issue', to: 'https://github.com/shivam0897-i/voice-detection/issues', internal: false },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', to: '#', internal: false },
      { label: 'Terms of Service', to: '#', internal: false },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-border/50 bg-background" role="contentinfo">
      {/* Subtle top glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/30 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6 lg:gap-10">
          {/* Brand */}
          <div className="col-span-2 flex flex-col gap-5">
            <Link
              to="/"
              className="group flex items-center gap-2.5 w-fit"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500/20 to-brand-400/10">
                <Shield size={16} className="text-brand-400" />
              </div>
              <span className="font-heading text-[13px] font-bold tracking-[0.15em] text-foreground/90">
                VOICEGUARD
              </span>
            </Link>
            <p className="max-w-xs text-[13px] leading-relaxed text-muted-foreground/70">
              Real-time AI voice fraud detection. Protect customers
              from deepfake voice attacks with 97%+ accuracy.
            </p>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="outline" size="sm" className="text-[10px] text-muted-foreground/50 border-border">Privacy-first</Badge>
              <Badge variant="outline" size="sm" className="text-[10px] text-muted-foreground/50 border-border">Open API</Badge>
              <Badge variant="outline" size="sm" className="text-[10px] text-muted-foreground/50 border-border">Self-hostable</Badge>
            </div>
          </div>

          {/* Link columns */}
          {footerSections.map(section => (
            <div key={section.title}>
              <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                {section.title}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {section.links.map(link => (
                  <li key={link.label}>
                    {link.internal ? (
                      <Link
                        to={link.to}
                        className="text-[13px] text-muted-foreground/80 transition-colors hover:text-brand-400"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.to}
                        className="text-[13px] text-muted-foreground/80 transition-colors hover:text-brand-400"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 sm:flex-row">
          <span className="text-[11px] text-muted-foreground/40">
            © {new Date().getFullYear()} VoiceGuard. All rights reserved.
          </span>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground/40">
            <span>VoiceGuard &middot; Voice fraud detection for modern teams</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
