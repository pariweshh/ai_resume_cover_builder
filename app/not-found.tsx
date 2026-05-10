import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-6">
            <div className="text-center">
                <p className="font-mono text-sm text-accent">404</p>
                <h2 className="mt-2 font-display text-3xl text-text-primary">
                    Page not found
                </h2>
                <p className="mt-2 text-sm text-text-secondary">
                    The page you're looking for doesn't exist.
                </p>
                <div className="mt-8 flex items-center justify-center gap-3">
                    <Link
                        href="/"
                        className="rounded-xl bg-accent px-6 py-2.5 text-sm font-medium text-background hover:bg-accent-hover"
                    >
                        Go home
                    </Link>
                    <Link
                        href="/support"
                        className="rounded-xl border border-border px-6 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                    >
                        Contact support
                    </Link>
                </div>
            </div>
        </div>
    );
}
