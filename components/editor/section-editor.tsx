"use client";

import { useState } from "react";
import {
    Plus,
    Trash2,
    GripVertical,
    RefreshCw,
    Lock,
    Unlock,
    Loader2,
} from "lucide-react";
import { cn, generateId } from "@/lib/utils";
import type {
    ExperienceEntry,
    EducationEntry,
    ProjectEntry,
    ResumeSchema,
} from "@/types";
import { parseSkills, skillsToFlat } from "@/lib/skills-utils";

type SectionEditorProps = {
    section: keyof ResumeSchema;
    data: ExperienceEntry[] | EducationEntry[] | ProjectEntry[] | string[];
    onChange: (
        data:
            | ExperienceEntry[]
            | EducationEntry[]
            | ProjectEntry[]
            | string[]
    ) => void;
    onRegenerateBullet?: (
        sectionType: string,
        entryIndex: number,
        bulletIndex: number
    ) => Promise<string | null>;
    onRegenerateBullets?: (
        sectionType: string,
        entryIndex: number
    ) => Promise<string[] | null>;
    locked?: boolean;
    onToggleLock?: () => void;
};

export function SectionEditor({
    section,
    data,
    onChange,
    onRegenerateBullet,
    onRegenerateBullets,
    locked,
    onToggleLock,
}: SectionEditorProps) {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
    const [regenerating, setRegenerating] = useState<string | null>(null);

    const setRegen = (key: string | null) => setRegenerating(key);
    const isRegen = (key: string) => regenerating === key;

    if (section === "skills") {
        return (
            <SkillsEditor
                skills={Array.isArray(data) ? (data as string[]) : []}
                onChange={(skills) => onChange(skills)}
                locked={locked}
                onToggleLock={onToggleLock}
            />
        );
    }

    if (section === "experience") {
        const entries = Array.isArray(data)
            ? (data as ExperienceEntry[])
            : [];
        return (
            <div className="space-y-3">
                <SectionHeader
                    title="Experience"
                    locked={locked}
                    onToggleLock={onToggleLock}
                    onAdd={() => {
                        onChange([
                            ...entries,
                            {
                                id: generateId(),
                                company: "",
                                title: "",
                                startDate: "",
                                bullets: [""],
                            },
                        ]);
                        setExpandedIndex(entries.length);
                    }}
                />
                {entries.map((entry, i) => (
                    <ExperienceCard
                        key={entry.id ?? i}
                        entry={{
                            id: entry.id ?? generateId(),
                            company: entry.company ?? "",
                            title: entry.title ?? "",
                            startDate: entry.startDate ?? "",
                            endDate: entry.endDate ?? "",
                            current: entry.current ?? false,
                            bullets: entry.bullets ?? [],
                            technologies: entry.technologies ?? [],
                            location: entry.location ?? "",
                        }}
                        isExpanded={expandedIndex === i}
                        onToggle={() =>
                            setExpandedIndex(expandedIndex === i ? null : i)
                        }
                        onChange={(updated) => {
                            const next = [...entries];
                            next[i] = updated;
                            onChange(next);
                        }}
                        onDelete={() => {
                            onChange(entries.filter((_, idx) => idx !== i));
                        }}
                        onRegenerateBullet={async (bulletIndex) => {
                            const key = `${i}-bullet-${bulletIndex}`;
                            setRegen(key);
                            const result = await onRegenerateBullet?.(
                                "experience",
                                i,
                                bulletIndex
                            );
                            setRegen(null);
                            if (result) {
                                const next = [...entries];
                                const bullets = [...(next[i].bullets ?? [])];
                                bullets[bulletIndex] = result;
                                next[i] = { ...next[i], bullets };
                                onChange(next);
                            }
                        }}
                        onRegenerateAllBullets={async () => {
                            const key = `${i}-all`;
                            setRegen(key);
                            const result = await onRegenerateBullets?.(
                                "experience",
                                i
                            );
                            setRegen(null);
                            if (result) {
                                const next = [...entries];
                                next[i] = { ...next[i], bullets: result };
                                onChange(next);
                            }
                        }}
                        locked={locked}
                        regenerating={regenerating}
                        isRegen={isRegen}
                    />
                ))}
            </div>
        );
    }

    if (section === "education") {
        const entries = Array.isArray(data)
            ? (data as EducationEntry[])
            : [];
        return (
            <div className="space-y-3">
                <SectionHeader
                    title="Education"
                    locked={locked}
                    onToggleLock={onToggleLock}
                    onAdd={() => {
                        onChange([
                            ...entries,
                            { id: generateId(), institution: "", degree: "" },
                        ]);
                        setExpandedIndex(entries.length);
                    }}
                />
                {entries.map((entry, i) => (
                    <EducationCard
                        key={entry.id ?? i}
                        entry={{
                            id: entry.id ?? generateId(),
                            institution: entry.institution ?? "",
                            degree: entry.degree ?? "",
                            field: entry.field ?? "",
                            startDate: entry.startDate ?? "",
                            endDate: entry.endDate ?? "",
                            gpa: entry.gpa ?? "",
                            honors: entry.honors ?? [],
                        }}
                        isExpanded={expandedIndex === i}
                        onToggle={() =>
                            setExpandedIndex(expandedIndex === i ? null : i)
                        }
                        onChange={(updated) => {
                            const next = [...entries];
                            next[i] = updated;
                            onChange(next);
                        }}
                        onDelete={() =>
                            onChange(entries.filter((_, idx) => idx !== i))
                        }
                        locked={locked}
                    />
                ))}
            </div>
        );
    }

    if (section === "projects") {
        const entries = Array.isArray(data)
            ? (data as ProjectEntry[])
            : [];
        return (
            <div className="space-y-3">
                <SectionHeader
                    title="Projects"
                    locked={locked}
                    onToggleLock={onToggleLock}
                    onAdd={() => {
                        onChange([
                            ...entries,
                            { id: generateId(), name: "", description: "" },
                        ]);
                        setExpandedIndex(entries.length);
                    }}
                />
                {entries.map((entry, i) => (
                    <ProjectCard
                        key={entry.id ?? i}
                        entry={{
                            id: entry.id ?? generateId(),
                            name: entry.name ?? "",
                            description: entry.description ?? "",
                            technologies: entry.technologies ?? [],
                            bullets: entry.bullets ?? [],
                            url: entry.url ?? "",
                        }}
                        isExpanded={expandedIndex === i}
                        onToggle={() =>
                            setExpandedIndex(expandedIndex === i ? null : i)
                        }
                        onChange={(updated) => {
                            const next = [...entries];
                            next[i] = updated;
                            onChange(next);
                        }}
                        onDelete={() =>
                            onChange(entries.filter((_, idx) => idx !== i))
                        }
                        onRegenerateBullet={async (bulletIndex) => {
                            const key = `proj-${i}-bullet-${bulletIndex}`;
                            setRegen(key);
                            const result = await onRegenerateBullet?.(
                                "projects",
                                i,
                                bulletIndex
                            );
                            setRegen(null);
                            if (result) {
                                const next = [...entries];
                                const bullets = [...(next[i].bullets ?? [])];
                                bullets[bulletIndex] = result;
                                next[i] = { ...next[i], bullets };
                                onChange(next);
                            }
                        }}
                        locked={locked}
                        regenerating={regenerating}
                        isRegen={isRegen}
                    />
                ))}
            </div>
        );
    }

    return null;
}

