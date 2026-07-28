"use client";
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, SectionHeader } from "./ui";
import { LockedFeature } from "./LockedFeature";

function trend(series: any[], key: string) {
  if (series.length < 2) return { dir: "flat", delta: 0 };
  const first = series[0][key], last = series[series.length - 1][key];
  const delta = +(last - first).toFixed(1);
  return { dir: delta > 0 ? "up" : delta < 0 ? "down" : "flat", delta };
}

export function ProgressClient({ series, enabled }: { series: any[]; enabled: boolean }) {
  if (series.length < 2) {
    return (
      <div>
        <SectionHeader title="Progress" sub="Track your improvement over time" />
        <div className="card p-10 text-center text-brand-muted">
          Analyze at least 2 matches to see your progress trends.
        </div>
      </div>
    );
  }

  const ratingTrend = trend(series, "rating");
  const killsTrend = trend(series, "kills");
  const attackTrend = trend(series, "attackPct");

  const TrendBadge = ({ t, suffix = "" }: { t: any; suffix?: string }) => (
    <span className="inline-flex items-center gap-1 text-xs font-semibold"
      style={{ color: t.dir === "up" ? "#14B8A6" : t.dir === "down" ? "#EF4444" : "#9AA2B1" }}>
      {t.dir === "up" ? <TrendingUp size={13} /> : t.dir === "down" ? <TrendingDown size={13} /> : <Minus size={13} />}
      {t.delta > 0 ? "+" : ""}{t.delta}{suffix}
    </span>
  );

  const content = (
    <>
      <div className="grid sm:grid-cols-3 gap-4 mb-5">
        <Card>
          <div className="text-xs text-brand-faint mb-1">AI Rating trend</div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-semibold">{series[series.length - 1].rating}</span>
            <TrendBadge t={ratingTrend} />
          </div>
        </Card>
        <Card>
          <div className="text-xs text-brand-faint mb-1">Kills trend</div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-semibold">{series[series.length - 1].kills}</span>
            <TrendBadge t={killsTrend} />
          </div>
        </Card>
        <Card>
          <div className="text-xs text-brand-faint mb-1">Attack % trend</div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-semibold">{series[series.length - 1].attackPct}%</span>
            <TrendBadge t={attackTrend} suffix="%" />
          </div>
        </Card>
      </div>

      <Card className="mb-5">
        <h3 className="text-sm font-semibold mb-3">AI rating over time</h3>
        <div style={{ width: "100%", height: 240 }}>
          <ResponsiveContainer>
            <AreaChart data={series}>
              <defs>
                <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4F7DF3" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#4F7DF3" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F5" />
              <XAxis dataKey="match" tick={{ fontSize: 12, fill: "#9AA2B1" }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#9AA2B1" }} />
              <Tooltip />
              <Area type="monotone" dataKey="rating" stroke="#4F7DF3" strokeWidth={2} fill="url(#pg)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold mb-3">Kills & attack % by match</h3>
        <div style={{ width: "100%", height: 240 }}>
          <ResponsiveContainer>
            <LineChart data={series}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F5" />
              <XAxis dataKey="match" tick={{ fontSize: 12, fill: "#9AA2B1" }} />
              <YAxis tick={{ fontSize: 12, fill: "#9AA2B1" }} />
              <Tooltip />
              <Line type="monotone" dataKey="kills" stroke="#4F7DF3" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="attackPct" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </>
  );

  return (
    <div>
      <SectionHeader title="Progress" sub="Your improvement across the season" />
      <LockedFeature locked={!enabled} title="Season progress tracking">{content}</LockedFeature>
    </div>
  );
}
