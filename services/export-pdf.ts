"use server";

import type { ResumeSchema } from "@/types";
import { formatDate } from "@/lib/utils";

export async function generatePDF(resume: ResumeSchema): Promise<Blob> {
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

    // ── Name ──────────────────────────────────────────────────────
    doc.setFont("helvetica", "bold");
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
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(80);
        const taglineLines = doc.splitTextToSize(tagline, contentWidth);
        doc.text(taglineLines, marginLeft, y);
        doc.setTextColor(0);
        y += taglineLines.length * 3.5 + 1;
    }

    // ── Contact Line ──────────────────────────────────────────────
    doc.setFont("helvetica", "normal");
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
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(title, marginLeft, y);
        y += 1.5;
        doc.setDrawColor(160);
        doc.setLineWidth(0.3);
        doc.line(marginLeft, y, pageWidth - marginRight, y);
        y += 5;
    };

    const drawBullet = (text: string) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        const lines = doc.splitTextToSize(text, contentWidth - 5);
        checkPage(lines.length * 3.8 + 1);
        doc.text(lines, marginLeft + 3, y);
        y += lines.length * 3.8 + 1.2;
    };

    // ── Professional Summary ──────────────────────────────────────
    if (resume.basics.summary) {
        drawSectionHeader("PROFESSIONAL SUMMARY");
        doc.setFont("helvetica", "normal");
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

        // Check if skills are categorized (contain ":")
        const hasCategories = resume.skills.some((s) => s.includes(":"));

        if (hasCategories) {
            // Render each category on its own line
            for (const skill of resume.skills) {
                if (skill.includes(":")) {
                    const [category, items] = skill.split(/:(.+)/);
                    checkPage(5);
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(9);
                    doc.text(`${category.trim()}:`, marginLeft, y);
                    const categoryWidth = doc.getTextWidth(`${category.trim()}: `);

                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(9);
                    const remainingWidth = contentWidth - categoryWidth;

                    if (remainingWidth > 30) {
                        // First part on same line as category
                        const firstLineText = items.trim();
                        const firstLines = doc.splitTextToSize(firstLineText, remainingWidth);
                        doc.text(firstLines[0], marginLeft + categoryWidth, y);
                        y += 3.8;

                        // Remaining lines indented under category
                        if (firstLines.length > 1) {
                            for (let i = 1; i < firstLines.length; i++) {
                                checkPage(4);
                                doc.text(firstLines[i], marginLeft + categoryWidth, y);
                                y += 3.8;
                            }
                        }
                    } else {
                        // Not enough space — put items on next line
                        y += 3.8;
                        const itemLines = doc.splitTextToSize(items.trim(), contentWidth);
                        doc.text(itemLines, marginLeft, y);
                        y += itemLines.length * 3.8;
                    }
                    y += 1.5;
                } else {
                    // Standalone skill without category
                    checkPage(4);
                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(9);
                    doc.text(skill, marginLeft, y);
                    y += 3.8;
                }
            }
            y += 2;
        } else {
            // Flat skills list
            const skillText = resume.skills.join(", ");
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            const skillLines = doc.splitTextToSize(skillText, contentWidth);
            checkPage(skillLines.length * 3.8);
            doc.text(skillLines, marginLeft, y);
            y += skillLines.length * 3.8 + 4;
        }
    }


    // ── Professional Experience ───────────────────────────────────
    if (resume.experience.length > 0) {
        drawSectionHeader("PROFESSIONAL EXPERIENCE");

        for (let i = 0; i < resume.experience.length; i++) {
            const exp = resume.experience[i];

            // Title line: Title | Company | Location | Dates
            checkPage(12);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9.5);

            const titleText = exp.title;
            doc.text(titleText, marginLeft, y);

            // Right-aligned dates
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8.5);
            const dateText = `${formatDate(exp.startDate)} - ${exp.current ? "Present" : formatDate(exp.endDate || "")}`;
            doc.text(dateText, pageWidth - marginRight, y, { align: "right" });
            y += 3.5;

            // Company line
            doc.setFont("helvetica", "italic");
            doc.setFontSize(9);
            const companyParts = [exp.company, exp.location].filter(Boolean);
            doc.text(companyParts.join(" | "), marginLeft, y);
            y += 4;

            // Technologies (if any)
            if (exp.technologies?.length) {
                doc.setFont("helvetica", "normal");
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
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9.5);
            doc.text(proj.name, marginLeft, y);

            // URL on the right if available
            if (proj.url) {
                doc.setFont("helvetica", "normal");
                doc.setFontSize(8);
                doc.setTextColor(60, 100, 200);
                doc.text(proj.url, pageWidth - marginRight, y, { align: "right" });
                doc.setTextColor(0);
            }
            y += 3.5;

            // Description
            if (proj.description) {
                doc.setFont("helvetica", "normal");
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

            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            const degreeLine = [edu.degree, edu.field].filter(Boolean).join(" in ");
            doc.text(degreeLine, marginLeft, y);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(8.5);
            doc.text(edu.endDate || "", pageWidth - marginRight, y, {
                align: "right",
            });
            y += 3.5;

            doc.setFont("helvetica", "italic");
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
                doc.setFont("helvetica", "normal");
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
