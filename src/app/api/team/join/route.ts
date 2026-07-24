import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// POST /api/team/join { inviteCode }
// Joins the current user to an existing organization via its invite
// code, enforcing the plan's max-athletes limit.
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { inviteCode } = await req.json().catch(() => ({ inviteCode: "" }));
  if (!inviteCode) return NextResponse.json({ error: "Invite code required." }, { status: 400 });

  const org = await prisma.organization.findUnique({
    where: { inviteCode: String(inviteCode).trim() },
    include: { members: true },
  });
  if (!org) return NextResponse.json({ error: "Invalid invite code." }, { status: 404 });

  if (org.members.length >= 15) {
    return NextResponse.json({ error: "This team has reached its athlete limit." }, { status: 403 });
  }

  await prisma.user.update({ where: { id: user.id }, data: { organizationId: org.id } });

  return NextResponse.json({ organization: { id: org.id, name: org.name } });
}
