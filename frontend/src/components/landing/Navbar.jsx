import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Menu, X, Sparkles, LayoutDashboard } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const NAV_LINKS = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Interview Types", href: "#interview-types" },
  { label: "Product", href: "#preview" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#EDF3F8]/85 backdrop-blur-md py-3 border-b border-slate-900/[0.06] shadow-[0_4px_20px_-4px_rgba(5,4,25,0.03)]"
            : "bg-transparent py-5"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo & Wordmark */}
          <Link to="/" className="group flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#050419] text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
              <span className="font-display text-sm font-black tracking-tight text-white">IQ</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-display text-[17px] font-extrabold tracking-tight text-[#050419]">
                InterviewIQ
              </span>
              <span className="rounded-full bg-[#0F32DC]/10 px-1.5 py-0.5 text-[9px] font-bold text-[#0F32DC] tracking-wider uppercase">
                AI
              </span>
            </div>
          </Link>

          {/* Desktop Center Navigation Links */}
          <nav className="hidden items-center gap-1 rounded-full border border-slate-900/[0.07] bg-white/70 px-4 py-1.5 backdrop-blur-md shadow-xs md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-full px-3.5 py-1 text-xs font-semibold text-slate-600 transition-colors hover:text-[#050419] hover:bg-slate-100/70"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Right Action CTAs */}
          <div className="hidden items-center gap-2.5 sm:flex">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-900/[0.08] bg-white/80 px-4 py-2 text-xs font-semibold text-[#050419] backdrop-blur-sm transition-all hover:bg-white hover:border-slate-900/20 shadow-xs"
                >
                  <LayoutDashboard className="h-3.5 w-3.5 text-slate-500" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/interview/setup"
                  className="group inline-flex items-center gap-1.5 rounded-full bg-[#050419] px-4.5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#15172b] hover:shadow-md active:scale-95"
                >
                  <span>Start Interview</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-full px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:text-[#050419]"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="rounded-full border border-slate-900/[0.08] bg-white/80 px-4 py-2 text-xs font-semibold text-[#050419] backdrop-blur-sm transition-all hover:bg-white hover:border-slate-900/20 shadow-xs"
                >
                  Sign Up
                </Link>
                <Link
                  to="/interview/setup"
                  className="group inline-flex items-center gap-1.5 rounded-full bg-[#050419] px-4.5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#15172b] hover:shadow-md active:scale-95"
                >
                  <span>Start Interview</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-900/[0.08] bg-white/80 text-slate-700 md:hidden"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-4 top-20 z-40 rounded-2xl border border-slate-900/[0.08] bg-white/95 p-5 shadow-2xl backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#050419]"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-2 h-px w-full bg-slate-100" />
              <div className="flex flex-col gap-2 pt-2">
                {user ? (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 rounded-full border border-slate-900/10 py-2.5 text-xs font-semibold text-[#050419]"
                    >
                      <LayoutDashboard className="h-3.5 w-3.5" />
                      Dashboard
                    </Link>
                    <Link
                      to="/interview/setup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-1.5 rounded-full bg-[#050419] py-2.5 text-xs font-semibold text-white"
                    >
                      <span>Start Interview</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center rounded-full border border-slate-900/10 py-2 text-xs font-semibold text-slate-800"
                      >
                        Log In
                      </Link>
                      <Link
                        to="/signup"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center rounded-full bg-slate-100 py-2 text-xs font-semibold text-[#050419]"
                      >
                        Sign Up
                      </Link>
                    </div>
                    <Link
                      to="/interview/setup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-1.5 rounded-full bg-[#050419] py-2.5 text-xs font-semibold text-white"
                    >
                      <span>Start Interview</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
