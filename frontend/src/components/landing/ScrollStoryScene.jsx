import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * ScrollStoryScene
 * ────────────────
 * Full-viewport immersive scroll-driven animation.
 * - 280 frames from assets/story/ scrubbed by scroll position
 * - 5 story steps appear at different frame ranges with random entry positions
 * - No hard sections — one seamless flowing experience
 * - The canvas is sticky-pinned while a tall scroll runway drives the frame index
 */

// Eager-import all 280 story frames
const frameModules = import.meta.glob("../../assets/story/ezgif-frame-*.jpg", {
  eager: true,
});

function extractSortedUrls(modules) {
  return Object.keys(modules)
    .sort()
    .map((key) => modules[key].default);
}

const frameUrls = extractSortedUrls(frameModules);
const TOTAL_FRAMES = frameUrls.length; // 280

// Each step is tied to a frame range and has a random-feeling entry position
const STORY_STEPS = [
  {
    id: 1,
    number: "01",
    title: "Choose Your Role",
    subtitle: "Where does your ambition take you?",
    copy: "Pick from 22+ technical and non-technical career paths. Each role unlocks specialized, domain-aware questions tailored to your dream job.",
    frameStart: 0.0,
    frameEnd: 0.18,
    // Entry position — top-left quadrant
    position: "top-8 left-8 sm:top-12 sm:left-12",
    entryFrom: { x: -120, y: -40 },
    align: "text-left",
    maxW: "max-w-sm",
  },
  {
    id: 2,
    number: "02",
    title: "Personalise the Interview",
    subtitle: "Your context → Your interview",
    copy: "Upload your resume, set experience level, choose difficulty. The AI reads your background and crafts questions that mirror real interviews.",
    frameStart: 0.18,
    frameEnd: 0.38,
    // Entry — bottom-right area
    position: "bottom-10 right-8 sm:bottom-14 sm:right-12",
    entryFrom: { x: 120, y: 60 },
    align: "text-right",
    maxW: "max-w-sm",
  },
  {
    id: 3,
    number: "03",
    title: "Face the AI Interview",
    subtitle: "Dynamic questions · Follow-ups · Real-time",
    copy: "The AI asks a question, listens to your answer, understands context, and fires intelligent follow-ups — just like a real interviewer.",
    frameStart: 0.38,
    frameEnd: 0.62,
    // Entry — top-right corner
    position: "top-8 right-8 sm:top-12 sm:right-12",
    entryFrom: { x: 100, y: -60 },
    align: "text-right",
    maxW: "max-w-md",
  },
  {
    id: 4,
    number: "04",
    title: "Get Your Performance Report",
    subtitle: "Clarity on what to improve",
    copy: "Receive a comprehensive breakdown: overall readiness score, per-question evaluation, strengths, weaknesses, and targeted practice areas.",
    frameStart: 0.62,
    frameEnd: 0.82,
    // Entry — bottom-left
    position: "bottom-10 left-8 sm:bottom-14 sm:left-12",
    entryFrom: { x: -100, y: 80 },
    align: "text-left",
    maxW: "max-w-sm",
  },
  {
    id: 5,
    number: "05",
    title: "Land Your Dream Role",
    subtitle: "Practice interviews. Build confidence.",
    copy: "Keep practicing, track your growth across roles, and walk into your next interview with the confidence of someone who's already done it.",
    frameStart: 0.82,
    frameEnd: 1.0,
    // Entry — center
    position: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
    entryFrom: { x: 0, y: 100 },
    align: "text-center",
    maxW: "max-w-lg",
  },
];

// Height multiplier — how many viewport heights the scroll runway should be
const SCROLL_HEIGHT_VH = 18;

