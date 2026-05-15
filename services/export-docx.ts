"use server";

import type { ResumeSchema, ReorderableSection } from "@/types";
import { DEFAULT_SECTION_ORDER } from "@/types";
import { formatDate } from "@/lib/utils";
import { parseSkills } from "@/lib/skills-utils";

export async function generateDOCX(
    resume: ResumeSchema,
    font: string = "Calibri"
): Promise<Blob> {
    const {
        Document,
        Packer,
        Paragraph,
        TextRun,
        AlignmentType,
        Tab,
        TabStopType,
        TabStopPosition,
        BorderStyle,
    } = await import("docx");

    const sections: InstanceType<typeof Paragraph>[] = [];
    // ── Helpers ────────────────────────────────────────────────

    const addHeader = (title: string) => {
        sections.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: title,
                        bold: true,
                        size: 22,
                        font: font,
                    }),
                ],
                spacing: { before: 200, after: 40 },
                border: {
                    bottom: {
                        color: "A0A0A0",
                        space: 4,
                        style: BorderStyle.SINGLE,
                        size: 6,
                    },
                },
            })
        );
    };

    // ── Name ──────────────────────────────────────────────────
    sections.push(
        new Paragraph({
            children: [
                new TextRun({
                    text: resume.basics.name.toUpperCase(),
                    bold: true,
                    size: 40,
                    font: font,
                }),
            ],
            spacing: { after: 60 },
        })
    );

    // ── Tagline ───────────────────────────────────────────────
    const titles = [...new Set(resume.experience.map((e) => e.title))].slice(
        0,
        3
    );
    const topSkills = resume.skills.filter((s) => !s.includes(":")).slice(0, 4);
    const tagline = [...titles, ...topSkills].join(" · ");
    if (tagline) {
        sections.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: tagline,
                        size: 17,
                        font: font,
                        color: "505050",
                    }),
                ],
                spacing: { after: 40 },
            })
        );
    }

    // ── Contact ───────────────────────────────────────────────
    const contactParts = [
        resume.basics.phone,
        resume.basics.email,
        resume.basics.location,
        resume.basics.github,
        resume.basics.linkedin,
        resume.basics.website,
    ].filter(Boolean);

    if (contactParts.length > 0) {
        sections.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: contactParts.join(" | "),
                        size: 17,
                        font: font,
                        color: "333333",
                    }),
                ],
                spacing: { after: 80 },
            })
        );
    }

    // ── Divider ───────────────────────────────────────────────
    sections.push(
        new Paragraph({
            border: {
                bottom: {
                    color: "A0A0A0",
                    space: 4,
                    style: BorderStyle.SINGLE,
                    size: 8,
                },
            },
            spacing: { after: 120 },
        })
    );

    // ── Sections in order ─────────────────────────────────────
    const sectionOrder: ReorderableSection[] =
        resume.sectionOrder ?? DEFAULT_SECTION_ORDER;

    for (const section of sectionOrder) {
        switch (section) {
            // ────────────────────────────────────────────────────────
            case "summary": {
                if (!resume.basics.summary) break;
                addHeader("PROFESSIONAL SUMMARY");
                sections.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: resume.basics.summary,
                                size: 18,
                                font: font,
                            }),
                        ],
                        spacing: { after: 100 },
                    })
                );
                break;
            }

            // ────────────────────────────────────────────────────────
            case "skills": {
                if (resume.skills.length === 0) break;
                addHeader("TECHNICAL SKILLS");

                const skillData = parseSkills(resume.skills);

                if (skillData.isCategorized && skillData.categories.length > 0) {
                    for (const cat of skillData.categories) {
                        sections.push(
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: `${cat.label}: `,
                                        bold: true,
                                        size: 18,
                                        font: font,
                                    }),
                                    new TextRun({
                                        text: cat.items.join(", "),
                                        size: 18,
                                        font: font,
                                    }),
                                ],
                                spacing: { after: 60 },
                            })
                        );
                    }

                    if (skillData.flat.length > 0) {
                        sections.push(
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: skillData.flat.join(", "),
                                        size: 18,
                                        font: font,
                                    }),
                                ],
                                spacing: { after: 60 },
                            })
                        );
                    }
                } else {
                    sections.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: skillData.flat.join(", "),
                                    size: 18,
                                    font: font,
                                }),
                            ],
                            spacing: { after: 100 },
                        })
                    );
                }
                break;
            }

            // ────────────────────────────────────────────────────────
            case "experience": {
                if (resume.experience.length === 0) break;
                addHeader("PROFESSIONAL EXPERIENCE");

                for (let i = 0; i < resume.experience.length; i++) {
                    const exp = resume.experience[i];

                    // Title + Date
                    sections.push(
                        new Paragraph({
                            tabStops: [
                                {
                                    type: TabStopType.RIGHT,
                                    position: TabStopPosition.MAX,
                                },
                            ],
                            children: [
                                new TextRun({
                                    text: exp.title,
                                    bold: true,
                                    size: 19,
                                    font: font,
                                }),
                                new Tab(),
                                new TextRun({
                                    text: `${formatDate(exp.startDate)} - ${exp.current ? "Present" : formatDate(exp.endDate || "")}`,
                                    size: 17,
                                    font: font,
                                    color: "333333",
                                }),
                            ],
                            spacing: { after: 20 },
                        })
                    );

                    // Company | Location
                    const companyParts = [exp.company, exp.location].filter(Boolean);
                    sections.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: companyParts.join(" | "),
                                    size: 18,
                                    font: font,
                                    color: "333333",
                                }),
                            ],
                            spacing: { after: 20 },
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
                                        font: font,
                                        color: "666666",
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
                                        font: font,
                                    }),
                                ],
                                indent: { left: 240 },
                                spacing: { after: 40 },
                            })
                        );
                    }

                    // Spacing between entries
                    if (i < resume.experience.length - 1) {
                        sections.push(
                            new Paragraph({ spacing: { after: 80 } })
                        );
                    }
                }
                break;
            }

            // ────────────────────────────────────────────────────────
            case "projects": {
                if (resume.projects.length === 0) break;
                addHeader("INDEPENDENT DEVELOPMENT & PROJECTS");

                for (let i = 0; i < resume.projects.length; i++) {
                    const proj = resume.projects[i];

                    // Name + URL
                    const nameChildren: InstanceType<typeof TextRun>[] = [
                        new TextRun({
                            text: proj.name,
                            bold: true,
                            size: 19,
                            font: font,
                        }),
                    ];

                    if (proj.url) {
                        nameChildren.push(
                            new TextRun({
                                text: proj.url,
                                size: 16,
                                font: font,
                                color: "3C64C8",
                            })
                        );
                    }

                    sections.push(
                        new Paragraph({
                            tabStops: [
                                {
                                    type: TabStopType.RIGHT,
                                    position: TabStopPosition.MAX,
                                },
                            ],
                            children: nameChildren,
                            spacing: { after: 20 },
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
                                        font: font,
                                    }),
                                ],
                                spacing: { after: 20 },
                            })
                        );
                    }

                    // Technologies
                    if (proj.technologies?.length) {
                        sections.push(
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: proj.technologies.join(", "),
                                        size: 16,
                                        font: font,
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
                                            font: font,
                                        }),
                                    ],
                                    indent: { left: 240 },
                                    spacing: { after: 40 },
                                })
                            );
                        }
                    }

                    if (i < resume.projects.length - 1) {
                        sections.push(
                            new Paragraph({ spacing: { after: 80 } })
                        );
                    }
                }
                break;
            }

            // ────────────────────────────────────────────────────────
            case "education": {
                if (
                    resume.education.length === 0 &&
                    (!resume.certifications || resume.certifications.length === 0)
                )
                    break;

                addHeader("EDUCATION & CERTIFICATIONS");

                for (let i = 0; i < resume.education.length; i++) {
                    const edu = resume.education[i];

                    const degreeLine = [edu.degree, edu.field]
                        .filter(Boolean)
                        .join(" in ");

                    // Degree + Date
                    sections.push(
                        new Paragraph({
                            tabStops: [
                                {
                                    type: TabStopType.RIGHT,
                                    position: TabStopPosition.MAX,
                                },
                            ],
                            children: [
                                new TextRun({
                                    text: degreeLine,
                                    bold: true,
                                    size: 18,
                                    font: font,
                                }),
                                new Tab(),
                                new TextRun({
                                    text: edu.endDate || "",
                                    size: 17,
                                    font: font,
                                    color: "333333",
                                }),
                            ],
                            spacing: { after: 20 },
                        })
                    );

                    // Institution + GPA + Honors
                    let instLine = edu.institution;
                    if (edu.gpa) instLine += ` — GPA: ${edu.gpa}`;
                    if (edu.honors?.length)
                        instLine += ` · ${edu.honors.join(", ")}`;

                    sections.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: instLine,
                                    size: 18,
                                    font: font,
                                    color: "333333",
                                }),
                            ],
                            spacing: { after: 60 },
                        })
                    );
                }

                // Certifications
                if (resume.certifications?.length) {
                    for (const cert of resume.certifications) {
                        const certParts = [cert.name, cert.issuer, cert.date]
                            .filter(Boolean)
                            .join(" — ");
                        sections.push(
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: certParts,
                                        size: 18,
                                        font: font,
                                    }),
                                ],
                                spacing: { after: 40 },
                            })
                        );
                    }
                }
                break;
            }
        }
    }

    // ── Build document ────────────────────────────────────────
    const doc = new Document({
        sections: [
            {
                properties: {
                    page: {
                        margin: {
                            top: 720,
                            right: 720,
                            bottom: 720,
                            left: 720,
                        },
                    },
                },
                children: sections,
            },
        ],
    });

    const buffer = await Packer.toBuffer(doc);
    const bytes = new Uint8Array(buffer);
    return new Blob([bytes], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

}
