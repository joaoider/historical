import { useEffect, useMemo, useState } from "react";

import api from "../services/api";
import "./TreeProfileModal.css";

function formatYear(year) {
    if (!Number.isInteger(year)) return "Não registrado";
    return year < 0 ? `${Math.abs(year)} a.C.` : `${year || 1} d.C.`;
}

function splitLines(value) {
    return value?.split("\n").map((item) => item.trim()).filter(Boolean) || [];
}

function TreeProfileModal({ initialPerson, entities, onClose }) {
    const [activeId, setActiveId] = useState(initialPerson.id);
    const [relationships, setRelationships] = useState([]);
    const person = entities.find((entity) => entity.id === activeId) || initialPerson;

    useEffect(() => {
        api.get("/relationships").then((response) => setRelationships(response.data)).catch(() => setRelationships([]));
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const closeOnEscape = (event) => { if (event.key === "Escape") onClose(); };
        window.addEventListener("keydown", closeOnEscape);
        return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", closeOnEscape); };
    }, [onClose]);

    const related = useMemo(() => relationships.filter((item) => item.source_id === person.id || item.target_id === person.id), [relationships, person.id]);

    return <div className="tree-profile-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
        <article className="tree-profile-modal" role="dialog" aria-modal="true" aria-labelledby="tree-profile-name">
            <button type="button" className="tree-profile-close" onClick={onClose} aria-label="Fechar perfil">×</button>
            <header>
                <div className="tree-profile-image">{person.image_url ? <img src={person.image_url} alt={`Representação de ${person.name}`} /> : <span>{person.name[0]}</span>}</div>
                <div><small>{person.track || person.entity_type}</small><h2 id="tree-profile-name">{person.name}</h2><dl><dt>Nascimento / início</dt><dd>{formatYear(person.start_year)}</dd>{person.end_year != null && <><dt>Morte / fim</dt><dd>{formatYear(person.end_year)}</dd></>}{person.origin_country && <><dt>Origem</dt><dd>{person.origin_country}</dd></>}</dl></div>
            </header>
            <div className="tree-profile-content">
                {person.description && <section><h3>Visão geral</h3><p>{person.description}</p></section>}
                {splitLines(person.notable_works).length > 0 && <section><h3>Obras e contribuições</h3><ul>{splitLines(person.notable_works).map((item) => <li key={item}>{item}</li>)}</ul></section>}
                {splitLines(person.key_ideas).length > 0 && <section><h3>Principais ideias</h3><ul>{splitLines(person.key_ideas).map((item) => <li key={item}>{item}</li>)}</ul></section>}
                {person.legacy && <section><h3>Legado e influência</h3><p>{person.legacy}</p></section>}
                {related.length > 0 && <section><h3>Relações históricas</h3><div className="tree-profile-relations">{related.map((item) => { const isSource = item.source_id === person.id; const relatedId = isSource ? item.target_id : item.source_id; const relatedName = isSource ? item.target : item.source; return <button type="button" key={item.id} onClick={() => setActiveId(relatedId)}><span>{isSource ? item.relation : `relação inversa: ${item.relation}`}</span><strong>{relatedName}</strong>{item.notes && <small>{item.notes}</small>}</button>; })}</div></section>}
                <section className="tree-profile-sources"><h3>Fontes e revisão</h3>{splitLines(person.sources).length > 0 ? <ol>{splitLines(person.sources).map((source) => <li key={source}>{source}</li>)}</ol> : <p>Referências específicas ainda não cadastradas.</p>}<small>{person.reviewed_at ? `Última revisão: ${person.reviewed_at}` : "Registro em revisão editorial"}</small></section>
            </div>
        </article>
    </div>;
}

export default TreeProfileModal;
