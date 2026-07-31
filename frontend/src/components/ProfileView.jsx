import { useEffect, useMemo, useState } from "react";

import api from "../services/api";

import "./ProfileView.css";


function formatYear(year) {
    if (!Number.isInteger(year)) return null;
    if (year < 0) return `${Math.abs(year)} a.C.`;
    return `${year || 1} d.C.`;
}


function splitLines(value) {
    return value?.split("\n").map((item) => item.trim()).filter(Boolean) || [];
}


function getProfileLabels(entity) {
    if (entity.track === "Cientistas") return { works: "Contribuições principais", ideas: "Descobertas e conceitos" };
    if (entity.track === "Líderes") return { works: "Principais realizações", ideas: "Princípios e políticas" };
    if (entity.track === "Músicos") return { works: "Obras e gravações principais", ideas: "Características e inovações" };
    if (entity.track === "Artistas") return { works: "Obras principais", ideas: "Temas e inovações" };
    if (entity.track === "Escritores") return { works: "Obras principais", ideas: "Temas e recursos literários" };
    return { works: "Obras principais", ideas: "Principais ideias" };
}


function ProfileView({ initialEntityId = null, onNavigate }) {
    const [entities, setEntities] = useState([]);
    const [relationships, setRelationships] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [compareId, setCompareId] = useState("");
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        Promise.all([api.get("/entities"), api.get("/relationships")])
            .then(([entityResponse, relationshipResponse]) => {
                const ordered = [...entityResponse.data].sort((first, second) => first.name.localeCompare(second.name, "pt-BR"));
                setEntities(ordered);
                setRelationships(relationshipResponse.data);
                setSelectedId(initialEntityId || ordered.find((entity) => entity.name === "Platão")?.id || ordered[0]?.id || null);
            })
            .catch(() => setError("Não foi possível carregar os perfis."))
            .finally(() => setLoading(false));
    }, [initialEntityId]);

    const selected = entities.find((entity) => entity.id === selectedId);
    const compared = entities.find((entity) => entity.id === Number(compareId));
    const results = useMemo(() => {
        const normalized = query.trim().toLocaleLowerCase("pt-BR");
        if (!normalized) return entities;
        return entities.filter((entity) => (
            entity.name.toLocaleLowerCase("pt-BR").includes(normalized)
            || entity.track?.toLocaleLowerCase("pt-BR").includes(normalized)
        )).slice(0, 20);
    }, [entities, query]);
    const related = selected ? relationships.filter((relationship) => (
        relationship.source === selected.name || relationship.target === selected.name
    )) : [];
    const contemporaries = selected ? entities.filter((entity) => (
        entity.id !== selected.id
        && Number.isInteger(entity.start_year)
        && Math.abs(entity.start_year - selected.start_year) <= 50
    )).slice(0, 8) : [];
    const labels = selected ? getProfileLabels(selected) : getProfileLabels({});

    if (loading) return <div className="profile-status">Carregando perfis...</div>;
    if (error) return <div className="profile-status">{error}</div>;

    return (
        <section className="profile-view" aria-labelledby="profile-view-title">
            <header className="profile-intro">
                <p>HISTÓRIA EM DETALHES</p>
                <h2 id="profile-view-title">Perfis individuais</h2>
                <span>Explore pessoas, livros, obras, tecnologias e outros elementos históricos.</span>
            </header>

            <div className="profile-layout">
                <aside className="profile-browser">
                    <label htmlFor="profile-search">Escolha um perfil</label>
                    <input
                        id="profile-search"
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Buscar por nome ou categoria"
                    />
                    <div className="profile-results" role="listbox" aria-label="Resultados da busca">
                        {results.map((entity) => (
                            <button
                                type="button"
                                role="option"
                                aria-selected={entity.id === selectedId}
                                className={entity.id === selectedId ? "active" : ""}
                                key={entity.id}
                                onClick={() => {
                                    setSelectedId(entity.id);
                                    setQuery("");
                                    onNavigate?.("profiles", entity.id);
                                }}
                            >
                                {entity.image_url ? <img src={entity.image_url} alt="" loading="lazy" /> : <i>{entity.name.charAt(0)}</i>}
                                <span>
                                    <strong>{entity.name}</strong>
                                    <small>{entity.track || entity.entity_type}</small>
                                    {(entity.notable_works || entity.key_ideas || entity.legacy) && <em>Perfil completo</em>}
                                </span>
                            </button>
                        ))}
                    </div>
                </aside>

                {selected && (
                    <article className="individual-profile">
                        <header className="individual-profile-hero">
                            <div className="individual-profile-image">
                                {selected.image_url ? <img src={selected.image_url} alt={`Representação de ${selected.name}`} /> : <span>{selected.name.charAt(0)}</span>}
                            </div>
                            <div>
                                <span>{selected.track || selected.entity_type}</span>
                                <h2>{selected.name}</h2>
                                <dl>
                                    {formatYear(selected.start_year) && <><dt>Início / nascimento</dt><dd>{formatYear(selected.start_year)}</dd></>}
                                    {formatYear(selected.end_year) && <><dt>Fim / morte</dt><dd>{formatYear(selected.end_year)}</dd></>}
                                    {selected.origin_country && <><dt>Origem</dt><dd>{selected.origin_country}</dd></>}
                                </dl>
                            </div>
                        </header>

                        <nav className="profile-cross-navigation" aria-label="Ver este conteúdo em outras perspectivas">
                            <button type="button" onClick={() => onNavigate?.("timeline")}>Ver no tempo</button>
                            <button type="button" onClick={() => onNavigate?.("philosophy-tree")}>Ver na árvore</button>
                            <button type="button" onClick={() => onNavigate?.("map")}>Ver no mapa</button>
                            <button type="button" onClick={() => onNavigate?.("knowledge-tree")}>Ver área relacionada</button>
                        </nav>

                        <section className="profile-compare">
                            <label htmlFor="compare-profile">Comparar com outro perfil</label>
                            <select id="compare-profile" value={compareId} onChange={(event) => setCompareId(event.target.value)}>
                                <option value="">Selecione uma pessoa, obra ou livro</option>
                                {entities.filter((entity) => entity.id !== selected.id).map((entity) => <option value={entity.id} key={entity.id}>{entity.name} · {entity.track || entity.entity_type}</option>)}
                            </select>
                            {compared && (
                                <div className="profile-comparison" role="region" aria-label={`Comparação entre ${selected.name} e ${compared.name}`}>
                                    <div className="comparison-head"><span>Critério</span><strong>{selected.name}</strong><strong>{compared.name}</strong></div>
                                    <div><span>Categoria</span><p>{selected.track || selected.entity_type}</p><p>{compared.track || compared.entity_type}</p></div>
                                    <div><span>Período</span><p>{formatYear(selected.start_year) || "—"} – {formatYear(selected.end_year) || "—"}</p><p>{formatYear(compared.start_year) || "—"} – {formatYear(compared.end_year) || "—"}</p></div>
                                    <div><span>Origem</span><p>{selected.origin_country || "—"}</p><p>{compared.origin_country || "—"}</p></div>
                                    <div><span>Ideias</span><p>{selected.key_ideas || "—"}</p><p>{compared.key_ideas || "—"}</p></div>
                                    <div><span>Obras</span><p>{selected.notable_works || "—"}</p><p>{compared.notable_works || "—"}</p></div>
                                    <div><span>Legado</span><p>{selected.legacy || "—"}</p><p>{compared.legacy || "—"}</p></div>
                                </div>
                            )}
                        </section>

                        {selected.description && <section className="profile-section"><h3>Visão geral</h3><p>{selected.description}</p></section>}

                        {(selected.latitude != null && selected.longitude != null) && (
                            <section className="profile-section profile-location">
                                <h3>Local de origem ou nascimento</h3>
                                <p>{selected.origin_country || "Local registrado"}</p>
                                <span>{selected.latitude.toFixed(4)}, {selected.longitude.toFixed(4)}</span>
                            </section>
                        )}

                        {splitLines(selected.notable_works).length > 0 && (
                            <section className="profile-section"><h3>{labels.works}</h3><ul>{splitLines(selected.notable_works).map((work) => <li key={work}>{work}</li>)}</ul></section>
                        )}

                        {splitLines(selected.key_ideas).length > 0 && (
                            <section className="profile-section"><h3>{labels.ideas}</h3><ul>{splitLines(selected.key_ideas).map((idea) => <li key={idea}>{idea}</li>)}</ul></section>
                        )}

                        {selected.legacy && <section className="profile-section"><h3>Legado e influência</h3><p>{selected.legacy}</p></section>}

                        {related.length > 0 && (
                            <section className="profile-section">
                                <h3>Relações históricas</h3>
                                <ul>{related.map((relationship) => (
                                    <li key={`${relationship.source}-${relationship.relation}-${relationship.target}`}>
                                        {relationship.source} — {relationship.relation} — {relationship.target}
                                    </li>
                                ))}</ul>
                            </section>
                        )}

                        {contemporaries.length > 0 && (
                            <section className="profile-section">
                                <h3>Contemporâneos</h3>
                                <div className="profile-contemporaries">
                                    {contemporaries.map((entity) => (
                                        <button type="button" key={entity.id} onClick={() => onNavigate?.("profiles", entity.id)}>
                                            <strong>{entity.name}</strong><span>{entity.track}</span>
                                        </button>
                                    ))}
                                </div>
                            </section>
                        )}

                        <section className="profile-section profile-sources">
                            <h3>Fontes e revisão</h3>
                            <p>Conteúdo educativo em revisão contínua. Datas aproximadas, atribuições disputadas e referências específicas devem ser indicadas conforme a documentação de cada registro.</p>
                            <small>Última consulta deste perfil: {new Date().toLocaleDateString("pt-BR")}</small>
                        </section>
                    </article>
                )}
            </div>
        </section>
    );
}


export default ProfileView;
