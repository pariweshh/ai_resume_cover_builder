import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-04-22.dahlia",
    typescript: true,
});

export async function getOrCreateStripeCustomer(
    userId: string,
    email: string
): Promise<string> {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const { data: profile } = await supabase
        .from("profiles")
        .select("stripe_customer_id")
        .eq("id", userId)
        .single();

    if (profile?.stripe_customer_id) return profile.stripe_customer_id;

    const customer = await stripe.customers.create({
        email,
        metadata: { supabase_user_id: userId },
    });

    await supabase
        .from("profiles")
        .update({ stripe_customer_id: customer.id })
        .eq("id", userId);

    return customer.id;
}
