export const EDITORIAL_FIELDS = [
    "description", "start_year", "origin_country", "image_url",
    "notable_works", "key_ideas", "legacy", "sources",
];

export function getCompleteness(entity) {
    const completed = EDITORIAL_FIELDS.filter((field) => {
        const value = entity?.[field];
        return value !== null && value !== undefined && String(value).trim() !== "";
    }).length;
    const score = Math.round((completed / EDITORIAL_FIELDS.length) * 100);
    const missing = EDITORIAL_FIELDS.filter((field) => !entity?.[field] && entity?.[field] !== 0);
    const level = score >= 88 ? "complete" : score >= 55 ? "review" : "incomplete";
    return { score, missing, level };
}

export const FIELD_LABELS = {
    description: "descrição", start_year: "data inicial", origin_country: "origem",
    image_url: "imagem", notable_works: "obras", key_ideas: "ideias",
    legacy: "legado", sources: "fontes",
};
