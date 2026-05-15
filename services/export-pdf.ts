"use server";

import type { ResumeSchema, ReorderableSection } from "@/types";
import { DEFAULT_SECTION_ORDER } from "@/types";
import { formatDate } from "@/lib/utils";
import { parseSkills } from "@/lib/skills-utils";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

// ── Font Definitions ───────────────────────────────────────────

type FontDef = {
    regular: string;
    bold: string;
    jsName: string;
};

const FONT_DEFS: Record<string, FontDef> = {
    Calibri: {
        regular: "SourceSans3-Regular.ttf",
        bold: "SourceSans3-Bold.ttf",
        jsName: "SourceSans3",
    },
    Georgia: {
        regular: "Merriweather-Regular.ttf",
        bold: "Merriweather-Bold.ttf",
        jsName: "Merriweather",
    },
    Helvetica: {
        regular: "",
        bold: "",
        jsName: "helvetica",
    },
    Garamond: {
        regular: "EBGaramond-Regular.ttf",
        bold: "EBGaramond-Bold.ttf",
        jsName: "EBGaramond",
    },
    Cambria: {
        regular: "CrimsonPro-Regular.ttf",
        bold: "CrimsonPro-Bold.ttf",
        jsName: "CrimsonPro",
    },
};

function registerFont(
    doc: InstanceType<typeof import("jspdf").jsPDF>,
    fontName: string
): string {
    const def = FONT_DEFS[fontName] || FONT_DEFS["Calibri"];

    if (def.jsName === "helvetica") return "helvetica";

    const fontsDir = join(process.cwd(), "fonts");

    try {
        const regularPath = join(fontsDir, def.regular);
        const boldPath = join(fontsDir, def.bold);

        if (existsSync(regularPath) && existsSync(boldPath)) {
            const regularData = readFileSync(regularPath, "base64");
            const boldData = readFileSync(boldPath, "base64");

            doc.addFileToVFS(def.regular, regularData);
            doc.addFont(def.regular, def.jsName, "normal");

            doc.addFileToVFS(def.bold, boldData);
            doc.addFont(def.bold, def.jsName, "bold");

            return def.jsName;
        }

        // Fallback if font files not found
        if (
            fontName === "Georgia" ||
            fontName === "Garamond" ||
            fontName === "Cambria"
        ) {
            return "times";
        }
        return "helvetica";
    } catch {
        if (
            fontName === "Georgia" ||
            fontName === "Garamond" ||
            fontName === "Cambria"
        ) {
            return "times";
        }
        return "helvetica";
    }
}

// ── Main ───────────────────────────────────────────────────────

