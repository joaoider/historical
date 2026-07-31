import { useEffect, useMemo, useRef, useState } from "react";

import api from "../services/api";
import "./GlobalSearch.css";

function GlobalSearch({ onSelect }) {
    const [entities, setEntities] = useState([]);
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);

    useEffect(() => {
        api.get("/entities").then((response) => setEntities(response.data)).catch(() => setEntities([]));
    }, []);

    useEffect(() => {
        const close = (event) => {
            if (!rootRef.current?.contains(event.target)) setOpen(false);
        };
        document.addEventListener("pointerdown", close);
        return () => document.removeEventListener("pointerdown", close);
    }, []);

    const results = useMemo(() => {
        const term = query.trim().toLocaleLowerCase("pt-BR");
        if (term.length < 2) return [];
        return entities.filter((entity) => [entity.name, entity.track, entity.description, entity.key_ideas, entity.notable_works]
            .some((value) => value?.toLocaleLowerCase("pt-BR").includes(term))).slice(0, 8);
    }, [entities, query]);

    return (
        <div className="global-search" ref={rootRef}>
            <label className="sr-only" htmlFor="global-search-input">Pesquisar em todo o IDER</label>
            <input
                id="global-search-input"
                type="search"
                value={query}
                placeholder="Buscar pessoa, livro, obra ou ideia..."
                onFocus={() => setOpen(true)}
                onChange={(event) => { setQuery(event.target.value); setOpen(true); }}
                onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}
            />
            <span aria-hidden="true">⌕</span>
            {open && query.trim().length >= 2 && (
                <div className="global-search-results" role="listbox" aria-label="Resultados da pesquisa">
                    {results.length ? results.map((entity) => (
                        <button type="button" role="option" aria-selected="false" key={entity.id} onClick={() => { onSelect(entity.id); setOpen(false); setQuery(""); }}>
                            {entity.image_url ? <img src={entity.image_url} alt="" loading="lazy" /> : <i>{entity.name.charAt(0)}</i>}
                            <span><strong>{entity.name}</strong><small>{entity.track || entity.entity_type}</small></span>
                        </button>
                    )) : <p>Nenhum resultado encontrado.</p>}
                </div>
            )}
        </div>
    );
}

export default GlobalSearch;
