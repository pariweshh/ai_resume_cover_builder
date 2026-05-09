export const AI_MODELS = {
    claude: "claude-sonnet-4-6",
    openai: "gpt-4o",
} as const;

export const PIPELINE_STAGES = {
    idle: { label: "Ready", progress: 0 },
    parsing: { label: "Parsing resume", progress: 10 },
    analyzing: { label: "Analyzing job description", progress: 25 },
    mapping: { label: "Mapping evidence", progress: 40 },
    enhancing: { label: "Enhancing content", progress: 60 },
    scoring: { label: "Calculating ATS score", progress: 80 },
    "cover-letter": { label: "Generating cover letter", progress: 90 },
    validating: { label: "Validating output", progress: 95 },
    complete: { label: "Complete", progress: 100 },
    error: { label: "Error", progress: 0 },
} as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const ACCEPTED_FILE_TYPES = {
    "application/pdf": [".pdf"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
        ".docx",
    ],
    "text/plain": [".txt"],
};

export const RESUME_SECTIONS = [
    "basics",
    "experience",
    "education",
    "projects",
    "skills",
    "certifications",
] as const;

export const ATS_SAFE_FONTS = [
    "Georgia",
    "Garamond",
    "Times New Roman",
    "Cambria",
    "Calibri",
    "Helvetica",
    "Arial",
] as const;
