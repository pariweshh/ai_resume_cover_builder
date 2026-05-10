import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type FeedbackType = "feature" | "bug" | "improvement" | "other";

const feedbackLabels: Record<FeedbackType, string> = {
    feature: "Feature Request",
    bug: "Bug Report",
    improvement: "Improvement Suggestion",
    other: "General Feedback",
};

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { type, title, description, email, steps } = body as {
            type: FeedbackType;
            title: string;
            description: string;
            email?: string;
            steps?: string;
        };

        // Validate
        if (!type || !title?.trim() || !description?.trim()) {
            return NextResponse.json(
                { error: "Type, title, and description are required" },
                { status: 400 }
            );
        }

        if (!Object.keys(feedbackLabels).includes(type)) {
            return NextResponse.json(
                { error: "Invalid feedback type" },
                { status: 400 }
            );
        }

        const label = feedbackLabels[type];

        // Build email
        const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0a0a0a; color: #fafafa; border-radius: 12px;">
        <div style="border-bottom: 1px solid #1f1f1f; padding-bottom: 16px; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 18px; color: #0ea5e9;">ResumeForge Feedback</h2>
          <span style="display: inline-block; margin-top: 8px; padding: 4px 10px; background: rgba(14,165,233,0.1); color: #0ea5e9; border-radius: 6px; font-size: 12px; font-weight: 600;">${label}</span>
        </div>

        <div style="margin-bottom: 16px;">
          <h3 style="margin: 0 0 4px; font-size: 14px; color: #a1a1aa;">Title</h3>
          <p style="margin: 0; font-size: 15px; color: #fafafa;">${title}</p>
        </div>

        <div style="margin-bottom: 16px;">
          <h3 style="margin: 0 0 4px; font-size: 14px; color: #a1a1aa;">Description</h3>
          <p style="margin: 0; font-size: 14px; color: #d4d4d8; line-height: 1.6; white-space: pre-wrap;">${description}</p>
        </div>

        ${steps ? `
        <div style="margin-bottom: 16px;">
          <h3 style="margin: 0 0 4px; font-size: 14px; color: #a1a1aa;">Steps to Reproduce</h3>
          <p style="margin: 0; font-size: 14px; color: #d4d4d8; line-height: 1.6; white-space: pre-wrap;">${steps}</p>
        </div>
        ` : ""}

        ${email ? `
        <div style="margin-bottom: 16px;">
          <h3 style="margin: 0 0 4px; font-size: 14px; color: #a1a1aa;">Reply To</h3>
          <p style="margin: 0; font-size: 14px; color: #0ea5e9;">${email}</p>
        </div>
        ` : ""}

        <div style="border-top: 1px solid #1f1f1f; padding-top: 12px; margin-top: 20px;">
          <p style="margin: 0; font-size: 11px; color: #52525b;">
            Submitted at ${new Date().toLocaleString("en-AU", { timeZone: "Australia/Sydney" })} AEST
          </p>
        </div>
      </div>
    `;

        await resend.emails.send({
            from: "ResumeForge <feedback@resend.dev>",
            to: process.env.FEEDBACK_EMAIL!,
            subject: `[${label}] ${title}`,
            html,
            replyTo: email || undefined,
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Feedback error:", err);
        return NextResponse.json(
            { error: "Failed to send feedback" },
            { status: 500 }
        );
    }
}
