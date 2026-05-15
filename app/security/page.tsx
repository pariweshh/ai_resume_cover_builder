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
                        ResumeForge takes the security of your data seriously. This page
                        describes the measures we protect your information.
                    </p>

                    <h2 className="text-lg font-semibold text-text-primary">
                        Encryption
                    </h2>
                    <p>
                        All data is transmitted over HTTPS/TLS. API keys and secrets are
                        stored as encrypted environment variables, never in source code or
                        version control.
                    </p>

                    <h2 className="text-lg font-semibold text-text-primary">
                        Authentication
                    </h2>
                    <p>
                        All users must authenticate to use the platform. ResumeForge
                        supports email/password authentication and Google OAuth, managed by
                        Supabase Auth. Sessions are secured with industry-standard JWT
                        tokens.
                    </p>

                    <h2 className="text-lg font-semibold text-text-primary">
                        Database Security
                    </h2>
                    <p>
                        User data is stored in Supabase (hosted on AWS infrastructure) with
                        row-level security (RLS) policies. Each user can only access their
                        own workspace, profile, and generation history. Service role keys
                        are used only on the server side.
                    </p>

                    <h2 className="text-lg font-semibold text-text-primary">
                        Workspace Data
                    </h2>
                    <p>
                        Your workspace (resume, edits, ATS scores, cover letter) is stored
                        in a dedicated table with RLS. Workspace state is saved
                        automatically after changes and on page unload via an encrypted
                        connection. When you start over or delete your account, workspace
                        data is permanently removed.
                    </p>

                    <h2 className="text-lg font-semibold text-text-primary">
                        Payment Security
                    </h2>
                    <p>
                        All payments are processed by Stripe, a PCI Level 1 certified
                        payment processor. ResumeForge does not store your credit card
                        number, CVV, or full payment details. Stripe handles all payment
                        data in compliance with PCI DSS requirements.
                    </p>

                    <h2 className="text-lg font-semibold text-text-primary">
                        AI Provider Security
                    </h2>
                    <p>
                        Resume data sent to OpenAI and Anthropic is processed over encrypted
                        API connections. Neither provider uses submitted data for model
                        training when accessed through their API services. Processing is
                        ephemeral — data is not retained after the API response is returned.
                    </p>

                    <h2 className="text-lg font-semibold text-text-primary">
                        Reporting Vulnerabilities
                    </h2>
                    <p>
                        If you discover a security vulnerability, please report it through
                        our{" "}
                        <Link href="/support" className="text-accent hover:underline">
                            support page
                        </Link>{" "}
                        with the category "Report a Bug". We respond to all security reports
                        within 48 hours and will provide updates as the issue is
                        investigated and resolved.
                    </p>

                    <h2 className="text-lg font-semibold text-text-primary">
                        Responsible Disclosure
                    </h2>
                    <p>
                        We appreciate responsible disclosure. If you report a vulnerability
                        in good faith and do not exploit it beyond what is necessary to
                        demonstrate the issue, we will not take legal action against you and
                        will work with you to resolve the issue promptly.
                    </p>

                    <h2 className="text-lg font-semibold text-text-primary">
                        Data Breach Notification
                    </h2>
                    <p>
                        In the event of an eligible data breach, we will notify affected
                        users and the Office of the Australian Information Commissioner
                        (OAIC) in accordance with the Notifiable Data Breaches scheme under
                        Part IIIC of the Privacy Act 1988.
                    </p>
                </div>
            </div>
            <Footer />
        </main>
    );
}
