"use client";
import { motion, type Variants } from "framer-motion";

// ====================================================================
// SHARED MOTION PRIMITIVES
// --------------------------------------------------------------------
// One vocabulary for the whole app so nothing feels hand-tuned per page.
//
// House style: short, soft, and directional. Fade plus a small upward
// slide, eased out with no overshoot — no springs, no bounce, no scale-in.
// Distances stay under ~10px and durations under ~0.45s; past that it
// reads as "animated" rather than simply responsive.
//
// Reduced motion is honoured globally by <MotionConfig reducedMotion="user">
// in AppShell, so nothing here needs its own media query.
// ====================================================================

/** Ease-out expo. Quick to start, settles gently, never overshoots. */
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const DUR = {
  fast: 0.18,   // press / hover feedback
  base: 0.32,   // page + element entrances
  slow: 0.45,   // larger surfaces (charts, hero cards)
};

/** Fade + 8px rise. The default entrance for anything on the dashboard. */
const fadeUp = (y: number): Variants => ({
  hidden: { opacity: 0, y },
  show: { opacity: 1, y: 0, transition: { duration: DUR.base, ease: EASE } },
});

/**
 * A single element that fades and rises in on mount.
 * `delay` lets callers order a few standalone items by hand.
 */
export function Reveal({
  children, className = "", delay = 0, y = 8, style,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DUR.base, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Staggered container. Children must be <RevealItem> (or any motion
 * element with `variants`) — they inherit the "show" state from here and
 * fire one after another.
 *
 * Keep `stagger` small: 0.05-0.07s reads as a single gesture sweeping
 * across the grid, while 0.15s+ starts to feel like a slideshow.
 */
export function RevealGroup({
  children, className = "", stagger = 0.055, delay = 0, style,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      className={className}
      style={style}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

/** One child of a <RevealGroup>. */
export function RevealItem({
  children, className = "", y = 8, style,
}: {
  children: React.ReactNode;
  className?: string;
  y?: number;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div className={className} style={style} variants={fadeUp(y)}>
      {children}
    </motion.div>
  );
}

/**
 * Progress bar that fills from empty on mount. Takes a percentage 0..100.
 * Used for goal progress, where a bar rendered at its final width would
 * otherwise just appear with no sense of "filling".
 */
export function ProgressBar({
  pct, background, height = 8, delay = 0,
}: {
  pct: number;
  background: string;
  height?: number;
  delay?: number;
}) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ height, background: "#EEF1F8" }}>
      <motion.div
        className="h-full rounded-full"
        style={{ background }}
        initial={{ width: "0%" }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: DUR.slow, ease: EASE, delay }}
      />
    </div>
  );
}
