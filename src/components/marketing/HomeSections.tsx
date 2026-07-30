"use client";
import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import {
  Sparkles, Upload, BarChart3, Film, TrendingUp, Crosshair, Target,
  ArrowRight, Check, Play,
} from "lucide-react";
import {
  EASE, DUR, ScrollReveal, ScrollRevealGroup, RevealItem, WordReveal,
} from "@/components/motion";
import { Hero3D } from "./Hero3D";

// ====================================================================
// HOME PAGE SECTIONS
// --------------------------------------------------------------------
// The hero sits on a dark stage so the 3D court has somewhere to glow;
// everything below returns to the light ambient theme the rest of the
// product uses. That contrast is the whole point of the layout — the
// dark band reads as a "screen" you're looking into.
// ====================================================================

const FEATURES = [
  {
    icon: BarChart3, title: "Automatic stats",
    body: "Kills, blocks, digs, aces, attack % and an AI match rating — computed per player, not per team.",
  },
  {
    icon: Film, title: "Highlight reels",
    body: "Your best plays clipped and sorted by category, ready to send to a coach or a recruiter.",
  },
  {
    icon: TrendingUp, title: "Season progress",
    body: "Every match saved to your account, so improvement is something you can actually see.",
  },
  {
    icon: Crosshair, title: "Heat & shot maps",
    body: "Where you attack from, where you land it, and where the errors cluster.",
  },
  {
    icon: Sparkles, title: "AI coaching report",
    body: "Two lists that matter: what to keep doing, and what to work on next session.",
  },
  {
    icon: Target, title: "Goals you set",
    body: "Pick a target — 20 kills a match, 45% attack — and track it across the season.",
  },
];

const STEPS = [
  { n: "01", title: "Upload your match", body: "Any MP4 or MOV. Full-length match videos are fine." },
  { n: "02", title: "Tap yourself once", body: "Pick the clearest frame and tap your player. That's the whole setup." },
  { n: "03", title: "Get your analysis", body: "Stats, highlights, heat maps and a coaching report in one place." },
];

const TICKER = [
  "Kills", "Blocks", "Digs", "Aces", "Attack %", "Serve %", "AI Rating",
  "Heat maps", "Shot charts", "Highlight reels", "Season trends", "Personal bests",
];

/** Cursor-tracked spotlight. Writes CSS vars the .spotlight class reads. */
function SpotlightCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    e.currentTarget.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
  }
  return (
    <div onMouseMove={onMove} className={`spotlight card-lift card p-6 h-full ${className}`}>
      {children}
    </div>
  );
}

