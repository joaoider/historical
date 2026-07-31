import { useMemo, useRef, useState } from "react";

import "./Timeline.css";


const CARD_HEIGHT = 50;
const CARD_GAP = 16;
const LANE_HEIGHT = 88;
const MIN_CARD_WIDTH = 82;
const MAX_CARD_WIDTH = 280;
const YEAR_WIDTH = 3;
const MARKER_INTERVAL = 100;
const SIDE_PADDING = 130;
const AXIS_GAP = 32;
const MIN_TRACK_HEIGHT = 520;
const MIN_ZOOM = 0.08;
const MAX_ZOOM = 1.5;
const RULER_HEIGHT = 58;
const HISTORICAL_PERIODS = [
    { name: "Pré-História", start: -10000, end: -3001, color: "#b89b72" },
    { name: "Antiguidade", start: -3000, end: 475, color: "#d6b36f" },
    { name: "Idade Média", start: 476, end: 1452, color: "#8da47e" },
    { name: "Idade Moderna", start: 1453, end: 1788, color: "#7f9fb5" },
    { name: "Contemporânea", start: 1789, end: 3000, color: "#b58ba1" },
];

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
    "Sem categoria": "#6f6a63"
};

const FALLBACK_COLORS = ["#3976a8", "#788f2d", "#b56a16", "#8b4f91", "#198477", "#a74468"];


function getTrackColor(track) {
    if (TRACK_COLORS[track]) return TRACK_COLORS[track];

    const hash = [...track].reduce((total, character) => total + character.codePointAt(0), 0);
    return FALLBACK_COLORS[hash % FALLBACK_COLORS.length];
}


function formatYear(year) {
    if (year < 0) return `${Math.abs(year)} a.C.`;
    return `${year}`;
}


function getCardWidth(name, hasImage = false, secondaryText = "") {
    const estimatedTextWidth = [...name].reduce((width, character) => (
        width + (/[A-ZÁÉÍÓÚÂÊÔÃÕMW]/.test(character) ? 7.2 : 5.7)
    ), 0);

    const estimatedSecondaryWidth = [...secondaryText].length * 5.7;
    const imageSpace = hasImage ? 38 : 0;
    return Math.min(MAX_CARD_WIDTH, Math.max(
        MIN_CARD_WIDTH,
        Math.ceil(Math.max(estimatedTextWidth + imageSpace, estimatedSecondaryWidth) + 24)
    ));
}


function assignLane(lanes, left, right) {
    const availableLane = lanes.findIndex((lastRight) => left > lastRight + CARD_GAP);
    if (availableLane >= 0) {
        lanes[availableLane] = right;
        return availableLane;
    }
    lanes.push(right);
    return lanes.length - 1;
}


function positionTrackEvents(events, minYear) {
    const aboveLanes = [];
    const belowLanes = [];
    const positionedEvents = events.map((event, index) => {
        const x = SIDE_PADDING + (event.start_year - minYear) * YEAR_WIDTH;
        const birthLabel = `${formatYear(event.start_year)}${event.origin_country ? ` · ${event.origin_country}` : ""}`;
        const cardWidth = getCardWidth(event.name, Boolean(event.image_url), birthLabel);
        const left = x - cardWidth / 2;
        const right = x + cardWidth / 2;
        const side = index % 2 === 0 ? "above" : "below";
        const lanes = side === "above" ? aboveLanes : belowLanes;
        const lane = assignLane(lanes, left, right);

        return {
            ...event,
            x,
            cardWidth,
            side,
            lane,
            color: getTrackColor(event.track || "Sem categoria")
        };
    });

    const aboveHeight = Math.max(1, aboveLanes.length) * LANE_HEIGHT;
    const belowHeight = Math.max(1, belowLanes.length) * LANE_HEIGHT;
    const axisY = aboveHeight + AXIS_GAP;

    return {
        positionedEvents,
        axisY,
        height: axisY + AXIS_GAP + belowHeight
    };
}


