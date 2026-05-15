import { runPipeline } from "@/ai/pipeline";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 120;

export async function POST(req: Request) {
    const { rawText, jobDescription, tone } = await req.json();

    if (!rawText?.trim()) {
        return new Response(
            JSON.stringify({ error: "Resume text is required" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    if (!jobDescription?.trim()) {
        return new Response(
            JSON.stringify({ error: "Job description is required" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    // ── Usage gate ────────────────────────────────────────────────
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        try { await supabase.rpc("reset_monthly_generations"); } catch { }

        const { data: profile } = await supabase
            .from("profiles")
            .select("subscription_tier, generations_used_this_month")
            .eq("id", user.id)
            .single();

        const tier = profile?.subscription_tier ?? "free";
        const used = profile?.generations_used_this_month ?? 0;

        if (tier === "free" && used >= 4) {
            return new Response(
                JSON.stringify({
                    error: "limit_reached",
                    message: "You've used your 2 free generations this month. Upgrade for unlimited access.",
                }),
                { status: 403, headers: { "Content-Type": "application/json" } }
            );
        }

        // Increment before streaming starts
        await supabase
            .from("profiles")
            .update({ generations_used_this_month: used + 1 })
            .eq("id", user.id);
    }

    // ── Run pipeline ──────────────────────────────────────────────
    const stream = new ReadableStream({
        async start(controller) {
            await runPipeline(rawText, jobDescription, controller, tone || "balanced");
            controller.close();
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        },
    });
}
