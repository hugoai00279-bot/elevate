"use client";
import { useState } from "react";
import { Crown, Users, Copy, Check, Flame, Shield, Target, Zap, Trophy } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Card, SectionHeader } from "./ui";

type Athlete = {
  id: string; name: string; position: string | null; jersey: string | null;
  matches: number; kills: number; blocks: number; digs: number; aces: number; avgRating: number; isOwner: boolean;
};

export function TeamClient({
  hasTeam, userEmail, teamName, inviteCode, isOwner, roster,
}: {
  hasTeam: boolean; userEmail: string; teamName?: string; inviteCode?: string; isOwner?: boolean; roster?: Athlete[];
}) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function createTeam() {
    setBusy(true); setError("");
    const res = await fetch("/api/team/create", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setBusy(false); return; }
    window.location.reload();
  }

  async function joinTeam() {
    setBusy(true); setError("");
    const res = await fetch("/api/team/join", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteCode: code }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setBusy(false); return; }
    window.location.reload();
  }

  function copyCode() {
    if (!inviteCode) return;
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  // --- No team yet: create or join --------------------------------
  if (!hasTeam) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Crown size={18} style={{ color: "#8B5CF6" }} />
          <h1 className="text-2xl font-semibold">Team dashboard</h1>
        </div>
        <p className="text-brand-muted mb-6">A Team-plan exclusive. Create your roster or join one with an invite code.</p>

        <div className="grid sm:grid-cols-2 gap-5">
          <div className="rounded-2xl p-6 border" style={{
            background: "linear-gradient(145deg, rgba(139,92,246,0.06), rgba(79,125,243,0.06))",
            borderColor: "#E7E4FB",
          }}>
            <h3 className="text-sm font-semibold mb-1">Start a new team</h3>
            <p className="text-xs text-brand-faint mb-4">Up to 15 athletes, with a shared coach view.</p>
            <input placeholder="Team name (e.g. Riverside HS Varsity)" value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#E4E7EF] bg-white text-sm mb-3" />
            <button onClick={createTeam} disabled={busy}
              className="w-full py-2.5 rounded-xl text-white font-medium text-sm disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#8B5CF6,#4F7DF3)" }}>
              {busy ? "Creating…" : "Create team"}
            </button>
          </div>

          <div className="rounded-2xl p-6 border border-[#EEF0F5] bg-white">
            <h3 className="text-sm font-semibold mb-1">Join a team</h3>
            <p className="text-xs text-brand-faint mb-4">Enter the invite code your coach shared with you.</p>
            <input placeholder="Invite code" value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#E4E7EF] bg-white text-sm mb-3" />
            <button onClick={joinTeam} disabled={busy}
              className="w-full py-2.5 rounded-xl font-medium text-sm disabled:opacity-60"
              style={{ background: "#12141C", color: "white" }}>
              {busy ? "Joining…" : "Join team"}
            </button>
          </div>
        </div>
        {error && <p className="text-sm text-red-500 mt-4">{error}</p>}
      </div>
    );
  }

  // --- Has a team: roster + comparisons ----------------------------
  const chartData = (roster || []).map((a) => ({
    name: a.name.split(" ")[0],
    Kills: a.kills, Blocks: a.blocks, Digs: a.digs, Aces: a.aces,
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Crown size={18} style={{ color: "#8B5CF6" }} />
          <h1 className="text-2xl font-semibold">{teamName}</h1>
        </div>
        {isOwner && inviteCode && (
          <button onClick={copyCode}
            className="flex items-center gap-2 text-xs font-medium px-3.5 py-2 rounded-full"
            style={{ background: "linear-gradient(135deg,rgba(139,92,246,0.1),rgba(79,125,243,0.1))", color: "#6D4CC7" }}>
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? "Copied!" : `Invite code: ${inviteCode}`}
          </button>
        )}
      </div>
      <p className="text-brand-muted mb-6">{roster?.length || 0} of 15 athletes · Team plan</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {(roster || []).map((a) => (
          <div key={a.id} className="rounded-2xl p-5 border relative overflow-hidden"
            style={{ borderColor: "#EEF0F5", background: "white" }}>
            <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-40"
              style={{ background: "radial-gradient(circle, rgba(139,92,246,0.25), transparent 70%)" }} />
            <div className="flex items-center gap-2 mb-3 relative">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                style={{ background: "linear-gradient(135deg,#8B5CF6,#4F7DF3)" }}>
                {a.name.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-semibold flex items-center gap-1">
                  {a.name} {a.isOwner && <Crown size={11} style={{ color: "#8B5CF6" }} />}
                </div>
                <div className="text-xs text-brand-faint">{a.position || "Position not set"}{a.jersey ? ` · #${a.jersey}` : ""}</div>
              </div>
            </div>
            <div className="text-2xl font-semibold" style={{ color: "#12141C" }}>{a.avgRating}</div>
            <div className="text-xs text-brand-faint mb-3">avg AI rating · {a.matches} matches</div>
            <div className="grid grid-cols-4 gap-1.5 text-center">
              {[["K", a.kills], ["B", a.blocks], ["D", a.digs], ["A", a.aces]].map(([label, val]) => (
                <div key={label as string} className="rounded-lg py-1.5" style={{ background: "#F7F8FC" }}>
                  <div className="text-xs font-semibold">{val}</div>
                  <div className="text-[10px] text-brand-faint">{label}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl mb-5" style={{ background: "linear-gradient(180deg, rgba(139,92,246,0.05), transparent)" }}>
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Trophy size={15} style={{ color: "#8B5CF6" }} />
          <h3 className="text-sm font-semibold">Team-wide comparison</h3>
        </div>
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F5" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#9AA2B1" }} />
              <YAxis tick={{ fontSize: 12, fill: "#9AA2B1" }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Kills" fill="#4F7DF3" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Blocks" fill="#14B8A6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Digs" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Aces" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      </div>
    </div>
  );
}