export function HomeSections() {
  const reduce = useReducedMotion();
  const heroRef = useRef<HTMLDivElement>(null);

  // Gentle parallax: the hero copy drifts up slightly slower than the
  // page scrolls, which adds depth without hijacking the scroll.
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -40]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.8], [1, reduce ? 1 : 0.25]);

  return (
    <div>
      {/* ================= HERO (dark stage) =================
          Pulled up under the sticky nav (-mt-16) and padded back out, so
          the dark stage sits *behind* the header. Without this the nav's
          light-on-dark text renders over the light page background and
          "Log in" disappears. */}
      <section ref={heroRef} className="ambient-deep relative overflow-hidden -mt-16 pt-16">
        {/* Top hairline so the nav doesn't float on nothing */}
        <div className="absolute inset-x-0 top-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(160,190,255,0.35), transparent)" }} />

        <div className="max-w-6xl mx-auto px-6 pt-16 pb-20 lg:pt-24 lg:pb-28
                        grid lg:grid-cols-[1.12fr_1fr] gap-12 lg:gap-6 items-center">
          <motion.div style={{ y: copyY, opacity: copyOpacity }}>
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DUR.slow, ease: EASE }}
              className="ring-gradient inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium mb-7"
              style={{ color: "#C7D6FF" }}>
              <Sparkles size={13} /> AI-powered performance analysis
            </motion.div>

            {/* Each line is its own block, so the two-line break is
                explicit rather than depending on where the column happens
                to wrap. Type is sized to fit the copy column at lg —
                text-6xl needs ~700px and the column is ~590px, which is
                what pushed this to four ragged lines. */}
            <h1 className="text-[2.15rem] sm:text-5xl lg:text-[3.05rem] font-semibold tracking-tight leading-[1.06] text-white">
              <span className="block">
                <WordReveal text="Professional AI analysis" />
              </span>
              {/* Animated as one block rather than word-by-word: a
                  background-clip:text gradient only paints the element's own
                  text, so splitting this line into per-word spans would slice
                  the gradient up (and, without the descendant rule in
                  globals.css, blank the line entirely). */}
              <motion.span
                className="text-gradient-light block"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: DUR.hero, ease: EASE, delay: 0.3 }}
              >
                for every volleyball player.
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DUR.slow, ease: EASE, delay: 0.5 }}
              className="mt-7 text-lg max-w-xl" style={{ color: "rgba(214,224,255,0.72)" }}>
              Upload match footage and get automatic stats, highlight reels and a
              personalized coaching report — built for players, teams and coaches.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DUR.slow, ease: EASE, delay: 0.62 }}
              className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/signup"
                className="press sheen px-7 py-3.5 rounded-2xl text-white font-medium flex items-center gap-2"
                style={{
                  background: "linear-gradient(135deg,#4F7DF3,#7C6CF6)",
                  boxShadow: "0 18px 40px -14px rgba(79,125,243,0.75)",
                }}>
                <Upload size={18} /> Get started free
              </Link>
              <Link href="/matches/sample"
                className="press glass ring-gradient px-6 py-3.5 rounded-2xl font-medium flex items-center gap-2 text-white">
                <Play size={16} /> See a sample match
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: DUR.slow, ease: EASE, delay: 0.8 }}
              className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs"
              style={{ color: "rgba(200,214,255,0.6)" }}>
              {["No credit card to start", "Sample match included", "Cancel anytime"].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5">
                  <Check size={13} style={{ color: "#5FE3C0" }} /> {t}
                </span>
              ))}
            </motion.div>
          </motion.div>

          <Hero3D />
        </div>

        {/* Ticker band across the base of the stage */}
        <div className="relative border-t py-4 marquee-mask"
          style={{ borderColor: "rgba(150,180,255,0.14)" }}>
          <div className="marquee-track">
            {/* Rendered twice: the keyframe shifts by exactly -50%, so the
                second copy is mid-loop where the first began. */}
            {[0, 1].map((copy) => (
              <div key={copy} className="flex items-center shrink-0">
                {TICKER.map((t) => (
                  <span key={`${copy}-${t}`}
                    className="inline-flex items-center gap-2 px-6 text-sm whitespace-nowrap"
                    style={{ color: "rgba(196,212,255,0.5)" }}>
                    <span className="w-1 h-1 rounded-full" style={{ background: "#5B7BF0" }} />
                    {t}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-6">
        <ScrollReveal className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Everything a coach would tell you,{" "}
            <span className="text-gradient">from one video.</span>
          </h2>
          <p className="text-brand-muted mt-4">
            One upload becomes a full picture of how you actually played.
          </p>
        </ScrollReveal>

        <ScrollRevealGroup className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12" stagger={0.07}>
          {FEATURES.map((f) => (
            <RevealItem key={f.title} y={16}>
              <SpotlightCard>
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white mb-4"
                  style={{ background: "linear-gradient(135deg,#4F7DF3,#8B5CF6)" }}>
                  <f.icon size={19} />
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="text-sm text-brand-muted mt-1.5 leading-relaxed">{f.body}</p>
              </SpotlightCard>
            </RevealItem>
          ))}
        </ScrollRevealGroup>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="max-w-6xl mx-auto px-6 pt-20">
        <ScrollReveal className="text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">Three steps. That&apos;s it.</h2>
        </ScrollReveal>

        <ScrollRevealGroup className="grid md:grid-cols-3 gap-5 mt-12" stagger={0.1}>
          {STEPS.map((s, i) => (
            <RevealItem key={s.n} y={16}>
              <div className="card p-7 h-full relative overflow-hidden">
                <span className="absolute -top-3 -right-1 text-[5.5rem] font-semibold leading-none select-none"
                  style={{ color: "rgba(79,125,243,0.07)" }}>{s.n}</span>
                <div className="relative">
                  <div className="text-xs font-semibold tracking-widest text-brand mb-3">STEP {s.n}</div>
                  <h3 className="font-semibold text-lg">{s.title}</h3>
                  <p className="text-sm text-brand-muted mt-2 leading-relaxed">{s.body}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <ArrowRight size={16} className="hidden md:block absolute -right-[38px] top-1/2 text-brand-faint" />
                )}
              </div>
            </RevealItem>
          ))}
        </ScrollRevealGroup>
      </section>

      {/* ================= CTA ================= */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-10">
        <ScrollReveal>
          <div className="halo relative isolate rounded-3xl overflow-hidden text-center px-6 py-16"
            style={{
              background: "linear-gradient(150deg, #141A36 0%, #0F1428 60%, #0C1024 100%)",
              boxShadow: "0 40px 90px -40px rgba(12,16,36,0.8)",
            }}>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
              Ready to elevate your game?
            </h2>
            <p className="mt-4 max-w-md mx-auto" style={{ color: "rgba(214,224,255,0.72)" }}>
              Create a free account, explore the sample match, and analyze your first
              game whenever you&apos;re ready.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link href="/signup"
                className="press sheen px-7 py-3.5 rounded-2xl text-white font-medium inline-flex items-center gap-2"
                style={{
                  background: "linear-gradient(135deg,#4F7DF3,#7C6CF6)",
                  boxShadow: "0 18px 40px -14px rgba(79,125,243,0.75)",
                }}>
                Create your account <ArrowRight size={17} />
              </Link>
              <Link href="/pricing"
                className="press glass ring-gradient px-6 py-3.5 rounded-2xl font-medium text-white">
                See pricing
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
