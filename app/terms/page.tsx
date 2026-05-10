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
                        By using ResumeForge, you agree to these terms. Please read them
                        carefully.
                    </p>
                    <h2 className="text-lg font-semibold text-text-primary">
                        Service Description
                    </h2>
                    <p>
                        ResumeForge provides AI-powered resume optimization tools. The platform
                        enhances existing resume content but does not guarantee interview
                        callbacks, job offers, or specific ATS scores.
                    </p>
                    <h2 className="text-lg font-semibold text-text-primary">
                        User Responsibility
                    </h2>
                    <p>
                        You are responsible for the accuracy of your resume content. While our
                        AI is designed to prevent fabrication, you should review all generated
                        output before submitting it to employers.
                    </p>
                    <h2 className="text-lg font-semibold text-text-primary">
                        Acceptable Use
                    </h2>
                    <p>
                        You agree not to use the platform for any unlawful purpose, to submit
                        false information, or to attempt to reverse-engineer the AI systems.
                    </p>
                    <h2 className="text-lg font-semibold text-text-primary">
                        Limitation of Liability
                    </h2>
                    <p>
                        ResumeForge is provided "as is" without warranties. We are not liable
                        for any outcomes resulting from the use of AI-generated content.
                    </p>
                    <h2 className="text-lg font-semibold text-text-primary">
                        Contact
                    </h2>
                    <p>
                        For questions about these terms, visit our{" "}
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
