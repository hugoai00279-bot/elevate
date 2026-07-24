"use client";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Check, ChevronRight, Crosshair, Film } from "lucide-react";
import { BallIcon } from "@/components/BallIcon";

const POSITIONS = ["Outside Hitter", "Opposite", "Setter", "Middle Blocker", "Libero"];

const ANALYSIS_STEPS = [
  "Uploading video",
  "Detecting court",
  "Detecting players",
  "Identifying selected player",
  "Tracking player throughout the match",
  "Detecting ball",
  "Detecting volleyball actions",
  "Generating statistics",
  "Creating highlight reels",
  "Generating AI coaching report",
];

type Step = "select" | "identify" | "tap" | "analyze";

export function UploadFlow({
  defaultJersey, defaultPosition,
}: { defaultJersey: string; defaultPosition: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("select");
  const [file, setFile] = useState<File | null>(null);
  const [firstFrame, setFirstFrame] = useState<string | null>(null);
  const [matchId, setMatchId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [opponent, setOpponent] = useState("");
  const [jersey, setJersey] = useState(defaultJersey);
  const [position, setPosition] = useState(defaultPosition);

  // Normalized 0..1 tap location — the seed a real CV tracker uses.
  const [tap, setTap] = useState<{ x: number; y: number } | null>(null);

  const [stepIndex, setStepIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [limitError, setLimitError] = useState<string | null>(null);

  // ---- Step 1: choose file & capture first frame -------------------
  async function onFile(f: File) {
    setFile(f);
    setTitle(f.name.replace(/\.[^.]+$/, ""));
    // Capture the first frame client-side for the tap step.
    try {
      const url = URL.createObjectURL(f);
      const video = document.createElement("video");
      video.src = url;
      video.muted = true;
      await new Promise<void>((res, rej) => {
        video.onloadeddata = () => res();
        video.onerror = () => rej();
      });
      video.currentTime = Math.min(1, video.duration || 1);
      await new Promise<void>((res) => { video.onseeked = () => res(); });
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 360;
      canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
      setFirstFrame(canvas.toDataURL("image/jpeg", 0.8));
      URL.revokeObjectURL(url);
    } catch {
      setFirstFrame(null); // fall back to a placeholder in the tap step
    }
    setStep("identify");
  }

  // ---- Step 2 -> 3: create match, save identification ---------------
  async function confirmIdentity() {
    setBusy(true);
    setLimitError(null);
    try {
      // Create the match + get upload target.
      const up = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, opponent }),
      });
      const upData = await up.json();

      if (!up.ok) {
        setLimitError(upData.error || "Something went wrong starting your upload.");
        return;
      }

      setMatchId(upData.matchId);

      // If a real upload URL exists (Mux), push the bytes.
      if (upData.uploadUrl && file) {
        await fetch(upData.uploadUrl, { method: "PUT", body: file }).catch(() => {});
      }
      setStep("tap");
    } finally {
      setBusy(false);
    }
  }

  // ---- Step 3 -> 4: save tap, begin analysis -----------------------
  async function confirmPlayer() {
    if (!matchId) return;
    setBusy(true);
    try {
      await fetch("/api/matches", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId, jerseyNumber: jersey || null, position: position || null,
          selectionX: tap?.x ?? null, selectionY: tap?.y ?? null, title, opponent,
        }),
      });
      setStep("analyze");
    } finally {
      setBusy(false);
    }
  }

  // ---- Step 4: run analysis with animated steps --------------------
  useEffect(() => {
    if (step !== "analyze" || !matchId) return;
    let cancelled = false;

    // Kick off the real analysis request in parallel with the animation.
    const analysisPromise = fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId }),
    }).then((r) => r.json()).catch(() => null);

    const interval = setInterval(() => {
      setStepIndex((i) => {
        if (i >= ANALYSIS_STEPS.length - 1) {
          clearInterval(interval);
          // Wait for the analysis request to finish, then go to results.
          analysisPromise.then(() => {
            if (!cancelled) setTimeout(() => router.push(`/matches/${matchId}`), 600);
          });
          return i;
        }
        return i + 1;
      });
    }, 700);

    return () => { cancelled = true; clearInterval(interval); };
  }, [step, matchId, router]);

  return (
    <div>
      {/* Progress rail */}
      <div className="flex items-center gap-2 mb-8 text-xs font-medium">
        {["Upload", "Identify", "Select you", "Analyze"].map((s, i) => {
          const states: Step[] = ["select", "identify", "tap", "analyze"];
          const current = states.indexOf(step);
          const done = i < current;
          const active = i === current;
          return (
            <div key={s} className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                style={{
                  background: done || active ? "linear-gradient(135deg,#4F7DF3,#8B5CF6)" : "#E4E7EF",
                  color: done || active ? "white" : "#9AA2B1",
                }}>
                {done ? <Check size={11} /> : i + 1}
              </span>
              <span style={{ color: active ? "#12141C" : "#9AA2B1" }}>{s}</span>
              {i < 3 && <ChevronRight size={14} className="text-brand-faint" />}
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 1 — file select */}
        {step === "select" && (
          <motion.div key="select" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="card p-10 text-center flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-4"
                style={{ background: "linear-gradient(135deg,#4F7DF3,#8B5CF6)" }}>
                <Film size={26} />
              </div>
              <h1 className="text-xl font-semibold">Upload your match</h1>
              <p className="text-sm text-brand-muted mt-1 max-w-sm">
                Choose a video of your match (MP4 or MOV). Long full-match videos are fine.
              </p>
              <button onClick={() => fileRef.current?.click()}
                className="mt-6 px-6 py-3 rounded-2xl text-white font-medium flex items-center gap-2"
                style={{ background: "linear-gradient(135deg,#4F7DF3,#6E6BF5)" }}>
                <Upload size={18} /> Choose video
              </button>
              <input ref={fileRef} type="file" accept=".mp4,.mov,video/mp4,video/quicktime" className="hidden"
                onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
            </div>
          </motion.div>
        )}

        {/* STEP 2 — player identification */}
        {step === "identify" && (
          <motion.div key="identify" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="card p-8 max-w-lg">
              <h1 className="text-xl font-semibold">Who are you in this match?</h1>
              <p className="text-sm text-brand-muted mt-1">
                This helps us track the right player. We&apos;ve pre-filled your usual details.
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-sm font-medium">Match title</label>
                  <input value={title} onChange={(e) => setTitle(e.target.value)}
                    className="w-full mt-1.5 px-4 py-3 rounded-xl border border-[#E4E7EF] bg-white" />
                </div>
                <div>
                  <label className="text-sm font-medium">Opponent (optional)</label>
                  <input value={opponent} onChange={(e) => setOpponent(e.target.value)} placeholder="e.g. Riverside HS"
                    className="w-full mt-1.5 px-4 py-3 rounded-xl border border-[#E4E7EF] bg-white" />
                </div>
                <div>
                  <label className="text-sm font-medium">Jersey number <span className="text-brand-faint font-normal">(skip if unknown)</span></label>
                  <input value={jersey} onChange={(e) => setJersey(e.target.value)} placeholder="e.g. 7" inputMode="numeric"
                    className="w-full mt-1.5 px-4 py-3 rounded-xl border border-[#E4E7EF] bg-white" />
                </div>
                <div>
                  <label className="text-sm font-medium">Position</label>
                  <div className="grid grid-cols-2 gap-2 mt-1.5">
                    {POSITIONS.map((p) => (
                      <button key={p} onClick={() => setPosition(p)}
                        className="px-3 py-2.5 rounded-xl border text-sm text-left transition-colors"
                        style={{
                          borderColor: position === p ? "#4F7DF3" : "#E4E7EF",
                          background: position === p ? "rgba(79,125,243,0.08)" : "white",
                          color: position === p ? "#4F7DF3" : "#12141C",
                        }}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {limitError && (
                <div className="mt-4 p-3 rounded-xl text-sm" style={{ background: "rgba(245,158,11,0.1)", color: "#854F0B" }}>
                  {limitError}{" "}
                  <a href="/pricing" className="underline font-medium">See plans →</a>
                </div>
              )}

              <button onClick={confirmIdentity} disabled={busy || !position}
                className="mt-7 w-full py-3 rounded-xl text-white font-medium disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#4F7DF3,#6E6BF5)" }}>
                {busy ? "Preparing…" : "Continue"}
              </button>
              {!position && <p className="text-xs text-brand-faint mt-2 text-center">Select a position to continue.</p>}
            </div>
          </motion.div>
        )}

        {/* STEP 3 — tap to select yourself */}
        {step === "tap" && (
          <motion.div key="tap" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="card p-6 max-w-2xl">
              <div className="flex items-center gap-2 mb-1">
                <Crosshair size={18} className="text-brand" />
                <h1 className="text-xl font-semibold">Tap on yourself</h1>
              </div>
              <p className="text-sm text-brand-muted mb-4">
                Tap your player in the first frame. We&apos;ll lock onto you and track you through the match.
              </p>

              <div
                className="relative w-full rounded-2xl overflow-hidden border cursor-crosshair select-none"
                style={{ aspectRatio: "16/9", borderColor: "#EEF0F5", background: firstFrame ? undefined : "#0B0D14" }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = (e.clientX - rect.left) / rect.width;
                  const y = (e.clientY - rect.top) / rect.height;
                  setTap({ x, y });
                }}
              >
                {firstFrame ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={firstFrame} alt="First frame" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-white/60 text-sm">
                    Preview unavailable — tap anywhere to place your marker
                  </div>
                )}

                {tap && (
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ left: `${tap.x * 100}%`, top: `${tap.y * 100}%` }}
                  >
                    <div className="w-16 h-16 rounded-full border-2" style={{ borderColor: "#4F7DF3", boxShadow: "0 0 0 4px rgba(79,125,243,0.25)" }} />
                    <span className="absolute left-1/2 -translate-x-1/2 -bottom-6 text-[11px] font-semibold px-2 py-0.5 rounded-full text-white whitespace-nowrap"
                      style={{ background: "#4F7DF3" }}>
                      {jersey ? `#${jersey} — You` : "You"}
                    </span>
                  </motion.div>
                )}
              </div>

              <div className="flex items-center justify-between mt-5">
                <button onClick={() => setTap(null)} className="text-sm text-brand-muted">Reset marker</button>
                <button onClick={confirmPlayer} disabled={!tap || busy}
                  className="px-6 py-3 rounded-xl text-white font-medium disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg,#4F7DF3,#6E6BF5)" }}>
                  {busy ? "Starting…" : "Confirm & start analysis"}
                </button>
              </div>
              {!tap && <p className="text-xs text-brand-faint mt-2 text-right">Tap the frame to place your marker.</p>}
            </div>
          </motion.div>
        )}

        {/* STEP 4 — analysis */}
        {step === "analyze" && (
          <motion.div key="analyze" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="ambient-dark -mx-4 sm:-mx-6 -mt-20 sm:-mt-24 min-h-screen flex items-center justify-center px-6">
            <div className="w-full max-w-md text-center">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
                className="w-16 h-16 mx-auto mb-8 rounded-2xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#4F7DF3,#8B5CF6)" }}>
                <BallIcon size={28} className="text-white" />
              </motion.div>
              <h2 className="text-white text-xl font-semibold mb-1">Analyzing your match</h2>
              <p className="text-sm mb-8" style={{ color: "#9AA6C7" }}>
                Tracking {jersey ? `#${jersey}` : "your player"} through the game.
              </p>

              <div className="h-1.5 w-full rounded-full mb-8 overflow-hidden" style={{ background: "#FFFFFF1A" }}>
                <motion.div className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg,#4F7DF3,#8B5CF6)" }}
                  animate={{ width: `${((stepIndex + 1) / ANALYSIS_STEPS.length) * 100}%` }}
                  transition={{ ease: "easeOut", duration: 0.4 }} />
              </div>

              <div className="space-y-2.5 text-left">
                {ANALYSIS_STEPS.map((s, i) => {
                  const state = i < stepIndex ? "done" : i === stepIndex ? "active" : "pending";
                  return (
                    <div key={s} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                        style={{
                          background: state === "done" ? "linear-gradient(135deg,#4F7DF3,#8B5CF6)"
                            : state === "active" ? "#FFFFFF22" : "transparent",
                          border: state === "pending" ? "1.5px solid #FFFFFF2A" : "none",
                        }}>
                        {state === "done" && <Check size={12} className="text-white" />}
                        {state === "active" && (
                          <motion.div className="w-2 h-2 rounded-full" style={{ background: "#4F7DF3" }}
                            animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 0.9 }} />
                        )}
                      </div>
                      <span className="text-sm"
                        style={{ color: state === "pending" ? "#5B6480" : "#E7EAF6", fontWeight: state === "active" ? 600 : 400 }}>
                        {s}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
