import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  PlayCircle,
  History,
  User,
  Settings,
  LogOut,
  Plus,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/ui/Avatar";
import { getAvatar } from "../utils/avatar";
import NotificationBell from "../components/notifications/NotificationBell";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/interview/setup", label: "Practice", icon: PlayCircle },
  { to: "/history", label: "History", icon: History },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [avatar, setAvatarState] = useState(getAvatar());

  useEffect(() => {
    const onFocus = () => setAvatarState(getAvatar());
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const onLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#f3f4f8] text-slate-900 antialiased">
      {/* Outer wrapper with subtle padding on desktop */}
      <div className="mx-auto max-w-[1440px] px-3 py-3 sm:px-6 sm:py-5">
        {/* Main SaaS Frame Container */}
        <div className="min-h-[calc(100vh-2rem)] rounded-[32px] border border-slate-200/80 bg-white/95 p-4 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.06)] backdrop-blur-md sm:p-7">
          
          {/* Top Navigation Bar inspired by reference */}
          <header className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-center lg:justify-between">
            {/* Logo & Tagline */}
            <div className="flex items-center justify-between">
              <NavLink to="/dashboard" className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 text-white shadow-md shadow-indigo-600/20">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-display text-lg font-extrabold tracking-tight text-slate-900">
                      InterviewIQ
                    </span>
                    <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                      AI
                    </span>
                  </div>
                  <p className="hidden text-[11px] font-medium text-slate-400 sm:block">
                    Practice Interviews. Build Confidence.
                  </p>
                </div>
              </NavLink>

              {/* Mobile Quick Action */}
              <div className="flex items-center gap-2 lg:hidden">
                <button
                  type="button"
                  onClick={() => navigate("/interview/setup")}
                  className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>New</span>
                </button>
              </div>
            </div>

            {/* Center: Pill Navigation */}
            <nav className="flex items-center justify-start overflow-x-auto py-1 scrollbar-none sm:justify-center">
              <div className="inline-flex items-center gap-1 rounded-full border border-slate-200/80 bg-slate-100/70 p-1 shadow-inner">
                {NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-150 ${
                        isActive
                          ? "bg-slate-900 text-white shadow-sm"
                          : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                      }`
                    }
                  >
                    <item.icon className="h-3.5 w-3.5" strokeWidth={2} />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </nav>

            {/* Right: Quick CTA, Notifications, Profile */}
            <div className="hidden items-center gap-3 lg:flex">
              <button
                type="button"
                onClick={() => navigate("/interview/setup")}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:brightness-105 active:scale-[0.98] transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New Interview</span>
              </button>

              {/* Dynamic Notification Bell */}
              <NotificationBell />

              {/* User Avatar & Logout */}
              <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/70 bg-slate-50/60 p-1.5 pl-2">
                <Avatar type={avatar} size={28} />
                <span className="truncate max-w-[100px] text-xs font-semibold text-slate-800">
                  {user?.full_name?.split(" ")[0] || "Candidate"}
                </span>
                <button
                  type="button"
                  onClick={onLogout}
                  aria-label="Log out"
                  title="Log out"
                  className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-white hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="mt-6 overflow-hidden">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-2xl border border-slate-200 bg-white/95 px-3 py-2.5 shadow-xl backdrop-blur-md lg:hidden">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-xl px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                isActive ? "text-indigo-600" : "text-slate-500 hover:text-slate-900"
              }`
            }
          >
            <item.icon className="h-4 w-4" strokeWidth={2} />
            <span>{item.label}</span>
          </NavLink>
        ))}
        <button
          type="button"
          onClick={onLogout}
          className="flex flex-col items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-slate-400 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" strokeWidth={2} />
          <span>Exit</span>
        </button>
      </nav>
    </div>
  );
}
