import { NextResponse } from "next/server";
import { extractTextFromBuffer } from "@/services/parser";

export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        console.log(
            `Parsing file: ${file.name} (${file.type}, ${buffer.length} bytes)`
        );

        const text = await extractTextFromBuffer(buffer, file.name);

        if (!text || text.trim().length === 0) {
            return NextResponse.json(
                { error: "Could not extract text from file. The file may be image-based or empty." },
                { status: 422 }
            );
        }

        console.log(`Extracted ${text.length} characters`);
        return NextResponse.json({ text });
    } catch (err) {
        console.error("Parse error:", err);
        const message =
            err instanceof Error ? err.message : "Failed to parse file";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
