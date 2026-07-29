"use client";
import { useState } from "react";
import Link from "next/link";
import { Play, Film } from "lucide-react";
import { SectionHeader } from "./ui";
import { LockedFeature } from "./LockedFeature";
import { RevealGroup, RevealItem } from "./motion";

const CAT_COLOR: Record<string, string> = {
  Kills: "#4F7DF3", Aces: "#F59E0B", Blocks: "#14B8A6", Rallies: "#8B5CF6",
};
const CATS = ["All", "Kills", "Aces", "Blocks", "Rallies"];

export function HighlightsClient({ clips, highlightsEnabled }: { clips: any[]; highlightsEnabled: boolean }) {
  const [cat, setCat] = useState("All");
  const shown = cat === "All" ? clips : clips.filter((c) => c.category === cat);

  const inner = (
    <>
      <div className="flex gap-2 mb-5 flex-wrap">
        {CATS.map((c) => (
          <button key={c} onClick={() => setCat(c)}
            className="px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors"
            style={{
              borderColor: cat === c ? "#4F7DF3" : "#E4E7EF",
              background: cat === c ? "rgba(79,125,243,0.08)" : "white",
              color: cat === c ? "#4F7DF3" : "#6B7280",
            }}>
            {c}
          </button>
        ))}
      </div>
      {shown.length ? (
        // Keyed on the category filter so switching tabs replays the sweep.
        <RevealGroup key={cat} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3" stagger={0.04}>
          {shown.map((c) => (
            <RevealItem key={c.id} y={6}>
              <Link href={`/matches/${c.matchId}`}
                className="card-lift rounded-xl overflow-hidden relative flex items-center justify-center group w-full"
                style={{ aspectRatio: "16/9", background: `linear-gradient(135deg, ${CAT_COLOR[c.category] || "#4F7DF3"}33, ${CAT_COLOR[c.category] || "#4F7DF3"}0D)` }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
                  style={{ background: "rgba(255,255,255,0.9)" }}>
                  <Play size={16} style={{ color: CAT_COLOR[c.category] || "#4F7DF3" }} />
                </div>
                <span className="absolute top-1.5 left-2 text-[10px] font-semibold px-1.5 py-0.5 rounded"
                  style={{ background: "rgba(255,255,255,0.85)", color: CAT_COLOR[c.category] || "#4F7DF3" }}>{c.category}</span>
                <span className="absolute bottom-1.5 right-2 text-[10px] text-white/90 font-medium bg-black/30 px-1.5 rounded">
                  {Math.floor(c.startSec / 60)}:{String(Math.floor(c.startSec % 60)).padStart(2, "0")}
                </span>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      ) : (
        <div className="card p-10 text-center text-brand-muted">
          No {cat === "All" ? "" : cat.toLowerCase() + " "}highlights yet.
        </div>
      )}
    </>
  );

  return (
    <div>
      <SectionHeader title="Highlights" sub={`${clips.length} clips across your matches`} />
      <LockedFeature locked={!highlightsEnabled} title="Highlight reels">{inner}</LockedFeature>
    </div>
  );
}
