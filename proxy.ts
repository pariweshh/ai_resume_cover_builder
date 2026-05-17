import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Simple in-memory rate limiter (resets on server restart — fine for MVP)
const rateLimit = new Map<string, { count: number; reset: number }>();

const LIMITS: Record<string, { max: number; window: number }> = {
    "/api/generate": { max: 10, window: 60_000 }, // 10 per minute
    "/api/regenerate": { max: 30, window: 60_000 }, // 30 per minute
    "/api/feedback": { max: 5, window: 60_000 }, // 5 per minute
};

function checkRateLimit(ip: string, path: string): boolean {
    const limit = LIMITS[path];
    if (!limit) return true;

    const key = `${ip}:${path}`;
    const now = Date.now();
    const entry = rateLimit.get(key);

    if (!entry || now > entry.reset) {
        rateLimit.set(key, { count: 1, reset: now + limit.window });
        return true;
    }

    if (entry.count >= limit.max) {
        return false;
    }

    entry.count++;
    return true;
}

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Only rate limit API routes
    if (pathname.startsWith("/api/")) {
        const ip =
            request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            request.headers.get("x-real-ip") ||
            "unknown";

        if (!checkRateLimit(ip, pathname)) {
            return NextResponse.json(
                { error: "Rate limit exceeded. Please try again later." },
                { status: 429 }
            );
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/api/:path*"],
};
