"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from "@/lib/constants";

type ResumeUploadProps = {
    onTextExtracted: (text: string) => void;
    onFileAccepted?: (file: File) => void;
    currentText: string;
};

export function ResumeUpload({
    onTextExtracted,
    onFileAccepted,
    currentText,
}: ResumeUploadProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);

    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            const file = acceptedFiles[0];
            if (!file) return;

            setFileName(file.name);
            setIsProcessing(true);

            try {
                if (file.type === "text/plain") {
                    const text = await file.text();
                    onTextExtracted(text);
                } else {
                    onFileAccepted?.(file);
                }
            } catch (err) {
                console.error("File processing error:", err);
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

    return (
        <div className="space-y-4">
            <div
                {...getRootProps()}
                className={cn(
                    "group relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all",
                    isDragActive
                        ? "border-accent bg-accent/5"
                        : "border-border hover:border-text-muted/30 hover:bg-surface-hover",
                    isProcessing && "pointer-events-none opacity-60"
                )}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-3">
                    {isProcessing ? (
                        <Loader2 className="h-8 w-8 text-accent animate-spin" />
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
                                PDF, DOCX, or TXT — max 10MB
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
                    <span className="bg-surface px-3 text-text-muted">or paste text</span>
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
