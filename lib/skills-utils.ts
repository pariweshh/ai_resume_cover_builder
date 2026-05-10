export type SkillCategory = {
    label: string;
    items: string[];
};

export type SkillData = {
    isCategorized: boolean;
    categories: SkillCategory[];
    flat: string[];
};

export function parseSkills(skills: string[]): SkillData {
    if (!skills || skills.length === 0) {
        return { isCategorized: false, categories: [], flat: [] };
    }

    // Count how many entries contain ":"
    const colonCount = skills.filter((s) => s.includes(":")).length;

    // If more than half have colons, treat as categorized
    const isCategorized = colonCount >= skills.length / 2 && colonCount > 0;

    if (!isCategorized) {
        // Flat list — each string is a skill
        // But still check if some have colons (mixed)
        const flat: string[] = [];
        const categories: SkillCategory[] = [];

        for (const skill of skills) {
            if (skill.includes(":")) {
                const [label, rest] = skill.split(/:(.+)/);
                const items = rest
                    .split(/[,·|]/)
                    .map((s) => s.trim())
                    .filter(Boolean);
                if (items.length > 0) {
                    categories.push({ label: label.trim(), items });
                } else {
                    flat.push(skill);
                }
            } else {
                flat.push(skill);
            }
        }

        if (categories.length > 0) {
            return { isCategorized: true, categories, flat };
        }

        return { isCategorized: false, categories: [], flat: skills };
    }

    // Categorized — parse each entry
    const categories: SkillCategory[] = [];
    const uncategorized: string[] = [];

    for (const skill of skills) {
        if (skill.includes(":")) {
            const [label, rest] = skill.split(/:(.+)/);
            const items = rest
                .split(/[,·|]/)
                .map((s) => s.trim())
                .filter(Boolean);
            if (items.length > 0) {
                categories.push({ label: label.trim(), items });
            } else {
                uncategorized.push(skill);
            }
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
