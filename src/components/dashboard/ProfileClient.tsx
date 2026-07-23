"use client";
import { useState } from "react";
import Link from "next/link";
import { Award, CreditCard } from "lucide-react";
import { RatingRing, Card, SectionHeader } from "./ui";

const POSITIONS = ["Outside Hitter", "Opposite", "Setter", "Middle Blocker", "Libero"];

export function ProfileClient({ name, email, plan, matchCount, profile }: any) {
  const [position, setPosition] = useState(profile.position);
  const [jersey, setJersey] = useState(profile.defaultJersey);
  const [team, setTeam] = useState(profile.teamName);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    setSaved(false);
    await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ position, defaultJersey: jersey, teamName: team }),
    }).catch(() => {});
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <SectionHeader title="Profile & Settings" />

      <Card className="mb-5 flex flex-col sm:flex-row sm:items-center gap-5">
        <RatingRing value={Math.min(99, 60 + matchCount * 3)} size={104} label="Player Rating" />
        <div className="flex-1">
          <div className="text-lg font-semibold">{name || "Athlete"}</div>
          <div className="text-sm text-brand-faint">{email}</div>
          <div className="text-sm text-brand-muted mt-1">
            {position || "Position not set"}{jersey ? ` · #${jersey}` : ""}{team ? ` · ${team}` : ""}
          </div>
          <div className="text-xs text-brand-faint mt-2">{matchCount} matches analyzed</div>
        </div>
      </Card>

      <Card className="mb-5">
        <h3 className="text-sm font-semibold mb-4">Athlete details</h3>
        <p className="text-xs text-brand-faint mb-4">
          These pre-fill automatically each time you upload a new match.
        </p>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Default jersey number</label>
            <input value={jersey} onChange={(e) => setJersey(e.target.value)} placeholder="e.g. 7"
              className="w-full mt-1.5 px-4 py-3 rounded-xl border border-[#E4E7EF] bg-white" />
          </div>
          <div>
            <label className="text-sm font-medium">Team name</label>
            <input value={team} onChange={(e) => setTeam(e.target.value)} placeholder="e.g. Riverside HS"
              className="w-full mt-1.5 px-4 py-3 rounded-xl border border-[#E4E7EF] bg-white" />
          </div>
          <div>
            <label className="text-sm font-medium">Position</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1.5">
              {POSITIONS.map((p) => (
                <button key={p} onClick={() => setPosition(p)}
                  className="px-3 py-2.5 rounded-xl border text-sm transition-colors"
                  style={{
                    borderColor: position === p ? "#4F7DF3" : "#E4E7EF",
                    background: position === p ? "rgba(79,125,243,0.08)" : "white",
                    color: position === p ? "#4F7DF3" : "#12141C",
                  }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button onClick={save} disabled={saving}
          className="mt-5 px-6 py-2.5 rounded-xl text-white font-medium disabled:opacity-60"
          style={{ background: "linear-gradient(135deg,#4F7DF3,#6E6BF5)" }}>
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
        </button>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-3">
          <CreditCard size={16} className="text-brand" />
          <h3 className="text-sm font-semibold">Plan & billing</h3>
        </div>
        <p className="text-sm text-brand-muted">
          You&apos;re on the <strong className="text-brand-ink">{plan}</strong> plan.
        </p>
        <Link href="/pricing"
          className="inline-block mt-4 px-5 py-2.5 rounded-xl font-medium text-white text-sm"
          style={{ background: "#12141C" }}>
          {plan === "FREE" ? "Upgrade plan" : "Manage plan"}
        </Link>
      </Card>
    </div>
  );
}
