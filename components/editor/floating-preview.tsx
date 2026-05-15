"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { GripHorizontal, X, Maximize2, Minimize2 } from "lucide-react";
import type { ResumeSchema } from "@/types";
import { DEFAULT_SECTION_ORDER, type ReorderableSection } from "@/types";
import { formatDate } from "@/lib/utils";
import { parseSkills } from "@/lib/skills-utils";

type Props = {
    resume: ResumeSchema;
    font: string;
    onClose: () => void;
};

export function FloatingPreview({ resume, font, onClose }: Props) {
    const [expanded, setExpanded] = useState(false);
    const constraintsRef = useRef<HTMLDivElement>(null);

    const width = expanded ? 520 : 280;
    const height = expanded ? 720 : 400;
    const scale = width / 794;

    return (
        <div
            ref={constraintsRef}
            className="pointer-events-none absolute inset-0 z-30 overflow-hidden"
        >
            <motion.div
                drag
                dragConstraints={constraintsRef}
                dragElastic={0.05}
                dragMomentum={false}
                whileDrag={{
                    scale: 1.01,
                    boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
                }}
                initial={{ x: 24, y: 24 }}
                style={{ width, height }}
                className="pointer-events-auto absolute flex flex-col overflow-hidden rounded-xl border border-border bg-white shadow-2xl"
            >
                {/* Header */}
                <div className="flex shrink-0 cursor-grab items-center justify-between border-b border-gray-200 bg-gray-50 px-3 py-1.5 active:cursor-grabbing">
                    <div className="flex items-center gap-1.5">
                        <GripHorizontal className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-[11px] font-medium text-gray-600">
                            Preview
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setExpanded((v) => !v);
                            }}
                            className="rounded p-0.5 text-gray-400 hover:text-gray-600"
                        >
                            {expanded ? (
                                <Minimize2 className="h-3 w-3" />
                            ) : (
                                <Maximize2 className="h-3 w-3" />
                            )}
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onClose();
                            }}
                            className="rounded p-0.5 text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                </div>

                <div
                    className="h-full overflow-auto overflow-x-hidden"
                // style={{ background: "#e5e5e5" }}
                >
                    <div
                        style={{
                            width: 794,
                            transform: `scale(${scale})`,
                            transformOrigin: "top left",
                            background: "#fff",
                        }}
                    >
                        <PreviewContent resume={resume} font={font} />
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// ── Inline preview renderer ─────────────────────────────────────
// Renders the resume as pure HTML/CSS matching the PDF layout.
// No extra components, no hooks — just a direct render function.

const FONT_STACK: Record<string, string> = {
    Calibri: "'Source Sans 3', Calibri, 'Segoe UI', sans-serif",
    Georgia: "'Merriweather', Georgia, 'Times New Roman', serif",
    Helvetica: "Helvetica, Arial, sans-serif",
    Garamond: "'EB Garamond', Garamond, 'Times New Roman', serif",
    Cambria: "'Crimson Pro', Cambria, Georgia, serif",
};

