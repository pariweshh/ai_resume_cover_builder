"use server";

import { createClient } from "@/lib/supabase/server";
import type { ResumeSchema, JDAnalysis, ATSScore } from "@/types";

export async function saveResume(data: {
    title: string;
    rawData: string;
    parsedData: ResumeSchema | null;
    optimizedData: ResumeSchema | null;
    jobDescription: string | null;
    jdAnalysis: JDAnalysis | null;
    atsScore: ATSScore | null;
    coverLetter: string | null;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        // For anonymous users, save to local storage (handled client-side)
        return { id: crypto.randomUUID(), anonymous: true };
    }

    const { data: resume, error } = await supabase
        .from("resumes")
        .upsert({
            user_id: user.id,
            title: data.title,
            raw_data: data.rawData,
            parsed_data: data.parsedData,
            optimized_data: data.optimizedData,
            job_description: data.jobDescription,
            jd_analysis: data.jdAnalysis,
            ats_score: data.atsScore,
            cover_letter: data.coverLetter,
            updated_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    return resume;
}

export async function loadResumes() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
        .from("resumes")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data;
}

export async function deleteResume(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("resumes").delete().eq("id", id);
    if (error) throw new Error(error.message);
}
