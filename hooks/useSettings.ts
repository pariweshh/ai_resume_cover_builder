"use client";

import { useState, useEffect, useCallback } from "react";

export type ExportFormat = "pdf" | "docx" | "both";
export type EnhancementTone = "conservative" | "balanced" | "aggressive";
export type ResumeFont = "Calibri" | "Georgia" | "Helvetica" | "Garamond" | "Cambria";

export type AppSettings = {
    exportFormat: ExportFormat;
    resumeFont: ResumeFont;
    autoSave: boolean;
    enhancementTone: EnhancementTone;
    atsWeights: {
        keywordMatch: number;
        formatting: number;
        readability: number;
        impact: number;
        completeness: number;
    };
};

const SETTINGS_KEY = "resumeforge_settings";

const defaultSettings: AppSettings = {
    exportFormat: "pdf",
    resumeFont: "Calibri",
    autoSave: true,
    enhancementTone: "balanced",
    atsWeights: {
        keywordMatch: 30,
        formatting: 20,
        readability: 20,
        impact: 15,
        completeness: 15,
    },
};

export function useSettings() {
    const [settings, setSettings] = useState<AppSettings>(defaultSettings);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const raw = localStorage.getItem(SETTINGS_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                setSettings({ ...defaultSettings, ...parsed });
            }
        } catch {
            // Corrupted settings — use defaults
        }
        setIsLoaded(true);
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        if (!isLoaded) return;
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        } catch {
            // Storage full
        }
    }, [settings, isLoaded]);

    const updateSetting = useCallback(
        <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
            setSettings((prev) => ({ ...prev, [key]: value }));
        },
        []
    );

    const updateATSWeight = useCallback(
        (key: keyof AppSettings["atsWeights"], value: number) => {
            setSettings((prev) => ({
                ...prev,
                atsWeights: { ...prev.atsWeights, [key]: value },
            }));
        },
        []
    );

    const resetToDefaults = useCallback(() => {
        setSettings(defaultSettings);
    }, []);

    // Data management
    const clearAllData = useCallback(() => {
        const keys = Object.keys(localStorage).filter((k) =>
            k.startsWith("resumeforge")
        );
        keys.forEach((k) => localStorage.removeItem(k));
    }, []);

    const exportAllData = useCallback(() => {
        const data: Record<string, unknown> = {};
        const keys = Object.keys(localStorage).filter((k) =>
            k.startsWith("resumeforge")
        );
        keys.forEach((k) => {
            try {
                data[k] = JSON.parse(localStorage.getItem(k) || "");
            } catch {
                data[k] = localStorage.getItem(k);
            }
        });

        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `resumeforge_backup_${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, []);

    const importData = useCallback((file: File): Promise<boolean> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target?.result as string);
                    Object.entries(data).forEach(([key, value]) => {
                        localStorage.setItem(key, JSON.stringify(value));
                    });
                    // Reload settings if they were in the import
                    if (data[SETTINGS_KEY]) {
                        setSettings({ ...defaultSettings, ...data[SETTINGS_KEY] });
                    }
                    resolve(true);
                } catch {
                    resolve(false);
                }
            };
            reader.readAsText(file);
        });
    }, []);

    return {
        settings,
        isLoaded,
        updateSetting,
        updateATSWeight,
        resetToDefaults,
        clearAllData,
        exportAllData,
        importData,
    };
}
