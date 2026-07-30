"use client";
// The motion primitives moved up to src/components/motion.tsx so the
// marketing pages, auth screens and dashboard all share one vocabulary.
// This re-export keeps the eight existing `./motion` imports in this
// folder working unchanged.
export {
  EASE,
  DUR,
  Reveal,
  RevealGroup,
  RevealItem,
  ScrollReveal,
  ScrollRevealGroup,
  ProgressBar,
  WordReveal,
} from "@/components/motion";
