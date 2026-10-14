import { useEffect, useRef, useState, useCallback } from "react";

/**
 * LoginAnimation
 * ──────────────
 * Plays all 232 frames from login1/ once, then loops the last 15
 * frames (218-232) endlessly for a smooth continuous idle animation.
 * Rendered on a performant <canvas> with crossfade overlays to
 * blend seamlessly with the login card on the right.
 */

const frameModules = import.meta.glob("../../assets/login1/ezgif-frame-*.jpg", {
  eager: true,
});

function extractSortedUrls(modules) {
  return Object.keys(modules)
    .sort()
    .map((key) => modules[key].default);
}

const frameUrls = extractSortedUrls(frameModules);

// Playback: ~28fps ≈ 36ms per frame
const FRAME_INTERVAL_MS = 36;

// How many tail frames to loop (last 15)
const LOOP_TAIL = 50;

export default function LoginAnimation() {
  const canvasRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const animRef = useRef({
    frames: [],
    frameIndex: 0,
    lastTime: 0,
    rafId: null,
    cancelled: false,
    phase: "intro", // "intro" → play all once, then "loop"
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
    s.phase = "intro";
    if (s.rafId) cancelAnimationFrame(s.rafId);

    let isMounted = true;

    async function initFrames() {
      if (s.frames.length !== frameUrls.length) {
        const loadedImages = await Promise.all(
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
        if (!isMounted) return;
        s.frames = loadedImages.filter(Boolean);
      }

      setIsLoaded(true);

      if (s.frames[0]) {
        drawFrame(s.frames[0]);
      }

      const loopStart = Math.max(0, s.frames.length - LOOP_TAIL);

      function step(now) {
        if (s.cancelled) return;

        if (!s.lastTime) s.lastTime = now;
        const delta = now - s.lastTime;

        if (delta >= FRAME_INTERVAL_MS) {
          s.lastTime = now - (delta % FRAME_INTERVAL_MS);

          if (s.phase === "intro") {
            if (s.frameIndex < s.frames.length - 1) {
              s.frameIndex++;
            } else {
              // Finished intro → start looping
              s.phase = "loop";
              s.frameIndex = loopStart;
            }
          } else {
            // Loop phase: cycle through last N frames
            s.frameIndex++;
            if (s.frameIndex >= s.frames.length) {
              s.frameIndex = loopStart;
            }
          }

          drawFrame(s.frames[s.frameIndex]);
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
    <div className="relative w-full h-full overflow-hidden">
      {/* Loading spinner while frames decode */}
      {!isLoaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#e8d4e8]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        </div>
      )}

      {/* Animation canvas — fills entire left area */}
      <canvas
        ref={canvasRef}
        width={1280}
        height={720}
        className="w-full h-full object-cover transition-opacity duration-700"
        style={{ opacity: isLoaded ? 1 : 0 }}
      />

      {/* Soft right-edge gradient that bleeds into the login card */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, transparent 55%, rgba(255,255,255,0.35) 80%, rgba(255,255,255,0.92) 100%)",
        }}
      />

      {/* Subtle bottom-edge warmth */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(255,255,255,0.15) 0%, transparent 30%)",
        }}
      />
    </div>
  );
}
