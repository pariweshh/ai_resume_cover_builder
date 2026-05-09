"use client";

import { motion } from "framer-motion";
import {
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Lightbulb,
} from "lucide-react";
import { cn, getScoreColor, getScoreBg } from "@/lib/utils";
import type { ATSScore } from "@/types";

type ScorePanelProps = {
    score: ATSScore;
};

export function ScorePanel({ score }: ScorePanelProps) {
    const breakdown = score.breakdown ?? {};

    const breakdownItems = [
        { label: "Keyword Match", value: breakdown.keywordMatch ?? 0 },
        { label: "Formatting", value: breakdown.formatting ?? 0 },
        { label: "Readability", value: breakdown.readability ?? 0 },
        { label: "Impact", value: breakdown.impact ?? 0 },
        { label: "Completeness", value: breakdown.completeness ?? 0 },
    ];

    const overall = score.overall ?? 0;
    const matchedKeywords = score.matchedKeywords ?? [];
    const missingKeywords = score.missingKeywords ?? [];
    const warnings = score.warnings ?? [];
    const suggestions = score.suggestions ?? [];

    return (
        <div className="space-y-6">
            {/* Overall Score */}
            <div className="rounded-xl border border-border bg-surface p-6 text-center">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
                    ATS Match Score
                </p>
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className={cn("font-display text-6xl", getScoreColor(overall))}
                >
                    {overall}
                </motion.div>
                <div className="mx-auto mt-3 h-2 w-full max-w-[180px] overflow-hidden rounded-full bg-surface-elevated">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${overall}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={cn("h-full rounded-full", getScoreBg(overall))}
                    />
                </div>
            </div>

            {/* Breakdown */}
            <div className="rounded-xl border border-border bg-surface p-5">
                <h4 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
                    <TrendingUp className="h-3.5 w-3.5" />
                    Score Breakdown
                </h4>
                <div className="space-y-3">
                    {breakdownItems.map((item) => (
                        <div key={item.label}>
                            <div className="mb-1 flex items-center justify-between text-xs">
                                <span className="text-text-secondary">{item.label}</span>
                                <span className={getScoreColor(item.value)}>
                                    {item.value}
                                </span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-surface-elevated">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${item.value}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className={cn("h-full rounded-full", getScoreBg(item.value))}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Matched Keywords */}
            {matchedKeywords.length > 0 && (
                <div className="rounded-xl border border-border bg-surface p-5">
                    <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald" />
                        Matched Keywords ({matchedKeywords.length})
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                        {matchedKeywords.map((kw) => (
                            <span
                                key={kw}
                                className="rounded-md bg-emerald/10 px-2 py-0.5 text-xs text-emerald"
                            >
                                {kw}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Missing Keywords */}
            {missingKeywords.length > 0 && (
                <div className="rounded-xl border border-border bg-surface p-5">
                    <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
                        <XCircle className="h-3.5 w-3.5 text-error" />
                        Missing Keywords ({missingKeywords.length})
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                        {missingKeywords.map((kw) => (
                            <span
                                key={kw}
                                className="rounded-md bg-error/10 px-2 py-0.5 text-xs text-error"
                            >
                                {kw}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Warnings */}
            {warnings.length > 0 && (
                <div className="rounded-xl border border-warning/20 bg-warning/5 p-5">
                    <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-warning">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Warnings
                    </h4>
                    <ul className="space-y-1.5">
                        {warnings.map((w, i) => (
                            <li key={i} className="text-xs text-text-secondary">
                                {w}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
                <div className="rounded-xl border border-accent/20 bg-accent/5 p-5">
                    <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
                        <Lightbulb className="h-3.5 w-3.5" />
                        Suggestions
                    </h4>
                    <ul className="space-y-1.5">
                        {suggestions.map((s, i) => (
                            <li key={i} className="text-xs text-text-secondary">
                                {s}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
