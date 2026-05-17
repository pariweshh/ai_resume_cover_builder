"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Zap, Crown, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { TIERS, type Tier } from "@/lib/subscription";

type Props = {
    trigger: string;
    feature?: string;
    onClose: () => void;
};

const FEATURE_LABELS: Record<string, string> = {
    cover_letter: "Cover Letter Generation",
    regenerate: "Bullet Regeneration",
    docx_export: "DOCX Export",
    unlimited: "Unlimited Generations",
    multiple_profiles: "Multiple Resume Profiles",
    interview_prep: "Interview Prep",
};

const PRICE_ID_MAP: Record<string, string> = {
    pro_monthly: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID ?? "",
    pro_yearly: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID ?? "",
    lifetime: process.env.NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID ?? "",
};

export function Paywall({ trigger, feature, onClose }: Props) {
    const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
    const [loading, setLoading] = useState<Tier | null>(null);

    const handleUpgrade = useCallback(
        async (tier: Tier) => {
            setLoading(tier);
            try {
                const priceId = PRICE_ID_MAP[`${tier}_${billing}`];
                if (!priceId) throw new Error("Price not configured");

                const res = await fetch("/api/stripe/checkout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ priceId }),
                });

                if (!res.ok) throw new Error("Checkout failed");
                const { url } = await res.json();
                if (url) window.location.href = url;
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(null);
            }
        },
        [billing]
    );

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                // 1. Bottom-sheet on mobile, centered on sm+
                className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
            >
                <div
                    className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                    onClick={onClose}
                />
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    // 2. rounded-t on mobile (flat bottom), full rounding on sm+
                    //    overscroll-contain prevents scroll chaining to the page
                    className="relative z-10 w-full max-w-3xl overflow-y-auto overscroll-contain rounded-t-2xl border border-border bg-surface p-4 shadow-2xl sm:rounded-2xl sm:p-6 lg:p-8 max-h-[90vh]"
                >
                    {/* 3. 44px touch target on close button */}
                    <button
                        onClick={onClose}
                        className="absolute right-3 top-3 grid min-h-[44px] min-w-[44px] place-items-center rounded-lg text-text-muted hover:text-text-primary sm:right-4 sm:top-4"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    {/* 4. Tighter vertical margins on mobile */}
                    <div className="mb-5 text-center sm:mb-8">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10">
                            <Zap className="h-6 w-6 text-accent" />
                        </div>
                        <h2 className="font-display text-xl text-text-primary sm:text-2xl">
                            {feature
                                ? `Unlock ${FEATURE_LABELS[feature] ?? feature}`
                                : "Upgrade your plan"}
                        </h2>
                        <p className="mt-2 text-sm text-text-secondary">{trigger}</p>
                    </div>

                    <BillingToggle billing={billing} onChange={setBilling} />

                    {/* 5. Cards stack on mobile, side-by-side on sm+ */}
                    <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                        <PlanCard
                            tier="pro"
                            billing={billing}
                            loading={loading}
                            onUpgrade={handleUpgrade}
                        />
                        <LifetimeCard loading={loading} onUpgrade={handleUpgrade} />
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

