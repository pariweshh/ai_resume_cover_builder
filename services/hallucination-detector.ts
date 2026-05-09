import type { ResumeSchema, ValidationResult, HallucinationFlag } from "@/types";

export function detectHallucinations(
    originalText: string,
    enhanced: ResumeSchema
): Pick<ValidationResult, "trustScore" | "hallucinations"> {
    const flags: HallucinationFlag[] = [];
    const lowerOriginal = originalText.toLowerCase();

    // Check for invented technologies
    const allTechs = [
        ...enhanced.experience.flatMap((e) => e.technologies || []),
        ...enhanced.projects.flatMap((p) => p.technologies || []),
        ...enhanced.skills,
    ];

    for (const tech of allTechs) {
        if (
            !lowerOriginal.includes(tech.toLowerCase()) &&
            !isCommonVariant(tech, lowerOriginal)
        ) {
            flags.push({
                type: "unsupported_tech",
                location: "skills/experience",
                original: tech,
                concern: `"${tech}" not found in original resume. May be fabricated.`,
            });
        }
    }

    // Check for invented metrics
    const enhancedText = JSON.stringify(enhanced).toLowerCase();
    const metricPattern = /(\d+)%|\$(\d+)|(\d+)x\b|(\d+)\+/g;
    let match;
    while ((match = metricPattern.exec(enhancedText)) !== null) {
        const metric = match[0];
        if (!lowerOriginal.includes(metric.replace(/[.*+?^${}()|[\]\\]/g, ""))) {
            flags.push({
                type: "invented_metric",
                location: "experience bullets",
                original: metric,
                concern: `Metric "${metric}" not found in original. May be fabricated.`,
            });
        }
    }

    // Check for suspiciously long experience entries
    for (const exp of enhanced.experience) {
        if (exp.bullets.length > 8) {
            flags.push({
                type: "exaggerated_claim",
                location: `${exp.company} - ${exp.title}`,
                original: `${exp.bullets.length} bullets`,
                concern:
                    "Unusually high number of bullets may indicate AI-generated padding.",
            });
        }
    }

    const trustScore = Math.max(0, 100 - flags.length * 12);

    return { trustScore, hallucinations: flags };
}

function isCommonVariant(tech: string, text: string): boolean {
    const variants: Record<string, string[]> = {
        javascript: ["js", "es6", "es2015", "ecmascript"],
        typescript: ["ts"],
        python: ["py"],
        react: ["reactjs", "react.js"],
        node: ["nodejs", "node.js"],
        postgresql: ["postgres", "psql"],
        mongodb: ["mongo"],
        kubernetes: ["k8s"],
        "amazon web services": ["aws"],
        "google cloud platform": ["gcp"],
        "c#": ["csharp", "c sharp"],
        "c++": ["cpp"],
    };

    const lower = tech.toLowerCase();
    for (const [key, alts] of Object.entries(variants)) {
        if (
            (lower === key || alts.includes(lower)) &&
            (text.includes(key) || alts.some((a) => text.includes(a)))
        ) {
            return true;
        }
    }
    return false;
}
