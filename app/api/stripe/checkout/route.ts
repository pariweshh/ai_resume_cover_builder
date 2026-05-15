import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateStripeCustomer, stripe } from "@/lib/stripe";

export async function POST(req: Request) {
    try {
        const { priceId } = await req.json();

        if (!priceId) {
            return NextResponse.json({ error: "Price ID required" }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user?.email) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const customerId = await getOrCreateStripeCustomer(user.id, user.email);

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
            metadata: { user_id: user.id },
        });

        return NextResponse.json({ url: session.url });
    } catch (err) {
        console.error("[Stripe Checkout]", err);
        return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
    }
}
