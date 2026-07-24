// ====================================================================
// PLAN GATING & UNIT ECONOMICS
// --------------------------------------------------------------------
// Single source of truth for what each plan can do AND for the cost
// controls that keep every analysis profitable.
//
// KEY ECONOMIC RULE:
//   Real video analysis (via the future CV backend) costs roughly
//   $6 per full match. Therefore every plan includes a capped number
//   of "full analyses" per month, and extra matches beyond the cap are
//   sold as a pay-per-match add-on priced ABOVE cost. No "unlimited".
//
//   Free tier NEVER triggers a paid analysis call — it shows basic
//   stats only, so non-paying users can never cost money.
//
// Founder override: add FOUNDER_EMAILS in Vercel env vars (comma
// separated) to give specific accounts permanent Team-tier access.
// ====================================================================

export type PlanKey = "FREE" | "STARTER" | "PRO" | "TEAM";

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
  maxAthletes: number;           // team roster size (1 = solo)
  coachDashboard: boolean;       // team/coach view
  teamComparisons: boolean;      // team-wide comparison charts
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
  STARTER: {
    label: "Starter",
    monthlyPrice: 12.99,
    includedAnalyses: 1,
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
    monthlyPrice: 29.99,
    includedAnalyses: 4,
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
  TEAM: {
    label: "Team",
    monthlyPrice: 59.99,
    includedAnalyses: 10,
    allowsExtraMatches: true,
    fullStats: true,
    aiCoach: true,
    highlights: true,
    progressTracking: true,
    fullAnalysis: true,
    maxAthletes: 15,
    coachDashboard: true,
    teamComparisons: true,
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
 * Returns the plan that should actually govern this user's access.
 * Founder-listed emails always get TEAM (full access) plus effectively
 * unlimited analyses, regardless of stored plan or Stripe status.
 */
export function getEffectivePlan(user: { email: string; plan: string }): {
  plan: PlanKey;
  isFounderOverride: boolean;
  features: PlanFeatures;
} {
  const founderEmails = getFounderEmails();
  if (user.email && founderEmails.includes(user.email.toLowerCase())) {
    // Founders get Team features but with a very high analysis cap.
    return {
      plan: "TEAM",
      isFounderOverride: true,
      features: { ...PLAN_FEATURES.TEAM, includedAnalyses: 100000 },
    };
  }
  const key = (["FREE", "STARTER", "PRO", "TEAM"].includes(user.plan) ? user.plan : "FREE") as PlanKey;
  return { plan: key, isFounderOverride: false, features: PLAN_FEATURES[key] };
}

/** Human-readable label for a plan. */
export function planLabel(plan: PlanKey): string {
  return PLAN_FEATURES[plan]?.label ?? plan;
}