function buildLayout(entities) {
    const events = entities
        .filter((entity) => Number.isInteger(entity.start_year))
        .sort((first, second) => first.start_year - second.start_year || first.name.localeCompare(second.name));

    if (events.length === 0) return null;

    const dataMin = events[0].start_year;
    const dataMax = events[events.length - 1].start_year;
    const minYear = Math.floor(dataMin / MARKER_INTERVAL) * MARKER_INTERVAL;
    const maxYear = Math.max(
        minYear + MARKER_INTERVAL,
        Math.ceil(dataMax / MARKER_INTERVAL) * MARKER_INTERVAL
    );
    const width = SIDE_PADDING * 2 + (maxYear - minYear) * YEAR_WIDTH;
    const markers = [];
    for (let year = minYear; year <= maxYear; year += MARKER_INTERVAL) {
        markers.push({ year, x: SIDE_PADDING + (year - minYear) * YEAR_WIDTH });
    }

    const groupedEvents = new Map();
    events.forEach((event) => {
        const track = event.track || "Sem categoria";
        if (!groupedEvents.has(track)) groupedEvents.set(track, []);
        groupedEvents.get(track).push(event);
    });

    const tracks = [...groupedEvents].map(([name, trackEvents]) => ({
        name,
        color: getTrackColor(name),
        ...positionTrackEvents(trackEvents, minYear)
    })).map((track) => ({ ...track, height: Math.max(MIN_TRACK_HEIGHT, track.height) }));

    return {
        tracks,
        markers,
        minYear,
        maxYear,
        width,
        height: RULER_HEIGHT + tracks.reduce((total, track) => total + track.height, 0)
    };
}


