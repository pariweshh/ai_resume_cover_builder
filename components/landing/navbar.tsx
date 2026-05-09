"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export function Navbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 30);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
                scrolled
                    ? "border-b border-white/4 bg-background/70 backdrop-blur-xl"
                    : "bg-transparent"
            )}
        >
            <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
                <Link href="/" className="group flex items-center gap-2.5">
                    <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 ring-1 ring-accent/20 transition-all group-hover:ring-accent/40 group-hover:shadow-[0_0_20px_-4px_rgba(14,165,233,0.3)]">
                        <span className="text-sm font-bold text-accent">R</span>
                    </div>
                    <span className="font-display text-xl tracking-tight text-text-primary">
                        ResumeForge
                    </span>
                </Link>

                <div className="hidden items-center gap-1 md:flex">
                    {["Features", "How It Works"].map((item) => (
                        <Link
                            key={item}
                            href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                            className="rounded-lg px-4 py-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
                        >
                            {item}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard"
                        className="group relative flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-background transition-all hover:bg-accent-hover hover:shadow-[0_0_30px_-6px_rgba(14,165,233,0.5)]"
                    >
                        Get Started
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                </div>
            </nav>
        </motion.header>
    );
}
