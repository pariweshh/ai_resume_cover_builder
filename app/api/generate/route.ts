import { runPipeline } from "@/ai/pipeline";

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

    console.log("[Pipeline] Starting generation, tone:", tone || "balanced");

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
