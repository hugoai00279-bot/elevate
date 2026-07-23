import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { position, defaultJersey, teamName } = await req.json();

  await prisma.athleteProfile.upsert({
    where: { userId },
    update: { position, defaultJersey, teamName },
    create: { userId, position, defaultJersey, teamName, sport: "volleyball" },
  });

  return NextResponse.json({ ok: true });
}
