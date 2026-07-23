import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid form" }, { status: 400 });
  }
  // TODO: wire to an email service (Resend, Postmark) or store in DB.
  // For now we just log it so the form works end to end.
  console.log("Contact form submission:", parsed.data);
  return NextResponse.json({ ok: true });
}
