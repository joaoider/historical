import { useMemo, useState } from "react";

import "./PhilosophyTree.css";


const GENERATION_SIZE = 100;
const TRACK_COLORS = {
    "Filósofos": "#c54832",
    "Cientistas": "#2878a5",
    "Escritores": "#8b4f91",
    "Artistas": "#d17a18",
    "Músicos": "#b13f6b",
    "Teólogos": "#6f8731",
    "Obras": "#9b6235",
    "Tecnologias": "#148477",
    "Livros": "#5969af",
    "Líderes": "#a13e49",
};
const FALLBACK_COLORS = ["#3976a8", "#788f2d", "#b56a16", "#8b4f91", "#198477", "#a74468"];
const HISTORICAL_PERIODS = [
    { key: "prehistory", name: "Pré-História", range: "Até 3001 a.C.", end: -3001 },
    { key: "antiquity", name: "Antiguidade Clássica", range: "3000 a.C. – 476 d.C.", end: 475 },
    { key: "medieval", name: "Idade Média", range: "476 – 1453", end: 1452 },
    { key: "modern", name: "Idade Moderna", range: "1453 – 1789", end: 1788 },
    { key: "contemporary", name: "Idade Contemporânea", range: "Desde 1789", end: Infinity },
];
const HISTORICAL_MOVEMENTS = [
    { name: "Classicismo greco-romano", range: "Séc. V a.C. – V d.C.", start: -500, end: 499 },
    { name: "Escolástica", range: "Séc. IX – XV", start: 800, end: 1499 },
    { name: "Renascimento", range: "Séc. XIV – XVI", start: 1300, end: 1599 },
    { name: "Humanismo", range: "Séc. XV – XVI", start: 1400, end: 1599 },
    { name: "Reforma Protestante", range: "Séc. XVI – XVII", start: 1500, end: 1649 },
    { name: "Barroco", range: "Séc. XVII – XVIII", start: 1600, end: 1749 },
    { name: "Iluminismo", range: "Séc. XVII – XIX", start: 1685, end: 1815 },
    { name: "Romantismo", range: "1780 – 1850", start: 1780, end: 1850 },
    { name: "Realismo", range: "1848 – 1900", start: 1848, end: 1900 },
    { name: "Modernismo", range: "1890 – 1945", start: 1890, end: 1945 },
    { name: "Pós-modernismo", range: "1945 – 2000", start: 1945, end: 2000 },
    { name: "Contemporaneidade", range: "Desde 2000", start: 2000, end: Infinity },
];
const HISTORICAL_EVENTS = [
    { name: "Surgimento da escrita", year: -3400, date: "c. 3400 a.C.", type: "science" },
    { name: "Unificação do Egito", year: -3100, date: "c. 3100 a.C.", type: "politics" },
    { name: "Código de Hamurábi", year: -1754, date: "1754 a.C.", type: "society" },
    { name: "Guerras Médicas", year: -499, date: "499–449 a.C.", type: "war" },
    { name: "Guerra do Peloponeso", year: -431, date: "431–404 a.C.", type: "war" },
    { name: "Conquistas de Alexandre", year: -334, date: "334–323 a.C.", type: "war" },
    { name: "Guerras Púnicas", year: -264, date: "264–146 a.C.", type: "war" },
    { name: "Queda do Império Romano do Ocidente", year: 476, date: "476", type: "politics" },
    { name: "Hégira", year: 622, date: "622", type: "culture" },
    { name: "Coroação de Carlos Magno", year: 800, date: "800", type: "politics" },
    { name: "Grande Cisma do Cristianismo", year: 1054, date: "1054", type: "culture" },
    { name: "Cruzadas", year: 1096, date: "1096–1291", type: "war" },
    { name: "Expansão do Império Mongol", year: 1206, date: "1206–1368", type: "war" },
    { name: "Magna Carta", year: 1215, date: "1215", type: "society" },
    { name: "Peste Negra", year: 1347, date: "1347–1351", type: "crisis" },
    { name: "Queda de Constantinopla", year: 1453, date: "1453", type: "politics" },
    { name: "Chegada de Colombo à América", year: 1492, date: "1492", type: "exploration" },
    { name: "Reforma Protestante", year: 1517, date: "1517", type: "culture" },
    { name: "Primeira circum-navegação", year: 1519, date: "1519–1522", type: "exploration" },
    { name: "Guerra dos Trinta Anos", year: 1618, date: "1618–1648", type: "war" },
    { name: "Revolução Industrial", year: 1760, date: "c. 1760", type: "science" },
    { name: "Independência dos Estados Unidos", year: 1776, date: "1776", type: "politics" },
    { name: "Revolução Francesa", year: 1789, date: "1789", type: "politics" },
    { name: "Guerras Napoleônicas", year: 1803, date: "1803–1815", type: "war" },
    { name: "Independência do Brasil", year: 1822, date: "1822", type: "politics" },
    { name: "Abolição da escravidão no Brasil", year: 1888, date: "1888", type: "society" },
    { name: "Primeira Guerra Mundial", year: 1914, date: "1914–1918", type: "war" },
    { name: "Revolução Russa", year: 1917, date: "1917", type: "politics" },
    { name: "Grande Depressão", year: 1929, date: "1929", type: "crisis" },
    { name: "Segunda Guerra Mundial", year: 1939, date: "1939–1945", type: "war" },
    { name: "Criação da ONU", year: 1945, date: "1945", type: "politics" },
    { name: "Guerra Fria", year: 1947, date: "1947–1991", type: "war" },
    { name: "Chegada à Lua", year: 1969, date: "1969", type: "science" },
    { name: "Queda do Muro de Berlim", year: 1989, date: "1989", type: "politics" },
    { name: "Dissolução da União Soviética", year: 1991, date: "1991", type: "politics" },
    { name: "Atentados de 11 de setembro", year: 2001, date: "2001", type: "crisis" },
    { name: "Crise financeira mundial", year: 2008, date: "2008", type: "crisis" },
    { name: "Pandemia de COVID-19", year: 2020, date: "2020", type: "crisis" },
    { name: "Invasão da Ucrânia pela Rússia", year: 2022, date: "Desde 2022", type: "war" },
];
const EVENT_COLORS = {
    war: "#a33d38", politics: "#3972a5", society: "#b38a22", science: "#2e8069",
    culture: "#795493", exploration: "#b36b28", crisis: "#6d625b",
};


