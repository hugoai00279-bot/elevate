"use client";
import { useEffect, useRef, useState } from "react";

export function useCountUp(target: number, duration = 1000, start = true) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf: number;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      setValue(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return value;
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`card p-5 ${className}`}>{children}</div>;
}

export function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-xl font-semibold">{title}</h2>
      {sub && <p className="text-sm text-brand-faint mt-1">{sub}</p>}
    </div>
  );
}

export function RatingRing({
  value = 0, size = 132, label = "AI Rating", sub = "",
}: { value?: number; size?: number; label?: string; sub?: string }) {
  const [inView, setInView] = useState(false);
  useEffect(() => { const t = setTimeout(() => setInView(true), 120); return () => clearTimeout(t); }, []);
  const animated = useCountUp(value, 1100, inView);
  const r = (size - 14) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (animated / 100) * c;
  const gradId = useRef(`rg-${Math.random().toString(36).slice(2, 8)}`).current;

  return (
    <div className="flex flex-col items-center justify-center">
      <div style={{ width: size, height: size }} className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4F7DF3" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
          <circle cx={size / 2} cy={size / 2} r={r} stroke="#EEF1F8" strokeWidth="10" fill="none" />
          <circle cx={size / 2} cy={size / 2} r={r} stroke={`url(#${gradId})`} strokeWidth="10"
            fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: "stroke-dashoffset 0.2s linear" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold">{Math.round(animated)}</span>
          <span className="text-[11px] text-brand-faint">/100</span>
        </div>
      </div>
      <div className="mt-2 text-sm font-medium">{label}</div>
      {sub && <div className="text-xs text-brand-faint">{sub}</div>}
    </div>
  );
}

// Plain neutral white/gray stat tile (no per-stat tinting, per your last note).
export function StatTile({
  icon: Icon, label, value, suffix = "",
}: { icon: any; label: string; value: number; suffix?: string }) {
  const animated = useCountUp(value, 900, true);
  const display = Number.isInteger(value) ? Math.round(animated) : animated.toFixed(1);
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-3 border bg-white" style={{ borderColor: "#EEF0F5" }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: "#F3F4F7", color: "#6B7280" }}>
        <Icon size={17} />
      </div>
      <div>
        <div className="text-2xl font-semibold">{display}{suffix}</div>
        <div className="text-xs text-brand-faint mt-0.5">{label}</div>
      </div>
    </div>
  );
}

export function CourtDiagram({ children }: { children?: React.ReactNode }) {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden border"
      style={{ aspectRatio: "2 / 1", background: "#F7F8FC", borderColor: "#EEF0F5" }}>
      <svg viewBox="0 0 400 200" className="absolute inset-0 w-full h-full">
        <rect x="4" y="4" width="392" height="192" fill="none" stroke="#D7DCEA" strokeWidth="2" />
        <line x1="200" y1="4" x2="200" y2="196" stroke="#4F7DF3" strokeWidth="2.5" />
        <line x1="133" y1="4" x2="133" y2="196" stroke="#D7DCEA" strokeWidth="1.5" strokeDasharray="4 4" />
        <line x1="267" y1="4" x2="267" y2="196" stroke="#D7DCEA" strokeWidth="1.5" strokeDasharray="4 4" />
      </svg>
      {children}
    </div>
  );
}
