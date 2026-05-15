import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({
                tier: "free",
                used: 0,
                resetDate: null,
            });
        }

        // Auto-reset if needed
        try { await supabase.rpc("reset_monthly_generations"); } catch { }

        const { data: profile } = await supabase
            .from("profiles")
            .select("subscription_tier, generations_used_this_month, generation_reset_date")
            .eq("id", user.id)
            .single();

        if (!profile) {
            return NextResponse.json({ tier: "free", used: 0, resetDate: null });
        }

        return NextResponse.json({
            tier: profile.subscription_tier,
            used: profile.generations_used_this_month,
            resetDate: profile.generation_reset_date,
        });
    } catch (err) {
        console.error("[Usage]", err);
        return NextResponse.json({ tier: "free", used: 0, resetDate: null });
    }
}
