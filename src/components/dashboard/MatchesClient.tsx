"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Play, ArrowUpDown, Upload } from "lucide-react";
import { SectionHeader } from "./ui";
import type { LoadedMatch } from "@/lib/matchData";

type SortKey = "date" | "rating" | "kills";

export function MatchesClient({ matches }: { matches: LoadedMatch[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("date");

  const filtered = useMemo(() => {
    let list = matches.filter((m) =>
      (m.title + " " + (m.opponent || "")).toLowerCase().includes(query.toLowerCase())
    );
    list = [...list].sort((a, b) => {
      if (sort === "date") return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sort === "rating") return b.rating - a.rating;
      return b.kills - a.kills;
    });
    return list;
  }, [matches, query, sort]);

  if (!matches.length) {
    return (
      <div>
        <SectionHeader title="My Matches" sub="All your analyzed games in one place" />
        <div className="card p-10 text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-3"
            style={{ background: "linear-gradient(135deg,#4F7DF3,#8B5CF6)" }}>
            <Upload size={22} />
          </div>
          <p className="font-medium">No matches yet</p>
          <p className="text-sm text-brand-muted mt-1 mb-4">Upload your first match to start building your library.</p>
          <Link href="/upload" className="px-5 py-2.5 rounded-xl text-white text-sm font-medium"
            style={{ background: "linear-gradient(135deg,#4F7DF3,#6E6BF5)" }}>Upload match</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader title="My Matches" sub={`${matches.length} analyzed`} />

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-faint" />
          <input value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search matches or opponents…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E4E7EF] bg-white text-sm" />
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-[#E4E7EF] bg-white px-1">
          {(["date", "rating", "kills"] as SortKey[]).map((k) => (
            <button key={k} onClick={() => setSort(k)}
              className="px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors"
              style={{ background: sort === k ? "rgba(79,125,243,0.1)" : "transparent", color: sort === k ? "#4F7DF3" : "#6B7280" }}>
              {k}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((m) => (
          <Link key={m.id} href={`/matches/${m.id}`} className="card p-4 hover:shadow-md transition-shadow block">
            <div className="w-full rounded-xl mb-3 flex items-center justify-center relative"
              style={{ aspectRatio: "16/9", background: "linear-gradient(135deg,#4F7DF31A,#8B5CF61A)" }}>
              <Play size={20} className="text-brand" />
              <span className="absolute top-2 right-2 text-[11px] font-semibold px-2 py-0.5 rounded-full text-white"
                style={{ background: "linear-gradient(135deg,#4F7DF3,#8B5CF6)" }}>{m.rating}</span>
            </div>
            <div className="text-sm font-medium">{m.title}</div>
            <div className="text-xs text-brand-faint mt-0.5">
              {m.opponent ? `vs ${m.opponent} · ` : ""}{new Date(m.date).toLocaleDateString()}
            </div>
            <div className="flex gap-3 mt-2 text-xs text-brand-muted">
              <span>{m.kills} K</span><span>{m.blocks} B</span><span>{m.digs} D</span><span>{m.aces} A</span>
            </div>
          </Link>
        ))}
      </div>
      {!filtered.length && <p className="text-sm text-brand-faint mt-6 text-center">No matches match your search.</p>}
    </div>
  );
}
