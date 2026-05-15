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
                                q: "Do I need an account to use ResumeForge?",
                                a: "Yes. All users must create a free account to access the platform. This allows us to securely store your workspace — your resume, job description, edits, and scores — so everything is preserved when you return on any device.",
                            },
                            {
                                q: "Is my resume data stored securely?",
                                a: "Yes. All data is stored in Supabase with row-level security. Each user can only access their own data. All connections are encrypted over HTTPS/TLS. We never share your resume data with third parties beyond the AI providers (OpenAI and Anthropic) that process it during generation.",
                            },
                            {
                                q: "Will the AI fabricate experience on my resume?",
                                a: "No. The platform uses a strict anti-hallucination system with evidence mapping, validation scoring, and post-processing corrections. The AI only enhances existing content — it never invents experience, metrics, or technologies.",
                            },
                            {
                                q: "What does the free plan include?",
                                a: "The free plan includes 2 resume generations per month, basic ATS scoring, and PDF export with a watermark. To unlock unlimited generations, cover letter generation, bullet regeneration, and clean PDF/DOCX export, upgrade to Pro or Lifetime.",
                            },
                            {
                                q: "Can I cancel my subscription?",
                                a: "Yes. You can cancel at any time from your account settings or the Stripe customer portal. Your Pro features remain active until the end of your current billing period. Monthly and yearly plans are non-refundable for partial periods, in accordance with Australian Consumer Law provisions for digital services.",
                            },
                            {
                                q: "What is the Lifetime plan?",
                                a: "The Lifetime plan is a one-time payment of $199 that gives you permanent access to all Pro features — unlimited generations, cover letters, bullet regeneration, clean exports, and any future Pro updates. No recurring charges.",
                            },
                            {
                                q: "Can I edit the AI-generated resume?",
                                a: "Yes. The editor allows inline editing of every section, individual bullet regeneration, section locking, drag-to-rearrange sections, and a live preview that updates in real time.",
                            },
                            {
                                q: "What formats can I export to?",
                                a: "PDF and DOCX. Both are ATS-safe — single-column layout, no graphics, no tables, clean typography that passes through applicant tracking systems. You can choose from five ATS-safe fonts.",
                            },
                            {
                                q: "Does my resume stay on your servers after I delete it?",
                                a: "When you click 'Start Over' or delete your account, your workspace data is permanently removed from our database. AI providers (OpenAI and Anthropic) do not retain your data for model training, and API data is processed ephemerally.",
                            },
                            {
                                q: "I have a billing issue or want a refund. What do I do?",
                                a: "Contact us through the form above with the category 'Billing'. Under Australian Consumer Law, you may be entitled to a refund if the service is not provided as described. We assess all refund requests on a case-by-case basis.",
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