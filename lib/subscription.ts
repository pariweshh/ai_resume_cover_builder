export const TIERS = {
    free: {
        name: "Free",
        price: { monthly: 0, yearly: 0 },
        generationsPerMonth: 2,
        features: [
            "2 resume generations per month",
            "Basic ATS score",
            "PDF export with watermark",
            "Local storage only",
        ],
        limitations: [
            "No DOCX export",
            "No cover letter",
            "No bullet regeneration",
            "No version history",
            "Watermarked PDF",
        ],
    },
    pro: {
        name: "Pro",
        price: { monthly: 12, yearly: 99 },
        generationsPerMonth: -1,
        features: [
            "Unlimited resume generations",
            "Full ATS score with breakdown",
            "Cover letter generation",
            "Bullet regeneration",
            "PDF + DOCX export (no watermark)",
            "5 resume profiles",
            "Version history",
            "All enhancement tones",
        ],
        limitations: [],
    },
    career: {
        name: "Career",
        price: { monthly: 29, yearly: 249 },
        generationsPerMonth: -1,
        features: [
            "Everything in Pro",
            "Unlimited resume profiles",
            "LinkedIn profile optimization",
            "Interview prep questions",
            "Priority AI processing",
            "Unlimited version history",
            "API access",
            "Priority support",
        ],
        limitations: [],
    },
} as const;

export type Tier = keyof typeof TIERS;

export const FEATURE_GATES: Record<string, Tier[]> = {
    cover_letter: ["pro", "career"],
    regenerate: ["pro", "career"],
    docx_export: ["pro", "career"],
    multiple_profiles: ["career"],
    interview_prep: ["career"],
    api_access: ["career"],
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
        [process.env.STRIPE_CAREER_MONTHLY_PRICE_ID!]: "career",
        [process.env.STRIPE_CAREER_YEARLY_PRICE_ID!]: "career",
    };
    return map[priceId] || "free";
}
