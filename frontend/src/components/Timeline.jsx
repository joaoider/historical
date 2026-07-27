import { useEffect, useMemo, useRef } from "react";

import "./Timeline.css";


const CARD_WIDTH = 142;
const CARD_HEIGHT = 66;
const CARD_GAP = 16;
const LANE_HEIGHT = 88;
const YEAR_WIDTH = 3;
const SIDE_PADDING = 130;
const AXIS_GAP = 32;

const TRACK_COLORS = [
    "#c54832", "#3976a8", "#788f2d", "#b56a16", "#8b4f91",
    "#198477", "#a74468", "#5f6fb0", "#9a7135", "#3f8352"
];


function formatYear(year) {
    if (year < 0) return `${Math.abs(year)} a.C.`;
    return `${year}`;
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


function buildLayout(entities) {
    const events = entities
        .filter((entity) => Number.isInteger(entity.start_year))
        .sort((first, second) => first.start_year - second.start_year || first.name.localeCompare(second.name));

    if (events.length === 0) return null;

    const dataMin = events[0].start_year;
    const dataMax = events[events.length - 1].start_year;
    const minYear = Math.floor(dataMin / 50) * 50;
    const maxYear = Math.max(minYear + 50, Math.ceil(dataMax / 50) * 50);
    const width = SIDE_PADDING * 2 + (maxYear - minYear) * YEAR_WIDTH;
    const aboveLanes = [];
    const belowLanes = [];
    const tracks = [...new Set(events.map((event) => event.track || "Sem categoria"))];
    const colors = new Map(tracks.map((track, index) => [track, TRACK_COLORS[index % TRACK_COLORS.length]]));
    const positionedEvents = events.map((event, index) => {
        const x = SIDE_PADDING + (event.start_year - minYear) * YEAR_WIDTH;
        const left = x - CARD_WIDTH / 2;
        const right = x + CARD_WIDTH / 2;
        const side = index % 2 === 0 ? "above" : "below";
        const lanes = side === "above" ? aboveLanes : belowLanes;
        const lane = assignLane(lanes, left, right);

        return {
            ...event,
            x,
            side,
            lane,
            color: colors.get(event.track || "Sem categoria")
        };
    });

    const aboveHeight = Math.max(1, aboveLanes.length) * LANE_HEIGHT;
    const belowHeight = Math.max(1, belowLanes.length) * LANE_HEIGHT;
    const axisY = aboveHeight + AXIS_GAP;
    const height = axisY + AXIS_GAP + belowHeight;
    const markers = [];
    for (let year = minYear; year <= maxYear; year += 50) {
        markers.push({ year, x: SIDE_PADDING + (year - minYear) * YEAR_WIDTH });
    }

    return { positionedEvents, markers, width, height, axisY };
}


function Timeline({ entities }) {
    const scrollerRef = useRef(null);
    const layout = useMemo(() => buildLayout(entities || []), [entities]);

    useEffect(() => {
        const scroller = scrollerRef.current;
        if (!scroller || !layout) return;

        const frame = window.requestAnimationFrame(() => {
            scroller.scrollTop = Math.max(0, layout.axisY - scroller.clientHeight / 2);
        });

        return () => window.cancelAnimationFrame(frame);
    }, [layout]);

    const scrollHorizontally = (event) => {
        if (!scrollerRef.current || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
        scrollerRef.current.scrollLeft += event.deltaY;
    };

    if (!layout) {
        return <div className="timeline-empty">Nenhum evento para exibir</div>;
    }

    return (
        <section className="infographic-timeline">
            <div className="timeline-scroll-hint">
                <span>←</span> Arraste a barra inferior ou use a roda do mouse para percorrer <span>→</span>
            </div>
            <div
                ref={scrollerRef}
                className="timeline-horizontal-scroll"
                onWheel={scrollHorizontally}
                tabIndex="0"
                aria-label="Linha do tempo histórica com rolagem horizontal"
            >
                <div
                    className="timeline-canvas"
                    style={{ width: layout.width, height: layout.height }}
                >
                    <div className="timeline-main-axis" style={{ top: layout.axisY }} />

                    {layout.markers.map(({ year, x }) => (
                        <div
                            key={year}
                            className="timeline-year-marker"
                            style={{ left: x, top: layout.axisY }}
                        >
                            <i aria-hidden="true" />
                            <span>{formatYear(year)}</span>
                        </div>
                    ))}

                    {layout.positionedEvents.map((event) => {
                        const isAbove = event.side === "above";
                        const cardTop = isAbove
                            ? layout.axisY - AXIS_GAP - CARD_HEIGHT - event.lane * LANE_HEIGHT
                            : layout.axisY + AXIS_GAP + event.lane * LANE_HEIGHT;

                        return (
                            <article
                                key={event.id}
                                className={`timeline-event-card ${event.side}`}
                                style={{
                                    left: event.x - CARD_WIDTH / 2,
                                    top: cardTop,
                                    width: CARD_WIDTH,
                                    height: CARD_HEIGHT,
                                    "--event-color": event.color
                                }}
                                title={event.description || event.name}
                            >
                                <strong>{event.name}</strong>
                                <span>{event.track || "Sem categoria"}</span>
                                <time>{formatYear(event.start_year)}</time>
                            </article>
                        );
                    })}

                    {layout.positionedEvents.map((event) => {
                        const isAbove = event.side === "above";
                        const cardTop = isAbove
                            ? layout.axisY - AXIS_GAP - CARD_HEIGHT - event.lane * LANE_HEIGHT
                            : layout.axisY + AXIS_GAP + event.lane * LANE_HEIGHT;
                        const top = isAbove ? cardTop + CARD_HEIGHT : layout.axisY;
                        const height = isAbove
                            ? layout.axisY - top
                            : cardTop - layout.axisY;

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
            </div>
        </section>
    );
}


export default Timeline;
