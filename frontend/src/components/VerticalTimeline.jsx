import { useMemo, useState } from "react";

import "./VerticalTimeline.css";


const TRACK_COLORS = {
    "Filósofos": "#c54832", "Cientistas": "#2878a5", "Escritores": "#8b4f91",
    "Artistas": "#d17a18", "Músicos": "#b13f6b", "Teólogos": "#6f8731",
    "Obras": "#9b6235", "Tecnologias": "#148477", "Livros": "#5969af", "Líderes": "#a13e49",
};
const PERIODS = [
    { key: "prehistory", name: "Pré-História", end: -3001 },
    { key: "antiquity", name: "Antiguidade", end: 475 },
    { key: "medieval", name: "Idade Média", end: 1452 },
    { key: "modern", name: "Idade Moderna", end: 1788 },
    { key: "contemporary", name: "Idade Contemporânea", end: Infinity },
];


function formatYear(year) {
    return year < 0 ? `${Math.abs(year)} a.C.` : `${year || 1} d.C.`;
}


function formatCentury(start) {
    const end = start + 99;
    if (end < 0) return `${Math.abs(start)}–${Math.abs(end)} a.C.`;
    return `${start || 1}–${end} d.C.`;
}


function getPeriod(year) {
    return PERIODS.find((period) => year <= period.end);
}


function splitLines(value) {
    return value?.split("\n").filter(Boolean) || [];
}


function VerticalTimeline({ entities, onOpenProfile }) {
    const [query, setQuery] = useState("");
    const [density, setDensity] = useState("normal");
    const [layout, setLayout] = useState("alternating");
    const [collapsedCenturies, setCollapsedCenturies] = useState(new Set());

    const periods = useMemo(() => {
        const normalized = query.trim().toLocaleLowerCase("pt-BR");
        const groups = new Map();
        (entities || [])
            .filter((entity) => Number.isInteger(entity.start_year))
            .filter((entity) => !normalized
                || entity.name.toLocaleLowerCase("pt-BR").includes(normalized)
                || entity.track?.toLocaleLowerCase("pt-BR").includes(normalized))
            .sort((first, second) => first.start_year - second.start_year || first.name.localeCompare(second.name, "pt-BR"))
            .forEach((entity) => {
                const century = Math.floor(entity.start_year / 100) * 100;
                if (!groups.has(century)) groups.set(century, []);
                groups.get(century).push(entity);
            });

        const result = [];
        [...groups.entries()].forEach(([century, events]) => {
            const definition = getPeriod(century);
            let period = result.at(-1);
            if (!period || period.key !== definition.key) {
                period = { ...definition, centuries: [] };
                result.push(period);
            }
            period.centuries.push({ century, events });
        });
        return result;
    }, [entities, query]);

    const eventCount = periods.reduce((total, period) => (
        total + period.centuries.reduce((subtotal, century) => subtotal + century.events.length, 0)
    ), 0);

    const toggleCentury = (century) => {
        setCollapsedCenturies((current) => {
            const next = new Set(current);
            if (next.has(century)) next.delete(century);
            else next.add(century);
            return next;
        });
    };

    if (!entities?.length) return <div className="vertical-timeline-empty">Nenhum evento para exibir</div>;

    return (
        <section className={`vertical-timeline-view density-${density} layout-${layout}`} aria-label="Linha do tempo vertical">
            <header className="vertical-timeline-intro">
                <h2>Tempo Vertical</h2>
                <p>{eventCount} registros organizados por período e século</p>
            </header>

            <div className="vertical-timeline-toolbar">
                <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar nome ou categoria" aria-label="Buscar nesta linha do tempo" />
                <select value={density} onChange={(event) => setDensity(event.target.value)} aria-label="Densidade dos cartões">
                    <option value="compact">Compacto</option><option value="normal">Normal</option><option value="detailed">Detalhado</option>
                </select>
                <div role="group" aria-label="Organização dos cartões">
                    <button type="button" className={layout === "alternating" ? "active" : ""} onClick={() => setLayout("alternating")}>Alternado</button>
                    <button type="button" className={layout === "single" ? "active" : ""} onClick={() => setLayout("single")}>Uma coluna</button>
                </div>
            </div>

            <nav className="vertical-period-index" aria-label="Navegar por período">
                {periods.map((period) => <a key={period.key} href={`#vertical-${period.key}`}>{period.name}</a>)}
            </nav>

            {periods.length === 0 && <div className="vertical-timeline-empty">Nenhum resultado para a busca.</div>}

            <div className="vertical-periods">
                {periods.map((period) => (
                    <section className="vertical-period" id={`vertical-${period.key}`} key={period.key}>
                        <h2>{period.name}</h2>
                        {period.centuries.map(({ century, events }) => {
                            const collapsed = collapsedCenturies.has(century);
                            return (
                                <section className="vertical-century" key={century}>
                                    <button type="button" className="vertical-century-heading" onClick={() => toggleCentury(century)} aria-expanded={!collapsed}>
                                        <span>{formatCentury(century)}</span><small>{events.length} registro(s)</small><i>{collapsed ? "+" : "−"}</i>
                                    </button>
                                    <div className="vertical-timeline-list" hidden={collapsed}>
                                        {events.map((event) => {
                                            const color = TRACK_COLORS[event.track] || "#6f6a63";
                                            const facts = [...splitLines(event.notable_works), ...splitLines(event.key_ideas)].slice(0, 4);
                                            return (
                                                <article key={event.id} className="vertical-timeline-item" style={{ "--event-color": color }}>
                                                    <div className="vertical-timeline-marker" aria-hidden="true" />
                                                    <button type="button" className="vertical-timeline-card" onClick={() => onOpenProfile?.(event.id)}>
                                                        {event.image_url ? <img src={event.image_url} alt="" loading="lazy" /> : <span className="vertical-timeline-placeholder">{event.name.charAt(0)}</span>}
                                                        <span className="vertical-timeline-details">
                                                            <time>{formatYear(event.start_year)}{event.origin_country && ` · ${event.origin_country}`}</time>
                                                            <strong>{event.name}</strong>
                                                            <small>{event.track || "Sem categoria"}</small>
                                                            {event.description && <p>{event.description}</p>}
                                                            {facts.length > 0 && <ul>{facts.map((fact) => <li key={fact}>{fact}</li>)}</ul>}
                                                            <em>Ver perfil completo →</em>
                                                        </span>
                                                    </button>
                                                </article>
                                            );
                                        })}
                                    </div>
                                </section>
                            );
                        })}
                    </section>
                ))}
            </div>
        </section>
    );
}


export default VerticalTimeline;
