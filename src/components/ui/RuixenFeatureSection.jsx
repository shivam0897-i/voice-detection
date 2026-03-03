"use client";

import { cn } from "@/lib/utils";
import { CardContent } from "@/components/ui/Card";
import { Plus, Webhook, Terminal, Code2, Cpu } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const Highlight = ({ children, className }) => {
  return (
    <span
      className={cn(
        "font-bold bg-emerald-700/[0.2] text-emerald-500 px-1 py-0.5",
        className
      )}
    >
      {children}
    </span>
  );
};

const CARDS = [
  {
    id: 0,
    name: "Engineering Lead",
    designation: "FinShield",
    content: (
      <p>
        The <Highlight>REST API</Highlight> was dead simple. Had our first fraud score in production within{" "}
        <Highlight>2 hours</Highlight>.
      </p>
    ),
  },
  {
    id: 1,
    name: "DevOps Lead",
    designation: "CallTrust",
    content: (
      <p>
        Deployed via <Highlight>Docker</Highlight> in our VPC. Zero data leaves our network —{" "}
        <Highlight>compliance loved it</Highlight>.
      </p>
    ),
  },
  {
    id: 2,
    name: "Product Manager",
    designation: "VoxSecure",
    content: (
      <p>
        The <Highlight>webhook alerts</Highlight> are instant. Our fraud ops dashboard lights up{" "}
        <Highlight>before the call even ends</Highlight>.
      </p>
    ),
  },
];

const integrations = [
  {
    name: "REST API",
    desc: "Simple JSON endpoints for voice analysis and session management",
    icon: <Code2 className="h-4 w-4 text-primary" />,
  },
  {
    name: "WebSocket Streaming",
    desc: "Real-time audio streaming with sub-200ms response times",
    icon: <Terminal className="h-4 w-4 text-primary" />,
  },
  {
    name: "Webhooks",
    desc: "Instant fraud alerts pushed to your backend in real-time",
    icon: <Webhook className="h-4 w-4 text-primary" />,
  },
  {
    name: "Session Management",
    desc: "Track calls end-to-end with persistent session context",
    icon: <Cpu className="h-4 w-4 text-primary" />,
  },
];

let interval;

export const CardStack = ({ items, offset, scaleFactor }) => {
  const CARD_OFFSET = offset || 10;
  const SCALE_FACTOR = scaleFactor || 0.06;
  const [cards, setCards] = useState(items);

  useEffect(() => {
    interval = setInterval(() => {
      setCards((prevCards) => {
        const newArray = [...prevCards];
        newArray.unshift(newArray.pop());
        return newArray;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative mx-auto h-48 w-full md:h-48 md:w-96 my-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.id}
          className="absolute bg-card h-48 w-full md:h-48 md:w-96 rounded-3xl p-4 shadow-xl border border-border flex flex-col justify-between"
          style={{ transformOrigin: "top center" }}
          animate={{
            top: index * -CARD_OFFSET,
            scale: 1 - index * SCALE_FACTOR,
            zIndex: cards.length - index,
          }}
        >
          <div className="font-normal text-foreground/90 text-sm">
            {card.content}
          </div>
          <div>
            <p className="text-foreground font-medium text-sm">{card.name}</p>
            <p className="text-muted-foreground font-normal text-xs">{card.designation}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default function RuixenFeatureSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 relative">
        {/* Left Block */}
        <div className="flex flex-col items-start justify-center border border-border p-4 sm:p-6 lg:p-8">
          {/* Card Stack */}
          <div className="relative w-full mb-4 sm:mb-6">
            <div className="absolute inset-x-0 -bottom-2 h-16 sm:h-20 lg:h-24 bg-gradient-to-t from-background to-transparent z-10" />
            <CardStack items={CARDS} />
          </div>

          {/* Content */}
          <h3 className="text-lg sm:text-xl lg:text-2xl font-normal text-foreground leading-relaxed">
            Developer-First Dashboard{" "}
            <span className="text-primary">VoiceGuard</span>{" "}
            <span className="text-muted-foreground/70 text-sm sm:text-base lg:text-lg">
              Ship fraud detection into your product with clean APIs, real-time dashboards, and actionable insights out of the box.
            </span>
          </h3>
        </div>

        {/* Right Block */}
        <div className="flex flex-col items-center justify-start border border-border p-4 sm:p-6 lg:p-8">
          {/* Content */}
          <h3 className="text-lg sm:text-xl lg:text-2xl font-normal text-foreground mb-4 sm:mb-6 leading-relaxed">
            Ship in Minutes.{" "}
            <span className="text-primary">Scale Forever.</span>{" "}
            <span className="text-muted-foreground/70 text-sm sm:text-base lg:text-lg">
              Integrate with your existing stack using VoiceGuard's
              API-ready architecture and eliminate fraud in seconds.
            </span>
          </h3>
          <div
            className={cn(
              "group relative mt-auto w-full inline-flex animate-rainbow cursor-pointer items-center justify-center rounded-xl border-0 bg-background px-4 sm:px-6 lg:px-8 py-2 font-medium transition-colors [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              // glow blur behind
              "before:absolute before:bottom-[8%] before:left-1/2 before:z-0 before:h-1/5 before:w-3/5 before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] before:bg-[length:200%] before:[filter:blur(calc(0.8*1rem))]"
            )}
          >
            {/* Integration List */}
            <CardContent className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 bg-background border border-border rounded-2xl sm:rounded-3xl z-10 w-full">
              {integrations.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 sm:p-3 border border-border rounded-xl sm:rounded-2xl hover:bg-accent/50 transition"
                >
                  <div className="flex items-center gap-2 sm:gap-3 flex-1">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm sm:text-lg flex-shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground/70 line-clamp-1 sm:line-clamp-2">{item.desc}</p>
                    </div>
                  </div>
                  <button className="rounded-full border border-border p-1.5 sm:p-2 text-muted-foreground/50 hover:text-primary hover:border-primary/30 transition-colors flex-shrink-0 ml-2">
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              ))}
            </CardContent>
          </div>
        </div>
      </div>

      {/* Stats and Testimonial Section */}
      <div className="mt-12 sm:mt-16 lg:mt-20 grid gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
        <div className="flex justify-center items-center p-4 sm:p-6">
          <div className="grid grid-cols-3 gap-6 sm:gap-8 lg:gap-6 xl:gap-8 w-full text-center sm:text-left">
            <div className="space-y-2 sm:space-y-3">
              <div className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground">4</div>
              <p className="text-sm sm:text-base text-muted-foreground/70">API Endpoints</p>
            </div>
            <div className="space-y-2 sm:space-y-3">
              <div className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground">&lt;1 Day</div>
              <p className="text-sm sm:text-base text-muted-foreground/70">Integration Time</p>
            </div>
            <div className="space-y-2 sm:space-y-3">
              <div className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground">SOC 2</div>
              <p className="text-sm sm:text-base text-muted-foreground/70">Compliant</p>
            </div>
          </div>
        </div>
        <div className="relative">
          <blockquote className="border-l-2 border-primary/30 pl-4 sm:pl-6 lg:pl-8 text-muted-foreground/70">
            <p className="text-sm sm:text-base lg:text-lg leading-relaxed">
              VoiceGuard's API was the fastest security integration we've ever done. From first API call to production deployment in under 4 hours — with real-time deepfake detection on every call.
            </p>
            <div className="mt-4 sm:mt-6">
              <cite className="block font-medium text-sm sm:text-base text-foreground not-italic">
                CTO, SecureCall Systems
              </cite>
            </div>
          </blockquote>
        </div>
      </div>
    </section>
  );
}
