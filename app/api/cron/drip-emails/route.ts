
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);

// Service role client — bypasses RLS since this runs without a user session
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const FROM = `ResumeForge <${process.env.FEEDBACK_EMAIL}>`;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

// ── GET — called daily by Vercel Cron ───────────────────────────
export async function GET(req: Request) {
    // Vercel Cron sends CRON_SECRET automatically.
    // Reject requests without a valid secret.
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const results = { day3_sent: 0, day7_sent: 0, errors: [] as string[] };

    // ── Day 3: "Your first generation is free" ─────────────────────
    // Window: signed up 3-4 days ago. The 24h window prevents missed
    // users if the cron runs at a slightly different time than signup.
    // The boolean flag prevents duplicates across runs.
    const day3From = daysAgo(now, 4);
    const day3To = daysAgo(now, 3);

    const { data: day3Users, error: day3Err } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .eq("subscription_tier", "free")
        .eq("day3_email_sent", false)
        .gte("created_at", day3From.toISOString())
        .lt("created_at", day3To.toISOString());

    if (day3Err) results.errors.push(`Day3 query: ${day3Err.message}`);

    for (const user of day3Users ?? []) {
        try {
            await resend.emails.send({
                from: FROM,
                to: user.email,
                subject: "Your first AI generation is free — try it now",
                html: day3Html(user.full_name),
            });
            await supabase
                .from("profiles")
                .update({ day3_email_sent: true })
                .eq("id", user.id);
            results.day3_sent++;
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            results.errors.push(`Day3 → ${user.email}: ${msg}`);
        }
    }

    // ── Day 7: "Here's what Pro users unlock" ──────────────────────
    const day7From = daysAgo(now, 8);
    const day7To = daysAgo(now, 7);

    const { data: day7Users, error: day7Err } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .eq("subscription_tier", "free")
        .eq("day7_email_sent", false)
        .gte("created_at", day7From.toISOString())
        .lt("created_at", day7To.toISOString());

    if (day7Err) results.errors.push(`Day7 query: ${day7Err.message}`);

    for (const user of day7Users ?? []) {
        try {
            await resend.emails.send({
                from: FROM,
                to: user.email,
                subject: "Here's what Pro users unlock on ResumeForge",
                html: day7Html(user.full_name),
            });
            await supabase
                .from("profiles")
                .update({ day7_email_sent: true })
                .eq("id", user.id);
            results.day7_sent++;
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            results.errors.push(`Day7 → ${user.email}: ${msg}`);
        }
    }

    console.log("[Drip Emails]", results);
    return NextResponse.json({ ok: true, ...results });
}

// ── Helpers ──────────────────────────────────────────────────────

function daysAgo(from: Date, days: number): Date {
    const d = new Date(from);
    d.setDate(d.getDate() - days);
    d.setHours(0, 0, 0, 0);
    return d;
}

// ── Day 3 Email ──────────────────────────────────────────────────

function day3Html(name: string | null): string {
    const greeting = name ? `, ${name}` : "";
    return `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
  <h1 style="font-size: 24px; margin-bottom: 8px;">Your first generation is on us${greeting}</h1>
  <p style="font-size: 15px; line-height: 1.6; color: #555;">
    You signed up a few days ago and still have <strong>free AI generations</strong> waiting. Here's what happens when you hit Generate:
  </p>

  <div style="background: #f7f7f7; border-radius: 12px; padding: 24px; margin: 24px 0;">
    <ol style="font-size: 14px; line-height: 2.2; color: #333; padding-left: 20px; margin: 0;">
      <li>Upload your resume (PDF, DOCX, or paste text)</li>
      <li>Paste the job description you're targeting</li>
      <li>Click <strong>Generate</strong> — takes ~30 seconds</li>
      <li>Review the ATS-optimized version with highlighted improvements</li>
      <li>Export as pixel-perfect PDF or editable DOCX</li>
    </ol>
  </div>

  <p style="font-size: 14px; line-height: 1.6; color: #555;">
    Most users see a <strong>30-50% improvement</strong> in their ATS score on the first generation.
  </p>

  <div style="margin: 32px 0;">
    <a href="${APP_URL}/dashboard" style="display: inline-block; background: #0ea5e9; color: #fff; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px;">
      Try your free generation →
    </a>
  </div>

  <p style="font-size: 13px; color: #777; line-height: 1.5;">
    Free plan includes 4 generations per month. No credit card required.
  </p>

  <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0;" />
  <p style="font-size: 12px; color: #999;">
    ResumeForge — AI-powered resume optimization.<br/>
    <a href="${APP_URL}/support" style="color: #999;">Contact support</a> · <a href="${APP_URL}/privacy" style="color: #999;">Privacy</a>
  </p>
</div>`;
}

// ── Day 7 Email ──────────────────────────────────────────────────

function day7Html(name: string | null): string {
    const greeting = name ? ` ${name}` : "";
    return `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
  <h1 style="font-size: 24px; margin-bottom: 8px;">Hey${greeting}, here's what Pro users are getting</h1>
  <p style="font-size: 15px; line-height: 1.6; color: #555;">
    You've been on ResumeForge for a week. Here's a look at what unlocks on the Pro plan:
  </p>

  <table style="width: 100%; margin: 24px 0; border-collapse: collapse; font-size: 14px;">
    <tr>
      <td style="padding: 10px 12px; border-bottom: 1px solid #eee; color: #777;">Feature</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #eee; color: #777; text-align: center;">Free</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #eee; color: #0ea5e9; text-align: center; font-weight: 600;">Pro</td>
    </tr>
    <tr>
      <td style="padding: 10px 12px; border-bottom: 1px solid #eee;">Generations per month</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #eee; text-align: center;">4</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #eee; text-align: center; font-weight: 600; color: #0ea5e9;">Unlimited</td>
    </tr>
    <tr>
      <td style="padding: 10px 12px; border-bottom: 1px solid #eee;">Cover letter generation</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #eee; text-align: center;">—</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #eee; text-align: center; color: #22c55e;">✓</td>
    </tr>
    <tr>
      <td style="padding: 10px 12px; border-bottom: 1px solid #eee;">Bullet regeneration</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #eee; text-align: center;">—</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #eee; text-align: center; color: #22c55e;">✓</td>
    </tr>
    <tr>
      <td style="padding: 10px 12px; border-bottom: 1px solid #eee;">DOCX export</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #eee; text-align: center;">—</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #eee; text-align: center; color: #22c55e;">✓</td>
    </tr>
    <tr>
      <td style="padding: 10px 12px;">Enhancement tones</td>
      <td style="padding: 10px 12px; text-align: center;">Balanced only</td>
      <td style="padding: 10px 12px; text-align: center; font-weight: 600; color: #0ea5e9;">All 3</td>
    </tr>
  </table>

  <div style="margin: 32px 0;">
    <a href="${APP_URL}/pricing" style="display: inline-block; background: #0ea5e9; color: #fff; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px;">
      See Pro plans →
    </a>
  </div>

  <p style="font-size: 13px; color: #777; line-height: 1.5;">
    Pro starts at <strong>$9/month</strong> or <strong>$59/year</strong> (save 45%). One-time Lifetime option also available.
  </p>

  <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0;" />
  <p style="font-size: 12px; color: #999;">
    ResumeForge — AI-powered resume optimization.<br/>
    <a href="${APP_URL}/support" style="color: #999;">Contact support</a> · <a href="${APP_URL}/pricing" style="color: #999;">View plans</a>
  </p>
</div>`;
}
