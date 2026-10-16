import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  PhoneOff,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
  Sparkles,
  Paperclip,
} from "lucide-react";
import { interviewService } from "../services";
import { getApiErrorMessage } from "../services/api";

/* ─── helpers ───────────────────────────────────────────────────────────── */
function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

const TIPS = [
  "Use the STAR method: Situation, Task, Action, Result.",
  "Be specific — use metrics and real outcomes when possible.",
  "Structure your response with a clear beginning and conclusion.",
  "Take a breath and outline your key points before answering.",
  "Highlight your problem-solving process and lessons learned.",
];

/* ─── UserCamera (PiP in Corner of Avatar Screen) ────────────────────────── */
function UserCamera({ camOn, micOn }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (camOn) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((stream) => {
          streamRef.current = stream;
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(() => {
          /* camera permission denied or unavailable */
        });
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) videoRef.current.srcObject = null;
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [camOn]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-slate-900 shadow-xl border border-white/20">
      {/* Live video */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className={`h-full w-full object-cover transition-opacity duration-300 ${
          camOn ? "opacity-100" : "opacity-0"
        }`}
        style={{ transform: "scaleX(-1)" }}
      />

      {/* Camera off overlay */}
      {!camOn && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-800 to-slate-900 text-slate-300">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-700/80">
            <User className="h-5 w-5 text-slate-300" />
          </div>
          <span className="text-[11px] font-medium text-slate-400">Camera off</span>
        </div>
      )}

      {/* "You" label tag */}
      <div className="absolute bottom-2 left-2 z-10">
        <span className="flex items-center gap-1.5 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md">
          {!micOn && <MicOff className="h-2.5 w-2.5 text-red-400" />}
          You
        </span>
      </div>

      {/* Mic status dot top-right */}
      <div className="absolute top-2 right-2 z-10">
        <span
          className={`h-2 w-2 rounded-full ring-2 ring-black/40 ${
            micOn ? "bg-emerald-400" : "bg-red-400"
          }`}
        />
      </div>
    </div>
  );
}

