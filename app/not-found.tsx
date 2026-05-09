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
                <Link
                    href="/"
                    className="mt-6 inline-block rounded-xl bg-accent px-6 py-2.5 text-sm font-medium text-background hover:bg-accent-hover"
                >
                    Go home
                </Link>
            </div>
        </div>
    );
}
