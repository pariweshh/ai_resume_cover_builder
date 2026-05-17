"use client";

import { Reorder, motion, AnimatePresence } from "framer-motion";
import { X, GripVertical } from "lucide-react";
import type { ReorderableSection } from "@/types";
import { DEFAULT_SECTION_ORDER } from "@/types";

const SECTION_LABELS: Record<ReorderableSection, string> = {
    summary: "Professional Summary",
    skills: "Technical Skills",
    experience: "Professional Experience",
    projects: "Projects",
    education: "Education & Certifications",
};

type Props = {
    isOpen: boolean;
    order: ReorderableSection[];
    onReorder: (order: ReorderableSection[]) => void;
    onClose: () => void;
};

export function RearrangeModal({
    isOpen,
    order,
    onReorder,
    onClose,
}: Props) {
    if (!isOpen) return null;

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
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                />
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    // 2. Flat bottom on mobile (bottom-sheet), full rounding on sm+
                    //    max-h + overflow for scroll safety, overscroll-contain
                    className="relative z-10 w-full max-w-md rounded-t-2xl border border-border bg-surface p-4 shadow-2xl sm:rounded-2xl sm:p-6"
                >
                    <div className="mb-5 flex items-center justify-between">
                        <div className="min-w-0">
                            <h2 className="text-sm font-semibold text-text-primary">
                                Rearrange Sections
                            </h2>
                            <p className="text-xs text-text-muted">
                                Drag to reorder. Changes apply to preview and exports.
                            </p>
                        </div>
                        {/* 3. 44px touch target */}
                        <button
                            onClick={onClose}
                            className="grid min-h-[44px] min-w-[44px] shrink-0 place-items-center rounded-lg text-text-muted hover:text-text-primary"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <Reorder.Group
                        axis="y"
                        values={order}
                        onReorder={onReorder}
                        className="space-y-1.5"
                    >
                        {order.map((section) => (
                            <Reorder.Item
                                key={section}
                                value={section}
                                // 4. Tighter horizontal padding on mobile
                                className="flex cursor-grab items-center gap-3 rounded-xl border border-border bg-surface-elevated px-3 py-3 active:cursor-grabbing sm:px-4"
                                whileDrag={{
                                    scale: 1.02,
                                    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                                }}
                            >
                                <GripVertical className="h-4 w-4 shrink-0 text-text-muted/40" />
                                <span className="text-sm text-text-primary">
                                    {SECTION_LABELS[section]}
                                </span>
                            </Reorder.Item>
                        ))}
                    </Reorder.Group>

                    <button
                        onClick={() => onReorder(DEFAULT_SECTION_ORDER)}
                        className="mt-4 w-full rounded-lg py-2 text-xs text-text-muted transition-colors hover:bg-surface-hover hover:text-text-secondary"
                    >
                        Reset to default order
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
