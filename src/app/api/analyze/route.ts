import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { runAnalysis } from "@/lib/analysis/provider";

// POST /api/analyze { matchId }
// Runs analysis for a match the user owns, then saves stats, highlights
// and the coaching report. Season stats are simply the aggregate of all
// the user's completed matches, so they update automatically.
export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { matchId } = await req.json();
  const match = await prisma.match.findFirst({ where: { id: matchId, userId } });
  if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });

  await prisma.match.update({ where: { id: matchId }, data: { status: "ANALYZING" } });

  try {
    const result = await runAnalysis({
      matchId: match.id,
      videoUrl: match.videoUrl,
      durationSec: match.durationSec,
      player: {
        jerseyNumber: match.jerseyNumber,
        position: match.position,
        selectionX: match.selectionX,
        selectionY: match.selectionY,
      },
    });

    // Persist everything in a transaction (idempotent-ish: clears old rows).
    await prisma.$transaction([
      prisma.stat.deleteMany({ where: { matchId } }),
      prisma.highlight.deleteMany({ where: { matchId } }),
      prisma.coachingReport.deleteMany({ where: { matchId } }),
      prisma.stat.create({ data: { matchId, ...result.stat } }),
      prisma.highlight.createMany({
        data: result.highlights.map((h) => ({ matchId, ...h })),
      }),
      prisma.coachingReport.create({
        data: {
          matchId,
          summary: result.report.summary,
          strengths: result.report.strengths,
          weaknesses: result.report.weaknesses,
        },
      }),
      prisma.match.update({ where: { id: matchId }, data: { status: "COMPLETE" } }),
    ]);

    return NextResponse.json({ ok: true, simulated: result.simulated, matchId });
  } catch (err) {
    console.error("analyze error", err);
    await prisma.match.update({ where: { id: matchId }, data: { status: "FAILED" } });
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
