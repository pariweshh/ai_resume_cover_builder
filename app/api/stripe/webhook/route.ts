import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe";
import { getTierFromPriceId } from "@/lib/subscription";
import Stripe from "stripe";

const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ── Email helpers ─────────────────────────────────────────────
async function sendSubscriptionEmail(
    email: string,
    name: string,
    tier: string,
    price: string
) {
    try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/subscription`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, name, tier, price }),
        });
    } catch {
        // Non-critical — don't fail the webhook
    }
}

// ── Webhook handler ───────────────────────────────────────────
export async function POST(req: Request) {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");

    if (!sig) {
        return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    try {
        switch (event.type) {
            // ─────────────────────────────────────────────────────
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.metadata?.user_id;
                if (!userId) break;

                const isOneTime = session.mode === "payment";
                const isSubscription = session.mode === "subscription";

                if (isOneTime) {
                    // Lifetime — one-time payment
                    const lineItems = await stripe.checkout.sessions.listLineItems(
                        session.id,
                        { limit: 1 }
                    );
                    const priceId = lineItems.data[0]?.price?.id;
                    const tier = getTierFromPriceId(priceId ?? "");

                    await admin
                        .from("profiles")
                        .update({
                            subscription_tier: tier,
                            subscription_status: "active",
                            stripe_customer_id: session.customer as string,
                        })
                        .eq("id", userId);

                    // Send confirmation email
                    const { data: profile } = await admin
                        .from("profiles")
                        .select("email, full_name")
                        .eq("id", userId)
                        .single();

                    if (profile?.email) {
                        sendSubscriptionEmail(
                            profile.email,
                            profile.full_name ?? "",
                            tier,
                            "$149"
                        );
                    }
                }

                if (isSubscription) {
                    // Pro — monthly or yearly subscription
                    const subscription = await stripe.subscriptions.retrieve(
                        session.subscription as string
                    );

                    const firstItem = subscription.items.data[0];
                    if (!firstItem) break;

                    const priceId = firstItem.price.id;
                    const tier = getTierFromPriceId(priceId);
                    const periodEnd = firstItem.current_period_end;

                    await admin
                        .from("profiles")
                        .update({
                            subscription_tier: tier,
                            stripe_subscription_id: subscription.id,
                            stripe_customer_id: session.customer as string,
                            subscription_status: "active",
                            current_period_end: periodEnd
                                ? new Date(periodEnd * 1000).toISOString()
                                : null,
                        })
                        .eq("id", userId);

                    // Send confirmation email
                    const { data: profile } = await admin
                        .from("profiles")
                        .select("email, full_name")
                        .eq("id", userId)
                        .single();

                    if (profile?.email) {
                        const priceDisplay =
                            firstItem.price.recurring?.interval === "year"
                                ? "$79/year"
                                : "$9/month";
                        sendSubscriptionEmail(
                            profile.email,
                            profile.full_name ?? "",
                            tier,
                            priceDisplay
                        );
                    }
                }

                break;
            }

            // ─────────────────────────────────────────────────────
            case "customer.subscription.updated": {
                const sub = event.data.object as Stripe.Subscription;
                const customerId = sub.customer as string;

                const { data: profile } = await admin
                    .from("profiles")
                    .select("id")
                    .eq("stripe_customer_id", customerId)
                    .single();

                if (!profile) break;

                const firstItem = sub.items.data[0];
                const priceId = firstItem?.price.id;
                const tier = getTierFromPriceId(priceId ?? "");
                const periodEnd = firstItem?.current_period_end;

                const status =
                    sub.status === "active"
                        ? "active"
                        : sub.status === "past_due"
                            ? "past_due"
                            : "cancelled";

                await admin
                    .from("profiles")
                    .update({
                        subscription_tier: tier,
                        subscription_status: status,
                        current_period_end: periodEnd
                            ? new Date(periodEnd * 1000).toISOString()
                            : null,
                    })
                    .eq("id", profile.id);

                break;
            }

            // ─────────────────────────────────────────────────────
            case "customer.subscription.deleted": {
                const sub = event.data.object as Stripe.Subscription;
                const customerId = sub.customer as string;

                const { data: profile } = await admin
                    .from("profiles")
                    .select("id, email, full_name")
                    .eq("stripe_customer_id", customerId)
                    .single();

                if (!profile) break;

                await admin
                    .from("profiles")
                    .update({
                        subscription_tier: "free",
                        stripe_subscription_id: null,
                        subscription_status: "inactive",
                        current_period_end: null,
                    })
                    .eq("id", profile.id);

                // Send cancellation email
                if (profile.email) {
                    try {
                        const resend = new (await import("resend")).Resend(
                            process.env.RESEND_API_KEY
                        );
                        await resend.emails.send({
                            from: `ResumeForge <${process.env.FEEDBACK_EMAIL}>`,
                            to: profile.email,
                            subject: "Your Pro subscription has ended",
                            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
                  <h1 style="font-size: 24px; margin-bottom: 8px;">Subscription ended</h1>
                  <p style="font-size: 15px; line-height: 1.6; color: #555;">
                    ${profile.full_name ? `Hi ${profile.full_name},` : "Hi,"}
                  </p>
                  <p style="font-size: 15px; line-height: 1.6; color: #555;">
                    Your Pro subscription has been cancelled and your account has been moved to the Free plan. You still have access to:
                  </p>
                  <ul style="font-size: 14px; line-height: 2; color: #333; padding-left: 20px;">
                    <li>4 resume generations per month</li>
                    <li>Basic ATS score</li>
                    <li>Clean PDF export</li>
                  </ul>
                  <p style="font-size: 15px; line-height: 1.6; color: #555;">
                    Your workspace data is safe and preserved. You can upgrade again at any time.
                  </p>
                  <div style="margin: 32px 0;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/pricing" style="display: inline-block; background: #0ea5e9; color: #fff; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px;">
                      View Plans
                    </a>
                  </div>
                  <p style="font-size: 13px; color: #777; line-height: 1.5;">
                    If this was a mistake or you'd like to re-subscribe, you can upgrade from your dashboard.
                  </p>
                  <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0;" />
                  <p style="font-size: 12px; color: #999;">
                    ResumeForge — AI-powered resume optimization.<br/>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/support" style="color: #999;">Contact support</a>
                  </p>
                </div>
              `,
                        });
                    } catch {
                        // Non-critical
                    }
                }

                break;
            }
        }
    } catch (err) {
        console.error("[Webhook]", err);
        return NextResponse.json({ error: "Handler failed" }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}
