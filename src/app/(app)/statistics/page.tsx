import { getCurrentUser } from "@/lib/session";
import { getEffectivePlan } from "@/lib/plan";
import { loadUserMatches, seasonTotals, personalBests, averages } from "@/lib/matchData";
import { StatisticsClient } from "@/components/dashboard/StatisticsClient";

export default async function StatisticsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const { features } = getEffectivePlan({ email: user.email, plan: user.plan as any });
  const matches = await loadUserMatches(user.id);
  return (
    <StatisticsClient
      totals={seasonTotals(matches)}
      bests={personalBests(matches)}
      avgs={averages(matches)}
      matchCount={matches.length}
      fullStats={features.fullStats}
    />
  );
}
