"use client";

import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import type {
    PipelineStage,
    StreamEvent,
    ResumeSchema,
    JDAnalysis,
    EvidenceMapping,
    ATSScore,
    ValidationResult,
} from "@/types";

type StreamingCallbacks = {
    onParsed?: (data: ResumeSchema) => void;
    onAnalyzed?: (data: JDAnalysis) => void;
    onMapped?: (data: EvidenceMapping) => void;
    onEnhanced?: (data: Partial<ResumeSchema>) => void;
    onEnhancedChunk?: (section: string, content: string) => void;
    onScored?: (data: ATSScore) => void;
    onCoverLetter?: (data: string) => void;
    onCoverLetterChunk?: (content: string) => void;
    onValidated?: (data: ValidationResult) => void;
    onComplete?: () => void;
    onError?: (message: string) => void;
};

export function useStreaming(callbacks: StreamingCallbacks) {
    const [stage, setStage] = useState<PipelineStage>("idle");
    const [progress, setProgress] = useState(0);
    const [isStreaming, setIsStreaming] = useState(false);
    const [lastError, setLastError] = useState<string | null>(null);
    const abortRef = useRef<AbortController | null>(null);
    const callbacksRef = useRef(callbacks);
    callbacksRef.current = callbacks;

    const startStreaming = useCallback(
        async (rawText: string, jobDescription: string, tone?: string) => {
            setIsStreaming(true);
            setStage("parsing");
            setProgress(5);
            setLastError(null);

            abortRef.current = new AbortController();

            try {
                const response = await fetch("/api/generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ rawText, jobDescription, tone }),
                    signal: abortRef.current.signal,
                });

                if (!response.ok) {
                    const errorBody = await response.text();
                    throw new Error(`Server error ${response.status}: ${errorBody}`);
                }

                const reader = response.body!.getReader();
                const decoder = new TextDecoder();
                let buffer = "";

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split("\n");
                    buffer = lines.pop() || "";

                    for (const line of lines) {
                        if (!line.startsWith("data: ")) continue;
                        const jsonStr = line.slice(6).trim();
                        if (!jsonStr || jsonStr === "[DONE]") continue;

                        try {
                            const event: StreamEvent = JSON.parse(jsonStr);
                            handleEvent(event);
                        } catch {
                            console.warn("[Streaming] Malformed event:", jsonStr.slice(0, 100));
                        }
                    }
                }
            } catch (err) {
                if (err instanceof Error && err.name === "AbortError") return;
                const message =
                    err instanceof Error ? err.message : "Unknown error occurred";
                console.error("[Streaming] Fatal error:", message);
                setLastError(message);
                setStage("error");
                toast.error(`Generation failed: ${message}`);
                callbacksRef.current.onError?.(message);
            } finally {
                setIsStreaming(false);
            }
        },
        []
    );

    const handleEvent = useCallback((event: StreamEvent) => {
        const cb = callbacksRef.current;

        switch (event.type) {
            case "stage":
                setStage(event.stage);
                setProgress(event.progress);
                break;
            case "parsed":
                console.log("[Streaming] Resume parsed successfully");
                cb.onParsed?.(event.data);
                break;
            case "analyzed":
                console.log("[Streaming] JD analyzed");
                cb.onAnalyzed?.(event.data);
                break;
            case "mapped":
                console.log("[Streaming] Evidence mapped");
                cb.onMapped?.(event.data);
                break;
            case "enhanced":
                console.log("[Streaming] Resume enhanced");
                cb.onEnhanced?.(event.data);
                break;
            case "enhanced_chunk":
                cb.onEnhancedChunk?.(event.section, event.content);
                break;
            case "scored":
                console.log("[Streaming] Scored:", event.data?.overall);
                cb.onScored?.(event.data);
                break;
            case "cover_letter_chunk":
                cb.onCoverLetterChunk?.(event.content);
                break;
            case "cover_letter":
                console.log("[Streaming] Cover letter done");
                cb.onCoverLetter?.(event.data);
                break;
            case "validated":
                console.log("[Streaming] Validated, trust:", event.data?.trustScore);
                cb.onValidated?.(event.data);
                break;
            case "complete":
                setStage("complete");
                setProgress(100);
                console.log("[Streaming] Pipeline complete!");
                cb.onComplete?.();
                break;
            case "error":
                const msg = event.message || "Unknown pipeline error";
                console.error("[Streaming] Pipeline error:", msg);
                setLastError(msg);
                setStage("error");
                toast.error(msg);
                cb.onError?.(msg);
                break;
        }
    }, []);

    const cancel = useCallback(() => {
        abortRef.current?.abort();
        setIsStreaming(false);
        setStage("idle");
        setProgress(0);
    }, []);

    return { stage, progress, isStreaming, lastError, startStreaming, cancel };
}
