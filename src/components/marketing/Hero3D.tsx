"use client";
import { useRef } from "react";
import {
  motion, useMotionValue, useSpring, useTransform, useReducedMotion,
} from "framer-motion";
import { Flame, Shield, Zap, TrendingUp } from "lucide-react";
import { EASE } from "@/components/motion";

// ====================================================================
// HERO 3D SCENE
// --------------------------------------------------------------------
// A volleyball court in perspective with a spinning ball and floating
// stat chips, built entirely from CSS 3D transforms.
//
// WHY NOT WEBGL: three.js + @react-three/fiber is ~600KB of JS before a
// single triangle is drawn, on a page whose whole job is to load fast.
// Everything here composites on the GPU exactly like a WebGL canvas
// would, ships zero new bytes of dependency, and degrades gracefully.
// If we ever want real geometry — a ball with actual depth, shadows that
// respond to a light — that's the moment to add the dependency.
//
// The scene tilts toward the pointer.
// ====================================================================

// Tilt ceiling in degrees. 7 was too reserved to notice; 16 makes the
// court clearly swing with the cursor while still returning to a
// readable flat-on view at centre.
const MAX_TILT = 16;

/** Floating stat chip. `z` sets its depth, which drives parallax strength. */
function StatChip({
  icon: Icon, label, value, className = "", z, float,
}: {
  icon: any; label: string; value: string; className?: string; z: number; float: string;
}) {
  return (
    <div
      className={`absolute ${float} ${className}`}
      style={{ transform: `translateZ(${z}px)`, transformStyle: "preserve-3d" }}
    >
      <div className="glass-solid flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl">
        <span className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg, rgba(79,125,243,0.9), rgba(139,92,246,0.9))" }}>
          <Icon size={15} className="text-white" />
        </span>
        <span className="leading-tight">
          <span className="block text-white font-semibold text-sm tabular-nums">{value}</span>
          <span className="block text-[10px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.55)" }}>
            {label}
          </span>
        </span>
      </div>
    </div>
  );
}

/**
 * CSS volleyball. A radial-gradient sphere for fixed lighting, with the
 * seams on a separate clipped layer that rotates underneath — so the
 * highlight stays put while the seams sweep across the face, which is
 * what selling "this is spinning" actually requires.
 */
function Volleyball({ size = 116 }: { size?: number }) {
  const seam: React.CSSProperties = {
    position: "absolute",
    borderRadius: "50%",
    border: "2.5px solid rgba(56,78,150,0.38)",
  };
  return (
    <div
      className="relative rounded-full"
      style={{
        width: size,
        height: size,
        background:
          "radial-gradient(circle at 32% 26%, #FFFFFF 0%, #F2F5FF 32%, #D5DEFA 62%, #A8B9EC 84%, #8B9FDC 100%)",
        boxShadow:
          "inset -12px -14px 26px rgba(56,78,150,0.30), inset 6px 8px 18px rgba(255,255,255,0.55), 0 18px 34px -10px rgba(8,12,28,0.55)",
      }}
    >
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <div className="ball-spin absolute inset-0">
          <div style={{ ...seam, inset: "-16% 14%" }} />
          <div style={{ ...seam, inset: "14% -16%" }} />
          <div style={{ ...seam, inset: "-30% 34%" }} />
        </div>
      </div>
      {/* Specular dot, outside the rotating layer so the light source
          stays fixed while the ball turns. */}
      <div className="absolute rounded-full"
        style={{
          width: size * 0.2, height: size * 0.2, top: "16%", left: "24%",
          background: "radial-gradient(circle, rgba(255,255,255,0.95), transparent 70%)",
          filter: "blur(2px)",
        }} />
    </div>
  );
}

