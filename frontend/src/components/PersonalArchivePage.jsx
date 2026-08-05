import { useEffect, useMemo, useState } from "react";

import { RECOMMENDATIONS_BY_AREA } from "./KnowledgeAreaPage";
import { loadProgress, saveProgress } from "../services/progress";
import "./PersonalArchivePage.css";
import "./MuseumArchive.css";

const AREA_NAMES = { humanidades: "Humanidades", filosofia: "Filosofia", "filosofia/metafisica": "Metafísica", "filosofia/metafisica/tempo-e-espaco": "Tempo e Espaço" };
const FILMS = [
    { title: "Sócrates", creator: "Roberto Rossellini", year: "1971", type: "Filme", description: "Uma representação dos últimos momentos e do pensamento de Sócrates.", areaPath: "filosofia" },
    { title: "O Nome da Rosa", creator: "Jean-Jacques Annaud", year: "1986", type: "Filme", description: "Conhecimento, fé e investigação em uma abadia medieval.", areaPath: "humanidades" },
    { title: "Cosmos", creator: "Carl Sagan", year: "1980", type: "Documentário", description: "Uma jornada pela ciência, pelo universo e pela história das ideias.", areaPath: "filosofia/metafisica/tempo-e-espaco" },
    { title: "A História de Deus", creator: "Morgan Freeman", year: "2016", type: "Documentário", description: "Tradições, crenças e perguntas humanas sobre o divino.", areaPath: "humanidades" },
];
const CONFIG = {
    podcastLibrary: { eyebrow: "PODTECA PARTICULAR", title: "Minha PodTeca", subtitle: "Episódios, conversas e séries para acompanhar com atenção.", category: "podcasts", storage: "ider-podcast-library", scope: "library-podcasts", itemLabel: "episódios" },
    publicationLibrary: { eyebrow: "REVISTOTECA PARTICULAR", title: "Minha Revistoteca", subtitle: "Revistas e newsletters que mantêm suas ideias em circulação.", category: "publications", storage: "ider-publication-library", scope: "library-publications", itemLabel: "publicações" },
    filmLibrary: { eyebrow: "VIDEOTECA PARTICULAR", title: "Minha Videoteca", subtitle: "Filmes, documentários e produções longas para assistir e guardar.", category: "films", storage: "ider-film-library", scope: "library-films", itemLabel: "títulos" },
    museumLibrary: { eyebrow: "MUSEUTECA PARTICULAR", title: "Minha MuseuTeca", subtitle: "Museus, casas históricas e lugares culturais ligados aos temas que você explora.", category: "places", storage: "ider-places-library", scope: "library-places", itemLabel: "lugares" },
};
const STATES = [{ id: "want", title: "Quero conhecer" }, { id: "doing", title: "Em andamento" }, { id: "done", title: "Concluído" }];
const VISIT_STATES = [{ id: "want", title: "Quero visitar" }, { id: "doing", title: "Planejando" }, { id: "done", title: "Já fui" }];

function itemsFor(config) {
    if (config.category === "films") {
        const recommendations = Object.entries(RECOMMENDATIONS_BY_AREA).flatMap(([areaPath, items]) => items.filter((item) => item.category === "films").map((item) => ({ ...item, areaPath })));
        const titles = new Set(recommendations.map((item) => `${item.areaPath}:${item.title}`));
        const initialCollection = FILMS.filter((item) => !titles.has(`${item.areaPath}:${item.title}`)).map((item) => ({ ...item, category: "films", source: item.type }));
        return [...recommendations, ...initialCollection];
    }
    return Object.entries(RECOMMENDATIONS_BY_AREA).flatMap(([areaPath, items]) => items.filter((item) => item.category === config.category).map((item) => ({ ...item, areaPath })));
}

function PersonalArchivePage({ archive, onBack, onOpenItem }) {
    const config = CONFIG[archive] || CONFIG.podcastLibrary;
    const states = config.category === "places" ? VISIT_STATES : STATES;
    const items = useMemo(() => itemsFor(config), [config]);
    const [statuses, setStatuses] = useState({});
    const [query, setQuery] = useState("");
    useEffect(() => { loadProgress(config.scope, config.storage, {}).then(setStatuses); }, [config]);
    const keyFor = (item) => `${item.areaPath}:${item.title}`;
    const statusFor = (item) => statuses[keyFor(item)] || "want";
    const move = (item, status) => { const next = { ...statuses, [keyFor(item)]: status }; setStatuses(next); saveProgress(config.scope, config.storage, next); };
    const visible = items.filter((item) => [item.title, item.description, item.creator, AREA_NAMES[item.areaPath] || item.areaPath].join(" ").toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR")));

    return <main className={`personal-archive-page ${config.category}`}>
        <nav><button type="button" onClick={onBack}>← Meu IDER</button><span>Acervo pessoal</span></nav>
        <header><div><p>{config.eyebrow}</p><h1>{config.title}</h1><span>{config.subtitle}</span></div><aside><strong>{items.filter((item) => statusFor(item) === "done").length}</strong><span>{config.itemLabel} concluídos</span><small>{items.length} no acervo</small></aside></header>
        <section className="personal-archive-room"><header><div><span>ARQUIVO PESSOAL</span><strong>Explore sua coleção</strong></div><label>Buscar<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Título, tema ou autor..."/></label></header>
            {states.map((state) => { const matches = visible.filter((item) => statusFor(item) === state.id); return <section className="archive-state" key={state.id}><header><h2>{state.title}</h2><b>{matches.length}</b></header><div>{matches.map((item) => <article className="archive-media-card" key={keyFor(item)}><div className="archive-media-visual"><small>{item.source || item.type || config.title}</small><strong>{item.title.slice(0,2).toUpperCase()}</strong><span>{item.year || AREA_NAMES[item.areaPath] || item.areaPath}</span></div><div><span>{AREA_NAMES[item.areaPath] || item.areaPath}</span><h3>{item.title}</h3>{item.creator && <i>{item.creator}</i>}<p>{item.description}</p><label>Progresso<select value={statusFor(item)} onChange={(event) => move(item,event.target.value)}>{states.map((option) => <option value={option.id} key={option.id}>{option.title}</option>)}</select></label><button type="button" onClick={() => onOpenItem(item)}>Abrir detalhes e anotações →</button></div></article>)}{!matches.length && <p className="archive-empty">Nenhum item nesta seção.</p>}</div></section>; })}
        </section>
    </main>;
}

export { FILMS };
export default PersonalArchivePage;
