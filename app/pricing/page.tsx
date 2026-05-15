"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Check, X, Zap, Crown, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { cn } from "@/lib/utils";
import { TIERS } from "@/lib/subscription";

const COMPARISON = [
    { name: "Resume generations", free: "2/month", pro: "Unlimited", career: "Unlimited" },
    { name: "ATS score", free: "Basic", pro: "Full breakdown", career: "Full breakdown" },
    { name: "Cover letter", free: false, pro: true, career: true },
    { name: "Bullet regeneration", free: false, pro: true, career: true },
    { name: "PDF export", free: "Watermark", pro: "Clean", career: "Clean" },
    { name: "DOCX export", free: false, pro: true, career: true },
    { name: "Resume profiles", free: "1", pro: "5", career: "Unlimited" },
    { name: "Version history", free: false, pro: true, career: "Unlimited" },
    { name: "Enhancement tones", free: "Balanced only", pro: "All 3", career: "All 3" },
    { name: "LinkedIn optimization", free: false, pro: false, career: true },
    { name: "Interview prep", free: false, pro: false, career: true },
    { name: "Priority processing", free: false, pro: false, career: true },
    { name: "API access", free: false, pro: false, career: true },
    { name: "Priority support", free: false, pro: false, career: true },
];

export default function PricingPage() {
    const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

    const plans = [
        { tier: "free" as const, icon: null, popular: false },
        { tier: "pro" as const, icon: Zap, popular: true },
        { tier: "career" as const, icon: Crown, popular: false },
    ];

    return (
        <main className="noise relative min-h-screen">
            <Navbar />
            <div className="mx-auto max-w-6xl px-6 pb-20 pt-28">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 text-center"
                >
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent/70">Pricing</p>
                    <h1 className="font-display text-3xl text-text-primary sm:text-4xl md:text-5xl">
                        Simple, transparent <span className="text-gradient-accent italic">pricing</span>
                    </h1>
                    <p className="mx-auto mt-4 max-w-lg text-base text-text-secondary">
                        Start free. Upgrade when you need more. Cancel anytime.
                    </p>
                </motion.div>

                {/* Billing toggle */}
                <div className="mb-10 flex justify-center">
                    <div className="flex items-center gap-3 rounded-xl bg-surface-elevated p-1">
                        {(["monthly", "yearly"] as const).map((b) => (
                            <button
                                key={b}
                                onClick={() => setBilling(b)}
                                className={cn(
                                    "rounded-lg px-5 py-2 text-sm font-medium transition-all",
                                    billing === b ? "bg-surface text-text-primary shadow-sm" : "text-text-muted"
                                )}
                            >
                                {b === "monthly" ? "Monthly" : (
                                    <>
                                        Yearly
                                        <span className="ml-1.5 rounded-md bg-emerald/10 px-1.5 py-0.5 text-[10px] text-emerald">Save 30%</span>
                                    </>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Plans */}
                <div className="mb-20 grid gap-6 lg:grid-cols-3">
                    {plans.map(({ tier, icon: Icon, popular }, i) => {
                        const config = TIERS[tier];
                        const price = tier === "free" ? 0 : config.price[billing];

                        return (
                            <motion.div
                                key={tier}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={cn(
                                    "relative rounded-2xl border p-8 transition-all",
                                    popular
                                        ? "border-accent/40 bg-accent/[0.03] shadow-[0_0_40px_-10px_rgba(14,165,233,0.2)]"
                                        : "border-border bg-surface"
                                )}
                            >
                                {popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <span className="rounded-full bg-accent px-4 py-1 text-xs font-semibold text-background">Most Popular</span>
                                    </div>
                                )}

                                <div className="mb-6">
                                    <div className="flex items-center gap-2">
                                        {Icon && <Icon className={cn("h-5 w-5", tier === "career" ? "text-amber-400" : "text-accent")} />}
                                        <h3 className="text-lg font-semibold text-text-primary">{config.name}</h3>
                                    </div>
                                    <div className="mt-3">
                                        <span className="font-display text-4xl text-text-primary">{price === 0 ? "Free" : `$${price}`}</span>
                                        {price > 0 && <span className="text-sm text-text-muted">/{billing === "monthly" ? "mo" : "yr"}</span>}
                                    </div>
                                    {price > 0 && billing === "yearly" && (
                                        <p className="mt-1 text-xs text-emerald">${Math.round(price / 12)}/month billed annually</p>
                                    )}
                                </div>

                                <ul className="mb-8 space-y-3">
                                    {config.features.map((f) => (
                                        <li key={f} className="flex items-start gap-2.5 text-sm text-text-secondary">
                                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald" />
                                            {f}
                                        </li>
                                    ))}
                                    {config.limitations.map((l) => (
                                        <li key={l} className="flex items-start gap-2.5 text-sm text-text-muted/60">
                                            <X className="mt-0.5 h-4 w-4 shrink-0" />
                                            {l}
                                        </li>
                                    ))}
                                </ul>

                                {tier === "free" ? (
                                    <Link href="/dashboard" className="flex w-full items-center justify-center rounded-xl border border-border py-3 text-sm font-semibold text-text-secondary hover:bg-surface-hover hover:text-text-primary">
                                        Get Started Free
                                    </Link>
                                ) : (
                                    <Link href="/dashboard" className={cn(
                                        "flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all",
                                        popular ? "bg-accent text-background hover:bg-accent-hover" : "border border-border text-text-primary hover:bg-surface-hover"
                                    )}>
                                        Upgrade to {config.name}
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Comparison table */}
                <div>
                    <h2 className="mb-8 text-center font-display text-2xl text-text-primary">Compare all features</h2>
                    <div className="overflow-hidden rounded-xl border border-border">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border bg-surface">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted">Feature</th>
                                    {["Free", "Pro", "Career"].map((t) => (
                                        <th key={t} className={cn("px-6 py-4 text-center text-xs font-semibold", t === "Pro" ? "text-accent" : "text-text-muted")}>
                                            {t}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {COMPARISON.map((row) => (
                                    <tr key={row.name} className="border-b border-border last:border-0">
                                        <td className="px-6 py-3 text-sm text-text-secondary">{row.name}</td>
                                        {(["free", "pro", "career"] as const).map((tier) => {
                                            const val = row[tier];
                                            return (
                                                <td key={tier} className="px-6 py-3 text-center text-sm">
                                                    {val === true ? (
                                                        <Check className="mx-auto h-4 w-4 text-emerald" />
                                                    ) : val === false ? (
                                                        <X className="mx-auto h-4 w-4 text-text-muted/30" />
                                                    ) : (
                                                        <span className="text-text-secondary">{val}</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
