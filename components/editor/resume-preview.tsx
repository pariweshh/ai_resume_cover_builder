"use client";

import { useEffect, useState } from "react";
import type { ResumeSchema, ReorderableSection } from "@/types";
import { DEFAULT_SECTION_ORDER } from "@/types";
import { formatDate } from "@/lib/utils";
import { parseSkills } from "@/lib/skills-utils";

type Props = {
    resume: ResumeSchema;
    font: string;
};

const FONT_MAP: Record<string, string> = {
    Calibri: "'Source Sans 3', Calibri, 'Segoe UI', sans-serif",
    Georgia: "'Merriweather', Georgia, 'Times New Roman', serif",
    Helvetica: "Helvetica, Arial, sans-serif",
    Garamond: "'EB Garamond', Garamond, 'Times New Roman', serif",
    Cambria: "'Crimson Pro', Cambria, Georgia, serif",
};

const FONT_LINKS: Record<string, string> = {
    Calibri:
        "https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600&display=swap",
    Georgia:
        "https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap",
    Garamond:
        "https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;600&display=swap",
    Cambria:
        "https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600&display=swap",
};

export function ResumePreview({ resume, font }: Props) {
    const [fontsLoaded, setFontsLoaded] = useState(false);

    useEffect(() => {
        const link = FONT_LINKS[font];
        if (!link) {
            setFontsLoaded(true);
            return;
        }

        const id = `preview-font-${font.replace(/\s+/g, "-")}`;
        if (document.getElementById(id)) {
            setFontsLoaded(true);
            return;
        }

        const el = document.createElement("link");
        el.id = id;
        el.rel = "stylesheet";
        el.href = link;
        el.onload = () => setFontsLoaded(true);
        document.head.appendChild(el);
    }, [font]);

    if (!fontsLoaded) return null;

    const fontFamily = FONT_MAP[font] || FONT_MAP.Calibri;
    const order = resume.sectionOrder ?? DEFAULT_SECTION_ORDER;

    return (
        <div className="flex justify-center overflow-y-auto p-4">
            <div
                className="shadow-lg"
                style={{
                    width: "794px",
                    minHeight: "1123px",
                    padding: "57px 57px 50px",
                    fontFamily,
                    fontSize: "12px",
                    lineHeight: "1.35",
                    color: "#000",
                    background: "#fff",
                    boxSizing: "border-box",
                    flexShrink: 0,
                }}
            >
                {/* ── Name ─────────────────────────────────────── */}
                <div
                    style={{
                        fontSize: "27px",
                        fontWeight: 700,
                        letterSpacing: "1px",
                        textTransform: "uppercase",
                        marginBottom: "6px",
                    }}
                >
                    {resume.basics.name || "Your Name"}
                </div>

                {/* ── Tagline ──────────────────────────────────── */}
                {renderTagline(resume, fontFamily)}

                {/* ── Contact ──────────────────────────────────── */}
                {renderContact(resume)}

                {/* ── Divider ──────────────────────────────────── */}
                <div
                    style={{
                        borderBottom: "1.5px solid #a0a0a0",
                        margin: "6px 0 14px",
                    }}
                />

                {/* ── Sections in order ────────────────────────── */}
                {order.map((section) => (
                    <div key={section}>
                        {renderSection(section, resume, fontFamily)}
                    </div>
                ))}            </div>
        </div>
    );
}

// ── Tagline ─────────────────────────────────────────────────

function renderTagline(resume: ResumeSchema, fontFamily: string) {
    const titles = [...new Set(resume.experience.map((e) => e.title))].slice(
        0,
        3
    );
    const topSkills = resume.skills.filter((s) => !s.includes(":")).slice(0, 4);
    const tagline = [...titles, ...topSkills].join(" · ");
    if (!tagline) return null;

    return (
        <div
            style={{
                fontSize: "11px",
                color: "#505050",
                marginBottom: "4px",
                fontFamily,
            }}
        >
            {tagline}
        </div>
    );
}

