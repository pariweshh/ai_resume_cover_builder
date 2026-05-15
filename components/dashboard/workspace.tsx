"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Sidebar } from "./sidebar";
import { ResumeUpload } from "@/components/upload/resume-upload";
import { JDInput } from "@/components/upload/jd-input";
import { ResumeEditor } from "@/components/editor/resume-editor";
import { RearrangeModal } from "@/components/editor/rearrange-modal";
import { FloatingPreview } from "@/components/editor/floating-preview";
import { ScorePanel } from "@/components/ats/score-panel";
import { KeywordAnalysis } from "@/components/ats/keyword-analysis";
import { GenerationProgress } from "@/components/shared/generation-progress";
import { ExportModal } from "@/components/shared/export-modal";
import { ExportPanel } from "@/components/shared/export-panel";
import { Paywall } from "@/components/shared/paywall";
import { useResume } from "@/hooks/useResume";
import { useStreaming } from "@/hooks/useStreaming";
import { useSettings } from "@/hooks/useSettings";
import { useWorkspacePersistence } from "@/hooks/useWorkspacePersistence";
import { useAuth } from "@/lib/supabase/auth-context";
import { hasGenerationsRemaining, canUseFeature } from "@/lib/subscription";
import {
    Sparkles,
    Download,
    ArrowRight,
    GripVertical,
    PenLine,
    Eye,
    RotateCcw,
    Loader2,
} from "lucide-react";

