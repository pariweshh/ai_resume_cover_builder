"use client";

import { useState, useCallback } from "react";
import { generateId } from "@/lib/utils";
import { createEmptyResume } from "@/services/parser";
import { useAutoSave } from "./useAutoSave";
import type {
    ResumeSchema,
    ExperienceEntry,
    EducationEntry,
    ProjectEntry,
    JDAnalysis,
    EvidenceMapping,
    ATSScore,
    ValidationResult,
} from "@/types";

type ResumeState = {
    rawText: string;
    resume: ResumeSchema | null;
    optimizedResume: ResumeSchema | null;
    jobDescription: string;
    jdAnalysis: JDAnalysis | null;
    evidenceMapping: EvidenceMapping | null;
    atsScore: ATSScore | null;
    coverLetter: string;
    validation: ValidationResult | null;
    lockedSections: Set<string>;
};

const initialState: ResumeState = {
    rawText: "",
    resume: null,
    optimizedResume: null,
    jobDescription: "",
    jdAnalysis: null,
    evidenceMapping: null,
    atsScore: null,
    coverLetter: "",
    validation: null,
    lockedSections: new Set(),
};

export function useResume() {
    const [state, setState] = useState<ResumeState>(initialState);

    // Auto-save to localStorage
    useAutoSave(state.resume, state.optimizedResume);

    // ── Setters ────────────────────────────────────────────────────

    const setRawText = useCallback((text: string) => {
        setState((prev) => ({ ...prev, rawText: text }));
    }, []);

    const setJobDescription = useCallback((jd: string) => {
        setState((prev) => ({ ...prev, jobDescription: jd }));
    }, []);

    const setResume = useCallback((resume: ResumeSchema | null) => {
        setState((prev) => ({ ...prev, resume }));
    }, []);

    const setOptimizedResume = useCallback(
        (optimized: ResumeSchema | null) => {
            setState((prev) => ({ ...prev, optimizedResume: optimized }));
        },
        []
    );

    const setJdAnalysis = useCallback((analysis: JDAnalysis | null) => {
        setState((prev) => ({ ...prev, jdAnalysis: analysis }));
    }, []);

    const setEvidenceMapping = useCallback(
        (mapping: EvidenceMapping | null) => {
            setState((prev) => ({ ...prev, evidenceMapping: mapping }));
        },
        []
    );

    const setAtsScore = useCallback((score: ATSScore | null) => {
        setState((prev) => ({ ...prev, atsScore: score }));
    }, []);

    const setCoverLetter = useCallback((letter: string) => {
        setState((prev) => ({ ...prev, coverLetter: letter }));
    }, []);

    const setValidation = useCallback((validation: ValidationResult | null) => {
        setState((prev) => ({ ...prev, validation }));
    }, []);

    // ── Computed ───────────────────────────────────────────────────

    const currentResume = state.optimizedResume || state.resume;
    const hasResume = !!state.resume;
    const hasOptimized = !!state.optimizedResume;
    const hasJobDescription =
        state.jobDescription.trim().split(/\s+/).length >= 20;

    // ── Section Locking ────────────────────────────────────────────

    const toggleLock = useCallback((section: string) => {
        setState((prev) => {
            const next = new Set(prev.lockedSections);
            if (next.has(section)) {
                next.delete(section);
            } else {
                next.add(section);
            }
            return { ...prev, lockedSections: next };
        });
    }, []);

    const isLocked = useCallback(
        (section: string) => {
            return state.lockedSections.has(section);
        },
        [state.lockedSections]
    );

    // ── Resume Mutation ────────────────────────────────────────────

    const updateCurrentResume = useCallback(
        (updater: (prev: ResumeSchema) => ResumeSchema) => {
            setState((prev) => {
                const target = prev.optimizedResume || prev.resume;
                if (!target) return prev;

                const updated = updater(target);

                if (prev.optimizedResume) {
                    return { ...prev, optimizedResume: updated };
                }
                return { ...prev, resume: updated };
            });
        },
        []
    );

    const updateBasics = useCallback(
        (basics: Partial<ResumeSchema["basics"]>) => {
            updateCurrentResume((prev) => ({
                ...prev,
                basics: { ...prev.basics, ...basics },
            }));
        },
        [updateCurrentResume]
    );

    // ── Experience CRUD ────────────────────────────────────────────

    const addExperience = useCallback(() => {
        updateCurrentResume((prev) => ({
            ...prev,
            experience: [
                ...prev.experience,
                {
                    id: generateId(),
                    company: "",
                    title: "",
                    startDate: "",
                    bullets: [""],
                },
            ],
        }));
    }, [updateCurrentResume]);

    const updateExperience = useCallback(
        (index: number, entry: ExperienceEntry) => {
            updateCurrentResume((prev) => {
                const next = [...prev.experience];
                next[index] = entry;
                return { ...prev, experience: next };
            });
        },
        [updateCurrentResume]
    );

    const removeExperience = useCallback(
        (index: number) => {
            updateCurrentResume((prev) => ({
                ...prev,
                experience: prev.experience.filter((_, i) => i !== index),
            }));
        },
        [updateCurrentResume]
    );

    const addExperienceBullet = useCallback(
        (expIndex: number) => {
            updateCurrentResume((prev) => {
                const next = [...prev.experience];
                next[expIndex] = {
                    ...next[expIndex],
                    bullets: [...next[expIndex].bullets, ""],
                };
                return { ...prev, experience: next };
            });
        },
        [updateCurrentResume]
    );

    const updateExperienceBullet = useCallback(
        (expIndex: number, bulletIndex: number, text: string) => {
            updateCurrentResume((prev) => {
                const next = [...prev.experience];
                const bullets = [...next[expIndex].bullets];
                bullets[bulletIndex] = text;
                next[expIndex] = { ...next[expIndex], bullets };
                return { ...prev, experience: next };
            });
        },
        [updateCurrentResume]
    );

    const removeExperienceBullet = useCallback(
        (expIndex: number, bulletIndex: number) => {
            updateCurrentResume((prev) => {
                const next = [...prev.experience];
                next[expIndex] = {
                    ...next[expIndex],
                    bullets: next[expIndex].bullets.filter((_, i) => i !== bulletIndex),
                };
                return { ...prev, experience: next };
            });
        },
        [updateCurrentResume]
    );

    // ── Education CRUD ─────────────────────────────────────────────

    const addEducation = useCallback(() => {
        updateCurrentResume((prev) => ({
            ...prev,
            education: [
                ...prev.education,
                { id: generateId(), institution: "", degree: "" },
            ],
        }));
    }, [updateCurrentResume]);

    const updateEducation = useCallback(
        (index: number, entry: EducationEntry) => {
            updateCurrentResume((prev) => {
                const next = [...prev.education];
                next[index] = entry;
                return { ...prev, education: next };
            });
        },
        [updateCurrentResume]
    );

    const removeEducation = useCallback(
        (index: number) => {
            updateCurrentResume((prev) => ({
                ...prev,
                education: prev.education.filter((_, i) => i !== index),
            }));
        },
        [updateCurrentResume]
    );

    // ── Projects CRUD ──────────────────────────────────────────────

    const addProject = useCallback(() => {
        updateCurrentResume((prev) => ({
            ...prev,
            projects: [
                ...prev.projects,
                { id: generateId(), name: "", description: "" },
            ],
        }));
    }, [updateCurrentResume]);

    const updateProject = useCallback(
        (index: number, entry: ProjectEntry) => {
            updateCurrentResume((prev) => {
                const next = [...prev.projects];
                next[index] = entry;
                return { ...prev, projects: next };
            });
        },
        [updateCurrentResume]
    );

    const removeProject = useCallback(
        (index: number) => {
            updateCurrentResume((prev) => ({
                ...prev,
                projects: prev.projects.filter((_, i) => i !== index),
            }));
        },
        [updateCurrentResume]
    );

    // ── Skills CRUD ────────────────────────────────────────────────

    const addSkill = useCallback(
        (skill: string) => {
            const trimmed = skill.trim();
            if (!trimmed) return;

            updateCurrentResume((prev) => {
                if (prev.skills.includes(trimmed)) return prev;
                return { ...prev, skills: [...prev.skills, trimmed] };
            });
        },
        [updateCurrentResume]
    );

    const removeSkill = useCallback(
        (skill: string) => {
            updateCurrentResume((prev) => ({
                ...prev,
                skills: prev.skills.filter((s) => s !== skill),
            }));
        },
        [updateCurrentResume]
    );

    const setSkills = useCallback(
        (skills: string[]) => {
            updateCurrentResume((prev) => ({ ...prev, skills }));
        },
        [updateCurrentResume]
    );

    // ── Pipeline Result Handlers ───────────────────────────────────

    const handleParsed = useCallback((data: ResumeSchema) => {
        setState((prev) => ({
            ...prev,
            resume: data,
            optimizedResume: null,
            atsScore: null,
            coverLetter: "",
            validation: null,
        }));
    }, []);

    const handleAnalyzed = useCallback((data: JDAnalysis) => {
        setState((prev) => ({ ...prev, jdAnalysis: data }));
    }, []);

    const handleMapped = useCallback((data: EvidenceMapping) => {
        setState((prev) => ({ ...prev, evidenceMapping: data }));
    }, []);

    const handleEnhanced = useCallback((data: Partial<ResumeSchema>) => {
        setState((prev) => {
            const base = prev.resume ?? createEmptyResume();
            const baseBasics = base.basics ?? { name: "", email: "" } as ResumeSchema["basics"];
            const dataBasics = (data.basics ?? {}) as Partial<ResumeSchema["basics"]>;

            const merged: ResumeSchema = {
                basics: {
                    name: dataBasics.name ?? baseBasics.name ?? "",
                    email: dataBasics.email ?? baseBasics.email ?? "",
                    phone: dataBasics.phone ?? baseBasics.phone,
                    linkedin: dataBasics.linkedin ?? baseBasics.linkedin,
                    github: dataBasics.github ?? baseBasics.github,
                    website: dataBasics.website ?? baseBasics.website,
                    location: dataBasics.location ?? baseBasics.location,
                    summary: dataBasics.summary ?? baseBasics.summary,
                },
                experience: data.experience ?? base.experience ?? [],
                education: data.education ?? base.education ?? [],
                projects: data.projects ?? base.projects ?? [],
                skills: data.skills ?? base.skills ?? [],
                certifications: data.certifications ?? base.certifications,
            };
            return { ...prev, optimizedResume: merged };
        });
    }, []);



    const handleScored = useCallback((data: ATSScore) => {
        setState((prev) => ({ ...prev, atsScore: data }));
    }, []);

    const handleCoverLetter = useCallback((data: string) => {
        setState((prev) => ({ ...prev, coverLetter: data }));
    }, []);

    const handleValidated = useCallback((data: ValidationResult) => {
        setState((prev) => ({ ...prev, validation: data }));
    }, []);

    // ── Reset ──────────────────────────────────────────────────────

    const reset = useCallback(() => {
        setState(initialState);
    }, []);

    const resetOptimized = useCallback(() => {
        setState((prev) => ({
            ...prev,
            optimizedResume: null,
            atsScore: null,
            coverLetter: "",
            validation: null,
            evidenceMapping: null,
            jdAnalysis: null,
        }));
    }, []);

    return {
        // State
        ...state,
        currentResume,
        hasResume,
        hasOptimized,
        hasJobDescription,

        // Setters
        setRawText,
        setJobDescription,
        setResume,
        setOptimizedResume,
        setJdAnalysis,
        setEvidenceMapping,
        setAtsScore,
        setCoverLetter,
        setValidation,

        // Section locking
        toggleLock,
        isLocked,

        // Resume mutation
        updateCurrentResume,
        updateBasics,

        // Experience
        addExperience,
        updateExperience,
        removeExperience,
        addExperienceBullet,
        updateExperienceBullet,
        removeExperienceBullet,

        // Education
        addEducation,
        updateEducation,
        removeEducation,

        // Projects
        addProject,
        updateProject,
        removeProject,

        // Skills
        addSkill,
        removeSkill,
        setSkills,

        // Pipeline handlers
        handleParsed,
        handleAnalyzed,
        handleMapped,
        handleEnhanced,
        handleScored,
        handleCoverLetter,
        handleValidated,

        // Reset
        reset,
        resetOptimized,
    };
}