function Timeline({ entities, onOpenProfile }) {
    const scrollerRef = useRef(null);
    const [zoom, setZoom] = useState(1);
    const [density, setDensity] = useState("normal");
    const [scrollProgress, setScrollProgress] = useState(0);
    const layout = useMemo(() => buildLayout(entities || []), [entities]);

    const adaptiveMarkers = useMemo(() => {
        if (!layout) return [];
        const interval = zoom < 0.15 ? 1000 : zoom < 0.35 ? 500 : zoom < 0.75 ? 200 : 100;
        const markers = [];
        const first = Math.floor(layout.minYear / interval) * interval;
        for (let year = first; year <= layout.maxYear; year += interval) {
            markers.push({ year, x: SIDE_PADDING + (year - layout.minYear) * YEAR_WIDTH });
        }
        return markers;
    }, [layout, zoom]);

    const changeZoom = (nextZoom, preserveCenter = true) => {
        const boundedZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextZoom));
        const scroller = scrollerRef.current;
        const centerRatio = scroller && layout
            ? (scroller.scrollLeft + scroller.clientWidth / 2) / (layout.width * zoom)
            : 0;
        setZoom(boundedZoom);
        if (!preserveCenter) return;
        requestAnimationFrame(() => {
            if (scroller && layout) {
                scroller.scrollLeft = centerRatio * layout.width * boundedZoom - scroller.clientWidth / 2;
            }
        });
    };

    const fitEntireTimeline = () => {
        const availableWidth = scrollerRef.current?.clientWidth || layout.width;
        changeZoom(availableWidth / layout.width, false);
        if (scrollerRef.current) scrollerRef.current.scrollLeft = 0;
    };

    if (!layout) {
        return <div className="timeline-empty">Nenhum evento para exibir</div>;
    }

    return (
        <section className="infographic-timeline">
            <div className="timeline-toolbar">
                <div className="timeline-scroll-hint">
                    <span>←</span> Arraste a barra inferior para comparar as categorias na mesma escala <span>→</span>
                </div>
                <div className="timeline-zoom-controls" aria-label="Controles de zoom">
                    <select value={density} onChange={(event) => setDensity(event.target.value)} aria-label="Densidade dos cartões">
                        <option value="compact">Compacto</option>
                        <option value="normal">Normal</option>
                        <option value="detailed">Detalhado</option>
                    </select>
                    <button type="button" onClick={() => changeZoom(zoom - 0.1)} disabled={zoom <= MIN_ZOOM}>
                        −
                    </button>
                    <span>{Math.round(zoom * 100)}%</span>
                    <button type="button" onClick={() => changeZoom(zoom + 0.1)} disabled={zoom >= MAX_ZOOM}>
                        +
                    </button>
                    <button type="button" className="fit-timeline-btn" onClick={fitEntireTimeline}>
                        Ver tudo
                    </button>
                </div>
            </div>
            <div className="timeline-minimap">
                <span>Visão geral</span>
                <input
                    type="range"
                    min="0"
                    max="1000"
                    value={Math.round(scrollProgress * 1000)}
                    onChange={(event) => {
                        const scroller = scrollerRef.current;
                        if (!scroller) return;
                        const maximum = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
                        scroller.scrollLeft = maximum * (Number(event.target.value) / 1000);
                    }}
                    aria-label="Posição na linha do tempo"
                />
            </div>
            <div
                ref={scrollerRef}
                className="timeline-horizontal-scroll"
                tabIndex="0"
                aria-label="Linha do tempo histórica com rolagem horizontal"
                onScroll={(event) => {
                    const maximum = Math.max(1, event.currentTarget.scrollWidth - event.currentTarget.clientWidth);
                    setScrollProgress(event.currentTarget.scrollLeft / maximum);
                }}
            >
                <div
                    className="timeline-comparison"
                    style={{ width: layout.width * zoom, height: layout.height * zoom }}
                >
                    <div
                        className={`timeline-zoom-layer density-${density}`}
                        style={{
                            width: layout.width,
                            height: layout.height,
                            transform: `scale(${zoom})`
                        }}
                    >
                    {HISTORICAL_PERIODS.map((period) => {
                        const start = Math.max(period.start, layout.minYear);
                        const end = Math.min(period.end, layout.maxYear);
                        if (start > end) return null;
                        return (
                            <div
                                key={period.name}
                                className="timeline-era-band"
                                style={{
                                    left: SIDE_PADDING + (start - layout.minYear) * YEAR_WIDTH,
                                    width: Math.max(2, (end - start) * YEAR_WIDTH),
                                    "--era-color": period.color,
                                }}
                            >
                                <span>{period.name}</span>
                            </div>
                        );
                    })}
                    <div className="timeline-global-ruler" style={{ width: layout.width }}>
                        <div className="timeline-main-axis" />
                        {adaptiveMarkers.map(({ year, x }) => (
                            <div key={year} className={`timeline-year-marker ${year === 0 ? "year-zero" : ""}`} style={{ left: x }}>
                                <i aria-hidden="true" />
                                <span>{formatYear(year)}</span>
                            </div>
                        ))}
                    </div>
                    {layout.tracks.map((track) => (
                        <div
                            key={track.name}
                            className="timeline-canvas timeline-track"
                            style={{ width: layout.width, height: track.height, "--track-color": track.color }}
                        >
                            <h3 className="timeline-track-title">{track.name}</h3>
                            <div className="timeline-main-axis" style={{ top: track.axisY }} />

                            {track.positionedEvents.map((event) => {
                        const isAbove = event.side === "above";
                        const cardTop = isAbove
                                    ? track.axisY - AXIS_GAP - CARD_HEIGHT - event.lane * LANE_HEIGHT
                                    : track.axisY + AXIS_GAP + event.lane * LANE_HEIGHT;

                        return (
                            <article
                                key={event.id}
                                className={`timeline-event-card ${event.side} ${event.image_url ? "has-image" : ""}`}
                                style={{
                                    left: event.x - event.cardWidth / 2,
                                    top: cardTop,
                                    width: event.cardWidth,
                                    height: CARD_HEIGHT,
                                    "--event-color": event.color
                                }}
                                title={event.description || event.name}
                                role="button"
                                tabIndex="0"
                                onClick={() => onOpenProfile?.(event.id)}
                                onKeyDown={(keyboardEvent) => {
                                    if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") onOpenProfile?.(event.id);
                                }}
                            >
                                {event.image_url && (
                                    <img src={event.image_url} alt={`Representação de ${event.name}`} />
                                )}
                                <span className="timeline-event-details">
                                    <strong>{event.name}</strong>
                                    <time title={event.origin_country || undefined}>
                                        {formatYear(event.start_year)}
                                        {event.origin_country && ` · ${event.origin_country}`}
                                    </time>
                                    {density === "detailed" && event.description && <small>{event.description}</small>}
                                </span>
                            </article>
                        );
                            })}

                            {track.positionedEvents.map((event) => {
                        const isAbove = event.side === "above";
                        const cardTop = isAbove
                                    ? track.axisY - AXIS_GAP - CARD_HEIGHT - event.lane * LANE_HEIGHT
                                    : track.axisY + AXIS_GAP + event.lane * LANE_HEIGHT;
                                const top = isAbove ? cardTop + CARD_HEIGHT : track.axisY;
                        const height = isAbove
                                    ? track.axisY - top
                                    : cardTop - track.axisY;

                        return (
                            <i
                                key={`connector-${event.id}`}
                                className="timeline-event-connector"
                                aria-hidden="true"
                                style={{
                                    left: event.x,
                                    top,
                                    height,
                                    "--event-color": event.color
                                }}
                            />
                        );
                            })}
                        </div>
                    ))}
                    </div>
                </div>
            </div>
        </section>
    );
}


export default Timeline;
