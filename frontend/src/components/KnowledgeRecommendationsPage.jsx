import { useEffect, useState } from "react";

import { RECOMMENDATIONS_BY_AREA, RECOMMENDATION_SECTIONS } from "./KnowledgeAreaPage";
import { recordRecommendationActivity } from "../utils/personalActivity";
import { loadProgress, saveProgress } from "../services/progress";
import "./KnowledgeRecommendationsPage.css";

const EXTRA_BOOKS = {
    humanidades: [
        { title: "Comunidades imaginadas — Benedict Anderson", description: "Uma referência para compreender nações, identidades e pertencimento.", source: "Amazon", url: "https://www.amazon.com.br/s?k=Comunidades+imaginadas+Benedict+Anderson" },
        { title: "Orientalismo — Edward Said", description: "Uma análise decisiva das relações entre conhecimento, cultura e poder.", source: "Amazon", url: "https://www.amazon.com.br/s?k=Orientalismo+Edward+Said" },
    ],
    filosofia: [
        { title: "O mundo de Sofia — Jostein Gaarder", description: "Uma introdução narrativa à história da filosofia ocidental.", source: "Amazon", url: "https://www.amazon.com.br/s?k=O+mundo+de+Sofia" },
        { title: "Convite à filosofia — Marilena Chauí", description: "Conceitos e problemas fundamentais apresentados em linguagem didática.", source: "Amazon", url: "https://www.amazon.com.br/s?k=Convite+a+filosofia+Marilena+Chaui" },
    ],
    "filosofia/metafisica": [
        { title: "O nomear e a necessidade — Saul Kripke", description: "Uma obra central sobre referência, identidade e necessidade.", source: "Amazon", url: "https://www.amazon.com.br/s?k=O+nomear+e+a+necessidade+Kripke" },
        { title: "Introdução à metafísica — Martin Heidegger", description: "Uma investigação sobre a pergunta pelo ser e o sentido da metafísica.", source: "Amazon", url: "https://www.amazon.com.br/s?k=Introducao+a+metafisica+Heidegger" },
    ],
    "filosofia/metafisica/tempo-e-espaco": [
        { title: "Uma breve história do tempo — Stephen Hawking", description: "Cosmologia, origem do universo e natureza do tempo para o público geral.", source: "Amazon", url: "https://www.amazon.com.br/s?k=Uma+breve+historia+do+tempo+Hawking" },
        { title: "O tecido do cosmo — Brian Greene", description: "Uma exploração de espaço, tempo e realidade na física moderna.", source: "Amazon", url: "https://www.amazon.com.br/s?k=O+tecido+do+cosmo+Brian+Greene" },
    ],
};

const AREA_NAMES = {
    humanidades: "Humanidades",
    filosofia: "Humanidades | Filosofia",
    "filosofia/metafisica": "Humanidades | Filosofia | Metafísica",
    "filosofia/metafisica/tempo-e-espaco": "Humanidades | Filosofia | Metafísica | Tempo e Espaço",
};

const READING_STATES = [
    { id: "want", title: "Quero ler", hint: "Sua próxima leitura" },
    { id: "reading", title: "Lendo", hint: "Em andamento" },
    { id: "read", title: "Lidos", hint: "Leituras concluídas" },
];

const MEDIA_STATES = [
    { id: "want", title: "Quero", hint: "Para começar depois" },
    { id: "doing", title: "Fazendo", hint: "Em andamento" },
    { id: "done", title: "Feito", hint: "Concluído" },
];
const PLACE_STATES = [
    { id: "want", title: "Quero visitar", hint: "Lugares para conhecer" },
    { id: "doing", title: "Planejando", hint: "Próximas visitas" },
    { id: "done", title: "Já fui", hint: "Experiências realizadas" },
];

const STORAGE_BY_CATEGORY = { books: "ider-reading-library", videos: "ider-video-library", films: "ider-film-library", podcasts: "ider-podcast-library", publications: "ider-publication-library", places: "ider-places-library" };

function KnowledgeRecommendationsPage({ areaPath, categorySlug, onBack, onOpenCategory }) {
    const section = RECOMMENDATION_SECTIONS.find((item) => item.slug === categorySlug) || RECOMMENDATION_SECTIONS[0];
    const storageKey = STORAGE_BY_CATEGORY[section.id] || `ider-${section.id}-library`;
    const scope = `library-${section.id}`;
    const states = section.id === "books" ? READING_STATES : section.id === "places" ? PLACE_STATES : MEDIA_STATES;
    const [library, setLibrary] = useState({});
    const [syncing, setSyncing] = useState(true);
    useEffect(() => {
        let active = true;
        loadProgress(scope, storageKey, {}).then((data) => { if (active) { setLibrary(data); setSyncing(false); } });
        return () => { active = false; };
    }, [scope, storageKey]);
    const areaRecommendations = RECOMMENDATIONS_BY_AREA[areaPath] || [];
    const baseItems = areaRecommendations.filter((item) => item.category === section.id);
    const items = section.id === "books" ? [...baseItems, ...(EXTRA_BOOKS[areaPath] || [])] : baseItems;
    const areaName = AREA_NAMES[areaPath] || areaPath;
    const statusFor = (item) => library[`${areaPath}:${item.title}`] || "want";
    const moveItem = (item, status) => setLibrary((current) => {
        const next = { ...current, [`${areaPath}:${item.title}`]: status };
        saveProgress(scope, storageKey, next);
        return next;
    });

    const renderItem = (item) => <article className="recommendation-detail-card" key={item.title}>
        <div className="recommendation-detail-source"><span>{item.source?.slice(0, 3).toUpperCase()}</span><small>{item.source}</small></div>
        <div><h3>{item.title}</h3><p>{item.description}</p></div>
        <label>Meu progresso<select value={statusFor(item)} onChange={(event) => moveItem(item, event.target.value)}>{states.map((state) => <option value={state.id} key={state.id}>{state.title}</option>)}</select></label>
        <a href={item.url} target="_blank" rel="noreferrer" onClick={() => recordRecommendationActivity({ ...item, category: section.id }, areaPath)}>Abrir indicação ↗</a>
    </article>;

    return <main className="recommendations-detail-page">
        <nav className="recommendations-detail-breadcrumb"><button type="button" onClick={onBack}>← Voltar para a roda</button><span>{areaName}</span></nav>
        <header><p>INDICAÇÕES DE {areaName.toUpperCase()}</p><h1>{section.title}</h1><span>{section.description}</span></header>
        <nav className="recommendation-category-tabs" aria-label="Categorias de indicação">{RECOMMENDATION_SECTIONS.map((item) => <button type="button" className={item.id === section.id ? "active" : ""} key={item.id} onClick={() => onOpenCategory(item.slug)}><small>{item.number}</small>{item.title}</button>)}</nav>
        {syncing ? <p className="recommendation-sync">Sincronizando seu progresso...</p> : items.length > 0 ? <section className="reading-board" aria-label={`Meu progresso em ${section.title}`}>{states.map((state) => <section key={state.id}><header><div><h2>{state.title}</h2><span>{state.hint}</span></div><b>{items.filter((item) => statusFor(item) === state.id).length}</b></header><div>{items.filter((item) => statusFor(item) === state.id).map(renderItem)}{items.every((item) => statusFor(item) !== state.id) && <p className="reading-empty">Nenhum item nesta etapa.</p>}</div></section>)}</section> : <section className="recommendation-detail-list"><p>Nenhuma indicação cadastrada nesta categoria.</p></section>}
    </main>;
}

export { EXTRA_BOOKS };
export default KnowledgeRecommendationsPage;
