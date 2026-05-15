import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

export async function POST() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("stripe_customer_id")
            .eq("id", user.id)
            .single();

        if (!profile?.stripe_customer_id) {
            return NextResponse.json({ error: "No subscription found" }, { status: 400 });
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: profile.stripe_customer_id,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        });

        return NextResponse.json({ url: session.url });
    } catch (err) {
        console.error("[Stripe Portal]", err);
        return NextResponse.json({ error: "Portal failed" }, { status: 500 });
    }
}
