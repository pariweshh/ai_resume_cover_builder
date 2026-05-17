"use client";

import { useEffect, useCallback } from "react";

type ShortcutMap = {
    [key: string]: () => void;
};

export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            const isMeta = e.metaKey || e.ctrlKey;

            for (const [combo, handler] of Object.entries(shortcuts)) {
                const parts = combo.split("+");
                const needsMeta = parts.includes("meta");
                const needsShift = parts.includes("shift");
                const key = parts[parts.length - 1];

                const metaMatch = needsMeta ? isMeta : !isMeta;
                const shiftMatch = needsShift ? e.shiftKey : !e.shiftKey;

                if (metaMatch && shiftMatch && e.key.toLowerCase() === key.toLowerCase()) {
                    e.preventDefault();
                    handler();
                    return;
                }
            }
        },
        [shortcuts]
    );

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);
}
