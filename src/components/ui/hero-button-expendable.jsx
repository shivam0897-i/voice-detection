"use client"

import { useState, useEffect } from "react"
import { X, Check, ArrowRight, BarChart3, Globe2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { GodRays, MeshGradient } from "@paper-design/shaders-react"

export default function Hero({ children }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [formStep, setFormStep] = useState("idle")

  const handleExpand = () => setIsExpanded(true)

  const handleClose = () => {
    setIsExpanded(false)
    // Reset form after a brief delay so the user doesn't see it reset while closing
    setTimeout(() => setFormStep("idle"), 500)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setFormStep("submitting")
    // Simulate API call
    setTimeout(() => {
      setFormStep("success")
    }, 1500)
  }

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => { document.body.style.overflow = "unset" }
  }, [isExpanded])

  return (
    <>
      {/* GodRays Background - Positioned absolute to fill the parent section */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 opacity-40 mix-blend-screen">
          <GodRays
            colorBack="#000000"
            colors={["#ffffff", "#e2e8f0", "#94a3b8", "#cbd5e1"]}
            colorBloom="#ffffff"
            offsetX={0.85}
            offsetY={-1}
            intensity={0.5}
            spotty={0.45}
            midSize={10}
            midIntensity={0}
            density={0.38}
            bloom={0.3}
            speed={0.5}
            scale={1.6}
            frame={3332042.8159981333}
            style={{
              height: "100%",
              width: "100%",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          />
        </div>
        {/* Gradient mask to gracefully fade the rays into the background color */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background" />
      </div>

      <div className="relative z-10 flex w-full flex-col items-center justify-center">
        <div className="relative z-10 flex flex-col items-center text-center w-full py-10">
          {children}

          <div className="mt-6 mb-4">
            <AnimatePresence initial={false}>
              {!isExpanded && (
                <motion.div className="inline-block relative">
                  {/* The expanding background element */}
                  <motion.div
                    style={{ borderRadius: "100px" }}
                    layout
                    layoutId="cta-card"
                    className="absolute inset-0 bg-primary dark:bg-primary shadow-emerald-500/20 shadow-xl"
                  />
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    layout={false}
                    onClick={handleExpand}
                    className="relative flex items-center gap-2 h-14 px-8 py-3 text-lg font-medium text-primary-foreground tracking-wide hover:opacity-90 transition-opacity"
                  >
                    Start your journey
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 
        Expanded Modal Overlay 
      */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              layoutId="cta-card"
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              style={{ borderRadius: "24px" }}
              layout
              className="relative flex h-full w-full overflow-hidden bg-primary sm:max-h-[90vh] sm:max-w-6xl sm:rounded-[24px] shadow-2xl font-sans"
            >
              {/* Mesh Gradient Background inside Modal */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 pointer-events-none"
              >
                <MeshGradient
                  speed={0.6}
                  colors={["#059669", "#10b981", "#047857", "#34d399"]}
                  distortion={0.8}
                  swirl={0.1}
                  grainMixer={0.15}
                  grainOverlay={0}
                  style={{ height: "100%", width: "100%" }}
                />
              </motion.div>

              {/* Close Button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleClose}
                className="absolute right-4 top-4 sm:right-6 sm:top-6 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </motion.button>

              {/* Modal Content */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="relative z-10 flex flex-col lg:flex-row h-full w-full overflow-y-auto"
              >
                {/* Left Side: Value Proposition & Social Proof */}
                <div className="flex-1 flex flex-col justify-center p-6 sm:p-10 lg:p-12 gap-5 text-white overflow-y-auto">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-xs font-medium text-emerald-100 w-fit">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                      Trusted by 200+ Enterprises
                    </div>
                    <h2 className="font-heading text-3xl sm:text-4xl lg:text-[42px] font-bold leading-[1.1] tracking-tight">
                      Stop Voice Fraud
                      <br />
                      <span className="text-emerald-200">Before It Starts</span>
                    </h2>
                    <p className="text-emerald-100/90 text-sm sm:text-base max-w-md leading-relaxed">
                      Get a personalized walkthrough of VoiceGuard's AI-powered detection engine — tailored to your industry and threat landscape.
                    </p>
                  </div>

                  <div className="space-y-4 mt-2">
                    <div className="flex gap-4 items-start group">
                      <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10 transition-colors group-hover:bg-white/20">
                        <BarChart3 className="w-5 h-5 text-emerald-200" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[15px]">97%+ Detection Accuracy</h3>
                        <p className="text-emerald-100/70 text-sm leading-relaxed mt-0.5">
                          Wav2Vec2-powered deepfake detection identifies synthetic speech in real-time during live calls.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start group">
                      <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10 transition-colors group-hover:bg-white/20">
                        <Globe2 className="w-5 h-5 text-emerald-200" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[15px]">Sub-200ms Latency</h3>
                        <p className="text-emerald-100/70 text-sm leading-relaxed mt-0.5">
                          Edge-deployed across 35+ regions for zero-lag fraud detection at global scale.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start group">
                      <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10 transition-colors group-hover:bg-white/20">
                        <Check className="w-5 h-5 text-emerald-200" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[15px]">SOC 2 & GDPR Compliant</h3>
                        <p className="text-emerald-100/70 text-sm leading-relaxed mt-0.5">
                          Enterprise-grade security with end-to-end encryption and zero data retention policies.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Form */}
                <div className="flex-1 flex items-center justify-center p-4 sm:p-10 lg:p-14 bg-black/5 backdrop-blur-sm lg:bg-transparent lg:backdrop-blur-none">
                  <div className="w-full max-w-md bg-white/[0.12] backdrop-blur-xl border border-white/20 rounded-2xl p-6 sm:p-8 shadow-[0_8px_32px_rgb(0_0_0/0.12)]">
                    
                    {formStep === "success" ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center text-center min-h-[380px] space-y-5"
                      >
                        <div className="w-16 h-16 bg-emerald-400 rounded-full flex items-center justify-center shadow-lg shadow-emerald-400/30">
                          <Check className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-2">You're In!</h3>
                          <p className="text-emerald-100/90 text-sm leading-relaxed max-w-xs mx-auto">
                            A VoiceGuard security specialist will reach out within 24 hours to schedule your personalized demo.
                          </p>
                        </div>
                        <button 
                          onClick={handleClose}
                          className="px-6 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl transition-all text-sm font-medium border border-white/10"
                        >
                          Back to Homepage
                        </button>
                      </motion.div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1 mb-1">
                          <h3 className="font-heading text-xl font-bold text-white">Book Your Demo</h3>
                          <p className="text-sm text-emerald-100/80">See VoiceGuard in action — takes 30 seconds.</p>
                        </div>

                        <div className="space-y-3.5">
                          <div>
                            <label htmlFor="name" className="block text-[11px] font-semibold text-emerald-100 mb-1.5 uppercase tracking-widest">
                              Full Name
                            </label>
                            <input
                              required
                              type="text"
                              id="name"
                              placeholder="Jane Doe"
                              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.08] border border-white/15 text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-emerald-300/50 focus:border-transparent transition-all text-sm"
                            />
                          </div>

                          <div>
                            <label htmlFor="email" className="block text-[11px] font-semibold text-emerald-100 mb-1.5 uppercase tracking-widest">
                              Work Email
                            </label>
                            <input
                              required
                              type="email"
                              id="email"
                              placeholder="jane@company.com"
                              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.08] border border-white/15 text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-emerald-300/50 focus:border-transparent transition-all text-sm"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label htmlFor="company" className="block text-[11px] font-semibold text-emerald-100 mb-1.5 uppercase tracking-widest">
                                Company
                              </label>
                              <input
                                type="text"
                                id="company"
                                placeholder="Acme Inc"
                                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.08] border border-white/15 text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-emerald-300/50 focus:border-transparent transition-all text-sm"
                              />
                            </div>
                            <div>
                              <label htmlFor="size" className="block text-[11px] font-semibold text-emerald-100 mb-1.5 uppercase tracking-widest">
                                Team Size
                              </label>
                              <select
                                id="size"
                                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.08] border border-white/15 text-white focus:outline-none focus:ring-2 focus:ring-emerald-300/50 focus:border-transparent transition-all text-sm appearance-none cursor-pointer"
                              >
                                <option className="bg-emerald-900">1–50</option>
                                <option className="bg-emerald-900">51–200</option>
                                <option className="bg-emerald-900">201–1,000</option>
                                <option className="bg-emerald-900">1,000+</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label htmlFor="message" className="block text-[11px] font-semibold text-emerald-100 mb-1.5 uppercase tracking-widest">
                              What's Your Top Priority?
                            </label>
                            <textarea
                              id="message"
                              rows={2}
                              placeholder="e.g. Detecting deepfakes in our call center..."
                              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.08] border border-white/15 text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-emerald-300/50 focus:border-transparent transition-all resize-none text-sm"
                            />
                          </div>
                        </div>

                        <button
                          disabled={formStep === "submitting"}
                          type="submit"
                          className="w-full flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-white text-emerald-800 font-semibold hover:bg-emerald-50 hover:shadow-lg hover:shadow-white/10 focus:ring-4 focus:ring-white/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-1 group"
                        >
                          {formStep === "submitting" ? (
                             <span className="flex items-center gap-2">
                               <span className="h-4 w-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></span>
                               Sending...
                             </span>
                          ) : (
                            <>
                              Book My Demo
                              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                            </>
                          )}
                        </button>
                        
                        <p className="text-[11px] text-center text-white/40 mt-3">
                          No commitment required · Cancel anytime
                        </p>
                      </form>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
