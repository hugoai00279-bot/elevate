import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getEffectivePlan, PLAN_LIMITS } from "@/lib/plan";

// ====================================================================
// UPLOAD ENDPOINT
// Creates a Match row and returns an upload target for the video.
//
// Recommended production path: Mux direct uploads (handles large,
// long match videos with resumable chunked upload out of the box).
// If MUX credentials are absent, we return a dev fallback so the flow
// still works locally without a video host.
//
// Plan enforcement: Free-tier accounts are limited to a set number of
// matches per calendar month (see src/lib/plan.ts). Founder-listed
// emails and paid plans bypass this limit.
// ====================================================================

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { plan: effectivePlan } = getEffectivePlan({ email: user.email, plan: user.plan as any });
  const limit = PLAN_LIMITS[effectivePlan].matchesPerMonth;

  if (limit !== null) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const matchesThisMonth = await prisma.match.count({
      where: { userId, createdAt: { gte: startOfMonth } },
    });

    if (matchesThisMonth >= limit) {
      return NextResponse.json(
        {
          error: `You've reached the Free plan's limit of ${limit} match${limit === 1 ? "" : "es"} this month. Upgrade to Pro for unlimited uploads.`,
          code: "PLAN_LIMIT_REACHED",
        },
        { status: 403 }
      );
    }
  }

  const { title, opponent } = await req.json().catch(() => ({}));

  // Create the match record up-front in UPLOADED state.
  const match = await prisma.match.create({
    data: {
      userId,
      title: title || "Untitled match",
      opponent: opponent || null,
      status: "UPLOADED",
    },
  });

  // --- Mux direct upload (preferred) --------------------------------
  if (process.env.MUX_TOKEN_ID && process.env.MUX_TOKEN_SECRET) {
    try {
      const auth = Buffer.from(
        `${process.env.MUX_TOKEN_ID}:${process.env.MUX_TOKEN_SECRET}`
      ).toString("base64");

      const res = await fetch("https://api.mux.com/video/v1/uploads", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Basic ${auth}` },
        body: JSON.stringify({
          new_asset_settings: { playback_policy: ["public"] },
          cors_origin: process.env.NEXT_PUBLIC_APP_URL || "*",
        }),
      });
      const data = await res.json();

      await prisma.match.update({
        where: { id: match.id },
        data: { videoAssetId: data.data?.id ?? null },
      });

      return NextResponse.json({
        matchId: match.id,
        uploadUrl: data.data?.url, // PUT the file bytes here from the client
        provider: "mux",
      });
    } catch (err) {
      console.error("Mux upload error", err);
    }
  }

  // --- Dev fallback (no video host configured) ----------------------
  return NextResponse.json({
    matchId: match.id,
    uploadUrl: null,
    provider: "none",
    note: "No video host configured — the file will not actually be stored in this dev mode, but the match flow works end to end.",
  });
}
