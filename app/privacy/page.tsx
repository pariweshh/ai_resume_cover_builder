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
                        ResumeForge ("we", "us", "our") is committed to protecting your
                        privacy in accordance with the Australian Privacy Act 1988 (Cth)
                        and the Australian Privacy Principles (APPs). This policy explains
                        how we collect, use, store, and disclose your personal information.
                    </p>

                    <h2 className="text-lg font-semibold text-text-primary">
                        1. Information We Collect
                    </h2>
                    <p>
                        <strong>Account information:</strong> When you create an account, we
                        collect your email address and name. If you sign in via Google, we
                        receive your name and email from Google.
                    </p>
                    <p>
                        <strong>Resume data:</strong> Your resume content, job descriptions,
                        edits, AI-generated outputs, ATS scores, and cover letters are stored
                        in your workspace.
                    </p>
                    <p>
                        <strong>Billing information:</strong> Payments are processed by
                        Stripe. We store your Stripe customer ID, subscription tier, and
                        subscription status. We do not store your credit card number — Stripe
                        handles all payment data in compliance with PCI DSS.
                    </p>
                    <p>
                        <strong>Usage data:</strong> We track the number of generations used
                        per billing period to enforce plan limits.
                    </p>
                    <p>
                        <strong>Device preferences:</strong> Font selection, enhancement
                        tone, ATS scoring weights, and export format preferences are stored
                        locally in your browser.
                    </p>

                    <h2 className="text-lg font-semibold text-text-primary">
                        2. How We Use Your Information
                    </h2>
                    <p>We use your information to:</p>
                    <ul className="ml-4 list-disc space-y-1">
                        <li>Provide, maintain, and improve the ResumeForge service</li>
                        <li>Process AI-powered resume enhancements and cover letter generation</li>
                        <li>Manage your subscription and process payments via Stripe</li>
                        <li>Store and sync your workspace across devices</li>
                        <li>Respond to support requests and feedback</li>
                        <li>Enforce plan limits and prevent abuse</li>
                    </ul>
                    <p>
                        We do not use your resume data for advertising, profiling, or any
                        purpose unrelated to providing the service.
                    </p>

                    <h2 className="text-lg font-semibold text-text-primary">
                        3. AI Processing
                    </h2>
                    <p>
                        Your resume and job description text is sent to third-party AI
                        providers (OpenAI and Anthropic) for processing during generation.
                        These transmissions occur over encrypted connections.
                    </p>
                    <p>
                        <strong>OpenAI:</strong> Processes resume parsing, job description
                        analysis, evidence mapping, and ATS scoring. OpenAI does not use API
                        data for model training.
                    </p>
                    <p>
                        <strong>Anthropic (Claude):</strong> Processes resume enhancement,
                        cover letter generation, and bullet regeneration. Anthropic does not
                        use API data for model training.
                    </p>
                    <p>
                        AI processing is ephemeral — the providers process your data and
                        return results. They do not retain your resume content.
                    </p>

                    <h2 className="text-lg font-semibold text-text-primary">
                        4. Data Storage and Security
                    </h2>
                    <p>
                        All data is stored in Supabase (hosted on AWS infrastructure) with
                        row-level security. Each user can only access their own data. All
                        connections are encrypted over HTTPS/TLS.
                    </p>
                    <p>
                        API keys and secrets are stored as encrypted environment variables,
                        never in source code. Service role keys are server-side only.
                    </p>
                    <p>
                        Your workspace data (resume, edits, scores, cover letter) is stored
                        for as long as your account exists. When you start over or delete
                        your account, workspace data is permanently removed.
                    </p>

                    <h2 className="text-lg font-semibold text-text-primary">
                        5. Data Disclosure
                    </h2>
                    <p>
                        We do not sell, rent, or trade your personal information. We disclose
                        information only to:
                    </p>
                    <ul className="ml-4 list-disc space-y-1">
                        <li>
                            <strong>AI providers</strong> (OpenAI, Anthropic) — to process your
                            resume during generation
                        </li>
                        <li>
                            <strong>Stripe</strong> — to process subscription payments
                        </li>
                        <li>
                            <strong>Supabase</strong> — to store your account and workspace data
                        </li>
                        <li>
                            <strong>Resend</strong> — to deliver feedback emails you submit
                            through the support page
                        </li>
                    </ul>
                    <p>
                        These providers process data on our behalf under contractual
                        obligations to protect your information.
                    </p>

                    <h2 className="text-lg font-semibold text-text-primary">
                        6. Cookies
                    </h2>
                    <p>
                        We use essential cookies for authentication and session management
                        (via Supabase Auth). No tracking, advertising, or analytics cookies
                        are used.
                    </p>

                    <h2 className="text-lg font-semibold text-text-primary">
                        7. Your Rights Under Australian Law
                    </h2>
                    <p>
                        Under the Australian Privacy Act 1988, you have the right to:
                    </p>
                    <ul className="ml-4 list-disc space-y-1">
                        <li>Access the personal information we hold about you</li>
                        <li>Request correction of inaccurate information</li>
                        <li>Request deletion of your personal information</li>
                        <li>Withdraw consent for data processing</li>
                        <li>Lodge a complaint with the Office of the Australian Information Commissioner (OAIC) if you believe your privacy has been breached</li>
                    </ul>
                    <p>
                        To exercise any of these rights, contact us through our{" "}
                        <Link href="/support" className="text-accent hover:underline">
                            support page
                        </Link>
                        . We will respond to your request within 30 days as required by the
                        APPs.
                    </p>

                    <h2 className="text-lg font-semibold text-text-primary">
                        8. Notifiable Data Breaches
                    </h2>
                    <p>
                        In the event of an eligible data breach that is likely to result in
                        serious harm, we will notify affected individuals and the Office of
                        the Australian Information Commissioner (OAIC) in accordance with the
                        Notifiable Data Breaches (NDB) scheme under Part IIIC of the Privacy
                        Act 1988.
                    </p>

                    <h2 className="text-lg font-semibold text-text-primary">
                        9. Overseas Disclosure
                    </h2>
                    <p>
                        Some of our service providers (Supabase, Stripe, OpenAI, Anthropic)
                        are based overseas, including in the United States. We take
                        reasonable steps to ensure these overseas recipients comply with the
                        Australian Privacy Principles or are subject to substantially similar
                        privacy protections, as required by APP 8.
                    </p>

                    <h2 className="text-lg font-semibold text-text-primary">
                        10. Changes to This Policy
                    </h2>
                    <p>
                        We may update this policy from time to time. Material changes will be
                        communicated via email or a notice on the platform. Continued use of
                        the service after changes constitutes acceptance of the updated
                        policy.
                    </p>

                    <h2 className="text-lg font-semibold text-text-primary">
                        11. Contact
                    </h2>
                    <p>
                        For privacy inquiries, data access requests, or complaints, contact
                        us through our{" "}
                        <Link href="/support" className="text-accent hover:underline">
                            support page
                        </Link>
                        . If you are not satisfied with our response, you may contact the
                        Office of the Australian Information Commissioner at{" "}
                        <a
                            href="https://www.oaic.gov.au"
                            className="text-accent hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            www.oaic.gov.au
                        </a>
                        .
                    </p>

                    <p className="text-xs text-text-muted">
                        Last updated:{" "}
                        {new Date().toLocaleDateString("en-AU", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                        })}
                    </p>
                </div>
            </div>
            <Footer />
        </main>
    );
}
