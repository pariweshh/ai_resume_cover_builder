"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User as UserIcon, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/supabase/auth-context";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    defaultMode?: "signin" | "signup";
    redirectTo?: string;
};

export function AuthModal({ isOpen, onClose, defaultMode = "signin", redirectTo }: Props) {
    const supabase = createClient()
    const [mode, setMode] = useState<"signin" | "signup" | "forgot">(
        defaultMode
    );
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [resetSent, setResetSent] = useState(false); const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { signIn, signUp, signInWithGoogle } = useAuth();

    const reset = useCallback(() => {
        setEmail("");
        setPassword("");
        setName("");
        setError(null);
    }, []);

    const toggle = useCallback(() => {
        setMode((m) => (m === "signin" ? "signup" : "signin"));
        setError(null);
    }, []);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback`,
            });
            if (error) {
                setError(error.message);
            } else {
                setResetSent(true);
            }
        } finally {
            setIsLoading(false);
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const err =
                mode === "signin"
                    ? await signIn(email, password)
                    : name.trim()
                        ? await signUp(email, password, name.trim())
                        : "Name is required";

            if (err) {
                setError(err);
            } else {
                // send welcome email
                if (mode === "signup") {
                    fetch('/api/email/welcome', {
                        method: 'POST',
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email, name })
                    }).catch(err => {
                        console.error("Failed to send welcome email", err);
                    })
                }

                reset();
                onClose();
                if (redirectTo) {
                    window.location.href = redirectTo
                } else {
                    window.location.reload()
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center"
            >
                <div
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                />
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-2xl"
                >
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 rounded-lg p-1 text-text-muted hover:text-text-primary"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    <div className="mb-6 text-center">
                        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                            <span className="text-sm font-bold text-accent">R</span>
                        </div>
                        <h2 className="font-display text-xl text-text-primary">
                            {mode === "signin" ? "Welcome back" : "Create your account"}
                        </h2>
                        <p className="mt-1 text-xs text-text-secondary">
                            {mode === "signin"
                                ? "Sign in to access your resumes"
                                : "Start optimizing your resume today"}
                        </p>
                    </div>

                    {/* Forgot password */}
                    {mode === "forgot" && resetSent ? (
                        <div className="text-center">
                            <p className="text-sm text-text-secondary">
                                Check your email for a password reset link.
                            </p>
                            <button
                                onClick={() => {
                                    setMode("signin");
                                    setResetSent(false);
                                    setError(null);
                                }}
                                className="mt-4 text-xs text-accent hover:underline"
                            >
                                Back to sign in
                            </button>
                        </div>
                    ) : mode === "forgot" ? (
                        <>
                            <p className="mb-3 text-xs text-text-secondary">
                                Enter your email and we'll send you a reset link.
                            </p>
                            <form onSubmit={handleResetPassword} className="space-y-3">
                                <InputField
                                    icon={Mail}
                                    type="email"
                                    value={email}
                                    onChange={setEmail}
                                    placeholder="Email address"
                                    required
                                />
                                {error && (
                                    <p className="rounded-lg bg-error/10 px-3 py-2 text-xs text-error">
                                        {error}
                                    </p>
                                )}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-semibold text-background hover:bg-accent-hover disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        "Send Reset Link"
                                    )}
                                </button>
                            </form>
                            <p className="mt-4 text-center text-xs text-text-muted">
                                Remember your password?{" "}
                                <button
                                    onClick={() => {
                                        setMode("signin");
                                        setError(null);
                                    }}
                                    className="text-accent hover:underline"
                                >
                                    Sign in
                                </button>
                            </p>
                        </>
                    ) : (
                        <>
                            {/* Google */}
                            <button
                                onClick={signInWithGoogle}
                                className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface-elevated py-3 text-sm font-medium text-text-primary transition-all hover:bg-surface-hover"
                            >
                                <GoogleIcon />
                                Continue with Google
                            </button>

                            <div className="my-4 flex items-center gap-3">
                                <div className="flex-1 border-t border-border" />
                                <span className="text-[10px] text-text-muted">or</span>
                                <div className="flex-1 border-t border-border" />
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-3">
                                {mode === "signup" && (
                                    <InputField
                                        icon={UserIcon}
                                        type="text"
                                        value={name}
                                        onChange={setName}
                                        placeholder="Full name"
                                    />
                                )}
                                <InputField
                                    icon={Mail}
                                    type="email"
                                    value={email}
                                    onChange={setEmail}
                                    placeholder="Email address"
                                    required
                                />
                                <InputField
                                    icon={Lock}
                                    type="password"
                                    value={password}
                                    onChange={setPassword}
                                    placeholder="Password (min 6 chars)"
                                    required
                                    minLength={6}
                                />

                                {error && (
                                    <p className="rounded-lg bg-error/10 px-3 py-2 text-xs text-error">
                                        {error}
                                    </p>
                                )}

                                {mode === "signup" && (
                                    <label className="flex items-center gap-2.5 text-xs text-text-muted">
                                        <input
                                            type="checkbox"
                                            checked={acceptedTerms}
                                            onChange={(e) => setAcceptedTerms(e.target.checked)}
                                            className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-border accent-accent"
                                        />
                                        <span className="pt-1">
                                            I agree to the{" "}
                                            <Link
                                                href="/terms"
                                                target="_blank"
                                                className="text-accent hover:underline"
                                            >
                                                Terms of Service
                                            </Link>{" "}
                                            and{" "}
                                            <Link
                                                href="/privacy"
                                                target="_blank"
                                                className="text-accent hover:underline"
                                            >
                                                Privacy Policy
                                            </Link>
                                        </span>
                                    </label>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading || (mode === "signup" && !acceptedTerms)}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-semibold text-background hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : mode === "signin" ? (
                                        "Sign In"
                                    ) : (
                                        "Create Account"
                                    )}
                                </button>
                            </form>

                            <p className="mt-4 text-center text-xs text-text-muted">
                                {mode === "signin" ? (
                                    <>
                                        Don&apos;t have an account?{" "}
                                        <button
                                            onClick={() => {
                                                setMode("signup");
                                                setError(null);
                                            }}
                                            className="text-accent hover:underline"
                                        >
                                            Sign up
                                        </button>
                                        {" · "}
                                        <button
                                            onClick={() => {
                                                setMode("forgot");
                                                setError(null);
                                            }}
                                            className="text-accent hover:underline"
                                        >
                                            Forgot password?
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        Already have an account?{" "}
                                        <button
                                            onClick={() => {
                                                setMode("signin");
                                                setError(null);
                                            }}
                                            className="text-accent hover:underline"
                                        >
                                            Sign in
                                        </button>
                                    </>
                                )}
                            </p>
                        </>
                    )}

                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

function InputField({
    icon: Icon,
    type,
    value,
    onChange,
    placeholder,
    required,
    minLength,
}: {
    icon: React.ElementType;
    type: string;
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    required?: boolean;
    minLength?: number;
}) {
    return (
        <div className="relative">
            <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                required={required}
                minLength={minLength}
                className="w-full rounded-xl border border-border bg-surface-elevated py-3 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent/40 focus:outline-none"
            />
        </div>
    );
}

function GoogleIcon() {
    return (
        <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
    );
}
