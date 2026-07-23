import { useEffect, useRef } from "react";

import { Timeline } from "vis-timeline/standalone";

import { DataSet } from "vis-data";

import "vis-timeline/styles/vis-timeline-graph2d.min.css";


function TimelineComponent({ entities }) {


    const containerRef = useRef(null);
    const timelineRef = useRef(null);



    useEffect(() => {
        if (!entities || entities.length === 0) {
            console.warn("Nenhuma entidade fornecida para a timeline");
            return;
        }

        console.log("Entidades recebidas:", entities);

        function formatYear(year) {
            if (!year) return "Data indefinida";
            if (year < 0) {
                return `${Math.abs(year)} BC`;
            }
            return `${year} AD`;
        }

        // Criar conjunto de grupos (tracks) únicos
        const tracksSet = new Set();
        entities.forEach(entity => {
            if (entity.track) {
                tracksSet.add(entity.track);
            }
        });

        const tracks = Array.from(tracksSet);
        console.log("Tracks encontradas:", tracks);

        // Criar grupos para vis-timeline
        const groups = new DataSet(
            tracks.map((track, index) => ({
                id: index,
                content: track || "Sem categoria",
                title: track || "Sem categoria"
            }))
        );

        // Mapear track para group id
        const trackToGroupId = {};
        tracks.forEach((track, index) => {
            trackToGroupId[track || "undefined"] = index;
        });

        // Calcular intervalo de dados para zoom automático
        let minYear = Infinity;
        let maxYear = -Infinity;
        
        entities.forEach(entity => {
            if (entity.start_year) {
                minYear = Math.min(minYear, entity.start_year);
                maxYear = Math.max(maxYear, entity.end_year || entity.start_year);
            }
        });

        // Criar itens da timeline
        const items = new DataSet(
            entities.map((entity, index) => {
                const groupId = trackToGroupId[entity.track || "undefined"];
                
                return {
                    id: entity.id || index,
                    group: groupId,
                    content: entity.name, // Apenas o nome
                    start: entity.start_year ? new Date(entity.start_year, 0, 1) : new Date(),
                    end: entity.end_year && entity.end_year !== entity.start_year 
                        ? new Date(entity.end_year, 11, 31) 
                        : null,
                    title: `<div style="font-weight: bold; margin-bottom: 8px;">${entity.name}</div><div>${entity.description || "Sem descrição"}</div><div style="margin-top: 8px; font-size: 0.9em; color: #666;">${formatYear(entity.start_year)} - ${formatYear(entity.end_year || entity.start_year)}</div>`,
                    type: entity.end_year && entity.end_year !== entity.start_year ? "range" : "point"
                };
            })
        );

        const options = {
            orientation: {
                axis: "top",
                item: "top"
            },
            zoomable: true,
            moveable: true,
            minHeight: "500px",
            height: "500px",
            stack: true,
            margin: {
                item: {
                    horizontal: 10,
                    vertical: 10
                }
            },
            timeaxis: {
                scale: "year",
                step: 100
            }
        };

        const timeline = new Timeline(
            containerRef.current,
            items,
            groups,
            options
        );

        timelineRef.current = timeline;

        // Fazer zoom automático para mostrar todos os dados
        if (minYear !== Infinity && maxYear !== -Infinity) {
            // Adicionar margem de 10% para visualização melhor
            const margin = Math.max(100, (maxYear - minYear) * 0.1);
            const startDate = new Date(minYear - Math.ceil(margin), 0, 1);
            const endDate = new Date(maxYear + Math.ceil(margin), 11, 31);
            
            // Usar setTimeout para permitir que a timeline seja renderizada primeiro
            setTimeout(() => {
                timeline.setWindow(startDate, endDate);
            }, 100);
        }

        // Tooltip personalizado
        timeline.on("click", (event) => {
            if (event.item) {
                console.log("Item clicado:", event.item);
            }
        });

        return () => {
            timeline.destroy();
        };

    }, [entities]);



    return (
        <div>
            <div
                ref={containerRef}
                style={{
                    width: "100%",
                    height: "500px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    overflow: "hidden"
                }}
            />
            {(!entities || entities.length === 0) && (
                <div style={{ padding: "20px", textAlign: "center", color: "#999" }}>
                    Nenhum evento para exibir
                </div>
            )}
        </div>
    );
}


export default TimelineComponent;