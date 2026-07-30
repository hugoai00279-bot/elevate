import Link from "next/link";
import { Upload, TrendingUp, Eye, Sparkles } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getEffectivePlan } from "@/lib/plan";
import { getUsageStatus } from "@/lib/usage";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { Reveal } from "@/components/motion";

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

  const { plan, features } = getEffectivePlan({ email: user.email, plan: user.plan as any });
  const usage = await getUsageStatus(user.id);

  // New user with no matches yet -> friendly empty state (no demo data).
  // On the Free/demo plan the primary action is the sample match, since
  // uploading their own video isn't available to them.
  if (matches.length === 0) {
    return (
      <Reveal>
        <h1 className="text-2xl font-semibold">Welcome, {user.name?.split(" ")[0] || "athlete"}.</h1>
        <p className="text-brand-muted mt-1">
          {features.isDemo
            ? "Explore the sample match to see what Elevate produces."
            : "Upload your first match to see your personalized analysis."}
        </p>
        <div className="card p-10 mt-8 text-center flex flex-col items-center relative overflow-hidden">
          {/* Soft brand glow so the first screen after signing in isn't a
              plain white box — this is the only view a Free/demo user
              lands on, so it carries the theme on its own. */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 pointer-events-none"
            style={{
              width: 420, height: 260,
              background: "radial-gradient(ellipse, rgba(79,125,243,0.16), transparent 70%)",
              filter: "blur(24px)",
            }} />
          <div className="float-y w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-4 relative"
            style={{
              background: "linear-gradient(135deg,#4F7DF3,#8B5CF6)",
              boxShadow: "0 16px 34px -12px rgba(79,125,243,0.6)",
            }}>
            <TrendingUp size={26} />
          </div>
          <h2 className="text-lg font-semibold">No matches yet</h2>
          <p className="text-sm text-brand-muted mt-1 max-w-sm">
            {features.isDemo
              ? "You're on the Free demo plan. Take a look at the full sample match, then upgrade to Starter or Pro to analyze your own video."
              : "Your stats, highlights and coaching reports will appear here once you analyze a match."}
          </p>
          {features.isDemo ? (
            <div className="mt-6 flex flex-col sm:flex-row gap-3 relative">
              <Link href="/matches/sample"
                className="press sheen px-6 py-3 rounded-2xl text-white font-medium flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg,#4F7DF3,#6E6BF5)",
                  boxShadow: "0 14px 30px -12px rgba(79,125,243,0.6)",
                }}>
                <Eye size={18} /> View sample match
              </Link>
              <Link href="/pricing"
                className="press px-6 py-3 rounded-2xl font-medium flex items-center justify-center gap-2 border bg-white"
                style={{ borderColor: "#E4E7EF", color: "#12141C" }}>
                <Sparkles size={16} /> Upgrade to analyze your own
              </Link>
            </div>
          ) : (
            <Link href="/upload"
              className="press sheen mt-6 px-6 py-3 rounded-2xl text-white font-medium flex items-center gap-2 relative"
              style={{
                background: "linear-gradient(135deg,#4F7DF3,#6E6BF5)",
                boxShadow: "0 14px 30px -12px rgba(79,125,243,0.6)",
              }}>
              <Upload size={18} /> Upload your first match
            </Link>
          )}
        </div>
      </Reveal>
    );
  }

  return (
    <DashboardClient
      userName={user.name || "Athlete"}
      avgRating={avgRating}
      season={season}
      progress={progress}
      plan={plan}
      features={features}
      isDemo={features.isDemo}
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
