import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// GET /api/matches — list the current user's matches (their own data only)
export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const matches = await prisma.match.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { stats: true },
  });
  return NextResponse.json({ matches });
}

// PATCH /api/matches — save the player-identification details for a match
export async function PATCH(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { matchId, jerseyNumber, position, selectionX, selectionY, title, opponent } =
    await req.json();

  // Ensure the match belongs to this user before touching it.
  const existing = await prisma.match.findFirst({ where: { id: matchId, userId } });
  if (!existing) return NextResponse.json({ error: "Match not found" }, { status: 404 });

  const match = await prisma.match.update({
    where: { id: matchId },
    data: {
      jerseyNumber: jerseyNumber ?? existing.jerseyNumber,
      position: position ?? existing.position,
      selectionX: selectionX ?? existing.selectionX,
      selectionY: selectionY ?? existing.selectionY,
      title: title ?? existing.title,
      opponent: opponent ?? existing.opponent,
      status: "IDENTIFYING",
    },
  });

  // Remember the athlete's defaults for next time.
  if (position || jerseyNumber) {
    await prisma.athleteProfile.upsert({
      where: { userId },
      update: { position: position ?? undefined, defaultJersey: jerseyNumber ?? undefined },
      create: { userId, position: position ?? null, defaultJersey: jerseyNumber ?? null },
    });
  }

  return NextResponse.json({ match });
}
