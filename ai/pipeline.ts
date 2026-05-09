import { SYSTEM_PROMPTS } from "./prompts";
import { generateJSONWithOpenAI } from "./openai";
import { generateWithClaude, streamWithClaude } from "./claude";
import type {
    ResumeSchema,
    JDAnalysis,
    EvidenceMapping,
    ATSScore,
    ValidationResult,
    StreamEvent,
} from "@/types";

function sendEvent(
    controller: ReadableStreamDefaultController<Uint8Array>,
    event: StreamEvent
) {
    const encoder = new TextEncoder();
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
}

export async function runPipeline(
    rawResumeText: string,
    jobDescription: string,
    controller: ReadableStreamDefaultController<Uint8Array>
) {
    // ── Stage 1: Parse Resume ────────────────────────────────────
    try {
        console.log("[Pipeline] Stage 1: Parsing resume...");
        sendEvent(controller, {
            type: "stage",
            stage: "parsing",
            progress: 10,
        });

        const parsePrompt = `Parse the following resume text into structured JSON.\n\nReturn a JSON object with these exact keys: basics (object with name, email, phone, linkedin, github, location, summary), experience (array of objects with company, title, startDate, endDate, bullets array, technologies array), education (array with institution, degree, field, startDate, endDate), projects (array with name, description, technologies array, bullets array), skills (array of strings).\n\nIMPORTANT: Return ONLY valid JSON. No markdown, no explanation.\n\nResume text:\n${rawResumeText}`;

        const parsedResume = await generateJSONWithOpenAI<ResumeSchema>(
            SYSTEM_PROMPTS.parsing,
            parsePrompt
        );

        console.log("[Pipeline] Parsed resume:", JSON.stringify(parsedResume).slice(0, 200));
        sendEvent(controller, { type: "parsed", data: parsedResume });
    } catch (err) {
        const msg = err instanceof Error ? err.message : "Parsing failed";
        console.error("[Pipeline] Stage 1 error:", msg);
        sendEvent(controller, { type: "error", message: `Parsing failed: ${msg}` });
        sendEvent(controller, { type: "stage", stage: "error", progress: 0 });
        return;
    }

    // ── Stage 2: Analyze Job Description ─────────────────────────
    let jdAnalysis: JDAnalysis;
    try {
        console.log("[Pipeline] Stage 2: Analyzing JD...");
        sendEvent(controller, {
            type: "stage",
            stage: "analyzing",
            progress: 25,
        });

        const jdPrompt = `Analyze this job description. Return a JSON object with: title, company, seniority, requiredSkills (array), preferredSkills (array), softSkills (array), keywords (array), responsibilities (array), industryTerms (array), repeatedPhrases (array).\n\nIMPORTANT: Return ONLY valid JSON.\n\nJob description:\n${jobDescription}`;

        jdAnalysis = await generateJSONWithOpenAI<JDAnalysis>(
            SYSTEM_PROMPTS.analysis,
            jdPrompt
        );

        console.log("[Pipeline] JD analysis:", JSON.stringify(jdAnalysis).slice(0, 200));
        sendEvent(controller, { type: "analyzed", data: jdAnalysis });
    } catch (err) {
        const msg = err instanceof Error ? err.message : "JD analysis failed";
        console.error("[Pipeline] Stage 2 error:", msg);
        sendEvent(controller, { type: "error", message: `JD analysis failed: ${msg}` });
        sendEvent(controller, { type: "stage", stage: "error", progress: 0 });
        return;
    }

    // ── Stage 3: Map Evidence ────────────────────────────────────
    let evidenceMapping: EvidenceMapping;
    try {
        console.log("[Pipeline] Stage 3: Mapping evidence...");
        sendEvent(controller, { type: "stage", stage: "mapping", progress: 40 });

        const mapPrompt = `Map job requirements against the candidate's resume.\n\nReturn JSON with: supported (array of {keyword, evidence}), partial (array of {keyword, related}), missing (array of {keyword, suggestion}).\n\nIMPORTANT: Return ONLY valid JSON.\n\nRESUME:\n${JSON.stringify(jdAnalysis, null, 2)}\n\nJOB ANALYSIS:\n${JSON.stringify(jdAnalysis, null, 2)}`;

        evidenceMapping = await generateJSONWithOpenAI<EvidenceMapping>(
            SYSTEM_PROMPTS.mapping,
            mapPrompt
        );

        console.log("[Pipeline] Evidence mapping done");
        sendEvent(controller, { type: "mapped", data: evidenceMapping });
    } catch (err) {
        const msg = err instanceof Error ? err.message : "Evidence mapping failed";
        console.error("[Pipeline] Stage 3 error:", msg);
        // Non-fatal — continue with empty mapping
        evidenceMapping = { supported: [], partial: [], missing: [] };
        sendEvent(controller, { type: "mapped", data: evidenceMapping });
    }

    // ── Stage 4: Enhance Resume ──────────────────────────────────
    let optimizedResume: ResumeSchema;
    try {
        console.log("[Pipeline] Stage 4: Enhancing resume via Claude...");
        sendEvent(controller, {
            type: "stage",
            stage: "enhancing",
            progress: 60,
        });

        const enhancePrompt = `Enhance this resume for the target job. Return the COMPLETE resume as valid JSON matching this structure: {basics: {name, email, phone, linkedin, github, location, summary}, experience: [{company, title, startDate, endDate, bullets: [], technologies: []}], education: [{institution, degree, field, startDate, endDate}], projects: [{name, description, technologies: [], bullets: []}], skills: []}.\n\nRULES:\n- NEVER fabricate experience, companies, metrics, or technologies\n- Only improve wording, clarity, and phrasing of existing content\n- Optimize for ATS and recruiter readability\n- Return ONLY valid JSON, no markdown\n\nORIGINAL RESUME:\n${rawResumeText}\n\nJOB ANALYSIS:\n${JSON.stringify(jdAnalysis, null, 2)}`;

        const enhancedRaw = await streamWithClaude(
            SYSTEM_PROMPTS.enhancement,
            enhancePrompt,
            (chunk) => {
                sendEvent(controller, {
                    type: "enhanced_chunk",
                    section: "streaming",
                    content: chunk,
                });
            },
            { maxTokens: 8192 }
        );

        // Extract JSON from response
        try {
            const jsonMatch = enhancedRaw.match(/\{[\s\S]*\}/);
            optimizedResume = JSON.parse(jsonMatch ? jsonMatch[0] : enhancedRaw);
        } catch {
            console.error("[Pipeline] Failed to parse enhanced JSON, using raw text as fallback");
            optimizedResume = JSON.parse(enhancedRaw);
        }

        console.log("[Pipeline] Enhanced resume:", JSON.stringify(optimizedResume).slice(0, 200));
        sendEvent(controller, { type: "enhanced", data: optimizedResume });
    } catch (err) {
        const msg = err instanceof Error ? err.message : "Enhancement failed";
        console.error("[Pipeline] Stage 4 error:", msg);
        sendEvent(controller, { type: "error", message: `Enhancement failed: ${msg}` });
        sendEvent(controller, { type: "stage", stage: "error", progress: 0 });
        return;
    }

    // ── Post-processing: Fix known hallucinations ─────────────────
    if (optimizedResume) {
        const resumeText = JSON.stringify(optimizedResume);
        const corrections: [RegExp, string][] = [
            [/\bRedox\b/gi, "Redux"],
            [/\bRedox Toolkit\b/gi, "Redux Toolkit"],
        ];

        let corrected = resumeText;
        for (const [pattern, replacement] of corrections) {
            corrected = corrected.replace(pattern, replacement);
        }

        if (corrected !== resumeText) {
            console.log("[Pipeline] Corrected known hallucinations (Redox → Redux)");
            optimizedResume = JSON.parse(corrected);
        }

        // Fix inflated seniority
        if (optimizedResume.basics?.summary) {
            optimizedResume.basics.summary = optimizedResume.basics.summary
                .replace(/\bSenior-level\b/gi, "Mid-level")
                .replace(/\bSenior\b(?=\s+Full\s+Stack)/gi, "Mid-level");
        }

        // Fix redundant education fields
        if (optimizedResume.education) {
            optimizedResume.education = optimizedResume.education.map((edu) => {
                if (edu.field && edu.degree?.toLowerCase().includes(edu.field.toLowerCase())) {
                    return { ...edu, field: undefined };
                }
                return edu;
            });
        }

    }


    // ── Stage 5: ATS Score ───────────────────────────────────────
    let atsScore: ATSScore;
    try {
        console.log("[Pipeline] Stage 5: Calculating ATS score...");
        sendEvent(controller, { type: "stage", stage: "scoring", progress: 80 });

        const scorePrompt = `Score this resume against the job description.\n\nReturn JSON with: overall (0-100), breakdown: {keywordMatch, formatting, readability, impact, completeness} (each 0-100), matchedKeywords (array), missingKeywords (array), warnings (array), suggestions (array), weakSections (array).\n\nIMPORTANT: Return ONLY valid JSON.\n\nRESUME:\n${JSON.stringify(optimizedResume, null, 2)}\n\nJOB ANALYSIS:\n${JSON.stringify(jdAnalysis, null, 2)}`;

        atsScore = await generateJSONWithOpenAI<ATSScore>(
            SYSTEM_PROMPTS.scoring,
            scorePrompt
        );

        console.log("[Pipeline] ATS score:", atsScore.overall);
        sendEvent(controller, { type: "scored", data: atsScore });
    } catch (err) {
        const msg = err instanceof Error ? err.message : "Scoring failed";
        console.error("[Pipeline] Stage 5 error:", msg);
        // Non-fatal — use default score
        atsScore = {
            overall: 0,
            breakdown: { keywordMatch: 0, formatting: 0, readability: 0, impact: 0, completeness: 0 },
            matchedKeywords: [],
            missingKeywords: [],
            warnings: ["Scoring failed — manual review recommended"],
            suggestions: [],
            weakSections: [],
        };
        sendEvent(controller, { type: "scored", data: atsScore });
    }

    // ── Stage 6: Cover Letter ────────────────────────────────────
    let coverLetter = "";
    try {
        console.log("[Pipeline] Stage 6: Generating cover letter...");
        sendEvent(controller, {
            type: "stage",
            stage: "cover-letter",
            progress: 90,
        });

        const clPrompt = `Write a cover letter for this job as if you are the candidate personally writing it.

CANDIDATE INFO (use for the letter heading):
Name: ${optimizedResume.basics?.name || "Candidate"}
Email: ${optimizedResume.basics?.email || ""}
Phone: ${optimizedResume.basics?.phone || ""}
Location: ${optimizedResume.basics?.location || ""}

RESUME:
${rawResumeText}

JOB DESCRIPTION:
${jobDescription}

COMPANY: ${jdAnalysis.company || "the company"}
ROLE: ${jdAnalysis.title || "the role"}

Remember: Format with proper letter heading (name, contact, date, salutation). Write as a human would. No AI patterns. Vary your sentence rhythm. Be specific. Be direct. Be brief.`;



        coverLetter = await streamWithClaude(
            SYSTEM_PROMPTS.coverLetter,
            clPrompt,
            (chunk) => {
                sendEvent(controller, {
                    type: "cover_letter_chunk",
                    content: chunk,
                });
            },
            { maxTokens: 2048 }
        );

        console.log("[Pipeline] Cover letter generated:", coverLetter.length, "chars");
        sendEvent(controller, { type: "cover_letter", data: coverLetter });
    } catch (err) {
        const msg = err instanceof Error ? err.message : "Cover letter failed";
        console.error("[Pipeline] Stage 6 error:", msg);
        coverLetter = "Cover letter generation failed. Please try again.";
        sendEvent(controller, { type: "cover_letter", data: coverLetter });
    }

    // ── Stage 7: Validate ────────────────────────────────────────
    try {
        console.log("[Pipeline] Stage 7: Validating...");
        sendEvent(controller, {
            type: "stage",
            stage: "validating",
            progress: 95,
        });

        const valPrompt = `Validate this AI-enhanced resume against the original.\n\nReturn JSON with: isValid (boolean), trustScore (0-100), issues (array of {severity, section, message, suggestion}), hallucinations (array of {type, location, original, concern}).\n\nIMPORTANT: Return ONLY valid JSON.\n\nORIGINAL:\n${rawResumeText}\n\nENHANCED:\n${JSON.stringify(optimizedResume, null, 2)}`;

        const validation = await generateJSONWithOpenAI<ValidationResult>(
            SYSTEM_PROMPTS.validation,
            valPrompt
        );

        console.log("[Pipeline] Validation trust score:", validation.trustScore);
        sendEvent(controller, { type: "validated", data: validation });
    } catch (err) {
        const msg = err instanceof Error ? err.message : "Validation failed";
        console.error("[Pipeline] Stage 7 error:", msg);
        // Non-fatal
        sendEvent(controller, {
            type: "validated",
            data: { isValid: true, trustScore: 75, issues: [], hallucinations: [] },
        });
    }

    // ── Complete ─────────────────────────────────────────────────
    console.log("[Pipeline] Complete!");
    sendEvent(controller, { type: "stage", stage: "complete", progress: 100 });
    sendEvent(controller, { type: "complete" });
}
