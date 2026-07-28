import { getCurrentUser } from "@/lib/session";
import { getEffectivePlan } from "@/lib/plan";
import { loadUserMatches } from "@/lib/matchData";
import { ProgressClient } from "@/components/dashboard/ProgressClient";

export default async function ProgressPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const { features } = getEffectivePlan({ email: user.email, plan: user.plan as any });
  const matches = await loadUserMatches(user.id);

  // Oldest -> newest for trend charts.
  const series = [...matches].reverse().map((m, i) => ({
    match: `M${i + 1}`,
    rating: m.rating,
    kills: m.kills,
    attackPct: m.attackPct,
  }));

  return <ProgressClient series={series} enabled={features.progressTracking} />;
}