/* ─── AIAvatarScreen (Main Large Video Display) ─────────────────────────── */
function AIAvatarScreen({
  isThinking,
  currentQuestion,
  captionsOn,
  camOn,
  micOn,
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-3xl bg-slate-900 shadow-sm border border-slate-200/80">
      {/* ── AVATAR PLACEHOLDER / REALISTIC STREAM ── */}
      {!imgError ? (
        <div className="relative h-full w-full overflow-hidden">
          <img
            src="/interviewer.jpg"
            alt="AI Interviewer"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover object-center transition-transform duration-700 hover:scale-[1.01]"
          />
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />
        </div>
      ) : (
        /* Fallback stylized avatar */
        <div
          className="relative flex h-full w-full items-center justify-center overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #0d1117 0%, #1e293b 50%, #0f172a 100%)",
          }}
        >
          <div className="relative flex flex-col items-center gap-4">
            <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-slate-800 border-2 border-emerald-500/50 shadow-2xl">
              <User className="h-14 w-14 text-emerald-400" />
            </div>
            <p className="font-semibold text-white">AI Interviewer</p>
          </div>
        </div>
      )}

      {/* Top Left Tag: Interviewer Name */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-xl bg-black/50 px-3 py-1.5 backdrop-blur-md border border-white/10">
          <span
            className={`h-2 w-2 rounded-full ${
              isThinking
                ? "bg-amber-400 animate-pulse"
                : "bg-emerald-400 animate-pulse"
            }`}
          />
          <span className="text-xs font-semibold text-white tracking-wide">
            AI Interviewer (InterviewIQ)
          </span>
        </div>
      </div>

      {/* Top Right: Live speech audio waveform */}
      <div className="absolute top-4 right-4 z-10 hidden sm:flex items-center gap-1.5 rounded-xl bg-black/40 px-3 py-1.5 backdrop-blur-md border border-white/10">
        <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
        <span className="text-[11px] font-medium text-slate-200">
          {isThinking ? "Analyzing..." : "Speaking"}
        </span>
        <div className="flex items-end gap-[2px] ml-1">
          {[12, 18, 10, 22, 15].map((h, i) => (
            <motion.span
              key={i}
              className="w-[2px] rounded-full bg-emerald-400"
              animate={{
                height: isThinking ? ["4px", "8px", "4px"] : ["4px", `${h}px`, "4px"],
              }}
              transition={{
                repeat: Infinity,
                duration: 0.6 + i * 0.1,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>

      {/* Subtitles Overlay Bar at Bottom Center */}
      {captionsOn && (
        <div className="absolute bottom-6 left-6 right-6 sm:right-72 z-10 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-black/60 px-5 py-3 text-white backdrop-blur-md border border-white/10 shadow-lg"
          >
            <p className="text-[13px] sm:text-[14px] font-medium leading-relaxed text-slate-100 line-clamp-2">
              {isThinking
                ? "Thinking… Analyzing your answer to formulate the next question."
                : currentQuestion
                ? currentQuestion.question_text
                : "Welcome! Preparing your mock interview session."}
            </p>
          </motion.div>
        </div>
      )}

      {/* USER CAMERA IN BOTTOM CORNER (Picture-in-Picture) */}
      <div className="absolute bottom-4 right-4 z-20 h-32 w-48 sm:h-36 sm:w-56 md:h-40 md:w-60">
        <UserCamera camOn={camOn} micOn={micOn} />
      </div>
      {/* ── END AVATAR SCREEN ── */}
    </div>
  );
}

/* ─── Main InterviewRoom Component ───────────────────────────────────────── */
export default function InterviewRoom() {
  const { id } = useParams();
  const navigate = useNavigate();

  /* ── interview state ── */
  const [interview, setInterview] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [history, setHistory] = useState([]); // List of answered questions + answers
  const [answer, setAnswer] = useState("");
  const [aiThinking, setAiThinking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [answeredCount, setAnsweredCount] = useState(0);

  /* ── call controls ── */
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [captionsOn, setCaptionsOn] = useState(true);
  const [volume, setVolume] = useState(80);
  const [isFullscreen, setIsFullscreen] = useState(false);

  /* ── timer & refs ── */
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);
  const textareaRef = useRef(null);
  const roomContainerRef = useRef(null);
  const chatBottomRef = useRef(null);

  /* ── auto fullscreen on mount ── */
  useEffect(() => {
    const enterFullscreen = () => {
      if (!document.fullscreenElement) {
        document.documentElement
          .requestFullscreen()
          .then(() => setIsFullscreen(true))
          .catch(() => {
            /* Browsers may require user interaction first */
          });
      }
    };

    // Attempt immediately
    enterFullscreen();

    // In case browser policy blocked immediate fullscreen, trigger on first user interaction
    const handleFirstGesture = () => {
      enterFullscreen();
      window.removeEventListener("click", handleFirstGesture);
      window.removeEventListener("keydown", handleFirstGesture);
    };
    window.addEventListener("click", handleFirstGesture);
    window.addEventListener("keydown", handleFirstGesture);

    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);

    return () => {
      window.removeEventListener("click", handleFirstGesture);
      window.removeEventListener("keydown", handleFirstGesture);
      document.removeEventListener("fullscreenchange", onFsChange);
    };
  }, []);

  /* ── load interview ── */
  useEffect(() => {
    interviewService
      .get(id)
      .then((data) => {
        setInterview(data);
        const answered = (data.questions || []).filter((q) => q.response);
        setAnsweredCount(answered.length);
        setHistory(
          answered.map((q) => ({
            id: q.id,
            sequence: q.sequence,
            question_text: q.question_text,
            answer_text: q.response.answer_text,
            is_follow_up: q.is_follow_up,
          }))
        );
        setCurrentQuestion(data.questions[data.questions.length - 1]);
        if (data.status === "completed")
          navigate(`/interview/${id}/report`, { replace: true });
      })
      .catch(() => setError("Could not load this interview session."))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  /* ── timer tick ── */
  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  /* ── auto-scroll question dialogue to latest ── */
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, currentQuestion, aiThinking]);

  /* ── submit answer ── */
  const submitAnswer = useCallback(async () => {
    if (!answer.trim() || !currentQuestion || submitting || aiThinking) return;
    const text = answer.trim();
    setSubmitting(true);
    setError("");
    setAnswer("");

    try {
      await interviewService.answer(id, {
        question_id: currentQuestion.id,
        answer_text: text,
      });

      // Append to visible history
      setHistory((prev) => [
        ...prev,
        {
          id: currentQuestion.id,
          sequence: answeredCount + 1,
          question_text: currentQuestion.question_text,
          answer_text: text,
          is_follow_up: currentQuestion.is_follow_up,
        },
      ]);

      const newCount = answeredCount + 1;
      setAnsweredCount(newCount);

      if (newCount >= interview.planned_questions) {
        setSubmitting(false);
        await completeInterview();
        return;
      }

      setAiThinking(true);
      setSubmitting(false);

      const next = await interviewService.nextQuestion(id);
      setCurrentQuestion(next.current_question);
    } catch (err) {
      setError(getApiErrorMessage(err));
      setAnswer(text); // restore answer on error
    } finally {
      setSubmitting(false);
      setAiThinking(false);
    }
  }, [answer, currentQuestion, submitting, aiThinking, answeredCount, id, interview]);

  const completeInterview = async () => {
    setSubmitting(true);
    try {
      await interviewService.complete(id);
      navigate(`/interview/${id}/report`);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not finalize interview."));
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      submitAnswer();
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  /* ─── Loading state ────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f3f4f7]">
        <Loader2 className="h-9 w-9 animate-spin text-emerald-600" />
        <p className="text-sm font-semibold text-slate-600">
          Entering interview room…
        </p>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f3f4f7] text-slate-700">
        <AlertCircle className="h-9 w-9 text-red-500" />
        <p className="font-semibold">{error || "Interview not found."}</p>
        <Link
          to="/dashboard"
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700"
        >
          Return to dashboard
        </Link>
      </div>
    );
  }

  const progress = Math.min(100, Math.round((answeredCount / interview.planned_questions) * 100));
  const isLast = answeredCount + 1 >= interview.planned_questions;

  return (
    <div
      ref={roomContainerRef}
      className="flex h-screen w-screen overflow-hidden bg-[#eef1f6] text-slate-800 font-sans"
    >
      {/* ──────────────────────────────────────────────────────────
          MAIN VIEWPORT CONTAINER (Full focus interview UI, no sidebar)
      ────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden p-3 md:p-5 gap-3 md:gap-4">
        {/* ── TOP HEADER BAR ── */}
        <header className="flex flex-shrink-0 items-center justify-between rounded-2xl bg-white px-5 py-3 shadow-sm border border-slate-200/70">
          {/* Title & tags */}
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to="/dashboard"
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 font-black text-white text-xs shadow-sm hover:opacity-90 flex-shrink-0"
              title="Return to Dashboard"
            >
              IQ
            </Link>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              aria-label="Back to dashboard"
              className="grid h-8 w-8 place-items-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex min-w-0 items-center gap-2">
              <h1 className="truncate font-display text-[15px] md:text-[16px] font-bold text-slate-800">
                Mock Interview — {interview.role?.name || "Software Engineer"}
              </h1>
              <span className="hidden sm:inline-flex rounded-lg bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                {interview.interview_type || "Technical"} Round
              </span>
            </div>
          </div>

          {/* Right Header Status: Record Timer + Leave */}
          <div className="flex items-center gap-4">
            {/* Record / Elapsed Timer */}
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-1.5 border border-slate-200">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-semibold text-slate-500">Record</span>
              <span className="font-mono text-xs font-bold text-slate-800">
                {formatTime(elapsed)}
              </span>
            </div>

            {/* End session / complete */}
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-sm"
            >
              + End Session
            </button>
          </div>
        </header>

        {/* ── MAIN 2-COLUMN LAYOUT: AVATAR SCREEN (LEFT) + QUESTION/ANSWER (RIGHT) ── */}
        <div className="flex flex-1 gap-4 overflow-hidden">
          {/* ════════════════════════════════════════════════════════
              LEFT COLUMN: AVATAR SCREEN + BOTTOM VIDEO CONTROLS
          ════════════════════════════════════════════════════════ */}
          <section className="flex flex-1 flex-col gap-3 overflow-hidden">
            {/* Avatar Video Screen (Large) with User PiP in corner */}
            <div className="flex-1 overflow-hidden relative">
              <AIAvatarScreen
                isThinking={aiThinking}
                currentQuestion={currentQuestion}
                captionsOn={captionsOn}
                camOn={camOn}
                micOn={micOn}
              />
            </div>

            {/* ── BOTTOM VIDEO CALL CONTROLS BAR (without display option) ── */}
            <div className="flex flex-shrink-0 items-center justify-between rounded-2xl bg-white px-6 py-2.5 shadow-sm border border-slate-200/70">
              {/* Left: Volume Slider */}
              <div className="flex items-center gap-2 w-32">
                <button
                  type="button"
                  onClick={() => setVolume((v) => (v > 0 ? 0 : 80))}
                  className="text-slate-500 hover:text-slate-800"
                >
                  {volume === 0 ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="h-1.5 w-20 accent-emerald-600 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              {/* Center: Main Device & Meeting Controls */}
              <div className="flex items-center gap-2 sm:gap-4">
                {/* Mic */}
                <button
                  id="mic-toggle-btn"
                  type="button"
                  onClick={() => setMicOn((v) => !v)}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div
                    className={`grid h-10 w-10 place-items-center rounded-xl transition-all ${
                      micOn
                        ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        : "bg-red-50 text-red-600 ring-1 ring-red-200"
                    }`}
                  >
                    {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                  </div>
                  <span className="text-[10px] font-medium text-slate-500">
                    {micOn ? "Mic" : "Muted"}
                  </span>
                </button>

                {/* Cam */}
                <button
                  id="cam-toggle-btn"
                  type="button"
                  onClick={() => setCamOn((v) => !v)}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div
                    className={`grid h-10 w-10 place-items-center rounded-xl transition-all ${
                      camOn
                        ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        : "bg-red-50 text-red-600 ring-1 ring-red-200"
                    }`}
                  >
                    {camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                  </div>
                  <span className="text-[10px] font-medium text-slate-500">
                    {camOn ? "Cam" : "Off"}
                  </span>
                </button>

                {/* CC / Captions */}
                <button
                  id="cc-toggle-btn"
                  type="button"
                  onClick={() => setCaptionsOn((v) => !v)}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div
                    className={`grid h-10 w-10 place-items-center rounded-xl font-bold text-xs transition-all ${
                      captionsOn
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                    }`}
                  >
                    CC
                  </div>
                  <span className="text-[10px] font-medium text-slate-500">Captions</span>
                </button>

                {/* Fullscreen */}
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">
                    {isFullscreen ? (
                      <Minimize2 className="h-5 w-5" />
                    ) : (
                      <Maximize2 className="h-5 w-5" />
                    )}
                  </div>
                  <span className="text-[10px] font-medium text-slate-500">Screen</span>
                </button>
              </div>

              {/* Right: Leave / Disconnect */}
              <div className="flex items-center justify-end w-32">
                <button
                  type="button"
                  id="end-session-btn"
                  onClick={() => navigate("/dashboard")}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all">
                    <PhoneOff className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-medium text-slate-500">Leave</span>
                </button>
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════════════════════
              RIGHT COLUMN: QUESTION & ANSWER PANEL
          ════════════════════════════════════════════════════════ */}
          <section className="flex w-[380px] lg:w-[420px] flex-shrink-0 flex-col rounded-3xl bg-white p-4 shadow-sm border border-slate-200/80 overflow-hidden">
            {/* Small Question Bar (Replaced large round progress card) */}
            <div className="mb-2 flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200/80 px-3.5 py-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-[11px] font-bold text-white">
                  {answeredCount + 1}
                </span>
                <span className="text-xs font-bold text-slate-800">
                  Question {answeredCount + 1} of {interview.planned_questions}
                </span>
                {currentQuestion?.is_follow_up && (
                  <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-800">
                    Follow-up
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-emerald-600 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-[11px] font-bold text-slate-500">{progress}%</span>
              </div>
            </div>

            {/* ── QUESTION CHAT STREAM / TIMELINE (SCROLLABLE) ── */}
            <div className="flex-1 overflow-y-auto space-y-3 px-1 py-1 pr-1.5">
              {/* Previous Questions & Answers in Short */}
              {history.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-slate-200" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Previous ({history.length})
                    </span>
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>

                  {history.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-2.5 transition-colors hover:bg-slate-50"
                    >
                      {/* Question header in short */}
                      <div className="flex items-start gap-2 mb-1.5">
                        <span className="flex-shrink-0 rounded bg-slate-200 px-1.5 py-0.5 text-[9px] font-bold text-slate-600">
                          Q{idx + 1}
                        </span>
                        <p className="text-[12px] font-medium leading-snug text-slate-700 line-clamp-2">
                          {item.question_text}
                        </p>
                      </div>

                      {/* User answer in short */}
                      <div className="rounded-lg bg-white border border-slate-200/60 p-2 text-[11px] leading-relaxed text-slate-600">
                        <span className="font-bold text-emerald-700 mr-1.5">
                          Your Answer:
                        </span>
                        <span className="line-clamp-2">{item.answer_text}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Active Question Divider */}
              <div className="flex items-center gap-2 pt-1">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  Current Question
                </span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              {/* AI Interviewer Question Message */}
              <AnimatePresence mode="wait">
                {aiThinking ? (
                  <motion.div
                    key="thinking"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex gap-2.5"
                  >
                    <div className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                      <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                    </div>
                    <div className="rounded-2xl rounded-tl-sm bg-slate-100 p-3.5 border border-slate-200/70 max-w-[85%]">
                      <p className="text-xs font-bold text-slate-700 mb-1">
                        AI Interviewer
                      </p>
                      <p className="text-xs text-slate-500">
                        Analyzing your response and formulating next question…
                      </p>
                    </div>
                  </motion.div>
                ) : currentQuestion ? (
                  <motion.div
                    key={currentQuestion.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-2.5"
                  >
                    {/* Interviewer message bubble */}
                    <div className="flex gap-2.5">
                      <div className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-emerald-600 text-[11px] font-black text-white shadow-xs">
                        AI
                      </div>
                      <div className="rounded-2xl rounded-tl-sm bg-emerald-50/50 p-3.5 border border-emerald-200/70 shadow-xs flex-1">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-xs font-bold text-slate-800">
                            AI Interviewer
                          </span>
                          {currentQuestion.is_follow_up && (
                            <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">
                              Follow-up
                            </span>
                          )}
                        </div>
                        <p className="font-display text-[13px] md:text-[14px] font-semibold leading-relaxed text-slate-800">
                          {currentQuestion.question_text}
                        </p>
                      </div>
                    </div>

                    {/* Pro tip hint */}
                    <div className="ml-10 rounded-xl bg-amber-50/70 p-2 border border-amber-200/60 text-[10px] text-amber-800 flex items-start gap-1.5">
                      <span className="flex-shrink-0">💡</span>
                      <span>{TIPS[answeredCount % TIPS.length]}</span>
                    </div>
                  </motion.div>
                ) : (
                  <p className="text-center text-xs text-slate-400">Loading…</p>
                )}
              </AnimatePresence>
              <div ref={chatBottomRef} />
            </div>

            {/* ── BOTTOM WRITE / ANSWER SECTION (COMPACT) ── */}
            <div className="mt-1 border-t border-slate-200/80 pt-2.5 flex flex-col gap-1.5">
              {error && (
                <div className="flex items-center gap-1.5 rounded-lg bg-red-50 p-2 text-xs text-red-600 border border-red-200">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Compact Input container */}
              <div className="relative rounded-xl bg-slate-50 border border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all p-2 flex flex-col gap-1.5">
                <textarea
                  ref={textareaRef}
                  id="answer-textarea"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your answer... (Ctrl + Enter to submit)"
                  disabled={aiThinking || submitting}
                  rows={2}
                  className="w-full resize-none bg-transparent text-[13px] leading-relaxed text-slate-800 placeholder:text-slate-400 outline-none max-h-24"
                />

                {/* Bottom toolbar inside answer box */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                  <div className="flex items-center gap-2 text-slate-400">
                    <button
                      type="button"
                      title="Attach notes"
                      className="hover:text-slate-600 transition-colors"
                    >
                      <Paperclip className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-[10px] text-slate-400">
                      {answer.length > 0 ? `${answer.length} chars` : "Press Ctrl+Enter"}
                    </span>
                  </div>

                  {/* Send Button */}
                  <button
                    id="submit-answer-btn"
                    type="button"
                    onClick={submitAnswer}
                    disabled={!answer.trim() || submitting || aiThinking}
                    className="grid h-8 w-8 place-items-center rounded-lg bg-amber-400 text-slate-900 shadow-xs hover:bg-amber-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 transition-all"
                    title={isLast ? "Finish interview" : "Submit answer"}
                  >
                    {submitting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-900" />
                    ) : isLast ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-slate-900" />
                    ) : (
                      <Send className="h-3.5 w-3.5 text-slate-900 ml-0.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
