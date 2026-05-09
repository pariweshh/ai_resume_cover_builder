"use client";

import { useState } from "react";
import { SectionEditor } from "./section-editor";
import { cn } from "@/lib/utils";
import type { ResumeSchema, ExperienceEntry, EducationEntry, ProjectEntry } from "@/types";

type ResumeEditorProps = {
    resume: ResumeSchema;
    onChange: (resume: ResumeSchema) => void;
    lockedSections?: Set<string>;
    onToggleLock?: (section: string) => void;
    onRegenerateSection?: (section: string, index?: number) => void;
};

const sections = [
    { id: "basics", label: "Basics" },
    { id: "experience", label: "Experience" },
    { id: "education", label: "Education" },
    { id: "projects", label: "Projects" },
    { id: "skills", label: "Skills" },
] as const;

export function ResumeEditor({
    resume,
    onChange,
    lockedSections = new Set(),
    onToggleLock,
    onRegenerateSection,
}: ResumeEditorProps) {
    const [activeSection, setActiveSection] = useState<string>("basics");

    const safeResume: ResumeSchema = {
        basics: resume.basics ?? { name: "", email: "" },
        experience: resume.experience ?? [],
        education: resume.education ?? [],
        projects: resume.projects ?? [],
        skills: resume.skills ?? [],
        certifications: resume.certifications ?? [],
    };

    return (
        <div className="flex h-full flex-col">
            {/* Section tabs */}
            <div className="flex gap-1 border-b border-border px-4 py-2">
                {sections.map((section) => (
                    <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={cn(
                            "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                            activeSection === section.id
                                ? "bg-surface-elevated text-text-primary"
                                : "text-text-muted hover:text-text-secondary"
                        )}
                    >
                        {section.label}
                    </button>
                ))}
            </div>

            {/* Section content */}
            <div className="flex-1 overflow-y-auto p-4">
                {activeSection === "basics" && (
                    <BasicsEditor
                        basics={safeResume.basics}
                        onChange={(basics) => onChange({ ...safeResume, basics })}
                        locked={lockedSections.has("basics")}
                        onToggleLock={() => onToggleLock?.("basics")}
                    />
                )}

                {activeSection === "experience" && (
                    <SectionEditor
                        section="experience"
                        data={safeResume.experience}
                        onChange={(data) =>
                            onChange({ ...safeResume, experience: data as ExperienceEntry[] })
                        }
                        onRegenerate={(i) => onRegenerateSection?.("experience", i)}
                        locked={lockedSections.has("experience")}
                        onToggleLock={() => onToggleLock?.("experience")}
                    />
                )}

                {activeSection === "education" && (
                    <SectionEditor
                        section="education"
                        data={safeResume.education}
                        onChange={(data) =>
                            onChange({ ...safeResume, education: data as EducationEntry[] })
                        }
                        locked={lockedSections.has("education")}
                        onToggleLock={() => onToggleLock?.("education")}
                    />
                )}

                {activeSection === "projects" && (
                    <SectionEditor
                        section="projects"
                        data={safeResume.projects}
                        onChange={(data) =>
                            onChange({ ...safeResume, projects: data as ProjectEntry[] })
                        }
                        onRegenerate={(i) => onRegenerateSection?.("projects", i)}
                        locked={lockedSections.has("projects")}
                        onToggleLock={() => onToggleLock?.("projects")}
                    />
                )}

                {activeSection === "skills" && (
                    <SectionEditor
                        section="skills"
                        data={safeResume.skills}
                        onChange={(data) =>
                            onChange({ ...safeResume, skills: data as string[] })
                        }
                        locked={lockedSections.has("skills")}
                        onToggleLock={() => onToggleLock?.("skills")}
                    />
                )}
            </div>
        </div>
    );
}

function BasicsEditor({
    basics,
    onChange,
    locked,
    onToggleLock,
}: {
    basics: ResumeSchema["basics"];
    onChange: (basics: ResumeSchema["basics"]) => void;
    locked?: boolean;
    onToggleLock?: () => void;
}) {
    const safe = basics ?? { name: "", email: "" };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-text-primary">
                    Contact Information
                </h3>
                <button
                    onClick={onToggleLock}
                    className="rounded p-1 text-text-muted hover:text-text-secondary"
                >
                    {locked ? "🔒" : "🔓"}
                </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Field
                    label="Full Name"
                    value={safe.name ?? ""}
                    onChange={(v) => onChange({ ...safe, name: v })}
                    disabled={locked}
                />
                <Field
                    label="Email"
                    value={safe.email ?? ""}
                    onChange={(v) => onChange({ ...safe, email: v })}
                    disabled={locked}
                />
                <Field
                    label="Phone"
                    value={safe.phone ?? ""}
                    onChange={(v) => onChange({ ...safe, phone: v })}
                    disabled={locked}
                />
                <Field
                    label="Location"
                    value={safe.location ?? ""}
                    onChange={(v) => onChange({ ...safe, location: v })}
                    disabled={locked}
                />
                <Field
                    label="LinkedIn"
                    value={safe.linkedin ?? ""}
                    onChange={(v) => onChange({ ...safe, linkedin: v })}
                    disabled={locked}
                />
                <Field
                    label="GitHub"
                    value={safe.github ?? ""}
                    onChange={(v) => onChange({ ...safe, github: v })}
                    disabled={locked}
                />
            </div>

            <div>
                <label className="mb-1.5 block text-xs font-medium text-text-muted">
                    Professional Summary
                </label>
                <textarea
                    value={safe.summary ?? ""}
                    onChange={(e) => onChange({ ...safe, summary: e.target.value })}
                    disabled={locked}
                    rows={4}
                    className="w-full resize-none rounded-lg border border-border bg-surface-elevated px-3 py-2 text-xs leading-relaxed text-text-primary placeholder:text-text-muted/50 focus:border-accent/40 focus:outline-none disabled:opacity-50"
                    placeholder="2-3 sentence professional summary..."
                />
            </div>
        </div>
    );
}

function Field({
    label,
    value,
    onChange,
    disabled,
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    disabled?: boolean;
    placeholder?: string;
}) {
    return (
        <div>
            <label className="mb-1 block text-xs font-medium text-text-muted">
                {label}
            </label>
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                placeholder={placeholder}
                className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted/50 focus:border-accent/40 focus:outline-none disabled:opacity-50"
            />
        </div>
    );
}
