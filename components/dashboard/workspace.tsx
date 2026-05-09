"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Sidebar } from "./sidebar";
import { ResumeUpload } from "@/components/upload/resume-upload";
import { JDInput } from "@/components/upload/jd-input";
import { ResumeEditor } from "@/components/editor/resume-editor";
import { ScorePanel } from "@/components/ats/score-panel";
import { KeywordAnalysis } from "@/components/ats/keyword-analysis";
import { GenerationProgress } from "@/components/shared/generation-progress";
import { ExportModal } from "@/components/shared/export-modal";
import { useResume } from "@/hooks/useResume";
import { useStreaming } from "@/hooks/useStreaming";
import { Sparkles, Download } from "lucide-react";

export function Workspace() {
    const [activeTab, setActiveTab] = useState("upload");
    const [showExport, setShowExport] = useState(false);
    const [isParsing, setIsParsing] = useState(false);

    const resume = useResume();

    const { stage, progress, isStreaming, startStreaming } = useStreaming({
        onParsed: (data) => {
            resume.handleParsed(data);
            toast.success("Resume parsed successfully");
        },
        onAnalyzed: resume.handleAnalyzed,
        onMapped: resume.handleMapped,
        onEnhanced: (data) => {
            resume.handleEnhanced(data);
            setActiveTab("ats");
        },
        onScored: resume.handleScored,
        onCoverLetter: resume.handleCoverLetter,
        onValidated: (data) => {
            resume.handleValidated(data);
            if (data.trustScore < 60) {
                toast.warning("Review recommended — some enhancements may need adjustment");
            } else if (data.trustScore < 80) {
                toast.info("Generation complete — minor review suggested");
            } else {
                toast.success("Generation complete");
            }
        },
        onComplete: () => setActiveTab("ats"),
        onError: (msg) => toast.error(msg),
    });

    const handleParseFile = useCallback(async (file: File) => {
        setIsParsing(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch("/api/parse", { method: "POST", body: formData });
            if (!res.ok) throw new Error("Failed to parse file");
            const { text } = await res.json();
            resume.setRawText(text);
            toast.success("File parsed — text extracted");
        } catch {
            toast.error("Failed to parse file");
        } finally {
            setIsParsing(false);
        }
    }, [resume]);

    const handleGenerate = useCallback(() => {
        if (!resume.rawText.trim()) {
            toast.error("Please upload or paste your resume first");
            return;
        }
        if (!resume.hasJobDescription) {
            toast.error("Please enter a valid job description (min 20 words)");
            return;
        }
        setActiveTab("generate");
        startStreaming(resume.rawText, resume.jobDescription);
    }, [resume, startStreaming]);

    return (
        <div className="flex h-screen">
            <Sidebar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                hasResume={resume.hasResume}
                hasOptimized={resume.hasOptimized}
            />

            <main className="flex flex-1 flex-col overflow-hidden">
                {/* Header */}
                <header className="flex h-14 items-center justify-between border-b border-border px-6">
                    <h1 className="text-sm font-semibold text-text-primary">
                        {activeTab === "upload" && "Upload Resume"}
                        {activeTab === "job" && "Job Description"}
                        {activeTab === "generate" && "Generate"}
                        {activeTab === "ats" && "ATS Analysis"}
                        {activeTab === "cover" && "Cover Letter"}
                        {activeTab === "export" && "Export"}
                    </h1>
                    <div className="flex items-center gap-2">
                        {resume.currentResume && (
                            <button
                                onClick={() => setShowExport(true)}
                                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
                            >
                                <Download className="h-3.5 w-3.5" />
                                Export
                            </button>
                        )}
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        {/* ── Upload Tab ──────────────────────────────────── */}
                        {activeTab === "upload" && (
                            <motion.div
                                key="upload"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="mx-auto max-w-2xl p-8"
                            >
                                <h2 className="mb-2 font-display text-2xl text-text-primary">
                                    Upload your resume
                                </h2>
                                <p className="mb-6 text-sm text-text-secondary">
                                    We'll parse it into structured data for AI optimization. Your
                                    original content is preserved — the AI only enhances, never
                                    fabricates.
                                </p>
                                <ResumeUpload
                                    currentText={resume.rawText}
                                    onTextExtracted={resume.setRawText}
                                    onFileAccepted={handleParseFile}
                                />
                                {resume.rawText && (
                                    <button
                                        onClick={() => setActiveTab("job")}
                                        className="mt-6 w-full rounded-xl bg-accent py-3 text-sm font-semibold text-background transition-all hover:bg-accent-hover"
                                    >
                                        Continue to Job Description
                                    </button>
                                )}
                            </motion.div>
                        )}

                        {/* ── Job Description Tab ─────────────────────────── */}
                        {activeTab === "job" && (
                            <motion.div
                                key="job"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="mx-auto max-w-2xl p-8"
                            >
                                <h2 className="mb-2 font-display text-2xl text-text-primary">
                                    Target job description
                                </h2>
                                <p className="mb-6 text-sm text-text-secondary">
                                    Paste the full job description. Our AI will extract keywords,
                                    analyze requirements, and map them against your experience.
                                </p>
                                <JDInput
                                    value={resume.jobDescription}
                                    onChange={resume.setJobDescription}
                                />
                                <button
                                    onClick={handleGenerate}
                                    disabled={!resume.rawText.trim() || !resume.hasJobDescription}
                                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-semibold text-background transition-all hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <Sparkles className="h-4 w-4" />
                                    Generate ATS-Optimized Resume
                                </button>
                            </motion.div>
                        )}

                        {/* ── Generate / Progress Tab ─────────────────────── */}
                        {activeTab === "generate" && (
                            <motion.div
                                key="generate"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="flex h-full items-center justify-center"
                            >
                                <GenerationProgress
                                    currentStage={stage}
                                    progress={progress}
                                />
                            </motion.div>
                        )}

                        {/* ── ATS / Editor Tab ────────────────────────────── */}
                        {activeTab === "ats" && resume.currentResume && (
                            <motion.div
                                key="ats"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="flex h-full"
                            >
                                <div className="flex-1 overflow-y-auto border-r border-border">
                                    <ResumeEditor
                                        resume={resume.currentResume}
                                        onChange={(r) => resume.updateCurrentResume(() => r)}
                                        lockedSections={resume.lockedSections}
                                        onToggleLock={resume.toggleLock}
                                        onRegenerateSection={(section, index) => {
                                            toast.info(
                                                `Regenerating ${section}${index !== undefined ? ` #${index + 1}` : ""}...`
                                            );
                                        }}
                                    />

                                </div>
                                <div className="w-80 overflow-y-auto p-4">
                                    {resume.atsScore && <ScorePanel score={resume.atsScore} />}
                                    {resume.jdAnalysis && resume.evidenceMapping && (
                                        <div className="mt-4">
                                            <KeywordAnalysis
                                                analysis={resume.jdAnalysis}
                                                mapping={resume.evidenceMapping}
                                            />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* ── Cover Letter Tab ────────────────────────────── */}
                        {activeTab === "cover" && (
                            <motion.div
                                key="cover"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="mx-auto max-w-3xl p-8"
                            >
                                <h2 className="mb-2 font-display text-2xl text-text-primary">
                                    Cover Letter
                                </h2>
                                <p className="mb-6 text-sm text-text-secondary">
                                    AI-generated, tailored to the job description. Edit freely.
                                </p>
                                <textarea
                                    value={resume.coverLetter}
                                    onChange={(e) => resume.setCoverLetter(e.target.value)}
                                    className="h-[60vh] w-full resize-none rounded-xl border border-border bg-surface-elevated px-6 py-4 text-sm leading-relaxed text-text-primary focus:border-accent/40 focus:outline-none"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* Export Modal */}
            {showExport && resume.currentResume && (
                <ExportModal
                    resume={resume.currentResume}
                    coverLetter={resume.coverLetter}
                    onClose={() => setShowExport(false)}
                />
            )}
        </div>
    );
}
