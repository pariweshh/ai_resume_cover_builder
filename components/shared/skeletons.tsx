export function WorkspaceSkeleton() {
    return (
        <div className="flex h-screen">
            {/* Sidebar skeleton */}
            <div className="hidden w-64 shrink-0 border-r border-border p-4 lg:block">
                <div className="mb-6 h-6 w-32 animate-pulse rounded bg-surface-elevated" />
                <div className="space-y-2">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="h-10 w-full animate-pulse rounded-lg bg-surface-elevated"
                            style={{ animationDelay: `${i * 0.05}s` }}
                        />
                    ))}
                </div>
                <div className="absolute bottom-4 left-4 right-4 space-y-2">
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="h-9 w-full animate-pulse rounded-lg bg-surface-elevated"
                        />
                    ))}
                </div>
            </div>

            {/* Main content skeleton */}
            <div className="flex flex-1 flex-col">
                {/* Header skeleton */}
                <div className="flex h-14 items-center justify-between border-b border-border px-6">
                    <div className="h-4 w-36 animate-pulse rounded bg-surface-elevated" />
                    <div className="flex gap-2">
                        <div className="h-8 w-20 animate-pulse rounded-lg bg-surface-elevated" />
                        <div className="h-8 w-20 animate-pulse rounded-lg bg-surface-elevated" />
                    </div>
                </div>

                {/* Content skeleton */}
                <div className="flex-1 p-8">
                    <div className="mx-auto max-w-2xl space-y-6">
                        <div className="h-8 w-64 animate-pulse rounded bg-surface-elevated" />
                        <div className="h-4 w-80 animate-pulse rounded bg-surface-elevated" />
                        <div className="h-48 w-full animate-pulse rounded-xl bg-surface-elevated" />
                        <div className="h-10 w-full animate-pulse rounded-xl bg-surface-elevated" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function EditorSkeleton() {
    return (
        <div className="flex h-full">
            <div className="flex-1 space-y-6 p-8">
                <div className="h-6 w-24 animate-pulse rounded bg-surface-elevated" />
                <div className="h-10 w-full animate-pulse rounded-lg bg-surface-elevated" />
                <div className="h-10 w-3/4 animate-pulse rounded-lg bg-surface-elevated" />
                <div className="h-6 w-20 animate-pulse rounded bg-surface-elevated" />
                <div className="space-y-2">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className="h-8 w-full animate-pulse rounded-lg bg-surface-elevated"
                            style={{ animationDelay: `${i * 0.05}s` }}
                        />
                    ))}
                </div>
            </div>
            <div className="w-80 space-y-4 border-l border-border p-4">
                <div className="h-40 w-full animate-pulse rounded-xl bg-surface-elevated" />
                <div className="h-6 w-32 animate-pulse rounded bg-surface-elevated" />
                <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="h-6 w-full animate-pulse rounded bg-surface-elevated"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
