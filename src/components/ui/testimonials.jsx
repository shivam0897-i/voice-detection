import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/Badge';
import { Shield } from 'lucide-react';

const TESTIMONIALS = [
  {
    id: 'featured',
    featured: true,
    quote:
      "VoiceGuard transformed our fraud operations. We went from detecting deepfakes hours after the fact to catching them in real-time during live calls. The API integration took our team less than a day, and our fraud losses dropped by 73% in the first quarter.",
    name: 'Priya Sharma',
    role: 'VP of Fraud Prevention, FinShield',
    initials: 'PS',
  },
  {
    id: 'short-1',
    quote:
      "The REST API was dead simple. Had our first fraud score in production within an afternoon. The webhook alerts are instant.",
    name: 'Marcus Chen',
    role: 'Engineering Lead, VoxSecure',
    initials: 'MC',
  },
  {
    id: 'short-2',
    quote:
      "Sub-200ms latency on voice analysis is remarkable. We process 50K+ calls daily and VoiceGuard never misses a beat.",
    name: 'Elena Rodriguez',
    role: 'CTO, CallGuard Systems',
    initials: 'ER',
  },
  {
    id: 'short-3',
    quote:
      "Privacy-first and zero audio storage — exactly what our compliance team needed. GDPR sign-off was seamless.",
    name: 'David Kim',
    role: 'Head of Compliance, TrustBank',
    initials: 'DK',
  },
];

export default function Testimonials() {
  return (
    <section className="py-14 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-6xl space-y-8 px-6 md:space-y-16">
        {/* Header */}
        <div className="relative z-10 mx-auto max-w-xl space-y-4 text-center md:space-y-6">
          <Badge
            variant="outline"
            className="mx-auto mb-2 text-[11px] text-muted-foreground/70 border-border"
          >
            TESTIMONIALS
          </Badge>
          <h2 className="font-heading text-3xl font-extrabold text-foreground sm:text-4xl md:text-5xl">
            Trusted by{' '}
            <span className="text-gradient-static">Security Teams</span>
          </h2>
          <p className="text-[15px] text-muted-foreground">
            From call centers to fintech — teams ship VoiceGuard and stop
            deepfakes before they cause damage.
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-rows-2">
          {/* Featured — large card */}
          <Card className="grid grid-rows-[auto_1fr] gap-8 sm:col-span-2 sm:p-6 lg:row-span-2">
            <CardHeader className="pb-0">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/10">
                  <Shield size={14} className="text-brand-400" />
                </div>
                <span className="font-heading text-[11px] font-bold tracking-[0.12em] text-muted-foreground/60">
                  VOICEGUARD
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <blockquote className="grid h-full grid-rows-[1fr_auto] gap-6">
                <p className="text-lg font-medium leading-relaxed text-foreground/90 sm:text-xl">
                  &ldquo;{TESTIMONIALS[0].quote}&rdquo;
                </p>
                <div className="grid grid-cols-[auto_1fr] items-center gap-3">
                  <Avatar className="size-12">
                    <AvatarFallback>{TESTIMONIALS[0].initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <cite className="text-sm font-medium not-italic text-foreground">
                      {TESTIMONIALS[0].name}
                    </cite>
                    <span className="block text-sm text-muted-foreground">
                      {TESTIMONIALS[0].role}
                    </span>
                  </div>
                </div>
              </blockquote>
            </CardContent>
          </Card>

          {/* Remaining cards */}
          {TESTIMONIALS.slice(1).map((t) => (
            <Card key={t.id} className={t.id === 'short-1' ? 'md:col-span-2' : ''}>
              <CardContent className="h-full pt-6">
                <blockquote className="grid h-full grid-rows-[1fr_auto] gap-6">
                  <p className="text-[15px] leading-relaxed text-foreground/80">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="grid grid-cols-[auto_1fr] items-center gap-3">
                    <Avatar className="size-12">
                      <AvatarFallback>{t.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <cite className="text-sm font-medium not-italic text-foreground">
                        {t.name}
                      </cite>
                      <span className="block text-sm text-muted-foreground">
                        {t.role}
                      </span>
                    </div>
                  </div>
                </blockquote>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
