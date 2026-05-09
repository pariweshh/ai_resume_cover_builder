"use client";

import { motion } from "framer-motion";
import {
    FileSearch,
    Target,
    GitMerge,
    PenTool,
    BarChart3,
    Mail,
    ShieldCheck,
} from "lucide-react";

const stages = [
    {
        icon: FileSearch,
        step: "01",
        title: "Parse",
        description:
            "Extract structured data from your resume — PDF, DOCX, or plain text.",
    },
    {
        icon: Target,
        step: "02",
        title: "Analyze",
        description:
            "Identify ATS keywords, required skills, and seniority expectations from the JD.",
    },
    {
        icon: GitMerge,
        step: "03",
        title: "Map Evidence",
        description:
            "Honest matching — supported skills are enhanced, gaps are flagged, not fabricated.",
    },
    {
        icon: PenTool,
        step: "04",
        title: "Enhance",
        description:
            "Rewrite bullets with strong action verbs, better clarity, and recruiter-optimized phrasing.",
    },
    {
        icon: BarChart3,
        step: "05",
        title: "Score",
        description:
            "Comprehensive ATS scoring across keywords, formatting, readability, and impact.",
    },
    {
        icon: Mail,
        step: "06",
        title: "Cover Letter",
        description:
            "Generate a tailored, human-sounding cover letter aligned to the specific role.",
    },
    {
        icon: ShieldCheck,
        step: "07",
        title: "Validate",
        description:
            "Anti-hallucination check ensures every claim is backed by your original resume.",
    },
];

export function HowItWorks() {
    return (
        <section id="how-it-works" className="relative px-6 py-32">
            <div className="relative z-10 mx-auto max-w-5xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="mb-20 text-center"
                >
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent/70">
                        Pipeline
                    </p>
                    <h2 className="font-display text-3xl text-text-primary sm:text-4xl md:text-5xl">
                        Seven stages,{" "}
                        <span className="text-gradient-accent italic">zero shortcuts</span>
                    </h2>
                    <p className="mx-auto mt-5 max-w-xl text-base text-text-secondary/70">
                        Not a single prompt. A production-grade orchestration pipeline
                        where each stage has a specialized job.
                    </p>
                </motion.div>

                <div className="relative">
                    <div className="space-y-4">
                        {stages.map((stage, i) => (
                            <motion.div
                                key={stage.step}
                                initial={{ opacity: 0, x: -16 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-40px" }}
                                transition={{ duration: 0.5, delay: i * 0.06 }}
                                className="group relative flex items-center gap-5 rounded-2xl border border-white/[0.04] bg-white/[0.01] p-6 transition-all duration-300 hover:border-white/[0.08] hover:bg-white/[0.02]"
                            >
                                <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06] transition-all duration-300 group-hover:ring-accent/20 group-hover:shadow-[0_0_24px_-6px_rgba(14,165,233,0.2)]">
                                    <stage.icon className="h-5 w-5 text-text-muted transition-colors group-hover:text-accent" />
                                </div>

                                <div className="flex-1">
                                    <div className="mb-1 flex items-center gap-3">
                                        <span className="font-mono text-[11px] text-accent/50">
                                            {stage.step}
                                        </span>
                                        <h3 className="text-[15px] font-semibold text-text-primary">
                                            {stage.title}
                                        </h3>
                                    </div>
                                    <p className="text-[13px] leading-relaxed text-text-secondary/70">
                                        {stage.description}
                                    </p>
                                </div>

                                {/* Connector dot between cards */}
                                {i < stages.length - 1 && (
                                    <div
                                        className="absolute -bottom-4 left-[3.4rem] h-3 w-px"
                                        style={{
                                            background:
                                                "linear-gradient(to bottom, rgba(14,165,233,0.15), transparent)",
                                        }}
                                    />
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
