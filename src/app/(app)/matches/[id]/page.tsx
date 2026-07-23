import { notFound } from "next/navigation";
import { getCurrentUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { MatchResults } from "@/components/dashboard/MatchResults";

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  if (!userId) return null;

  // Ownership check baked into the query — users only see their own match.
  const match = await prisma.match.findFirst({
    where: { id, userId },
    include: { stats: true, highlights: true, report: true },
  });
  if (!match) notFound();

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
      // Every stored result from the simulated provider is flagged so the
      // UI can show an honest "Demo analysis" badge until real CV is wired.
      simulated={!process.env.ANALYSIS_API_URL}
    />
  );
}
