import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getEffectivePlan } from "@/lib/plan";
import { TeamClient } from "@/components/dashboard/TeamClient";

export default async function TeamPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const { features } = getEffectivePlan({ email: user.email, plan: user.plan as any });
  if (!features.coachDashboard) redirect("/pricing");

  let organization = user.organizationId
    ? await prisma.organization.findUnique({
        where: { id: user.organizationId },
        include: {
          members: {
            include: {
              matches: {
                where: { status: "COMPLETE" },
                include: { stats: true },
                orderBy: { createdAt: "desc" },
              },
              athleteProfile: true,
            },
          },
        },
      })
    : null;

  if (!organization) {
    return <TeamClient hasTeam={false} userEmail={user.email} />;
  }

  type MemberRow = {
    id: string; name: string | null; email: string;
    athleteProfile: { position: string | null; defaultJersey: string | null } | null;
    matches: { stats: { kills: number; blocks: number; digs: number; aces: number; rating: number } | null }[];
  };
  type Totals = { kills: number; blocks: number; digs: number; aces: number; ratingSum: number; count: number };

  const roster = (organization.members as MemberRow[]).map((m) => {
    const completedMatches = m.matches;
    const totals = completedMatches.reduce(
      (acc: Totals, match) => {
        if (!match.stats) return acc;
        acc.kills += match.stats.kills;
        acc.blocks += match.stats.blocks;
        acc.digs += match.stats.digs;
        acc.aces += match.stats.aces;
        acc.ratingSum += match.stats.rating;
        acc.count += 1;
        return acc;
      },
      { kills: 0, blocks: 0, digs: 0, aces: 0, ratingSum: 0, count: 0 }
    );
    return {
      id: m.id,
      name: m.name || m.email,
      position: m.athleteProfile?.position || null,
      jersey: m.athleteProfile?.defaultJersey || null,
      matches: totals.count,
      kills: totals.kills,
      blocks: totals.blocks,
      digs: totals.digs,
      aces: totals.aces,
      avgRating: totals.count ? Math.round(totals.ratingSum / totals.count) : 0,
      isOwner: m.id === organization!.ownerId,
    };
  });

  return (
    <TeamClient
      hasTeam
      userEmail={user.email}
      teamName={organization.name}
      inviteCode={organization.inviteCode}
      isOwner={organization.ownerId === user.id}
      roster={roster}
    />
  );
}
