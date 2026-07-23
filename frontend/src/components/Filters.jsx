import { useState } from "react";
import "../styles/Filters.css";


function Filters({
    tracks,
    selectedTrack,
    setSelectedTrack,
    selectedType,
    setSelectedType,
    startYear,
    setStartYear,
    endYear,
    setEndYear,
    onClearFilters
}) {

    const [isExpanded, setIsExpanded] = useState(false);

    // Tipos de entidades comuns (pode ser expandido com dados do backend)
    const entityTypes = [
        "Política",
        "Tecnologia",
        "Cultura",
        "Guerra",
        "Ciência",
        "Economia",
        "Arte"
    ];

    return (
        <div className="filters-container">
            <div className="filters-header">
                <h2>🔍 Filtros</h2>
                <button 
                    className="toggle-btn"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {isExpanded ? "▼ Ocultar" : "▶ Expandir"}
                </button>
            </div>

            {isExpanded && (
                <div className="filters-content">
                    
                    {/* Filtro por Track */}
                    <div className="filter-group">
                        <label htmlFor="track-select">
                            <strong>Track/Categoria:</strong>
                        </label>
                        <select
                            id="track-select"
                            value={selectedTrack || ""}
                            onChange={(e) => setSelectedTrack(e.target.value || null)}
                        >
                            <option value="">-- Todas as categorias --</option>
                            {tracks.map(track => (
                                <option key={track} value={track}>
                                    {track}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Filtro por Tipo */}
                    <div className="filter-group">
                        <label htmlFor="type-select">
                            <strong>Tipo de Evento:</strong>
                        </label>
                        <select
                            id="type-select"
                            value={selectedType || ""}
                            onChange={(e) => setSelectedType(e.target.value || null)}
                        >
                            <option value="">-- Todos os tipos --</option>
                            {entityTypes.map(type => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Filtro por Período */}
                    <div className="filter-group filter-row">
                        <div>
                            <label htmlFor="start-year">
                                <strong>Ano Inicial:</strong>
                            </label>
                            <input
                                id="start-year"
                                type="number"
                                placeholder="Ex: 1500"
                                value={startYear || ""}
                                onChange={(e) => setStartYear(e.target.value ? parseInt(e.target.value) : null)}
                            />
                        </div>

                        <div>
                            <label htmlFor="end-year">
                                <strong>Ano Final:</strong>
                            </label>
                            <input
                                id="end-year"
                                type="number"
                                placeholder="Ex: 2000"
                                value={endYear || ""}
                                onChange={(e) => setEndYear(e.target.value ? parseInt(e.target.value) : null)}
                            />
                        </div>
                    </div>

                    {/* Botão Limpar Filtros */}
                    <div className="filter-actions">
                        <button 
                            className="clear-btn"
                            onClick={onClearFilters}
                        >
                            🔄 Limpar Filtros
                        </button>
                    </div>

                </div>
            )}
        </div>
    );
}


export default Filters;