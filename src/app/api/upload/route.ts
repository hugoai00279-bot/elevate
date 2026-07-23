import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// ====================================================================
// UPLOAD ENDPOINT
// Creates a Match row and returns an upload target for the video.
//
// Recommended production path: Mux direct uploads (handles large,
// long match videos with resumable chunked upload out of the box).
// If MUX credentials are absent, we return a dev fallback so the flow
// still works locally without a video host.
// ====================================================================

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

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
