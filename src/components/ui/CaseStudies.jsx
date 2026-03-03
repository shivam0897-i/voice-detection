"use client";

import { useEffect, useState, lazy, Suspense } from "react";
import { Monitor, LayoutDashboard, Users } from "lucide-react";

const CountUp = lazy(() => import("react-countup"));

/** Hook: respects user's motion preferences */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !("matchMedia" in window)) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e) => setReduced(e.matches);
    setReduced(mq.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

/** Utility: parse a metric like "98%", "3.8x", "$1,200+", "1.5M" */
function parseMetricValue(raw) {
  const value = (raw ?? "").toString().trim();
  const m = value.match(
    /^([^\d\-+]*?)\s*([\-+]?\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*([^\d\s]*)$/
  );
  if (!m) {
    return { prefix: "", end: 0, suffix: value, decimals: 0 };
  }
  const [, prefix, num, suffix] = m;
  const normalized = num.replace(/,/g, "");
  const end = parseFloat(normalized);
  const decimals = normalized.split(".")[1]?.length ?? 0;
  return {
    prefix: prefix ?? "",
    end: isNaN(end) ? 0 : end,
    suffix: suffix ?? "",
    decimals,
  };
}

/** Small component: one animated metric */
function MetricStat({ value, label, sub, duration = 1.6 }) {
  const reduceMotion = usePrefersReducedMotion();
  const { prefix, end, suffix, decimals } = parseMetricValue(value);

  return (
    <div className="flex flex-col gap-2 text-left p-6">
      <p
        className="text-2xl font-medium text-foreground sm:text-4xl"
        aria-label={`${label} ${value}`}
      >
        {prefix}
        {reduceMotion ? (
          <span>
            {end.toLocaleString(undefined, {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals,
            })}
          </span>
        ) : (
          <Suspense fallback={<span>{value}</span>}>
            <CountUp
              end={end}
              decimals={decimals}
              duration={duration}
              separator=","
              enableScrollSpy
              scrollSpyOnce
            />
          </Suspense>
        )}
        {suffix}
      </p>
      <p className="font-medium text-foreground text-left">{label}</p>
      {sub ? (
        <p className="text-muted-foreground text-left text-sm">{sub}</p>
      ) : null}
    </div>
  );
}

const caseStudies = [
  {
    id: 1,
    heading: "Fraud Blocked in 3 Seconds",
    quote:
      "A deepfake caller was flagged within 3 seconds. The fraud team blocked the transaction before any damage — that single catch paid for the entire annual contract.",
    name: "Head of Fraud Prevention",
    role: "NovaPay",
    image:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=800&fit=crop&crop=face",
    icon: Monitor,
    metrics: [
      { value: "97%", label: "Detection Accuracy", sub: "Across all voice deepfake types" },
      { value: "40%", label: "Fraud Reduction", sub: "Within first quarter" },
    ],
  },
  {
    id: 2,
    heading: "Integrated in Under a Day",
    quote:
      "The WebSocket streaming API was clean, docs were sharp, and the ops team saw results within hours. Full production deployment took less than a day.",
    name: "CTO",
    role: "SecureCall Systems",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop&crop=face",
    icon: LayoutDashboard,
    metrics: [
      { value: "3.5x", label: "Efficiency Gain", sub: "Across fraud review workflows" },
      { value: "70%", label: "Reduced False Positives", sub: "In daily fraud triage" },
    ],
  },
  {
    id: 3,
    heading: "28% Customer Trust Increase",
    quote:
      "Customer trust scores jumped 28% after deployment. Every call is verified in real-time — onboarding new agents onto the system is seamless.",
    name: "VP of Customer Experience",
    role: "TrustBank",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&h=800&fit=crop&crop=face",
    icon: Users,
    metrics: [
      { value: "2x", label: "Faster Onboarding", sub: "For new fraud analysts" },
      { value: "88%", label: "Customer Trust Boost", sub: "Post-deployment survey" },
    ],
  },
];

export default function CaseStudies() {
  return (
    <section
      className="py-28 bg-background"
      aria-labelledby="case-studies-heading"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 text-center max-w-2xl mx-auto">
          <h2
            id="case-studies-heading"
            className="font-heading text-3xl font-extrabold text-foreground sm:text-4xl md:text-5xl"
          >
            Real Results with{" "}
            <span className="text-gradient-static">VoiceGuard</span>
          </h2>
          <p className="text-muted-foreground text-[15px]">
            From call centers to fintech — VoiceGuard powers teams with
            real-time deepfake detection, speed, and confidence.
          </p>
        </div>

        {/* Cases */}
        <div className="mt-20 flex flex-col gap-20">
          {caseStudies.map((study, idx) => {
            const reversed = idx % 2 === 1;
            return (
              <div
                key={study.id}
                className="grid gap-12 lg:grid-cols-3 xl:gap-24 items-center border-b border-border pb-12"
              >
                {/* Left: Image + Quote */}
                <div
                  className={[
                    "flex flex-col sm:flex-row gap-10 lg:col-span-2 lg:border-r lg:pr-12 xl:pr-16 text-left",
                    reversed
                      ? "lg:order-2 lg:border-r-0 lg:border-l border-border lg:pl-12 xl:pl-16 lg:pr-0"
                      : "border-border",
                  ].join(" ")}
                >
                  <img
                    src={study.image}
                    alt={`${study.name} portrait`}
                    width={300}
                    height={400}
                    className="aspect-[29/35] h-auto w-full max-w-60 rounded-2xl object-cover ring-1 ring-border hover:scale-105 transition-all duration-300"
                    loading="lazy"
                    decoding="async"
                  />
                  <figure className="flex flex-col justify-between gap-8 text-left">
                    <blockquote className="text-lg sm:text-xl leading-relaxed text-left">
                      <h3 className="text-lg sm:text-xl lg:text-xl font-normal text-foreground leading-relaxed text-left">
                        <study.icon className="inline-block h-5 w-5 text-brand-400 mr-2 -mt-0.5" />
                        {study.heading}{" "}
                        <span className="block text-muted-foreground text-sm sm:text-base lg:text-lg mt-2">
                          {study.quote}
                        </span>
                      </h3>
                    </blockquote>
                    <figcaption className="flex items-center gap-6 mt-4 text-left">
                      <div className="flex flex-col gap-1">
                        <span className="text-md font-medium text-foreground">
                          {study.name}
                        </span>
                        <span className="text-sm text-muted-foreground/70">
                          {study.role}
                        </span>
                      </div>
                    </figcaption>
                  </figure>
                </div>

                {/* Right: Metrics */}
                <div
                  className={[
                    "grid grid-cols-1 gap-10 self-center text-left",
                    reversed ? "lg:order-1" : "",
                  ].join(" ")}
                >
                  {study.metrics.map((metric, i) => (
                    <MetricStat
                      key={`${study.id}-${i}`}
                      value={metric.value}
                      label={metric.label}
                      sub={metric.sub}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
