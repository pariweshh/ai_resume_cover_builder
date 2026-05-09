"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Shield, Zap, Target, Sparkles } from "lucide-react";

const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
};

const item = {
    hidden: { opacity: 0, y: 24 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
    },
} as const;

export function Hero() {
    return (
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-16">
            {/* ── Gradient Mesh Background ──────────────────────────── */}
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    background: `
            radial-gradient(ellipse 700px 500px at 15% 20%, rgba(14, 165, 233, 0.10) 0%, transparent 70%),
            radial-gradient(ellipse 600px 600px at 80% 10%, rgba(139, 92, 246, 0.07) 0%, transparent 60%),
            radial-gradient(ellipse 500px 400px at 60% 75%, rgba(14, 165, 233, 0.06) 0%, transparent 60%),
            radial-gradient(ellipse 400px 500px at 20% 85%, rgba(245, 158, 11, 0.04) 0%, transparent 60%)
          `,
                    animation: "meshDrift 25s ease-in-out infinite alternate",
                }}
            />

            {/* ── Grid Pattern ──────────────────────────────────────── */}
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    backgroundImage: `
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
          `,
                    backgroundSize: "64px 64px",
                    maskImage:
                        "radial-gradient(ellipse 80% 60% at 50% 30%, black 20%, transparent 70%)",
                    WebkitMaskImage:
                        "radial-gradient(ellipse 80% 60% at 50% 30%, black 20%, transparent 70%)",
                }}
            />

            {/* ── Floating Glow Orbs ────────────────────────────────── */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {/* Orb 1 — blue, top-left */}
                <div
                    className="absolute rounded-full"
                    style={{
                        width: 550,
                        height: 550,
                        background: "rgba(14, 165, 233, 0.12)",
                        filter: "blur(100px)",
                        top: "-10%",
                        left: "15%",
                        animation: "orbFloat 20s ease-in-out infinite",
                    }}
                />
                {/* Orb 2 — purple, top-right */}
                <div
                    className="absolute rounded-full"
                    style={{
                        width: 450,
                        height: 450,
                        background: "rgba(139, 92, 246, 0.09)",
                        filter: "blur(90px)",
                        top: "5%",
                        right: "5%",
                        animation: "orbFloat 24s ease-in-out infinite",
                        animationDelay: "-8s",
                    }}
                />
                {/* Orb 3 — blue, bottom-center */}
                <div
                    className="absolute rounded-full"
                    style={{
                        width: 400,
                        height: 400,
                        background: "rgba(14, 165, 233, 0.07)",
                        filter: "blur(80px)",
                        bottom: "10%",
                        left: "35%",
                        animation: "orbFloat 22s ease-in-out infinite",
                        animationDelay: "-15s",
                    }}
                />
                {/* Orb 4 — warm, bottom-left */}
                <div
                    className="absolute rounded-full"
                    style={{
                        width: 300,
                        height: 300,
                        background: "rgba(245, 158, 11, 0.05)",
                        filter: "blur(70px)",
                        bottom: "20%",
                        left: "5%",
                        animation: "orbFloat 18s ease-in-out infinite",
                        animationDelay: "-5s",
                    }}
                />
            </div>

            {/* ── Horizontal Glow Line ──────────────────────────────── */}
            <div
                className="pointer-events-none absolute left-0 right-0"
                style={{
                    top: "12%",
                    height: 1,
                    background:
                        "linear-gradient(90deg, transparent 0%, rgba(14,165,233,0.25) 20%, rgba(14,165,233,0.5) 50%, rgba(14,165,233,0.25) 80%, transparent 100%)",
                    opacity: 0.6,
                }}
            />

            {/* ── Vignette ──────────────────────────────────────────── */}
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        "radial-gradient(ellipse 70% 60% at 50% 40%, transparent 40%, rgba(5,5,5,0.6) 100%)",
                }}
            />

            {/* ── Content ───────────────────────────────────────────── */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="relative z-10 mx-auto max-w-4xl text-center"
            >
                {/* Badge */}
                <motion.div variants={item} className="mb-8 flex justify-center">
                    <div className="group inline-flex items-center gap-2.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-4 py-1.5 backdrop-blur-sm transition-all hover:border-accent/20 hover:bg-accent/[0.04]">
                        <span className="relative flex h-2 w-2">
                            <span
                                className="absolute inline-flex h-full w-full rounded-full bg-emerald opacity-75"
                                style={{ animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite" }}
                            />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald" />
                        </span>
                        <span className="text-xs font-medium text-text-secondary">
                            Truth-first AI — Zero hallucinations guaranteed
                        </span>
                    </div>
                </motion.div>

                {/* Heading */}
                <motion.h1
                    variants={item}
                    className="font-display text-5xl leading-[1.05] tracking-tight text-text-primary sm:text-6xl md:text-7xl lg:text-[5.5rem]"
                >
                    Your resume,{" "}
                    <span className="relative inline-block">
                        <span
                            className="italic"
                            style={{
                                background:
                                    "linear-gradient(135deg, #0ea5e9 0%, #38bdf8 40%, #8b5cf6 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                            }}
                        >
                            optimized
                        </span>
                        <motion.span
                            className="absolute -bottom-1 left-0 right-0"
                            style={{
                                height: 1,
                                background:
                                    "linear-gradient(90deg, transparent, rgba(14,165,233,0.5), rgba(139,92,246,0.3), transparent)",
                            }}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
                        />
                    </span>
                    <br />
                    for every ATS
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    variants={item}
                    className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-text-secondary/80 sm:text-xl"
                >
                    AI-powered resume enhancement that recruiters actually trust.
                    Multi-stage pipeline. Strict truthfulness. ATS-optimized formatting.
                </motion.p>

                {/* CTAs */}
                <motion.div
                    variants={item}
                    className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
                >
                    <Link
                        href="/dashboard"
                        className="group flex items-center gap-2 rounded-2xl bg-accent px-8 py-4 text-sm font-semibold text-background transition-all hover:bg-accent-hover"
                        style={{
                            boxShadow: "0 0 50px -10px rgba(14,165,233,0.4)",
                        }}
                    >
                        <Sparkles className="h-4 w-4" />
                        Start Building
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                    <Link
                        href="#how-it-works"
                        className="rounded-2xl border border-white/[0.08] bg-white/[0.02] px-8 py-4 text-sm font-medium text-text-secondary backdrop-blur-sm transition-all hover:border-white/[0.15] hover:bg-white/[0.04] hover:text-text-primary"
                    >
                        See How It Works
                    </Link>
                </motion.div>

                {/* Stats */}
                <motion.div
                    variants={item}
                    className="mx-auto mt-24 grid max-w-lg grid-cols-3 gap-6"
                >
                    {[
                        { icon: Target, label: "ATS Match Rate", value: "94%" },
                        { icon: Zap, label: "Generation Time", value: "<30s" },
                        { icon: Shield, label: "Hallucination Rate", value: "0%" },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className="group rounded-2xl border border-white/[0.04] bg-white/[0.015] p-4 transition-all hover:border-white/[0.08] hover:bg-white/[0.03]"
                        >
                            <stat.icon className="mx-auto mb-2.5 h-4 w-4 text-accent/50 transition-colors group-hover:text-accent/80" />
                            <div className="font-display text-2xl text-text-primary sm:text-3xl">
                                {stat.value}
                            </div>
                            <div className="mt-1 text-[11px] text-text-muted">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    className="mt-20 flex flex-col items-center gap-2"
                >
                    <span className="text-[11px] uppercase tracking-widest text-text-muted/50">
                        Scroll
                    </span>
                    <motion.div
                        animate={{ y: [0, 6, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="h-8 w-px"
                        style={{
                            background:
                                "linear-gradient(to bottom, rgba(82,82,91,0.4), transparent)",
                        }}
                    />
                </motion.div>
            </motion.div>

            {/* ── Keyframes injected once ───────────────────────────── */}
            <style>{`
        @keyframes meshDrift {
          0%   { transform: translate(0, 0) scale(1); }
          33%  { transform: translate(2%, -1%) scale(1.02); }
          66%  { transform: translate(-1%, 2%) scale(0.98); }
          100% { transform: translate(1%, -2%) scale(1.01); }
        }
        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25%      { transform: translate(30px, -20px) scale(1.05); }
          50%      { transform: translate(-20px, 30px) scale(0.95); }
          75%      { transform: translate(20px, 20px) scale(1.02); }
        }
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
        </section>
    );
}
