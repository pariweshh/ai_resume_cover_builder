"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    type ReactNode,
} from "react";
import { createClient } from "./client";
import type { User } from "@supabase/supabase-js";
import type { Tier } from "@/lib/subscription";

type Profile = {
    id: string;
    email: string;
    full_name: string;
    subscription_tier: Tier;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    subscription_status: string;
    generations_used_this_month: number;
    generation_reset_date: string;
};

type AuthCtx = {
    user: User | null;
    profile: Profile | null;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<string | null>;
    signUp: (email: string, password: string, name: string) => Promise<string | null>;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    const fetchProfile = useCallback(
        async (uid: string) => {
            const { data } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", uid)
                .single();
            if (data) setProfile(data as Profile);
        },
        [supabase]
    );

    const refreshProfile = useCallback(async () => {
        if (user) await fetchProfile(user.id);
    }, [user, fetchProfile]);

    useEffect(() => {
        let mounted = true;

        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!mounted) return;
            if (session?.user) {
                setUser(session.user);
                fetchProfile(session.user.id);
            }
            setIsLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                if (!mounted) return;
                if (session?.user) {
                    setUser(session.user);
                    fetchProfile(session.user.id);
                } else {
                    setUser(null);
                    setProfile(null);
                }
                setIsLoading(false);
            }
        );

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return error?.message ?? null;
    };

    const signUp = async (email: string, password: string, name: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: name } },
        });
        return error?.message ?? null;
    };

    const signInWithGoogle = async () => {
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: `${window.location.origin}/auth/callback` },
        });
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
    };

    return (
        <AuthContext.Provider
            value={{ user, profile, isLoading, signIn, signUp, signInWithGoogle, signOut, refreshProfile }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
