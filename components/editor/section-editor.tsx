"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical, RefreshCw, Lock, Unlock } from "lucide-react";
import { cn, generateId } from "@/lib/utils";
import type { ExperienceEntry, EducationEntry, ProjectEntry, ResumeSchema } from "@/types";

type SectionEditorProps = {
    section: keyof ResumeSchema;
    data: ExperienceEntry[] | EducationEntry[] | ProjectEntry[] | string[];
    onChange: (data: ExperienceEntry[] | EducationEntry[] | ProjectEntry[] | string[]) => void;
    onRegenerate?: (index: number) => void;
    locked?: boolean;
    onToggleLock?: () => void;
};

export function SectionEditor({
    section,
    data,
    onChange,
    onRegenerate,
    locked,
    onToggleLock,
}: SectionEditorProps) {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

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
        const entries = Array.isArray(data) ? (data as ExperienceEntry[]) : [];
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
                        onToggle={() => setExpandedIndex(expandedIndex === i ? null : i)}
                        onChange={(updated) => {
                            const next = [...entries];
                            next[i] = updated;
                            onChange(next);
                        }}
                        onDelete={() => {
                            onChange(entries.filter((_, idx) => idx !== i));
                        }}
                        onRegenerate={() => onRegenerate?.(i)}
                        locked={locked}
                    />
                ))}
            </div>
        );
    }

    if (section === "education") {
        const entries = Array.isArray(data) ? (data as EducationEntry[]) : [];
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
                        onToggle={() => setExpandedIndex(expandedIndex === i ? null : i)}
                        onChange={(updated) => {
                            const next = [...entries];
                            next[i] = updated;
                            onChange(next);
                        }}
                        onDelete={() => onChange(entries.filter((_, idx) => idx !== i))}
                        locked={locked}
                    />
                ))}
            </div>
        );
    }

    if (section === "projects") {
        const entries = Array.isArray(data) ? (data as ProjectEntry[]) : [];
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
                        onToggle={() => setExpandedIndex(expandedIndex === i ? null : i)}
                        onChange={(updated) => {
                            const next = [...entries];
                            next[i] = updated;
                            onChange(next);
                        }}
                        onDelete={() => onChange(entries.filter((_, idx) => idx !== i))}
                        onRegenerate={() => onRegenerate?.(i)}
                        locked={locked}
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
                <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
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
    onRegenerate,
    locked,
}: {
    entry: ExperienceEntry;
    isExpanded: boolean;
    onToggle: () => void;
    onChange: (e: ExperienceEntry) => void;
    onDelete: () => void;
    onRegenerate: () => void;
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
                        {entry.title || "Untitled Role"}
                    </p>
                    <p className="truncate text-xs text-text-muted">
                        {entry.company || "Company"} · {entry.startDate || "Start"} –{" "}
                        {entry.current ? "Present" : entry.endDate || "End"}
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
                            onChange={(v) => onChange({ ...entry, startDate: v })}
                            placeholder="YYYY-MM"
                            disabled={locked}
                        />
                        <InputField
                            label="End Date"
                            value={entry.endDate ?? ""}
                            onChange={(v) => onChange({ ...entry, endDate: v })}
                            placeholder="YYYY-MM or Present"
                            disabled={locked}
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-text-muted">
                            Bullets
                        </label>
                        {(entry.bullets ?? []).map((bullet, bi) => (
                            <div key={bi} className="mb-2 flex items-start gap-2">
                                <span className="mt-2.5 text-xs text-text-muted">•</span>
                                <textarea
                                    value={bullet ?? ""}
                                    onChange={(e) => {
                                        const next = [...(entry.bullets ?? [])];
                                        next[bi] = e.target.value;
                                        onChange({ ...entry, bullets: next });
                                    }}
                                    disabled={locked}
                                    rows={2}
                                    className="flex-1 resize-none rounded-lg border border-border bg-surface-elevated px-3 py-2 text-xs text-text-primary placeholder:text-text-muted/50 focus:border-accent/40 focus:outline-none disabled:opacity-50"
                                />
                                {!locked && (
                                    <button
                                        onClick={() => {
                                            const next = (entry.bullets ?? []).filter(
                                                (_, idx) => idx !== bi
                                            );
                                            onChange({ ...entry, bullets: next });
                                        }}
                                        className="mt-2 rounded p-1 text-text-muted hover:text-error"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                )}
                            </div>
                        ))}
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
                            <>
                                <button
                                    onClick={onRegenerate}
                                    className="flex items-center gap-1.5 rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/15"
                                >
                                    <RefreshCw className="h-3 w-3" />
                                    Regenerate
                                </button>
                                <button
                                    onClick={onDelete}
                                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-error/70 transition-colors hover:bg-error/10 hover:text-error"
                                >
                                    <Trash2 className="h-3 w-3" />
                                    Remove
                                </button>
                            </>
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
                            onChange={(v) => onChange({ ...entry, institution: v })}
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
                            onChange={(v) => onChange({ ...entry, startDate: v })}
                            placeholder="YYYY-MM"
                            disabled={locked}
                        />
                        <InputField
                            label="End Date"
                            value={entry.endDate ?? ""}
                            onChange={(v) => onChange({ ...entry, endDate: v })}
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
    onRegenerate,
    locked,
}: {
    entry: ProjectEntry;
    isExpanded: boolean;
    onToggle: () => void;
    onChange: (e: ProjectEntry) => void;
    onDelete: () => void;
    onRegenerate: () => void;
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
                        {entry.name || "Untitled Project"}
                    </p>
                    <p className="truncate text-xs text-text-muted">
                        {(entry.technologies ?? []).join(", ") || "No technologies listed"}
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
                                onChange({ ...entry, description: e.target.value })
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
                    <div className="flex items-center gap-2">
                        {!locked && (
                            <>
                                <button
                                    onClick={onRegenerate}
                                    className="flex items-center gap-1.5 rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/15"
                                >
                                    <RefreshCw className="h-3 w-3" />
                                    Regenerate
                                </button>
                                <button
                                    onClick={onDelete}
                                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-error/70 hover:bg-error/10 hover:text-error"
                                >
                                    <Trash2 className="h-3 w-3" />
                                    Remove
                                </button>
                            </>
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

    const safeSkills = Array.isArray(skills) ? skills : [];

    // Detect if skills are categorized
    const hasCategories = safeSkills.some((s) => s.includes(":"));

    // Parse categories
    const categories: { label: string; items: string[] }[] = [];
    if (hasCategories) {
        for (const skill of safeSkills) {
            if (skill.includes(":")) {
                const [category, items] = skill.split(/:(.+)/);
                categories.push({
                    label: category.trim(),
                    items: items
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                });
            }
        }
    }

    const addSkill = () => {
        const trimmed = input.trim();
        if (!trimmed) return;

        if (hasCategories && selectedCategory) {
            // Add to specific category
            const updated = safeSkills.map((s) => {
                if (s.startsWith(selectedCategory + ":")) {
                    const existing = s.split(/:(.+)/)[1] || "";
                    const items = existing
                        .split(",")
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
        } else if (hasCategories && !selectedCategory) {
            // No category selected — add as new uncategorized
            if (!safeSkills.includes(trimmed)) {
                onChange([...safeSkills, trimmed]);
            }
        } else {
            // Flat skills — just append
            if (!safeSkills.includes(trimmed)) {
                onChange([...safeSkills, trimmed]);
            }
        }
        setInput("");
    };

    const removeSkillFromCategory = (categoryLabel: string, skillToRemove: string) => {
        const updated = safeSkills.map((s) => {
            if (s.startsWith(categoryLabel + ":")) {
                const items = s
                    .split(/:(.+)/)[1]
                    ?.split(",")
                    .map((i) => i.trim())
                    .filter((i) => i !== skillToRemove) || [];
                return `${categoryLabel}: ${items.join(", ")}`;
            }
            return s;
        });
        // Remove empty categories
        onChange(updated.filter((s) => !s.endsWith(": ")));
    };

    const removeCategory = (categoryLabel: string) => {
        onChange(safeSkills.filter((s) => !s.startsWith(categoryLabel + ":")));
    };

    return (
        <div>
            <SectionHeader
                title="Skills"
                locked={locked}
                onToggleLock={onToggleLock}
                onAdd={() => { }}
            />

            {/* Categorized Skills */}
            {hasCategories ? (
                <div className="mt-3 space-y-4">
                    {categories.map((cat) => (
                        <div key={cat.label}>
                            <div className="mb-2 flex items-center justify-between">
                                <h4 className="text-xs font-semibold text-accent/80">
                                    {cat.label}
                                </h4>
                                {!locked && (
                                    <button
                                        onClick={() => removeCategory(cat.label)}
                                        className="text-[10px] text-text-muted hover:text-error"
                                    >
                                        Remove category
                                    </button>
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
                            </div>
                        </div>
                    ))}

                    {/* Uncategorized skills */}
                    {safeSkills
                        .filter((s) => !s.includes(":"))
                        .map((skill) => (
                            <span
                                key={skill}
                                className="inline-flex items-center gap-1 rounded-md bg-surface-elevated px-2.5 py-1 text-xs text-text-secondary"
                            >
                                {skill}
                                {!locked && (
                                    <button
                                        onClick={() => onChange(safeSkills.filter((s) => s !== skill))}
                                        className="ml-0.5 text-text-muted hover:text-error"
                                    >
                                        ×
                                    </button>
                                )}
                            </span>
                        ))}
                </div>
            ) : (
                /* Flat skills */
                <div className="mt-3 flex flex-wrap gap-1.5">
                    {safeSkills.map((skill) => (
                        <span
                            key={skill}
                            className="inline-flex items-center gap-1 rounded-md bg-surface-elevated px-2.5 py-1 text-xs text-text-secondary"
                        >
                            {skill}
                            {!locked && (
                                <button
                                    onClick={() => onChange(safeSkills.filter((s) => s !== skill))}
                                    className="ml-0.5 text-text-muted hover:text-error"
                                >
                                    ×
                                </button>
                            )}
                        </span>
                    ))}
                </div>
            )}

            {/* Add skill input */}
            {!locked && (
                <div className="mt-4 space-y-2">
                    {hasCategories && (
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
                        </div>
                    )}

                    <div className="flex gap-2">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && addSkill()}
                            placeholder={
                                hasCategories && selectedCategory
                                    ? `Add to ${selectedCategory}...`
                                    : hasCategories
                                        ? "Select a category first..."
                                        : "Add a skill..."
                            }
                            className="flex-1 rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted/50 focus:border-accent/40 focus:outline-none"
                        />
                        <button
                            onClick={addSkill}
                            disabled={hasCategories && !selectedCategory}
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
