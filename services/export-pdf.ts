"use server";

import type { ResumeSchema } from "@/types";
import { formatDate } from "@/lib/utils";
import { parseSkills } from "@/lib/skills-utils";

export async function generatePDF(resume: ResumeSchema, font: string = "Calibri"): Promise<Blob> {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const marginLeft = 15;
    const marginRight = 15;
    const contentWidth = pageWidth - marginLeft - marginRight;
    let y = 15;

    const sectionGap = 3.5;
    const entryGap = 2.5;
    const bulletLineHeight = 3.8;

    // Map user font to jsPDF font names
    const fontMap: Record<string, string> = {
        Calibri: "helvetica",
        Georgia: "times",
        Helvetica: "helvetica",
        Garamond: "times",
        Cambria: "times",
    };
    const docFont = fontMap[font] || "helvetica";


    // ── Name ──────────────────────────────────────────────────────
    doc.setFont(docFont, "bold");
    doc.setFontSize(20);
    doc.text(resume.basics.name.toUpperCase(), marginLeft, y);
    y += 5.5;

    // ── Subtitle / Tagline ────────────────────────────────────────
    const titles = [...new Set(resume.experience.map((e) => e.title))].slice(0, 3);
    const topSkills = resume.skills
        .filter((s) => !s.includes(":"))
        .slice(0, 4);
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

    // ── Contact Line ──────────────────────────────────────────────
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


    // ── Divider ───────────────────────────────────────────────────
    doc.setDrawColor(160);
    doc.setLineWidth(0.4);
    doc.line(marginLeft, y, pageWidth - marginRight, y);
    y += 5;

    // ── Helpers ───────────────────────────────────────────────────
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
        checkPage(lines.length * 3.8 + 1);
        doc.text(lines, marginLeft + 3, y);
        y += lines.length * 3.8 + 1.2;
    };

    // ── Professional Summary ──────────────────────────────────────
    if (resume.basics.summary) {
        drawSectionHeader("PROFESSIONAL SUMMARY");
        doc.setFont(docFont, "normal");
        doc.setFontSize(9);
        const summaryLines = doc.splitTextToSize(
            resume.basics.summary,
            contentWidth
        );
        checkPage(summaryLines.length * 3.8);
        doc.text(summaryLines, marginLeft, y);
        y += summaryLines.length * 3.8 + 4;
    }

    // ── Technical Skills ──────────────────────────────────────────
    if (resume.skills.length > 0) {
        drawSectionHeader("TECHNICAL SKILLS");

        const skillData = parseSkills(resume.skills);

        if (skillData.isCategorized && skillData.categories.length > 0) {
            // Render each category on its own line
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
                    const lines = doc.splitTextToSize(cat.items.join(", "), contentWidth);
                    doc.text(lines, marginLeft, y);
                    y += lines.length * bulletLineHeight;
                }
                y += 1.5;
            }

            // Uncategorized skills
            if (skillData.flat.length > 0) {
                checkPage(4);
                doc.setFont(docFont, "normal");
                doc.setFontSize(9);
                const lines = doc.splitTextToSize(skillData.flat.join(", "), contentWidth);
                doc.text(lines, marginLeft, y);
                y += lines.length * bulletLineHeight;
            }
        } else {
            // Flat list — render as wrapped paragraph
            doc.setFont(docFont, "normal");
            doc.setFontSize(9);
            const skillText = skillData.flat.join(", ");
            const lines = doc.splitTextToSize(skillText, contentWidth);
            doc.text(lines, marginLeft, y);
            y += lines.length * bulletLineHeight;
        }

        y += sectionGap;
    }



    // ── Professional Experience ───────────────────────────────────
    if (resume.experience.length > 0) {
        drawSectionHeader("PROFESSIONAL EXPERIENCE");

        for (let i = 0; i < resume.experience.length; i++) {
            const exp = resume.experience[i];

            // Title line: Title | Company | Location | Dates
            checkPage(12);
            doc.setFont(docFont, "bold");
            doc.setFontSize(9.5);

            const titleText = exp.title;
            doc.text(titleText, marginLeft, y);

            // Right-aligned dates
            doc.setFont(docFont, "normal");
            doc.setFontSize(8.5);
            const dateText = `${formatDate(exp.startDate)} - ${exp.current ? "Present" : formatDate(exp.endDate || "")}`;
            doc.text(dateText, pageWidth - marginRight, y, { align: "right" });
            y += 3.5;

            // Company line
            doc.setFont(docFont, "italic");
            doc.setFontSize(9);
            const companyParts = [exp.company, exp.location].filter(Boolean);
            doc.text(companyParts.join(" | "), marginLeft, y);
            y += 4;

            // Technologies (if any)
            if (exp.technologies?.length) {
                doc.setFont(docFont, "normal");
                doc.setFontSize(8);
                doc.setTextColor(100);
                const techText = exp.technologies.join(", ");
                const techLines = doc.splitTextToSize(techText, contentWidth);
                doc.text(techLines, marginLeft, y);
                doc.setTextColor(0);
                y += techLines.length * 3.2 + 1;
            }

            // Bullets
            for (const bullet of exp.bullets) {
                drawBullet(`• ${bullet}`);
            }

            // Gap between experience entries
            if (i < resume.experience.length - 1) {
                y += 2.5;
            }
        }
        y += 2;
    }

    // ── Independent Development & Projects ────────────────────────
    if (resume.projects.length > 0) {
        drawSectionHeader("INDEPENDENT DEVELOPMENT & PROJECTS");

        for (let i = 0; i < resume.projects.length; i++) {
            const proj = resume.projects[i];

            checkPage(10);

            // Project name (bold)
            doc.setFont(docFont, "bold");
            doc.setFontSize(9.5);
            doc.text(proj.name, marginLeft, y);

            // URL on the right if available
            if (proj.url) {
                doc.setFont(docFont, "normal");
                doc.setFontSize(8);
                doc.setTextColor(60, 100, 200);
                doc.text(proj.url, pageWidth - marginRight, y, { align: "right" });
                doc.setTextColor(0);
            }
            y += 3.5;

            // Description
            if (proj.description) {
                doc.setFont(docFont, "normal");
                doc.setFontSize(9);
                const descLines = doc.splitTextToSize(proj.description, contentWidth);
                checkPage(descLines.length * 3.8);
                doc.text(descLines, marginLeft, y);
                y += descLines.length * 3.8 + 1;
            }

            // Technologies
            if (proj.technologies?.length) {
                doc.setFontSize(8);
                doc.setTextColor(100);
                doc.text(proj.technologies.join(", "), marginLeft, y);
                doc.setTextColor(0);
                y += 3.2;
            }

            // Bullets
            if (proj.bullets?.length) {
                for (const bullet of proj.bullets) {
                    drawBullet(`• ${bullet}`);
                }
            }

            // Gap between projects
            if (i < resume.projects.length - 1) {
                y += 2.5;
            }
        }
        y += 2;
    }

    // ── Education & Certifications ────────────────────────────────
    if (resume.education.length > 0 || resume.certifications?.length) {
        drawSectionHeader("EDUCATION & CERTIFICATIONS");

        // Education entries
        for (const edu of resume.education) {
            checkPage(10);

            doc.setFont(docFont, "bold");
            doc.setFontSize(9);
            const degreeLine = [edu.degree, edu.field].filter(Boolean).join(" in ");
            doc.text(degreeLine, marginLeft, y);

            doc.setFont(docFont, "normal");
            doc.setFontSize(8.5);
            doc.text(edu.endDate || "", pageWidth - marginRight, y, {
                align: "right",
            });
            y += 3.5;

            doc.setFont(docFont, "italic");
            doc.setFontSize(9);
            let instLine = edu.institution;
            if (edu.gpa) instLine += ` — GPA: ${edu.gpa}`;
            doc.text(instLine, marginLeft, y);
            y += 4;
        }

        // Certifications
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
    }

    const arrayBuffer = doc.output("arraybuffer");
    return new Blob([arrayBuffer], { type: "application/pdf" });
}
