import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        const { email, name, tier, price } = await req.json();

        if (!email || !tier) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const tierNames: Record<string, string> = {
            pro: "Pro",
            lifetime: "Lifetime",
        };

        const tierFeatures: Record<string, string[]> = {
            pro: [
                "Unlimited resume generations",
                "Cover letter generation",
                "Bullet regeneration",
                "PDF + DOCX export",
                "All enhancement tones",
            ],
            lifetime: [
                "Everything in Pro",
                "Pay once, use forever",
                "All future updates included",
                "Priority email support",
            ],
        };

        await resend.emails.send({
            from: `ResumeForge <${process.env.FEEDBACK_EMAIL}>`,
            to: email,
            subject: `You're on ${tierNames[tier] ?? tier} — here's what's unlocked`,
            html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
          <h1 style="font-size: 24px; margin-bottom: 8px;">Welcome to ${tierNames[tier] ?? tier}${name ? `, ${name}` : ""}</h1>
          <p style="font-size: 15px; line-height: 1.6; color: #555;">
            ${tier === "lifetime" ? "Your one-time payment of" : "You're now subscribed at"} <strong>${price}</strong>. Here's what's unlocked:
          </p>
          <ul style="font-size: 14px; line-height: 2; color: #333; padding-left: 20px;">
            ${(tierFeatures[tier] ?? [])
                    .map((f) => `<li>${f}</li>`)
                    .join("")}
          </ul>
          <div style="margin: 32px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; background: #0ea5e9; color: #fff; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px;">
              Go to Dashboard
            </a>
          </div>
          ${tier !== "lifetime" ? `
          <p style="font-size: 13px; color: #777; line-height: 1.5;">
            You can manage your subscription anytime from your account settings.
          </p>
          ` : ""}
          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0;" />
          <p style="font-size: 12px; color: #999;">
            ResumeForge — AI-powered resume optimization.<br/>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/support" style="color: #999;">Contact support</a> · <a href="${process.env.NEXT_PUBLIC_APP_URL}/pricing" style="color: #999;">View plans</a>
          </p>
        </div>
      `,
        });

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("[Subscription Email]", err);
        return NextResponse.json({ ok: false });
    }
}
