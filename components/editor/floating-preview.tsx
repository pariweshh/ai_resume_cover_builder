"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GripHorizontal, X, Maximize2, Minimize2 } from "lucide-react";
import type { ResumeSchema } from "@/types";
import { DEFAULT_SECTION_ORDER } from "@/types";
import { formatDate } from "@/lib/utils";
import { parseSkills } from "@/lib/skills-utils";

type Props = {
    resume: ResumeSchema;
    font: string;
    onClose: () => void;
};

export function FloatingPreview({ resume, font, onClose }: Props) {
    const [expanded, setExpanded] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [mobileWidth, setMobileWidth] = useState(320);
    const constraintsRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // Detect mobile viewport
    useEffect(() => {
        const mq = window.matchMedia("(max-width: 639px)");
        setIsMobile(mq.matches);
        const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    // Track mobile container width so the 794px preview can scale to fit
    useEffect(() => {
        if (!contentRef.current) return;
        const el = contentRef.current;
        setMobileWidth(el.clientWidth);
        const observer = new ResizeObserver(([entry]) => {
            if (entry) setMobileWidth(entry.contentRect.width);
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, [isMobile]);

    const desktopWidth = expanded ? 520 : 280;
    const desktopHeight = expanded ? 720 : 400;
    const desktopScale = desktopWidth / 794;
    const mobileScale = mobileWidth / 794;

    // ── Mobile: full-screen overlay ─────────────────────────────
    // A draggable 280px panel on a 320px screen covers 88% of the
    // viewport and is fiddly to interact with. Full-screen overlay
    // gives a clean, usable preview with proper touch scrolling.
    if (isMobile) {
        return (
            <div className="absolute inset-0 z-30 flex flex-col bg-white">
                <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2">
                    <span className="text-sm font-medium text-gray-600">
                        Preview
                    </span>
                    <button
                        onClick={onClose}
                        className="grid min-h-[44px] min-w-[44px] place-items-center rounded-lg text-gray-400 hover:text-gray-600"
                        title="Close preview"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div
                    ref={contentRef}
                    className="min-h-0 flex-1 overflow-auto overscroll-contain"
                >
                    <div
                        style={{
                            zoom: mobileScale,
                            width: 794,
                            background: "#fff",
                        }}
                    >
                        <PreviewContent resume={resume} font={font} />
                    </div>
                </div>
            </div>
        );
    }

    // ── Desktop: draggable floating panel ──────────────────────
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
                style={{ width: desktopWidth, height: desktopHeight }}
                className="pointer-events-auto absolute flex flex-col overflow-hidden rounded-xl border border-border bg-white shadow-2xl"
            >
                {/* Drag handle header */}
                <div className="flex shrink-0 cursor-grab items-center justify-between border-b border-gray-200 bg-gray-50 px-3 py-1.5 active:cursor-grabbing">
                    <div className="flex items-center gap-1.5">
                        <GripHorizontal className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-[11px] font-medium text-gray-600">
                            Preview
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            title={expanded ? "Collapse preview" : "Expand preview"}
                            onClick={(e) => {
                                e.stopPropagation();
                                setExpanded((v) => !v);
                            }}
                            className="grid min-h-[32px] min-w-[32px] place-items-center rounded text-gray-400 hover:text-gray-600"
                        >
                            {expanded ? (
                                <Minimize2 className="h-3.5 w-3.5" />
                            ) : (
                                <Maximize2 className="h-3.5 w-3.5" />
                            )}
                        </button>
                        <button
                            title="Close preview"
                            onClick={(e) => {
                                e.stopPropagation();
                                onClose();
                            }}
                            className="grid min-h-[32px] min-w-[32px] place-items-center rounded text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>

                {/* Content: uses CSS zoom instead of transform:scale.
                    zoom changes the element's layout dimensions so the
                    parent scroll container sizes correctly — no phantom
                    empty space at the bottom. */}
                <div className="min-h-0 flex-1 overflow-auto overflow-x-hidden overscroll-contain">
                    <div
                        style={{
                            zoom: desktopScale,
                            width: 794,
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
