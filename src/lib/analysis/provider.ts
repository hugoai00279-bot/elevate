// ====================================================================
// ANALYSIS PROVIDER  —  THE INTEGRATION SEAM
// --------------------------------------------------------------------
// This is the ONLY place that decides how a match's results are
// produced. The rest of the app calls `runAnalysis()` and never cares
// whether the numbers came from a real computer-vision model or the
// built-in simulation.
//
// To connect your real CV backend later:
//   1. Stand up a service that accepts a video + player selection and
//      returns volleyball action detections.
//   2. Set ANALYSIS_API_URL and ANALYSIS_API_KEY in your .env.
//   3. Fill in `realAnalysisProvider` below.
// Nothing else in the codebase needs to change.
// ====================================================================

export interface PlayerSelection {
  jerseyNumber?: string | null;
  position?: string | null;
  // Normalized (0..1) tap location on the first frame — the seed a real
  // tracker uses to lock onto the correct player.
  selectionX?: number | null;
  selectionY?: number | null;
}

export interface AnalysisInput {
  matchId: string;
  videoUrl?: string | null;
  durationSec?: number | null;
  player: PlayerSelection;
}

export interface AnalysisStat {
  kills: number; blocks: number; digs: number; aces: number;
  assists: number; errors: number; serves: number;
  attackPct: number; servePct: number; rating: number;
  radarAttack: number; radarServe: number; radarBlock: number;
  radarDig: number; radarSet: number; radarMovement: number;
}

export interface AnalysisHighlight {
  category: "Kills" | "Aces" | "Blocks" | "Rallies";
  label: string; startSec: number; endSec: number;
}

export interface AnalysisReport {
  summary: string; strengths: string[]; weaknesses: string[];
}

export interface AnalysisResult {
  stat: AnalysisStat;
  highlights: AnalysisHighlight[];
  report: AnalysisReport;
  simulated: boolean; // surfaced in the UI so results are never misrepresented
}

// --------------------------------------------------------------------
// Position-aware simulated provider.
// Deterministic per matchId so a match's results are stable on reload.
// NOTE: These numbers are generated, NOT measured from the video. The
// UI shows a "Demo analysis" badge whenever `simulated` is true.
// --------------------------------------------------------------------
function seededRandom(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

function positionBias(position?: string | null) {
  switch ((position || "").toLowerCase()) {
    case "setter": return { kills: 0.4, blocks: 0.7, digs: 1.1, assists: 4, aces: 0.8 };
    case "libero": return { kills: 0.1, blocks: 0.1, digs: 2.2, assists: 0.6, aces: 0.7 };
    case "middle blocker": return { kills: 1.2, blocks: 2.0, digs: 0.6, assists: 0.3, aces: 0.6 };
    case "opposite": return { kills: 1.6, blocks: 1.2, digs: 0.8, assists: 0.4, aces: 1.0 };
    default: return { kills: 1.4, blocks: 0.9, digs: 1.0, assists: 0.5, aces: 1.1 }; // outside hitter
  }
}

function simulatedProvider(input: AnalysisInput): AnalysisResult {
  const rand = seededRandom(input.matchId + (input.player.jerseyNumber ?? ""));
  const b = positionBias(input.player.position);
  const r = (min: number, max: number) => Math.round(min + rand() * (max - min));

  const kills = Math.round(r(8, 26) * b.kills);
  const blocks = Math.round(r(2, 9) * b.blocks);
  const digs = Math.round(r(6, 22) * b.digs);
  const aces = Math.round(r(0, 6) * b.aces);
  const assists = Math.round(r(1, 12) * b.assists);
  const errors = r(2, 8);
  const serves = r(10, 24);
  const attackAttempts = kills + errors + r(4, 14);
  const attackPct = +(kills / Math.max(1, attackAttempts)).toFixed(3) * 100;
  const servePct = r(78, 96);
  const rating = Math.min(99, Math.max(45, Math.round(55 + kills * 1.1 + blocks * 1.3 + digs * 0.5 + aces * 2 - errors * 1.5)));

  const stat: AnalysisStat = {
    kills, blocks, digs, aces, assists, errors, serves,
    attackPct: +attackPct.toFixed(1), servePct, rating,
    radarAttack: Math.min(99, 50 + kills * 2),
    radarServe: Math.min(99, 40 + aces * 6 + (servePct - 78)),
    radarBlock: Math.min(99, 40 + blocks * 5),
    radarDig: Math.min(99, 40 + digs * 2),
    radarSet: Math.min(99, 35 + assists * 4),
    radarMovement: r(60, 92),
  };

  const highlights: AnalysisHighlight[] = [];
  const catPlan: AnalysisHighlight["category"][] = ["Kills", "Aces", "Blocks", "Rallies"];
  for (const category of catPlan) {
    const n = category === "Kills" ? Math.min(4, Math.ceil(kills / 6)) : r(1, 3);
    for (let i = 0; i < n; i++) {
      const start = r(5, Math.max(6, (input.durationSec ?? 1800) - 20));
      highlights.push({
        category,
        label: `${category.slice(0, -1)} #${i + 1}`,
        startSec: start,
        endSec: start + r(4, 9),
      });
    }
  }

  const strong = stat.radarAttack > stat.radarDig ? "attacking" : "defense";
  const report: AnalysisReport = {
    summary:
      `In this match the tracked player recorded ${kills} kills, ${blocks} blocks and ` +
      `${digs} digs for an AI rating of ${rating}/100. Their strongest area was ${strong}, ` +
      `with the clearest opportunity for growth in ${errors > 5 ? "error reduction" : "serve aggression"}.`,
    strengths: [
      strong === "attacking" ? "Consistent attacking from the front row" : "Reliable back-row defense and dig coverage",
      aces >= 2 ? "Effective serving with multiple aces" : "Steady serve-in percentage under pressure",
      "Good court movement and positioning",
    ],
    weaknesses: [
      errors > 5 ? "Reduce unforced attack errors" : "Add more aggression on serve",
      "Improve platform angle on tough serve-receive",
      "Sharpen timing on transition attacks",
    ],
  };

  return { stat, highlights, report, simulated: true };
}

// --------------------------------------------------------------------
// Real CV provider — FILL THIS IN when your backend exists.
// It must return the same AnalysisResult shape with `simulated: false`.
// --------------------------------------------------------------------
async function realAnalysisProvider(input: AnalysisInput): Promise<AnalysisResult> {
  const res = await fetch(`${process.env.ANALYSIS_API_URL}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.ANALYSIS_API_KEY}`,
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Analysis backend error: ${res.status}`);
  const data = (await res.json()) as Omit<AnalysisResult, "simulated">;
  return { ...data, simulated: false };
}

// --------------------------------------------------------------------
// Public entry point used by the rest of the app.
// --------------------------------------------------------------------
export async function runAnalysis(input: AnalysisInput): Promise<AnalysisResult> {
  if (process.env.ANALYSIS_API_URL && process.env.ANALYSIS_API_KEY) {
    try {
      return await realAnalysisProvider(input);
    } catch (err) {
      console.error("Real analysis failed, falling back to simulation:", err);
    }
  }
  return simulatedProvider(input);
}
