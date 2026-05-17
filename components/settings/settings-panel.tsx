"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
    FileDown,
    FileUp,
    Trash2,
    RotateCcw,
    Save,
    AlertTriangle,
    Check,
    Sliders,
    Type,
    FileText,
    Palette,
    Shield,
    Loader2,
    CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    useSettings,
    type ExportFormat,
    type EnhancementTone,
    type ResumeFont,
} from "@/hooks/useSettings";
import { useAuth } from "@/lib/supabase/auth-context";

export function SettingsPanel() {
    const {
        settings,
        updateSetting,
        updateATSWeight,
        resetToDefaults,
        clearAllData,
        exportAllData,
        importData,
    } = useSettings();

    const { user, profile, signOut } = useAuth();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isManagingSub, setIsManagingSub] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const success = await importData(file);
        if (success) {
            toast.success("Data imported successfully — page will reload");
            setTimeout(() => window.location.reload(), 1000);
        } else {
            toast.error("Invalid backup file");
        }
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleClearData = () => {
        clearAllData();
        setShowClearConfirm(false);
        toast.success("All data cleared — page will reload");
        setTimeout(() => window.location.reload(), 1000);
    };

    const handleResetDefaults = () => {
        resetToDefaults();
        setShowResetConfirm(false);
        toast.success("Settings reset to defaults");
    };

    const totalWeight = Object.values(settings.atsWeights).reduce(
        (a, b) => a + b,
        0
    );

    return (
        // 1. Responsive padding and vertical spacing
        <div className="mx-auto max-w-3xl space-y-6 p-4 sm:space-y-10 sm:p-6 lg:p-8">
            {/* Header */}
            <div>
                <h2 className="font-display text-xl text-text-primary sm:text-2xl">
                    Settings
                </h2>
                <p className="mt-2 text-sm text-text-secondary">
                    Customize your resume generation and export preferences. All settings
                    are stored locally in your browser.
                </p>
            </div>

            {/* ── Export Preferences ──────────────────────────────────── */}
            <Section
                icon={FileText}
                title="Export Preferences"
                description="Default format and font for exported documents"
            >
                {/* Export Format */}
                <SettingRow label="Default Export Format">
                    {/* 2. Tighter padding on mobile */}
                    <div className="flex gap-2">
                        {(["pdf", "docx", "both"] as ExportFormat[]).map((format) => (
                            <button
                                key={format}
                                onClick={() => updateSetting("exportFormat", format)}
                                className={cn(
                                    "rounded-lg px-3 py-1.5 text-xs font-medium transition-all sm:px-4 sm:py-2",
                                    settings.exportFormat === format
                                        ? "bg-accent/15 text-accent ring-1 ring-accent/30"
                                        : "bg-surface-elevated text-text-muted hover:text-text-secondary"
                                )}
                            >
                                {format.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </SettingRow>

                {/* Resume Font */}
                <SettingRow label="Resume Font">
                    <div className="flex flex-wrap gap-2">
                        {(
                            [
                                "Calibri",
                                "Georgia",
                                "Helvetica",
                                "Garamond",
                                "Cambria",
                            ] as ResumeFont[]
                        ).map((font) => (
                            <button
                                key={font}
                                onClick={() => updateSetting("resumeFont", font)}
                                className={cn(
                                    "rounded-lg px-3 py-1.5 text-xs font-medium transition-all sm:px-4 sm:py-2",
                                    settings.resumeFont === font
                                        ? "bg-accent/15 text-accent ring-1 ring-accent/30"
                                        : "bg-surface-elevated text-text-muted hover:text-text-secondary"
                                )}
                                style={{ fontFamily: font }}
                            >
                                {font}
                            </button>
                        ))}
                    </div>
                    <p className="mt-2 text-[11px] text-text-muted/50">
                        Preview:{" "}
                        <span
                            style={{ fontFamily: settings.resumeFont }}
                            className="text-text-secondary"
                        >
                            The quick brown fox jumps over the lazy dog
                        </span>
                    </p>
                </SettingRow>
            </Section>

            {/* ── Generation Preferences ──────────────────────────────── */}
            <Section
                icon={Sliders}
                title="Generation Preferences"
                description="Control how the AI enhances your resume"
            >
                {/* Enhancement Tone */}
                {/* 3. Stack vertically on mobile, 3-col on sm+ */}
                <SettingRow label="Enhancement Tone">
                    <div className="grid gap-2 sm:grid-cols-3">
                        {(
                            [
                                {
                                    value: "conservative" as EnhancementTone,
                                    label: "Conservative",
                                    desc: "Minimal changes, preserve original phrasing",
                                },
                                {
                                    value: "balanced" as EnhancementTone,
                                    label: "Balanced",
                                    desc: "Improve clarity while keeping your voice",
                                },
                                {
                                    value: "aggressive" as EnhancementTone,
                                    label: "Aggressive",
                                    desc: "Maximum ATS optimization and impact",
                                },
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() =>
                                        updateSetting("enhancementTone", option.value)
                                    }
                                    className={cn(
                                        "rounded-lg px-3 py-3 text-center transition-all",
                                        settings.enhancementTone === option.value
                                            ? "bg-accent/15 ring-1 ring-accent/30"
                                            : "bg-surface-elevated hover:bg-surface-hover"
                                    )}
                                >
                                    <p
                                        className={cn(
                                            "text-xs font-semibold",
                                            settings.enhancementTone === option.value
                                                ? "text-accent"
                                                : "text-text-secondary"
                                        )}
                                    >
                                        {option.label}
                                    </p>
                                    <p className="mt-1 text-[10px] text-text-muted">
                                        {option.desc}
                                    </p>
                                </button>
                            ))
                        )}
                    </div>
                </SettingRow>

                {/* Auto-save */}
                <SettingRow label="Auto-save">
                    {/* 4. Larger toggle for better touch target */}
                    <button
                        onClick={() => updateSetting("autoSave", !settings.autoSave)}
                        className={cn(
                            "relative h-7 w-12 rounded-full transition-colors",
                            settings.autoSave ? "bg-accent" : "bg-surface-elevated"
                        )}
                    >
                        <span
                            className={cn(
                                "absolute top-[3px] h-[22px] w-[22px] rounded-full bg-white shadow transition-transform",
                                settings.autoSave ? "left-[25px]" : "left-[3px]"
                            )}
                        />
                    </button>
                    <p className="mt-1 text-[11px] text-text-muted/50">
                        {settings.autoSave
                            ? "Resume data is saved to localStorage every 2 seconds"
                            : "Auto-save disabled — use Export to save your work manually"}
                    </p>
                </SettingRow>
            </Section>

            {/* ── ATS Scoring Weights ─────────────────────────────────── */}
            <Section
                icon={Palette}
                title="ATS Scoring Weights"
                description="Adjust how the ATS score is calculated"
            >
                {(
                    [
                        { key: "keywordMatch", label: "Keyword Match" },
                        { key: "formatting", label: "Formatting" },
                        { key: "readability", label: "Readability" },
                        { key: "impact", label: "Impact" },
                        { key: "completeness", label: "Completeness" },
                    ] as const
                ).map((item) => (
                    <SettingRow key={item.key} label={item.label}>
                        <div className="flex items-center gap-3">
                            {/* 5. Range takes available space, capped */}
                            <input
                                type="range"
                                min={0}
                                max={50}
                                value={settings.atsWeights[item.key]}
                                onChange={(e) =>
                                    updateATSWeight(item.key, parseInt(e.target.value))
                                }
                                className="h-1.5 w-full max-w-32 appearance-none rounded-full bg-surface-elevated accent-accent"
                            />
                            <span className="w-8 shrink-0 text-right font-mono text-xs text-text-secondary">
                                {settings.atsWeights[item.key]}%
                            </span>
                        </div>
                    </SettingRow>
                ))}

                {/* Weight total indicator */}
                <div
                    className={cn(
                        "mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-xs",
                        totalWeight === 100
                            ? "bg-emerald/5 text-emerald"
                            : "bg-warning/5 text-warning"
                    )}
                >
                    {totalWeight === 100 ? (
                        <Check className="h-3.5 w-3.5 shrink-0" />
                    ) : (
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    )}
                    Total: {totalWeight}%{" "}
                    {totalWeight !== 100 && "— weights should sum to 100%"}
                </div>
            </Section>

            {/* ── Account ─────────────────────────────────────────────── */}
            {user && (
                <Section
                    icon={Shield}
                    title="Account"
                    description="Manage your subscription, export data, or delete your account"
                >
                    {/* Subscription management */}
                    {profile?.subscription_tier &&
                        profile.subscription_tier !== "free" &&
                        profile.subscription_tier !== "lifetime" && (
                            <button
                                onClick={async () => {
                                    setIsManagingSub(true);
                                    try {
                                        const res = await fetch("/api/stripe/portal", {
                                            method: "POST",
                                        });
                                        const { url } = await res.json();
                                        if (url) window.location.href = url;
                                    } catch {
                                        toast.error("Failed to open subscription manager");
                                    } finally {
                                        setIsManagingSub(false);
                                    }
                                }}
                                disabled={isManagingSub}
                                className="group flex w-full items-center gap-3 rounded-xl border border-border bg-surface p-3 text-left transition-all hover:border-white/8 hover:bg-surface-elevated disabled:opacity-50 sm:p-4"
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                                    <CreditCard className="h-5 w-5 text-accent" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-text-primary">
                                        Manage Subscription
                                    </p>
                                    <p className="text-xs text-text-muted">
                                        Update payment method, view invoices, or cancel
                                    </p>
                                </div>
                            </button>
                        )}

                    {/* Plan info */}
                    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 sm:p-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-elevated">
                            <Shield className="h-5 w-5 text-text-muted" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-text-primary capitalize">
                                {profile?.subscription_tier ?? "free"} Plan
                            </p>
                            {/* truncate long emails on mobile */}
                            <p className="truncate text-xs text-text-muted">
                                {user.email}
                            </p>
                        </div>
                    </div>

                    {/* Export data */}
                    <button
                        onClick={async () => {
                            setIsExporting(true);
                            try {
                                const res = await fetch("/api/account/export");
                                if (!res.ok) throw new Error("Export failed");
                                const blob = await res.blob();
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = `resumeforge_export_${new Date().toISOString().split("T")[0]}.json`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                                toast.success("Data exported");
                            } catch {
                                toast.error("Export failed");
                            } finally {
                                setIsExporting(false);
                            }
                        }}
                        disabled={isExporting}
                        className="group flex w-full items-center gap-3 rounded-xl border border-border bg-surface p-3 text-left transition-all hover:border-white/8 hover:bg-surface-elevated disabled:opacity-50 sm:p-4"
                    >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10">
                            <FileDown className="h-5 w-5 text-sky-400" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-text-primary">
                                Export All Data
                            </p>
                            <p className="text-xs text-text-muted">
                                Download your account, workspace, and generation history as JSON
                            </p>
                        </div>
                    </button>

                    {/* Delete account */}
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="group flex w-full items-center gap-3 rounded-xl border border-error/20 bg-surface p-3 text-left transition-all hover:border-error/30 hover:bg-error/5 sm:p-4"
                    >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-error/10">
                            <Trash2 className="h-5 w-5 text-error" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-text-primary">
                                Delete Account
                            </p>
                            <p className="text-xs text-text-muted">
                                Permanently delete your account and all data
                            </p>
                        </div>
                    </button>

                    {/* Delete confirmation */}
                    {showDeleteConfirm && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-3 space-y-3 rounded-xl border border-error/30 bg-error/5 p-3 sm:p-4"
                        >
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-error" />
                                <div>
                                    <p className="text-sm font-semibold text-text-primary">
                                        This is permanent
                                    </p>
                                    <p className="mt-1 text-xs text-text-secondary">
                                        This will delete your account, workspace, all resume data,
                                        and generation history. This cannot be undone.
                                    </p>
                                </div>
                            </div>
                            <p className="text-xs text-text-muted">
                                Type <strong>DELETE</strong> to confirm:
                            </p>
                            <input
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                placeholder="Type DELETE"
                                className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-xs text-text-primary placeholder:text-text-muted/50 focus:border-error/40 focus:outline-none"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={async () => {
                                        if (deleteConfirmText !== "DELETE") return;
                                        setIsDeleting(true);
                                        try {
                                            const res = await fetch("/api/account/delete", {
                                                method: "DELETE",
                                            });
                                            if (!res.ok) throw new Error("Delete failed");
                                            toast.success("Account deleted");
                                            await signOut();
                                            window.location.href = "/";
                                        } catch {
                                            toast.error("Failed to delete account");
                                        } finally {
                                            setIsDeleting(false);
                                        }
                                    }}
                                    disabled={deleteConfirmText !== "DELETE" || isDeleting}
                                    className="flex items-center gap-1.5 rounded-lg bg-error px-4 py-2 text-xs font-medium text-white hover:bg-error/90 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isDeleting ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        "Delete my account"
                                    )}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setDeleteConfirmText("");
                                    }}
                                    className="rounded-lg px-4 py-2 text-xs font-medium text-text-muted hover:bg-surface-hover hover:text-text-secondary"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    )}
                </Section>
            )}

            {/* ── Data Management ─────────────────────────────────────── */}
            <Section
                icon={Shield}
                title="Data Management"
                description="Backup, restore, or clear your local data"
            >
                <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
                    {/* Export Backup */}
                    <button
                        onClick={() => {
                            exportAllData();
                            toast.success("Backup downloaded");
                        }}
                        className="group flex items-center gap-3 rounded-xl border border-border bg-surface p-3 text-left transition-all hover:border-white/8 hover:bg-surface-elevated sm:p-4"
                    >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10">
                            <FileDown className="h-5 w-5 text-sky-400" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-text-primary">
                                Export Backup
                            </p>
                            <p className="text-xs text-text-muted">
                                Download all data as JSON
                            </p>
                        </div>
                    </button>

                    {/* Import Backup */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="group flex items-center gap-3 rounded-xl border border-border bg-surface p-3 text-left transition-all hover:border-white/8 hover:bg-surface-elevated sm:p-4"
                    >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
                            <FileUp className="h-5 w-5 text-violet-400" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-text-primary">
                                Import Backup
                            </p>
                            <p className="text-xs text-text-muted">
                                Restore from JSON file
                            </p>
                        </div>
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        className="hidden"
                    />

                    {/* Reset Settings */}
                    <button
                        onClick={() => setShowResetConfirm(true)}
                        className="group flex items-center gap-3 rounded-xl border border-border bg-surface p-3 text-left transition-all hover:border-white/8 hover:bg-surface-elevated sm:p-4"
                    >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
                            <RotateCcw className="h-5 w-5 text-amber-400" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-text-primary">
                                Reset Settings
                            </p>
                            <p className="text-xs text-text-muted">
                                Restore default preferences
                            </p>
                        </div>
                    </button>

                    {/* Clear All Data */}
                    <button
                        onClick={() => setShowClearConfirm(true)}
                        className="group flex items-center gap-3 rounded-xl border border-error/20 bg-surface p-3 text-left transition-all hover:border-error/30 hover:bg-error/5 sm:p-4"
                    >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-error/10">
                            <Trash2 className="h-5 w-5 text-error" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-text-primary">
                                Clear All Data
                            </p>
                            <p className="text-xs text-text-muted">
                                Delete everything from localStorage
                            </p>
                        </div>
                    </button>
                </div>

                {/* Reset Confirm */}
                {showResetConfirm && (
                    <ConfirmDialog
                        title="Reset settings?"
                        message="This will restore all settings to their default values. Your resume data will not be affected."
                        confirmLabel="Reset"
                        onConfirm={handleResetDefaults}
                        onCancel={() => setShowResetConfirm(false)}
                        variant="warning"
                    />
                )}

                {/* Clear Confirm */}
                {showClearConfirm && (
                    <ConfirmDialog
                        title="Clear all data?"
                        message="This will permanently delete all resume data, settings, and drafts from your browser. This cannot be undone."
                        confirmLabel="Delete Everything"
                        onConfirm={handleClearData}
                        onCancel={() => setShowClearConfirm(false)}
                        variant="danger"
                    />
                )}
            </Section>

            {/* Storage Info */}
            <StorageInfo />
        </div>
    );
}

