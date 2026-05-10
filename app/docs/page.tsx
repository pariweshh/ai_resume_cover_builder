import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import {
    FileSearch,
    Target,
    GitMerge,
    PenTool,
    BarChart3,
    Mail,
    ShieldCheck,
    Edit3,
    Download,
    Lock,
    RefreshCw,
    ArrowRight,
    Settings,
    Type,
    Sliders,
    Upload,
    Briefcase,
    Sparkles,
} from "lucide-react";

export const metadata = {
    title: "Documentation — ResumeForge",
    description:
        "Learn how ResumeForge works, from resume parsing to ATS-optimized export.",
};

export default function DocsPage() {
    return (
        <main className="noise relative min-h-screen">
            <Navbar />
            <div className="mx-auto max-w-4xl px-6 pb-20 pt-28">
                {/* Header */}
                <div className="mb-16 text-center">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent/70">
                        Documentation
                    </p>
                    <h1 className="font-display text-3xl text-text-primary sm:text-4xl md:text-5xl">
                        How ResumeForge{" "}
                        <span className="text-gradient-accent italic">works</span>
                    </h1>
                    <p className="mx-auto mt-4 max-w-lg text-base text-text-secondary">
                        A deep dive into the AI pipeline, architecture, and design decisions
                        behind the platform.
                    </p>
                </div>

                {/* Table of Contents */}
                <div className="mb-16 rounded-xl border border-border bg-surface p-6">
                    <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
                        On this page
                    </h3>
                    <div className="grid gap-2 sm:grid-cols-2">
                        {[
                            "Overview",
                            "Quick Start",
                            "AI Pipeline",
                            "Anti-Hallucination System",
                            "ATS Scoring",
                            "Skills Formatting",
                            "Inline Editor",
                            "Bullet Regeneration",
                            "Cover Letter",
                            "Export System",
                            "Settings",
                            "API Reference",
                            "Cost Breakdown",
                        ].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
                            >
                                <ArrowRight className="h-3 w-3 text-accent/50" />
                                {item}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Overview */}
                <DocSection id="overview" title="Overview">
                    <p>
                        ResumeForge is an AI-powered ATS resume optimization platform. It
                        takes your existing resume and a target job description, then runs a
                        7-stage AI pipeline to produce an ATS-optimized resume and tailored
                        cover letter.
                    </p>
                    <p>
                        The critical differentiator: ResumeForge never fabricates content.
                        Every enhancement is grounded in evidence from your original resume.
                        A dedicated validation layer scores the output for trustworthiness.
                    </p>
                    <p>
                        All settings — including export font, enhancement tone, and ATS
                        scoring weights — are stored locally and work without user accounts.
                        Data can be backed up and restored via JSON export/import.
                    </p>
                </DocSection>

                {/* Quick Start */}
                <DocSection id="quick-start" title="Quick Start">
                    <div className="space-y-4">
                        {[
                            {
                                step: 1,
                                icon: Upload,
                                title: "Upload your resume",
                                description:
                                    "Drop a PDF, DOCX, or paste raw text. The platform extracts and parses the content into structured data.",
                            },
                            {
                                step: 2,
                                icon: Briefcase,
                                title: "Paste the job description",
                                description:
                                    "Add the target job posting. Our AI extracts keywords, required skills, and seniority expectations.",
                            },
                            {
                                step: 3,
                                icon: Sparkles,
                                title: "Generate",
                                description:
                                    "Click generate. The 7-stage pipeline runs in real-time with live progress updates. Takes under 30 seconds.",
                            },
                            {
                                step: 4,
                                icon: Edit3,
                                title: "Review and edit",
                                description:
                                    "Use the inline editor to adjust any section. Lock sections you like, regenerate bullets you don't.",
                            },
                            {
                                step: 5,
                                icon: Download,
                                title: "Export",
                                description:
                                    "Download as ATS-safe PDF or DOCX. Single-column, no graphics, recruiter-optimized formatting.",
                            },
                        ].map((item) => (
                            <div
                                key={item.step}
                                className="flex items-start gap-4 rounded-xl border border-border bg-surface p-5"
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                                    <item.icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-text-primary">
                                        {item.step}. {item.title}
                                    </h3>
                                    <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </DocSection>

                {/* AI Pipeline */}
                <DocSection id="ai-pipeline" title="AI Pipeline">
                    <p>
                        The pipeline is NOT a single monolithic prompt. It consists of 7
                        distinct stages, each optimized for a specific task.
                    </p>
                    <div className="mt-6 space-y-3">
                        {[
                            {
                                icon: FileSearch,
                                step: "01",
                                title: "Resume Parsing",
                                model: "GPT-4o",
                                description:
                                    "Extracts structured JSON from raw resume text — contact info, experience, education, projects, skills, and technologies.",
                            },
                            {
                                icon: Target,
                                step: "02",
                                title: "Job Description Analysis",
                                model: "GPT-4o",
                                description:
                                    "Extracts ATS keywords, required/preferred skills, seniority expectations, repeated terminology, and responsibilities.",
                            },
                            {
                                icon: GitMerge,
                                step: "03",
                                title: "Evidence Mapping",
                                model: "GPT-4o",
                                description:
                                    "Maps job requirements against verified resume evidence. Supported keywords are enhanced. Unsupported keywords are rejected.",
                            },
                            {
                                icon: PenTool,
                                step: "04",
                                title: "Resume Enhancement",
                                model: "Claude Sonnet",
                                description:
                                    "Rewrites bullets with stronger action verbs, better clarity, and ATS alignment. Tone is controlled by settings (conservative/balanced/aggressive).",
                            },
                            {
                                icon: BarChart3,
                                step: "05",
                                title: "ATS Scoring",
                                model: "GPT-4o",
                                description:
                                    "Scores across keyword match, formatting, readability, impact, and completeness. Weights are customizable in settings.",
                            },
                            {
                                icon: Mail,
                                step: "06",
                                title: "Cover Letter Generation",
                                model: "Claude Sonnet",
                                description:
                                    "Generates a tailored cover letter with proper letter format, anti-AI-detection rules, and the candidate's actual contact information.",
                            },
                            {
                                icon: ShieldCheck,
                                step: "07",
                                title: "Validation",
                                model: "GPT-4o",
                                description:
                                    "Compares enhanced output against original input. Flags fabricated claims, invented metrics, and unsupported technologies.",
                            },
                        ].map((stage) => (
                            <div
                                key={stage.step}
                                className="flex items-start gap-4 rounded-xl border border-border bg-surface p-5"
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.03] ring-1 ring-white/[0.06]">
                                    <stage.icon className="h-5 w-5 text-text-muted" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-[11px] text-accent/50">
                                            {stage.step}
                                        </span>
                                        <h3 className="text-sm font-semibold text-text-primary">
                                            {stage.title}
                                        </h3>
                                        <span className="rounded-md bg-surface-elevated px-2 py-0.5 text-[10px] text-text-muted">
                                            {stage.model}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                                        {stage.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </DocSection>

                {/* Anti-Hallucination */}
                <DocSection
                    id="anti-hallucination-system"
                    title="Anti-Hallucination System"
                >
                    <p>
                        The platform implements six layers of protection against AI
                        fabrication:
                    </p>
                    <div className="mt-4 space-y-3">
                        {[
                            {
                                title: "Schema-first architecture",
                                desc: "All data is normalized to typed JSON before AI transformation. The AI never works with unstructured raw text.",
                            },
                            {
                                title: "Evidence mapping",
                                desc: "Job requirements are mapped against verified resume content. Unsupported claims are categorically rejected.",
                            },
                            {
                                title: "Strict prompts",
                                desc: "Every AI prompt includes explicit rules against fabrication with banned patterns and required behaviors.",
                            },
                            {
                                title: "Post-processing corrections",
                                desc: "Known hallucination patterns (e.g., 'Redox' instead of 'Redux', inflated seniority, redundant education fields) are caught and corrected automatically.",
                            },
                            {
                                title: "Validation layer",
                                desc: "A dedicated AI pass compares enhanced output against original input and flags unsupported content.",
                            },
                            {
                                title: "Trust scoring",
                                desc: "Every output receives a trust score (0-100). Scores below 60 trigger warnings; scores below 40 reject the output.",
                            },
                        ].map((layer, i) => (
                            <div
                                key={i}
                                className="rounded-lg border border-border bg-surface px-5 py-4"
                            >
                                <h4 className="text-sm font-semibold text-text-primary">
                                    {i + 1}. {layer.title}
                                </h4>
                                <p className="mt-1 text-xs text-text-secondary">
                                    {layer.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </DocSection>

                {/* ATS Scoring */}
                <DocSection id="ats-scoring" title="ATS Scoring">
                    <p>
                        The ATS score is calculated across five dimensions. Each dimension's
                        weight is customizable in Settings (must sum to 100%).
                    </p>
                    <div className="mt-4 overflow-hidden rounded-xl border border-border">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-surface">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted">
                                        Dimension
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted">
                                        Default Weight
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted">
                                        What It Measures
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-xs text-text-secondary">
                                <tr className="border-b border-border">
                                    <td className="px-4 py-3 font-medium text-text-primary">
                                        Keyword Match
                                    </td>
                                    <td className="px-4 py-3">30%</td>
                                    <td className="px-4 py-3">
                                        How many required/preferred keywords appear in the resume
                                    </td>
                                </tr>
                                <tr className="border-b border-border">
                                    <td className="px-4 py-3 font-medium text-text-primary">
                                        Formatting
                                    </td>
                                    <td className="px-4 py-3">20%</td>
                                    <td className="px-4 py-3">
                                        Single-column, standard headers, clean bullets, consistent
                                        dates
                                    </td>
                                </tr>
                                <tr className="border-b border-border">
                                    <td className="px-4 py-3 font-medium text-text-primary">
                                        Readability
                                    </td>
                                    <td className="px-4 py-3">20%</td>
                                    <td className="px-4 py-3">
                                        Concise bullets, strong action verbs, no dense paragraphs
                                    </td>
                                </tr>
                                <tr className="border-b border-border">
                                    <td className="px-4 py-3 font-medium text-text-primary">
                                        Impact
                                    </td>
                                    <td className="px-4 py-3">15%</td>
                                    <td className="px-4 py-3">
                                        Quantified achievements, results-oriented language
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-medium text-text-primary">
                                        Completeness
                                    </td>
                                    <td className="px-4 py-3">15%</td>
                                    <td className="px-4 py-3">
                                        All sections present, contact info complete, no obvious gaps
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </DocSection>

                {/* Skills Formatting */}
                <DocSection id="skills-formatting" title="Skills Formatting">
                    <p>
                        The platform supports two skill formats and automatically detects
                        which one your resume uses.
                    </p>
                    <div className="mt-4 space-y-3">
                        <div className="rounded-xl border border-border bg-surface p-5">
                            <h4 className="text-sm font-semibold text-text-primary">
                                Flat List
                            </h4>
                            <p className="mt-1 text-xs text-text-secondary">
                                Each skill is a separate entry. Best for resumes with a single
                                skills section.
                            </p>
                            <code className="mt-2 block rounded-lg bg-surface-elevated px-3 py-2 font-mono text-[11px] text-text-muted">
                                ["React", "TypeScript", "Node.js", "PostgreSQL", "Docker"]
                            </code>
                        </div>
                        <div className="rounded-xl border border-border bg-surface p-5">
                            <h4 className="text-sm font-semibold text-text-primary">
                                Categorized
                            </h4>
                            <p className="mt-1 text-xs text-text-secondary">
                                Skills grouped by category. Each entry is "Category: skill1,
                                skill2". Best for resumes with multiple skill sections.
                            </p>
                            <code className="mt-2 block rounded-lg bg-surface-elevated px-3 py-2 font-mono text-[11px] text-text-muted">
                                {"["}
                                Frontend: React, TypeScript, Next.js", "Backend: Node.js,
                                PostgreSQL", "DevOps: Docker, AWS"
                                {"]"}
                            </code>
                        </div>
                    </div>
                    <p className="mt-4">
                        In the editor, you can toggle between flat and categorized format,
                        create new categories with the "+ Category" button, and add/remove
                        skills within specific categories.
                    </p>
                </DocSection>

                {/* Inline Editor */}
                <DocSection id="inline-editor" title="Inline Editor">
                    <p>After generation, you have full control over every section:</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {[
                            {
                                icon: Edit3,
                                title: "Edit any field",
                                description: "Click any section to edit text inline.",
                            },
                            {
                                icon: RefreshCw,
                                title: "Regenerate bullets",
                                description:
                                    "Regenerate individual bullets, all bullets for a role, or the professional summary.",
                            },
                            {
                                icon: Lock,
                                title: "Lock sections",
                                description:
                                    "Lock sections you're happy with to prevent accidental changes.",
                            },
                            {
                                icon: Target,
                                title: "Keyword analysis",
                                description:
                                    "See matched and missing keywords with evidence mapping against the job description.",
                            },
                        ].map((feature) => (
                            <div
                                key={feature.title}
                                className="rounded-xl border border-border bg-surface p-4"
                            >
                                <div className="mb-2 flex items-center gap-2">
                                    <feature.icon className="h-4 w-4 text-accent/60" />
                                    <h4 className="text-xs font-semibold text-text-primary">
                                        {feature.title}
                                    </h4>
                                </div>
                                <p className="text-xs text-text-secondary">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </DocSection>

                {/* Bullet Regeneration */}
                <DocSection
                    id="bullet-regeneration"
                    title="Bullet Regeneration"
                >
                    <p>
                        Bullet regeneration is a standalone feature separate from the main
                        pipeline. It uses Claude Sonnet to rewrite content while preserving
                        factual integrity.
                    </p>
                    <div className="mt-4 space-y-3">
                        <div className="rounded-xl border border-border bg-surface p-5">
                            <h4 className="text-sm font-semibold text-text-primary">
                                Single Bullet
                            </h4>
                            <p className="mt-1 text-xs text-text-secondary">
                                Click the refresh icon next to any bullet point. The AI rewrites
                                just that one bullet with a stronger action verb and clearer
                                phrasing. Job description context is included for targeting.
                            </p>
                        </div>
                        <div className="rounded-xl border border-border bg-surface p-5">
                            <h4 className="text-sm font-semibold text-text-primary">
                                All Bullets
                            </h4>
                            <p className="mt-1 text-xs text-text-secondary">
                                Click "Rewrite all bullets" above the bullet list for any
                                experience entry. All bullets are rewritten together, ensuring
                                consistency and no repetition across the entry.
                            </p>
                        </div>
                        <div className="rounded-xl border border-border bg-surface p-5">
                            <h4 className="text-sm font-semibold text-text-primary">
                                Professional Summary
                            </h4>
                            <p className="mt-1 text-xs text-text-secondary">
                                Click "Regenerate" next to the summary field. The AI rewrites
                                the summary to be more impactful while preserving years of
                                experience and domain expertise.
                            </p>
                        </div>
                    </div>
                </DocSection>

                {/* Cover Letter */}
                <DocSection id="cover-letter" title="Cover Letter">
                    <p>
                        Cover letters are generated using Claude Sonnet with strict
                        anti-AI-detection rules.
                    </p>
                    <div className="mt-4 space-y-3">
                        <div className="rounded-xl border border-border bg-surface p-5">
                            <h4 className="text-sm font-semibold text-text-primary">
                                Format
                            </h4>
                            <p className="mt-1 text-xs text-text-secondary">
                                Proper letter format with candidate name, contact info, date,
                                salutation, opening paragraph, body paragraph, closing, and
                                signature. 200-300 words total.
                            </p>
                        </div>
                        <div className="rounded-xl border border-border bg-surface p-5">
                            <h4 className="text-sm font-semibold text-text-primary">
                                Anti-AI Detection
                            </h4>
                            <p className="mt-1 text-xs text-text-secondary">
                                Over 20 telltale AI patterns are explicitly banned. The AI is
                                instructed to use natural human writing patterns: varied sentence
                                length, contractions, sentence fragments, direct language, and
                                personality.
                            </p>
                        </div>
                    </div>
                </DocSection>

                {/* Export */}
                <DocSection id="export-system" title="Export System">
                    <p>
                        Both PDF and DOCX exports use ATS-safe formatting with customizable
                        fonts:
                    </p>
                    <ul className="mt-3 space-y-2 text-xs text-text-secondary">
                        <li className="flex items-start gap-2">
                            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-accent" />
                            Single-column layout — no tables, no multi-column
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-accent" />
                            No graphics, icons, progress bars, or skill percentages
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-accent" />
                            Five ATS-safe fonts: Calibri, Georgia, Helvetica, Garamond, Cambria
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-accent" />
                            Dynamic spacing — content auto-fills a single A4 page
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-accent" />
                            Categorized skills rendered with bold category labels
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-accent" />
                            Consistent layout between PDF and DOCX
                        </li>
                    </ul>
                    <p className="mt-4">
                        The Export tab provides one-click access to all formats, a "Download
                        Both" option, print shortcut, and a history of recent exports.
                    </p>
                </DocSection>

                {/* Settings */}
                <DocSection id="settings" title="Settings">
                    <p>
                        All settings are stored locally in the browser. No account required.
                        Settings can be backed up and restored via JSON export/import.
                    </p>
                    <div className="mt-4 overflow-hidden rounded-xl border border-border">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-surface">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted">
                                        Setting
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted">
                                        Options
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted">
                                        What It Controls
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-xs text-text-secondary">
                                <tr className="border-b border-border">
                                    <td className="px-4 py-3 font-medium text-text-primary">
                                        Export Format
                                    </td>
                                    <td className="px-4 py-3">PDF, DOCX, Both</td>
                                    <td className="px-4 py-3">Default export format</td>
                                </tr>
                                <tr className="border-b border-border">
                                    <td className="px-4 py-3 font-medium text-text-primary">
                                        Resume Font
                                    </td>
                                    <td className="px-4 py-3">
                                        Calibri, Georgia, Helvetica, Garamond, Cambria
                                    </td>
                                    <td className="px-4 py-3">
                                        Font used in PDF and DOCX exports
                                    </td>
                                </tr>
                                <tr className="border-b border-border">
                                    <td className="px-4 py-3 font-medium text-text-primary">
                                        Enhancement Tone
                                    </td>
                                    <td className="px-4 py-3">
                                        Conservative, Balanced, Aggressive
                                    </td>
                                    <td className="px-4 py-3">
                                        How aggressively the AI rewrites resume content
                                    </td>
                                </tr>
                                <tr className="border-b border-border">
                                    <td className="px-4 py-3 font-medium text-text-primary">
                                        Auto-save
                                    </td>
                                    <td className="px-4 py-3">On, Off</td>
                                    <td className="px-4 py-3">
                                        Whether resume data is saved to localStorage
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-medium text-text-primary">
                                        ATS Weights
                                    </td>
                                    <td className="px-4 py-3">0-50% per dimension</td>
                                    <td className="px-4 py-3">
                                        How the ATS score is calculated (must sum to 100%)
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </DocSection>

                {/* API Reference */}
                <DocSection id="api-reference" title="API Reference">
                    <div className="mt-4 space-y-3">
                        {[
                            {
                                method: "POST",
                                path: "/api/generate",
                                description:
                                    "Runs the full 7-stage AI pipeline. Returns Server-Sent Events (SSE) stream with progressive updates.",
                                body: '{ "rawText": "string", "jobDescription": "string", "tone?": "conservative | balanced | aggressive" }',
                            },
                            {
                                method: "POST",
                                path: "/api/parse",
                                description:
                                    "Extracts text from uploaded file (PDF, DOCX, TXT). Returns plain text.",
                                body: "FormData with 'file' field",
                            },
                            {
                                method: "POST",
                                path: "/api/regenerate",
                                description:
                                    "Regenerates individual bullets, all bullets for an entry, or the professional summary. Uses Claude Sonnet.",
                                body: '{ "type": "bullet | bullets | summary", "content": "string | string[]", "jobDescription?": "string", "resumeContext?": "string" }',
                            },
                            {
                                method: "POST",
                                path: "/api/feedback",
                                description:
                                    "Submits feedback/support requests. Sends email via Resend.",
                                body: '{ "type": "feature | bug | improvement | other", "title": "string", "description": "string", "email?": "string", "steps?": "string" }',
                            },
                        ].map((api) => (
                            <div
                                key={api.path}
                                className="rounded-xl border border-border bg-surface p-5"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="rounded-md bg-accent/10 px-2 py-0.5 font-mono text-[10px] font-bold text-accent">
                                        {api.method}
                                    </span>
                                    <code className="font-mono text-xs text-text-primary">
                                        {api.path}
                                    </code>
                                </div>
                                <p className="mt-2 text-xs text-text-secondary">
                                    {api.description}
                                </p>
                                <code className="mt-2 block rounded-lg bg-surface-elevated px-3 py-2 font-mono text-[11px] text-text-muted">
                                    {api.body}
                                </code>
                            </div>
                        ))}
                    </div>
                </DocSection>

                {/* Cost */}
                <DocSection id="cost-breakdown" title="Cost Breakdown">
                    <p>
                        Each full pipeline run costs approximately $0.20 in API usage.
                        Bullet regeneration costs approximately $0.01-0.03 per call.
                    </p>
                    <div className="mt-4 overflow-hidden rounded-xl border border-border">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-surface">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted">
                                        Stage
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted">
                                        Model
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-text-muted">
                                        Est. Cost
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-xs text-text-secondary">
                                {[
                                    ["Parse Resume", "GPT-4o", "$0.01"],
                                    ["Analyze JD", "GPT-4o", "$0.01"],
                                    ["Map Evidence", "GPT-4o", "$0.02"],
                                    ["Enhance Resume", "Claude Sonnet", "$0.08"],
                                    ["ATS Score", "GPT-4o", "$0.02"],
                                    ["Cover Letter", "Claude Sonnet", "$0.05"],
                                    ["Validate", "GPT-4o", "$0.02"],
                                ].map(([stage, model, cost], i) => (
                                    <tr
                                        key={i}
                                        className="border-b border-border last:border-0"
                                    >
                                        <td className="px-4 py-2.5 text-text-primary">
                                            {stage}
                                        </td>
                                        <td className="px-4 py-2.5">{model}</td>
                                        <td className="px-4 py-2.5 text-right font-mono">
                                            {cost}
                                        </td>
                                    </tr>
                                ))}
                                <tr className="bg-surface">
                                    <td className="px-4 py-2.5 font-semibold text-text-primary">
                                        Total
                                    </td>
                                    <td />
                                    <td className="px-4 py-2.5 text-right font-mono font-semibold text-accent">
                                        ~$0.21
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </DocSection>
            </div>
            <Footer />
        </main>
    );
}

function DocSection({
    id,
    title,
    children,
}: {
    id: string;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section id={id} className="mb-16 scroll-mt-24">
            <h2 className="mb-4 font-display text-xl text-text-primary sm:text-2xl">
                {title}
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-text-secondary">
                {children}
            </div>
        </section>
    );
}
