// ====================================================================
// BUILT-IN SAMPLE MATCH
// --------------------------------------------------------------------
// The Free (demo) tier can't analyze its own video, so instead everyone
// gets this one fully-populated match to explore at /matches/sample.
//
// These numbers are hand-written example data for a fictional match —
// they are NOT the output of the analysis backend. The match page always
// labels this view as a sample so it can't be mistaken for real results.
//
// Shapes here intentionally mirror the Prisma Stat / Highlight /
// CoachingReport models so <MatchResults /> renders it unchanged.
// ====================================================================

export const SAMPLE_MATCH_ID = "sample";

export const sampleMatch = {
  id: SAMPLE_MATCH_ID,
  title: "Sample match — Northside HS",
  opponent: "Northside HS",
  // Fixed date so the sample looks identical for every visitor.
  date: "2026-03-14T18:30:00.000Z",
  jersey: "7",
  position: "Outside Hitter",
};

export const sampleStats = {
  kills: 18,
  blocks: 4,
  digs: 12,
  aces: 3,
  assists: 5,
  errors: 6,
  serves: 21,
  attackPct: 41.9,
  servePct: 88,
  rating: 82,

  // Skill radar (0..100)
  radarAttack: 86,
  radarServe: 74,
  radarBlock: 61,
  radarDig: 70,
  radarSet: 48,
  radarMovement: 79,
};

export const sampleHighlights = [
  { id: "s-k1", category: "Kills",   label: "Line shot past the block", startSec: 214,  endSec: 221 },
  { id: "s-k2", category: "Kills",   label: "Cross-court from zone 4",  startSec: 638,  endSec: 645 },
  { id: "s-k3", category: "Kills",   label: "Tool off the outside arm", startSec: 1094, endSec: 1100 },
  { id: "s-k4", category: "Kills",   label: "Back-row attack",          startSec: 1702, endSec: 1709 },
  { id: "s-a1", category: "Aces",    label: "Deep corner jump serve",   startSec: 402,  endSec: 408 },
  { id: "s-a2", category: "Aces",    label: "Short serve to zone 2",    startSec: 1288, endSec: 1293 },
  { id: "s-b1", category: "Blocks",  label: "Stuff block at the net",   startSec: 876,  endSec: 881 },
  { id: "s-b2", category: "Blocks",  label: "Solo block on the slide",  startSec: 1521, endSec: 1526 },
  { id: "s-r1", category: "Rallies", label: "14-touch rally, dig to kill", startSec: 955, endSec: 972 },
  { id: "s-r2", category: "Rallies", label: "Extended defensive scramble", startSec: 1836, endSec: 1851 },
];

export const sampleReport = {
  summary:
    "Strong offensive match: 18 kills on 43 attempts (41.9%) with most damage coming " +
    "from zone 4 against a single blocker. Serving was aggressive and paid off with 3 " +
    "aces at 88% in. The clearest area to work on is attack error control — 6 errors, " +
    "four of them on out-of-system balls where a higher, safer swing would have kept " +
    "the rally alive. Blocking footwork was late on two slide attacks in set three.",
  strengths: [
    "Consistent line and cross-court options from zone 4 — hard to read",
    "Aggressive jump serve with 3 aces at 88% serve-in",
    "Good transition speed off the net into back-row defense",
  ],
  weaknesses: [
    "Four of six errors came on out-of-system balls — take the higher, safer swing",
    "Late close on slide attacks; start the block move a half-step earlier",
    "Platform angle drifts on hard cross-body serve receive",
  ],
};

/** Everything the match page needs to render the sample, in one call. */
export function getSampleMatch() {
  return {
    match: sampleMatch,
    stats: sampleStats,
    highlights: sampleHighlights,
    report: sampleReport,
  };
}
