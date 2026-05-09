"use server";

import type { ResumeSchema } from "@/types";
import { generatePDF } from "@/services/export-pdf";
import { generateDOCX } from "@/services/export-docx";

export async function exportToPDF(resume: ResumeSchema): Promise<{
    success: boolean;
    base64?: string;
    error?: string;
}> {
    try {
        const blob = await generatePDF(resume);
        const buffer = await blob.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        return { success: true, base64 };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Export failed",
        };
    }
}

export async function exportToDOCX(resume: ResumeSchema): Promise<{
    success: boolean;
    base64?: string;
    error?: string;
}> {
    try {
        const blob = await generateDOCX(resume);
        const buffer = await blob.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        return { success: true, base64 };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Export failed",
        };
    }
}
