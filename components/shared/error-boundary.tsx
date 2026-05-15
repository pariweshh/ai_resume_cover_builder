"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { RotateCcw, Home } from "lucide-react";

type Props = {
    children: ReactNode;
    fallback?: ReactNode;
};

type State = {
    hasError: boolean;
    error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error("[ErrorBoundary]", error, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-error/10">
                        <span className="text-lg font-bold text-error">!</span>
                    </div>
                    <h2 className="mb-2 text-sm font-semibold text-text-primary">
                        Something went wrong
                    </h2>
                    <p className="mb-6 max-w-sm text-xs text-text-secondary">
                        An unexpected error occurred. You can try reloading the page or
                        starting over. Your data is safely stored on the server.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                this.setState({ hasError: false, error: null });
                                window.location.reload();
                            }}
                            className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-medium text-background hover:bg-accent-hover"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Reload page
                        </button>
                        <a
                            href="/dashboard"
                            onClick={() => {
                                // Clear the error state so navigating back doesn't re-trigger
                                this.setState({ hasError: false, error: null });
                            }}
                            className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-xs font-medium text-text-secondary hover:bg-surface-hover"
                        >
                            <Home className="h-3.5 w-3.5" />
                            Dashboard
                        </a>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
