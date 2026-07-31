import { useState } from "react";

import "../styles/Filters.css";

const TRACK_COLORS = ["#9b3f46", "#b56b24", "#356f9e", "#39805b", "#725c91", "#8d6535", "#317b86", "#9a5364", "#71813d", "#657b9b"];

function Filters({ tracks, selectedTracks, setSelectedTracks }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleTrack = (track) => {
        setSelectedTracks((current) => (
            current.includes(track)
                ? current.filter((selected) => selected !== track)
                : tracks.filter((candidate) => current.includes(candidate) || candidate === track)
        ));
    };

    const allSelected = tracks.length > 0 && selectedTracks.length === tracks.length;

    return (
        <div className="filters-container">
            <div className="filters-header">
                <div>
                    <h2>🔍 Categorias</h2>
                    <p>
                        {selectedTracks.length === 0
                            ? "Nenhuma categoria selecionada"
                            : `${selectedTracks.length} categoria(s) visível(is)`}
                    </p>
                </div>
                <button
                    type="button"
                    className="toggle-btn"
                    onClick={() => setIsExpanded((expanded) => !expanded)}
                    aria-expanded={isExpanded}
                >
                    {isExpanded ? "▼ Ocultar" : "▶ Escolher categorias"}
                </button>
            </div>

            {selectedTracks.length > 0 && (
                <div className="active-filter-chips" aria-label="Filtros ativos">
                    {selectedTracks.map((track) => {
                        const index = Math.max(0, tracks.indexOf(track));
                        return <button type="button" key={track} style={{ "--track-color": TRACK_COLORS[index % TRACK_COLORS.length] }} onClick={() => toggleTrack(track)}>{track} <span aria-hidden="true">×</span></button>;
                    })}
                </div>
            )}

            {isExpanded && (
                <div className="filters-content">
                    <div className="category-actions">
                        <button
                            type="button"
                            onClick={() => setSelectedTracks([...tracks])}
                            disabled={allSelected}
                        >
                            Selecionar todas
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedTracks([])}
                            disabled={selectedTracks.length === 0}
                        >
                            Limpar seleção
                        </button>
                    </div>

                    <div className="category-grid" role="group" aria-label="Categorias exibidas">
                        {tracks.map((track) => (
                            <label
                                key={track}
                                className={`category-option ${selectedTracks.includes(track) ? "selected" : ""}`}
                                style={{ "--track-color": TRACK_COLORS[tracks.indexOf(track) % TRACK_COLORS.length] }}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedTracks.includes(track)}
                                    onChange={() => toggleTrack(track)}
                                />
                                <i aria-hidden="true" />
                                <span>{track}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}


export default Filters;
