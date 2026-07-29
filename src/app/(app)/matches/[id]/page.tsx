import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getEffectivePlan, PLAN_FEATURES } from "@/lib/plan";
import { SAMPLE_MATCH_ID, getSampleMatch } from "@/lib/sampleMatch";
import { MatchResults } from "@/components/dashboard/MatchResults";

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // --- Built-in sample match ----------------------------------------
  // Open to everyone, including the Free/demo tier: it's the whole point
  // of that tier. No ownership check and no feature gating — the sample
  // is meant to show the complete product, clearly labelled as a sample.
  if (id === SAMPLE_MATCH_ID) {
    const sample = getSampleMatch();
    const viewer = await getCurrentUser();
    const viewerIsDemo = viewer
      ? getEffectivePlan({ email: viewer.email, plan: viewer.plan as any }).features.isDemo
      : true;

    return (
      <MatchResults
        match={sample.match}
        stats={sample.stats}
        highlights={sample.highlights}
        report={sample.report}
        features={PLAN_FEATURES.PRO}
        isSample
        // Only nudge people who can't yet analyze their own video.
        showUpgradePrompt={viewerIsDemo}
      />
    );
  }

  const user = await getCurrentUser();
  if (!user) return null;

  // Ownership check baked into the query — users only see their own match.
  const match = await prisma.match.findFirst({
    where: { id, userId: user.id },
    include: { stats: true, highlights: true, report: true },
  });
  if (!match) notFound();

  const { features } = getEffectivePlan({ email: user.email, plan: user.plan as any });

  return (
    <MatchResults
      match={{
        id: match.id,
        title: match.title,
        opponent: match.opponent,
        date: match.createdAt.toISOString(),
        jersey: match.jerseyNumber,
        position: match.position,
      }}
      stats={match.stats}
      highlights={match.highlights}
      report={match.report}
      features={features}
      // Every stored result from the simulated provider is flagged so the
      // UI can show an honest "Demo analysis" badge until real CV is wired.
      simulated={!process.env.ANALYSIS_API_URL}
    />
  );
}
