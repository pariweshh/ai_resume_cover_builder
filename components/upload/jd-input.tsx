"use client";

import { Briefcase } from "lucide-react";

type JDInputProps = {
    value: string;
    onChange: (value: string) => void;
};

export function JDInput({ value, onChange }: JDInputProps) {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-accent" />
                <h3 className="text-sm font-semibold text-text-primary">
                    Job Description
                </h3>
            </div>
            <p className="text-xs text-text-muted">
                Paste the target job description for ATS-optimized tailoring.
            </p>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Paste the job description here..."
                className="h-64 w-full resize-none rounded-xl border border-border bg-surface-elevated px-4 py-3 text-sm leading-relaxed text-text-primary placeholder:text-text-muted/50 focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/20"
            />
            <div className="flex items-center justify-between text-xs text-text-muted">
                <span>{value.length > 0 ? `${value.split(/\s+/).length} words` : ""}</span>
                <span>Minimum 50 words recommended</span>
            </div>
        </div>
    );
}
