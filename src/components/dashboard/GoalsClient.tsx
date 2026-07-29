"use client";
import { useState } from "react";
import { Target, Plus, Trash2, Check } from "lucide-react";
import { Card, SectionHeader } from "./ui";
import { ProgressBar, RevealGroup, RevealItem } from "./motion";

const METRICS = [
  { key: "kills", label: "Kills (avg/match)" },
  { key: "blocks", label: "Blocks (avg/match)" },
  { key: "digs", label: "Digs (avg/match)" },
  { key: "aces", label: "Aces (avg/match)" },
  { key: "attackPct", label: "Attack % (avg)" },
  { key: "rating", label: "AI Rating (avg)" },
];

export function GoalsClient({ initialGoals, current, hasMatches }: any) {
  const [goals, setGoals] = useState<any[]>(initialGoals);
  const [metric, setMetric] = useState("kills");
  const [target, setTarget] = useState("");
  const [adding, setAdding] = useState(false);

  async function addGoal() {
    const num = parseFloat(target);
    if (isNaN(num) || num <= 0) return;
    setAdding(true);
    const res = await fetch("/api/goals", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ metric, target: num, timeframe: "per_match" }),
    });
    const data = await res.json();
    if (data.goal) { setGoals([data.goal, ...goals]); setTarget(""); }
    setAdding(false);
  }

  async function removeGoal(id: string) {
    setGoals(goals.filter((g) => g.id !== id));
    await fetch("/api/goals", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  }

  const metricLabel = (k: string) => METRICS.find((m) => m.key === k)?.label || k;

  return (
    <div>
      <SectionHeader title="Goals" sub="Set targets and track your progress toward them" />

      {/* Add goal */}
      <Card className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Target size={16} className="text-brand" />
          <h3 className="text-sm font-semibold">Set a new goal</h3>
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="text-xs text-brand-faint">Metric</label>
            <select value={metric} onChange={(e) => setMetric(e.target.value)}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-[#E4E7EF] bg-white text-sm">
              {METRICS.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
            </select>
          </div>
          <div className="w-28">
            <label className="text-xs text-brand-faint">Target</label>
            <input value={target} onChange={(e) => setTarget(e.target.value)} inputMode="decimal" placeholder="e.g. 20"
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-[#E4E7EF] bg-white text-sm" />
          </div>
          <button onClick={addGoal} disabled={adding || !target}
            className="px-4 py-2.5 rounded-xl text-white text-sm font-medium flex items-center gap-1.5 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#4F7DF3,#6E6BF5)" }}>
            <Plus size={15} /> Add goal
          </button>
        </div>
      </Card>

      {/* Goal list */}
      {goals.length === 0 ? (
        <div className="card p-10 text-center text-brand-muted">
          No goals yet — set one above to start tracking your targets.
        </div>
      ) : (
        <RevealGroup className="space-y-3">
          {goals.map((g) => {
            const cur = current[g.metric] ?? 0;
            const pct = Math.min(100, Math.round((cur / g.target) * 100));
            const done = cur >= g.target;
            return (
              <RevealItem key={g.id}>
              <Card>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{metricLabel(g.metric)}</span>
                    {done && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(20,184,166,0.12)", color: "#0F9488" }}>
                        <Check size={11} /> Reached
                      </span>
                    )}
                  </div>
                  <button onClick={() => removeGoal(g.id)} className="text-brand-faint hover:text-red-500">
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="flex items-center justify-between text-xs text-brand-faint mb-1.5">
                  <span>{hasMatches ? `Current: ${cur}` : "No data yet"}</span>
                  <span>Target: {g.target}</span>
                </div>
                {/* Fills from empty on load — a bar rendered straight at its
                    final width reads as a static graphic, not progress. */}
                <ProgressBar
                  pct={pct}
                  delay={0.12}
                  background={done
                    ? "linear-gradient(90deg,#14B8A6,#0F9488)"
                    : "linear-gradient(90deg,#4F7DF3,#8B5CF6)"}
                />
              </Card>
              </RevealItem>
            );
          })}
        </RevealGroup>
      )}
    </div>
  );
}
