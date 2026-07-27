import { useEffect, useRef } from "react";

import { DataSet } from "vis-data";
import { Timeline } from "vis-timeline/standalone";

import "vis-timeline/styles/vis-timeline-graph2d.min.css";
import "./Timeline.css";


function yearToDate(year) {
    // setFullYear evita que os anos de 0 a 99 sejam convertidos para 1900 a 1999.
    const date = new Date(0);
    date.setHours(0, 0, 0, 0);
    date.setFullYear(year, 0, 1);
    return date;
}


function formatYear(year) {
    if (year === null || year === undefined) return "Data indefinida";
    if (year < 0) return `${Math.abs(year)} a.C.`;
    return `${year} d.C.`;
}


function escapeHtml(value = "") {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function TimelineComponent({ entities }) {
    const containerRef = useRef(null);

    useEffect(() => {
        const datedEntities = (entities || []).filter(
            (entity) => Number.isInteger(entity.start_year)
        );

        if (!containerRef.current || datedEntities.length === 0) return undefined;

        // A primeira coluna funciona como a coluna congelada de tópicos da planilha.
        const tracks = [];
        const trackIds = new Map();

        datedEntities.forEach((entity) => {
            const track = entity.track || "Sem tópico";
            if (!trackIds.has(track)) {
                trackIds.set(track, tracks.length);
                tracks.push(track);
            }
        });

        const groups = new DataSet(
            tracks.map((track, index) => ({
                id: index,
                content: escapeHtml(track),
                title: escapeHtml(track),
                order: index
            }))
        );

        const items = new DataSet(
            datedEntities.map((entity, index) => ({
                id: entity.id ?? `timeline-${index}`,
                group: trackIds.get(entity.track || "Sem tópico"),
                content: escapeHtml(entity.name),
                start: yearToDate(entity.start_year),
                type: "point",
                className: "vis-point-event",
                title: [
                    `<strong>${escapeHtml(entity.name)}</strong>`,
                    `<span>${formatYear(entity.start_year)}</span>`,
                    entity.description
                        ? `<span>${escapeHtml(entity.description)}</span>`
                        : ""
                ].filter(Boolean).join("<br>")
            }))
        );

        const years = datedEntities.map((entity) => entity.start_year);
        const minYear = Math.min(...years);
        const maxYear = Math.max(...years);
        const span = Math.max(1, maxYear - minYear);
        const windowMargin = Math.max(25, Math.ceil(span * 0.05));

        const timeline = new Timeline(containerRef.current, items, groups, {
            orientation: { axis: "top", item: "top" },
            groupOrder: "order",
            stack: true,
            zoomable: true,
            moveable: true,
            horizontalScroll: true,
            verticalScroll: true,
            zoomKey: "ctrlKey",
            height: "68vh",
            minHeight: "420px",
            margin: {
                axis: 18,
                item: { horizontal: 12, vertical: 16 }
            },
            showCurrentTime: false,
            tooltip: { followMouse: true, overflowMethod: "cap" }
        });

        timeline.setWindow(
            yearToDate(minYear - windowMargin),
            yearToDate(maxYear + windowMargin),
            { animation: false }
        );

        return () => timeline.destroy();
    }, [entities]);

    const hasDatedEntities = (entities || []).some(
        (entity) => Number.isInteger(entity.start_year)
    );

    return (
        <div className="timeline-shell">
            <div ref={containerRef} className="timeline-container" />
            {!hasDatedEntities && (
                <div className="timeline-empty">
                    Nenhum evento com data de início para exibir
                </div>
            )}
        </div>
    );
}


export default TimelineComponent;
