import type { ResumeSchema, JDAnalysis, ATSScore } from "@/types";

export function calculateLocalATSScore(
    resume: ResumeSchema,
    jd: JDAnalysis, weights?: {
        keywordMatch: number;
        formatting: number;
        readability: number;
        impact: number;
        completeness: number;
    }
): ATSScore {
    const safeResume: ResumeSchema = {
        basics: resume.basics ?? { name: "", email: "" },
        experience: resume.experience ?? [],
        education: resume.education ?? [],
        projects: resume.projects ?? [],
        skills: resume.skills ?? [],
        certifications: resume.certifications ?? [],
    };

    const safeJd: JDAnalysis = {
        title: jd.title ?? "",
        company: jd.company ?? "",
        seniority: jd.seniority ?? "",
        requiredSkills: jd.requiredSkills ?? [],
        preferredSkills: jd.preferredSkills ?? [],
        softSkills: jd.softSkills ?? [],
        keywords: jd.keywords ?? [],
        responsibilities: jd.responsibilities ?? [],
        industryTerms: jd.industryTerms ?? [],
        repeatedPhrases: jd.repeatedPhrases ?? [],
    };

    const resumeText = extractResumeText(safeResume).toLowerCase();
    const allKeywords = [
        ...safeJd.requiredSkills,
        ...safeJd.preferredSkills,
        ...safeJd.keywords,
        ...safeJd.industryTerms,
    ];
    const uniqueKeywords = [...new Set(allKeywords.map((k) => k.toLowerCase()))];

    const matched: string[] = [];
    const missing: string[] = [];

    for (const keyword of uniqueKeywords) {
        if (resumeText.includes(keyword)) {
            matched.push(keyword);
        } else {
            missing.push(keyword);
        }
    }

    const keywordMatch = Math.round(
        (matched.length / Math.max(uniqueKeywords.length, 1)) * 100
    );

    const formatting = scoreFormatting(safeResume);
    const readability = scoreReadability(safeResume);
    const impact = scoreImpact(safeResume);
    const completeness = scoreCompleteness(safeResume);

    const w = {
        keywordMatch: (weights?.keywordMatch ?? 30) / 100,
        formatting: (weights?.formatting ?? 20) / 100,
        readability: (weights?.readability ?? 20) / 100,
        impact: (weights?.impact ?? 15) / 100,
        completeness: (weights?.completeness ?? 15) / 100,
    };

    const overall = Math.round(
        keywordMatch * w.keywordMatch +
        formatting * w.formatting +
        readability * w.readability +
        impact * w.impact +
        completeness * w.completeness
    );


    const warnings: string[] = [];
    const suggestions: string[] = [];
    const weakSections: string[] = [];

    if (safeResume.basics.summary && safeResume.basics.summary.length > 300) {
        warnings.push("Summary is too long — keep under 3 sentences");
        weakSections.push("summary");
    }
    if (safeResume.experience.some((e) => (e.bullets ?? []).length < 2)) {
        suggestions.push(
            "Some roles have fewer than 2 bullets — add more detail"
        );
    }
    if (safeResume.skills.length < 5) {
        suggestions.push("Skills section is thin — add more relevant technologies");
        weakSections.push("skills");
    }
    if (missing.length > 5) {
        suggestions.push(
            `${missing.length} job keywords are missing from your resume`
        );
    }
    if (!safeResume.basics.summary) {
        suggestions.push("Add a professional summary for better recruiter impact");
        weakSections.push("summary");
    }

    return {
        overall,
        breakdown: {
            keywordMatch,
            formatting,
            readability,
            impact,
            completeness,
        },
        matchedKeywords: matched,
        missingKeywords: missing,
        warnings,
        suggestions,
        weakSections: [...new Set(weakSections)],
    };
}

function extractResumeText(resume: ResumeSchema): string {
    const parts: string[] = [];

    parts.push(resume.basics.name ?? "");
    parts.push(resume.basics.summary ?? "");

    for (const exp of resume.experience ?? []) {
        parts.push(exp.company ?? "");
        parts.push(exp.title ?? "");
        parts.push(...(exp.bullets ?? []));
        parts.push(...(exp.technologies ?? []));
    }

    for (const edu of resume.education ?? []) {
        parts.push(edu.institution ?? "");
        parts.push(edu.degree ?? "");
        parts.push(edu.field ?? "");
    }

    for (const proj of resume.projects ?? []) {
        parts.push(proj.name ?? "");
        parts.push(proj.description ?? "");
        parts.push(...(proj.bullets ?? []));
        parts.push(...(proj.technologies ?? []));
    }

    parts.push(...(resume.skills ?? []));

    return parts.join(" ");
}

function scoreFormatting(resume: ResumeSchema): number {
    let score = 100;
    if (!resume.basics?.email) score -= 15;
    if (!resume.basics?.name) score -= 20;
    if ((resume.experience ?? []).length === 0) score -= 20;
    if ((resume.education ?? []).length === 0) score -= 10;
    const hasLongBullets = (resume.experience ?? []).some((e) =>
        (e.bullets ?? []).some((b) => (b ?? "").length > 200)
    );
    if (hasLongBullets) score -= 10;
    return Math.max(0, score);
}

function scoreReadability(resume: ResumeSchema): number {
    let score = 100;
    const allBullets = (resume.experience ?? []).flatMap((e) => e.bullets ?? []);
    const avgLength =
        allBullets.reduce((sum, b) => sum + (b ?? "").length, 0) /
        Math.max(allBullets.length, 1);
    if (avgLength > 150) score -= 15;
    if (avgLength > 200) score -= 15;
    const weakStarters = allBullets.filter((b) =>
        /^(responsible for|helped|assisted|worked on|tasked with)/i.test(b ?? "")
    );
    score -= weakStarters.length * 5;
    return Math.max(0, score);
}

function scoreImpact(resume: ResumeSchema): number {
    let score = 50;
    const allBullets = (resume.experience ?? []).flatMap((e) => e.bullets ?? []);
    const metricsPattern = /\d+[%$kmb]|\d+\+|[\d,]+/i;
    const withMetrics = allBullets.filter((b) => metricsPattern.test(b ?? ""));
    const metricRatio = withMetrics.length / Math.max(allBullets.length, 1);
    score += Math.round(metricRatio * 40);
    const actionVerbs =
        /^(built|led|designed|implemented|developed|created|launched|drove|reduced|increased|improved|delivered|managed|architected|optimized|automated|scaled|migrated|established)/i;
    const withAction = allBullets.filter((b) => actionVerbs.test(b ?? ""));
    const actionRatio = withAction.length / Math.max(allBullets.length, 1);
    score += Math.round(actionRatio * 10);
    return Math.min(100, Math.max(0, score));
}

function scoreCompleteness(resume: ResumeSchema): number {
    let score = 0;
    if (resume.basics?.name) score += 10;
    if (resume.basics?.email) score += 10;
    if (resume.basics?.summary) score += 10;
    if ((resume.experience ?? []).length > 0) score += 25;
    if ((resume.education ?? []).length > 0) score += 15;
    if ((resume.skills ?? []).length > 0) score += 15;
    if ((resume.projects ?? []).length > 0) score += 10;
    if (resume.basics?.linkedin || resume.basics?.github) score += 5;
    return Math.min(100, score);
}
