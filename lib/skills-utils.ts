export type SkillCategory = {
    label: string;
    items: string[];
};

export type SkillData = {
    isCategorized: boolean;
    categories: SkillCategory[];
    flat: string[];
};

function parseSkillEntry(skill: string): { label: string; items: string[] } | null {
    if (!skill.includes(":")) return null;
    const parts = skill.split(/:(.+)/);
    const label = (parts[0] ?? skill).trim();
    const rest = parts[1];
    const items = rest
        ? rest
            .split(/[,·|]/)
            .map((s) => s.trim())
            .filter(Boolean)
        : [];
    if (items.length === 0) return null;
    return { label, items };
}

export function parseSkills(skills: string[]): SkillData {
    if (!skills || skills.length === 0) {
        return { isCategorized: false, categories: [], flat: [] };
    }

    const colonCount = skills.filter((s) => s.includes(":")).length;
    const isCategorized = colonCount >= skills.length / 2 && colonCount > 0;

    if (!isCategorized) {
        const flat: string[] = [];
        const categories: SkillCategory[] = [];

        for (const skill of skills) {
            const parsed = parseSkillEntry(skill);
            if (parsed) {
                categories.push(parsed);
            } else {
                flat.push(skill);
            }
        }

        if (categories.length > 0) {
            return { isCategorized: true, categories, flat };
        }

        return { isCategorized: false, categories: [], flat: skills };
    }

    const categories: SkillCategory[] = [];
    const uncategorized: string[] = [];

    for (const skill of skills) {
        const parsed = parseSkillEntry(skill);
        if (parsed) {
            categories.push(parsed);
        } else {
            uncategorized.push(skill);
        }
    }

    return {
        isCategorized: true,
        categories,
        flat: uncategorized,
    };
}

export function skillsToText(skills: string[]): string {
    const data = parseSkills(skills);

    if (!data.isCategorized) {
        return data.flat.join(", ");
    }

    const parts: string[] = [];
    for (const cat of data.categories) {
        parts.push(`${cat.label}: ${cat.items.join(", ")}`);
    }
    if (data.flat.length > 0) {
        parts.push(data.flat.join(", "));
    }
    return parts.join("\n");
}

export function skillsToFlat(skills: string[]): string[] {
    const data = parseSkills(skills);
    const all: string[] = [];
    for (const cat of data.categories) {
        all.push(...cat.items);
    }
    all.push(...data.flat);
    return [...new Set(all)];
}
