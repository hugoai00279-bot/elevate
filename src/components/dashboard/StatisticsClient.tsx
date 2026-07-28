"use client";
import Link from "next/link";
import { Flame, Shield, Target, Zap, Award, TrendingUp, X as XIcon } from "lucide-react";
import { Card, StatTile, SectionHeader } from "./ui";
import { LockedFeature } from "./LockedFeature";

export function StatisticsClient({ totals, bests, avgs, matchCount, fullStats }: any) {
  if (!matchCount) {
    return (
      <div>
        <SectionHeader title="Statistics" sub="Your season, by the numbers" />
        <div className="card p-10 text-center text-brand-muted">
          Analyze a match to start seeing your statistics here.
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader title="Statistics" sub={`Across ${matchCount} matches`} />

      {/* Season totals */}
      <h3 className="text-sm font-semibold mb-3">Season totals</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <StatTile icon={Flame} label="Kills" value={totals.kills} />
        <StatTile icon={Shield} label="Blocks" value={totals.blocks} />
        <StatTile icon={Target} label="Digs" value={totals.digs} />
        <StatTile icon={Zap} label="Aces" value={totals.aces} />
        <StatTile icon={Award} label="Assists" value={totals.assists} />
        <StatTile icon={XIcon} label="Errors" value={totals.errors} />
      </div>

      {/* Averages per match */}
      <h3 className="text-sm font-semibold mb-3">Averages per match</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <StatTile icon={Flame} label="Kills/match" value={avgs.kills} />
        <StatTile icon={Shield} label="Blocks/match" value={avgs.blocks} />
        <StatTile icon={Target} label="Digs/match" value={avgs.digs} />
        <StatTile icon={Zap} label="Aces/match" value={avgs.aces} />
        <StatTile icon={Award} label="Assists/match" value={avgs.assists} />
        <StatTile icon={XIcon} label="Errors/match" value={avgs.errors} />
      </div>

      {/* Personal bests — a premium flourish */}
      <LockedFeature locked={!fullStats} title="Personal bests">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Award size={16} className="text-brand" />
            <h3 className="text-sm font-semibold">Personal bests</h3>
          </div>
          {bests && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: "Most kills", value: bests.kills, icon: Flame },
                { label: "Most blocks", value: bests.blocks, icon: Shield },
                { label: "Most digs", value: bests.digs, icon: Target },
                { label: "Most aces", value: bests.aces, icon: Zap },
                { label: "Best attack %", value: `${bests.attackPct}%`, icon: TrendingUp },
                { label: "Top rating", value: bests.rating, icon: Award },
              ].map((b) => (
                <div key={b.label} className="rounded-2xl p-4 border relative overflow-hidden"
                  style={{ borderColor: "#EEF0F5", background: "linear-gradient(145deg, rgba(79,125,243,0.05), rgba(139,92,246,0.05))" }}>
                  <b.icon size={16} className="text-brand mb-2" />
                  <div className="text-2xl font-semibold">{b.value}</div>
                  <div className="text-xs text-brand-faint">{b.label}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </LockedFeature>
    </div>
  );
}
