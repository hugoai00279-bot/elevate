import Link from "next/link";
import { Sparkles, Upload, BarChart3, Film, TrendingUp } from "lucide-react";

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-6">
      {/* Hero */}
      <section className="pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-6 border border-[#DCE4FB] text-brand"
          style={{ background: "rgba(255,255,255,0.7)" }}>
          <Sparkles size={13} /> AI-powered performance analysis
        </div>
        <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.05]">
          Professional AI analysis
          <br /> for every volleyball player.
        </h1>
        <p className="mt-6 text-lg text-brand-muted max-w-xl mx-auto">
          Upload match footage and get automatic stats, highlight reels, and a
          personalized coaching report — built for players, teams, and coaches.
        </p>
        <div className="mt-9 flex items-center justify-center gap-3">
          <Link href="/signup"
            className="px-7 py-3.5 rounded-2xl text-white font-medium flex items-center gap-2 shadow-lg"
            style={{ background: "linear-gradient(135deg,#4F7DF3,#6E6BF5)", boxShadow: "0 12px 24px -8px rgba(79,125,243,0.5)" }}>
            <Upload size={18} /> Get started free
          </Link>
          <Link href="/features" className="px-6 py-3.5 rounded-2xl font-medium border border-[#E4E7EF] bg-white/70">
            See features
          </Link>
        </div>
      </section>

      {/* Feature triad */}
      <section className="grid md:grid-cols-3 gap-5 pb-10">
        {[
          { icon: BarChart3, title: "Automatic stats", body: "Kills, blocks, digs, aces, attack % and an AI match rating — computed per player." },
          { icon: Film, title: "Highlight reels", body: "Your best plays clipped and organized by category, ready to share." },
          { icon: TrendingUp, title: "Season progress", body: "Every match saved to your account so you can track improvement over time." },
        ].map((f) => (
          <div key={f.title} className="card p-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-brand mb-4"
              style={{ background: "rgba(79,125,243,0.1)" }}>
              <f.icon size={19} />
            </div>
            <h3 className="font-semibold">{f.title}</h3>
            <p className="text-sm text-brand-muted mt-1.5">{f.body}</p>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="card p-10 text-center my-10">
        <h2 className="text-2xl font-semibold">Ready to elevate your game?</h2>
        <p className="text-brand-muted mt-2">Create a free account and analyze your first match today.</p>
        <Link href="/signup"
          className="inline-block mt-6 px-7 py-3.5 rounded-2xl text-white font-medium"
          style={{ background: "linear-gradient(135deg,#4F7DF3,#6E6BF5)" }}>
          Create your account
        </Link>
      </section>
    </div>
  );
}
