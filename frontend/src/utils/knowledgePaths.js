export function knowledgeSlug(value) {
    return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function appendKnowledgePath(path, name) {
    return [...(path ? path.split("/") : []), knowledgeSlug(name)].join("/");
}
