"use client";
import Link from "next/link";
import { Flame, Shield, Target, Zap, X as XIcon, Play, Users, Eye } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Card, RatingRing, StatTile, SectionHeader } from "./ui";
import { LockedFeature } from "./LockedFeature";
import { Reveal, RevealGroup, RevealItem } from "./motion";

type Match = { id: string; title: string; opponent: string | null; date: string; rating: number };

export function DashboardClient({
  userName, avgRating, season, progress, matches, plan, features, usage, isDemo,
}: {
  userName: string;
  avgRating: number;
  season: { kills: number; blocks: number; digs: number; aces: number; errors: number; count: number };
  progress: { match: string; rating: number }[];
  matches: Match[];
  plan?: string;
  features?: { progressTracking: boolean; coachDashboard: boolean };
  usage?: { includedAnalyses: number; remaining: number; extraCredits: number; isFounder: boolean } | null;
  isDemo?: boolean;
}) {
  const f = features || { progressTracking: true, coachDashboard: false };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <SectionHeader title={`${userName.split(" ")[0]}'s season`} sub={`${season.count} matches analyzed`} />
        {f.coachDashboard && (
          <Link href="/team"
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full text-white shrink-0 -mt-5"
            style={{ background: "linear-gradient(135deg,#8B5CF6,#4F7DF3)" }}>
            <Users size={13} /> Team dashboard
          </Link>
        )}
      </div>

      <RevealGroup className="grid md:grid-cols-3 gap-4 mb-5">
        <RevealItem className="flex">
          <Card className="flex items-center justify-center w-full">
            <RatingRing value={avgRating} label="Avg AI Rating" sub="across your season" />
          </Card>
        </RevealItem>
        <RevealItem className="md:col-span-2">
          <Card className="h-full">
            {/* Tiles stagger across the grid; each number counts up as its
                tile lands, so the block resolves as one sweep. */}
            <RevealGroup className="grid grid-cols-3 gap-4" stagger={0.045} delay={0.06}>
              {[
                { icon: Flame, label: "Kills", value: season.kills },
                { icon: Shield, label: "Blocks", value: season.blocks },
                { icon: Target, label: "Digs", value: season.digs },
                { icon: Zap, label: "Aces", value: season.aces },
                { icon: XIcon, label: "Errors", value: season.errors },
                { icon: Play, label: "Matches", value: season.count },
              ].map((s) => (
                <RevealItem key={s.label} y={6}>
                  <StatTile icon={s.icon} label={s.label} value={s.value} />
                </RevealItem>
              ))}
            </RevealGroup>
          </Card>
        </RevealItem>
      </RevealGroup>

      {/* Demo (Free) plan: the sample match is the thing to do here. */}
      {isDemo && (
        <Reveal delay={0.12}
          className="flex flex-wrap items-center justify-between gap-3 mb-5 px-4 py-3.5 rounded-2xl border"
          style={{ borderColor: "#D9E1FB", background: "rgba(79,125,243,0.06)" }}>
          <div className="text-sm">
            <span className="font-semibold" style={{ color: "#12141C" }}>You&apos;re on the Free demo plan.</span>
            <span className="text-brand-muted"> Explore a full example match, then upgrade to analyze your own.</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/matches/sample"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full text-white"
              style={{ background: "linear-gradient(135deg,#4F7DF3,#6E6BF5)" }}>
              <Eye size={13} /> View sample match
            </Link>
            <Link href="/pricing" className="text-xs font-semibold text-brand">Upgrade →</Link>
          </div>
        </Reveal>
      )}

      {usage && !usage.isFounder && !isDemo && (
        <Reveal delay={0.12}
          className="flex flex-wrap items-center justify-between gap-3 mb-5 px-4 py-3 rounded-2xl border"
          style={{ borderColor: "#EEF0F5", background: "rgba(79,125,243,0.04)" }}>
          <div className="text-sm">
            <span className="font-semibold" style={{ color: "#12141C" }}>
              {usage.remaining} of {usage.includedAnalyses}
            </span>
            <span className="text-brand-muted"> analyses left this month</span>
            {usage.extraCredits > 0 && (
              <span className="text-brand-muted"> · {usage.extraCredits} extra credit{usage.extraCredits === 1 ? "" : "s"}</span>
            )}
          </div>
          <Link href="/pricing" className="text-xs font-semibold text-brand">
            {usage.remaining === 0 ? "Get more →" : "Upgrade →"}
          </Link>
        </Reveal>
      )}

      {progress.length > 1 && (
        <Reveal delay={0.18}>
        <LockedFeature locked={!f.progressTracking} title="Season progress tracking">
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
        </LockedFeature>
        </Reveal>
      )}

      <SectionHeader title="Your matches" />
      <RevealGroup className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" delay={0.2}>
        {matches.map((m) => (
          <RevealItem key={m.id}>
            <Link href={`/matches/${m.id}`} className="card card-lift p-4 block h-full">
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
          </RevealItem>
        ))}
      </RevealGroup>
    </div>
  );
}
