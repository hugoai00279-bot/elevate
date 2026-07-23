"use client";
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not create account.");
        setLoading(false);
        return;
      }
      // Auto sign-in after registering.
      const signInRes = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (signInRes?.error) {
        setError("Account created — please log in.");
        router.push("/login");
      } else {
        router.push(next);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="card p-8 w-full max-w-sm">
      <h1 className="text-2xl font-semibold">Create your account</h1>
      <p className="text-sm text-brand-muted mt-1">Start analyzing your matches for free.</p>

      <form onSubmit={submit} className="mt-6 space-y-3">
        <input required placeholder="Full name" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-[#E4E7EF] bg-white" />
        <input required type="email" placeholder="Email address" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-[#E4E7EF] bg-white" />
        <input required type="password" placeholder="Password (8+ characters)" minLength={8} value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-[#E4E7EF] bg-white" />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button disabled={loading}
          className="w-full py-3 rounded-xl font-medium text-white disabled:opacity-60"
          style={{ background: "linear-gradient(135deg,#4F7DF3,#6E6BF5)" }}>
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="text-sm text-brand-muted mt-5 text-center">
        Already have an account? <Link href="/login" className="text-brand font-medium">Log in</Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}
