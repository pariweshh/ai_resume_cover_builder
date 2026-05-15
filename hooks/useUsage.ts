"use client";

import { useEffect, useState } from "react";

type Usage = {
    tier: string;
    used: number;
    resetDate: string | null;
};

export function useUsage() {
    const [usage, setUsage] = useState<Usage>({ tier: "free", used: 0, resetDate: null });
    const [isLoading, setIsLoading] = useState(true);

    const refresh = async () => {
        try {
            const res = await fetch("/api/usage");
            if (res.ok) {
                const data = await res.json();
                setUsage(data);
            }
        } catch {
            // Use defaults
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refresh();
    }, []);

    return { usage, isLoading, refresh };
}
