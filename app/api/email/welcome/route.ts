import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        const { email, name } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email required" }, { status: 400 });
        }

        await resend.emails.send({
            from: `ResumeForge <${process.env.FEEDBACK_EMAIL}>`,
            to: email,
            subject: "Welcome to ResumeForge",
            html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
          <h1 style="font-size: 24px; margin-bottom: 8px;">Welcome to ResumeForge${name ? `, ${name}` : ""}</h1>
          <p style="font-size: 15px; line-height: 1.6; color: #555;">
            Thanks for signing up. Here's how to get started:
          </p>
          <div style="background: #f7f7f7; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <h2 style="font-size: 16px; margin-bottom: 12px;">Quick Start</h2>
            <ol style="font-size: 14px; line-height: 2; color: #333; padding-left: 20px;">
              <li><strong>Upload your resume</strong> (PDF, DOCX, or paste text)</li>
              <li><strong>Paste a job description</strong> you're targeting</li>
              <li><strong>Click Generate</strong> — the AI pipeline takes about 30 seconds</li>
              <li><strong>Review and edit</strong> with the inline editor</li>
              <li><strong>Export</strong> as ATS-safe PDF or DOCX</li>
            </ol>
          </div>
          <p style="font-size: 15px; line-height: 1.6; color: #555;">
            You have <strong>4 free generations per month</strong> on the Free plan. Upgrade to Pro for unlimited access, cover letters, and DOCX export.
          </p>
          <div style="margin: 32px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; background: #0ea5e9; color: #fff; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px;">
              Go to Dashboard
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0;" />
          <p style="font-size: 12px; color: #999;">
            ResumeForge — AI-powered resume optimization.<br/>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/support" style="color: #999;">Contact support</a> · <a href="${process.env.NEXT_PUBLIC_APP_URL}/privacy" style="color: #999;">Privacy</a>
          </p>
        </div>
      `,
        });

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("[Welcome Email]", err);
        return NextResponse.json({ ok: false });
    }
}
