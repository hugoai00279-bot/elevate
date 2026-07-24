import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getEffectivePlan } from "@/lib/plan";
import { ProfileClient } from "@/components/dashboard/ProfileClient";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const matchCount = await prisma.match.count({
    where: { userId: user.id, status: "COMPLETE" },
  });

  const { plan: effectivePlan, isFounderOverride } = getEffectivePlan({
    email: user.email,
    plan: user.plan as any,
  });

  return (
    <ProfileClient
      name={user.name || ""}
      email={user.email}
      plan={effectivePlan}
      isFounderOverride={isFounderOverride}
      matchCount={matchCount}
      profile={{
        position: user.athleteProfile?.position ?? "",
        defaultJersey: user.athleteProfile?.defaultJersey ?? "",
        teamName: user.athleteProfile?.teamName ?? "",
      }}
    />
  );
}
