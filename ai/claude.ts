import Anthropic from "@anthropic-ai/sdk";
import { AI_MODELS } from "@/lib/constants";

const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function generateWithClaude(
    systemPrompt: string,
    userMessage: string,
    options?: {
        maxTokens?: number;
        temperature?: number;
    }
): Promise<string> {
    console.log("[Claude] Calling model:", AI_MODELS.claude);

    const response = await client.messages.create({
        model: AI_MODELS.claude,
        max_tokens: options?.maxTokens ?? 4096,
        temperature: options?.temperature ?? 0.3,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
    });

    const block = response.content[0];
    if (block.type !== "text") {
        throw new Error("Claude returned unexpected content type: " + block.type);
    }

    console.log("[Claude] Response length:", block.text.length, "chars");
    return block.text;
}

export async function streamWithClaude(
    systemPrompt: string,
    userMessage: string,
    onChunk: (text: string) => void,
    options?: {
        maxTokens?: number;
        temperature?: number;
    }
): Promise<string> {
    console.log("[Claude] Streaming from model:", AI_MODELS.claude);

    const stream = client.messages.stream({
        model: AI_MODELS.claude,
        max_tokens: options?.maxTokens ?? 4096,
        temperature: options?.temperature ?? 0.3,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
    });

    let fullText = "";

    for await (const event of stream) {
        if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
        ) {
            fullText += event.delta.text;
            onChunk(event.delta.text);
        }
    }

    console.log("[Claude] Stream complete. Total:", fullText.length, "chars");
    return fullText;
}
