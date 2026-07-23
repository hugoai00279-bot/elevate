export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-semibold tracking-tight">Privacy Policy</h1>
      <p className="text-sm text-brand-faint mt-2">Last updated: {new Date().toLocaleDateString()}</p>
      <div className="mt-8 space-y-6 text-brand-muted leading-relaxed text-sm">
        <p><strong className="text-brand-ink">This is a starter template.</strong> Have a lawyer review your
          final privacy policy before launch. The sections below outline what a service like Elevate typically covers.</p>
        <section>
          <h2 className="text-brand-ink font-semibold text-base mb-2">Information we collect</h2>
          <p>Account details you provide (name, email), match videos you upload, and the statistics
            and reports generated from them. We also collect basic usage data to improve the product.</p>
        </section>
        <section>
          <h2 className="text-brand-ink font-semibold text-base mb-2">How we use your information</h2>
          <p>To create your account, analyze your uploaded matches, generate your personalized stats
            and reports, process payments, and keep your data private to you.</p>
        </section>
        <section>
          <h2 className="text-brand-ink font-semibold text-base mb-2">Your data is yours</h2>
          <p>You only ever see your own matches and stats. You can export or delete your data at any
            time from Profile &amp; Settings.</p>
        </section>
        <section>
          <h2 className="text-brand-ink font-semibold text-base mb-2">Third-party services</h2>
          <p>We use trusted processors such as Stripe (payments) and a video host for storage. Each
            handles data under its own privacy terms.</p>
        </section>
        <section>
          <h2 className="text-brand-ink font-semibold text-base mb-2">Contact</h2>
          <p>Questions about privacy? Reach us via the Contact page.</p>
        </section>
      </div>
    </div>
  );
}