export default function ScrollStoryScene() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const framesRef = useRef([]);

  // Preload all frames
  useEffect(() => {
    let cancelled = false;

    async function loadFrames() {
      const loaded = await Promise.all(
        frameUrls.map(
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
      framesRef.current = loaded.filter(Boolean);
      setIsLoaded(true);
    }

    loadFrames();
    return () => { cancelled = true; };
  }, []);

  // Draw a frame to canvas
  const drawFrame = useCallback((index) => {
    const canvas = canvasRef.current;
    const frames = framesRef.current;
    if (!canvas || !frames.length) return;

    const clamped = Math.max(0, Math.min(index, frames.length - 1));
    const img = frames[clamped];
    if (!img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Cover-fit the image
    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih);
    const sw = iw * scale;
    const sh = ih * scale;
    const sx = (cw - sw) / 2;
    const sy = (ch - sh) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, sx, sy, sw, sh);
  }, []);

  // Scroll handler — maps scroll position to frame index
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rafId = null;

    function onScroll() {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect();
        const scrollableHeight = container.scrollHeight - window.innerHeight;
        const scrolled = -rect.top;
        const progress = Math.max(0, Math.min(1, scrolled / scrollableHeight));

        setScrollProgress(progress);

        if (framesRef.current.length > 0) {
          const frameIndex = Math.round(progress * (framesRef.current.length - 1));
          drawFrame(frameIndex);
        }
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    // Initial draw
    if (framesRef.current.length > 0) drawFrame(0);

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isLoaded, drawFrame]);

  // Resize canvas to viewport
  useEffect(() => {
    function resize() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      // Redraw current frame after resize
      if (framesRef.current.length > 0) {
        const idx = Math.round(scrollProgress * (framesRef.current.length - 1));
        drawFrame(idx);
      }
    }

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [isLoaded, scrollProgress, drawFrame]);

  // Current active step
  const activeStep = useMemo(() => {
    return STORY_STEPS.find(
      (s) => scrollProgress >= s.frameStart && scrollProgress < s.frameEnd
    );
  }, [scrollProgress]);

  // Progress within current step (0-1)
  const stepInternalProgress = useMemo(() => {
    if (!activeStep) return 0;
    const range = activeStep.frameEnd - activeStep.frameStart;
    return Math.min(1, (scrollProgress - activeStep.frameStart) / range);
  }, [scrollProgress, activeStep]);

  return (
    <section
      ref={containerRef}
      id="how-it-works"
      className="relative"
      style={{ height: `${SCROLL_HEIGHT_VH * 100}vh` }}
    >
      {/* Sticky viewport — pinned canvas + overlays */}
      <div className="sticky top-0 left-0 h-screen w-full overflow-hidden">
        {/* Loading state */}
        {!isLoaded && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950">
            <div className="flex flex-col items-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-indigo-500 border-t-transparent" />
              <span className="text-sm font-semibold text-slate-400 tracking-wide">Loading cinematic walkthrough…</span>
            </div>
          </div>
        )}

        {/* Canvas — full viewport */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: isLoaded ? 1 : 0, transition: "opacity 0.6s" }}
        />

        {/* Dark cinematic vignette overlay for text legibility */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/30" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/20" />

        {/* Step Text Overlays — positioned absolutely with random entry */}
        <AnimatePresence mode="wait">
          {activeStep && (
            <motion.div
              key={activeStep.id}
              initial={{
                opacity: 0,
                x: activeStep.entryFrom.x,
                y: activeStep.entryFrom.y,
                scale: 0.85,
                filter: "blur(12px)",
              }}
              animate={{
                opacity: 1,
                x: 0,
                y: 0,
                scale: 1,
                filter: "blur(0px)",
              }}
              exit={{
                opacity: 0,
                scale: 0.9,
                filter: "blur(8px)",
                transition: { duration: 0.3 },
              }}
              transition={{
                type: "spring",
                stiffness: 120,
                damping: 20,
                mass: 0.8,
              }}
              className={`absolute z-20 ${activeStep.position} ${activeStep.maxW} ${activeStep.align} pointer-events-none select-none`}
            >
              {/* Step number with glowing accent */}
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="inline-flex items-center gap-3 mb-3"
              >
                <span className="font-display text-5xl sm:text-6xl font-black text-white/90 drop-shadow-[0_2px_12px_rgba(99,102,241,0.6)]"
                  style={{ fontFeatureSettings: "'tnum' 1" }}
                >
                  {activeStep.number}
                </span>
                <span className="h-[3px] w-12 rounded-full bg-gradient-to-r from-indigo-400 to-violet-400 shadow-lg shadow-indigo-500/40" />
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.08] drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
              >
                {activeStep.title}
              </motion.h2>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="mt-2 text-sm sm:text-base font-semibold text-indigo-200/90 tracking-wide drop-shadow-md"
              >
                {activeStep.subtitle}
              </motion.p>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="mt-3 text-sm sm:text-[15px] font-medium text-white/75 leading-relaxed drop-shadow-sm max-w-md"
                style={activeStep.align === "text-center" ? { margin: "12px auto 0" } : {}}
              >
                {activeStep.copy}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom scroll progress bar */}
        <div className="absolute bottom-0 left-0 right-0 z-30 h-1 bg-white/10">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 shadow-lg shadow-indigo-500/30"
            style={{ width: `${scrollProgress * 100}%` }}
            transition={{ duration: 0.05 }}
          />
        </div>

        {/* Step indicator dots */}
        <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2.5">
          {STORY_STEPS.map((step) => {
            const isActive = activeStep?.id === step.id;
            return (
              <div
                key={step.id}
                className="flex items-center gap-1.5"
              >
                <div
                  className={`rounded-full transition-all duration-500 ${
                    isActive
                      ? "h-3 w-8 bg-white shadow-lg shadow-white/30"
                      : scrollProgress >= step.frameStart
                        ? "h-2.5 w-2.5 bg-white/60"
                        : "h-2 w-2 bg-white/25"
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Scroll hint — only at very beginning */}
        <AnimatePresence>
          {scrollProgress < 0.03 && isLoaded && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute bottom-16 left-1/2 z-30 -translate-x-1/2 flex flex-col items-center gap-2"
            >
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">
                Scroll to explore
              </span>
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="h-8 w-5 rounded-full border-2 border-white/40 flex items-start justify-center pt-1"
              >
                <div className="h-2 w-1 rounded-full bg-white/70" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
