import { prisma } from "@/lib/prisma";

// Shared loader: pulls a user's completed matches with stats, and
// computes season aggregates + personal bests. Used across the new
// Statistics / Progress / Highlights / Matches pages so they all stay
// consistent and personalised to the logged-in user.
export interface LoadedMatch {
  id: string;
  title: string;
  opponent: string | null;
  date: string;
  rating: number;
  kills: number; blocks: number; digs: number; aces: number;
  assists: number; errors: number; attackPct: number;
}

export async function loadUserMatches(userId: string): Promise<LoadedMatch[]> {
  const matches = await prisma.match.findMany({
    where: { userId, status: "COMPLETE" },
    orderBy: { createdAt: "desc" },
    include: { stats: true },
  });
  return matches
    .filter((m: any) => m.stats)
    .map((m: any) => ({
      id: m.id,
      title: m.title,
      opponent: m.opponent,
      date: m.createdAt.toISOString(),
      rating: m.stats.rating,
      kills: m.stats.kills,
      blocks: m.stats.blocks,
      digs: m.stats.digs,
      aces: m.stats.aces,
      assists: m.stats.assists,
      errors: m.stats.errors,
      attackPct: m.stats.attackPct,
    }));
}

export function seasonTotals(matches: LoadedMatch[]) {
  const t = { kills: 0, blocks: 0, digs: 0, aces: 0, assists: 0, errors: 0, ratingSum: 0, count: matches.length };
  for (const m of matches) {
    t.kills += m.kills; t.blocks += m.blocks; t.digs += m.digs;
    t.aces += m.aces; t.assists += m.assists; t.errors += m.errors;
    t.ratingSum += m.rating;
  }
  return { ...t, avgRating: t.count ? Math.round(t.ratingSum / t.count) : 0 };
}

export function personalBests(matches: LoadedMatch[]) {
  if (!matches.length) return null;
  const best = (key: keyof LoadedMatch) =>
    matches.reduce((mx, m) => (Number(m[key]) > mx ? Number(m[key]) : mx), 0);
  return {
    kills: best("kills"), blocks: best("blocks"), digs: best("digs"),
    aces: best("aces"), rating: best("rating"), attackPct: best("attackPct"),
  };
}

export function averages(matches: LoadedMatch[]) {
  const s = seasonTotals(matches);
  const n = Math.max(1, s.count);
  return {
    kills: +(s.kills / n).toFixed(1),
    blocks: +(s.blocks / n).toFixed(1),
    digs: +(s.digs / n).toFixed(1),
    aces: +(s.aces / n).toFixed(1),
    assists: +(s.assists / n).toFixed(1),
    errors: +(s.errors / n).toFixed(1),
  };
}
