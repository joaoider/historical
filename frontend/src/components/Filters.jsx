import { useState } from "react";

import "../styles/Filters.css";


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
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedTracks.includes(track)}
                                    onChange={() => toggleTrack(track)}
                                />
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
