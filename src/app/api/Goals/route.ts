import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const goals = await prisma.goal.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ goals });
}

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { metric, target, timeframe } = await req.json();
  if (!metric || typeof target !== "number") {
    return NextResponse.json({ error: "metric and numeric target required" }, { status: 400 });
  }
  const goal = await prisma.goal.create({
    data: { userId, metric, target, timeframe: timeframe || "per_match" },
  });
  return NextResponse.json({ goal });
}

export async function DELETE(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { id } = await req.json();
  await prisma.goal.deleteMany({ where: { id, userId } });
  return NextResponse.json({ ok: true });
}
