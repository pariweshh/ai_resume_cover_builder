"use client";

import { useState } from "react";
import { SectionEditor } from "./section-editor";
import { useRegenerate } from "@/hooks/useRegenerate";
import { cn } from "@/lib/utils";
import type {
    ResumeSchema,
    ExperienceEntry,
    EducationEntry,
    ProjectEntry,
} from "@/types";
import { RefreshCw } from "lucide-react";

type ResumeEditorProps = {
    resume: ResumeSchema;
    onChange: (resume: ResumeSchema) => void;
    lockedSections?: Set<string>;
    onToggleLock?: (section: string) => void;
    onRegenerateSection?: (section: string, index?: number) => void;
    jobDescription?: string;
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
    jobDescription,
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

    const { regenerateBullet, regenerateBullets } = useRegenerate({
        jobDescription,
        resumeContext: JSON.stringify(safeResume).slice(0, 2000),
    });

    // ── Bullet regeneration handlers ──────────────────────────────

    const handleRegenerateBullet = async (
        sectionType: string,
        entryIndex: number,
        bulletIndex: number
    ): Promise<string | null> => {
        let bullet = "";
        if (sectionType === "experience") {
            bullet = safeResume.experience[entryIndex]?.bullets?.[bulletIndex] ?? "";
        } else if (sectionType === "projects") {
            bullet = safeResume.projects[entryIndex]?.bullets?.[bulletIndex] ?? "";
        }
        if (!bullet) return null;
        return regenerateBullet(bullet);
    };

    const handleRegenerateBullets = async (
        sectionType: string,
        entryIndex: number
    ): Promise<string[] | null> => {
        let bullets: string[] = [];
        if (sectionType === "experience") {
            bullets = safeResume.experience[entryIndex]?.bullets ?? [];
        }
        if (bullets.length === 0) return null;
        return regenerateBullets(bullets);
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
                        onChange={(basics) =>
                            onChange({ ...safeResume, basics })
                        }
                        locked={lockedSections.has("basics")}
                        onToggleLock={() => onToggleLock?.("basics")}
                        onRegenerateSummary={async () => {
                            const summary = safeResume.basics.summary ?? "";
                            if (!summary) return;
                            const result = await regenerateBullet(summary);
                            if (result) {
                                onChange({
                                    ...safeResume,
                                    basics: { ...safeResume.basics, summary: result },
                                });
                            }
                        }}
                    />
                )}

                {activeSection === "experience" && (
                    <SectionEditor
                        section="experience"
                        data={safeResume.experience}
                        onChange={(data) =>
                            onChange({
                                ...safeResume,
                                experience: data as ExperienceEntry[],
                            })
                        }
                        onRegenerateBullet={handleRegenerateBullet}
                        onRegenerateBullets={handleRegenerateBullets}
                        locked={lockedSections.has("experience")}
                        onToggleLock={() => onToggleLock?.("experience")}
                    />
                )}

                {activeSection === "education" && (
                    <SectionEditor
                        section="education"
                        data={safeResume.education}
                        onChange={(data) =>
                            onChange({
                                ...safeResume,
                                education: data as EducationEntry[],
                            })
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
                            onChange({
                                ...safeResume,
                                projects: data as ProjectEntry[],
                            })
                        }
                        onRegenerateBullet={handleRegenerateBullet}
                        locked={lockedSections.has("projects")}
                        onToggleLock={() => onToggleLock?.("projects")}
                    />
                )}

                {activeSection === "skills" && (
                    <SectionEditor
                        section="skills"
                        data={safeResume.skills}
                        onChange={(data) =>
                            onChange({
                                ...safeResume,
                                skills: data as string[],
                            })
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
    onRegenerateSummary,
}: {
    basics: ResumeSchema["basics"];
    onChange: (basics: ResumeSchema["basics"]) => void;
    locked?: boolean;
    onToggleLock?: () => void;
    onRegenerateSummary?: () => Promise<void>;
}) {
    const safe = basics ?? { name: "", email: "" } as ResumeSchema["basics"];

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
                <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-xs font-medium text-text-muted">
                        Professional Summary
                    </label>
                    {!locked && safe.summary && onRegenerateSummary && (
                        <button
                            onClick={onRegenerateSummary}
                            className="flex items-center gap-1 text-[11px] text-accent/70 hover:text-accent"
                        >
                            <RefreshCw className="h-3 w-3" />
                            Regenerate
                        </button>
                    )}
                </div>
                <textarea
                    value={safe.summary ?? ""}
                    onChange={(e) =>
                        onChange({ ...safe, summary: e.target.value })
                    }
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
