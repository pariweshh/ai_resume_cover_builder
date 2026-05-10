"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

type RegenerateOptions = {
    jobDescription?: string;
    resumeContext?: string;
};

export function useRegenerate(options?: RegenerateOptions) {
    const [regeneratingIndex, setRegeneratingIndex] = useState<string | null>(
        null
    );

    const regenerateBullet = useCallback(
        async (bullet: string): Promise<string | null> => {
            setRegeneratingIndex("bullet");
            try {
                const res = await fetch("/api/regenerate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        type: "bullet",
                        content: bullet,
                        jobDescription: options?.jobDescription,
                        resumeContext: options?.resumeContext,
                    }),
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || "Failed to regenerate");
                }

                const { text } = await res.json();
                return text;
            } catch (err) {
                toast.error(
                    err instanceof Error ? err.message : "Regeneration failed"
                );
                return null;
            } finally {
                setRegeneratingIndex(null);
            }
        },
        [options?.jobDescription, options?.resumeContext]
    );

    const regenerateBullets = useCallback(
        async (bullets: string[]): Promise<string[] | null> => {
            setRegeneratingIndex("bullets");
            try {
                const res = await fetch("/api/regenerate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        type: "bullets",
                        content: bullets,
                        jobDescription: options?.jobDescription,
                        resumeContext: options?.resumeContext,
                    }),
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || "Failed to regenerate");
                }

                const { bullets: result } = await res.json();
                return result;
            } catch (err) {
                toast.error(
                    err instanceof Error ? err.message : "Regeneration failed"
                );
                return null;
            } finally {
                setRegeneratingIndex(null);
            }
        },
        [options?.jobDescription, options?.resumeContext]
    );

    const regenerateSummary = useCallback(
        async (summary: string): Promise<string | null> => {
            setRegeneratingIndex("summary");
            try {
                const res = await fetch("/api/regenerate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        type: "summary",
                        content: summary,
                        jobDescription: options?.jobDescription,
                        resumeContext: options?.resumeContext,
                    }),
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || "Failed to regenerate");
                }

                const { text } = await res.json();
                return text;
            } catch (err) {
                toast.error(
                    err instanceof Error ? err.message : "Regeneration failed"
                );
                return null;
            } finally {
                setRegeneratingIndex(null);
            }
        },
        [options?.jobDescription, options?.resumeContext]
    );

    return {
        regeneratingIndex,
        regenerateBullet,
        regenerateBullets,
        regenerateSummary,
    };
}
