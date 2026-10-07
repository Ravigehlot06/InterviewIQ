import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const NAV_LINKS = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Interview types", href: "#interview-types" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-4 z-50 px-4"
    >
      <nav className={`pill-bar mx-auto flex max-w-5xl items-center justify-between px-3 transition-all duration-300 ${scrolled ? "py-1.5" : "py-2"}`}>
        <Link to="/" className="rounded-full bg-white px-5 py-2 font-display text-[16px] font-extrabold text-ink shadow-sm">
          InterviewIQ
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="text-[14px] font-medium text-ink-soft transition-colors hover:text-ink">
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link to="/login" className="rounded-full px-3 py-2 text-[14px] font-medium text-ink-soft hover:text-ink">Log in</Link>
          <Link to="/signup" className="rounded-full bg-emerald px-5 py-2.5 text-[14px] font-semibold text-white shadow-[0_10px_20px_-10px_rgba(6,78,59,0.6)] transition-transform hover:scale-[1.03]">
            Start interview
          </Link>
        </div>
      </nav>
    </motion.header>
  );
}
