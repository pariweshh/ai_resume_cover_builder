"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/supabase/auth-context";
import { AuthModal } from "@/components/auth/auth-modal";
import { LogOut, Settings, CreditCard, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function AuthButton() {
    const [showAuth, setShowAuth] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const { user, profile, signOut, isLoading } = useAuth();

    // Close menu on outside click
    useEffect(() => {
        if (!menuOpen) return;
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [menuOpen]);

    if (isLoading) return <div className="h-8 w-8" />;

    if (!user) {
        return (
            <>
                <button
                    onClick={() => setShowAuth(true)}
                    className="rounded-lg px-4 py-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
                >
                    Sign In
                </button>
                <button
                    onClick={() => setShowAuth(true)}
                    className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-background hover:bg-accent-hover"
                >
                    Get Started
                </button>
                <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
            </>
        );
    }

    const initial = (profile?.full_name || user.email || "U")[0].toUpperCase();
    const tier = profile?.subscription_tier ?? "free";
    const tierColors: Record<string, string> = {
        free: "bg-surface-elevated text-text-muted",
        pro: "bg-accent/15 text-accent",
        career: "bg-amber-500/15 text-amber-400",
    };

    return (
        <>
            <Link
                href="/dashboard"
                className="rounded-lg px-4 py-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
                Dashboard
            </Link>
            <Link
                href="/pricing"
                className="rounded-lg px-4 py-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
                Pricing
            </Link>
            <div className="relative" ref={menuRef}>
                <button
                    onClick={() => setMenuOpen((v) => !v)}
                    className="flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-surface-hover"
                >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
                        {initial}
                    </div>
                    <ChevronDown className={cn("h-3 w-3 text-text-muted transition-transform", menuOpen && "rotate-180")} />
                </button>

                {menuOpen && (
                    <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-border bg-surface p-1.5 shadow-xl">
                        <div className="px-3 py-2">
                            <p className="truncate text-xs font-medium text-text-primary">{user.email}</p>
                            <span className={cn("mt-1 inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold capitalize", tierColors[tier])}>
                                {tier} plan
                            </span>
                        </div>
                        <div className="border-t border-border my-1" />
                        <MenuItem href="/settings" icon={Settings} label="Settings" onClick={() => setMenuOpen(false)} />
                        <MenuItem href="/pricing" icon={CreditCard} label="Billing" onClick={() => setMenuOpen(false)} />
                        <div className="border-t border-border my-1" />
                        <button
                            onClick={() => { signOut(); setMenuOpen(false); }}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-text-secondary transition-colors hover:bg-surface-hover hover:text-error"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                            Sign out
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}

function MenuItem({
    href,
    icon: Icon,
    label,
    onClick,
}: {
    href: string;
    icon: React.ElementType;
    label: string;
    onClick: () => void;
}) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
        >
            <Icon className="h-3.5 w-3.5" />
            {label}
        </Link>
    );
}
