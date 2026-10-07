import { useEffect, useState, useRef, useCallback } from "react";
import { Upload, Trash2, User, Book, Zap, Briefcase, FileText, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { profileService, resumeService } from "../services";
import { getApiErrorMessage } from "../services/api";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { Spinner } from "../components/ui/Primitives";
import { getAvatar } from "../utils/avatar";

// Import all wave frames (212 frames, plays once)
const waveFrameModules = import.meta.glob('../assets/wave/ezgif-frame-*.jpg', { eager: true });
// Import all normal frames (29 frames, loops continuously)
const normalFrameModules = import.meta.glob('../assets/normal/ezgif-frame-*.jpg', { eager: true });

// Sort and extract URLs from the glob results
function extractSortedUrls(modules) {
  return Object.keys(modules)
    .sort()
    .map((key) => modules[key].default);
}

const waveUrls = extractSortedUrls(waveFrameModules);
const normalUrls = extractSortedUrls(normalFrameModules);

// Target playback speed: ~12 fps → ~83ms per frame
const FRAME_INTERVAL_MS = 83;

function AvatarAnimator() {
  const canvasRef = useRef(null);
  // Use a ref object that persists across renders AND is reset on unmount
  const animRef = useRef({
    phase: 'loading',
    frameIndex: 0,
    lastFrameTime: 0,
    rafId: null,
    waveFrames: [],   // HTMLImageElement[]
    normalFrames: [], // HTMLImageElement[]
    cancelled: false,
  });

  const drawFrame = useCallback((img) => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    const s = animRef.current;
    // Reset all state for this mount so wave always plays fresh
    s.phase = 'loading';
    s.frameIndex = 0;
    s.lastFrameTime = 0;
    s.rafId = null;
    s.cancelled = false;

    function loadImage(url) {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(img);
        img.src = url;
      });
    }

    function tick(timestamp) {
      if (s.cancelled) return;
      if (s.phase !== 'loading' && timestamp - s.lastFrameTime >= FRAME_INTERVAL_MS) {
        s.lastFrameTime = timestamp;

        if (s.phase === 'wave') {
          const frame = s.waveFrames[s.frameIndex];
          if (frame) drawFrame(frame);
          s.frameIndex++;
          if (s.frameIndex >= s.waveFrames.length) {
            // Wave complete — seamlessly transition to normal
            s.phase = 'normal';
            s.frameIndex = 0;
            if (s.normalFrames[0]) drawFrame(s.normalFrames[0]);
            s.frameIndex = 1;
          }
        } else if (s.phase === 'normal') {
          const frame = s.normalFrames[s.frameIndex];
          if (frame) drawFrame(frame);
          s.frameIndex = (s.frameIndex + 1) % s.normalFrames.length;
        }
      }
      s.rafId = requestAnimationFrame(tick);
    }

    async function init() {
      // Load both sets in parallel
      const [waveFrames, normalFrames] = await Promise.all([
        Promise.all(waveUrls.map(loadImage)),
        Promise.all(normalUrls.map(loadImage)),
      ]);

      // If component unmounted while loading, bail out
      if (s.cancelled) return;

      s.waveFrames = waveFrames;
      s.normalFrames = normalFrames;

      // Always start with wave — plays once per Profile page visit
      s.phase = 'wave';
      s.frameIndex = 0;

      // Paint first wave frame instantly so canvas is never blank
      if (waveFrames[0]) {
        drawFrame(waveFrames[0]);
        s.frameIndex = 1;
      }

      s.rafId = requestAnimationFrame(tick);
    }

    init();

    return () => {
      // Mark as cancelled so the async init doesn't start a new loop
      s.cancelled = true;
      if (s.rafId) cancelAnimationFrame(s.rafId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once per mount — drawFrame is stable so no deps needed

  return (
    <canvas
      ref={canvasRef}
      width={560}
      height={620}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
}

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md rounded-[28px] shadow-2xl p-6 relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-5 right-5 text-ink-faint hover:text-ink transition-colors">
          <X className="w-5 h-5" />
        </button>
        <h3 className="font-display text-xl font-bold mb-6 pr-8">{title}</h3>
        {children}
      </div>
    </div>
  );
}

function FloatingButton({ icon: Icon, label, angle, radius, colorClass, iconColor, onClick }) {
  // angle in degrees (0 is right, 90 is bottom)
  const rad = (angle * Math.PI) / 180;
  const x = Math.round(radius * Math.cos(rad));
  const y = Math.round(radius * Math.sin(rad));
  
  return (
    <div 
      className="absolute flex flex-col items-center gap-3 cursor-pointer group z-20"
      style={{
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        transform: 'translate(-50%, -50%)'
      }}
      onClick={onClick}
    >
      <div className={`w-[72px] h-[72px] rounded-[24px] flex items-center justify-center shadow-xl hover:scale-110 transition-transform duration-300 border border-white/40 ${colorClass}`}>
        <Icon className={`w-7 h-7 ${iconColor}`} />
      </div>
      <span className="text-[13px] font-semibold text-ink-soft tracking-wide bg-[#f2f4f6]/80 px-3 py-1 rounded-full backdrop-blur-md">{label}</span>
    </div>
  );
}

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [resumes, setResumes] = useState([]);
  
  const [activeModal, setActiveModal] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    fetchData();
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      const p = await profileService.get();
      setProfile({
        education: p.education || "",
        experience_level: p.experience_level || "fresher",
        skills: (p.skills || []).join(", "),
        preferred_roles: (p.preferred_roles || []).join(", "),
        bio: p.bio || "",
        full_name: user?.full_name || "",
      });
      const res = await resumeService.list();
      setResumes(res);
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  };

  const openModal = (type) => {
    setFormData({ ...profile });
    setError("");
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const chooseAvatar = (type) => {
    setAvatarChoice(type);
    setAvatar(type);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await profileService.update({
        full_name: formData.full_name,
        education: formData.education,
        experience_level: formData.experience_level,
        skills: formData.skills.split(",").map((s) => s.trim()).filter(Boolean),
        preferred_roles: formData.preferred_roles.split(",").map((s) => s.trim()).filter(Boolean),
        bio: formData.bio,
      });
      await refreshUser();
      setProfile(formData);
      closeModal();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const uploadResume = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const uploaded = await resumeService.upload(file);
      setResumes((prev) => [uploaded, ...prev]);
    } catch (err) {
      alert(getApiErrorMessage(err, "Could not upload resume."));
    }
  };

  const deleteResume = async (id) => {
    try {
      await resumeService.remove(id);
      setResumes((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert("Failed to delete resume");
    }
  };

  if (!profile) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = profile.full_name.split(' ')[0] || "User";

  return (
    <div
      className="w-full flex items-center justify-center"
      style={{ height: 'calc(100vh - 200px)', maxHeight: 'calc(100vh - 200px)', overflow: 'hidden', minHeight: '520px' }}
    >
      <div className="w-full h-full max-w-[1200px] bg-gradient-to-b from-[#f5f7f9] to-[#eaedf1] rounded-[40px] overflow-hidden relative shadow-2xl border border-white/60 flex flex-col items-center justify-center mx-auto">

      {/* Top Status Bar */}
      <div className="absolute top-6 left-10 flex items-center gap-2 z-30">
        <span className="text-ink font-semibold">{greeting}</span>
        <span className="text-ink-soft">{currentDate}</span>
      </div>

      <div className="absolute top-6 right-10 flex items-center gap-4 text-ink-soft font-semibold z-30">
        <span>{currentTime}</span>
        <span>22°</span>
      </div>

      {/* Main Circular Layout */}
      <div className="relative w-full max-w-[860px] flex items-center justify-center" style={{ height: '520px' }}>

        {/* Central Black Circle Background */}
        <div className="absolute w-[420px] h-[420px] bg-[#141517] rounded-full z-0 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.35)]"></div>

        {/* Animated Avatar — clipped to circle, same size */}
        <div
          className="z-10 absolute pointer-events-none"
          style={{
            width: '520px',
            height: '520px',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            overflow: 'hidden',
          }}
        >
          <AvatarAnimator />
        </div>

        {/* Buttons Placed Around the Circle (Radius = 280) */}
        
        <FloatingButton 
          icon={User} 
          label="Personal" 
          angle={215} 
          radius={280} 
          colorClass="bg-brand-indigo text-white"
          iconColor="text-white"
          onClick={() => openModal('personal')} 
        />
        
        <FloatingButton 
          icon={Book} 
          label="Education" 
          angle={180} 
          radius={280} 
          colorClass="bg-brand-violet text-white"
          iconColor="text-white"
          onClick={() => openModal('education')} 
        />
        
        <FloatingButton 
          icon={Zap} 
          label="Skills" 
          angle={145} 
          radius={280} 
          colorClass="bg-[#1c1d21] text-emerald-400"
          iconColor="text-emerald-400"
          onClick={() => openModal('skills')} 
        />

        {/* Right Side Elements */}
        
        {/* Greeting Text at top right (-30 deg roughly, pushed out a bit more) */}
        <div 
          className="absolute flex flex-col items-start z-20"
          style={{
            left: `calc(50% + 250px)`,
            top: `calc(50% - 120px)`,
            transform: 'translate(0, -50%)'
          }}
        >
          <h1 className="text-[40px] font-display font-bold text-ink tracking-tight mb-1 whitespace-nowrap">Hello, {firstName}</h1>
          <p className="text-sm font-medium text-ink-soft flex items-center gap-2 bg-[#f2f4f6]/80 px-3 py-1 rounded-full backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span> Profile Active
          </p>
        </div>

        <FloatingButton 
          icon={Briefcase} 
          label="Roles" 
          angle={0} 
          radius={280} 
          colorClass="bg-white text-ink"
          iconColor="text-ink"
          onClick={() => openModal('roles')} 
        />
        
        <FloatingButton 
          icon={FileText} 
          label="Resumes" 
          angle={40} 
          radius={280} 
          colorClass="bg-white/70 backdrop-blur-md text-ink"
          iconColor="text-ink"
          onClick={() => openModal('resumes')} 
        />

      </div>

      {/* --- MODALS --- */}

      {/* Edit Personal Info Modal */}
      <Modal isOpen={activeModal === 'personal'} onClose={closeModal} title="Personal Summary">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Input label="Full Name" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} required />
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-bold text-ink">Experience Level</label>
            <select 
              value={formData.experience_level} 
              onChange={(e) => setFormData({...formData, experience_level: e.target.value})}
              className="w-full rounded-xl border border-line bg-card px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-brand-indigo focus:ring-1 focus:ring-brand-indigo"
            >
              <option value="fresher">Fresher</option>
              <option value="junior">Junior (1-3 yrs)</option>
              <option value="mid">Mid-Level (3-6 yrs)</option>
              <option value="senior">Senior (6+ yrs)</option>
            </select>
          </div>
          <Input label="Bio (Optional)" value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} />
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          <Button type="submit" disabled={saving} className="mt-4 w-full">
            {saving ? <Spinner /> : "Save Changes"}
          </Button>
        </form>
      </Modal>

      {/* Edit Education Modal */}
      <Modal isOpen={activeModal === 'education'} onClose={closeModal} title="Education">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Input label="Education Details" value={formData.education} onChange={(e) => setFormData({...formData, education: e.target.value})} placeholder="e.g. B.S. Computer Science, XYZ University" />
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          <Button type="submit" disabled={saving} className="mt-4 w-full">
            {saving ? <Spinner /> : "Save Changes"}
          </Button>
        </form>
      </Modal>

      {/* Edit Roles Modal */}
      <Modal isOpen={activeModal === 'roles'} onClose={closeModal} title="Preferred Roles">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Input label="Roles (comma-separated)" value={formData.preferred_roles} onChange={(e) => setFormData({...formData, preferred_roles: e.target.value})} placeholder="e.g. frontend, backend, fullstack" />
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          <Button type="submit" disabled={saving} className="mt-4 w-full">
            {saving ? <Spinner /> : "Save Changes"}
          </Button>
        </form>
      </Modal>

      {/* Edit Skills Modal */}
      <Modal isOpen={activeModal === 'skills'} onClose={closeModal} title="Skills">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Input label="Skills (comma-separated)" value={formData.skills} onChange={(e) => setFormData({...formData, skills: e.target.value})} placeholder="e.g. React, Node.js, Python" />
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          <Button type="submit" disabled={saving} className="mt-4 w-full">
            {saving ? <Spinner /> : "Save Changes"}
          </Button>
        </form>
      </Modal>
      
      {/* Resumes Modal */}
      <Modal isOpen={activeModal === 'resumes'} onClose={closeModal} title="Resumes">
        <div className="flex flex-col gap-4">
          <label className="cursor-pointer bg-brand-light text-brand-indigo p-4 rounded-2xl hover:bg-brand-indigo hover:text-white transition-colors flex items-center justify-center gap-2 border border-dashed border-brand-indigo/50">
            <Upload className="w-5 h-5" />
            <span className="font-semibold">Upload a new resume</span>
            <input type="file" accept=".pdf,.docx" className="hidden" onChange={uploadResume} />
          </label>
          
          <div className="flex flex-col gap-2 mt-4">
            <h4 className="text-sm font-semibold text-ink-soft mb-2 uppercase tracking-wider">Your Files</h4>
            {resumes.map(r => (
              <div key={r.id} className="flex items-center justify-between p-4 rounded-xl border border-line bg-slate-surface">
                <span className="text-sm font-medium text-ink truncate mr-2">{r.original_filename}</span>
                <button onClick={() => deleteResume(r.id)} className="text-ink-faint hover:text-red-500 p-2 bg-white rounded-lg shadow-sm border border-line">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {resumes.length === 0 && (
              <div className="text-center p-6 text-sm text-ink-faint border border-dashed border-line rounded-xl bg-panel">
                No resumes uploaded
              </div>
            )}
          </div>
        </div>
      </Modal>

    </div>
    </div>
  );
}