export function Workspace() {
    const [activeTab, setActiveTab] = useState("upload");
    const [showExport, setShowExport] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const [showPaywall, setShowPaywall] = useState(false);
    const [paywallTrigger, setPaywallTrigger] = useState("");
    const [paywallFeature, setPaywallFeature] = useState<string | undefined>();
    const [showRearrange, setShowRearrange] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [showStartOverConfirm, setShowStartOverConfirm] = useState(false);

    const hasHydrated = useRef(false);

    const { user, profile } = useAuth();
    const { settings } = useSettings();
    const resume = useResume();

    const tier = profile?.subscription_tier ?? "free";
    const gensUsed = profile?.generations_used_this_month ?? 0;

    // ── Workspace persistence ─────────────────────────────────────
    const { initialState, save, clear, flush, isLoading, isSaving } =
        useWorkspacePersistence(user?.id ?? null);

    // Hydrate resume state from loaded workspace
    useEffect(() => {
        if (initialState) {
            resume.hydrate(initialState);

            // Restore active tab, but skip "generate" (streaming can't resume)
            const tab = initialState.activeTab;
            if (tab === "generate") {
                setActiveTab(initialState.optimizedResume ? "ats" : "upload");
            } else {
                setActiveTab(tab ?? "upload");
            }

            hasHydrated.current = true;
        } else if (!isLoading) {
            hasHydrated.current = true;
        }
    }, [initialState, isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

    // Debounced auto-save on any state change
    useEffect(() => {
        if (!hasHydrated.current || isLoading) return;

        save({
            rawText: resume.rawText,
            jobDescription: resume.jobDescription,
            currentResume: resume.currentResume,
            optimizedResume: resume.optimizedResume,
            atsScore: resume.atsScore,
            coverLetter: resume.coverLetter,
            validation: resume.validation,
            jdAnalysis: resume.jdAnalysis,
            evidenceMapping: resume.evidenceMapping,
            lockedSections: Array.from(resume.lockedSections),
            startedFromScratch: resume.startedFromScratch,
            activeTab,
        });
    }, [
        resume.rawText,
        resume.jobDescription,
        resume.currentResume,
        resume.optimizedResume,
        resume.atsScore,
        resume.coverLetter,
        resume.validation,
        resume.jdAnalysis,
        resume.evidenceMapping,
        resume.lockedSections,
        resume.startedFromScratch,
        activeTab,
        isLoading,
        save,
    ]);

    // Flush on page unload
    useEffect(() => {
        const handleUnload = () => {
            flush({
                rawText: resume.rawText,
                jobDescription: resume.jobDescription,
                currentResume: resume.currentResume,
                optimizedResume: resume.optimizedResume,
                atsScore: resume.atsScore,
                coverLetter: resume.coverLetter,
                validation: resume.validation,
                jdAnalysis: resume.jdAnalysis,
                evidenceMapping: resume.evidenceMapping,
                lockedSections: Array.from(resume.lockedSections),
                startedFromScratch: resume.startedFromScratch,
                activeTab,
            });
        };

        window.addEventListener("beforeunload", handleUnload);
        return () => window.removeEventListener("beforeunload", handleUnload);
    }); // No deps — always use latest state

    // ── Streaming ─────────────────────────────────────────────────
    const { stage, progress, startStreaming } = useStreaming({
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

    // ── Parse uploaded file ───────────────────────────────────────
    const handleParseFile = useCallback(
        async (file: File) => {
            setIsParsing(true);
            try {
                const formData = new FormData();
                formData.append("file", file);
                const res = await fetch("/api/parse", {
                    method: "POST",
                    body: formData,
                });
                if (!res.ok) throw new Error("Failed to parse file");
                const { text } = await res.json();
                resume.setRawText(text);
                toast.success("File parsed — text extracted");
            } catch {
                toast.error("Failed to parse file");
            } finally {
                setIsParsing(false);
            }
        },
        [resume]
    );

    // ── Start from scratch ────────────────────────────────────────
    const handleStartFromScratch = useCallback(() => {
        resume.startFromScratch();
        setActiveTab("job");
        toast.success("Blank resume created — add a job description first");
    }, [resume]);

    // ── Generate ──────────────────────────────────────────────────
    const handleGenerate = useCallback(() => {
        if (!resume.rawText.trim() && !resume.startedFromScratch) {
            toast.error("Please upload or paste your resume first");
            return;
        }
        if (!resume.hasJobDescription) {
            toast.error("Please enter a valid job description (min 20 words)");
            return;
        }

        if (user && !hasGenerationsRemaining(tier, gensUsed)) {
            setPaywallTrigger("You've used your 2 free generations this month.");
            setPaywallFeature("unlimited");
            setShowPaywall(true);
            return;
        }

        const textToSend = resume.startedFromScratch
            ? resume.serializeResume()
            : resume.rawText;

        if (!textToSend.trim()) {
            toast.error("Please fill in your resume details first");
            return;
        }

        setActiveTab("generate");
        startStreaming(textToSend, resume.jobDescription, settings.enhancementTone);
    }, [resume, startStreaming, settings.enhancementTone, user, tier, gensUsed]);

    // ── Enhance from editor ───────────────────────────────────────
    const handleEnhanceFromEditor = useCallback(() => {
        if (!resume.hasJobDescription) {
            toast.error("Please enter a job description first (min 20 words)");
            setActiveTab("job");
            return;
        }

        if (user && !hasGenerationsRemaining(tier, gensUsed)) {
            setPaywallTrigger("You've used your 2 free generations this month.");
            setPaywallFeature("unlimited");
            setShowPaywall(true);
            return;
        }

        const textToSend = resume.serializeResume();
        if (!textToSend.trim()) {
            toast.error("Please fill in your resume details first");
            return;
        }

        setActiveTab("generate");
        startStreaming(textToSend, resume.jobDescription, settings.enhancementTone);
    }, [resume, startStreaming, settings.enhancementTone, user, tier, gensUsed]);

    // ── Start over ────────────────────────────────────────────────
    const handleStartOver = useCallback(async () => {
        setShowStartOverConfirm(false);
        await clear();
        resume.hydrate({
            rawText: "",
            jobDescription: "",
            currentResume: null,
            optimizedResume: null,
            atsScore: null,
            coverLetter: "",
            validation: null,
            jdAnalysis: null,
            evidenceMapping: null,
            activeTab: "upload",
            lockedSections: [],
            startedFromScratch: false,
        });
        setActiveTab("upload");
        toast.success("Workspace cleared — starting fresh");
    }, [clear, resume]);

    // ── Upgrade redirect ──────────────────────────────────────────
    useEffect(() => {
        if (typeof window === "undefined") return;
        const params = new URLSearchParams(window.location.search);
        if (params.get("upgraded") === "true") {
            toast.success("Upgrade successful! Your new features are now active.");
            window.history.replaceState({}, "", "/dashboard");
        }
    }, []);

    const showEditorLayout = activeTab === "ats";

    // ── Loading state ─────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-6 w-6 animate-spin text-accent" />
                    <p className="text-sm text-text-muted">Loading your workspace...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen">
            <Sidebar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                hasResume={resume.hasResume}
                hasOptimized={resume.hasOptimized}
                onStartOver={() => setShowStartOverConfirm(true)}
            />

            <main className="flex flex-1 flex-col overflow-hidden">
                {/* ── Header ──────────────────────────────────────────── */}
                <header className="flex h-14 items-center justify-between border-b border-border px-6">
                    <div className="flex items-center gap-3">
                        <h1 className="text-sm font-semibold text-text-primary">
                            {activeTab === "upload" && "Upload Resume"}
                            {activeTab === "job" && "Job Description"}
                            {activeTab === "generate" && "Generate"}
                            {activeTab === "ats" && "Editor & Analysis"}
                            {activeTab === "cover" && "Cover Letter"}
                            {activeTab === "export" && "Export"}
                        </h1>
                        {isSaving && (
                            <span className="text-[10px] text-text-muted/50">Saving...</span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {showEditorLayout && resume.currentResume && (
                            <>
                                {resume.startedFromScratch && (
                                    <button
                                        onClick={handleEnhanceFromEditor}
                                        className="flex items-center gap-1.5 rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/15"
                                    >
                                        <Sparkles className="h-3.5 w-3.5" />
                                        Enhance with AI
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowRearrange(true)}
                                    className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
                                >
                                    <GripVertical className="h-3.5 w-3.5" />
                                    Rearrange
                                </button>
                                <button
                                    onClick={() => setShowPreview((v) => !v)}
                                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${showPreview
                                        ? "border-accent/40 bg-accent/10 text-accent"
                                        : "border-border text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                                        }`}
                                >
                                    <Eye className="h-3.5 w-3.5" />
                                    Preview
                                </button>
                            </>
                        )}

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

                {/* ── Content ─────────────────────────────────────────── */}
                <div className="flex-1 overflow-hidden">
                    <AnimatePresence mode="wait">
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
                                    We&apos;ll parse it into structured data for AI optimization.
                                    Your original content is preserved — the AI only enhances,
                                    never fabricates.
                                </p>

                                <ResumeUpload
                                    currentText={resume.rawText}
                                    onTextExtracted={resume.setRawText}
                                    onFileAccepted={handleParseFile}
                                />

                                <div className="my-8 flex items-center gap-4">
                                    <div className="flex-1 border-t border-border" />
                                    <span className="text-xs text-text-muted">or</span>
                                    <div className="flex-1 border-t border-border" />
                                </div>

                                <button
                                    onClick={handleStartFromScratch}
                                    className="group flex w-full items-center justify-between rounded-xl border border-dashed border-border bg-surface/50 p-5 text-left transition-all hover:border-accent/40 hover:bg-accent/[0.03]"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-elevated transition-colors group-hover:bg-accent/10">
                                            <PenLine className="h-5 w-5 text-text-muted transition-colors group-hover:text-accent" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-text-primary">
                                                Start from scratch
                                            </p>
                                            <p className="text-xs text-text-muted">
                                                Don&apos;t have a resume? Build one with guided forms
                                            </p>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-text-muted/30 transition-all group-hover:translate-x-1 group-hover:text-accent" />
                                </button>

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
                                {resume.startedFromScratch ? (
                                    <button
                                        onClick={() => setActiveTab("ats")}
                                        disabled={!resume.hasJobDescription}
                                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-semibold text-background transition-all hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <PenLine className="h-4 w-4" />
                                        Start Editing
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleGenerate}
                                        disabled={
                                            !resume.rawText.trim() || !resume.hasJobDescription
                                        }
                                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-semibold text-background transition-all hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <Sparkles className="h-4 w-4" />
                                        Generate ATS-Optimized Resume
                                    </button>
                                )}
                            </motion.div>
                        )}

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

                        {showEditorLayout && resume.currentResume && (
                            <motion.div
                                key="ats"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="flex h-full"
                            >
                                <div className="relative flex-1 overflow-y-auto">
                                    <ResumeEditor
                                        resume={resume.currentResume}
                                        onChange={(r) => resume.updateCurrentResume(() => r)}
                                        lockedSections={resume.lockedSections}
                                        onToggleLock={resume.toggleLock}
                                        jobDescription={resume.jobDescription}
                                    />

                                    {showPreview && (
                                        <FloatingPreview
                                            resume={resume.currentResume}
                                            font={settings.resumeFont}
                                            onClose={() => setShowPreview(false)}
                                        />
                                    )}
                                </div>

                                <div className="w-80 overflow-y-auto border-l border-border p-4">
                                    {resume.atsScore && (
                                        <ScorePanel score={resume.atsScore} />
                                    )}
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

                        {activeTab === "cover" && (
                            <motion.div
                                key="cover"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="mx-auto max-w-3xl p-8"
                            >
                                {canUseFeature(tier, "cover_letter") ||
                                    resume.coverLetter ? (
                                    <>
                                        <h2 className="mb-2 font-display text-2xl text-text-primary">
                                            Cover Letter
                                        </h2>
                                        <p className="mb-6 text-sm text-text-secondary">
                                            AI-generated, tailored to the job description. Edit freely.
                                        </p>
                                        <textarea
                                            value={resume.coverLetter}
                                            onChange={(e) =>
                                                resume.setCoverLetter(e.target.value)
                                            }
                                            className="h-[60vh] w-full resize-none rounded-xl border border-border bg-surface-elevated px-6 py-4 text-sm leading-relaxed text-text-primary focus:border-accent/40 focus:outline-none"
                                        />
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                        <p className="text-sm text-text-secondary">
                                            Cover letter generation is a Pro feature.
                                        </p>
                                        <button
                                            onClick={() => {
                                                setPaywallTrigger(
                                                    "Cover letter generation requires Pro or Lifetime plan."
                                                );
                                                setPaywallFeature("cover_letter");
                                                setShowPaywall(true);
                                            }}
                                            className="mt-4 rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-background hover:bg-accent-hover"
                                        >
                                            Upgrade to unlock
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === "export" && resume.currentResume && (
                            <motion.div
                                key="export"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="flex-1 overflow-y-auto"
                            >
                                <ExportPanel
                                    resume={resume.currentResume}
                                    coverLetter={resume.coverLetter}
                                />
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </main>

            {/* ── Modals ─────────────────────────────────────────────── */}
            {showExport && resume.currentResume && (
                <ExportModal
                    resume={resume.currentResume}
                    coverLetter={resume.coverLetter}
                    onClose={() => setShowExport(false)}
                />
            )}

            {showRearrange && resume.currentResume && (
                <RearrangeModal
                    isOpen={showRearrange}
                    order={resume.sectionOrder}
                    onReorder={resume.setSectionOrder}
                    onClose={() => setShowRearrange(false)}
                />
            )}

            {showPaywall && (
                <Paywall
                    trigger={paywallTrigger}
                    feature={paywallFeature}
                    onClose={() => setShowPaywall(false)}
                />
            )}

            {/* Start Over confirmation */}
            {showStartOverConfirm && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 z-50 flex items-center justify-center"
                >
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowStartOverConfirm(false)}
                    />
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-2xl"
                    >
                        <h3 className="text-sm font-semibold text-text-primary">
                            Start over?
                        </h3>
                        <p className="mt-2 text-xs text-text-secondary">
                            This will clear all your resume data, edits, and scores. This
                            cannot be undone.
                        </p>
                        <div className="mt-4 flex gap-2">
                            <button
                                onClick={handleStartOver}
                                className="rounded-lg bg-error px-4 py-2 text-xs font-medium text-white hover:bg-error/90"
                            >
                                Clear everything
                            </button>
                            <button
                                onClick={() => setShowStartOverConfirm(false)}
                                className="rounded-lg px-4 py-2 text-xs font-medium text-text-muted hover:bg-surface-hover hover:text-text-secondary"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}
