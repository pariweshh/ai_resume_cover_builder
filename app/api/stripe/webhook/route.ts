import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe";
import { getTierFromPriceId } from "@/lib/subscription";
import Stripe from "stripe";

const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");

    if (!sig) {
        return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.metadata?.user_id;
                if (!userId) break;

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
                        subscription_status: "active",
                        current_period_end: periodEnd
                            ? new Date(periodEnd * 1000).toISOString()
                            : null,
                    })
                    .eq("id", userId);

                break;
            }

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

            case "customer.subscription.deleted": {
                const sub = event.data.object as Stripe.Subscription;
                const customerId = sub.customer as string;

                const { data: profile } = await admin
                    .from("profiles")
                    .select("id")
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

                break;
            }
        }
    } catch (err) {
        console.error("[Webhook]", err);
        return NextResponse.json({ error: "Handler failed" }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}
