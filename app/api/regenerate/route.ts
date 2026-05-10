import { NextResponse } from "next/server";
import { generateWithClaude } from "@/ai/claude";

export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { type, content, jobDescription, resumeContext } = body as {
            type: "bullet" | "bullets" | "summary";
            content: string | string[];
            jobDescription?: string;
            resumeContext?: string;
        };

        if (!type || !content) {
            return NextResponse.json(
                { error: "Type and content are required" },
                { status: 400 }
            );
        }

        let systemPrompt: string;
        let userPrompt: string;

        if (type === "bullet") {
            systemPrompt = `You are a professional resume bullet point writer. Rewrite the given bullet point to be stronger, more impactful, and ATS-optimized.

RULES:
- Start with a strong action verb
- Keep it under 20 words
- Preserve ALL factual information — do not add metrics, technologies, or claims not in the original
- Improve clarity, conciseness, and impact
- Do NOT fabricate achievements or numbers
- Return ONLY the rewritten bullet text. No quotes, no numbering, no explanation.`;

            userPrompt = `Rewrite this resume bullet point:\n\n"${content}"`;
            if (jobDescription) {
                userPrompt += `\n\nTarget role context:\n${jobDescription.slice(0, 500)}`;
            }
        } else if (type === "bullets") {
            const bullets = Array.isArray(content) ? content : [content];
            systemPrompt = `You are a professional resume writer. Rewrite ALL the given bullet points to be stronger, more impactful, and ATS-optimized.

RULES:
- Start each bullet with a strong action verb
- Keep each bullet under 20 words
- Preserve ALL factual information — do not add metrics, technologies, or claims not in the original
- Improve clarity, conciseness, and impact
- Do NOT fabricate achievements or numbers
- Return ONLY a JSON array of rewritten bullet strings. No explanation.`;

            userPrompt = `Rewrite these resume bullet points:\n\n${JSON.stringify(bullets, null, 2)}`;
            if (jobDescription) {
                userPrompt += `\n\nTarget role context:\n${jobDescription.slice(0, 500)}`;
            }
        } else {
            // summary
            systemPrompt = `You are a professional resume writer. Rewrite the given professional summary to be more impactful and ATS-optimized.

RULES:
- 2-3 sentences maximum
- No first person ("I" / "my")
- Include years of experience if present
- Mention primary domain and key technologies
- Preserve ALL factual information — do not fabricate experience or skills
- Return ONLY the rewritten summary text. No quotes, no explanation.`;

            userPrompt = `Rewrite this professional summary:\n\n"${content}"`;
            if (jobDescription) {
                userPrompt += `\n\nTarget role context:\n${jobDescription.slice(0, 500)}`;
            }
        }

        if (resumeContext) {
            userPrompt += `\n\nCandidate background for context:\n${resumeContext.slice(0, 1000)}`;
        }

        const result = await generateWithClaude(systemPrompt, userPrompt, {
            maxTokens: 1024,
            temperature: 0.4,
        });

        // Parse bullets array if needed
        if (type === "bullets") {
            try {
                const jsonMatch = result.match(/$$[\s\S]*$$/);
                const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : result);
                return NextResponse.json({ bullets: parsed });
            } catch {
                // Fallback: split by newlines
                const lines = result
                    .split("\n")
                    .map((l) => l.replace(/^[-•*]\s*/, "").replace(/^"|"$/g, "").trim())
                    .filter(Boolean);
                return NextResponse.json({ bullets: lines });
            }
        }

        // Clean single result
        const cleaned = result.replace(/^"|"$/g, "").trim();
        return NextResponse.json({ text: cleaned });
    } catch (err) {
        console.error("Regenerate error:", err);
        const message =
            err instanceof Error ? err.message : "Regeneration failed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
