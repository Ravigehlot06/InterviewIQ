import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-900/[0.08] bg-white/70 py-16 sm:py-20 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          {/* Left Column (5 cols): Brand Info & Mission */}
          <div className="md:col-span-5 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#050419] text-white shadow-sm">
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

            <p className="max-w-sm text-xs sm:text-sm leading-relaxed text-slate-500 font-normal">
              Practice interviews. Build confidence. Get interview-ready.
              An AI-powered mock interview platform delivering realistic simulations, adaptive
              follow-ups, and actionable performance insights.
            </p>

            <div className="pt-2 text-xs text-slate-400">
              © {new Date().getFullYear()} InterviewIQ, Inc. All rights reserved.
            </div>
          </div>

          {/* Right Columns (7 cols): Nav Links */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* Product Navigation */}
            <div>
              <h4 className="font-display text-xs font-bold uppercase tracking-wider text-[#050419] mb-4">
                Platform
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-[13px] text-slate-600">
                <li>
                  <a href="#how-it-works" className="hover:text-[#0F32DC] transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-[#0F32DC] transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#interview-types" className="hover:text-[#0F32DC] transition-colors">
                    Interview Types
                  </a>
                </li>
                <li>
                  <a href="#preview" className="hover:text-[#0F32DC] transition-colors">
                    Interactive Preview
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-[#0F32DC] transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Quick Actions */}
            <div>
              <h4 className="font-display text-xs font-bold uppercase tracking-wider text-[#050419] mb-4">
                Account
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-[13px] text-slate-600">
                <li>
                  <Link to="/login" className="hover:text-[#0F32DC] transition-colors">
                    Candidate Login
                  </Link>
                </li>
                <li>
                  <Link to="/signup" className="hover:text-[#0F32DC] transition-colors">
                    Create Account
                  </Link>
                </li>
                <li>
                  <Link to="/interview/setup" className="hover:text-[#0F32DC] transition-colors">
                    Start Mock Session
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="hover:text-[#0F32DC] transition-colors">
                    Candidate Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal / Notes */}
            <div className="col-span-2 sm:col-span-1">
              <h4 className="font-display text-xs font-bold uppercase tracking-wider text-[#050419] mb-4">
                Standards
              </h4>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Company simulation modes are independent educational exercises. Not affiliated with
                or endorsed by any named corporate entity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
