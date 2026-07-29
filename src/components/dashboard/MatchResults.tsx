"use client";
import Link from "next/link";
import { Flame, Shield, Target, Zap, X as XIcon, TrendingUp, Sparkles, Play, Info, Eye } from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
} from "recharts";
import { Card, RatingRing, StatTile, SectionHeader, CourtDiagram } from "./ui";
import { LockedFeature } from "./LockedFeature";
import { Reveal, RevealGroup, RevealItem } from "./motion";

const CAT_COLOR: Record<string, string> = {
  Kills: "#4F7DF3", Aces: "#F59E0B", Blocks: "#14B8A6", Rallies: "#8B5CF6",
};

export function MatchResults({
  match, stats, highlights, report, features, simulated, isSample, showUpgradePrompt,
}: any) {
  const f = features || { fullStats: true, aiCoach: true, highlights: true };
  if (!stats) {
    return (
      <Card>
        <p className="text-brand-muted">This match hasn&apos;t finished analyzing yet.</p>
      </Card>
    );
  }

  const radar = [
    { skill: "Attack", value: stats.radarAttack },
    { skill: "Serve", value: stats.radarServe },
    { skill: "Block", value: stats.radarBlock },
    { skill: "Dig", value: stats.radarDig },
    { skill: "Set", value: stats.radarSet },
    { skill: "Movement", value: stats.radarMovement },
  ];

  const byCat: Record<string, any[]> = {};
  for (const h of highlights) (byCat[h.category] ||= []).push(h);

  return (
    <div>
      <SectionHeader
        title={match.title}
        sub={`${match.opponent ? "vs " + match.opponent + " · " : ""}${new Date(match.date).toLocaleDateString()}${match.jersey ? " · #" + match.jersey : ""}${match.position ? " · " + match.position : ""}`}
      />

      {isSample && (
        <div className="flex items-start gap-2 text-xs mb-5 px-3 py-2.5 rounded-xl"
          style={{ background: "rgba(79,125,243,0.08)", color: "#2C4FA8" }}>
          <Eye size={14} className="mt-0.5 shrink-0" />
          <span>
            <strong>This is a sample match.</strong> It&apos;s example data for a fictional
            game, included so you can see exactly what Elevate produces — it is not an
            analysis of your video.
          </span>
        </div>
      )}

      {simulated && !isSample && (
        <div className="flex items-center gap-2 text-xs mb-5 px-3 py-2 rounded-xl"
          style={{ background: "rgba(245,158,11,0.1)", color: "#B45309" }}>
          <Info size={14} />
          Demo analysis — these results are simulated. Connect a computer-vision backend to get real match analysis.
        </div>
      )}

      {showUpgradePrompt && (
        <Reveal delay={0.06}
          className="flex flex-wrap items-center justify-between gap-3 mb-5 px-5 py-4 rounded-2xl"
          style={{ background: "linear-gradient(135deg,#4F7DF3,#8B5CF6)" }}>
          <div className="text-white">
            <p className="text-sm font-semibold">Want this for your own match?</p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.85)" }}>
              Upgrade to Starter or Pro to upload your video and get your own stats,
              highlights and coaching report.
            </p>
          </div>
          <Link href="/pricing"
            className="press inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-full shrink-0"
            style={{ background: "white", color: "#3B5FD0" }}>
            <Sparkles size={13} /> Upgrade to analyze your own
          </Link>
        </Reveal>
      )}

      <RevealGroup className="grid md:grid-cols-3 gap-4 mb-5">
        <RevealItem className="flex">
          <Card className="flex items-center justify-center w-full">
            <RatingRing value={stats.rating} label="AI Match Rating" />
          </Card>
        </RevealItem>
        <RevealItem className="md:col-span-2">
          <Card className="h-full">
            <RevealGroup className="grid grid-cols-3 gap-4" stagger={0.045} delay={0.06}>
              {[
                { icon: Flame, label: "Kills", value: stats.kills },
                { icon: Shield, label: "Blocks", value: stats.blocks },
                { icon: Target, label: "Digs", value: stats.digs },
                { icon: Zap, label: "Aces", value: stats.aces },
                { icon: TrendingUp, label: "Attack %", value: stats.attackPct, suffix: "%" },
                { icon: XIcon, label: "Errors", value: stats.errors },
              ].map((s) => (
                <RevealItem key={s.label} y={6}>
                  <StatTile icon={s.icon} label={s.label} value={s.value} suffix={s.suffix ?? ""} />
                </RevealItem>
              ))}
            </RevealGroup>
          </Card>
        </RevealItem>
      </RevealGroup>

      <Reveal delay={0.16}>
      <Card className="mb-5">
        <h3 className="text-sm font-semibold mb-3">Skill radar</h3>
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <RadarChart data={radar} outerRadius="75%">
              <PolarGrid stroke="#EEF0F5" />
              <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12, fill: "#6B7280" }} />
              <Radar dataKey="value" stroke="#4F7DF3" fill="#4F7DF3" fillOpacity={0.25} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      </Reveal>

      <RevealGroup className="grid md:grid-cols-2 gap-4 mb-5" delay={0.2}>
        <RevealItem>
        <LockedFeature locked={!f.fullStats} title="Heat map">
          <Card>
            <h3 className="text-sm font-semibold mb-3">Heat map</h3>
            <CourtDiagram>
              {[[70,40,18],[130,70,26],[230,55,22],[300,100,30],[90,140,14],[260,150,20]].map(([x,y,r],i)=>(
                <div key={i} className="absolute rounded-full"
                  style={{ left:`${(x/400)*100}%`, top:`${(y/200)*100}%`, width:r*2, height:r*2,
                    transform:"translate(-50%,-50%)",
                    background:"radial-gradient(circle, rgba(79,125,243,0.45), rgba(139,92,246,0.05) 70%)" }} />
              ))}
            </CourtDiagram>
          </Card>
        </LockedFeature>
        </RevealItem>
        <RevealItem>
        <LockedFeature locked={!f.fullStats} title="Shot chart">
          <Card>
            <h3 className="text-sm font-semibold mb-3">Shot chart</h3>
            <CourtDiagram>
              {[[80,60,"#4F7DF3"],[150,40,"#4F7DF3"],[210,90,"#4F7DF3"],[320,50,"#EF4444"],[280,130,"#4F7DF3"],[350,150,"#14B8A6"]].map(([x,y,c],i)=>(
                <div key={i} className="absolute w-2.5 h-2.5 rounded-full"
                  style={{ left:`${(Number(x)/400)*100}%`, top:`${(Number(y)/200)*100}%`,
                    transform:"translate(-50%,-50%)", background:c as string, boxShadow:`0 0 0 4px ${c}22` }} />
              ))}
            </CourtDiagram>
          </Card>
        </LockedFeature>
        </RevealItem>
      </RevealGroup>

      {/* Highlights */}
      <SectionHeader title="Highlights" />
      <LockedFeature locked={!f.highlights} title="Highlight reels">
        <div className="space-y-6 mb-5">
          {Object.entries(byCat).map(([cat, clips]) => (
            <div key={cat}>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full" style={{ background: CAT_COLOR[cat] || "#4F7DF3" }} />
                <h3 className="text-sm font-semibold">{cat}</h3>
                <span className="text-xs text-brand-faint">{(clips as any[]).length} clips</span>
              </div>
              <RevealGroup className="grid grid-cols-2 sm:grid-cols-3 gap-3" stagger={0.04}>
                {(clips as any[]).map((c: any) => (
                  <RevealItem key={c.id} y={6} className="rounded-xl overflow-hidden relative flex items-center justify-center"
                    style={{ aspectRatio:"16/9", background:`linear-gradient(135deg, ${CAT_COLOR[cat]||"#4F7DF3"}33, ${CAT_COLOR[cat]||"#4F7DF3"}0D)` }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background:"rgba(255,255,255,0.85)" }}>
                      <Play size={14} style={{ color: CAT_COLOR[cat] || "#4F7DF3" }} />
                    </div>
                    <span className="absolute bottom-1.5 right-2 text-[10px] font-medium">
                      {Math.floor(c.startSec/60)}:{String(Math.floor(c.startSec%60)).padStart(2,"0")}
                    </span>
                  </RevealItem>
                ))}
              </RevealGroup>
            </div>
          ))}
        </div>
      </LockedFeature>

      {/* Coaching report */}
      {report && (
        <>
          <SectionHeader title="AI Coach" />
          <LockedFeature locked={!f.aiCoach} title="AI coaching reports">
            <Reveal>
              <Card className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={16} className="text-brand" />
                  <h3 className="text-sm font-semibold">Key takeaway</h3>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "#3A3F4B" }}>{report.summary}</p>
              </Card>
            </Reveal>
            <RevealGroup className="grid sm:grid-cols-2 gap-4" delay={0.08}>
              <RevealItem>
                <Card className="h-full">
                  <h4 className="text-sm font-semibold mb-2">Keep doing</h4>
                  <ul className="text-sm space-y-2" style={{ color: "#3A3F4B" }}>
                    {report.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                  </ul>
                </Card>
              </RevealItem>
              <RevealItem>
                <Card className="h-full">
                  <h4 className="text-sm font-semibold mb-2">Work on</h4>
                  <ul className="text-sm space-y-2" style={{ color: "#3A3F4B" }}>
                    {report.weaknesses.map((s: string, i: number) => <li key={i}>{s}</li>)}
                  </ul>
                </Card>
              </RevealItem>
            </RevealGroup>
          </LockedFeature>
        </>
      )}
    </div>
  );
}
