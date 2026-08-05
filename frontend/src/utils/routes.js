export const VIEW_PATHS = { home: "/inicio", timeline: "/tempo/horizontal", vertical: "/tempo/vertical", "philosophy-tree": "/tempo/arvore", "knowledge-tree": "/conhecimento/evolucao", "knowledge-map": "/conhecimento/mapa", trails: "/trilhas", profiles: "/perfis", avatars: "/avatares", "my-ider": "/meu-ider", notebook: "/meu-ider/caderno", badges: "/meu-ider/badges", library: "/meu-ider/biblioteca", videoLibrary: "/meu-ider/youtubeteca", podcastLibrary: "/meu-ider/podteca", publicationLibrary: "/meu-ider/revistoteca", filmLibrary: "/meu-ider/videoteca", museumLibrary: "/meu-ider/museuteca", map: "/mapa", about: "/sobre" };
export function routeFromPath(pathname) {
    const path = pathname === "/" ? "/inicio" : pathname.replace(/\/$/, "") || "/inicio";
    const profile = path.match(/^\/perfis\/(\d+)$/);
    if (profile) return { view: "profiles", entityId: Number(profile[1]) };
    if (path === "/meu-ider/caderno") return { view: "notebook", entityId: null };
    const libraryItem = path.match(/^\/meu-ider\/acervo\/([^/]+)\/([^/]+)$/);
    if (libraryItem) {
        try {
            const [areaPath, ...titleParts] = decodeURIComponent(libraryItem[2]).split(":");
            return { view: "library-item", entityId: null, libraryItem: { category: libraryItem[1], areaPath, title: titleParts.join(":") } };
        } catch { return { view: "my-ider", entityId: null }; }
    }
    const recommendations = path.match(/^\/conhecimento\/area\/(.+)\/indicacoes\/([^/]+)$/);
    if (recommendations) return { view: "knowledge-recommendations", entityId: null, areaPath: recommendations[1], recommendationCategory: recommendations[2] };
    const knowledgeArea = path.match(/^\/conhecimento\/area\/(.+)$/);
    if (knowledgeArea) return { view: "knowledge-area", entityId: null, areaPath: knowledgeArea[1] };
    const match = Object.entries(VIEW_PATHS).find(([, candidate]) => candidate === path);
    return { view: match?.[0] || "home", entityId: null };
}
export function pathForView(view, value = null) { if (view === "profiles" && value) return `/perfis/${value}`; if (view === "knowledge-area" && value) return `/conhecimento/area/${value}`; if (view === "knowledge-recommendations" && value?.areaPath && value?.category) return `/conhecimento/area/${value.areaPath}/indicacoes/${value.category}`; if (view === "library-item" && value?.category && value?.areaPath && value?.title) return `/meu-ider/acervo/${value.category}/${encodeURIComponent(`${value.areaPath}:${value.title}`)}`; return VIEW_PATHS[view] || VIEW_PATHS.home; }
