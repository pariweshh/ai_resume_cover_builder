import { z } from "zod";

export const resumeSchemaZod = z.object({
    basics: z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Valid email required"),
        phone: z.string().optional(),
        linkedin: z.string().url().optional().or(z.literal("")),
        github: z.string().url().optional().or(z.literal("")),
        website: z.string().url().optional().or(z.literal("")),
        location: z.string().optional(),
        summary: z.string().max(500, "Summary too long").optional(),
    }),
    experience: z.array(
        z.object({
            id: z.string(),
            company: z.string().min(1),
            title: z.string().min(1),
            startDate: z.string().min(1),
            endDate: z.string().optional(),
            current: z.boolean().optional(),
            bullets: z.array(z.string().min(1)),
            technologies: z.array(z.string()).optional(),
            location: z.string().optional(),
        })
    ),
    education: z.array(
        z.object({
            id: z.string(),
            institution: z.string().min(1),
            degree: z.string().min(1),
            field: z.string().optional(),
            startDate: z.string().optional(),
            endDate: z.string().optional(),
            gpa: z.string().optional(),
            honors: z.array(z.string()).optional(),
        })
    ),
    projects: z.array(
        z.object({
            id: z.string(),
            name: z.string().min(1),
            description: z.string(),
            technologies: z.array(z.string()).optional(),
            bullets: z.array(z.string()).optional(),
            url: z.string().optional(),
        })
    ),
    skills: z.array(z.string()),
    certifications: z
        .array(
            z.object({
                id: z.string(),
                name: z.string().min(1),
                issuer: z.string().min(1),
                date: z.string().optional(),
                url: z.string().optional(),
            })
        )
        .optional(),
});

export type ValidatedResume = z.infer<typeof resumeSchemaZod>;

export const jdAnalysisSchemaZod = z.object({
    title: z.string(),
    company: z.string(),
    seniority: z.string(),
    requiredSkills: z.array(z.string()),
    preferredSkills: z.array(z.string()),
    softSkills: z.array(z.string()),
    keywords: z.array(z.string()),
    responsibilities: z.array(z.string()),
    industryTerms: z.array(z.string()),
    repeatedPhrases: z.array(z.string()),
});

export const atsScoreSchemaZod = z.object({
    overall: z.number().min(0).max(100),
    breakdown: z.object({
        keywordMatch: z.number().min(0).max(100),
        formatting: z.number().min(0).max(100),
        readability: z.number().min(0).max(100),
        impact: z.number().min(0).max(100),
        completeness: z.number().min(0).max(100),
    }),
    matchedKeywords: z.array(z.string()),
    missingKeywords: z.array(z.string()),
    warnings: z.array(z.string()),
    suggestions: z.array(z.string()),
    weakSections: z.array(z.string()),
});
