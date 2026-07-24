import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getEffectivePlan } from "@/lib/plan";

// POST /api/team/create { name }
// Creates a new Organization owned by the current user, and joins them
// to it. Only available on the Team plan.
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { features } = getEffectivePlan({ email: user.email, plan: user.plan as any });
  if (!features.coachDashboard) {
    return NextResponse.json({ error: "Team dashboard is a Team-plan feature." }, { status: 403 });
  }

  if (user.organizationId) {
    return NextResponse.json({ error: "You're already part of a team." }, { status: 400 });
  }

  const { name } = await req.json().catch(() => ({ name: null }));

  const org = await prisma.organization.create({
    data: {
      name: name || `${user.name?.split(" ")[0] || "My"}'s Team`,
      ownerId: user.id,
    },
  });

  await prisma.user.update({ where: { id: user.id }, data: { organizationId: org.id } });

  return NextResponse.json({ organization: org });
}
