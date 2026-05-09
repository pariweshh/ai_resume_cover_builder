"use client";

import { cn } from "@/lib/utils";
import {
    FileText,
    Briefcase,
    Sparkles,
    BarChart3,
    Mail,
    Download,
    Settings,
} from "lucide-react";
import Link from "next/link";

type SidebarProps = {
    activeTab: string;
    onTabChange: (tab: string) => void;
    hasResume: boolean;
    hasOptimized: boolean;
};

const navItems = [
    { id: "upload", label: "Resume", icon: FileText },
    { id: "job", label: "Job Description", icon: Briefcase },
    { id: "generate", label: "Generate", icon: Sparkles },
    { id: "ats", label: "ATS Score", icon: BarChart3 },
    { id: "cover", label: "Cover Letter", icon: Mail },
    { id: "export", label: "Export", icon: Download },
] as const;

export function Sidebar({
    activeTab,
    onTabChange,
    hasResume,
    hasOptimized,
}: SidebarProps) {
    return (
        <aside className="flex h-full w-56 flex-col border-r border-border bg-surface">
            <Link href={'/'} className="flex h-14 items-center gap-2 border-b border-border px-5">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent/10">
                    <span className="text-xs font-bold text-accent">R</span>
                </div>
                <span className="font-display text-base text-text-primary">
                    ResumeForge
                </span>
            </Link>

            <nav className="flex-1 space-y-0.5 px-3 py-4">
                {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    const isDisabled =
                        (item.id === "job" && !hasResume) ||
                        (item.id === "generate" && !hasResume) ||
                        (item.id === "ats" && !hasOptimized) ||
                        (item.id === "cover" && !hasOptimized) ||
                        (item.id === "export" && !hasOptimized);

                    return (
                        <button
                            key={item.id}
                            onClick={() => !isDisabled && onTabChange(item.id)}
                            disabled={isDisabled}
                            className={cn(
                                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                                isActive
                                    ? "bg-surface-elevated text-text-primary"
                                    : isDisabled
                                        ? "cursor-not-allowed text-text-muted/40"
                                        : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                            )}
                        >
                            <item.icon
                                className={cn(
                                    "h-4 w-4",
                                    isActive ? "text-accent" : ""
                                )}
                            />
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            <div className="border-t border-border p-3">
                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-muted transition-colors hover:bg-surface-hover hover:text-text-secondary">
                    <Settings className="h-4 w-4" />
                    Settings
                </button>
            </div>
        </aside>
    );
}
