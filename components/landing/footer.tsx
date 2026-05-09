"use client";

import Link from "next/link";

const links = {
    Product: ["Features", "How It Works", "Pricing", "Changelog"],
    Resources: ["Documentation", "API", "Blog", "Support"],
    Legal: ["Privacy", "Terms", "Security"],
};

export function Footer() {
    return (
        <footer className="relative border-t border-white/[0.04] px-6 pt-16 pb-10">
            <div className="mx-auto grid max-w-6xl gap-12 sm:grid-cols-2 lg:grid-cols-4">
                {/* Brand */}
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 ring-1 ring-accent/20">
                            <span className="text-xs font-bold text-accent">R</span>
                        </div>
                        <span className="font-display text-lg text-text-primary">
                            ResumeForge
                        </span>
                    </div>
                    <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-text-muted">
                        Truth-first AI resume optimization. Built for recruiters,
                        powered by honesty.
                    </p>
                </div>

                {/* Link columns */}
                {Object.entries(links).map(([category, items]) => (
                    <div key={category}>
                        <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                            {category}
                        </h4>
                        <ul className="space-y-2.5">
                            {items.map((item) => (
                                <li key={item}>
                                    <Link
                                        href="#"
                                        className="text-[13px] text-text-muted transition-colors hover:text-text-secondary"
                                    >
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="mx-auto mt-14 flex max-w-6xl items-center justify-between border-t border-white/[0.04] pt-6">
                <p className="text-xs text-text-muted/50">
                    © {new Date().getFullYear()} ResumeForge. All rights reserved.
                </p>
                <p className="text-xs text-text-muted/30">
                    Made with honesty, not hallucinations
                </p>
            </div>
        </footer>
    );
}
