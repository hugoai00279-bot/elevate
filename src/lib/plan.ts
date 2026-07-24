// ====================================================================
// PLAN GATING & UNIT ECONOMICS
// --------------------------------------------------------------------
// Two tiers for now: Free and Pro. (Team was removed until its real
// coach-oversight feature set exists — an analysis "pool" can't be
// priced profitably, so Team returns later as a tools/management plan.)
//
// KEY ECONOMIC RULE:
//   Real video analysis (future CV backend) costs ~$6 per full match.
//   Each plan includes a capped number of analyses; extras are sold at
//   EXTRA_MATCH_PRICE (above cost). Free never triggers a paid analysis.
//
// Founder override: FOUNDER_EMAILS env var (comma separated) grants
// permanent full access without Stripe.
// ====================================================================

export type PlanKey = "FREE" | "PRO";

// Price of one extra match beyond the monthly cap (USD).
// Must stay above real cost (~$6) + Stripe fee to remain profitable.
export const EXTRA_MATCH_PRICE = 7.5;

export interface PlanFeatures {
  label: string;
  monthlyPrice: number;          // USD/month
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
    includedAnalyses: 1,
    allowsExtraMatches: false,
    fullStats: false,
    aiCoach: false,
    highlights: false,
    progressTracking: false,
    fullAnalysis: false, // basic stats only — never calls the paid AI
    maxAthletes: 1,
    coachDashboard: false,
    teamComparisons: false,
    prioritySupport: false,
  },
  PRO: {
    label: "Pro",
    monthlyPrice: 19.99,
    includedAnalyses: 2, // 2 x ~$6 = ~$12 cost, leaves margin on $19.99
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
 * Any legacy "TEAM"/"STARTER" stored values fall back to Pro.
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
  // Free stays Free; everything else (Pro, and legacy Starter/Team) -> Pro.
  const resolved: PlanKey = user.plan === "PRO" || user.plan === "STARTER" || user.plan === "TEAM" ? "PRO" : "FREE";
  return { plan: resolved, isFounderOverride: false, features: PLAN_FEATURES[resolved] };
}

/** Human-readable label for a plan. */
export function planLabel(plan: PlanKey): string {
  return PLAN_FEATURES[plan]?.label ?? plan;
}
