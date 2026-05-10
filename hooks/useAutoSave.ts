"use client";

import { useEffect, useRef } from "react";
import type { ResumeSchema } from "@/types";

const STORAGE_KEY = "resumeforge_draft";

export function useAutoSave(
    resume: ResumeSchema | null,
    optimized: ResumeSchema | null
) {
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    useEffect(() => {
        if (!resume) return;

        // Check auto-save setting
        let autoSaveEnabled = true;
        try {
            const settingsRaw = localStorage.getItem("resumeforge_settings");
            if (settingsRaw) {
                const settings = JSON.parse(settingsRaw);
                autoSaveEnabled = settings.autoSave !== false;
            }
        } catch {
            // Default to enabled
        }

        if (!autoSaveEnabled) return;

        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            try {
                const data = {
                    resume,
                    optimized,
                    savedAt: new Date().toISOString(),
                };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            } catch {
                // Storage full or unavailable
            }
        }, 2000);

        return () => clearTimeout(timeoutRef.current);
    }, [resume, optimized]);

    return null;
}

export function loadDraft(): {
    resume: ResumeSchema | null;
    optimized: ResumeSchema | null;
    savedAt: string;
} | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export function clearDraft() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
}
