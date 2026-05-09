import OpenAI from "openai";
import { AI_MODELS } from "@/lib/constants";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

export async function generateWithOpenAI(
    systemPrompt: string,
    userMessage: string,
    options?: {
        maxTokens?: number;
        temperature?: number;
        responseFormat?: { type: "json_object" };
    }
): Promise<string> {
    console.log("[OpenAI] Calling model:", AI_MODELS.openai);

    const response = await client.chat.completions.create({
        model: AI_MODELS.openai,
        max_tokens: options?.maxTokens ?? 4096,
        temperature: options?.temperature ?? 0.2,
        response_format: options?.responseFormat,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
        ],
    });

    const content = response.choices[0].message.content;
    if (!content) {
        throw new Error("OpenAI returned empty response");
    }

    return content;
}

export async function generateJSONWithOpenAI<T>(
    systemPrompt: string,
    userMessage: string
): Promise<T> {
    const raw = await generateWithOpenAI(systemPrompt, userMessage, {
        responseFormat: { type: "json_object" },
        temperature: 0.1,
    });

    console.log("[OpenAI] Raw response (first 300 chars):", raw.slice(0, 300));

    try {
        return JSON.parse(raw) as T;
    } catch (parseErr) {
        console.error("[OpenAI] JSON parse failed. Raw:", raw);
        throw new Error(`OpenAI returned invalid JSON: ${parseErr instanceof Error ? parseErr.message : "unknown"}`);
    }
}
