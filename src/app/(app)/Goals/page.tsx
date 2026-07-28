import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { loadUserMatches, averages, seasonTotals } from "@/lib/matchData";
import { GoalsClient } from "@/components/dashboard/GoalsClient";

export default async function GoalsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const goals = await prisma.goal.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  const matches = await loadUserMatches(user.id);
  const avgs = averages(matches);
  const totals = seasonTotals(matches);

  // Current value for each metric, for progress bars.
  const current: Record<string, number> = {
    kills: avgs.kills, blocks: avgs.blocks, digs: avgs.digs, aces: avgs.aces,
    rating: totals.avgRating, attackPct: matches.length ? +(matches.reduce((a, m) => a + m.attackPct, 0) / matches.length).toFixed(1) : 0,
  };

  return <GoalsClient initialGoals={goals.map((g:any)=>({id:g.id,metric:g.metric,target:g.target,timeframe:g.timeframe}))} current={current} hasMatches={matches.length > 0} />;
}