function PreviewContent({
    resume,
    font,
}: {
    resume: ResumeSchema;
    font: string;
}) {
    const fontFamily = FONT_STACK[font] || FONT_STACK.Calibri;
    const order = resume.sectionOrder ?? DEFAULT_SECTION_ORDER;

    const s = {
        section: { marginBottom: "10px" } as React.CSSProperties,
        header: {
            fontSize: "12.5px",
            fontWeight: 700,
            marginBottom: "2px",
            borderBottom: "1px solid #a0a0a0",
            paddingBottom: "2px",
        } as React.CSSProperties,
        text: {
            fontSize: "11px",
            lineHeight: "1.35",
            color: "#000",
        } as React.CSSProperties,
        muted: {
            fontSize: "10px",
            color: "#555",
        } as React.CSSProperties,
        dim: {
            fontSize: "9.5px",
            color: "#666",
        } as React.CSSProperties,
        bullet: {
            fontSize: "11px",
            lineHeight: "1.35",
            paddingLeft: "10px",
            position: "relative" as const,
            marginBottom: "1px",
        } as React.CSSProperties,
    };

    return (
        <div
            style={{
                padding: "48px 48px 42px",
                fontFamily,
                fontSize: "11px",
                lineHeight: "1.35",
                color: "#000",
            }}
        >
            {/* Name */}
            <div
                style={{
                    fontSize: "24px",
                    fontWeight: 700,
                    letterSpacing: "0.8px",
                    textTransform: "uppercase",
                    marginBottom: "4px",
                }}
            >
                {resume.basics.name || "Your Name"}
            </div>

            {/* Tagline */}
            {(() => {
                const titles = [
                    ...new Set(resume.experience.map((e) => e.title)),
                ].slice(0, 3);
                const skills = resume.skills
                    .filter((sk) => !sk.includes(":"))
                    .slice(0, 4);
                const tag = [...titles, ...skills].join(" · ");
                return tag ? (
                    <div style={{ ...s.muted, color: "#505050", marginBottom: "3px" }}>
                        {tag}
                    </div>
                ) : null;
            })()}

            {/* Contact */}
            {(() => {
                const parts = [
                    resume.basics.phone,
                    resume.basics.email,
                    resume.basics.location,
                    resume.basics.github,
                    resume.basics.linkedin,
                    resume.basics.website,
                ].filter(Boolean);
                return parts.length > 0 ? (
                    <div style={{ ...s.muted, color: "#333", marginBottom: "2px" }}>
                        {parts.join(" | ")}
                    </div>
                ) : null;
            })()}

            {/* Divider */}
            <div
                style={{
                    borderBottom: "1.5px solid #a0a0a0",
                    margin: "5px 0 10px",
                }}
            />

            {/* Sections */}
            {order.map((section) => {
                switch (section) {
                    case "summary":
                        return renderSummary(resume, s);
                    case "skills":
                        return renderSkills(resume, s);
                    case "experience":
                        return renderExperience(resume, s);
                    case "projects":
                        return renderProjects(resume, s);
                    case "education":
                        return renderEducation(resume, s);
                    default:
                        return null;
                }
            })}
        </div>
    );
}

function renderSummary(resume: ResumeSchema, s: Record<string, React.CSSProperties>) {
    if (!resume.basics.summary) return null;
    return (
        <div key="summary" style={s.section}>
            <div style={s.header}>PROFESSIONAL SUMMARY</div>
            <div style={s.text}>{resume.basics.summary}</div>
        </div>
    );
}

function renderSkills(resume: ResumeSchema, s: Record<string, React.CSSProperties>) {
    if (resume.skills.length === 0) return null;
    const data = parseSkills(resume.skills);

    return (
        <div key="skills" style={s.section}>
            <div style={s.header}>TECHNICAL SKILLS</div>
            {data.isCategorized && data.categories.length > 0 ? (
                <div>
                    {data.categories.map((cat) => (
                        <div key={cat.label} style={{ ...s.text, marginBottom: "2px" }}>
                            <span style={{ fontWeight: 700 }}>{cat.label}: </span>
                            <span>{cat.items.join(", ")}</span>
                        </div>
                    ))}
                    {data.flat.length > 0 && (
                        <div style={s.text}>{data.flat.join(", ")}</div>
                    )}
                </div>
            ) : (
                <div style={s.text}>{data.flat.join(", ")}</div>
            )}
        </div>
    );
}