// ── Contact ─────────────────────────────────────────────────

function renderContact(resume: ResumeSchema) {
    const parts = [
        resume.basics.phone,
        resume.basics.email,
        resume.basics.location,
        resume.basics.github,
        resume.basics.linkedin,
        resume.basics.website,
    ].filter(Boolean);

    if (parts.length === 0) return null;

    return (
        <div style={{ fontSize: "11px", color: "#333", marginBottom: "2px" }}>
            {parts.join(" | ")}
        </div>
    );
}

// ── Section Router ──────────────────────────────────────────

function renderSection(
    section: ReorderableSection,
    resume: ResumeSchema,
    fontFamily: string
) {
    switch (section) {
        case "summary":
            return renderSummary(resume, fontFamily);
        case "skills":
            return renderSkills(resume, fontFamily);
        case "experience":
            return renderExperience(resume, fontFamily);
        case "projects":
            return renderProjects(resume, fontFamily);
        case "education":
            return renderEducation(resume, fontFamily);
        default:
            return null;
    }
}

// ── Section Header ──────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
    return (
        <div style={{ marginBottom: "8px" }}>
            <div
                style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    marginBottom: "3px",
                }}
            >
                {title}
            </div>
            <div style={{ borderBottom: "1px solid #a0a0a0" }} />
        </div>
    );
}

// ── Summary ─────────────────────────────────────────────────

function renderSummary(resume: ResumeSchema, fontFamily: string) {
    if (!resume.basics.summary) return null;
    return (
        <div style={{ marginBottom: "12px" }}>
            <SectionHeader title="PROFESSIONAL SUMMARY" />
            <div style={{ fontSize: "12px", lineHeight: "1.4" }}>
                {resume.basics.summary}
            </div>
        </div>
    );
}

// ── Skills ──────────────────────────────────────────────────

function renderSkills(resume: ResumeSchema, fontFamily: string) {
    if (resume.skills.length === 0) return null;
    const data = parseSkills(resume.skills);

    return (
        <div style={{ marginBottom: "12px" }}>
            <SectionHeader title="TECHNICAL SKILLS" />
            {data.isCategorized && data.categories.length > 0 ? (
                <div>
                    {data.categories.map((cat) => (
                        <div
                            key={cat.label}
                            style={{ marginBottom: "3px", fontSize: "12px" }}
                        >
                            <span style={{ fontWeight: 700 }}>{cat.label}: </span>
                            <span>{cat.items.join(", ")}</span>
                        </div>
                    ))}
                    {data.flat.length > 0 && (
                        <div style={{ fontSize: "12px" }}>
                            {data.flat.join(", ")}
                        </div>
                    )}
                </div>
            ) : (
                <div style={{ fontSize: "12px" }}>{data.flat.join(", ")}</div>
            )}
        </div>
    );
}

// ── Experience ──────────────────────────────────────────────

