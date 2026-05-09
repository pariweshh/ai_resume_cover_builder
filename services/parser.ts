import type { ResumeSchema } from "@/types";
import { generateId } from "@/lib/utils";

export async function extractTextFromBuffer(
    buffer: Buffer,
    filename: string
): Promise<string> {
    const ext = filename.split(".").pop()?.toLowerCase();

    switch (ext) {
        case "pdf": {
            const { extractText } = await import("unpdf");
            const { text } = await extractText(new Uint8Array(buffer));
            if (typeof text === "string") return text;
            // unpdf may return an array of page strings
            if (Array.isArray(text)) return text.join("\n");
            return String(text);
        }
        case "docx": {
            const mammoth = await import("mammoth");
            const result = await mammoth.extractRawText({ buffer });
            return result.value;
        }
        case "txt":
            return buffer.toString("utf-8");
        default:
            throw new Error(`Unsupported file type: ${ext}`);
    }
}

export function createEmptyResume(): ResumeSchema {
    return {
        basics: {
            name: "",
            email: "",
        },
        experience: [],
        education: [],
        projects: [],
        skills: [],
    };
}

export function mergeResumeData(
    original: ResumeSchema,
    enhanced: Partial<ResumeSchema>
): ResumeSchema {
    return {
        basics: { ...original.basics, ...enhanced.basics },
        experience:
            enhanced.experience?.map((exp, i) => ({
                ...original.experience[i],
                ...exp,
                id: exp.id || original.experience[i]?.id || generateId(),
            })) ?? original.experience,
        education:
            enhanced.education?.map((edu, i) => ({
                ...original.education[i],
                ...edu,
                id: edu.id || original.education[i]?.id || generateId(),
            })) ?? original.education,
        projects:
            enhanced.projects?.map((proj, i) => ({
                ...original.projects[i],
                ...proj,
                id: proj.id || original.projects[i]?.id || generateId(),
            })) ?? original.projects,
        skills: enhanced.skills ?? original.skills,
        certifications: enhanced.certifications ?? original.certifications,
    };
}
