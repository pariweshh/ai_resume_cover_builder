"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    FileText,
    File,
    Download,
    Loader2,
    CheckCircle2,
    Printer,
    Eye,
} from "lucide-react";
import { toast } from "sonner";
import { generatePDF } from "@/services/export-pdf";
import { generateDOCX } from "@/services/export-docx";
import type { ResumeSchema } from "@/types";
import { useSettings } from "@/hooks/useSettings";

type ExportPanelProps = {
    resume: ResumeSchema;
    coverLetter: string;
};

export function ExportPanel({ resume, coverLetter }: ExportPanelProps) {
    const [isExporting, setIsExporting] = useState<string | null>(null);
    const [exportHistory, setExportHistory] = useState<
        { format: string; filename: string; time: string }[]
    >([]);

    const { settings } = useSettings();

    const addToHistory = (format: string, filename: string) => {
        setExportHistory((prev) => [
            {
                format,
                filename,
                time: new Date().toLocaleTimeString("en-AU", {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
            },
            ...prev.slice(0, 9),
        ]);
    };

    const handleExportResumePDF = async () => {
        setIsExporting("resume-pdf");
        try {
            const blob = await generatePDF(resume, settings.resumeFont);
            const filename = `${resume.basics.name.replace(/\s+/g, "_")}_Resume.pdf`;
            downloadBlob(blob, filename);
            addToHistory("PDF", filename);
            toast.success("Resume exported as PDF");
        } catch {
            toast.error("Failed to export PDF");
        } finally {
            setIsExporting(null);
        }
    };

    const handleExportResumeDOCX = async () => {
        setIsExporting("resume-docx");
        try {
            const blob = await generateDOCX(resume, settings.resumeFont);
            const filename = `${resume.basics.name.replace(/\s+/g, "_")}_Resume.docx`;
            downloadBlob(blob, filename);
            addToHistory("DOCX", filename);
            toast.success("Resume exported as DOCX");
        } catch {
            toast.error("Failed to export DOCX");
        } finally {
            setIsExporting(null);
        }
    };

    const handleExportBoth = async () => {
        setIsExporting("both");
        try {
            const [resumeBlob, docxBlob] = await Promise.all([
                generatePDF(resume, settings.resumeFont),
                generateDOCX(resume, settings.resumeFont),
            ]);
            const name = resume.basics.name.replace(/\s+/g, "_");
            downloadBlob(resumeBlob, `${name}_Resume.pdf`);
            setTimeout(() => {
                downloadBlob(docxBlob, `${name}_Resume.docx`);
            }, 500);
            addToHistory("PDF + DOCX", `${name}_Resume`);
            toast.success("Both formats exported");
        } catch {
            toast.error("Failed to export");
        } finally {
            setIsExporting(null);
        }
    };


    const handleExportCoverLetter = async () => {
        if (!coverLetter) {
            toast.error("No cover letter to export");
            return;
        }
        setIsExporting("cover-pdf");
        try {
            const { jsPDF } = await import("jspdf");
            const doc = new jsPDF();
            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            const lines = doc.splitTextToSize(coverLetter, 170);
            doc.text(lines, 20, 20);
            const arrayBuffer = doc.output("arraybuffer");
            const blob = new Blob([arrayBuffer], { type: "application/pdf" });
            const filename = `${resume.basics.name.replace(/\s+/g, "_")}_Cover_Letter.pdf`;
            downloadBlob(blob, filename);
            addToHistory("PDF", filename);
            toast.success("Cover letter exported as PDF");
        } catch {
            toast.error("Failed to export cover letter");
        } finally {
            setIsExporting(null);
        }
    };



    const handlePrint = () => {
        handleExportResumePDF().then(() => {
            toast.info("PDF downloaded — open it to print");
        });
    };

    return (
        <div className="mx-auto max-w-3xl space-y-8 p-8">
            {/* Header */}
            <div>
                <h2 className="font-display text-2xl text-text-primary">
                    Export your resume
                </h2>
                <p className="mt-2 text-sm text-text-secondary">
                    All exports use ATS-safe formatting — single column, no graphics, clean
                    typography that passes through applicant tracking systems.
                </p>
            </div>

            {/* Resume Info Card */}
            <div className="rounded-xl border border-border bg-surface p-5">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold text-text-primary">
                            {resume.basics.name}
                        </p>
                        <p className="text-xs text-text-muted">
                            {resume.experience.length} roles · {resume.skills.length} skills ·{" "}
                            {resume.projects.length} projects
                        </p>
                    </div>
                    {resume.basics.summary && (
                        <div className="rounded-lg bg-emerald/10 px-3 py-1">
                            <p className="text-xs font-medium text-emerald">Ready to export</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Export Options */}
            <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Resume
                </h3>

                <div className="grid gap-3 sm:grid-cols-2">
                    {/* PDF */}
                    <button
                        onClick={handleExportResumePDF}
                        disabled={!!isExporting}
                        className="group flex items-start gap-4 rounded-xl border border-border bg-surface p-5 text-left transition-all hover:border-white/[0.08] hover:bg-surface-elevated disabled:opacity-50"
                    >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-500/10 transition-colors group-hover:bg-red-500/15">
                            {isExporting === "resume-pdf" ? (
                                <Loader2 className="h-5 w-5 animate-spin text-red-400" />
                            ) : (
                                <FileText className="h-5 w-5 text-red-400" />
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-text-primary">
                                Resume as PDF
                            </p>
                            <p className="mt-1 text-xs text-text-muted">
                                Pixel-perfect rendering, ATS-compatible, printable
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                <span className="rounded-md bg-surface-elevated px-2 py-0.5 text-[10px] text-text-muted">
                                    Single page
                                </span>
                                <span className="rounded-md bg-surface-elevated px-2 py-0.5 text-[10px] text-text-muted">
                                    ATS-safe
                                </span>
                                <span className="rounded-md bg-surface-elevated px-2 py-0.5 text-[10px] text-text-muted">
                                    Print-ready
                                </span>
                            </div>
                        </div>
                        <Download className="h-4 w-4 text-text-muted/40 transition-colors group-hover:text-text-muted" />
                    </button>

                    {/* DOCX */}
                    <button
                        onClick={handleExportResumeDOCX}
                        disabled={!!isExporting}
                        className="group flex items-start gap-4 rounded-xl border border-border bg-surface p-5 text-left transition-all hover:border-white/[0.08] hover:bg-surface-elevated disabled:opacity-50"
                    >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 transition-colors group-hover:bg-sky-500/15">
                            {isExporting === "resume-docx" ? (
                                <Loader2 className="h-5 w-5 animate-spin text-sky-400" />
                            ) : (
                                <File className="h-5 w-5 text-sky-400" />
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-text-primary">
                                Resume as DOCX
                            </p>
                            <p className="mt-1 text-xs text-text-muted">
                                Editable Word document, easy to customize further
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                <span className="rounded-md bg-surface-elevated px-2 py-0.5 text-[10px] text-text-muted">
                                    Editable
                                </span>
                                <span className="rounded-md bg-surface-elevated px-2 py-0.5 text-[10px] text-text-muted">
                                    ATS-safe
                                </span>
                                <span className="rounded-md bg-surface-elevated px-2 py-0.5 text-[10px] text-text-muted">
                                    Shareable
                                </span>
                            </div>
                        </div>
                        <Download className="h-4 w-4 text-text-muted/40 transition-colors group-hover:text-text-muted" />
                    </button>
                </div>
            </div>

            {/* Cover Letter */}
            {coverLetter && (
                <div className="space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                        Cover Letter
                    </h3>

                    <button
                        onClick={handleExportCoverLetter}
                        disabled={!!isExporting}
                        className="group flex w-full items-start gap-4 rounded-xl border border-border bg-surface p-5 text-left transition-all hover:border-white/[0.08] hover:bg-surface-elevated disabled:opacity-50"
                    >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald/10 transition-colors group-hover:bg-emerald/15">
                            {isExporting === "cover-pdf" ? (
                                <Loader2 className="h-5 w-5 animate-spin text-emerald" />
                            ) : (
                                <FileText className="h-5 w-5 text-emerald" />
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-text-primary">
                                Cover Letter as PDF
                            </p>
                            <p className="mt-1 text-xs text-text-muted">
                                Clean, printable format with proper letter structure
                            </p>
                        </div>
                        <Download className="h-4 w-4 text-text-muted/40 transition-colors group-hover:text-text-muted" />
                    </button>
                </div>
            )}

            {/* Bulk Actions */}
            <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Quick Actions
                </h3>

                <div className="grid gap-3 sm:grid-cols-2">
                    <button
                        onClick={handleExportBoth}
                        disabled={!!isExporting}
                        className="group flex items-center gap-3 rounded-xl border border-accent/20 bg-accent/5 p-4 text-left transition-all hover:border-accent/30 hover:bg-accent/10 disabled:opacity-50"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                            {isExporting === "both" ? (
                                <Loader2 className="h-5 w-5 animate-spin text-accent" />
                            ) : (
                                <Download className="h-5 w-5 text-accent" />
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-text-primary">
                                Download Both Formats
                            </p>
                            <p className="text-xs text-text-muted">PDF + DOCX at once</p>
                        </div>
                    </button>

                    <button
                        onClick={handlePrint}
                        disabled={!!isExporting}
                        className="group flex items-center gap-3 rounded-xl border border-border bg-surface p-4 text-left transition-all hover:border-white/[0.08] hover:bg-surface-elevated disabled:opacity-50"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                            <Printer className="h-5 w-5 text-violet-400" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-text-primary">
                                Print Resume
                            </p>
                            <p className="text-xs text-text-muted">
                                Download PDF, then print from viewer
                            </p>
                        </div>
                    </button>
                </div>
            </div>

            {/* ATS Format Info */}
            <div className="rounded-xl border border-border bg-surface p-5">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                    ATS Format Guarantees
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                    {[
                        "Single-column layout",
                        "No tables or graphics",
                        "No icons or progress bars",
                        "Standard section headers",
                        "Clean bullet points",
                        "Consistent date formatting",
                        "ATS-readable fonts",
                        "Dynamic single-page sizing",
                    ].map((item) => (
                        <div key={item} className="flex items-center gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald/60" />
                            <span className="text-xs text-text-secondary">{item}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Export History */}
            {exportHistory.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                        Recent Exports
                    </h3>
                    <div className="space-y-1.5">
                        {exportHistory.map((item, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-2.5"
                            >
                                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-surface-elevated">
                                    {item.format === "PDF" || item.format === "PDF + DOCX" ? (
                                        <FileText className="h-3.5 w-3.5 text-red-400" />
                                    ) : (
                                        <File className="h-3.5 w-3.5 text-sky-400" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="truncate text-xs font-medium text-text-primary">
                                        {item.filename}
                                    </p>
                                </div>
                                <span className="rounded-md bg-surface-elevated px-2 py-0.5 text-[10px] text-text-muted">
                                    {item.format}
                                </span>
                                <span className="text-[10px] text-text-muted/50">
                                    {item.time}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
