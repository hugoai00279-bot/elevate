// ====================================================================
// PLAN GATING & UNIT ECONOMICS
// --------------------------------------------------------------------
// Three tiers: Free (demo), Starter, Pro.
//
// FREE is a DEMO tier, not a usage tier. It includes ZERO analyses —
// free users can explore a built-in sample match (src/lib/sampleMatch.ts)
// with every feature visible, but cannot analyze their own video. That
// keeps acquisition cost at zero while still showing the full product.
//
// KEY ECONOMIC RULE:
//   Real video analysis (future CV backend) costs ~$6 per full match.
//   Each paid plan includes a capped number of analyses; extras are sold
//   at EXTRA_MATCH_PRICE (above cost). Free never triggers a paid analysis.
//
// Founder override: FOUNDER_EMAILS env var (comma separated) grants
// permanent full access without Stripe.
// ====================================================================

export type PlanKey = "FREE" | "STARTER" | "PRO";

// Price of one extra match beyond the monthly cap (USD).
// Must stay above real cost (~$6) + Stripe fee to remain profitable.
// Only Starter and Pro may buy these (see allowsExtraMatches).
export const EXTRA_MATCH_PRICE = 7.5;

export interface PlanFeatures {
  label: string;
  monthlyPrice: number;          // USD/month
  isDemo: boolean;               // demo-only tier: sample match, no own uploads
  includedAnalyses: number;      // full AI analyses included per month
  allowsExtraMatches: boolean;   // can buy more at EXTRA_MATCH_PRICE
  fullStats: boolean;            // heat map + shot chart
  aiCoach: boolean;              // AI coaching report
  highlights: boolean;           // highlight reels
  progressTracking: boolean;     // season progress chart
  fullAnalysis: boolean;         // triggers real (costly) video AI; false = basic only
  maxAthletes: number;           // reserved for future Team plan
  coachDashboard: boolean;       // reserved for future Team plan
  teamComparisons: boolean;      // reserved for future Team plan
  prioritySupport: boolean;
}

export const PLAN_FEATURES: Record<PlanKey, PlanFeatures> = {
  FREE: {
    label: "Free",
    monthlyPrice: 0,
    isDemo: true,
    // Zero included analyses: the free tier is a guided demo of the
    // sample match, never a path to a real (costly) analysis.
    includedAnalyses: 0,
    allowsExtraMatches: false,
    // Feature flags stay ON so the sample match renders complete — every
    // panel visible, nothing blurred. The gate that matters for cost is
    // includedAnalyses: 0, enforced on upload/analyze.
    fullStats: true,
    aiCoach: true,
    highlights: true,
    progressTracking: true,
    fullAnalysis: false, // never calls the paid AI backend
    maxAthletes: 1,
    coachDashboard: false,
    teamComparisons: false,
    prioritySupport: false,
  },
  STARTER: {
    label: "Starter",
    monthlyPrice: 9.99,
    isDemo: false,
    includedAnalyses: 1, // ~$6 cost, leaves margin on $9.99
    allowsExtraMatches: true,
    fullStats: true,
    aiCoach: true,
    highlights: true,
    progressTracking: true,
    fullAnalysis: true,
    maxAthletes: 1,
    coachDashboard: false,
    teamComparisons: false,
    prioritySupport: false,
  },
  PRO: {
    label: "Pro",
    monthlyPrice: 19.99,
    isDemo: false,
    includedAnalyses: 3, // 3 x ~$6 = ~$18 cost at full use on $19.99
    allowsExtraMatches: true,
    fullStats: true,
    aiCoach: true,
    highlights: true,
    progressTracking: true,
    fullAnalysis: true,
    maxAthletes: 1,
    coachDashboard: false,
    teamComparisons: false,
    prioritySupport: true,
  },
};

// Backward-compatible alias used by older code.
export const PLAN_LIMITS = PLAN_FEATURES;

/** Reads the founder override list from the environment. */
function getFounderEmails(): string[] {
  return (process.env.FOUNDER_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Returns the plan that governs this user's access. Founder-listed
 * emails always get Pro with an effectively unlimited analysis cap.
 * Legacy "TEAM" stored values fall back to Pro.
 */
export function getEffectivePlan(user: { email: string; plan: string }): {
  plan: PlanKey;
  isFounderOverride: boolean;
  features: PlanFeatures;
} {
  const founderEmails = getFounderEmails();
  if (user.email && founderEmails.includes(user.email.toLowerCase())) {
    return {
      plan: "PRO",
      isFounderOverride: true,
      features: { ...PLAN_FEATURES.PRO, includedAnalyses: 100000 },
    };
  }
  const resolved: PlanKey =
    user.plan === "PRO" || user.plan === "TEAM" ? "PRO"
    : user.plan === "STARTER" ? "STARTER"
    : "FREE";
  return { plan: resolved, isFounderOverride: false, features: PLAN_FEATURES[resolved] };
}

/** Human-readable label for a plan. */
export function planLabel(plan: PlanKey): string {
  return PLAN_FEATURES[plan]?.label ?? plan;
}