function generationStart(year) {
    return Math.floor(year / GENERATION_SIZE) * GENERATION_SIZE;
}


function formatPeriod(start) {
    const end = start + GENERATION_SIZE - 1;

    if (end < 0) return `${Math.abs(start)}–${Math.abs(end)} a.C.`;
    return `${start === 0 ? 1 : start}–${end} d.C.`;
}


function getHistoricalPeriod(year) {
    return HISTORICAL_PERIODS.find((period) => year <= period.end);
}


function PhilosophyTree({ entities }) {
    const [showMovements, setShowMovements] = useState(true);
    const [showDates, setShowDates] = useState(true);
    const [showEvents, setShowEvents] = useState(true);
    const [collapsedPeriods, setCollapsedPeriods] = useState(new Set());
    const [selectedPerson, setSelectedPerson] = useState(null);
    const tree = useMemo(() => {
        const groups = new Map();
        const tracks = [];
        const validEntities = (entities || [])
            .filter((entity) => entity.track && Number.isInteger(entity.start_year));

        validEntities.forEach((entity) => {
                if (!tracks.includes(entity.track)) tracks.push(entity.track);
                const start = generationStart(entity.start_year);
                if (!groups.has(start)) groups.set(start, []);
                groups.get(start).push(entity);
            });

        if (validEntities.length > 0) {
            const years = validEntities.map((entity) => entity.start_year);
            const firstYear = Math.min(...years);
            const lastYear = Math.max(...years);
            HISTORICAL_EVENTS
                .filter((event) => event.year >= firstYear && event.year <= lastYear)
                .forEach((event) => {
                    const start = generationStart(event.year);
                    if (!groups.has(start)) groups.set(start, []);
                });
        }

        const colors = new Map(tracks.map((track, index) => [
            track,
            TRACK_COLORS[track] || FALLBACK_COLORS[index % FALLBACK_COLORS.length],
        ]));

        const generations = [...groups.entries()]
            .sort(([first], [second]) => first - second)
            .map(([start, people]) => ({
                start,
                people: people.sort((first, second) => (
                    first.start_year - second.start_year || first.name.localeCompare(second.name, "pt-BR")
                )),
                events: HISTORICAL_EVENTS.filter((event) => generationStart(event.year) === start),
            }));
        const announcedMovements = new Set();
        generations.forEach((generation) => {
            const generationEnd = generation.start + GENERATION_SIZE - 1;
            generation.movements = HISTORICAL_MOVEMENTS.filter((movement) => {
                const overlaps = generationEnd >= movement.start && generation.start <= movement.end;
                if (!overlaps || announcedMovements.has(movement.name)) return false;
                announcedMovements.add(movement.name);
                return true;
            });
        });
        const periods = [];
        generations.forEach((generation) => {
            const definition = getHistoricalPeriod(generation.start);
            let period = periods.at(-1);
            if (!period || period.key !== definition.key) {
                period = { ...definition, generations: [] };
                periods.push(period);
            }
            period.generations.push(generation);
        });

        return {
            tracks: tracks.map((track) => ({ track, color: colors.get(track) })),
            generations,
            periods,
            colors,
        };
    }, [entities]);

    if (tree.generations.length === 0) {
        return <div className="philosophy-tree-empty">Nenhum personagem para exibir</div>;
    }

    const togglePeriod = (key) => {
        setCollapsedPeriods((current) => {
            const next = new Set(current);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    return (
        <section className="philosophy-tree-view" aria-labelledby="philosophy-tree-title">
            <header className="philosophy-tree-intro">
                <p>UMA LINHAGEM ATRAVÉS DO TEMPO</p>
                <h2 id="philosophy-tree-title">Árvore genealógica da história</h2>
                <span>Personagens organizados em ordem cronológica</span>
                <div className="philosophy-tree-legend" aria-label="Cores das categorias">
                    {tree.tracks.map(({ track, color }) => (
                        <span key={track} style={{ "--track-color": color }}>
                            <i aria-hidden="true" />{track}
                        </span>
                    ))}
                </div>
                <div className="philosophy-tree-controls" aria-label="Faixas exibidas">
                    <button type="button" className={showMovements ? "active" : ""} onClick={() => setShowMovements((value) => !value)}>
                        Movimentos
                    </button>
                    <button type="button" className={showDates ? "active" : ""} onClick={() => setShowDates((value) => !value)}>
                        Datas
                    </button>
                    <button type="button" className={showEvents ? "active" : ""} onClick={() => setShowEvents((value) => !value)}>
                        Eventos
                    </button>
                </div>
            </header>

            {selectedPerson && (
                <aside className="philosophy-person-details" aria-live="polite">
                    {selectedPerson.image_url && <img src={selectedPerson.image_url} alt="" loading="lazy" />}
                    <div>
                        <span>{selectedPerson.track}</span>
                        <h3>{selectedPerson.name}</h3>
                        <time>{selectedPerson.start_year < 0 ? `${Math.abs(selectedPerson.start_year)} a.C.` : `${selectedPerson.start_year} d.C.`}</time>
                        {selectedPerson.origin_country && <small>{selectedPerson.origin_country}</small>}
                        {selectedPerson.description && <p>{selectedPerson.description}</p>}
                    </div>
                    <button type="button" onClick={() => setSelectedPerson(null)} aria-label="Fechar detalhes">×</button>
                </aside>
            )}

            <div className="philosophy-tree chronological-matrix" aria-label="Matriz cronológica em períodos de 100 anos">
                <div className="matrix-columns-header" aria-hidden="true">
                    <span className="matrix-period-column">Período</span>
                    {showMovements && <span className="matrix-movement-column">Movimentos</span>}
                    <span className="matrix-people-column">Personagens</span>
                    {showDates && <span className="matrix-date-column">Século</span>}
                    {showEvents && <span className="matrix-event-column">Eventos históricos</span>}
                </div>
                {tree.periods.map((period) => (
                    <section className={`historical-period ${collapsedPeriods.has(period.key) ? "is-collapsed" : ""}`} key={period.key}>
                        <header className="historical-period-label">
                            <i aria-hidden="true" />
                            <div>
                                <h3>{period.name}</h3>
                                <span>{period.range}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => togglePeriod(period.key)}
                                aria-expanded={!collapsedPeriods.has(period.key)}
                                aria-label={`${collapsedPeriods.has(period.key) ? "Expandir" : "Recolher"} ${period.name}`}
                            >
                                {collapsedPeriods.has(period.key) ? "+" : "−"}
                            </button>
                        </header>
                        <div className="historical-period-generations" hidden={collapsedPeriods.has(period.key)}>
                            {period.generations.map((generation) => (
                                <div className="philosophy-generation-row" key={generation.start}>
                                    {showMovements && <aside className="historical-movement-label" aria-label="Movimentos históricos">
                                        {generation.movements.map((movement) => (
                                            <div key={movement.name}>
                                                <i aria-hidden="true" />
                                                <span>
                                                    <strong>{movement.name}</strong>
                                                    <small>{movement.range}</small>
                                                </span>
                                            </div>
                                        ))}
                                    </aside>}
                                    <ol aria-label={`Período iniciado no ano ${generation.start}`}>
                                        {generation.people.map((person, index) => (
                                            <li
                                                className={`philosopher ${generation.people[index + 1]?.track === person.track ? "connects-next" : ""}`}
                                                key={person.id}
                                                style={{ "--track-color": tree.colors.get(person.track) }}
                                            >
                                                <button
                                                    type="button"
                                                    className="philosopher-button"
                                                    onClick={() => setSelectedPerson(person)}
                                                    title={`${person.name} — ${person.track}`}
                                                >
                                                    <span className="philosopher-portrait">
                                                        {person.image_url ? (
                                                            <img src={person.image_url} alt="" loading="lazy" />
                                                        ) : (
                                                            <span aria-hidden="true">{person.name.charAt(0)}</span>
                                                        )}
                                                    </span>
                                                    <strong>{person.name}</strong>
                                                </button>
                                            </li>
                                        ))}
                                    </ol>
                                    {showDates && <time>{formatPeriod(generation.start)}</time>}
                                    {showEvents && <aside className="historical-events-label" aria-label="Eventos históricos">
                                        {generation.events.map((event) => (
                                            <div key={event.name} style={{ "--event-color": EVENT_COLORS[event.type] }}>
                                                <i aria-hidden="true" />
                                                <span>
                                                    <strong>{event.name}</strong>
                                                    <small>{event.date}</small>
                                                </span>
                                            </div>
                                        ))}
                                    </aside>}
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </section>
    );
}


export default PhilosophyTree;