function BillingToggle({
    billing,
    onChange,
}: {
    billing: "monthly" | "yearly";
    onChange: (b: "monthly" | "yearly") => void;
}) {
    return (
        // 6. Tighter margin on mobile
        <div className="mb-5 flex justify-center sm:mb-8">
            <div className="flex items-center gap-2 rounded-xl bg-surface-elevated p-1 sm:gap-3">
                {(["monthly", "yearly"] as const).map((b) => (
                    <button
                        key={b}
                        onClick={() => onChange(b)}
                        // 7. Smaller padding + text on mobile so the toggle fits 320px screens
                        className={cn(
                            "rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all sm:px-4 sm:py-2 sm:text-sm",
                            billing === b
                                ? "bg-surface text-text-primary shadow-sm"
                                : "text-text-muted"
                        )}
                    >
                        {b === "monthly" ? (
                            "Monthly"
                        ) : (
                            <>
                                {/* Hide "Yearly" text on very small screens, badge is enough context */}
                                <span className="hidden sm:inline">Yearly</span>
                                <span className="sm:hidden">Yr</span>
                                <span className="ml-1 rounded-md bg-emerald/10 px-1.5 py-0.5 text-[10px] text-emerald">
                                    -30%
                                </span>
                            </>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}

function PlanCard({
    tier,
    billing,
    loading,
    onUpgrade,
}: {
    tier: "pro";
    billing: "monthly" | "yearly";
    loading: Tier | null;
    onUpgrade: (t: Tier) => void;
}) {
    const config = TIERS[tier];
    const price = config.price[billing];

    return (
        // 8. Tighter padding on mobile
        <div className="relative rounded-xl border-accent/40 bg-accent/3 border p-4 shadow-[0_0_30px_-10px_rgba(14,165,233,0.2)] sm:p-6">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-accent px-3 py-1 text-[10px] font-semibold text-background">
                    Most Popular
                </span>
            </div>

            <div className="mb-3 sm:mb-4">
                <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 shrink-0 text-accent" />
                    <h3 className="text-base font-semibold text-text-primary sm:text-lg">
                        {config.name}
                    </h3>
                </div>
                <div className="mt-2">
                    {/* 9. Price scales down on mobile */}
                    <span className="font-display text-2xl text-text-primary sm:text-3xl">
                        ${price}
                    </span>
                    <span className="text-sm text-text-muted">
                        /{billing === "monthly" ? "mo" : "yr"}
                    </span>
                </div>
                {billing === "yearly" && (
                    <p className="mt-1 text-xs text-emerald">
                        ${Math.round(price / 12)}/month billed annually
                    </p>
                )}
            </div>

            <ul className="mb-4 space-y-2 sm:mb-6">
                {config.features.map((f) => (
                    <li
                        key={f}
                        className="flex items-start gap-2 text-xs text-text-secondary"
                    >
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald" />
                        {f}
                    </li>
                ))}
            </ul>

            <button
                onClick={() => onUpgrade(tier)}
                disabled={loading !== null}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-semibold text-background transition-all hover:bg-accent-hover disabled:opacity-50"
            >
                {loading === tier ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <>
                        Upgrade to {config.name}
                        <ArrowRight className="h-4 w-4" />
                    </>
                )}
            </button>
        </div>
    );
}

function LifetimeCard({
    loading,
    onUpgrade,
}: {
    loading: Tier | null;
    onUpgrade: (t: Tier) => void;
}) {
    const config = TIERS.lifetime;

    return (
        // 10. Tighter padding on mobile
        <div className="relative rounded-xl border-2 border-accent/40 bg-accent/3 p-4 shadow-[0_0_30px_-10px_rgba(14,165,233,0.2)] sm:p-6">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-emerald px-3 py-1 text-[10px] font-semibold text-background">
                    Best Value
                </span>
            </div>

            <div className="mb-3 sm:mb-4">
                <h3 className="text-base font-semibold text-text-primary sm:text-lg">
                    {config.name}
                </h3>
                <div className="mt-2">
                    <span className="font-display text-2xl text-text-primary sm:text-3xl">
                        $149
                    </span>
                    <span className="text-sm text-text-muted"> one-time</span>
                </div>
                <p className="mt-1 text-xs text-emerald">
                    No recurring charges ever
                </p>
            </div>

            <ul className="mb-4 space-y-2 sm:mb-6">
                {config.features.map((f) => (
                    <li
                        key={f}
                        className="flex items-start gap-2 text-xs text-text-secondary"
                    >
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald" />
                        {f}
                    </li>
                ))}
            </ul>

            <button
                onClick={() => onUpgrade("lifetime")}
                disabled={loading !== null}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-accent/40 bg-accent/5 py-3 text-sm font-semibold text-accent transition-all hover:bg-accent/10 disabled:opacity-50"
            >
                {loading === "lifetime" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <>
                        Buy Lifetime
                        <ArrowRight className="h-4 w-4" />
                    </>
                )}
            </button>
        </div>
    );
}
