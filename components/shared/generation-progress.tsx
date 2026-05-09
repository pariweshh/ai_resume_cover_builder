"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    FileSearch,
    Target,
    GitMerge,
    PenTool,
    BarChart3,
    Mail,
    ShieldCheck,
    CheckCircle2,
    Loader2,
    AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PIPELINE_STAGES } from "@/lib/constants";
import type { PipelineStage } from "@/types";

const stageIcons: Record<PipelineStage, React.ElementType> = {
    idle: Loader2,
    parsing: FileSearch,
    analyzing: Target,
    mapping: GitMerge,
    enhancing: PenTool,
    scoring: BarChart3,
    "cover-letter": Mail,
    validating: ShieldCheck,
    complete: CheckCircle2,
    error: AlertCircle,
};

const stageOrder: PipelineStage[] = [
    "parsing",
    "analyzing",
    "mapping",
    "enhancing",
    "scoring",
    "cover-letter",
    "validating",
];

type GenerationProgressProps = {
    currentStage: PipelineStage;
    progress: number;
};

export function GenerationProgress({
    currentStage,
    progress,
}: GenerationProgressProps) {
    const currentIndex = stageOrder.indexOf(currentStage);

    return (
        <div className="mx-auto max-w-md space-y-6 py-8">
            <div className="text-center">
                <h3 className="font-display text-xl text-text-primary">
                    Generating your optimized resume
                </h3>
                <p className="mt-1 text-sm text-text-secondary">
                    {PIPELINE_STAGES[currentStage]?.label || "Processing..."}
                </p>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-elevated">
                <motion.div
                    className="h-full rounded-full bg-accent"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                />
            </div>

            {/* Stage list */}
            <div className="space-y-1">
                {stageOrder.map((stage, i) => {
                    const Icon = stageIcons[stage];
                    const isComplete = i < currentIndex || currentStage === "complete";
                    const isCurrent =
                        stage === currentStage && currentStage !== "complete";
                    const isPending = i > currentIndex && currentStage !== "complete";

                    return (
                        <motion.div
                            key={stage}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                                isComplete && "text-emerald",
                                isCurrent && "bg-accent/5 text-accent",
                                isPending && "text-text-muted/40"
                            )}
                        >
                            <div
                                className={cn(
                                    "flex h-6 w-6 items-center justify-center rounded-full",
                                    isComplete && "bg-emerald/10",
                                    isCurrent && "bg-accent/10",
                                    isPending && "bg-surface-elevated"
                                )}
                            >
                                {isComplete ? (
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                ) : isCurrent ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Icon className="h-3.5 w-3.5" />
                                )}
                            </div>
                            <span className="font-medium">
                                {PIPELINE_STAGES[stage]?.label}
                            </span>
                            <AnimatePresence>
                                {isComplete && (
                                    <motion.span
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="ml-auto text-xs text-emerald/60"
                                    >
                                        Done
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
