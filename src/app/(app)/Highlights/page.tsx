import { getCurrentUser } from "@/lib/session";
import { getEffectivePlan } from "@/lib/plan";
import { prisma } from "@/lib/prisma";
import { HighlightsClient } from "@/components/dashboard/HighlightsClient";

export default async function HighlightsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const { features } = getEffectivePlan({ email: user.email, plan: user.plan as any });

  const matches = await prisma.match.findMany({
    where: { userId: user.id, status: "COMPLETE" },
    orderBy: { createdAt: "desc" },
    include: { highlights: true },
  });

  const clips = matches.flatMap((m: any) =>
    (m.highlights || []).map((h: any) => ({
      id: h.id, category: h.category, label: h.label,
      startSec: h.startSec, matchTitle: m.title, matchId: m.id,
    }))
  );

  return <HighlightsClient clips={clips} highlightsEnabled={features.highlights} />;
}
