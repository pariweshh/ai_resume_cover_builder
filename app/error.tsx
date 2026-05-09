"use client";

export default function ErrorPage({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-6">
            <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-error/10">
                    <span className="text-xl">!</span>
                </div>
                <h2 className="font-display text-2xl text-text-primary">
                    Something went wrong
                </h2>
                <p className="mt-2 max-w-md text-sm text-text-secondary">
                    {error.message || "An unexpected error occurred."}
                </p>
                <button
                    onClick={reset}
                    className="mt-6 rounded-xl bg-accent px-6 py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent-hover"
                >
                    Try again
                </button>
            </div>
        </div>
    );
}
