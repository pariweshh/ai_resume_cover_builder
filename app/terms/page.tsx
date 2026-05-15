import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import Link from "next/link";

export const metadata = {
    title: "Terms of Service — ResumeForge",
};

export default function TermsPage() {
    return (
        <main className="noise relative min-h-screen">
            <Navbar />
            <div className="mx-auto max-w-3xl px-6 pb-20 pt-28">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent/70">
                    Legal
                </p>
                <h1 className="mb-8 font-display text-3xl text-text-primary sm:text-4xl">
                    Terms of Service
                </h1>
                <div className="space-y-6 text-sm leading-relaxed text-text-secondary">
                    <p>
                        These Terms of Service ("Terms") govern your use of ResumeForge
                        ("the service", "the platform"), operated by ResumeForge ("we",
                        "us", "our"). By creating an account or using the service, you agree
                        to be bound by these Terms.
                    </p>

                    <h2 className="text-lg font-semibold text-text-primary">
                        1. Account Registration
                    </h2>
                    <p>
                        You must create an account to use ResumeForge. You may register
                        using an email address and password, or through Google OAuth. You are
                        responsible for maintaining the security of your account credentials.
                    </p>
                    <p>
                        You must provide accurate information when creating your account. We
                        reserve the right to suspend accounts that provide false or
                        misleading information.
                    </p>

                    <h2 className="text-lg font-semibold text-text-primary">
                        2. Service Description
                    </h2>
                    <p>
                        ResumeForge provides AI-powered resume optimization tools,
                        including:
                    </p>
                    <ul className="ml-4 list-disc space-y-1">
                        <li>Resume parsing and structured data extraction</li>
                        <li>Job description analysis and keyword extraction</li>
                        <li>AI-powered resume enhancement with anti-hallucination enforcement</li>
                        <li>ATS compatibility scoring</li>
                        <li>Cover letter generation</li>
                        <li>Bullet point regeneration</li>
                        <li>PDF and DOCX export</li>
                        <li>Section reordering and inline editing</li>
                    </ul>
                    <p>
                        The service does not guarantee interview callbacks, job offers,
                        specific ATS scores, or any particular employment outcome. AI
                        outputs are suggestions that you must review before use.
                    </p>

                    <h2 className="text-lg font-semibold text-text-primary">
                        3. Subscription Plans and Billing
                    </h2>
                    <p>
                        ResumeForge offers the following plans:
                    </p>
                    <ul className="ml-4 list-disc space-y-1">
                        <li><strong>Free:</strong> 2 generations per month, basic ATS score, watermarked PDF export</li>
                        <li><strong>Pro:</strong> $12/month or $99/year — unlimited generations, cover letters, bullet regeneration, clean PDF/DOCX export</li>
                        <li><strong>Lifetime:</strong> $199 one-time payment — permanent access to all Pro features</li>
                    </ul>
                    <p>
                        All payments are processed securely by Stripe. Prices are in
                        Australian dollars (AUD) unless otherwise stated.
                    </p>
                    <p>
                        Monthly and yearly subscriptions are billed on a recurring basis
                        until cancelled. You may cancel at any time through your account
                        settings or the Stripe customer portal. Cancellation takes effect at
                        the end of the current billing period — you retain access until then.
                    </p>

                    <h2 className="text-lg font-semibold text-text-primary">
                        4. Consumer Guarantees
                    </h2>
                    <p>
                        Our goods and services come with guarantees that cannot be excluded
                        under the Australian Consumer Law (Schedule 2 of the Competition and
                        Consumer Act 2010). Nothing in these Terms is intended to exclude or
                        restrict any consumer guarantee that applies by law.
                    </p>
                    <p>
                        If we fail to comply with a consumer guarantee, you are entitled to:
                    </p>
                    <ul className="ml-4 list-disc space-y-1">
                        <li>
                            <strong>Major failure:</strong> A refund for the unused portion of
                            your subscription, or compensation for the reduction in value
                        </li>
                        <li>
                            <strong>Minor failure:</strong> We will re-supply the service or
                            provide a refund at your choice
                        </li>
                    </ul>
                    <p>
                        A major failure includes situations where the service is not
                        provided with acceptable care and skill, is not fit for its stated
                        purpose, or is substantially unfit for its purpose and cannot easily
                        be remedied.
                    </p>

                    <h2 className="text-lg font-semibold text-text-primary">
                        5. Refund Policy
                    </h2>
                    <p>
                        Refunds are provided in accordance with Australian Consumer Law. You
                        may request a refund through our{" "}
                        <Link href="/support" className="text-accent hover:underline">
                            support page
                        </Link>
                        .
                    </p>
                    <p>
                        <strong>Monthly and yearly subscriptions:</strong> We do not provide
                        pro-rata refunds for partial billing periods when you voluntarily
                        cancel, except where required by Australian Consumer Law.
                    </p>
                    <p>
                        <strong>Lifetime purchases:</strong> Refund requests made within 14
                        days of purchase will be assessed on a case-by-case basis, provided
                        the service has not been substantially used (more than 5
                        generations).
                    </p>
                    <p>
                        <strong>Change of mind:</strong> Change of mind refunds are not
                        provided for digital services, consistent with Australian Consumer
                        Law provisions. However, we will always honour your statutory rights.
                    </p>

                    <h2 className="text-lg font-semibold text-text-primary">
                        6. User Responsibility
                    </h2>
                    <p>
                        You are responsible for:
                    </p>
                    <ul className="ml-4 list-disc space-y-1">
                        <li>
                            The accuracy of your resume content. While our AI is designed to
                            prevent fabrication, you must review all generated output before
                            submitting it to employers
                        </li>
                        <li>
                            Ensuring that the information you provide is truthful and does not
                            mislead prospective employers
                        </li>
                        <li>
                            Keeping your account credentials secure and not sharing your
                            account with others
                        </li>
                        <li>
                            Complying with all applicable laws when using the service
                        </li>
                    </ul>

                    <h2 className="text-lg font-semibold text-text-primary">
                        7. Acceptable Use
                    </h2>
                    <p>You agree not to:</p>
                    <ul className="ml-4 list-disc space-y-1">
                        <li>Use the platform for any unlawful purpose</li>
                        <li>Attempt to reverse-engineer, decompile, or extract the AI models or prompts</li>
                        <li>Use automated tools to access the service beyond normal usage</li>
                        <li>Submit content that infringes on third-party intellectual property</li>
                        <li>Attempt to circumvent usage limits or billing mechanisms</li>
                        <li>Resell or redistribute the service without written permission</li>
                    </ul>
                    <p>
                        We reserve the right to suspend or terminate accounts that violate
                        these terms, with reasonable notice where practicable.
                    </p>

                    <h2 className="text-lg font-semibold text-text-primary">
                        8. Intellectual Property
                    </h2>
                    <p>
                        You retain full ownership of your resume content and any material
                        you provide to the service. The AI-enhanced outputs generated by the
                        service are provided to you as part of the service and you may use
                        them freely.
                    </p>
                    <p>
                        ResumeForge and its underlying technology (including the AI pipeline,
                        prompts, algorithms, and software) are our intellectual property.
                    </p>

                    <h2 className="text-lg font-semibold text-text-primary">
                        9. Limitation of Liability
                    </h2>
                    <p>
                        To the maximum extent permitted by law (and subject to any
                        non-excludable consumer guarantees under the Australian Consumer
                        Law):
                    </p>
                    <ul className="ml-4 list-disc space-y-1">
                        <li>
                            ResumeForge is provided "as is" without warranties of any kind,
                            express or implied
                        </li>
                        <li>
                            We are not liable for any indirect, incidental, special, or
                            consequential damages, including loss of employment opportunities
                            arising from the use of AI-generated content
                        </li>
                        <li>
                            Our total liability for any claim related to the service is limited
                            to the amount you paid for the service in the 12 months preceding
                            the claim
                        </li>
                    </ul>

                    <h2 className="text-lg font-semibold text-text-primary">
                        10. Dispute Resolution
                    </h2>
                    <p>
                        If you have a complaint or dispute, please contact us first through
                        our{" "}
                        <Link href="/support" className="text-accent hover:underline">
                            support page
                        </Link>
                        . We will attempt to resolve the matter within 14 business days.
                    </p>
                    <p>
                        If we cannot resolve the dispute, you may refer the matter to:
                    </p>
                    <ul className="ml-4 list-disc space-y-1">
                        <li>
                            The Australian Competition and Consumer Commission (ACCC) at{" "}
                            <a
                                href="https://www.accc.gov.au"
                                className="text-accent hover:underline"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                www.accc.gov.au
                            </a>
                        </li>
                        <li>
                            Your state or territory consumer protection agency
                        </li>
                        <li>
                            The relevant state or territory tribunal (e.g., NCAT, VCAT, QCAT)
                        </li>
                    </ul>
                    <p>
                        These Terms are governed by the laws of Australia. Any legal
                        proceedings shall be brought in the courts of the relevant Australian
                        state or territory.
                    </p>

                    <h2 className="text-lg font-semibold text-text-primary">
                        11. Changes to These Terms
                    </h2>
                    <p>
                        We may update these Terms from time to time. Material changes will
                        be communicated via email or a notice on the platform at least 14
                        days before they take effect. Continued use of the service after
                        changes take effect constitutes acceptance.
                    </p>

                    <h2 className="text-lg font-semibold text-text-primary">
                        12. Contact
                    </h2>
                    <p>
                        For questions about these Terms, contact us through our{" "}
                        <Link href="/support" className="text-accent hover:underline">
                            support page
                        </Link>
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
