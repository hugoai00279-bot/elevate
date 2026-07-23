"use client";
import { useState } from "react";
import { Mail } from "lucide-react";

export default function ContactPage() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setState(res.ok ? "sent" : "error");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-20">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-6"
        style={{ background: "linear-gradient(135deg,#4F7DF3,#8B5CF6)" }}>
        <Mail size={22} />
      </div>
      <h1 className="text-4xl font-semibold tracking-tight">Contact us</h1>
      <p className="text-brand-muted mt-3">Questions, feedback, or partnership ideas? We&apos;d love to hear from you.</p>

      {state === "sent" ? (
        <div className="card p-8 mt-8 text-center">
          <p className="font-medium">Thanks — your message is on its way.</p>
          <p className="text-sm text-brand-muted mt-1">We&apos;ll get back to you soon.</p>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-8 space-y-4">
          <input required placeholder="Your name" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-[#E4E7EF] bg-white" />
          <input required type="email" placeholder="Email address" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-[#E4E7EF] bg-white" />
          <textarea required placeholder="How can we help?" rows={5} value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-[#E4E7EF] bg-white resize-none" />
          {state === "error" && <p className="text-sm text-red-500">Something went wrong. Please try again.</p>}
          <button disabled={state === "sending"}
            className="w-full py-3 rounded-xl font-medium text-white disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#4F7DF3,#6E6BF5)" }}>
            {state === "sending" ? "Sending…" : "Send message"}
          </button>
        </form>
      )}
    </div>
  );
}
