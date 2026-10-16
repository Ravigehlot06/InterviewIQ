import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  Sparkles,
  Mic,
  Video,
  Volume2,
  TrendingUp,
  CheckCircle2,
  Clock,
  ChevronDown,
  Layers,
  ArrowRight,
  User,
} from "lucide-react";

// Eagerly glob all 280 story frames from assets/story
const frameModules = import.meta.glob("../../assets/story/ezgif-frame-*.jpg", {
  eager: true,
});

function extractSortedUrls(modules) {
  return Object.keys(modules)
    .sort()
    .map((key) => modules[key].default);
}

const frameUrls = extractSortedUrls(frameModules);

export default function Hero() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const framesRef = useRef([]);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [waveformBars, setWaveformBars] = useState([40, 75, 55, 90, 60, 85, 45, 95, 65, 50, 80, 40]);

  // Audio waveform animation
  useEffect(() => {
    const interval = setInterval(() => {
      setWaveformBars((prev) => prev.map(() => Math.floor(Math.random() * 65) + 30));
    }, 450);
    return () => clearInterval(interval);
  }, []);

  // Preload frames progressively (first 30 immediately for instant render, then remaining)
  useEffect(() => {
    let cancelled = false;

    async function loadAllFrames() {
      if (frameUrls.length === 0) return;

      // Load initial batch
      const initialBatch = frameUrls.slice(0, 35);
      const firstImages = await Promise.all(
        initialBatch.map(
          (url) =>
            new Promise((resolve) => {
              const img = new Image();
              img.src = url;
              img.onload = () => resolve(img);
              img.onerror = () => resolve(null);
            })
        )
      );

      if (cancelled) return;
      framesRef.current = firstImages.filter(Boolean);
      setIsLoaded(true);

      // Draw initial frame immediately
      if (framesRef.current.length > 0) {
        drawFrame(0);
      }

      // Load remaining frames in background
      const remainingUrls = frameUrls.slice(35);
      const remainingImages = await Promise.all(
        remainingUrls.map(
          (url) =>
            new Promise((resolve) => {
              const img = new Image();
              img.src = url;
              img.onload = () => resolve(img);
              img.onerror = () => resolve(null);
            })
        )
      );

      if (cancelled) return;
      framesRef.current = [...firstImages.filter(Boolean), ...remainingImages.filter(Boolean)];
    }

    loadAllFrames();
    return () => {
      cancelled = true;
    };
  }, []);

  // Cover-fit draw onto canvas
  const drawFrame = useCallback((index) => {
    const canvas = canvasRef.current;
    const frames = framesRef.current;
    if (!canvas || !frames.length) return;

    const clamped = Math.max(0, Math.min(index, frames.length - 1));
    const img = frames[clamped];
    if (!img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth || img.width || 1920;
    const ih = img.naturalHeight || img.height || 1080;

    const scale = Math.max(cw / iw, ch / ih);
    const sw = iw * scale;
    const sh = ih * scale;
    const sx = (cw - sw) / 2;
    const sy = (ch - sh) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, sx, sy, sw, sh);
  }, []);

  // Resize canvas to match viewport DPR
  useEffect(() => {
    function handleResize() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = "100%";
      canvas.style.height = "100%";

      if (framesRef.current.length > 0) {
        const idx = Math.round(scrollProgress * (framesRef.current.length - 1));
        drawFrame(idx);
      }
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isLoaded, scrollProgress, drawFrame]);

  // Scroll listener mapping container scroll position to progress [0, 1]
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rafId = null;

    function handleScroll() {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect();
        const totalHeight = container.offsetHeight || rect.height;
        const scrollableHeight = totalHeight - window.innerHeight;
        const scrolled = -rect.top;
        const progress = Math.max(0, Math.min(1, scrolled / Math.max(1, scrollableHeight)));

        setScrollProgress(progress);

        if (framesRef.current.length > 0) {
          const frameIndex = Math.round(progress * (framesRef.current.length - 1));
          drawFrame(frameIndex);
        }
      });
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [drawFrame]);

  // Determine stage and blur calculation
  // Progress >= 0.64 begins the blur phase, fully blurred by 0.80
  const isBlurPhase = scrollProgress >= 0.64;
  const blurAmount = Math.max(0, Math.min(16, (scrollProgress - 0.64) * 45));
  const overlayOpacity = Math.max(0, Math.min(0.70, (scrollProgress - 0.64) * 2.2));

  // Story beats during the first 64% of scroll
  const showBeat1 = scrollProgress >= 0.12 && scrollProgress < 0.38;
  const showBeat2 = scrollProgress >= 0.38 && scrollProgress < 0.64;

  return (
    <section ref={containerRef} className="relative w-full" style={{ height: "360vh" }}>
      {/* ── STICKY PINNED HERO VIEWPORT ── */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        {/* HTML5 Canvas scrubbing through the 280 3D story frames */}
        <div
          className="absolute inset-0 transition-[filter] duration-300 pointer-events-none"
          style={{ filter: `blur(${blurAmount}px)` }}
        >
          <canvas ref={canvasRef} className="h-full w-full object-cover" />
        </div>

        {/* Ambient Darkening & Palette Glass Overlay that intensifies in the blur phase */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            backgroundColor: "#001D39",
            opacity: overlayOpacity * 0.75,
          }}
        />

        {/* Ice-Blue Radial Gradient Glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(123,189,232,0.22)_0%,_transparent_75%)]" />

        {/* ── PHASE 1: STORYLINE BEATS DURING INITIAL SCROLL (0% - 64%) ── */}
        <div className="pointer-events-none relative z-20 w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Scroll Discovery Indicator (at the very beginning) */}
          <AnimatePresence>
            {scrollProgress < 0.12 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="mx-auto max-w-2xl text-center"
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-[#7BBDE8]/30 bg-[#001D39]/90 px-4 py-1.5 backdrop-blur-md shadow-lg text-white mb-4">
                  <Sparkles className="h-3.5 w-3.5 text-[#7BBDE8]" />
                  <span className="text-xs font-bold tracking-wider uppercase text-[#BDD8E9]">
                    Adaptive Interview Intelligence
                  </span>
                </div>

                <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white drop-shadow-lg tracking-tight leading-tight">
                  Master the interview before you step into the room.
                </h2>
                <p className="mt-3 text-xs sm:text-sm lg:text-base text-slate-200 drop-shadow max-w-xl mx-auto leading-relaxed">
                  Scroll to experience how adaptive AI probing, real-time speech analysis, and ML readiness scoring turn high-stakes interviews into second nature.
                </p>

                <div className="mt-6 flex justify-center">
                  <div className="flex items-center gap-2 rounded-full border border-white/25 bg-[#0A4174]/80 px-4.5 py-2 text-xs font-semibold text-white backdrop-blur-md shadow-md animate-bounce">
                    <span>Scroll to explore the simulation</span>
                    <ChevronDown className="h-3.5 w-3.5 text-[#7BBDE8]" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Storyline Beat 1 (0.08 - 0.36) */}
          <AnimatePresence>
            {showBeat1 && (
              <motion.div
                key="beat-1"
                initial={{ opacity: 0, x: -35 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 35 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="max-w-md rounded-3xl border border-white/25 bg-[#001D39]/85 p-6 sm:p-7 text-white shadow-2xl backdrop-blur-xl"
              >
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#0A4174] px-3 py-1 text-[11px] font-bold text-[#7BBDE8] border border-[#7BBDE8]/30 mb-3">
                  <span>01 · Target Your Discipline</span>
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Start with your target career track.
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                  Over 22+ professional tracks, from Software Engineering and System Architecture to
                  Data Science and Product Management, calibrated to verified hiring rubrics.
                </p>
                <div className="mt-4 flex items-center gap-2 text-[11px] font-semibold text-[#7BBDE8]">
                  <span>Scroll to continue the simulation</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Storyline Beat 2 (0.36 - 0.65) */}
          <AnimatePresence>
            {showBeat2 && (
              <motion.div
                key="beat-2"
                initial={{ opacity: 0, x: 35 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -35 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="ml-auto max-w-md rounded-3xl border border-white/25 bg-[#001D39]/85 p-6 sm:p-7 text-white shadow-2xl backdrop-blur-xl text-left"
              >
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#0A4174] px-3 py-1 text-[11px] font-bold text-[#7BBDE8] border border-[#7BBDE8]/30 mb-3">
                  <span>02 · Dynamic AI Probing</span>
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Face adaptive follow-ups that test real depth.
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                  No scripted question banks. The AI listens to your response and immediately probes
                  trade-offs, concurrency issues, and STAR results just like a senior interviewer.
                </p>
                <div className="mt-4 flex items-center gap-2 text-[11px] font-semibold text-[#7BBDE8]">
                  <span>Scroll to enter the practice room</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── PHASE 2: AT LAST BLUR BACKGROUND AND PRESENT CURRENT TEXT & PREVIEW ── */}
        <AnimatePresence>
          {isBlurPhase && (
            <motion.div
              key="hero-text-and-ui"
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 z-30 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 overflow-y-auto"
            >
              <div className="w-full max-w-5xl my-auto">
                {/* Editorial Top Headline Layout */}
                <div className="mx-auto max-w-3xl text-center">
                  {/* Supporting Pre-Headline Label */}
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/[0.08] bg-white/90 px-3.5 py-1 backdrop-blur-md shadow-xs mb-4 sm:mb-6">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0A4174] opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#0A4174]" />
                    </span>
                    <span className="text-[11px] font-bold tracking-widest uppercase text-[#001D39]">
                      AI-Powered Interview Practice
                    </span>
                  </div>

                  {/* Headline */}
                  <h1 className="font-display text-[2.4rem] font-extrabold tracking-tight text-[#001D39] sm:text-[3.8rem] lg:text-[4.4rem] leading-[1.08] drop-shadow-xs">
                    Practice with purpose.
                    <br />
                    <span className="text-[#0A4174] font-semibold">Walk in with confidence.</span>
                  </h1>

                  {/* Supporting Description */}
                  <p className="mx-auto mt-4 sm:mt-5 max-w-2xl text-sm sm:text-base leading-relaxed text-[#0A4174] font-medium">
                    Prepare for the interviews that matter. Practice role-specific questions, respond
                    to adaptive follow-ups, and understand your performance with InterviewIQ.
                  </p>

                  {/* Action Buttons */}
                  <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                    <Link
                      to="/interview/setup"
                      className="group inline-flex items-center gap-2 rounded-full bg-[#001D39] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/20 transition-all duration-200 hover:bg-[#0A4174] hover:shadow-xl active:scale-98"
                    >
                      <span>Start Interview</span>
                      <ArrowUpRight className="h-4 w-4 text-[#7BBDE8] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>

                    <a
                      href="#how-it-works"
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#49769F]/25 bg-white/90 px-6 py-3.5 text-sm font-semibold text-[#001D39] backdrop-blur-md shadow-xs transition-all duration-200 hover:bg-white hover:border-[#0A4174]/40 active:scale-98"
                    >
                      <span>Explore How It Works</span>
                    </a>
                  </div>

                  {/* Micro-Features Bar */}
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-[#49769F]">
                    <span className="flex items-center gap-1.5">
                      <span className="text-[#0A4174] font-bold">✓</span> 22+ Supported Roles
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="text-[#0A4174] font-bold">✓</span> Real-Time Adaptive Probing
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="text-[#0A4174] font-bold">✓</span> STAR Method Feedback
                    </span>
                  </div>
                </div>

                {/* ── FLOATING COMPACT INTERFACE PREVIEW CARD ── */}
                <div className="mt-8 sm:mt-10 overflow-hidden rounded-[26px] sm:rounded-[30px] border border-[#49769F]/20 bg-white/95 p-4 sm:p-5 shadow-[0_24px_50px_-15px_rgba(0,29,57,0.1)] backdrop-blur-xl">
                  {/* Top Header of Preview */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
                      <span className="font-display text-xs sm:text-sm font-bold text-[#001D39]">
                        Live Mock Session — Senior Full Stack Engineer
                      </span>
                      <span className="rounded-md bg-[#BDD8E9]/60 px-2 py-0.5 text-[10px] font-bold text-[#0A4174] border border-[#7BBDE8]/40">
                        Technical Round
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                      <span>Question 3 of 6</span>
                      <span className="font-mono text-[#001D39] font-bold">04:18</span>
                    </div>
                  </div>

                  {/* Question and Real-Time Adaptive Response Grid */}
                  <div className="mt-3.5 grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center">
                    <div className="md:col-span-7 rounded-2xl bg-slate-50/80 p-3.5 border border-slate-200/70">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        AI Active Question
                      </span>
                      <p className="font-display text-xs sm:text-[13px] font-bold text-[#001D39] leading-snug">
                        "How would you architect an idempotent payment processing API to prevent
                        accidental double-charges during network timeouts?"
                      </p>
                      <div className="mt-2 text-[11px] text-slate-600 italic bg-white p-2 rounded-xl border border-slate-200/50">
                        "We generate unique idempotency keys on the client, acquire an atomic SETNX lock
                        in Redis with automatic TTL expiration, and persist transaction receipts in Postgres..."
                      </div>
                    </div>

                    <div className="md:col-span-5 rounded-2xl bg-[#0A4174]/5 border border-[#7BBDE8]/40 p-3.5 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#0A4174]">
                        <Sparkles className="h-3.5 w-3.5 text-[#0A4174]" />
                        <span>Adaptive Probe Triggered</span>
                      </div>
                      <p className="text-[11px] text-[#001D39] leading-normal font-medium">
                        "What happens if the Redis lock expires before the payment provider finishes processing?"
                      </p>
                      <div className="pt-1 flex items-center justify-between text-[10px] text-emerald-700 font-bold">
                        <span>STAR Alignment: 92%</span>
                        <span className="text-[#0A4174]">Probing Depth: Advanced</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Scroll Indicator on Bottom Right */}
        <div className="absolute bottom-5 right-6 z-20 hidden sm:flex items-center gap-2 rounded-full border border-white/20 bg-[#001D39]/80 px-3.5 py-1.5 text-[11px] font-mono font-semibold text-white backdrop-blur-md shadow-md">
          <span className="text-[#7BBDE8]">
            {Math.round(scrollProgress * 100)}%
          </span>
          <span className="text-slate-400">·</span>
          <span>{isBlurPhase ? "Final Overview" : "Scrubbing 3D Story"}</span>
        </div>
      </div>
    </section>
  );
}
