"use client";
import { motion, useReducedMotion, type Variants } from "framer-motion";

// ====================================================================
// SHARED MOTION PRIMITIVES  (app-wide)
// --------------------------------------------------------------------
// One animation vocabulary for marketing, auth and the dashboard, so the
// product moves the same way everywhere.
//
// House style: fade plus a small directional slide, eased out with no
// overshoot. Springs and bounce are deliberately absent — the marketing
// pages are louder than the app visually, but they move with the same
// restraint.
//
// Reduced motion is honoured by <MotionConfig reducedMotion="user"> at
// each layout root, so nothing here needs its own media query. The one
// exception is pointer-driven parallax, which is opt-out inside the
// component that owns it.
// ====================================================================

/** Ease-out expo. Quick to start, settles gently, never overshoots. */
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const DUR = {
  fast: 0.18,   // press / hover feedback
  base: 0.32,   // page + element entrances
  slow: 0.45,   // larger surfaces (charts, hero cards)
  hero: 0.7,    // marketing hero copy, where a longer beat reads as calm
};

const fadeUp = (y: number): Variants => ({
  hidden: { opacity: 0, y },
  show: { opacity: 1, y: 0, transition: { duration: DUR.base, ease: EASE } },
});

/** A single element that fades and rises in on mount. */
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
 * element with `variants`) — they inherit "show" from here and fire in
 * sequence.
 *
 * Keep `stagger` small: 0.05-0.07s reads as one gesture sweeping across
 * a grid, while 0.15s+ starts to feel like a slideshow.
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

/** One child of a <RevealGroup> or <ScrollRevealGroup>. */
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
 * Fires when the element scrolls into view rather than on mount — the
 * right default for long marketing pages, where mount-time animation is
 * wasted on everything below the fold.
 *
 * `once` so sections don't re-animate on every scroll past, and the
 * margin starts it slightly before the element reaches the viewport so
 * it's already settling by the time you're looking at it.
 */
export function ScrollReveal({
  children, className = "", delay = 0, y = 20, style,
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
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: DUR.slow, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Scroll-triggered stagger container. Pair with <RevealItem>. */
export function ScrollRevealGroup({
  children, className = "", stagger = 0.08, delay = 0, style,
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
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Progress bar that fills from empty on mount. Takes a percentage 0..100.
 * A bar rendered straight at its final width reads as a static graphic
 * rather than progress.
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

/**
 * Word-by-word headline reveal. Splitting on words (not characters)
 * keeps it legible — per-letter animation on a six-word headline reads
 * as a gimmick and hurts scanning.
 *
 * Falls back to a plain block when reduced motion is requested, so the
 * text never arrives in pieces.
 */
export function WordReveal({
  text, className = "", delay = 0, stagger = 0.055,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <span className={className}>{text}</span>;

  return (
    <span className={className} style={{ display: "inline-block" }}>
      {text.split(" ").map((word, i) => (
        // Each word gets a clipping wrapper so it rises out of nothing
        // instead of sliding over neighbouring lines.
        <span key={`${word}-${i}`} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top" }}>
          <motion.span
            style={{ display: "inline-block", willChange: "transform" }}
            initial={{ y: "110%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            transition={{ duration: DUR.hero, ease: EASE, delay: delay + i * stagger }}
          >
            {word}
            {/* Trailing space inside the animated span keeps word spacing
                intact without a separate text node. */}
            {" "}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
