"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function CTA() {
    return (
        <section className="relative overflow-hidden px-6 py-32">
            {/* Background glow */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[0.06] blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="relative z-10 mx-auto max-w-2xl text-center"
            >
                <h2 className="font-display text-3xl text-text-primary sm:text-4xl md:text-5xl">
                    Stop guessing if your resume{" "}
                    <span className="text-gradient-accent italic">passes the ATS</span>
                </h2>
                <p className="mx-auto mt-5 max-w-lg text-base text-text-secondary/70">
                    Join thousands of professionals who landed more interviews with
                    truth-first AI optimization.
                </p>

                <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                    <Link
                        href="/dashboard"
                        className="group flex items-center gap-2 rounded-2xl bg-accent px-8 py-4 text-sm font-semibold text-background shadow-[0_0_50px_-10px_rgba(14,165,233,0.4)] transition-all hover:bg-accent-hover hover:shadow-[0_0_70px_-10px_rgba(14,165,233,0.5)]"
                    >
                        <Sparkles className="h-4 w-4" />
                        Start for Free
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                </div>

                <p className="mt-6 text-xs text-text-muted/50">
                    No credit card required · Anonymous by default · Export anytime
                </p>
            </motion.div>
        </section>
    );
}
