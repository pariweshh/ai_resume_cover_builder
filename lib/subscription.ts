export const TIERS = {
    free: {
        name: "Free",
        price: { monthly: 0, yearly: 0 },
        generationsPerMonth: 4,
        features: [
            "4 resume generations per month",
            "Basic ATS score",
            "Clean PDF export",
            "Local settings & preferences",
        ],
        limitations: [
            "No DOCX export",
            "No cover letter generation",
            "No bullet regeneration",
            "Single enhancement tone",
        ],
    },
    pro: {
        name: "Pro",
        price: { monthly: 9, yearly: 79 },
        generationsPerMonth: -1,
        features: [
            "Unlimited resume generations",
            "Full ATS score with breakdown",
            "Cover letter generation",
            "Bullet regeneration",
            "PDF + DOCX export",
            "5 resume profiles",
            "Version history",
            "All enhancement tones",
        ],
        limitations: [],
    },
    lifetime: {
        name: "Lifetime",
        price: { monthly: 149, yearly: 149 },
        generationsPerMonth: -1,
        features: [
            "Everything in Pro",
            "Pay once, use forever",
            "No recurring charges",
            "All future Pro updates included",
            "Priority email support",
        ],
        limitations: [],
    },
} as const;

export type Tier = keyof typeof TIERS;

export const FEATURE_GATES: Record<string, Tier[]> = {
    cover_letter: ["pro", "lifetime"],
    regenerate: ["pro", "lifetime"],
    docx_export: ["pro", "lifetime"],
};

export function canUseFeature(tier: Tier, feature: string): boolean {
    const allowed = FEATURE_GATES[feature];
    if (!allowed) return true;
    return allowed.includes(tier);
}

export function hasGenerationsRemaining(tier: Tier, used: number): boolean {
    if (tier !== "free") return true;
    return used < TIERS.free.generationsPerMonth;
}

export function getTierFromPriceId(priceId: string): Tier {
    const map: Record<string, Tier> = {
        [process.env.STRIPE_PRO_MONTHLY_PRICE_ID!]: "pro",
        [process.env.STRIPE_PRO_YEARLY_PRICE_ID!]: "pro",
        [process.env.STRIPE_LIFETIME_PRICE_ID!]: "lifetime",
    };
    return map[priceId] || "free";
}
