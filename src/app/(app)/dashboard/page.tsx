import Link from "next/link";
import { Upload, TrendingUp } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getEffectivePlan } from "@/lib/plan";
import { getUsageStatus } from "@/lib/usage";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Load ONLY this user's matches + stats.
  type StatRow = { rating: number; kills: number; blocks: number; digs: number; aces: number; errors: number } | null;
  type MatchWithStats = {
    id: string; title: string; opponent: string | null; createdAt: Date; stats: StatRow;
  };
  const matches: MatchWithStats[] = await prisma.match.findMany({
    where: { userId: user.id, status: "COMPLETE" },
    orderBy: { createdAt: "desc" },
    include: { stats: true },
  });

  // Aggregate season stats from the user's own completed matches.
  type SeasonAcc = { kills: number; blocks: number; digs: number; aces: number; errors: number; ratingSum: number; count: number };
  const season = matches.reduce(
    (acc: SeasonAcc, m: MatchWithStats) => {
      if (!m.stats) return acc;
      acc.kills += m.stats.kills;
      acc.blocks += m.stats.blocks;
      acc.digs += m.stats.digs;
      acc.aces += m.stats.aces;
      acc.errors += m.stats.errors;
      acc.ratingSum += m.stats.rating;
      acc.count += 1;
      return acc;
    },
    { kills: 0, blocks: 0, digs: 0, aces: 0, errors: 0, ratingSum: 0, count: 0 }
  );

  const avgRating = season.count ? Math.round(season.ratingSum / season.count) : 0;

  const progress = [...matches].reverse().map(
    (m: MatchWithStats, i: number) => ({ match: `M${i + 1}`, rating: m.stats?.rating ?? 0 })
  );

  // New user with no matches yet -> friendly empty state (no demo data).
  if (matches.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-semibold">Welcome, {user.name?.split(" ")[0] || "athlete"}.</h1>
        <p className="text-brand-muted mt-1">Upload your first match to see your personalized analysis.</p>
        <div className="card p-10 mt-8 text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-4"
            style={{ background: "linear-gradient(135deg,#4F7DF3,#8B5CF6)" }}>
            <TrendingUp size={26} />
          </div>
          <h2 className="text-lg font-semibold">No matches yet</h2>
          <p className="text-sm text-brand-muted mt-1 max-w-sm">
            Your stats, highlights and coaching reports will appear here once you analyze a match.
          </p>
          <Link href="/upload"
            className="mt-6 px-6 py-3 rounded-2xl text-white font-medium flex items-center gap-2"
            style={{ background: "linear-gradient(135deg,#4F7DF3,#6E6BF5)" }}>
            <Upload size={18} /> Upload your first match
          </Link>
        </div>
      </div>
    );
  }

  const { plan, features } = getEffectivePlan({ email: user.email, plan: user.plan as any });
  const usage = await getUsageStatus(user.id);

  return (
    <DashboardClient
      userName={user.name || "Athlete"}
      avgRating={avgRating}
      season={season}
      progress={progress}
      plan={plan}
      features={features}
      usage={usage ? {
        includedAnalyses: usage.includedAnalyses,
        remaining: usage.remaining,
        extraCredits: usage.extraCredits,
        isFounder: usage.includedAnalyses > 1000,
      } : null}
      matches={matches.map((m: MatchWithStats) => ({
        id: m.id,
        title: m.title,
        opponent: m.opponent,
        date: m.createdAt.toISOString(),
        rating: m.stats?.rating ?? 0,
      }))}
    />
  );
}
