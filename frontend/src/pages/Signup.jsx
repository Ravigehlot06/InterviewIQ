import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";
import { getApiErrorMessage } from "../services/api";
import { Spinner } from "../components/ui/Primitives";
import SignupAnimation from "../components/auth/SignupAnimation";
import GoogleIcon from "../components/ui/GoogleIcon";

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // --- 3D Interactive Card Physics ---
  const cardRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 220, mass: 0.5 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [9, -9]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-9, 9]), springConfig);

  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const normX = (e.clientX - rect.left) / width - 0.5;
    const normY = (e.clientY - rect.top) / height - 0.5;

    mouseX.set(normX);
    mouseY.set(normY);

    const glareX = ((e.clientX - rect.left) / width) * 100;
    const glareY = ((e.clientY - rect.top) / height) * 100;
    setGlare({ x: glareX, y: glareY, opacity: 0.35 });
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/onboarding");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not create your account."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen max-h-screen overflow-hidden bg-slate-950 flex flex-col lg:flex-row select-none">
      {/* Left Column: Background Welcoming Animation with Motivating Line from Top to Bottom */}
      <div className="relative flex-1 lg:w-[58%] h-full overflow-hidden">
        <SignupAnimation />
      </div>

      {/* Right Column: High-Detail 3D Signup Card (Fixed viewport, zero scrolling) */}
      <div
        className="relative lg:w-[42%] h-full flex items-center justify-center p-4 sm:p-6 lg:p-10 bg-slate-950/80 backdrop-blur-2xl border-l border-white/10 z-20 overflow-hidden"
        style={{ perspective: 1200 }}
      >
        {/* Subtle Ambient Backlight Glow behind Card */}
        <div className="pointer-events-none absolute h-96 w-96 rounded-full bg-gradient-to-tr from-indigo-600/30 via-violet-600/20 to-pink-500/10 blur-3xl" />

        {/* 3D Physical Card */}
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 25px 50px -12px rgba(15, 23, 42, 0.25), 0 40px 80px -15px rgba(79, 70, 229, 0.22), inset 0 1px 1px 0 rgba(255, 255, 255, 0.95), inset 0 -2px 4px 0 rgba(0, 0, 0, 0.04)",
          }}
          className="relative w-full max-w-[420px] rounded-[30px] border border-white/80 bg-white/95 p-6 sm:p-8 backdrop-blur-3xl"
        >
          {/* Dynamic 3D Specular Light Glare */}
          <div
            className="pointer-events-none absolute inset-0 rounded-[30px] transition-opacity duration-300 z-30"
            style={{
              opacity: glare.opacity,
              background: `radial-gradient(circle 320px at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, 0.75) 0%, transparent 70%)`,
            }}
          />

          {/* Top Logo & AI Badge (Floating in 3D) */}
          <div
            className="flex items-center justify-between"
            style={{ transform: "translateZ(28px)" }}
          >
            <Link to="/" className="font-display text-lg font-black tracking-tight text-slate-900 flex items-center gap-1.5">
              <span>Interview<span className="text-indigo-600">IQ</span></span>
            </Link>
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700 shadow-sm">
              <Sparkles className="h-3 w-3 text-indigo-600" />
              AI Powered
            </span>
          </div>

          {/* Header Title (Floating in 3D) */}
          <div style={{ transform: "translateZ(22px)" }} className="mt-4 sm:mt-5">
            <h2 className="font-display text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              Create your account
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
              Start practice interviews with AI in seconds.
            </p>
          </div>

          {/* Signup Form (Floating in 3D) */}
          <form
            onSubmit={onSubmit}
            className="mt-4 sm:mt-5 flex flex-col gap-3 sm:gap-3.5"
            style={{ transform: "translateZ(16px)" }}
          >
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full name
              </label>
              <input
                type="text"
                name="full_name"
                required
                placeholder="e.g. Alex Chen"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="w-full rounded-xl border border-slate-200/90 bg-slate-50/70 px-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all shadow-[inset_0_2px_4px_rgba(15,23,42,0.04)] focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="name@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-slate-200/90 bg-slate-50/70 px-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all shadow-[inset_0_2px_4px_rgba(15,23,42,0.04)] focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                minLength={8}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-xl border border-slate-200/90 bg-slate-50/70 px-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all shadow-[inset_0_2px_4px_rgba(15,23,42,0.04)] focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
              />
              <p className="mt-1 text-[10px] text-slate-400 font-medium">8+ characters required</p>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 p-2 text-xs text-red-600 border border-red-200/80 font-medium">
                {error}
              </div>
            )}

            {/* 3D Tactile Push Button */}
            <button
              type="submit"
              disabled={loading}
              style={{ transform: "translateZ(34px)" }}
              className="mt-1 w-full rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 py-2.5 text-xs sm:text-sm font-bold text-white shadow-[0_4px_0_0_#3730a3,0_12px_24px_-4px_rgba(79,70,229,0.45)] hover:shadow-[0_5px_0_0_#3730a3,0_16px_28px_-4px_rgba(79,70,229,0.5)] hover:translate-y-[-1px] active:translate-y-[2px] active:shadow-[0_2px_0_0_#3730a3] transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Spinner />
                </div>
              ) : (
                <span className="inline-flex items-center justify-center gap-1.5">
                  Create account <ArrowRight className="h-3.5 w-3.5" />
                </span>
              )}
            </button>
          </form>

          {/* Divider (Floating in 3D) */}
          <div
            className="my-3.5 flex items-center gap-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider"
            style={{ transform: "translateZ(14px)" }}
          >
            <span className="h-px flex-1 bg-slate-200" /> or <span className="h-px flex-1 bg-slate-200" />
          </div>

          {/* Google Button (Floating in 3D) */}
          <a
            href={authService.googleLoginUrl()}
            style={{ transform: "translateZ(20px)" }}
            className="flex items-center justify-center gap-2.5 w-full rounded-xl border border-slate-200/90 bg-white py-2.5 text-xs sm:text-sm font-semibold text-slate-700 shadow-[0_2px_0_0_#e2e8f0,0_6px_14px_-3px_rgba(0,0,0,0.05)] hover:bg-slate-50 hover:border-slate-300 active:translate-y-[1px] active:shadow-[0_1px_0_0_#e2e8f0] transition-all"
          >
            <GoogleIcon className="h-4 w-4 shrink-0" />
            <span>Continue with Google</span>
          </a>

          {/* Footer (Floating in 3D) */}
          <p
            className="mt-4 text-center text-xs text-slate-500 font-medium"
            style={{ transform: "translateZ(16px)" }}
          >
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline">
              Log in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