function renderExperience(resume: ResumeSchema, fontFamily: string) {
    if (resume.experience.length === 0) return null;

    return (
        <div style={{ marginBottom: "12px" }}>
            <SectionHeader title="PROFESSIONAL EXPERIENCE" />
            {resume.experience.map((exp, i) => (
                <div
                    key={exp.id ?? i}
                    style={{
                        marginBottom:
                            i < resume.experience.length - 1 ? "8px" : "0",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "baseline",
                        }}
                    >
                        <div style={{ fontWeight: 700, fontSize: "12.5px" }}>
                            {exp.title}
                        </div>
                        <div style={{ fontSize: "11px", color: "#333", flexShrink: 0 }}>
                            {formatDate(exp.startDate)} -{" "}
                            {exp.current ? "Present" : formatDate(exp.endDate || "")}
                        </div>
                    </div>
                    <div style={{ fontSize: "12px", color: "#333" }}>
                        {[exp.company, exp.location].filter(Boolean).join(" | ")}
                    </div>
                    {exp.technologies && exp.technologies.length > 0 && (
                        <div
                            style={{
                                fontSize: "10.5px",
                                color: "#666",
                                marginTop: "2px",
                            }}
                        >
                            {exp.technologies.join(", ")}
                        </div>
                    )}
                    <div style={{ marginTop: "4px" }}>
                        {exp.bullets.map((bullet, bi) => (
                            <div
                                key={bi}
                                style={{
                                    fontSize: "12px",
                                    lineHeight: "1.35",
                                    paddingLeft: "12px",
                                    marginBottom: "2px",
                                    position: "relative",
                                }}
                            >
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

// ── Projects ────────────────────────────────────────────────

function renderProjects(resume: ResumeSchema, fontFamily: string) {
    if (resume.projects.length === 0) return null;

    return (
        <div style={{ marginBottom: "12px" }}>
            <SectionHeader title="INDEPENDENT DEVELOPMENT & PROJECTS" />
            {resume.projects.map((proj, i) => (
                <div
                    key={proj.id ?? i}
                    style={{
                        marginBottom:
                            i < resume.projects.length - 1 ? "8px" : "0",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "baseline",
                        }}
                    >
                        <div style={{ fontWeight: 700, fontSize: "12.5px" }}>
                            {proj.name}
                        </div>
                        {proj.url && (
                            <div
                                style={{
                                    fontSize: "10.5px",
                                    color: "#3c64c8",
                                    flexShrink: 0,
                                }}
                            >
                                {proj.url}
                            </div>
                        )}
                    </div>
                    {proj.description && (
                        <div style={{ fontSize: "12px", marginTop: "2px" }}>
                            {proj.description}
                        </div>
                    )}
                    {proj.technologies && proj.technologies.length > 0 && (
                        <div
                            style={{
                                fontSize: "10.5px",
                                color: "#666",
                                marginTop: "2px",
                            }}
                        >
                            {proj.technologies.join(", ")}
                        </div>
                    )}
                    {proj.bullets && proj.bullets.length > 0 && (
                        <div style={{ marginTop: "4px" }}>
                            {proj.bullets.map((bullet, bi) => (
                                <div
                                    key={bi}
                                    style={{
                                        fontSize: "12px",
                                        lineHeight: "1.35",
                                        paddingLeft: "12px",
                                        marginBottom: "2px",
                                        position: "relative",
                                    }}
                                >
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

// ── Education ───────────────────────────────────────────────

function renderEducation(resume: ResumeSchema, fontFamily: string) {
    if (
        resume.education.length === 0 &&
        (!resume.certifications || resume.certifications.length === 0)
    )
        return null;

    return (
        <div>
            <SectionHeader title="EDUCATION & CERTIFICATIONS" />
            {resume.education.map((edu, i) => (
                <div
                    key={edu.id ?? i}
                    style={{
                        marginBottom:
                            i < resume.education.length - 1 ? "6px" : "0",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "baseline",
                        }}
                    >
                        <div style={{ fontWeight: 700, fontSize: "12px" }}>
                            {[edu.degree, edu.field].filter(Boolean).join(" in ")}
                        </div>
                        <div style={{ fontSize: "11px", color: "#333" }}>
                            {edu.endDate || ""}
                        </div>
                    </div>
                    <div style={{ fontSize: "12px", color: "#333" }}>
                        {edu.institution}
                        {edu.gpa ? ` — GPA: ${edu.gpa}` : ""}
                        {edu.honors?.length ? ` · ${edu.honors.join(", ")}` : ""}
                    </div>
                </div>
            ))}
            {resume.certifications?.map((cert, i) => (
                <div key={i} style={{ marginTop: resume.education.length ? "4px" : "0" }}>
                    <div style={{ fontSize: "12px" }}>
                        {[cert.name, cert.issuer, cert.date]
                            .filter(Boolean)
                            .join(" — ")}
                    </div>
                </div>
            ))}
        </div>
    );
}