export async function generatePDF(
    resume: ResumeSchema,
    font: string = "Calibri",
    watermark: boolean = false
): Promise<Blob> {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    const docFont = registerFont(doc, font);

    // ── Constants ──────────────────────────────────────────────
    const pageWidth = 210;
    const pageHeight = 297;
    const marginLeft = 15;
    const marginRight = 15;
    const contentWidth = pageWidth - marginLeft - marginRight;
    const bulletLineHeight = 3.8;
    let y = 15;

    // ── Helpers ────────────────────────────────────────────────
    const checkPage = (needed: number) => {
        if (y + needed > pageHeight - 15) {
            doc.addPage();
            y = 15;
        }
    };

    const drawSectionHeader = (title: string) => {
        checkPage(12);
        doc.setFont(docFont, "bold");
        doc.setFontSize(10);
        doc.text(title, marginLeft, y);
        y += 1.5;
        doc.setDrawColor(160);
        doc.setLineWidth(0.3);
        doc.line(marginLeft, y, pageWidth - marginRight, y);
        y += 5;
    };

    const drawBullet = (text: string) => {
        doc.setFont(docFont, "normal");
        doc.setFontSize(9);
        const lines = doc.splitTextToSize(text, contentWidth - 5);
        checkPage(lines.length * bulletLineHeight + 1);
        doc.text(lines, marginLeft + 3, y);
        y += lines.length * bulletLineHeight + 1.2;
    };

    // ── Name ──────────────────────────────────────────────────
    doc.setFont(docFont, "bold");
    doc.setFontSize(20);
    doc.text(resume.basics.name.toUpperCase(), marginLeft, y);
    y += 6;

    // ── Tagline ───────────────────────────────────────────────
    const titles = [...new Set(resume.experience.map((e) => e.title))].slice(
        0,
        3
    );
    const topSkills = resume.skills.filter((s) => !s.includes(":")).slice(0, 4);
    const tagline = [...titles, ...topSkills].join(" · ");
    if (tagline) {
        doc.setFont(docFont, "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(80);
        const taglineLines = doc.splitTextToSize(tagline, contentWidth);
        doc.text(taglineLines, marginLeft, y);
        doc.setTextColor(0);
        y += taglineLines.length * 3.5 + 1;
    }

    // ── Contact ───────────────────────────────────────────────
    doc.setFont(docFont, "normal");
    doc.setFontSize(8.5);
    const contactParts = [
        resume.basics.phone,
        resume.basics.email,
        resume.basics.location,
        resume.basics.github,
        resume.basics.linkedin,
        resume.basics.website,
    ].filter(Boolean);
    const contactText = contactParts.join(" | ");
    const contactLines = doc.splitTextToSize(contactText, contentWidth);
    doc.text(contactLines, marginLeft, y);
    y += contactLines.length * 3.5 + 2;

    // ── Divider ───────────────────────────────────────────────
    doc.setDrawColor(160);
    doc.setLineWidth(0.4);
    doc.line(marginLeft, y, pageWidth - marginRight, y);
    y += 5;

    // ── Sections in order ─────────────────────────────────────
    const sectionOrder: ReorderableSection[] =
        resume.sectionOrder ?? DEFAULT_SECTION_ORDER;

    for (const section of sectionOrder) {
        switch (section) {
            // ────────────────────────────────────────────────────────
            case "summary": {
                if (!resume.basics.summary) break;
                drawSectionHeader("PROFESSIONAL SUMMARY");
                doc.setFont(docFont, "normal");
                doc.setFontSize(9);
                const summaryLines = doc.splitTextToSize(
                    resume.basics.summary,
                    contentWidth
                );
                checkPage(summaryLines.length * bulletLineHeight);
                doc.text(summaryLines, marginLeft, y);
                y += summaryLines.length * bulletLineHeight + 4;
                break;
            }

            // ────────────────────────────────────────────────────────
            case "skills": {
                if (resume.skills.length === 0) break;
                drawSectionHeader("TECHNICAL SKILLS");

                const skillData = parseSkills(resume.skills);

                if (skillData.isCategorized && skillData.categories.length > 0) {
                    for (const cat of skillData.categories) {
                        checkPage(5);
                        doc.setFont(docFont, "bold");
                        doc.setFontSize(9);
                        const label = `${cat.label}:`;
                        doc.text(label, marginLeft, y);
                        const labelWidth = doc.getTextWidth(label + " ");

                        doc.setFont(docFont, "normal");
                        doc.setFontSize(9);
                        const remainingWidth = contentWidth - labelWidth;

                        if (remainingWidth > 30) {
                            const itemText = cat.items.join(", ");
                            const lines = doc.splitTextToSize(itemText, remainingWidth);
                            doc.text(lines[0], marginLeft + labelWidth, y);
                            y += bulletLineHeight;
                            for (let i = 1; i < lines.length; i++) {
                                checkPage(4);
                                doc.text(lines[i], marginLeft + labelWidth, y);
                                y += bulletLineHeight;
                            }
                        } else {
                            y += bulletLineHeight;
                            const lines = doc.splitTextToSize(
                                cat.items.join(", "),
                                contentWidth
                            );
                            doc.text(lines, marginLeft, y);
                            y += lines.length * bulletLineHeight;
                        }
                        y += 1.5;
                    }

                    if (skillData.flat.length > 0) {
                        checkPage(4);
                        doc.setFont(docFont, "normal");
                        doc.setFontSize(9);
                        const lines = doc.splitTextToSize(
                            skillData.flat.join(", "),
                            contentWidth
                        );
                        doc.text(lines, marginLeft, y);
                        y += lines.length * bulletLineHeight;
                    }
                } else {
                    doc.setFont(docFont, "normal");
                    doc.setFontSize(9);
                    const skillText = skillData.flat.join(", ");
                    const lines = doc.splitTextToSize(skillText, contentWidth);
                    doc.text(lines, marginLeft, y);
                    y += lines.length * bulletLineHeight;
                }

                y += 3.5;
                break;
            }

            // ────────────────────────────────────────────────────────
            case "experience": {
                if (resume.experience.length === 0) break;
                drawSectionHeader("PROFESSIONAL EXPERIENCE");

                for (let i = 0; i < resume.experience.length; i++) {
                    const exp = resume.experience[i];

                    checkPage(12);
                    doc.setFont(docFont, "bold");
                    doc.setFontSize(9.5);
                    doc.text(exp.title, marginLeft, y);

                    doc.setFont(docFont, "normal");
                    doc.setFontSize(8.5);
                    const dateText = `${formatDate(exp.startDate)} - ${exp.current ? "Present" : formatDate(exp.endDate || "")}`;
                    doc.text(dateText, pageWidth - marginRight, y, { align: "right" });
                    y += 3.5;

                    doc.setFont(docFont, "normal");
                    doc.setFontSize(9);
                    const companyParts = [exp.company, exp.location].filter(Boolean);
                    doc.text(companyParts.join(" | "), marginLeft, y);
                    y += 4;

                    if (exp.technologies?.length) {
                        doc.setFontSize(8);
                        doc.setTextColor(100);
                        const techText = exp.technologies.join(", ");
                        const techLines = doc.splitTextToSize(techText, contentWidth);
                        doc.text(techLines, marginLeft, y);
                        doc.setTextColor(0);
                        y += techLines.length * 3.2 + 1;
                    }

                    for (const bullet of exp.bullets) {
                        drawBullet(`• ${bullet}`);
                    }

                    if (i < resume.experience.length - 1) {
                        y += 2.5;
                    }
                }
                y += 2;
                break;
            }

            // ────────────────────────────────────────────────────────
            case "projects": {
                if (resume.projects.length === 0) break;
                drawSectionHeader("INDEPENDENT DEVELOPMENT & PROJECTS");

                for (let i = 0; i < resume.projects.length; i++) {
                    const proj = resume.projects[i];

                    checkPage(10);

                    doc.setFont(docFont, "bold");
                    doc.setFontSize(9.5);
                    doc.text(proj.name, marginLeft, y);

                    if (proj.url) {
                        doc.setFont(docFont, "normal");
                        doc.setFontSize(8);
                        doc.setTextColor(60, 100, 200);
                        doc.text(proj.url, pageWidth - marginRight, y, { align: "right" });
                        doc.setTextColor(0);
                    }
                    y += 3.5;

                    if (proj.description) {
                        doc.setFont(docFont, "normal");
                        doc.setFontSize(9);
                        const descLines = doc.splitTextToSize(
                            proj.description,
                            contentWidth
                        );
                        checkPage(descLines.length * bulletLineHeight);
                        doc.text(descLines, marginLeft, y);
                        y += descLines.length * bulletLineHeight + 1;
                    }

                    if (proj.technologies?.length) {
                        doc.setFontSize(8);
                        doc.setTextColor(100);
                        doc.text(proj.technologies.join(", "), marginLeft, y);
                        doc.setTextColor(0);
                        y += 3.2;
                    }

                    if (proj.bullets?.length) {
                        for (const bullet of proj.bullets) {
                            drawBullet(`• ${bullet}`);
                        }
                    }

                    if (i < resume.projects.length - 1) {
                        y += 2.5;
                    }
                }
                y += 2;
                break;
            }

            // ────────────────────────────────────────────────────────
            case "education": {
                if (
                    resume.education.length === 0 &&
                    (!resume.certifications || resume.certifications.length === 0)
                )
                    break;

                drawSectionHeader("EDUCATION & CERTIFICATIONS");

                for (const edu of resume.education) {
                    checkPage(10);

                    doc.setFont(docFont, "bold");
                    doc.setFontSize(9);
                    const degreeLine = [edu.degree, edu.field]
                        .filter(Boolean)
                        .join(" in ");
                    doc.text(degreeLine, marginLeft, y);

                    doc.setFont(docFont, "normal");
                    doc.setFontSize(8.5);
                    doc.text(edu.endDate || "", pageWidth - marginRight, y, {
                        align: "right",
                    });
                    y += 3.5;

                    doc.setFont(docFont, "normal");
                    doc.setFontSize(9);
                    let instLine = edu.institution;
                    if (edu.gpa) instLine += ` — GPA: ${edu.gpa}`;
                    if (edu.honors?.length) instLine += ` · ${edu.honors.join(", ")}`;
                    doc.text(instLine, marginLeft, y);
                    y += 4;
                }

                if (resume.certifications?.length) {
                    for (const cert of resume.certifications) {
                        checkPage(6);
                        doc.setFont(docFont, "normal");
                        doc.setFontSize(9);
                        const certParts = [cert.name, cert.issuer, cert.date]
                            .filter(Boolean)
                            .join(" — ");
                        const certLines = doc.splitTextToSize(certParts, contentWidth);
                        doc.text(certLines, marginLeft, y);
                        y += certLines.length * 3.5 + 1;
                    }
                }
                break;
            }
        }
    }

    // ── Watermark ─────────────────────────────────────────────
    if (watermark) {
        const totalPages = doc.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFont(docFont, "normal");
            doc.setFontSize(40);
            doc.setTextColor(210, 210, 210);
            doc.text("FREE TIER", 105, 148, {
                align: "center",
                angle: 45,
            });
            doc.setTextColor(0);
        }
    }

    const arrayBuffer = doc.output("arraybuffer");
    return new Blob([arrayBuffer], { type: "application/pdf" });
}