function SectionHeader({
    title,
    locked,
    onToggleLock,
    onAdd,
}: {
    title: string;
    locked?: boolean;
    onToggleLock?: () => void;
    onAdd: () => void;
}) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-text-primary">
                    {title}
                </h3>
                {onToggleLock && (
                    <button
                        onClick={onToggleLock}
                        className="rounded p-1 text-text-muted transition-colors hover:text-text-secondary"
                        title={locked ? "Unlock section" : "Lock section"}
                    >
                        {locked ? (
                            <Lock className="h-3.5 w-3.5" />
                        ) : (
                            <Unlock className="h-3.5 w-3.5" />
                        )}
                    </button>
                )}
            </div>
            {!locked && (
                <button
                    onClick={onAdd}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-text-muted transition-colors hover:bg-surface-hover hover:text-text-secondary"
                >
                    <Plus className="h-3 w-3" />
                    Add
                </button>
            )}
        </div>
    );
}

function ExperienceCard({
    entry,
    isExpanded,
    onToggle,
    onChange,
    onDelete,
    onRegenerateBullet,
    onRegenerateAllBullets,
    locked,
    regenerating,
    isRegen,
}: {
    entry: ExperienceEntry;
    isExpanded: boolean;
    onToggle: () => void;
    onChange: (e: ExperienceEntry) => void;
    onDelete: () => void;
    onRegenerateBullet: (bulletIndex: number) => Promise<void>;
    onRegenerateAllBullets: () => Promise<void>;
    locked?: boolean;
    regenerating: string | null;
    isRegen: (key: string) => boolean;
}) {
    return (
        <div className="rounded-xl border border-border bg-surface transition-colors hover:border-border/80">
            <button
                onClick={onToggle}
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
            >
                <GripVertical className="h-4 w-4 text-text-muted/30" />
                <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-text-primary">
                        {entry.title || "Untitled Role"}
                    </p>
                    <p className="truncate text-xs text-text-muted">
                        {entry.company || "Company"} · {entry.startDate || "Start"} –{" "}
                        {entry.current
                            ? "Present"
                            : entry.endDate || "End"}
                    </p>
                </div>
            </button>

            {isExpanded && (
                <div className="space-y-3 border-t border-border px-4 pb-4 pt-3">
                    <div className="grid grid-cols-2 gap-3">
                        <InputField
                            label="Title"
                            value={entry.title}
                            onChange={(v) => onChange({ ...entry, title: v })}
                            disabled={locked}
                        />
                        <InputField
                            label="Company"
                            value={entry.company}
                            onChange={(v) => onChange({ ...entry, company: v })}
                            disabled={locked}
                        />
                        <InputField
                            label="Start Date"
                            value={entry.startDate}
                            onChange={(v) =>
                                onChange({ ...entry, startDate: v })
                            }
                            placeholder="YYYY-MM"
                            disabled={locked}
                        />
                        <InputField
                            label="End Date"
                            value={entry.endDate ?? ""}
                            onChange={(v) =>
                                onChange({ ...entry, endDate: v })
                            }
                            placeholder="YYYY-MM or Present"
                            disabled={locked}
                        />
                    </div>

                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <label className="text-xs font-medium text-text-muted">
                                Bullets
                            </label>
                            {!locked && (entry.bullets ?? []).length > 0 && (
                                <button
                                    onClick={onRegenerateAllBullets}
                                    disabled={!!regenerating}
                                    className="flex items-center gap-1 text-[11px] text-accent/70 hover:text-accent disabled:opacity-40"
                                >
                                    {isRegen(`${entry.id ?? ""}-all`) ? (
                                        <>
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                            Rewriting all...
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw className="h-3 w-3" />
                                            Rewrite all bullets
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                        {(entry.bullets ?? []).map((bullet, bi) => {
                            const regenKey = `${entry.id ?? ""}-bullet-${bi}`;
                            return (
                                <div key={bi} className="mb-2 flex items-start gap-2">
                                    <span className="mt-2.5 text-xs text-text-muted">
                                        •
                                    </span>
                                    <textarea
                                        value={bullet ?? ""}
                                        onChange={(e) => {
                                            const next = [...(entry.bullets ?? [])];
                                            next[bi] = e.target.value;
                                            onChange({ ...entry, bullets: next });
                                        }}
                                        disabled={locked || isRegen(regenKey)}
                                        rows={2}
                                        className="flex-1 resize-none rounded-lg border border-border bg-surface-elevated px-3 py-2 text-xs text-text-primary placeholder:text-text-muted/50 focus:border-accent/40 focus:outline-none disabled:opacity-50"
                                    />
                                    {!locked && (
                                        <div className="mt-2 flex flex-col gap-1">
                                            <button
                                                onClick={() => onRegenerateBullet(bi)}
                                                disabled={!!regenerating}
                                                title="Regenerate this bullet"
                                                className="rounded p-1 text-text-muted transition-colors hover:text-accent disabled:opacity-40"
                                            >
                                                {isRegen(regenKey) ? (
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                ) : (
                                                    <RefreshCw className="h-3 w-3" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const next = (
                                                        entry.bullets ?? []
                                                    ).filter((_, idx) => idx !== bi);
                                                    onChange({ ...entry, bullets: next });
                                                }}
                                                title="Remove this bullet"
                                                className="rounded p-1 text-text-muted hover:text-error"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {!locked && (
                            <button
                                onClick={() =>
                                    onChange({
                                        ...entry,
                                        bullets: [...(entry.bullets ?? []), ""],
                                    })
                                }
                                className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover"
                            >
                                <Plus className="h-3 w-3" />
                                Add bullet
                            </button>
                        )}
                    </div>

                    <InputField
                        label="Technologies"
                        value={(entry.technologies ?? []).join(", ")}
                        onChange={(v) =>
                            onChange({
                                ...entry,
                                technologies: v
                                    .split(",")
                                    .map((t) => t.trim())
                                    .filter(Boolean),
                            })
                        }
                        placeholder="React, TypeScript, Node.js"
                        disabled={locked}
                    />

                    <div className="flex items-center gap-2 pt-1">
                        {!locked && (
                            <button
                                onClick={onDelete}
                                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-error/70 transition-colors hover:bg-error/10 hover:text-error"
                            >
                                <Trash2 className="h-3 w-3" />
                                Remove
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function EducationCard({
    entry,
    isExpanded,
    onToggle,
    onChange,
    onDelete,
    locked,
}: {
    entry: EducationEntry;
    isExpanded: boolean;
    onToggle: () => void;
    onChange: (e: EducationEntry) => void;
    onDelete: () => void;
    locked?: boolean;
}) {
    return (
        <div className="rounded-xl border border-border bg-surface transition-colors hover:border-border/80">
            <button
                onClick={onToggle}
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
            >
                <GripVertical className="h-4 w-4 text-text-muted/30" />
                <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-text-primary">
                        {entry.degree || "Degree"}
                        {entry.field ? ` in ${entry.field}` : ""}
                    </p>
                    <p className="truncate text-xs text-text-muted">
                        {entry.institution || "Institution"}
                    </p>
                </div>
            </button>

            {isExpanded && (
                <div className="space-y-3 border-t border-border px-4 pb-4 pt-3">
                    <div className="grid grid-cols-2 gap-3">
                        <InputField
                            label="Institution"
                            value={entry.institution}
                            onChange={(v) =>
                                onChange({ ...entry, institution: v })
                            }
                            disabled={locked}
                        />
                        <InputField
                            label="Degree"
                            value={entry.degree}
                            onChange={(v) => onChange({ ...entry, degree: v })}
                            disabled={locked}
                        />
                        <InputField
                            label="Field"
                            value={entry.field ?? ""}
                            onChange={(v) => onChange({ ...entry, field: v })}
                            disabled={locked}
                        />
                        <InputField
                            label="GPA"
                            value={entry.gpa ?? ""}
                            onChange={(v) => onChange({ ...entry, gpa: v })}
                            disabled={locked}
                        />
                        <InputField
                            label="Start Date"
                            value={entry.startDate ?? ""}
                            onChange={(v) =>
                                onChange({ ...entry, startDate: v })
                            }
                            placeholder="YYYY-MM"
                            disabled={locked}
                        />
                        <InputField
                            label="End Date"
                            value={entry.endDate ?? ""}
                            onChange={(v) =>
                                onChange({ ...entry, endDate: v })
                            }
                            placeholder="YYYY-MM"
                            disabled={locked}
                        />
                    </div>
                    {!locked && (
                        <button
                            onClick={onDelete}
                            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-error/70 hover:bg-error/10 hover:text-error"
                        >
                            <Trash2 className="h-3 w-3" />
                            Remove
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

function ProjectCard({
    entry,
    isExpanded,
    onToggle,
    onChange,
    onDelete,
    onRegenerateBullet,
    locked,
    regenerating,
    isRegen,
}: {
    entry: ProjectEntry;
    isExpanded: boolean;
    onToggle: () => void;
    onChange: (e: ProjectEntry) => void;
    onDelete: () => void;
    onRegenerateBullet?: (bulletIndex: number) => Promise<void>;
    locked?: boolean;
    regenerating: string | null;
    isRegen: (key: string) => boolean;
}) {
    return (
        <div className="rounded-xl border border-border bg-surface transition-colors hover:border-border/80">
            <button
                onClick={onToggle}
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
            >
                <GripVertical className="h-4 w-4 text-text-muted/30" />
                <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-text-primary">
                        {entry.name || "Untitled Project"}
                    </p>
                    <p className="truncate text-xs text-text-muted">
                        {(entry.technologies ?? []).join(", ") ||
                            "No technologies listed"}
                    </p>
                </div>
            </button>

            {isExpanded && (
                <div className="space-y-3 border-t border-border px-4 pb-4 pt-3">
                    <InputField
                        label="Name"
                        value={entry.name}
                        onChange={(v) => onChange({ ...entry, name: v })}
                        disabled={locked}
                    />
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-text-muted">
                            Description
                        </label>
                        <textarea
                            value={entry.description ?? ""}
                            onChange={(e) =>
                                onChange({
                                    ...entry,
                                    description: e.target.value,
                                })
                            }
                            disabled={locked}
                            rows={2}
                            className="w-full resize-none rounded-lg border border-border bg-surface-elevated px-3 py-2 text-xs text-text-primary focus:border-accent/40 focus:outline-none disabled:opacity-50"
                        />
                    </div>
                    <InputField
                        label="Technologies"
                        value={(entry.technologies ?? []).join(", ")}
                        onChange={(v) =>
                            onChange({
                                ...entry,
                                technologies: v
                                    .split(",")
                                    .map((t) => t.trim())
                                    .filter(Boolean),
                            })
                        }
                        disabled={locked}
                    />

                    {/* Project bullets */}
                    {(entry.bullets ?? []).length > 0 && (
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-text-muted">
                                Bullets
                            </label>
                            {(entry.bullets ?? []).map((bullet, bi) => {
                                const regenKey = `proj-${entry.id ?? ""}-bullet-${bi}`;
                                return (
                                    <div
                                        key={bi}
                                        className="mb-2 flex items-start gap-2"
                                    >
                                        <span className="mt-2.5 text-xs text-text-muted">
                                            •
                                        </span>
                                        <textarea
                                            value={bullet ?? ""}
                                            onChange={(e) => {
                                                const next = [...(entry.bullets ?? [])];
                                                next[bi] = e.target.value;
                                                onChange({ ...entry, bullets: next });
                                            }}
                                            disabled={locked || isRegen(regenKey)}
                                            rows={2}
                                            className="flex-1 resize-none rounded-lg border border-border bg-surface-elevated px-3 py-2 text-xs text-text-primary focus:border-accent/40 focus:outline-none disabled:opacity-50"
                                        />
                                        {!locked && (
                                            <div className="mt-2 flex flex-col gap-1">
                                                <button
                                                    onClick={() =>
                                                        onRegenerateBullet?.(bi)
                                                    }
                                                    disabled={!!regenerating}
                                                    title="Regenerate this bullet"
                                                    className="rounded p-1 text-text-muted hover:text-accent disabled:opacity-40"
                                                >
                                                    {isRegen(regenKey) ? (
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                    ) : (
                                                        <RefreshCw className="h-3 w-3" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const next = (
                                                            entry.bullets ?? []
                                                        ).filter((_, idx) => idx !== bi);
                                                        onChange({
                                                            ...entry,
                                                            bullets: next,
                                                        });
                                                    }}
                                                    title="Remove this bullet"
                                                    className="rounded p-1 text-text-muted hover:text-error"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            {!locked && (
                                <button
                                    onClick={() =>
                                        onChange({
                                            ...entry,
                                            bullets: [...(entry.bullets ?? []), ""],
                                        })
                                    }
                                    className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover"
                                >
                                    <Plus className="h-3 w-3" />
                                    Add bullet
                                </button>
                            )}
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        {!locked && (
                            <button
                                onClick={onDelete}
                                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-error/70 hover:bg-error/10 hover:text-error"
                            >
                                <Trash2 className="h-3 w-3" />
                                Remove
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function SkillsEditor({
    skills,
    onChange,
    locked,
    onToggleLock,
}: {
    skills: string[];
    onChange: (skills: string[]) => void;
    locked?: boolean;
    onToggleLock?: () => void;
}) {
    const [input, setInput] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [showNewCategory, setShowNewCategory] = useState(false);

    const safeSkills = Array.isArray(skills) ? skills : [];
    const skillData = parseSkills(safeSkills);
    const { isCategorized, categories, flat } = skillData;

    // ── Add skill ─────────────────────────────────────────────────
    const addSkill = () => {
        const trimmed = input.trim();
        if (!trimmed) return;

        if (isCategorized && selectedCategory) {
            // Add to existing category
            const updated = safeSkills.map((s) => {
                if (s.startsWith(selectedCategory + ":")) {
                    const existing = s.split(/:(.+)/)[1] || "";
                    const items = existing
                        .split(/[,·|]/)
                        .map((i) => i.trim())
                        .filter(Boolean);
                    if (!items.includes(trimmed)) {
                        items.push(trimmed);
                    }
                    return `${selectedCategory}: ${items.join(", ")}`;
                }
                return s;
            });
            onChange(updated);
        } else if (isCategorized && !selectedCategory) {
            // Add as uncategorized
            if (!safeSkills.includes(trimmed)) {
                onChange([...safeSkills, trimmed]);
            }
        } else {
            // Flat — just append
            if (!safeSkills.includes(trimmed)) {
                onChange([...safeSkills, trimmed]);
            }
        }
        setInput("");
    };

    // ── Add new category ──────────────────────────────────────────
    const addNewCategory = () => {
        const name = newCategoryName.trim();
        if (!name) return;
        if (safeSkills.some((s) => s.startsWith(name + ":"))) return;

        onChange([...safeSkills, `${name}:`]);
        setSelectedCategory(name);
        setNewCategoryName("");
        setShowNewCategory(false);
    };

    // ── Convert flat to categorized ───────────────────────────────
    const convertToCategorized = () => {
        // Create a single category with all skills
        onChange([`General: ${safeSkills.join(", ")}`]);
        setSelectedCategory("General");
    };

    // ── Convert categorized to flat ───────────────────────────────
    const convertToFlat = () => {
        const all = skillsToFlat(safeSkills);
        onChange(all);
        setSelectedCategory(null);
    };

    // ── Remove skill from category ────────────────────────────────
    const removeSkillFromCategory = (categoryLabel: string, skillToRemove: string) => {
        const updated = safeSkills.map((s) => {
            if (s.startsWith(categoryLabel + ":")) {
                const items = s
                    .split(/:(.+)/)[1]
                    ?.split(/[,·|]/)
                    .map((i) => i.trim())
                    .filter((i) => i !== skillToRemove) || [];
                return `${categoryLabel}: ${items.join(", ")}`;
            }
            return s;
        });
        onChange(updated.filter((s) => !s.endsWith(": ") && !s.endsWith(":")));
    };

    // ── Remove category ───────────────────────────────────────────
    const removeCategory = (categoryLabel: string) => {
        onChange(safeSkills.filter((s) => !s.startsWith(categoryLabel + ":")));
        if (selectedCategory === categoryLabel) {
            setSelectedCategory(categories.length > 1 ? categories[0].label : null);
        }
    };

    // ── Remove flat skill ─────────────────────────────────────────
    const removeFlatSkill = (skill: string) => {
        onChange(safeSkills.filter((s) => s !== skill));
    };

    return (
        <div>
            <SectionHeader
                title="Skills"
                locked={locked}
                onToggleLock={onToggleLock}
                onAdd={() => { }}
            />

            {/* Format toggle */}
            {!locked && (
                <div className="mt-3 mb-3 flex items-center gap-2">
                    <span className="text-[11px] text-text-muted">Format:</span>
                    <button
                        onClick={isCategorized ? convertToFlat : undefined}
                        className={`rounded-md px-2.5 py-1 text-[11px] transition-all ${!isCategorized
                            ? "bg-accent/15 text-accent ring-1 ring-accent/30"
                            : "bg-surface-elevated text-text-muted hover:text-text-secondary"
                            }`}
                    >
                        Flat list
                    </button>
                    <button
                        onClick={!isCategorized ? convertToCategorized : undefined}
                        className={`rounded-md px-2.5 py-1 text-[11px] transition-all ${isCategorized
                            ? "bg-accent/15 text-accent ring-1 ring-accent/30"
                            : "bg-surface-elevated text-text-muted hover:text-text-secondary"
                            }`}
                    >
                        Categorized
                    </button>
                </div>
            )}

            {/* ── Categorized View ──────────────────────────────────── */}
            {isCategorized && (
                <div className="space-y-4">
                    {categories.map((cat) => (
                        <div key={cat.label}>
                            <div className="mb-2 flex items-center justify-between">
                                <h4 className="text-xs font-semibold text-accent/80">
                                    {cat.label}
                                </h4>
                                {!locked && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-text-muted/50">
                                            {cat.items.length} items
                                        </span>
                                        <button
                                            onClick={() => removeCategory(cat.label)}
                                            className="text-[10px] text-text-muted hover:text-error"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {cat.items.map((item) => (
                                    <span
                                        key={`${cat.label}-${item}`}
                                        className="inline-flex items-center gap-1 rounded-md bg-surface-elevated px-2.5 py-1 text-xs text-text-secondary"
                                    >
                                        {item}
                                        {!locked && (
                                            <button
                                                onClick={() => removeSkillFromCategory(cat.label, item)}
                                                className="ml-0.5 text-text-muted hover:text-error"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </span>
                                ))}
                                {cat.items.length === 0 && (
                                    <span className="text-[11px] text-text-muted/40 italic">
                                        Empty — add skills below
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Uncategorized skills */}
                    {flat.length > 0 && (
                        <div>
                            <h4 className="mb-2 text-xs font-semibold text-text-muted/60">
                                Uncategorized
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                                {flat.map((skill) => (
                                    <span
                                        key={skill}
                                        className="inline-flex items-center gap-1 rounded-md bg-surface-elevated px-2.5 py-1 text-xs text-text-secondary"
                                    >
                                        {skill}
                                        {!locked && (
                                            <button
                                                onClick={() => removeFlatSkill(skill)}
                                                className="ml-0.5 text-text-muted hover:text-error"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── Flat View ─────────────────────────────────────────── */}
            {!isCategorized && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                    {flat.map((skill) => (
                        <span
                            key={skill}
                            className="inline-flex items-center gap-1 rounded-md bg-surface-elevated px-2.5 py-1 text-xs text-text-secondary"
                        >
                            {skill}
                            {!locked && (
                                <button
                                    onClick={() => removeFlatSkill(skill)}
                                    className="ml-0.5 text-text-muted hover:text-error"
                                >
                                    ×
                                </button>
                            )}
                        </span>
                    ))}
                    {flat.length === 0 && (
                        <span className="text-xs text-text-muted/40 italic">
                            No skills added yet
                        </span>
                    )}
                </div>
            )}

            {/* ── Add Skill Input ───────────────────────────────────── */}
            {!locked && (
                <div className="mt-4 space-y-2">
                    {/* Category selector (categorized mode) */}
                    {isCategorized && (
                        <div className="flex flex-wrap gap-1.5">
                            {categories.map((cat) => (
                                <button
                                    key={cat.label}
                                    onClick={() =>
                                        setSelectedCategory(
                                            selectedCategory === cat.label ? null : cat.label
                                        )
                                    }
                                    className={`rounded-md px-2.5 py-1 text-xs transition-all ${selectedCategory === cat.label
                                        ? "bg-accent/15 text-accent ring-1 ring-accent/30"
                                        : "bg-surface-elevated text-text-muted hover:text-text-secondary"
                                        }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className={`rounded-md px-2.5 py-1 text-xs transition-all ${selectedCategory === null
                                    ? "bg-accent/15 text-accent ring-1 ring-accent/30"
                                    : "bg-surface-elevated text-text-muted hover:text-text-secondary"
                                    }`}
                            >
                                Uncategorized
                            </button>
                            <button
                                onClick={() => setShowNewCategory(!showNewCategory)}
                                className="rounded-md bg-surface-elevated px-2.5 py-1 text-xs text-accent/70 hover:text-accent"
                            >
                                + Category
                            </button>
                        </div>
                    )}

                    {/* New category input */}
                    {showNewCategory && (
                        <div className="flex gap-2">
                            <input
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && addNewCategory()}
                                placeholder="Category name (e.g., Frontend, Databases)..."
                                className="flex-1 rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted/50 focus:border-accent/40 focus:outline-none"
                            />
                            <button
                                onClick={addNewCategory}
                                className="rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/15"
                            >
                                Create
                            </button>
                        </div>
                    )}

                    {/* Skill input */}
                    <div className="flex gap-2">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && addSkill()}
                            placeholder={
                                isCategorized && selectedCategory
                                    ? `Add to ${selectedCategory}...`
                                    : isCategorized
                                        ? "Select a category first..."
                                        : "Add a skill..."
                            }
                            className="flex-1 rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted/50 focus:border-accent/40 focus:outline-none"
                        />
                        <button
                            onClick={addSkill}
                            disabled={isCategorized && !selectedCategory}
                            className="rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/15 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Add
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}


function InputField({
    label,
    value,
    onChange,
    placeholder,
    disabled,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    disabled?: boolean;
}) {
    return (
        <div>
            <label className="mb-1 block text-xs font-medium text-text-muted">
                {label}
            </label>
            <input
                value={value ?? ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted/50 focus:border-accent/40 focus:outline-none disabled:opacity-50"
            />
        </div>
    );
}
