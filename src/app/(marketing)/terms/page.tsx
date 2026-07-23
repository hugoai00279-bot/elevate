export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-semibold tracking-tight">Terms of Service</h1>
      <p className="text-sm text-brand-faint mt-2">Last updated: {new Date().toLocaleDateString()}</p>
      <div className="mt-8 space-y-6 text-brand-muted leading-relaxed text-sm">
        <p><strong className="text-brand-ink">This is a starter template.</strong> Have a lawyer review your
          final terms before launch.</p>
        <section>
          <h2 className="text-brand-ink font-semibold text-base mb-2">Using Elevate</h2>
          <p>You must be old enough to consent to these terms in your jurisdiction. You&apos;re responsible
            for the content you upload and confirm you have the right to upload it.</p>
        </section>
        <section>
          <h2 className="text-brand-ink font-semibold text-base mb-2">Subscriptions & billing</h2>
          <p>Paid plans are billed through Stripe on a recurring basis until cancelled. You can cancel
            anytime; access continues until the end of the billing period.</p>
        </section>
        <section>
          <h2 className="text-brand-ink font-semibold text-base mb-2">Acceptable use</h2>
          <p>Don&apos;t upload content you don&apos;t have rights to, attempt to disrupt the service, or
            misuse other users&apos; data.</p>
        </section>
        <section>
          <h2 className="text-brand-ink font-semibold text-base mb-2">Analysis accuracy</h2>
          <p>Elevate&apos;s analysis is provided for informational and training purposes and may contain
            errors. It is not a substitute for professional coaching judgment.</p>
        </section>
        <section>
          <h2 className="text-brand-ink font-semibold text-base mb-2">Contact</h2>
          <p>Questions about these terms? Reach us via the Contact page.</p>
        </section>
      </div>
    </div>
  );
}
