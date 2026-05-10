"use client";

import Link from "next/link";

const links = {
    Product: [
        { label: "Features", href: "/#features" },
        { label: "How It Works", href: "/#how-it-works" },
        { label: "Pricing", href: "/#pricing" },
        { label: "Changelog", href: "/docs#overview" },
    ],
    Resources: [
        { label: "Documentation", href: "/docs" },
        { label: "API Reference", href: "/docs#api-reference" },
        { label: "Support", href: "/support" },
        { label: "Feedback", href: "/support" },
    ],
    Legal: [
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
        { label: "Security", href: "/security" },
    ],
};

export function Footer() {
    return (
        <footer className="relative border-t border-white/[0.04] px-6 pt-16 pb-10">
            <div className="mx-auto grid max-w-6xl gap-12 sm:grid-cols-2 lg:grid-cols-4">
                {/* Brand */}
                <div>
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 ring-1 ring-accent/20">
                            <span className="text-xs font-bold text-accent">R</span>
                        </div>
                        <span className="font-display text-lg text-text-primary">
                            ResumeForge
                        </span>
                    </Link>
                    <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-text-muted">
                        Truth-first AI resume optimization. Built for recruiters,
                        powered by honesty.
                    </p>
                    <div className="mt-5 flex items-center gap-3">
                        <Link
                            href="/dashboard"
                            className="rounded-lg bg-accent/10 px-4 py-2 text-xs font-medium text-accent transition-colors hover:bg-accent/15"
                        >
                            Get Started
                        </Link>
                        <Link
                            href="/docs"
                            className="text-xs text-text-muted transition-colors hover:text-text-secondary"
                        >
                            Docs
                        </Link>
                    </div>
                </div>

                {/* Link columns */}
                {Object.entries(links).map(([category, items]) => (
                    <div key={category}>
                        <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                            {category}
                        </h4>
                        <ul className="space-y-2.5">
                            {items.map((item) => (
                                <li key={item.label}>
                                    {item.href.startsWith("/#") || item.href.startsWith("/") ? (
                                        <Link
                                            href={item.href}
                                            className="text-[13px] text-text-muted transition-colors hover:text-text-secondary"
                                        >
                                            {item.label}
                                        </Link>
                                    ) : (
                                        <a
                                            href={item.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[13px] text-text-muted transition-colors hover:text-text-secondary"
                                        >
                                            {item.label}
                                        </a>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="mx-auto mt-14 flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-white/[0.04] pt-6 sm:flex-row">
                <p className="text-xs text-text-muted/50">
                    © {new Date().getFullYear()} ResumeForge. All rights reserved.
                </p>
                <div className="flex items-center gap-4">
                    <Link
                        href="/privacy"
                        className="text-xs text-text-muted/40 transition-colors hover:text-text-muted"
                    >
                        Privacy
                    </Link>
                    <Link
                        href="/terms"
                        className="text-xs text-text-muted/40 transition-colors hover:text-text-muted"
                    >
                        Terms
                    </Link>
                    <Link
                        href="/support"
                        className="text-xs text-text-muted/40 transition-colors hover:text-text-muted"
                    >
                        Support
                    </Link>
                </div>
            </div>
        </footer>
    );
}
