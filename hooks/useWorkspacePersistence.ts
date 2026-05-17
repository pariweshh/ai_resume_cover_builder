"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { WorkspaceState } from "@/types";

export function useWorkspacePersistence(userId: string | null) {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [initialState, setInitialState] = useState<WorkspaceState | null>(null);

    const [supabase] = useState(() => createClient());
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
    const lastSavedRef = useRef<string>("");

    // ── Load workspace on mount ───────────────────────────────────
    useEffect(() => {
        if (!userId) {
            setIsLoading(false);
            return;
        }

        let cancelled = false;

        const load = async () => {
            try {
                const { data } = await supabase
                    .from("workspaces")
                    .select("state")
                    .eq("user_id", userId)
                    .single();

                if (!cancelled && data?.state) {
                    setInitialState(data.state as WorkspaceState);
                }
            } catch {
                // Table might not exist yet or no row — fine
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [userId, supabase]);

    // ── Debounced save ────────────────────────────────────────────
    const save = useCallback(
        (state: WorkspaceState) => {
            if (!userId) return;

            // Skip if nothing changed
            const serialized = JSON.stringify(state);
            if (serialized === lastSavedRef.current) return;

            clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = setTimeout(async () => {
                setIsSaving(true);
                try {
                    await supabase
                        .from("workspaces")
                        .upsert(
                            { user_id: userId, state: serialized },
                            { onConflict: "user_id" }
                        );
                    lastSavedRef.current = serialized;
                } catch {
                    // Save failed — retry on next change
                } finally {
                    setIsSaving(false);
                }
            }, 2000);
        },
        [userId, supabase]
    );

    // ── Clear workspace ───────────────────────────────────────────
    const clear = useCallback(async () => {
        if (!userId) return;

        clearTimeout(saveTimeoutRef.current);
        lastSavedRef.current = "";

        try {
            await supabase
                .from("workspaces")
                .upsert(
                    { user_id: userId, state: "{}" },
                    { onConflict: "user_id" }
                );
        } catch {
            // Ignore
        }

        setInitialState(null);
    }, [userId, supabase]);

    // ── Force save (for beforeunload) ─────────────────────────────
    const flush = useCallback(
        (state: WorkspaceState) => {
            if (!userId) return;
            clearTimeout(saveTimeoutRef.current);

            const serialized = JSON.stringify(state);
            if (serialized === lastSavedRef.current) return;

            // Use sendBeacon for reliable save on page unload
            const blob = new Blob([JSON.stringify({
                user_id: userId,
                state: serialized,
            })], { type: "application/json" });

            navigator.sendBeacon("/api/workspace/save", blob);
            lastSavedRef.current = serialized;
        },
        [userId]
    );

    // ── Cleanup ───────────────────────────────────────────────────
    useEffect(() => {
        return () => clearTimeout(saveTimeoutRef.current);
    }, []);

    return { initialState, save, clear, flush, isLoading, isSaving };
}
