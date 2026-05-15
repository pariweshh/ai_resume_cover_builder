import { useState, useCallback, useMemo } from "react";
import type {
    ResumeSchema,
    JDAnalysis,
    EvidenceMapping,
    ATSScore,
    ValidationResult, WorkspaceState
} from "@/types";
import { DEFAULT_SECTION_ORDER, type ReorderableSection } from "@/types";

export function useResume() {
    const [rawText, setRawText] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [jdAnalysis, setJdAnalysis] = useState<JDAnalysis | null>(null);
    const [evidenceMapping, setEvidenceMapping] =
        useState<EvidenceMapping | null>(null);
    const [parsedResume, setParsedResume] = useState<ResumeSchema | null>(null);
    const [currentResume, setCurrentResume] = useState<ResumeSchema | null>(
        null
    );
    const [optimizedResume, setOptimizedResume] =
        useState<ResumeSchema | null>(null);
    const [atsScore, setAtsScore] = useState<ATSScore | null>(null);
    const [coverLetter, setCoverLetter] = useState("");
    const [validation, setValidation] = useState<ValidationResult | null>(null);
    const [lockedSections, setLockedSections] = useState<Set<string>>(new Set());
    const [startedFromScratch, setStartedFromScratch] = useState(false);

    // ── Serialize current state for persistence ───────────────────
    const getState = useCallback(
        (): WorkspaceState => ({
            rawText,
            jobDescription,
            currentResume,
            optimizedResume,
            atsScore,
            coverLetter,
            validation,
            jdAnalysis,
            evidenceMapping,
            lockedSections: Array.from(lockedSections),
            startedFromScratch,
        }),
        [
            rawText,
            jobDescription,
            currentResume,
            optimizedResume,
            atsScore,
            coverLetter,
            validation,
            jdAnalysis,
            evidenceMapping,
            lockedSections,
            startedFromScratch,
        ]
    );

    // ── Hydrate from persisted state ──────────────────────────────
    const hydrate = useCallback((state: WorkspaceState) => {
        setRawText(state.rawText ?? "");
        setJobDescription(state.jobDescription ?? "");
        setCurrentResume(state.currentResume);
        setParsedResume(state.currentResume);
        setOptimizedResume(state.optimizedResume);
        setAtsScore(state.atsScore);
        setCoverLetter(state.coverLetter ?? "");
        setValidation(state.validation);
        setJdAnalysis(state.jdAnalysis);
        setEvidenceMapping(state.evidenceMapping);
        setLockedSections(new Set(state.lockedSections ?? []));
        setStartedFromScratch(state.startedFromScratch ?? false);
    }, []);


    const hasJobDescription = useMemo(
        () => jobDescription.trim().split(/\s+/).length >= 20,
        [jobDescription]
    );

    const sectionOrder = useMemo<ReorderableSection[]>(
        () => currentResume?.sectionOrder ?? DEFAULT_SECTION_ORDER,
        [currentResume]
    );

    const setSectionOrder = useCallback(
        (order: ReorderableSection[]) => {
            setCurrentResume((prev) =>
                prev ? { ...prev, sectionOrder: order } : prev
            );
        },
        []
    );

    const startFromScratch = useCallback(() => {
        const blank: ResumeSchema = {
            basics: { name: "", email: "" },
            experience: [],
            education: [],
            projects: [],
            skills: [],
            certifications: [],
            sectionOrder: DEFAULT_SECTION_ORDER,
        };
        setParsedResume(blank);
        setCurrentResume(blank);
        setStartedFromScratch(true);
    }, []);

    const serializeResume = useCallback((): string => {
        if (!currentResume) return "";
        const parts: string[] = [];
        const { basics } = currentResume;

        if (basics.name) parts.push(basics.name);
        if (basics.summary) parts.push(`\nProfessional Summary:\n${basics.summary}`);

        if (currentResume.skills.length) {
            parts.push(`\nTechnical Skills:\n${currentResume.skills.join(", ")}`);
        }

        for (const exp of currentResume.experience) {
            parts.push(`\n${exp.title} at ${exp.company}`);
            if (exp.startDate)
                parts.push(
                    `${exp.startDate} - ${exp.current ? "Present" : exp.endDate || ""}`
                );
            for (const b of exp.bullets) parts.push(`• ${b}`);
            if (exp.technologies?.length)
                parts.push(`Technologies: ${exp.technologies.join(", ")}`);
        }

        for (const proj of currentResume.projects) {
            parts.push(`\nProject: ${proj.name}`);
            if (proj.description) parts.push(proj.description);
            for (const b of proj.bullets ?? []) parts.push(`• ${b}`);
            if (proj.technologies?.length)
                parts.push(`Technologies: ${proj.technologies.join(", ")}`);
        }

        for (const edu of currentResume.education) {
            parts.push(
                `\n${[edu.degree, edu.field].filter(Boolean).join(" in ")} - ${edu.institution}`
            );
            if (edu.endDate) parts.push(edu.endDate);
            if (edu.gpa) parts.push(`GPA: ${edu.gpa}`);
        }

        return parts.join("\n");
    }, [currentResume]);

    const updateCurrentResume = useCallback(
        (updater: (prev: ResumeSchema) => ResumeSchema) => {
            setCurrentResume((prev) => (prev ? updater(prev) : prev));
        },
        []
    );

    const toggleLock = useCallback((section: string) => {
        setLockedSections((prev) => {
            const next = new Set(prev);
            if (next.has(section)) next.delete(section);
            else next.add(section);
            return next;
        });
    }, []);

    const handleParsed = useCallback(
        (data: ResumeSchema) => {
            setParsedResume(data);
            setCurrentResume({
                ...data,
                sectionOrder: data.sectionOrder ?? DEFAULT_SECTION_ORDER,
            });
            setStartedFromScratch(false);
        },
        []
    );

    const handleAnalyzed = useCallback((data: JDAnalysis) => {
        setJdAnalysis(data);
    }, []);

    const handleMapped = useCallback((data: EvidenceMapping) => {
        setEvidenceMapping(data);
    }, []);

    const handleEnhanced = useCallback((data: Partial<ResumeSchema>) => {
        const safe: ResumeSchema = {
            basics: data.basics ?? { name: "", email: "" },
            experience: data.experience ?? [],
            education: data.education ?? [],
            projects: data.projects ?? [],
            skills: data.skills ?? [],
            certifications: data.certifications ?? [],
            sectionOrder: data.sectionOrder ?? DEFAULT_SECTION_ORDER,
        };
        setOptimizedResume(safe);
        setCurrentResume((prev) => ({
            ...safe,
            sectionOrder: prev?.sectionOrder ?? safe.sectionOrder ?? DEFAULT_SECTION_ORDER,
        }));
    }, []);

    const handleScored = useCallback((data: ATSScore) => {
        setAtsScore(data);
    }, []);

    const handleCoverLetter = useCallback((data: string) => {
        setCoverLetter(data);
    }, []);

    const handleValidated = useCallback((data: ValidationResult) => {
        setValidation(data);
    }, []);

    const hasResume = currentResume !== null;
    const hasOptimized = optimizedResume !== null;

    return {
        rawText,
        setRawText,
        jobDescription,
        setJobDescription,
        hasJobDescription,
        jdAnalysis,
        evidenceMapping,
        parsedResume,
        setParsedResume,
        currentResume,
        setCurrentResume,
        updateCurrentResume,
        optimizedResume,
        atsScore,
        coverLetter,
        setCoverLetter,
        validation,
        lockedSections,
        toggleLock,
        handleParsed,
        handleAnalyzed,
        handleMapped,
        handleEnhanced,
        handleScored,
        handleCoverLetter,
        handleValidated,
        hasResume,
        hasOptimized,
        sectionOrder,
        setSectionOrder,
        startedFromScratch,
        startFromScratch,
        serializeResume,
        getState,
        hydrate,
    };
}
