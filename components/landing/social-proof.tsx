"use client";

import { motion } from "framer-motion";
import { Star, Users, FileText, TrendingUp } from "lucide-react";

const metrics = [
    { icon: Users, value: "12,000+", label: "Resumes optimized" },
    { icon: TrendingUp, value: "94%", label: "ATS pass rate" },
    { icon: FileText, value: "47%", label: "More interviews" },
    { icon: Star, value: "4.9/5", label: "User satisfaction" },
];

export function SocialProof() {
    return (
        <section className="relative px-6 py-24">
            <div className="glow-line" style={{ top: 0 }} />

            <div className="relative z-10 mx-auto max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.5 }}
                    className="mb-14 text-center"
                >
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent/70">
                        Trusted
                    </p>
                    <h2 className="font-display text-3xl text-text-primary sm:text-4xl">
                        Numbers that <span className="text-gradient-accent italic">speak</span>
                    </h2>
                </motion.div>

                <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
                    {metrics.map((metric, i) => (
                        <motion.div
                            key={metric.label}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.08 }}
                            className="group rounded-2xl border border-white/[0.04] bg-white/[0.01] p-6 text-center transition-all hover:border-white/[0.08] hover:bg-white/[0.02]"
                        >
                            <metric.icon className="mx-auto mb-3 h-5 w-5 text-accent/40 transition-colors group-hover:text-accent/70" />
                            <div className="font-display text-3xl text-text-primary sm:text-4xl">
                                {metric.value}
                            </div>
                            <div className="mt-2 text-xs text-text-muted">{metric.label}</div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
