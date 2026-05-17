"use client";

import type { JDAnalysis, EvidenceMapping } from "@/types";
import { Check, Minus, X } from "lucide-react";

type KeywordAnalysisProps = {
    analysis: JDAnalysis;
    mapping: EvidenceMapping;
};

export function KeywordAnalysis({ analysis, mapping }: KeywordAnalysisProps) {
    const supported = mapping.supported ?? [];
    const partial = mapping.partial ?? [];
    const missing = mapping.missing ?? [];

    return (
        <div className="space-y-4 sm:space-y-5">
            {/* Job Info */}
            <div className="rounded-xl border border-border bg-surface p-3 sm:p-5">
                <h4 className="text-sm font-semibold text-text-primary">
                    {analysis.title || "Untitled Role"}
                </h4>
                {analysis.company && (
                    <p className="text-xs text-text-secondary">{analysis.company}</p>
                )}
                <span className="mt-2 inline-block rounded-md bg-surface-elevated px-2 py-0.5 text-xs text-text-muted">
                    {analysis.seniority || "Not specified"}
                </span>
            </div>

            {/* Required Skills */}
            {(analysis.requiredSkills ?? []).length > 0 && (
                <div className="rounded-xl border border-border bg-surface p-3 sm:p-5">
                    <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                        Required Skills
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                        {(analysis.requiredSkills ?? []).map((skill) => {
                            const matchStatus = getMatchStatus(skill, supported, partial);
                            return (
                                <span
                                    key={skill}
                                    className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs sm:py-0.5 ${matchStatus === "supported"
                                        ? "bg-emerald/10 text-emerald"
                                        : matchStatus === "partial"
                                            ? "bg-warning/10 text-warning"
                                            : "bg-error/10 text-error"
                                        }`}
                                >
                                    {matchStatus === "supported" ? (
                                        <Check className="h-3 w-3" />
                                    ) : matchStatus === "partial" ? (
                                        <Minus className="h-3 w-3" />
                                    ) : (
                                        <X className="h-3 w-3" />
                                    )}
                                    {skill}
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Evidence Details */}
            <div className="rounded-xl border border-border bg-surface p-3 sm:p-5">
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Evidence Map
                </h4>

                {supported.length > 0 && (
                    <div className="mb-3">
                        <p className="mb-1.5 text-xs font-medium text-emerald">
                            Supported ({supported.length})
                        </p>
                        {supported.map((item) => (
                            <div
                                key={item.keyword}
                                className="mb-1 rounded-md bg-surface-elevated px-2.5 py-1.5 sm:px-3 sm:py-2"
                            >
                                <p className="text-xs font-medium text-text-primary">
                                    {item.keyword}
                                </p>
                                <p className="text-xs text-text-muted">{item.evidence}</p>
                            </div>
                        ))}
                    </div>
                )}

                {partial.length > 0 && (
                    <div className="mb-3">
                        <p className="mb-1.5 text-xs font-medium text-warning">
                            Partial ({partial.length})
                        </p>
                        {partial.map((item) => (
                            <div
                                key={item.keyword}
                                className="mb-1 rounded-md bg-surface-elevated px-2.5 py-1.5 sm:px-3 sm:py-2"
                            >
                                <p className="text-xs font-medium text-text-primary">
                                    {item.keyword}
                                </p>
                                <p className="text-xs text-text-muted">{item.related}</p>
                            </div>
                        ))}
                    </div>
                )}

                {missing.length > 0 && (
                    <div>
                        <p className="mb-1.5 text-xs font-medium text-error">
                            Missing ({missing.length})
                        </p>
                        {missing.map((item) => (
                            <div
                                key={item.keyword}
                                className="mb-1 rounded-md bg-surface-elevated px-2.5 py-1.5 sm:px-3 sm:py-2"
                            >
                                <p className="text-xs font-medium text-text-primary">
                                    {item.keyword}
                                </p>
                                <p className="text-xs text-text-muted">{item.suggestion}</p>
                            </div>
                        ))}
                    </div>
                )}

                {supported.length === 0 && partial.length === 0 && missing.length === 0 && (
                    <p className="text-xs text-text-muted">No evidence data available.</p>
                )}
            </div>
        </div>
    );
}

function getMatchStatus(
    keyword: string,
    supported: { keyword: string; evidence: string }[],
    partial: { keyword: string; related: string }[]
): "supported" | "partial" | "missing" {
    const lower = keyword.toLowerCase();
    if (supported.some((s) => s.keyword?.toLowerCase() === lower))
        return "supported";
    if (partial.some((p) => p.keyword?.toLowerCase() === lower))
        return "partial";
    return "missing";
}