function renderExperience(resume: ResumeSchema, s: Record<string, React.CSSProperties>) {
    if (resume.experience.length === 0) return null;

    return (
        <div key="experience" style={s.section}>
            <div style={s.header}>PROFESSIONAL EXPERIENCE</div>
            {resume.experience.map((exp, i) => (
                <div
                    key={exp.id ?? i}
                    style={{
                        marginBottom:
                            i < resume.experience.length - 1 ? "7px" : 0,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "baseline",
                        }}
                    >
                        <div style={{ fontWeight: 700, fontSize: "11.5px" }}>
                            {exp.title}
                        </div>
                        <div style={{ ...s.muted, color: "#333", flexShrink: 0 }}>
                            {formatDate(exp.startDate)} -{" "}
                            {exp.current ? "Present" : formatDate(exp.endDate || "")}
                        </div>
                    </div>
                    <div style={{ ...s.muted, color: "#333" }}>
                        {[exp.company, exp.location].filter(Boolean).join(" | ")}
                    </div>
                    {exp.technologies && exp.technologies.length > 0 && (
                        <div style={s.dim}>{exp.technologies.join(", ")}</div>
                    )}
                    <div style={{ marginTop: "3px" }}>
                        {exp.bullets.map((bullet, bi) => (
                            <div key={bi} style={s.bullet}>
                                <span
                                    style={{
                                        position: "absolute",
                                        left: 0,
                                        top: 0,
                                    }}
                                >
                                    •
                                </span>
                                {bullet}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

function renderProjects(resume: ResumeSchema, s: Record<string, React.CSSProperties>) {
    if (resume.projects.length === 0) return null;

    return (
        <div key="projects" style={s.section}>
            <div style={s.header}>INDEPENDENT DEVELOPMENT & PROJECTS</div>
            {resume.projects.map((proj, i) => (
                <div
                    key={proj.id ?? i}
                    style={{
                        marginBottom:
                            i < resume.projects.length - 1 ? "7px" : 0,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "baseline",
                        }}
                    >
                        <div style={{ fontWeight: 700, fontSize: "11.5px" }}>
                            {proj.name}
                        </div>
                        {proj.url && (
                            <div style={{ ...s.dim, color: "#3c64c8", flexShrink: 0 }}>
                                {proj.url}
                            </div>
                        )}
                    </div>
                    {proj.description && (
                        <div style={{ ...s.text, marginTop: "1px" }}>
                            {proj.description}
                        </div>
                    )}
                    {proj.technologies && proj.technologies.length > 0 && (
                        <div style={s.dim}>{proj.technologies.join(", ")}</div>
                    )}
                    {proj.bullets && proj.bullets.length > 0 && (
                        <div style={{ marginTop: "3px" }}>
                            {proj.bullets.map((bullet, bi) => (
                                <div key={bi} style={s.bullet}>
                                    <span
                                        style={{
                                            position: "absolute",
                                            left: 0,
                                            top: 0,
                                        }}
                                    >
                                        •
                                    </span>
                                    {bullet}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

function renderEducation(resume: ResumeSchema, s: Record<string, React.CSSProperties>) {
    if (
        resume.education.length === 0 &&
        (!resume.certifications || resume.certifications.length === 0)
    )
        return null;

    return (
        <div key="education">
            <div style={s.header}>EDUCATION & CERTIFICATIONS</div>
            {resume.education.map((edu, i) => (
                <div
                    key={edu.id ?? i}
                    style={{
                        marginBottom:
                            i < resume.education.length - 1 ? "5px" : 0,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "baseline",
                        }}
                    >
                        <div style={{ fontWeight: 700, fontSize: "11px" }}>
                            {[edu.degree, edu.field].filter(Boolean).join(" in ")}
                        </div>
                        <div style={{ ...s.muted, color: "#333" }}>
                            {edu.endDate || ""}
                        </div>
                    </div>
                    <div style={{ ...s.muted, color: "#333" }}>
                        {edu.institution}
                        {edu.gpa ? ` — GPA: ${edu.gpa}` : ""}
                        {edu.honors?.length ? ` · ${edu.honors.join(", ")}` : ""}
                    </div>
                </div>
            ))}
            {resume.certifications?.map((cert, i) => (
                <div key={`cert-${i}`} style={{ marginTop: "3px" }}>
                    <div style={s.text}>
                        {[cert.name, cert.issuer, cert.date]
                            .filter(Boolean)
                            .join(" — ")}
                    </div>
                </div>
            ))}
        </div>
    );
}
