import { Navbar } from "@/components/landing/navbar";
import { FeedbackForm } from "@/components/support/feedback-form";
import { Footer } from "@/components/landing/footer";

export const metadata = {
    title: "Support — ResumeForge",
    description: "Get help, report bugs, or suggest features for ResumeForge.",
};

export default function SupportPage() {
    return (
        <main className="noise relative min-h-screen">
            <Navbar />
            <div className="mx-auto max-w-4xl px-6 pb-20 pt-28">
                <div className="mb-12 text-center">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent/70">
                        Support
                    </p>
                    <h1 className="font-display text-3xl text-text-primary sm:text-4xl">
                        How can we <span className="text-gradient-accent italic">help</span>?
                    </h1>
                    <p className="mx-auto mt-4 max-w-lg text-sm text-text-secondary">
                        Found a bug? Want a feature? Have thoughts on how we can improve?
                        We read every submission.
                    </p>
                </div>

                <FeedbackForm />

                {/* FAQ */}
                <div className="mx-auto mt-20 max-w-2xl">
                    <h2 className="mb-8 text-center font-display text-2xl text-text-primary">
                        Common Questions
                    </h2>
                    <div className="space-y-4">
                        {[
                            {
                                q: "Is my data stored permanently?",
                                a: "Resumes are stored locally in your browser by default. If you create an account, data is stored in Supabase with row-level security. You can delete your data at any time.",
                            },
                            {
                                q: "Will the AI fabricate experience on my resume?",
                                a: "No. The platform uses a strict anti-hallucination system with evidence mapping, validation scoring, and post-processing corrections. The AI only enhances existing content — it never invents experience, metrics, or technologies.",
                            },
                            {
                                q: "How much does each generation cost?",
                                a: "ResumeForge runs a 7-stage pipeline using GPT-4o and Claude Sonnet. Each full generation costs approximately $0.20 in API usage. This is covered by your subscription.",
                            },
                            {
                                q: "Can I edit the AI-generated resume?",
                                a: "Yes. The editor allows inline editing of every section, individual bullet regeneration, section locking, and comparison between original and optimized versions.",
                            },
                            {
                                q: "What formats can I export to?",
                                a: "PDF and DOCX. Both are ATS-safe — single-column layout, no graphics, no tables, clean typography that passes through applicant tracking systems.",
                            },
                        ].map((faq) => (
                            <div
                                key={faq.q}
                                className="rounded-xl border border-border bg-surface p-5"
                            >
                                <h3 className="text-sm font-semibold text-text-primary">
                                    {faq.q}
                                </h3>
                                <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                                    {faq.a}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
