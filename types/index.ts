export type ResumeSchema = {
    basics: {
        name: string;
        email: string;
        phone?: string;
        linkedin?: string;
        github?: string;
        website?: string;
        location?: string;
        summary?: string;
    };
    experience: ExperienceEntry[];
    education: EducationEntry[];
    projects: ProjectEntry[];
    skills: string[];
    certifications?: CertificationEntry[];
};

export type ExperienceEntry = {
    id: string;
    company: string;
    title: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    bullets: string[];
    technologies?: string[];
    location?: string;
};

export type EducationEntry = {
    id: string;
    institution: string;
    degree: string;
    field?: string;
    startDate?: string;
    endDate?: string;
    gpa?: string;
    honors?: string[];
};

export type ProjectEntry = {
    id: string;
    name: string;
    description: string;
    technologies?: string[];
    bullets?: string[];
    url?: string;
};

export type CertificationEntry = {
    id: string;
    name: string;
    issuer: string;
    date?: string;
    url?: string;
};

export type JDAnalysis = {
    title: string;
    company: string;
    seniority: string;
    requiredSkills: string[];
    preferredSkills: string[];
    softSkills: string[];
    keywords: string[];
    responsibilities: string[];
    industryTerms: string[];
    repeatedPhrases: string[];
};

export type EvidenceMapping = {
    supported: { keyword: string; evidence: string }[];
    partial: { keyword: string; related: string }[];
    missing: { keyword: string; suggestion: string }[];
};

export type ATSScore = {
    overall: number;
    breakdown: {
        keywordMatch: number;
        formatting: number;
        readability: number;
        impact: number;
        completeness: number;
    };
    matchedKeywords: string[];
    missingKeywords: string[];
    warnings: string[];
    suggestions: string[];
    weakSections: string[];
};

export type ValidationResult = {
    isValid: boolean;
    trustScore: number;
    issues: ValidationIssue[];
    hallucinations: HallucinationFlag[];
};

export type ValidationIssue = {
    severity: "error" | "warning" | "info";
    section: string;
    message: string;
    suggestion?: string;
};

export type HallucinationFlag = {
    type:
    | "fabricated_experience"
    | "invented_metric"
    | "unsupported_tech"
    | "timeline_inconsistency"
    | "keyword_stuffing"
    | "exaggerated_claim";
    location: string;
    original: string;
    concern: string;
};

export type PipelineStage =
    | "idle"
    | "parsing"
    | "analyzing"
    | "mapping"
    | "enhancing"
    | "scoring"
    | "cover-letter"
    | "validating"
    | "complete"
    | "error";

export type GenerationState = {
    stage: PipelineStage;
    progress: number;
    parsedResume: ResumeSchema | null;
    jdAnalysis: JDAnalysis | null;
    evidenceMapping: EvidenceMapping | null;
    optimizedResume: ResumeSchema | null;
    atsScore: ATSScore | null;
    coverLetter: string;
    validation: ValidationResult | null;
    error: string | null;
};

export type StreamEvent =
    | { type: "stage"; stage: PipelineStage; progress: number }
    | { type: "parsed"; data: ResumeSchema }
    | { type: "analyzed"; data: JDAnalysis }
    | { type: "mapped"; data: EvidenceMapping }
    | { type: "enhanced"; data: Partial<ResumeSchema> }
    | { type: "enhanced_chunk"; section: string; content: string }
    | { type: "scored"; data: ATSScore }
    | { type: "cover_letter_chunk"; content: string }
    | { type: "cover_letter"; data: string }
    | { type: "validated"; data: ValidationResult }
    | { type: "complete" }
    | { type: "error"; message: string };

export type ResumeVersion = {
    id: string;
    resumeId: string;
    versionNumber: number;
    data: ResumeSchema;
    atsScore?: number;
    createdAt: string;
};

export type SavedResume = {
    id: string;
    title: string;
    rawData: string;
    parsedData: ResumeSchema | null;
    optimizedData: ResumeSchema | null;
    jobDescription: string | null;
    jdAnalysis: JDAnalysis | null;
    atsScore: ATSScore | null;
    coverLetter: string | null;
    createdAt: string;
    updatedAt: string;
};
