"use server";

import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    AlignmentType,
    BorderStyle,
    TabStopType,
    TabStopPosition,
} from "docx";
import type { ResumeSchema } from "@/types";
import { formatDate } from "@/lib/utils";

export async function generateDOCX(resume: ResumeSchema): Promise<Blob> {
    const sections: Paragraph[] = [];

    // ── Name ──────────────────────────────────────────────────────
    sections.push(
        new Paragraph({
            children: [
                new TextRun({
                    text: resume.basics.name.toUpperCase(),
                    bold: true,
                    size: 40,
                    font: "Calibri",
                }),
            ],
            spacing: { after: 60 },
        })
    );

    // ── Subtitle / Tagline ────────────────────────────────────────
    const titles = [...new Set(resume.experience.map((e) => e.title))].slice(
        0,
        3
    );
    const topSkills = resume.skills
        .filter((s) => !s.includes(":"))
        .slice(0, 4);
    const tagline = [...titles, ...topSkills].join(" · ");
    if (tagline) {
        sections.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: tagline,
                        size: 17,
                        font: "Calibri",
                        color: "666666",
                    }),
                ],
                spacing: { after: 80 },
            })
        );
    }

    // ── Contact ───────────────────────────────────────────────────
    const contactParts = [
        resume.basics.phone,
        resume.basics.email,
        resume.basics.location,
        resume.basics.github,
        resume.basics.linkedin,
        resume.basics.website,
    ].filter(Boolean);

    sections.push(
        new Paragraph({
            children: [
                new TextRun({
                    text: contactParts.join(" | "),
                    size: 17,
                    font: "Calibri",
                }),
            ],
            spacing: { after: 120 },
        })
    );

    // ── Divider ───────────────────────────────────────────────────
    sections.push(
        new Paragraph({
            border: {
                bottom: {
                    color: "AAAAAA",
                    space: 1,
                    style: BorderStyle.SINGLE,
                    size: 8,
                },
            },
            spacing: { after: 160 },
        })
    );

    // ── Helper: Section Header ────────────────────────────────────
    const addHeader = (title: string) => {
        sections.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: title,
                        bold: true,
                        size: 20,
                        font: "Calibri",
                    }),
                ],
                spacing: { before: 160, after: 40 },
                border: {
                    bottom: {
                        color: "AAAAAA",
                        space: 1,
                        style: BorderStyle.SINGLE,
                        size: 4,
                    },
                },
            })
        );
    };

    // ── 1. Professional Summary ───────────────────────────────────
    if (resume.basics.summary) {
        addHeader("PROFESSIONAL SUMMARY");
        sections.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: resume.basics.summary,
                        size: 18,
                        font: "Calibri",
                    }),
                ],
                spacing: { after: 100 },
            })
        );
    }

    // ── 2. Technical Skills ───────────────────────────────────────
    if (resume.skills.length > 0) {
        addHeader("TECHNICAL SKILLS");

        const hasCategories = resume.skills.some((s) => s.includes(":"));

        if (hasCategories) {
            for (const skill of resume.skills) {
                if (skill.includes(":")) {
                    const [category, items] = skill.split(/:(.+)/);
                    sections.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: `${category.trim()}: `,
                                    bold: true,
                                    size: 18,
                                    font: "Calibri",
                                }),
                                new TextRun({
                                    text: items.trim(),
                                    size: 18,
                                    font: "Calibri",
                                }),
                            ],
                            spacing: { after: 60 },
                        })
                    );
                } else {
                    sections.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: skill,
                                    size: 18,
                                    font: "Calibri",
                                }),
                            ],
                            spacing: { after: 60 },
                        })
                    );
                }
            }
        } else {
            sections.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: resume.skills.join(", "),
                            size: 18,
                            font: "Calibri",
                        }),
                    ],
                    spacing: { after: 100 },
                })
            );
        }
    }

    // ── 3. Professional Experience ────────────────────────────────
    if (resume.experience.length > 0) {
        addHeader("PROFESSIONAL EXPERIENCE");

        for (let i = 0; i < resume.experience.length; i++) {
            const exp = resume.experience[i];

            // Title + Dates
            sections.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: exp.title,
                            bold: true,
                            size: 19,
                            font: "Calibri",
                        }),
                        new TextRun({
                            text: `\t${formatDate(exp.startDate)} - ${exp.current ? "Present" : formatDate(exp.endDate || "")}`,
                            size: 17,
                            font: "Calibri",
                            color: "666666",
                        }),
                    ],
                    tabStops: [
                        { type: TabStopType.RIGHT, position: TabStopPosition.MAX },
                    ],
                    spacing: { before: i > 0 ? 100 : 40, after: 40 },
                })
            );

            // Company | Location
            const companyLine = [exp.company, exp.location]
                .filter(Boolean)
                .join(" | ");
            sections.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: companyLine,
                            italics: true,
                            size: 18,
                            font: "Calibri",
                            color: "444444",
                        }),
                    ],
                    spacing: { after: 40 },
                })
            );

            // Technologies
            if (exp.technologies?.length) {
                sections.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: exp.technologies.join(", "),
                                size: 16,
                                font: "Calibri",
                                color: "888888",
                            }),
                        ],
                        spacing: { after: 40 },
                    })
                );
            }

            // Bullets
            for (const bullet of exp.bullets) {
                sections.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `• ${bullet}`,
                                size: 18,
                                font: "Calibri",
                            }),
                        ],
                        indent: { left: 360 },
                        spacing: { after: 40 },
                    })
                );
            }
        }
    }

    // ── 4. Independent Development & Projects ─────────────────────
    if (resume.projects.length > 0) {
        addHeader("INDEPENDENT DEVELOPMENT & PROJECTS");

        for (let i = 0; i < resume.projects.length; i++) {
            const proj = resume.projects[i];

            // Project name + URL
            const projectChildren: TextRun[] = [
                new TextRun({
                    text: proj.name,
                    bold: true,
                    size: 19,
                    font: "Calibri",
                }),
            ];

            if (proj.url) {
                projectChildren.push(
                    new TextRun({
                        text: `\t${proj.url}`,
                        size: 16,
                        font: "Calibri",
                        color: "3366CC",
                    })
                );
            }

            sections.push(
                new Paragraph({
                    children: projectChildren,
                    tabStops: proj.url
                        ? [
                            {
                                type: TabStopType.RIGHT,
                                position: TabStopPosition.MAX,
                            },
                        ]
                        : [],
                    spacing: { before: i > 0 ? 100 : 40, after: 40 },
                })
            );

            // Description
            if (proj.description) {
                sections.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: proj.description,
                                size: 18,
                                font: "Calibri",
                            }),
                        ],
                        spacing: { after: 40 },
                    })
                );
            }

            // Technologies (italic)
            if (proj.technologies?.length) {
                sections.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: proj.technologies.join(", "),
                                italics: true,
                                size: 17,
                                font: "Calibri",
                                color: "666666",
                            }),
                        ],
                        spacing: { after: 40 },
                    })
                );
            }

            // Bullets
            if (proj.bullets?.length) {
                for (const bullet of proj.bullets) {
                    sections.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: `• ${bullet}`,
                                    size: 18,
                                    font: "Calibri",
                                }),
                            ],
                            indent: { left: 360 },
                            spacing: { after: 40 },
                        })
                    );
                }
            }
        }
    }

    // ── 5. Education & Certifications ─────────────────────────────
    if (resume.education.length > 0 || resume.certifications?.length) {
        addHeader("EDUCATION & CERTIFICATIONS");

        // Education
        for (const edu of resume.education) {
            const degreeLine = [edu.degree, edu.field]
                .filter(Boolean)
                .join(" in ");

            sections.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: degreeLine,
                            bold: true,
                            size: 18,
                            font: "Calibri",
                        }),
                        new TextRun({
                            text: `\t${edu.endDate || ""}`,
                            size: 17,
                            font: "Calibri",
                            color: "666666",
                        }),
                    ],
                    tabStops: [
                        { type: TabStopType.RIGHT, position: TabStopPosition.MAX },
                    ],
                    spacing: { before: 60, after: 40 },
                })
            );

            let instText = edu.institution;
            if (edu.gpa) instText += ` — GPA: ${edu.gpa}`;
            if (edu.honors?.length) instText += ` · ${edu.honors.join(", ")}`;

            sections.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: instText,
                            italics: true,
                            size: 18,
                            font: "Calibri",
                            color: "444444",
                        }),
                    ],
                    spacing: { after: 60 },
                })
            );
        }

        // Certifications
        if (resume.certifications?.length) {
            for (const cert of resume.certifications) {
                const line = [cert.name, cert.issuer, cert.date]
                    .filter(Boolean)
                    .join(" — ");
                sections.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: line,
                                size: 18,
                                font: "Calibri",
                            }),
                        ],
                        spacing: { after: 40 },
                    })
                );
            }
        }
    }

    // ── Build Document ────────────────────────────────────────────
    const doc = new Document({
        sections: [{ children: sections }],
        styles: {
            default: {
                document: {
                    run: { font: "Calibri", size: 18 },
                },
            },
        },
    });

    const buffer = await Packer.toBlob(doc);
    return buffer;
}
