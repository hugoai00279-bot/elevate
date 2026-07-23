import { BarChart3, Target, Film, Sparkles, Clock, TrendingUp, Shield, Users } from "lucide-react";

const features = [
  { icon: BarChart3, title: "Per-player statistics", body: "Every kill, block, dig, ace, assist and error attributed to you — not the whole team." },
  { icon: Target, title: "Heat maps & shot charts", body: "See where you move and where your attacks land, plotted on a real court diagram." },
  { icon: Clock, title: "Auto-tagged timeline", body: "Every serve, spike, block and rally marked with a timestamp you can jump to." },
  { icon: Film, title: "Highlight reels", body: "Your best plays clipped automatically and grouped by category." },
  { icon: Sparkles, title: "AI coaching report", body: "Plain-language strengths, weaknesses and specific things to work on." },
  { icon: TrendingUp, title: "Season tracking", body: "All matches saved so your rating and stats update automatically over time." },
  { icon: Shield, title: "Private by default", body: "Your account and data are yours. You only ever see your own matches." },
  { icon: Users, title: "Built to scale", body: "Team accounts, coach dashboards and recruiter views are on the roadmap." },
];

export default function FeaturesPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-semibold tracking-tight text-center">Everything you need to analyze your game</h1>
      <p className="text-brand-muted text-center mt-4 max-w-xl mx-auto">
        Upload once and get a full breakdown of your performance, personalized to you.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-14">
        {features.map((f) => (
          <div key={f.title} className="card p-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-brand mb-4"
              style={{ background: "rgba(79,125,243,0.1)" }}>
              <f.icon size={19} />
            </div>
            <h3 className="font-semibold text-sm">{f.title}</h3>
            <p className="text-sm text-brand-muted mt-1.5">{f.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
