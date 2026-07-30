import { useEffect, useMemo, useRef } from "react";
import PHILOSOPHER_DETAILS from "../data/philosopherDetails";

import "./VerticalTimeline.css";


function formatYear(year) {
    return year < 0 ? `${Math.abs(year)} a.C.` : String(year);
}


function VerticalTimeline({ entities }) {
    const timelineRef = useRef(null);
    const events = useMemo(() => (
        (entities || [])
            .filter((entity) => Number.isInteger(entity.start_year))
            .sort((first, second) => (
                first.start_year - second.start_year || first.name.localeCompare(second.name)
            ))
    ), [entities]);

    useEffect(() => {
        const items = timelineRef.current?.querySelectorAll(".vertical-timeline-item");
        if (!items?.length) return undefined;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: "0px 0px -10%", threshold: 0.12 });

        items.forEach((item) => observer.observe(item));
        return () => observer.disconnect();
    }, [events]);

    if (events.length === 0) {
        return <div className="vertical-timeline-empty">Nenhum evento para exibir</div>;
    }

    return (
        <section className="vertical-timeline-view" aria-label="Linha do tempo vertical">
            <header className="vertical-timeline-intro">
                <h2>Linha do tempo vertical</h2>
                <p>{events.length} eventos em ordem cronológica</p>
            </header>

            <div ref={timelineRef} className="vertical-timeline-list">
                {events.map((event) => (
                    <article key={event.id} className="vertical-timeline-item">
                        <div className="vertical-timeline-marker" aria-hidden="true" />
                        {PHILOSOPHER_DETAILS[event.name] && (
                            <aside className="vertical-timeline-facts" aria-label={`Informações sobre ${event.name}`}>
                                <ul>
                                    {PHILOSOPHER_DETAILS[event.name].map((fact) => <li key={fact}>{fact}</li>)}
                                </ul>
                            </aside>
                        )}
                        <div className="vertical-timeline-card">
                            {event.image_url ? (
                                <img
                                    src={event.image_url}
                                    alt={`Representação de ${event.name}`}
                                    loading="lazy"
                                />
                            ) : (
                                <div className="vertical-timeline-placeholder" aria-hidden="true">
                                    {event.name.charAt(0)}
                                </div>
                            )}
                            <div className="vertical-timeline-details">
                                <time>
                                    {formatYear(event.start_year)}
                                    {event.origin_country && ` · ${event.origin_country}`}
                                </time>
                                <h3>{event.name}</h3>
                                <span>{event.track || "Sem categoria"}</span>
                                {event.description && <p>{event.description}</p>}
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}


export default VerticalTimeline;
