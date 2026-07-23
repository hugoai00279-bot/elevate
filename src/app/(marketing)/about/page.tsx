export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-semibold tracking-tight">About Elevate</h1>
      <div className="prose mt-8 space-y-5 text-brand-muted leading-relaxed">
        <p>
          Elevate exists to give every volleyball player access to the kind of performance
          analysis that used to be reserved for professional teams with full-time analysts.
        </p>
        <p>
          Upload a match, tell us which player is you, and get back a personalized breakdown
          of your game — stats, highlights and coaching insight, all in one place.
        </p>
        <p>
          We&apos;re starting with individual athletes, but we&apos;re building toward team
          accounts, coach dashboards, recruiter tools, and eventually live match analysis
          across multiple sports.
        </p>
      </div>
    </div>
  );
}
