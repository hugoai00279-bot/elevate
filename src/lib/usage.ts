import { prisma } from "@/lib/prisma";
import { getEffectivePlan } from "@/lib/plan";

export interface UsageStatus {
  plan: string;
  includedAnalyses: number;
  usedThisMonth: number;
  extraCredits: number;
  canAnalyze: boolean;        // can run a full analysis right now
  needsExtraMatch: boolean;   // hit cap, but plan allows buying more
  allowsExtraMatches: boolean;
  fullAnalysis: boolean;      // does this plan get real (costly) analysis at all
  remaining: number;          // included analyses left this month
}

/**
 * Computes where a user stands against their monthly analysis cap.
 * Counts matches created since the start of the current calendar month.
 */
export async function getUsageStatus(userId: string): Promise<UsageStatus | null> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  const { plan, features } = getEffectivePlan({ email: user.email, plan: user.plan as any });

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const usedThisMonth = await prisma.match.count({
    where: { userId, createdAt: { gte: startOfMonth } },
  });

  const remaining = Math.max(0, features.includedAnalyses - usedThisMonth);
  const extraCredits = user.extraMatchCredits ?? 0;

  const withinIncluded = remaining > 0;
  const canUseCredit = extraCredits > 0;
  const canAnalyze = withinIncluded || canUseCredit;
  const needsExtraMatch = !withinIncluded && !canUseCredit && features.allowsExtraMatches;

  return {
    plan,
    includedAnalyses: features.includedAnalyses,
    usedThisMonth,
    extraCredits,
    canAnalyze,
    needsExtraMatch,
    allowsExtraMatches: features.allowsExtraMatches,
    fullAnalysis: features.fullAnalysis,
    remaining,
  };
}

/**
 * Consumes one analysis "slot": prefer an included match; if the monthly
 * cap is used up, consume a purchased extra-match credit instead.
 * Returns true if a slot was successfully consumed.
 */
export async function consumeAnalysisSlot(userId: string): Promise<boolean> {
  const status = await getUsageStatus(userId);
  if (!status) return false;

  if (status.remaining > 0) {
    // Within included cap — nothing to decrement; the match row itself
    // is what counts toward the monthly total.
    return true;
  }
  if (status.extraCredits > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: { extraMatchCredits: { decrement: 1 } },
    });
    return true;
  }
  return false;
}
