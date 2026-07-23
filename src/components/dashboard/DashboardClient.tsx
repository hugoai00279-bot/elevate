"use client";
import Link from "next/link";
import { Flame, Shield, Target, Zap, X as XIcon, Play } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Card, RatingRing, StatTile, SectionHeader } from "./ui";

type Match = { id: string; title: string; opponent: string | null; date: string; rating: number };

export function DashboardClient({
  userName, avgRating, season, progress, matches,
}: {
  userName: string;
  avgRating: number;
  season: { kills: number; blocks: number; digs: number; aces: number; errors: number; count: number };
  progress: { match: string; rating: number }[];
  matches: Match[];
}) {
  return (
    <div>
      <SectionHeader title={`${userName.split(" ")[0]}'s season`} sub={`${season.count} matches analyzed`} />

      <div className="grid md:grid-cols-3 gap-4 mb-5">
        <Card className="flex items-center justify-center">
          <RatingRing value={avgRating} label="Avg AI Rating" sub="across your season" />
        </Card>
        <Card className="md:col-span-2">
          <div className="grid grid-cols-3 gap-4">
            <StatTile icon={Flame} label="Kills" value={season.kills} />
            <StatTile icon={Shield} label="Blocks" value={season.blocks} />
            <StatTile icon={Target} label="Digs" value={season.digs} />
            <StatTile icon={Zap} label="Aces" value={season.aces} />
            <StatTile icon={XIcon} label="Errors" value={season.errors} />
            <StatTile icon={Play} label="Matches" value={season.count} />
          </div>
        </Card>
      </div>

      {progress.length > 1 && (
        <Card className="mb-5">
          <h3 className="text-sm font-semibold mb-3">Rating progress</h3>
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <AreaChart data={progress}>
                <defs>
                  <linearGradient id="dashFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4F7DF3" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#4F7DF3" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F5" />
                <XAxis dataKey="match" tick={{ fontSize: 12, fill: "#9AA2B1" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#9AA2B1" }} />
                <Tooltip />
                <Area type="monotone" dataKey="rating" stroke="#4F7DF3" strokeWidth={2} fill="url(#dashFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      <SectionHeader title="Your matches" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {matches.map((m) => (
          <Link key={m.id} href={`/matches/${m.id}`}
            className="card p-4 hover:shadow-md transition-shadow block">
            <div className="w-full rounded-xl mb-3 flex items-center justify-center"
              style={{ aspectRatio: "16/9", background: "linear-gradient(135deg,#4F7DF31A,#8B5CF61A)" }}>
              <Play size={20} className="text-brand" />
            </div>
            <div className="text-sm font-medium">{m.title}</div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-brand-faint">
                {new Date(m.date).toLocaleDateString()}
              </span>
              <span className="text-xs font-semibold text-brand">{m.rating} rating</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
