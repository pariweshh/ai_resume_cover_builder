import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import Link from "next/link";

export const metadata = {
    title: "Privacy Policy — ResumeForge",
};

export default function PrivacyPage() {
    return (
        <main className="noise relative min-h-screen">
            <Navbar />
            <div className="mx-auto max-w-3xl px-6 pb-20 pt-28">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent/70">
                    Legal
                </p>
                <h1 className="mb-8 font-display text-3xl text-text-primary sm:text-4xl">
                    Privacy Policy
                </h1>
                <div className="space-y-6 text-sm leading-relaxed text-text-secondary">
                    <p>
                        ResumeForge respects your privacy. This policy explains how we collect,
                        use, and protect your information.
                    </p>
                    <h2 className="text-lg font-semibold text-text-primary">
                        Data Storage
                    </h2>
                    <p>
                        Resume data is stored locally in your browser by default. If you create
                        an account, your data is stored in Supabase with row-level security.
                        You can delete your data at any time.
                    </p>
                    <h2 className="text-lg font-semibold text-text-primary">
                        AI Processing
                    </h2>
                    <p>
                        Your resume and job description text is sent to OpenAI and Anthropic
                        APIs for processing. These providers do not use your data for model
                        training. Data is transmitted over encrypted connections.
                    </p>
                    <h2 className="text-lg font-semibold text-text-primary">
                        Cookies
                    </h2>
                    <p>
                        We use essential cookies for authentication and session management.
                        No tracking or advertising cookies are used.
                    </p>
                    <h2 className="text-lg font-semibold text-text-primary">
                        Contact
                    </h2>
                    <p>
                        For privacy inquiries, visit our{" "}
                        <Link href="/support" className="text-accent hover:underline">
                            support page
                        </Link>.
                    </p>
                    <p className="text-xs text-text-muted">
                        Last updated: {new Date().toLocaleDateString("en-AU", { month: "long", year: "numeric" })}
                    </p>
                </div>
            </div>
            <Footer />
        </main>
    );
}
