# ResumeForge

AI-powered ATS resume optimization platform. Enhance resumes with a multi-stage
AI pipeline, strict anti-hallucination enforcement, and recruiter-optimized formatting.

## Overview

ResumeForge is NOT a generic AI resume builder. It is a premium ATS optimization
platform that:

- Parses resumes into structured data before any AI transformation
- Analyzes job descriptions to extract keywords, skills, and requirements
- Maps evidence honestly — unsupported claims are rejected, not fabricated
- Enhances content while preserving factual integrity
- Scores ATS compatibility across five customizable dimensions
- Generates tailored cover letters that sound human-written
- Validates output with a dedicated hallucination detection layer
- Supports inline editing with per-bullet regeneration
- Exports pixel-perfect, ATS-safe PDF and DOCX documents
- Remembers preferences via local settings with backup/restore

## Architecture

┌─────────────────────────────────────────────────────────┐
│ Client (Next.js 16) │
│ React 19 · Tailwind CSS v4 · Framer Motion · shadcn/ui │
└────────────────────────┬────────────────────────────────┘
│ SSE Streaming
┌────────────────────────▼────────────────────────────────┐
│ Multi-Stage AI Pipeline │
│ │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐ │
│ │ Parse │→ │ Analyze │→ │ Map │→ │ Enhance │ │
│ │ (GPT) │ │ (GPT) │ │ (GPT) │ │ (Claude) │ │
│ └─────────┘ └─────────┘ └─────────┘ └──────────┘ │
│ │ │ │
│ ┌─────────┐ ┌──────────┐ ┌───────────┐ │ │
│ │ Score │← │ Cover │← │ Validate │←─────────┘ │
│ │ (GPT) │ │ (Claude) │ │ (GPT) │ │
│ └─────────┘ └──────────┘ └───────────┘ │
└──────────────────────────────────────────────────────────┘
│
┌────────────────────────▼────────────────────────────────┐
│ Supabase │
│ PostgreSQL · Row Level Security · Anonymous Auth │
└──────────────────────────────────────────────────────────┘


## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 16 (App Router) | Server components, streaming, routing |
| UI | React 19, Tailwind CSS v4, shadcn/ui | Component library, styling |
| Animation | Framer Motion | Page transitions, micro-interactions |
| AI (Parsing) | OpenAI GPT-4o | Structured JSON extraction, ATS scoring |
| AI (Writing) | Claude Sonnet | Resume enhancement, cover letters |
| Database | Supabase (PostgreSQL) | Persistence, auth, row-level security |
| Email | Resend | Feedback and support emails |
| Export | jsPDF, docx library | ATS-safe PDF and DOCX generation |
| Validation | Zod | Schema validation |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Anthropic API key
- OpenAI API key
- Resend API key (for feedback emails)

### Installation

```bash
# Clone the repository
git clone https://github.com/pariweshh/resumeforge.git
cd resumeforge

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Fill in your API keys

# Run database migrations
# Copy contents of database/schema.sql into Supabase SQL Editor and run

# Start development server
npm run dev

```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| NEXT_PUBLIC_SUPABASE_URL | Supabase project URL | Yes |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase publishable key | Yes |
| SUPABASE_SERVICE_ROLE_KEY | Supabase secret key | Yes |
| ANTHROPIC_API_KEY | Anthropic API key for Claude | Yes |
| OPENAI_API_KEY | OpenAI API key for GPT | Yes |
| RESEND_API_KEY | Resend API key for emails | Yes |
| FEEDBACK_EMAIL | Email address for feedback | Yes |
| NEXT_PUBLIC_APP_URL | Application URL | Yes |

### Features

#### Multi-Stage AI Pipeline
Seven distinct stages — each optimized for a specific task, not one monolithic prompt.
Runs in under 30 seconds with real-time streaming progress updates.


### Anti-Hallucination System

The platform implements a multi-layer approach to prevent AI fabrication:

Six layers of protection against AI fabrication:

1.Schema-first architecture — AI transforms structured JSON, not raw text
2.Evidence mapping — unsupported keywords are rejected, not fabricated
3.Strict prompts — explicit rules against fabrication with banned patterns
4.Post-processing corrections — known hallucinations caught automatically
5.Validation layer — dedicated AI pass flags unsupported content
6.Trust scoring — every output scored 0-100, warnings below 60

### Inline Editing
- Edit any field in any section
- Regenerate individual bullets or all bullets at once
- Regenerate professional summary
- Lock sections to prevent changes
- Add/remove bullets, experience entries, projects, education
- Skills editor with flat and categorized format support
- Create new skill categories with "+ Category" button
- Toggle between flat list and categorized format

### ATS Scoring
Scores across five customizable dimensions:

- Keyword Match (default 30%) — required/preferred keyword coverage
- Formatting (default 20%) — single-column, standard headers, clean bullets
- Readability (default 20%) — concise bullets, strong verbs, no dense paragraphs
- Impact (default 15%) — quantified achievements, results-oriented language
- Completeness (default 15%) — all sections present, contact info complete

Weights are adjustable in Settings.

### Cover Letter Generation
- Human-sounding voice with anti-AI-detection rules
- Proper letter format with candidate contact header
- Tailored to the specific role and company
- 200-300 words, concise and direct
- No telltale AI patterns ("excited to", "passionate about", etc.)

### Export System
- PDF — pixel-perfect, single-page, ATS-safe, customizable font
- DOCX — editable Word document matching PDF layout
- Both formats — download simultaneously
- Dynamic spacing auto-fills a single A4 page
- Categorized skills rendered with bold category labels
Fonts: Calibri, Georgia, Helvetica, Garamond, Cambria