export function Hero3D() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  // Raw pointer offset, -0.5..0.5 relative to the stage centre.
  const px = useMotionValue(0);
  const py = useMotionValue(0);

  // Spring the values so the scene glides after the cursor instead of
  // snapping to it frame by frame. Stiffer and lighter than before so the
  // bigger tilt still feels like it's tracking the cursor rather than
  // lagging behind it.
  const sx = useSpring(px, { stiffness: 140, damping: 18, mass: 0.4 });
  const sy = useSpring(py, { stiffness: 140, damping: 18, mass: 0.4 });

  const rotateY = useTransform(sx, [-0.5, 0.5], [-MAX_TILT, MAX_TILT]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [MAX_TILT, -MAX_TILT]);

  // Cached stage bounds. Reading getBoundingClientRect() inside the move
  // handler forced a synchronous layout on every single mousemove, which
  // is exactly the kind of per-event work that makes a page feel sticky.
  // Measured once on enter instead — the stage doesn't move while hovering.
  const rect = useRef<DOMRect | null>(null);

  function onPointerEnter() {
    rect.current = ref.current?.getBoundingClientRect() ?? null;
  }

  function onPointerMove(e: React.PointerEvent) {
    // Coarse pointers (touch) would jump the scene on tap — skip them.
    if (reduce || e.pointerType !== "mouse") return;
    const r = rect.current;
    if (!r) return;
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  }

  function onPointerLeave() {
    rect.current = null;
    px.set(0);
    py.set(0);
  }

  return (
    <div
      ref={ref}
      onPointerEnter={onPointerEnter}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="stage relative w-full"
      style={{ height: 440 }}
    >
      <motion.div
        className="stage-3d absolute inset-0"
        style={reduce ? undefined : { rotateX, rotateY }}
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
      >
        {/* Depth glow, furthest back */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: 620, height: 420, transform: "translate(-50%,-50%) translateZ(-260px)",
            background: "radial-gradient(ellipse, rgba(79,125,243,0.45), rgba(139,92,246,0.18) 55%, transparent 72%)",
            filter: "blur(50px)",
          }} />

        {/* ---- Court plane ------------------------------------------
            Laid flat by rotateX, then pushed back and down so the ball
            and chips read as floating above it.

            Sized to stay inside the stage: perspective widens the near
            edge, so anything much past ~460px here runs off the right of
            the column and gets clipped by the section. */}
        <div
          className="absolute left-1/2 top-1/2"
          style={{
            width: 452, height: 248,
            transform: "translate(-50%,-50%) translateY(64px) translateZ(-30px) rotateX(64deg)",
            transformStyle: "preserve-3d",
          }}
        >
          <div className="w-full h-full relative rounded-[14px] overflow-hidden"
            style={{
              background: "linear-gradient(165deg, #1C2650 0%, #16204A 30%, #101838 65%, #0C1128 100%)",
              boxShadow: "0 0 0 1px rgba(120,150,255,0.22), 0 40px 80px -30px rgba(0,0,0,0.8), inset 0 0 90px rgba(79,125,243,0.16)",
            }}>
            {/* Court markings. viewBox matches the plane's pixel size so
                stroke weights stay even under the perspective squash. */}
            <svg viewBox="0 0 452 248" className="absolute inset-0 w-full h-full">
              <rect x="12" y="12" width="428" height="224" fill="none"
                stroke="rgba(180,205,255,0.42)" strokeWidth="2" rx="4" />
              <line x1="226" y1="12" x2="226" y2="236"
                stroke="rgba(140,180,255,0.75)" strokeWidth="2.5" />
              <line x1="154" y1="12" x2="154" y2="236"
                stroke="rgba(180,205,255,0.22)" strokeWidth="1.5" strokeDasharray="7 7" />
              <line x1="298" y1="12" x2="298" y2="236"
                stroke="rgba(180,205,255,0.22)" strokeWidth="1.5" strokeDasharray="7 7" />
            </svg>
            {/* Sheen sweeping the far end, sells a reflective surface */}
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(200deg, rgba(255,255,255,0.10) 0%, transparent 42%)" }} />
          </div>
        </div>

        {/* ---- Net --------------------------------------------------
            A vertical plane on the centre line. The repeating gradients
            are the mesh; the bright top edge is the tape. */}
        <div className="absolute left-1/2 top-1/2"
          style={{
            width: 300, height: 74,
            transform: "translate(-50%,-50%) translateY(26px) translateZ(-30px)",
            transformStyle: "preserve-3d",
          }}>
          <div className="w-full h-full"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, rgba(200,220,255,0.30) 0 1px, transparent 1px 11px)," +
                "repeating-linear-gradient(0deg, rgba(200,220,255,0.30) 0 1px, transparent 1px 11px)",
              borderTop: "3px solid rgba(235,242,255,0.85)",
              borderBottom: "1px solid rgba(200,220,255,0.35)",
            }} />
        </div>

        {/* ---- Ball + its court shadow ------------------------------ */}
        <div className="absolute left-1/2 top-1/2"
          style={{ transform: "translate(-50%,-50%) translateY(-52px) translateZ(140px)", transformStyle: "preserve-3d" }}>
          <div className="float-y">
            <Volleyball size={96} />
          </div>
        </div>
        {/* Shadow lives on the court plane, not under the ball, so the
            perspective keeps them visually connected. */}
        <div className="absolute left-1/2 top-1/2 rounded-full float-y-slow"
          style={{
            width: 96, height: 26,
            transform: "translate(-50%,-50%) translateY(84px) translateZ(-28px) rotateX(64deg)",
            background: "radial-gradient(ellipse, rgba(4,8,22,0.55), transparent 70%)",
            filter: "blur(7px)",
          }} />

        {/* ---- Floating stat chips ----------------------------------
            Kept clear of the court's footprint (roughly the middle band
            of the stage) so none of them end up tucked behind the plane,
            and inset from the edges so none clip at the column boundary. */}
        <StatChip icon={Flame} label="Kills" value="18" z={210}
          className="left-0 top-[14%]" float="float-y" />
        <StatChip icon={TrendingUp} label="AI Rating" value="82" z={260}
          className="right-0 top-[4%]" float="float-y-slow" />
        <StatChip icon={Shield} label="Blocks" value="4" z={190}
          className="right-[2%] bottom-[6%]" float="float-y" />
        <StatChip icon={Zap} label="Aces" value="3" z={170}
          className="left-[2%] bottom-[12%]" float="float-y-slow" />
      </motion.div>
    </div>
  );
}
