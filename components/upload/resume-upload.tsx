"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ACCEPTED_EXTENSIONS, ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from "@/lib/constants";

type ResumeUploadProps = {
    onTextExtracted: (text: string) => void;
    onFileAccepted?: (file: File) => void;
    currentText: string;
};


function validateFile(file: File): string | null {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();

    const extValid = ACCEPTED_EXTENSIONS.includes(ext);
    const mimeValid = Object.keys(ACCEPTED_FILE_TYPES).includes(file.type);

    if (!extValid && !mimeValid) {
        return "Unsupported file type. Please upload a PDF, DOCX, or TXT file.";
    }

    if (file.size > MAX_FILE_SIZE) {
        return `File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`;
    }

    if (file.size === 0) {
        return "File is empty. Please upload a file with content.";
    }

    return null;
}

export function ResumeUpload({
    onTextExtracted,
    onFileAccepted,
    currentText,
}: ResumeUploadProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);

    const onDrop = useCallback(
        async (acceptedFiles: File[], rejections: any[]) => {
            if (rejections.length > 0) {
                const rejection = rejections[0];
                const error = rejection.errors[0];
                if (error?.code === "file-too-large") {
                    toast.error(
                        `File is too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`
                    );
                } else if (error?.code === "file-invalid-type") {
                    toast.error(
                        "Unsupported file type. Please upload a PDF, DOCX, or TXT file."
                    );
                } else {
                    toast.error(error?.message ?? "Invalid file");
                }
                return;
            }

            const file = acceptedFiles[0];
            if (!file) return;

            const error = validateFile(file);
            if (error) {
                toast.error(error);
                return;
            }

            setFileName(file.name);
            setIsProcessing(true);

            try {
                if (file.type === "text/plain" || file.name.endsWith(".txt")) {
                    const text = await file.text();
                    if (!text.trim()) {
                        toast.error("File appears to be empty");
                        setFileName(null);
                        return;
                    }
                    onTextExtracted(text);
                    toast.success("Text file loaded");
                } else {
                    onFileAccepted?.(file);
                }
            } catch {
                toast.error("Failed to process file");
                setFileName(null);
            } finally {
                setIsProcessing(false);
            }
        },
        [onTextExtracted, onFileAccepted]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: ACCEPTED_FILE_TYPES,
        maxSize: MAX_FILE_SIZE,
        multiple: false,
    });

    const sizeLabel = `${MAX_FILE_SIZE / 1024 / 1024}MB`;

    return (
        <div className="space-y-4">
            <div
                {...getRootProps()}
                className={cn(
                    "group relative cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all sm:p-8",
                    isDragActive
                        ? "border-accent bg-accent/5"
                        : "border-border hover:border-text-muted/30 hover:bg-surface-hover",
                    isProcessing && "pointer-events-none opacity-60"
                )}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-3">
                    {isProcessing ? (
                        <Loader2 className="h-8 w-8 animate-spin text-accent" />
                    ) : fileName ? (
                        <FileText className="h-8 w-8 text-emerald" />
                    ) : (
                        <Upload className="h-8 w-8 text-text-muted transition-colors group-hover:text-text-secondary" />
                    )}

                    {isProcessing ? (
                        <p className="text-sm text-text-secondary">Processing file...</p>
                    ) : fileName ? (
                        <div className="flex items-center gap-2">
                            <p className="text-sm text-text-primary">{fileName}</p>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setFileName(null);
                                    onTextExtracted("");
                                }}
                                className="rounded p-0.5 text-text-muted hover:text-error"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    ) : (
                        <>
                            <p className="text-sm font-medium text-text-secondary">
                                Drop your resume here or{" "}
                                <span className="text-accent">browse</span>
                            </p>
                            <p className="text-xs text-text-muted">
                                PDF, DOCX, or TXT — max {sizeLabel}
                            </p>
                        </>
                    )}
                </div>
            </div>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                    <span className="bg-surface px-3 text-text-muted">
                        or paste text
                    </span>
                </div>
            </div>

            <textarea
                value={currentText}
                onChange={(e) => onTextExtracted(e.target.value)}
                placeholder="Paste your resume text here..."
                className="h-48 w-full resize-none rounded-xl border border-border bg-surface-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/20"
            />
        </div>
    );
}
