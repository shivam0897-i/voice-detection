import { useState } from 'react';
import { PricingSection } from '@/components/ui/PricingSection';
import { Badge } from '@/components/ui/Badge';
import { Shield, HelpCircle } from 'lucide-react';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { cn } from '@/lib/utils';

const PLANS = [
  {
    name: 'Starter',
    price: '0',
    yearlyPrice: '0',
    period: 'month',
    features: [
      '1,000 API calls / month',
      'Real-time voice analysis',
      'REST API access',
      'Community docs',
      'Email support',
    ],
    description: 'For developers and prototyping',
    buttonText: 'Get Started Free',
    href: '/dashboard',
  },
  {
    name: 'Pro',
    price: '99',
    yearlyPrice: '79',
    period: 'month',
    features: [
      '25,000 API calls / month',
      'Everything in Starter',
      'WebSocket streaming',
      'LLM semantic analysis',
      'Session management',
      'Priority support',
      'Webhook integrations',
    ],
    description: 'For growing teams & production',
    buttonText: 'Start Free Trial',
    href: '/dashboard',
    isPopular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    yearlyPrice: 'Custom',
    period: 'month',
    features: [
      'Unlimited API calls',
      'Everything in Pro',
      'Dedicated infrastructure',
      'Audit logs & reporting',
      'Custom model training',
      '99.99% SLA guarantee',
      'On-premise deployment',
    ],
    description: 'For banks, telcos & enterprises',
    buttonText: 'Contact Sales',
    href: '#',
  },
];

const FAQ = [
  {
    q: 'How does billing work?',
    a: 'Monthly billing based on your tier. API calls beyond quota cost $0.002 each. No long-term contracts.',
  },
  {
    q: 'Can I switch plans anytime?',
    a: 'Yes. Changes take effect next billing cycle. Pro-rated credits apply automatically.',
  },
  {
    q: 'Is my audio data stored?',
    a: 'No. Audio is processed in real-time and never persisted. Only derived metadata is retained per session.',
  },
  {
    q: 'What languages are supported?',
    a: 'English, Hindi, Tamil, Telugu, Bengali, and Kannada for keyword detection. Acoustic analysis is language-agnostic.',
  },
  {
    q: 'Do you offer a free trial?',
    a: 'Yes. The Starter plan is free forever with 1,000 API calls/month. Pro plans include a 14-day trial.',
  },
  {
    q: 'What about data privacy?',
    a: 'VoiceGuard processes audio in real-time and never stores recordings. Only derived metadata is retained per session. We are privacy-first by design.',
  },
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <>
      <PricingSection
        plans={PLANS}
        title="Simple, Transparent Pricing"
        description="Start free. Scale as you grow. No hidden fees, no long-term contracts."
      />

      <AnimatedSection>
        <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground/50 pb-12 bg-background">
          <Shield size={13} className="text-brand-400/50" />
          All plans include: SSL encryption · No audio storage · Privacy-first · 24/7 monitoring
        </div>
      </AnimatedSection>

      {/* FAQ */}
      <section className="relative border-t border-border/50 bg-card py-24" id="faq">
        <div className="relative mx-auto max-w-4xl px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center">
              <Badge variant="outline" className="mx-auto mb-5 text-[11px] text-muted-foreground/70 border-border">
                FAQ
              </Badge>
              <h2 className="font-heading text-3xl font-extrabold text-foreground">
                Questions & Answers
              </h2>
            </div>
          </AnimatedSection>

          <div className="mt-12 flex flex-col gap-3">
            {FAQ.map((item, i) => (
              <AnimatedSection key={item.q} delay={i * 60}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className={cn(
                    'w-full text-left rounded-xl border border-border px-6 py-4 transition-all duration-300',
                    openFaq === i
                      ? 'bg-muted/50 border-border'
                      : 'bg-card hover:border-border hover:bg-muted/30'
                  )}
                >
                  <div className="flex items-center justify-between gap-4">
                    <h4 className="text-[14px] font-semibold text-foreground/80">{item.q}</h4>
                    <HelpCircle size={16} className={cn(
                      'shrink-0 transition-colors',
                      openFaq === i ? 'text-brand-400' : 'text-muted-foreground/30'
                    )} />
                  </div>
                  <div className={cn(
                    'overflow-hidden transition-all duration-300',
                    openFaq === i ? 'mt-3 max-h-40 opacity-100' : 'max-h-0 opacity-0'
                  )}>
                    <p className="text-[13px] leading-relaxed text-muted-foreground/70">{item.a}</p>
                  </div>
                </button>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
