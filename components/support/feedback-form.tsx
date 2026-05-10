"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Lightbulb,
    Bug,
    TrendingUp,
    MessageSquare,
    Send,
    CheckCircle2,
    Loader2,
    AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type FeedbackType = "feature" | "bug" | "improvement" | "other";

const feedbackOptions: {
    type: FeedbackType;
    label: string;
    description: string;
    icon: React.ElementType;
    color: string;
}[] = [
        {
            type: "feature",
            label: "Request a Feature",
            description: "Suggest a new feature or capability",
            icon: Lightbulb,
            color: "text-amber-400 bg-amber-400/10",
        },
        {
            type: "bug",
            label: "Report a Bug",
            description: "Something isn't working correctly",
            icon: Bug,
            color: "text-red-400 bg-red-400/10",
        },
        {
            type: "improvement",
            label: "Suggest Improvement",
            description: "Improve an existing feature or workflow",
            icon: TrendingUp,
            color: "text-sky-400 bg-sky-400/10",
        },
        {
            type: "other",
            label: "General Feedback",
            description: "Share thoughts, questions, or praise",
            icon: MessageSquare,
            color: "text-violet-400 bg-violet-400/10",
        },
    ];

export function FeedbackForm() {
    const [type, setType] = useState<FeedbackType | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [steps, setSteps] = useState("");
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!type || !title.trim() || !description.trim()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const res = await fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type,
                    title: title.trim(),
                    description: description.trim(),
                    steps: steps.trim() || undefined,
                    email: email.trim() || undefined,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to submit feedback");
            }

            setSubmitted(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    const reset = () => {
        setType(null);
        setTitle("");
        setDescription("");
        setSteps("");
        setEmail("");
        setSubmitted(false);
        setError(null);
    };

    if (submitted) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto max-w-lg py-20 text-center"
            >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald/10">
                    <CheckCircle2 className="h-7 w-7 text-emerald" />
                </div>
                <h2 className="font-display text-2xl text-text-primary">
                    Feedback received
                </h2>
                <p className="mt-3 text-sm text-text-secondary">
                    Thank you for helping us improve ResumeForge. We read every submission
                    and will get back to you if you provided an email.
                </p>
                <button
                    onClick={reset}
                    className="mt-8 rounded-xl border border-border px-6 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
                >
                    Submit another
                </button>
            </motion.div>
        );
    }

    return (
        <div className="mx-auto max-w-2xl">
            <AnimatePresence mode="wait">
                {/* Step 1: Choose type */}
                {!type && (
                    <motion.div
                        key="choose"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                    >
                        <h2 className="mb-2 font-display text-2xl text-text-primary">
                            What would you like to share?
                        </h2>
                        <p className="mb-8 text-sm text-text-secondary">
                            Choose a category to get started.
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {feedbackOptions.map((option) => (
                                <button
                                    key={option.type}
                                    onClick={() => setType(option.type)}
                                    className="group flex items-start gap-4 rounded-xl border border-border bg-surface p-5 text-left transition-all hover:border-white/[0.08] hover:bg-surface-elevated"
                                >
                                    <div
                                        className={cn(
                                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                                            option.color
                                        )}
                                    >
                                        <option.icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-text-primary">
                                            {option.label}
                                        </p>
                                        <p className="mt-0.5 text-xs text-text-muted">
                                            {option.description}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Step 2: Fill form */}
                {type && (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                    >
                        <button
                            onClick={() => setType(null)}
                            className="mb-6 text-sm text-text-muted transition-colors hover:text-text-secondary"
                        >
                            ← Back to categories
                        </button>

                        <div className="mb-6 flex items-center gap-3">
                            {(() => {
                                const opt = feedbackOptions.find((o) => o.type === type)!;
                                return (
                                    <>
                                        <div
                                            className={cn(
                                                "flex h-10 w-10 items-center justify-center rounded-xl",
                                                opt.color
                                            )}
                                        >
                                            <opt.icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-semibold text-text-primary">
                                                {opt.label}
                                            </h2>
                                            <p className="text-xs text-text-muted">
                                                {opt.description}
                                            </p>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-text-muted">
                                    Title <span className="text-error">*</span>
                                </label>
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder={
                                        type === "feature"
                                            ? "e.g., Dark mode toggle for the editor"
                                            : type === "bug"
                                                ? "e.g., PDF export cuts off last bullet"
                                                : type === "improvement"
                                                    ? "e.g., Make the ATS score more detailed"
                                                    : "e.g., Love the platform!"
                                    }
                                    required
                                    className="w-full rounded-xl border border-border bg-surface-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/20"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-text-muted">
                                    Description <span className="text-error">*</span>
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder={
                                        type === "feature"
                                            ? "Describe the feature you'd like. What problem would it solve for you?"
                                            : type === "bug"
                                                ? "What happened? What did you expect to happen instead?"
                                                : "Share your thoughts in as much detail as you'd like."
                                    }
                                    required
                                    rows={5}
                                    className="w-full resize-none rounded-xl border border-border bg-surface-elevated px-4 py-3 text-sm leading-relaxed text-text-primary placeholder:text-text-muted/50 focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/20"
                                />
                            </div>

                            {type === "bug" && (
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-text-muted">
                                        Steps to Reproduce
                                    </label>
                                    <textarea
                                        value={steps}
                                        onChange={(e) => setSteps(e.target.value)}
                                        placeholder={"1. Go to...\n2. Click on...\n3. See error..."}
                                        rows={4}
                                        className="w-full resize-none rounded-xl border border-border bg-surface-elevated px-4 py-3 text-sm leading-relaxed text-text-primary placeholder:text-text-muted/50 focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/20"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-text-muted">
                                    Your Email{" "}
                                    <span className="text-text-muted/50">(optional)</span>
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full rounded-xl border border-border bg-surface-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/20"
                                />
                                <p className="mt-1.5 text-[11px] text-text-muted/50">
                                    Only if you'd like us to follow up with you.
                                </p>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 rounded-xl border border-error/20 bg-error/5 px-4 py-3">
                                    <AlertCircle className="h-4 w-4 text-error" />
                                    <p className="text-xs text-error">{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting || !title.trim() || !description.trim()}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3.5 text-sm font-semibold text-background transition-all hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4" />
                                        Submit Feedback
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
