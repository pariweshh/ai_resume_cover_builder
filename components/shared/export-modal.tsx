"use client";

import { useState } from "react";
import { X, FileText, File, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { generatePDF } from "@/services/export-pdf";
import { generateDOCX } from "@/services/export-docx";
import type { ResumeSchema } from "@/types";

type ExportModalProps = {
    resume: ResumeSchema;
    coverLetter: string;
    onClose: () => void;
};

export function ExportModal({
    resume,
    coverLetter,
    onClose,
}: ExportModalProps) {
    const [isExporting, setIsExporting] = useState<string | null>(null);

    const handleExport = async (format: "pdf" | "docx") => {
        setIsExporting(format);
        try {
            let blob: Blob;
            let filename: string;

            if (format === "pdf") {
                blob = await generatePDF(resume);
                filename = `${resume.basics.name.replace(/\s+/g, "_")}_Resume.pdf`;
            } else {
                blob = await generateDOCX(resume);
                filename = `${resume.basics.name.replace(/\s+/g, "_")}_Resume.docx`;
            }

            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success(`Exported as ${format.toUpperCase()}`);
            onClose();
        } catch (err) {
            toast.error(`Failed to export ${format.toUpperCase()}`);
        } finally {
            setIsExporting(null);
        }
    };

    const handleExportCoverLetter = async () => {
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
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${resume.basics.name.replace(/\s+/g, "_")}_Cover_Letter.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success("Cover letter exported");
            onClose();
        } catch {
            toast.error("Failed to export cover letter");
        } finally {
            setIsExporting(null);
        }
    };


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-text-primary">Export</h3>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-text-muted hover:text-text-primary"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <p className="mt-2 text-sm text-text-secondary">
                    All exports use ATS-safe formatting — single column, no graphics, clean
                    typography.
                </p>

                <div className="mt-6 space-y-3">
                    <button
                        onClick={() => handleExport("pdf")}
                        disabled={!!isExporting}
                        className="flex w-full items-center gap-4 rounded-xl border border-border bg-surface-elevated p-4 text-left transition-all hover:border-accent/30 hover:bg-surface-hover disabled:opacity-50"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-error/10">
                            <FileText className="h-5 w-5 text-error" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-text-primary">
                                Resume as PDF
                            </p>
                            <p className="text-xs text-text-muted">
                                Pixel-perfect, ATS-compatible
                            </p>
                        </div>
                        {isExporting === "pdf" && (
                            <Loader2 className="h-4 w-4 animate-spin text-accent" />
                        )}
                    </button>

                    <button
                        onClick={() => handleExport("docx")}
                        disabled={!!isExporting}
                        className="flex w-full items-center gap-4 rounded-xl border border-border bg-surface-elevated p-4 text-left transition-all hover:border-accent/30 hover:bg-surface-hover disabled:opacity-50"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                            <File className="h-5 w-5 text-accent" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-text-primary">
                                Resume as DOCX
                            </p>
                            <p className="text-xs text-text-muted">
                                Editable Word document
                            </p>
                        </div>
                        {isExporting === "docx" && (
                            <Loader2 className="h-4 w-4 animate-spin text-accent" />
                        )}
                    </button>

                    {coverLetter && (
                        <button
                            onClick={handleExportCoverLetter}
                            disabled={!!isExporting}
                            className="flex w-full items-center gap-4 rounded-xl border border-border bg-surface-elevated p-4 text-left transition-all hover:border-accent/30 hover:bg-surface-hover disabled:opacity-50"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald/10">
                                <FileText className="h-5 w-5 text-emerald" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-text-primary">
                                    Cover Letter as PDF
                                </p>
                                <p className="text-xs text-text-muted">Clean, printable format</p>
                            </div>
                            {isExporting === "cover-pdf" && (
                                <Loader2 className="h-4 w-4 animate-spin text-accent" />
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