### Settings
- Export format — default PDF, DOCX, or both
- Resume font — five ATS-safe fonts with live preview
- Enhancement tone — conservative, balanced, or aggressive AI rewriting
- Auto-save — toggle localStorage persistence
- ATS scoring weights — adjustable sliders per dimension
- Data management — export/import JSON backups, clear all data, reset defaults
- Storage info — live localStorage usage with progress bar

### Feedback & Support
- /support page with categorized feedback form
- Four categories: Feature Request, Bug Report, Improvement, General Feedback
- Optional steps-to-reproduce for bugs
- Optional email for follow-up
- Emails sent via Resend to the configured feedback address
- FAQ section with common questions

### AI Pipeline

#### Stage 1 — Resume Parsing
Extracts structured data from raw resume text (PDF, DOCX, or plain text) using OpenAI GPT-4o. Produces a typed JSON schema with basics, experience, education,
projects, and skills.

#### Stage 2 — Job Description Analysis
Analyzes the target job description to extract ATS keywords, required/preferred
skills, seniority expectations, and repeated terminology.


#### Stage 3 — Evidence Mapping
Maps job requirements against actual resume evidence. Supported keywords are
flagged for enhancement. Unsupported keywords are rejected — never fabricated.


#### Stage 4 — Resume Enhancement
Rewrites existing content using Claude Sonnet. The enhancement tone setting
controls how aggressively the AI rewrites:

- Conservative — minimal changes, preserve original phrasing
- Balanced — improve clarity while keeping the candidate's voice
- Aggressive — maximum ATS optimization and impact

Strict truthfulness rules prevent fabrication of experience, metrics, or
technologies. Post-processing corrections catch known hallucination patterns.


#### Stage 5 — ATS Scoring
Scores the optimized resume across five dimensions using customizable weights.
Returns matched/missing keywords and actionable suggestions.


#### Stage 6 — Cover Letter Generation
Generates a tailored cover letter using Claude Sonnet with proper letter format,
anti-AI-detection rules, and the candidate's actual contact information.


#### Stage 7 — Validation
Dedicated hallucination detection layer compares the enhanced resume against the
original. Flags fabricated claims, invented metrics, unsupported technologies,
and timeline inconsistencies. Outputs a trust score (0-100).

### Bullet Regeneration
Separate from the main pipeline — regenerates individual bullets, all bullets
for a role, or the professional summary via Claude Sonnet. Includes job
description context for targeted rewriting.

### Project Structure

├── app/                    # Next.js App Router pages and API routes
│   ├── api/               # API endpoints (generate, parse, feedback, regenerate)
│   ├── dashboard/         # Main application workspace
│   ├── docs/              # Documentation page
│   ├── support/           # Support and feedback page
│   ├── privacy/           # Privacy policy
│   ├── terms/             # Terms of service
│   └── security/          # Security policy
├── ai/                    # AI integration layer
│   ├── claude.ts          # Anthropic Claude client
│   ├── openai.ts          # OpenAI client
│   ├── pipeline.ts        # Multi-stage orchestration
│   └── prompts.ts         # All AI system prompts + tone-adaptive enhancement
├── components/            # React components
│   ├── ats/               # ATS score and keyword panels
│   ├── dashboard/         # Workspace and sidebar
│   ├── editor/            # Resume and section editors with regeneration
│   ├── landing/           # Landing page (navbar, hero, features, etc.)
│   ├── settings/          # Settings panel
│   ├── shared/            # Export panel, export modal, progress UI
│   ├── support/           # Feedback form
│   └── upload/            # Resume upload and JD input
├── hooks/                 # Custom React hooks
│   ├── useAutoSave.ts     # Settings-aware auto-save to localStorage
│   ├── useRegenerate.ts   # Bullet/summary regeneration hook
│   ├── useResume.ts       # Central resume state management
│   ├── useSettings.ts     # Settings persistence with backup/restore
│   └── useStreaming.ts    # SSE pipeline streaming hook
├── lib/                   # Utilities, constants, Supabase clients
│   └── skills-utils.ts    # Skill parsing (flat, categorized, mixed)
├── schemas/               # Zod validation schemas
├── server-actions/        # Server-side mutations (save, export)
├── services/              # Business logic
│   ├── ats-engine.ts      # Local ATS scoring with configurable weights
│   ├── export-docx.ts     # DOCX generation with font support
│   ├── export-pdf.ts      # PDF generation with dynamic spacing
│   ├── hallucination-detector.ts  # Post-processing hallucination checks
│   └── parser.ts          # PDF/DOCX/TXT text extraction
└── types/                 # TypeScript type definitions


### API Endpoints

| Endpoint | Method | Description |
|-------|-----------|-----------|
| /api/generate | POST | Runs the full AI pipeline (SSE stream) |
| /api/parse | POST | Extracts text from uploaded PDF/DOCX |
| /api/feedback | POST | Submits feedback/support requests |
| /api/regenerate | POST | Regenerates individual bullets, all bullets, or summary |

### Cost Estimation

Per resume generation (full pipeline):

| Stage | Model | Est. Cost |
|-------|-----------|-----------|
| Parse Resume | GPT-4o | ~$0.01 |
| Analyze JD | GPT-4o | ~$0.01 |
| Map Evidence | GPT-4o | ~$0.02 |
| Enhance Resume | Claude Sonnet | ~$0.08 |
| ATS Score | GPT-4o | ~$0.02 |
| Cover Letter | Claude Sonnet | ~$0.05 |
| Validate | GPT-4o | ~$0.02 |
| Total | | ~$0.21 |

Bullet regeneration: ~$0.01-0.03 per call.

### License

MIT License. See LICENSE for details.

