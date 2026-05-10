import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import Link from "next/link";

export const metadata = {
    title: "Security — ResumeForge",
};

export default function SecurityPage() {
    return (
        <main className="noise relative min-h-screen">
            <Navbar />
            <div className="mx-auto max-w-3xl px-6 pb-20 pt-28">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent/70">
                    Legal
                </p>
                <h1 className="mb-8 font-display text-3xl text-text-primary sm:text-4xl">
                    Security
                </h1>
                <div className="space-y-6 text-sm leading-relaxed text-text-secondary">
                    <p>
                        ResumeForge takes the security of your data seriously. Here's how we
                        protect it.
                    </p>
                    <h2 className="text-lg font-semibold text-text-primary">
                        Encryption
                    </h2>
                    <p>
                        All data is transmitted over HTTPS/TLS. API keys and secrets are
                        stored as encrypted environment variables, never in source code.
                    </p>
                    <h2 className="text-lg font-semibold text-text-primary">
                        Database Security
                    </h2>
                    <p>
                        User data is stored in Supabase with row-level security policies.
                        Each user can only access their own data. Service role keys are
                        server-side only.
                    </p>
                    <h2 className="text-lg font-semibold text-text-primary">
                        AI Provider Security
                    </h2>
                    <p>
                        Resume data sent to OpenAI and Anthropic is processed over encrypted
                        API connections. Neither provider uses submitted data for model
                        training.
                    </p>
                    <h2 className="text-lg font-semibold text-text-primary">
                        Authentication
                    </h2>
                    <p>
                        The platform supports anonymous authentication by default. No personal
                        information is required to use the service. Optional account creation
                        enables cloud sync and version history.
                    </p>
                    <h2 className="text-lg font-semibold text-text-primary">
                        Reporting Vulnerabilities
                    </h2>
                    <p>
                        If you discover a security vulnerability, please report it through our{" "}
                        <Link href="/support" className="text-accent hover:underline">
                            support page
                        </Link>{" "}
                        with the category "Report a Bug". We respond to all security reports
                        within 48 hours.
                    </p>
                </div>
            </div>
            <Footer />
        </main>
    );
}
