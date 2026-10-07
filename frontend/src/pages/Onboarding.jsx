import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { profileService, resumeService } from "../services";
import { getApiErrorMessage } from "../services/api";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { Spinner } from "../components/ui/Primitives";
import AvatarPicker from "../components/ui/AvatarPicker";
import { getAvatar, setAvatar } from "../utils/avatar";

const EXPERIENCE_OPTIONS = [
  { value: "fresher", label: "Fresher" },
  { value: "0-2", label: "0-2 years" },
  { value: "2-5", label: "2-5 years" },
  { value: "5+", label: "5+ years" },
];

const STEPS = ["welcome", "avatar", "profile", "skills", "resume", "ready"];

export default function Onboarding() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [stepIdx, setStepIdx] = useState(0);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [avatarChoice, setAvatarChoice] = useState(getAvatar());

  const [profile, setProfile] = useState({ education: "", experience_level: "fresher", skills: "" });

  const step = STEPS[stepIdx];
  const goNext = () => setStepIdx((i) => Math.min(i + 1, STEPS.length - 1));
  const goBack = () => setStepIdx((i) => Math.max(i - 1, 0));

  const chooseAvatar = (type) => {
    setAvatarChoice(type);
    setAvatar(type);
  };

  const saveProfile = async () => {
    setSaving(true);
    setError("");
    try {
      await profileService.update({
        education: profile.education,
        experience_level: profile.experience_level,
        skills: profile.skills.split(",").map((s) => s.trim()).filter(Boolean),
      });
      goNext();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    setError("");
    try {
      await resumeService.upload(file);
      setResumeUploaded(true);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not process this resume."));
    } finally {
      setSaving(false);
    }
  };

  const finish = async () => {
    setSaving(true);
    try {
      await profileService.completeOnboarding();
      await refreshUser();
      navigate("/dashboard");
    } catch {
      navigate("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 flex gap-1.5">
          {STEPS.map((s, idx) => (
            <span key={s} className={`well h-1.5 flex-1 rounded-full ${idx <= stepIdx ? "bg-gradient-to-r from-emerald to-orange" : ""}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.3 }} className="card p-8">
            {step === "welcome" && (
              <>
                <h1 className="font-display text-[24px] font-semibold text-ink">Welcome, {user?.full_name?.split(" ")[0]}.</h1>
                <p className="mt-2.5 text-[14.5px] leading-relaxed text-ink-soft">
                  Let's set up your profile so your practice interviews feel personal. Every step is optional.
                </p>
                <Button onClick={goNext} className="mt-8">Get started <ArrowRight className="h-4 w-4" /></Button>
              </>
            )}

            {step === "avatar" && (
              <>
                <h1 className="font-display text-xl font-semibold text-ink">Choose your avatar</h1>
                <p className="mt-1.5 text-sm text-ink-soft">Just for you — shown in your dashboard and sidebar.</p>
                <div className="mt-6">
                  <AvatarPicker value={avatarChoice} onChange={chooseAvatar} />
                </div>
                <div className="mt-9 flex justify-between">
                  <Button variant="ghost" onClick={goBack}>Back</Button>
                  <Button onClick={goNext}>Continue</Button>
                </div>
              </>
            )}

            {step === "profile" && (
              <>
                <h1 className="font-display text-xl font-semibold text-ink">Education & experience</h1>
                <div className="mt-6 flex flex-col gap-5">
                  <Input label="Education" placeholder="e.g. B.Tech Computer Science" value={profile.education} onChange={(e) => setProfile({ ...profile, education: e.target.value })} />
                  <div>
                    <label className="text-[13px] font-medium text-ink-soft">Experience level</label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {EXPERIENCE_OPTIONS.map((opt) => (
                        <button key={opt.value} type="button" onClick={() => setProfile({ ...profile, experience_level: opt.value })}
                          className={`rounded-xl px-3 py-2.5 text-sm transition-all ${profile.experience_level === opt.value ? "well text-ink font-medium" : "card-soft text-ink-soft"}`}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
                <div className="mt-9 flex justify-between">
                  <Button variant="ghost" onClick={goBack}>Back</Button>
                  <Button onClick={goNext}>Continue</Button>
                </div>
              </>
            )}

            {step === "skills" && (
              <>
                <h1 className="font-display text-xl font-semibold text-ink">Your skills</h1>
                <p className="mt-1.5 text-sm text-ink-soft">Comma-separated. Used to personalize your questions.</p>
                <div className="mt-6">
                  <Input placeholder="e.g. Python, React, SQL" value={profile.skills} onChange={(e) => setProfile({ ...profile, skills: e.target.value })} />
                </div>
                {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
                <div className="mt-9 flex justify-between">
                  <Button variant="ghost" onClick={goBack}>Back</Button>
                  <Button onClick={saveProfile} disabled={saving}>{saving ? <Spinner /> : "Continue"}</Button>
                </div>
              </>
            )}

            {step === "resume" && (
              <>
                <h1 className="font-display text-xl font-semibold text-ink">Upload your resume</h1>
                <p className="mt-1.5 text-sm text-ink-soft">Optional. PDF or DOCX.</p>
                <label className="well mt-6 flex cursor-pointer flex-col items-center gap-2 px-6 py-10 text-center">
                  <Upload className="h-5 w-5 text-ink-faint" />
                  <span className="text-sm text-ink-soft">{resumeUploaded ? "Resume uploaded" : "Click to upload PDF or DOCX"}</span>
                  <input type="file" accept=".pdf,.docx" className="hidden" onChange={handleResumeUpload} />
                </label>
                {resumeUploaded && <p className="mt-3 flex items-center gap-1.5 text-sm text-success"><CheckCircle2 className="h-4 w-4" /> Resume parsed successfully.</p>}
                {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
                <div className="mt-9 flex justify-between">
                  <Button variant="ghost" onClick={goBack}>Back</Button>
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={goNext}>Skip</Button>
                    <Button onClick={goNext} disabled={saving}>Continue</Button>
                  </div>
                </div>
              </>
            )}

            {step === "ready" && (
              <>
                <CheckCircle2 className="h-9 w-9 text-success" strokeWidth={1.5} />
                <h1 className="mt-4 font-display text-2xl font-semibold text-ink">You're all set.</h1>
                <p className="mt-2 text-sm text-ink-soft">Head to your dashboard and start your first practice interview.</p>
                <Button onClick={finish} disabled={saving} className="mt-8">{saving ? <Spinner /> : "Go to dashboard"}</Button>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
