import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getUsageStatus } from "@/lib/usage";
import { EXTRA_MATCH_PRICE } from "@/lib/plan";

// ====================================================================
// UPLOAD ENDPOINT
// Creates a Match row and returns an upload target for the video.
//
// Recommended production path: Mux direct uploads (handles large,
// long match videos with resumable chunked upload out of the box).
// If MUX credentials are absent, we return a dev fallback so the flow
// still works locally without a video host.
//
// Cost control: each plan includes a capped number of analyses per
// month (see src/lib/plan.ts). Once the cap is used up, a user must
// buy an extra-match credit (pay-per-match) before uploading more.
// This keeps every analysis above its real cost.
// ====================================================================

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const usage = await getUsageStatus(userId);
  if (!usage) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // The Free tier is a demo: it can explore /matches/sample but never
  // analyze its own video. Blocked here before any Match row is created.
  if (usage.isDemo) {
    return NextResponse.json(
      {
        error:
          "The Free plan is a demo — you can explore the sample match, but analyzing " +
          "your own video requires a paid plan. Upgrade to Starter ($9.99/mo, 1 match) " +
          "or Pro ($19.99/mo, 3 matches) to analyze your match.",
        code: "DEMO_PLAN",
      },
      { status: 403 }
    );
  }

  if (!usage.canAnalyze) {
    if (usage.needsExtraMatch) {
      return NextResponse.json(
        {
          error: `You've used all ${usage.includedAnalyses} analyses included in your ${usage.plan} plan this month. Buy an extra match analysis for $${EXTRA_MATCH_PRICE.toFixed(2)} to continue.`,
          code: "NEEDS_EXTRA_MATCH",
          extraMatchPrice: EXTRA_MATCH_PRICE,
        },
        { status: 402 }
      );
    }
    return NextResponse.json(
      {
        error: `You've reached your ${usage.plan} plan's limit of ${usage.includedAnalyses} match${usage.includedAnalyses === 1 ? "" : "es"} this month. Upgrade for more.`,
        code: "PLAN_LIMIT_REACHED",
      },
      { status: 403 }
    );
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
