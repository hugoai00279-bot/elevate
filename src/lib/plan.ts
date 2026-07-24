// ====================================================================
// PLAN GATING
// --------------------------------------------------------------------
// Single source of truth for what each plan can do, and for granting
// specific accounts (e.g. yours, as the founder) permanent full access
// without needing to pay through Stripe.
//
// To give yourself (or a teammate) free unlimited access:
//   1. In Vercel -> Environment Variables, add FOUNDER_EMAILS
//      e.g. FOUNDER_EMAILS="you@example.com,cofounder@example.com"
//   2. Redeploy.
// That account will now always be treated as the top tier everywhere
// in the app, regardless of what's stored in the database.
// ====================================================================

export type PlanKey = "FREE" | "PRO" | "TEAM";

export const PLAN_LIMITS: Record<PlanKey, { matchesPerMonth: number | null; label: string }> = {
  FREE: { matchesPerMonth: 1, label: "Free" },
  PRO: { matchesPerMonth: null, label: "Pro" }, // null = unlimited
  TEAM: { matchesPerMonth: null, label: "Team" },
};

/** Reads the founder override list from the environment. */
function getFounderEmails(): string[] {
  return (process.env.FOUNDER_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Returns the plan that should actually govern this user's access.
 * Founder-listed emails always get TEAM (full access), regardless of
 * their stored `plan` field or Stripe status.
 */
export function getEffectivePlan(user: { email: string; plan: PlanKey }): {
  plan: PlanKey;
  isFounderOverride: boolean;
} {
  const founderEmails = getFounderEmails();
  if (user.email && founderEmails.includes(user.email.toLowerCase())) {
    return { plan: "TEAM", isFounderOverride: true };
  }
  return { plan: user.plan, isFounderOverride: false };
}

/** Human-readable label for a plan, e.g. for display in the UI. */
export function planLabel(plan: PlanKey): string {
  return PLAN_LIMITS[plan]?.label ?? plan;
}
