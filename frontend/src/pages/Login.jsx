import { useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";
import { getApiErrorMessage } from "../services/api";
import { Spinner } from "../components/ui/Primitives";
import LoginAnimation from "../components/auth/LoginAnimation";
import GoogleIcon from "../components/ui/GoogleIcon";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const oauthError = new URLSearchParams(location.search).get("error");

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // --- 3D Interactive Card Physics ---
  const cardRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 220, mass: 0.5 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), springConfig);

  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const normX = (e.clientX - rect.left) / rect.width - 0.5;
    const normY = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(normX);
    mouseY.set(normY);
    setGlare({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
      opacity: 0.3,
    });
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
      const user = await login(form);
      navigate(user.onboarding_complete ? "/dashboard" : "/onboarding");
    } catch (err) {
      setError(getApiErrorMessage(err, "Invalid email or password."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen max-h-screen overflow-hidden flex flex-col lg:flex-row select-none"
         style={{ background: "linear-gradient(135deg, #efe4ef 0%, #f4eef4 40%, #ffffff 100%)" }}>

      {/* ─── Left: Continuous Animation ─── */}
      <div className="relative flex-1 lg:w-[55%] h-[40vh] lg:h-full overflow-hidden">
        <LoginAnimation />

        {/* Motivational floating badge — sits above the animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.7 }}
          className="absolute bottom-8 left-8 z-10 hidden lg:flex flex-col gap-2 max-w-xs"
        >
          <div className="inline-flex items-center gap-1.5 self-start rounded-full bg-white/70 backdrop-blur-xl border border-white/80 px-3.5 py-1.5 shadow-lg shadow-emerald-500/8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-800">
              AI Interview Coach
            </span>
          </div>

          <p className="text-sm font-semibold text-slate-700/90 leading-relaxed pl-0.5 drop-shadow-sm">
            Practice smarter. Interview with confidence. Land your dream role.
          </p>
        </motion.div>
      </div>

      {/* ─── Right: 3D Login Card ─── */}
      <div
        className="relative lg:w-[45%] h-full flex items-center justify-center p-4 sm:p-6 lg:p-10 z-20 overflow-hidden"
        style={{ perspective: 1200 }}
      >
        {/* Ambient glow behind card */}
        <div className="pointer-events-none absolute h-80 w-80 rounded-full bg-gradient-to-tr from-emerald-400/15 via-amber-300/10 to-orange-400/8 blur-3xl" />

        {/* 3D Interactive Card */}
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
              "0 4px 6px -1px rgba(0,0,0,0.06), 0 25px 50px -12px rgba(15,23,42,0.18), 0 40px 80px -15px rgba(15,122,87,0.12), inset 0 1px 1px 0 rgba(255,255,255,0.95), inset 0 -2px 4px 0 rgba(0,0,0,0.03)",
          }}
          className="relative w-full max-w-[420px] rounded-[30px] border border-white/80 bg-white/95 backdrop-blur-3xl p-7 sm:p-9"
        >
          {/* Specular glare */}
          <div
            className="pointer-events-none absolute inset-0 rounded-[30px] transition-opacity duration-300 z-30"
            style={{
              opacity: glare.opacity,
              background: `radial-gradient(circle 320px at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.75) 0%, transparent 70%)`,
            }}
          />

          {/* Logo + badge */}
          <div className="flex items-center justify-between" style={{ transform: "translateZ(28px)" }}>
            <Link to="/" className="font-display text-lg font-black tracking-tight text-slate-900 flex items-center gap-1.5">
              <span>Interview<span className="text-emerald-600">IQ</span></span>
            </Link>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 shadow-sm">
              <Sparkles className="h-3 w-3 text-emerald-600" />
              AI Powered
            </span>
          </div>

          {/* Header */}
          <div style={{ transform: "translateZ(22px)" }} className="mt-5 sm:mt-6">
            <h1 className="font-display text-2xl sm:text-[26px] font-black tracking-tight text-slate-900">
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-slate-500 font-medium">
              Log in to continue practicing.
            </p>
          </div>

          {oauthError && (
            <div className="mt-3 rounded-xl bg-red-50 border border-red-200/80 px-3 py-2 text-xs text-red-600 font-medium"
                 style={{ transform: "translateZ(16px)" }}>
              Google sign-in failed. Please try again or use email/password.
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={onSubmit}
            className="mt-5 sm:mt-6 flex flex-col gap-3.5"
            style={{ transform: "translateZ(16px)" }}
          >
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                required
                placeholder="name@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-slate-200/90 bg-slate-50/70 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all shadow-[inset_0_2px_4px_rgba(15,23,42,0.04)] focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-xl border border-slate-200/90 bg-slate-50/70 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all shadow-[inset_0_2px_4px_rgba(15,23,42,0.04)] focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 p-2 text-xs text-red-600 border border-red-200/80 font-medium">
                {error}
              </div>
            )}

            {/* CTA Button */}
            <button
              type="submit"
              disabled={loading}
              style={{ transform: "translateZ(34px)" }}
              className="mt-1 w-full rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 py-2.5 text-sm font-bold text-white shadow-[0_4px_0_0_#064e3b,0_12px_24px_-4px_rgba(15,122,87,0.45)] hover:shadow-[0_5px_0_0_#064e3b,0_16px_28px_-4px_rgba(15,122,87,0.5)] hover:translate-y-[-1px] active:translate-y-[2px] active:shadow-[0_2px_0_0_#064e3b] transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Spinner />
                </div>
              ) : (
                <span className="inline-flex items-center justify-center gap-1.5">
                  Log in <ArrowRight className="h-3.5 w-3.5" />
                </span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div
            className="my-4 flex items-center gap-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider"
            style={{ transform: "translateZ(14px)" }}
          >
            <span className="h-px flex-1 bg-slate-200" /> or <span className="h-px flex-1 bg-slate-200" />
          </div>

          {/* Google */}
          <a
            href={authService.googleLoginUrl()}
            style={{ transform: "translateZ(20px)" }}
            className="flex items-center justify-center gap-2.5 w-full rounded-xl border border-slate-200/90 bg-white py-2.5 text-sm font-semibold text-slate-700 shadow-[0_2px_0_0_#e2e8f0,0_6px_14px_-3px_rgba(0,0,0,0.05)] hover:bg-slate-50 hover:border-slate-300 active:translate-y-[1px] active:shadow-[0_1px_0_0_#e2e8f0] transition-all"
          >
            <GoogleIcon className="h-4 w-4 shrink-0" />
            <span>Continue with Google</span>
          </a>

          {/* Footer */}
          <p
            className="mt-5 text-center text-xs text-slate-500 font-medium"
            style={{ transform: "translateZ(16px)" }}
          >
            New here?{" "}
            <Link to="/signup" className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline">
              Create an account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
