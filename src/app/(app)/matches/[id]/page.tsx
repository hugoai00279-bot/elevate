import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getEffectivePlan } from "@/lib/plan";
import { MatchResults } from "@/components/dashboard/MatchResults";

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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