// ── Sub-components ─────────────────────────────────────────────

function Section({
    icon: Icon,
    title,
    description,
    children,
}: {
    icon: React.ElementType;
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                {/* 6. shrink-0 on icon container */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                    <Icon className="h-4 w-4 text-accent" />
                </div>
                <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
                    <p className="text-xs text-text-muted">{description}</p>
                </div>
            </div>
            {/* 7. Tighter padding on mobile */}
            <div className="space-y-4 rounded-xl border border-border bg-surface p-3 sm:p-5">
                {children}
            </div>
        </div>
    );
}

function SettingRow({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="mb-2 block text-xs font-medium text-text-secondary">
                {label}
            </label>
            {children}
        </div>
    );
}

function ConfirmDialog({
    title,
    message,
    confirmLabel,
    onConfirm,
    onCancel,
    variant,
}: {
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant: "warning" | "danger";
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 rounded-xl border border-border bg-surface-elevated p-3 sm:p-4"
        >
            <p className="text-sm font-semibold text-text-primary">{title}</p>
            <p className="mt-1 text-xs text-text-secondary">{message}</p>
            <div className="mt-3 flex gap-2">
                <button
                    onClick={onConfirm}
                    className={cn(
                        "rounded-lg px-4 py-2 text-xs font-medium transition-colors",
                        variant === "danger"
                            ? "bg-error text-white hover:bg-error/90"
                            : "bg-warning text-black hover:bg-warning/90"
                    )}
                >
                    {confirmLabel}
                </button>
                <button
                    onClick={onCancel}
                    className="rounded-lg px-4 py-2 text-xs font-medium text-text-muted transition-colors hover:bg-surface-hover hover:text-text-secondary"
                >
                    Cancel
                </button>
            </div>
        </motion.div>
    );
}

function StorageInfo() {
    const [usage, setUsage] = useState<{
        used: number;
        keys: number;
    } | null>(null);

    useState(() => {
        try {
            let total = 0;
            let count = 0;
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith("resumeforge")) {
                    total += (localStorage.getItem(key) || "").length * 2; // UTF-16
                    count++;
                }
            }
            setUsage({ used: total, keys: count });
        } catch {
            // Ignore
        }
    });

    if (!usage) return null;

    const usedKB = (usage.used / 1024).toFixed(1);
    const maxKB = 5120; // 5MB typical limit
    const percent = Math.min(100, (usage.used / (maxKB * 1024)) * 100);

    return (
        <div className="rounded-xl border border-border bg-surface p-3 sm:p-5">
            {/* 8. Wrap-friendly layout for small screens */}
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-text-muted">
                        Local Storage Usage
                    </h4>
                    <p className="mt-1 text-sm text-text-secondary">
                        {usedKB} KB used · {usage.keys} items
                    </p>
                </div>
                <span className="font-mono text-xs text-text-muted">
                    {percent.toFixed(1)}%
                </span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-elevated">
                <div
                    className={cn(
                        "h-full rounded-full transition-all",
                        percent > 80 ? "bg-warning" : "bg-accent/40"
                    )}
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
}
