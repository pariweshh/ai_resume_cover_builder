"use client";

import { motion } from "framer-motion";
import {
    Scan,
    Brain,
    FileCheck,
    ShieldCheck,
    Layers,
    Pen,
} from "lucide-react";

const features = [
    {
        icon: Scan,
        title: "Multi-Stage AI Pipeline",
        description:
            "Seven distinct stages from parsing to validation. Each stage is optimized for a specific task — not one monolithic prompt.",
        accent: "from-sky-500/20 to-blue-600/20",
    },
    {
        icon: Brain,
        title: "Evidence-Based Enhancement",
        description:
            "AI maps job requirements against your actual experience. Unsupported keywords are rejected, not fabricated.",
        accent: "from-violet-500/20 to-purple-600/20",
    },
    {
        icon: ShieldCheck,
        title: "Anti-Hallucination Engine",
        description:
            "Dedicated validation layer detects fabricated claims, invented metrics, and unsupported technologies before output.",
        accent: "from-emerald-500/20 to-green-600/20",
    },
    {
        icon: FileCheck,
        title: "ATS Score Dashboard",
        description:
            "Real-time scoring across keyword match, formatting, readability, impact, and completeness with actionable suggestions.",
        accent: "from-amber-500/20 to-orange-600/20",
    },
    {
        icon: Pen,
        title: "Inline Editing",
        description:
            "Edit any section, regenerate individual bullets, compare original vs optimized, and lock sections you love.",
        accent: "from-pink-500/20 to-rose-600/20",
    },
    {
        icon: Layers,
        title: "ATS-Safe Export",
        description:
            "Pixel-perfect PDF and DOCX export with single-column layout, no graphics, no tables — pure ATS compatibility.",
        accent: "from-cyan-500/20 to-teal-600/20",
    },
];

export function Features() {
    return (
        <section id="features" className="relative px-6 py-32">
            <div className="glow-line" style={{ top: 0 }} />

            <div className="relative z-10 mx-auto max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="mb-20 text-center"
                >
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent/70">
                        Features
                    </p>
                    <h2 className="font-display text-3xl text-text-primary sm:text-4xl md:text-5xl">
                        Built for <span className="text-gradient-accent italic">serious</span> candidates
                    </h2>
                    <p className="mx-auto mt-5 max-w-xl text-base text-text-secondary/70">
                        Every feature is designed around one principle: help you get
                        interviews without compromising integrity.
                    </p>
                </motion.div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, i) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-60px" }}
                            transition={{ duration: 0.5, delay: i * 0.06 }}
                            className="group relative overflow-hidden rounded-2xl border border-white/[0.04] bg-white/[0.01] p-7 transition-all duration-500 hover:border-white/[0.08] hover:bg-white/[0.025]"
                        >
                            {/* Gradient glow on hover */}
                            <div
                                className={`absolute -top-24 -right-24 h-48 w-48 rounded-full bg-gradient-to-br ${feature.accent} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100`}
                            />

                            <div className="relative z-10">
                                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.04] ring-1 ring-white/[0.06] transition-all duration-300 group-hover:ring-accent/20 group-hover:shadow-[0_0_20px_-6px_rgba(14,165,233,0.2)]">
                                    <feature.icon className="h-5 w-5 text-text-secondary transition-colors group-hover:text-accent" />
                                </div>
                                <h3 className="mb-2.5 text-[15px] font-semibold text-text-primary">
                                    {feature.title}
                                </h3>
                                <p className="text-[13px] leading-relaxed text-text-secondary/70">
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
