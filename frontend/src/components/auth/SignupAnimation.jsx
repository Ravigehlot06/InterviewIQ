import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Import all 160 login animation frames
const frameModules = import.meta.glob("../../assets/login/ezgif-frame-*.jpg", {
  eager: true,
});

function extractSortedUrls(modules) {
  return Object.keys(modules)
    .sort()
    .map((key) => modules[key].default);
}

const frameUrls = extractSortedUrls(frameModules);

// Target playback speed: ~28 fps → ~36ms per frame
const FRAME_INTERVAL_MS = 36;

export default function SignupAnimation() {
  const canvasRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [animationFinished, setAnimationFinished] = useState(false);

  const animRef = useRef({
    frames: [],
    frameIndex: 0,
    lastTime: 0,
    rafId: null,
    cancelled: false,
  });

  const drawFrame = useCallback((img) => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    const s = animRef.current;
    s.cancelled = false;
    s.frameIndex = 0;
    s.lastTime = 0;
    if (s.rafId) cancelAnimationFrame(s.rafId);
    setAnimationFinished(false);

    let isMounted = true;

    async function initFrames() {
      if (s.frames.length !== frameUrls.length) {
        const loadedImages = await Promise.all(
          frameUrls.map((url) => {
            return new Promise((resolve) => {
              const img = new Image();
              img.src = url;
              img.onload = () => resolve(img);
              img.onerror = () => resolve(null);
            });
          })
        );
        if (!isMounted) return;
        s.frames = loadedImages.filter(Boolean);
      }

      setIsLoaded(true);

      // Draw initial frame immediately
      if (s.frames[0]) {
        drawFrame(s.frames[0]);
      }

      // Start animation loop
      function step(now) {
        if (s.cancelled) return;

        if (!s.lastTime) s.lastTime = now;
        const delta = now - s.lastTime;

        if (delta >= FRAME_INTERVAL_MS) {
          s.lastTime = now - (delta % FRAME_INTERVAL_MS);

          if (s.frameIndex < s.frames.length - 1) {
            s.frameIndex++;
            drawFrame(s.frames[s.frameIndex]);
          } else {
            // Reached last frame: hold final pose in background and trigger motivating text
            drawFrame(s.frames[s.frames.length - 1]);
            setAnimationFinished(true);
            return;
          }
        }

        s.rafId = requestAnimationFrame(step);
      }

      s.rafId = requestAnimationFrame(step);
    }

    initFrames();

    return () => {
      isMounted = false;
      s.cancelled = true;
      if (s.rafId) cancelAnimationFrame(s.rafId);
    };
  }, [drawFrame]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950 flex flex-col justify-between">
      {/* Background Frame Animation Canvas */}
      <div className="absolute inset-0 z-0">
        {!isLoaded && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        )}

        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          className="w-full h-full object-cover transition-opacity duration-700"
          style={{ opacity: isLoaded ? 1 : 0 }}
        />

        {/* Ambient Dark/Vibrant Gradient Overlay over Background Animation */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-slate-950/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/40 via-transparent to-slate-950/80" />
      </div>

      {/* Only Motivating Line from Top to Bottom of Page (Rises after last frame) */}
      <AnimatePresence>
        {animationFinished && (
          <motion.div
            initial={{ opacity: 0, y: 70 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              damping: 24,
              stiffness: 120,
              mass: 0.9,
            }}
            className="relative z-10 flex flex-col justify-between h-full p-8 sm:p-12 lg:p-14 select-none"
          >
            {/* Top of page motivating prompt */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="flex items-center gap-2.5"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-xs uppercase tracking-[0.28em] font-bold text-indigo-300 drop-shadow-md">
                InterviewIQ • AI Career Mentor
              </span>
            </motion.div>

            {/* Center of page: Grand motivating statement */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.7 }}
              className="my-auto max-w-xl"
            >
              <div className="inline-flex items-center gap-2 mb-4 px-3.5 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-400/30 backdrop-blur-md shadow-lg shadow-indigo-500/10">
                <span className="text-xs font-semibold tracking-wide bg-gradient-to-r from-amber-300 via-rose-300 to-indigo-200 bg-clip-text text-transparent">
                  ✨ Turn Ambition Into Achievement
                </span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.12] drop-shadow-2xl">
                <span className="text-white">Your dream career is </span>
                <span className="bg-gradient-to-r from-amber-300 via-indigo-200 to-cyan-300 bg-clip-text text-transparent underline decoration-indigo-400/50 decoration-wavy decoration-2">
                  only one great interview
                </span>
                <span className="text-white"> away.</span>
              </h1>
            </motion.div>

            {/* Bottom of page: Closing motivating prompt */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="max-w-lg"
            >
              <p className="text-sm sm:text-base font-medium text-slate-300/90 leading-relaxed drop-shadow-md border-l-2 border-indigo-400/60 pl-3.5">
                Master role-specific follow-ups, speak with unstoppable clarity, and step into every interview ready to succeed.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
