import { useMemo } from "react";
import { CircleMarker, MapContainer, TileLayer, Tooltip } from "react-leaflet";

import "leaflet/dist/leaflet.css";
import "./MapView.css";


const TRACK_COLORS = {
    "Filósofos": "#c54832",
    "Cientistas": "#2878a5",
    "Escritores": "#8b4f91",
    "Artistas": "#d17a18",
    "Músicos": "#b13f6b",
    "Teólogos": "#6f8731",
    "Obras Pinturas | Esculturas": "#9b6235",
    "Tecnologias": "#148477",
    "Livros": "#5969af",
    "Líderes": "#a13e49"
};


function groupByLocation(entities) {
    const locations = new Map();

    entities.forEach((entity) => {
        const latitude = Number(entity.latitude);
        const longitude = Number(entity.longitude);
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;

        const key = `${latitude.toFixed(3)},${longitude.toFixed(3)}`;
        if (!locations.has(key)) {
            locations.set(key, {
                latitude,
                longitude,
                country: entity.origin_country || "Local não identificado",
                entities: []
            });
        }
        locations.get(key).entities.push(entity);
    });

    return [...locations.values()];
}


function MapView({ entities }) {
    const locations = useMemo(() => groupByLocation(entities || []), [entities]);
    const missingLocations = (entities || []).length - locations.reduce(
        (total, location) => total + location.entities.length,
        0
    );

    if (locations.length === 0) {
        return <div className="map-empty">Nenhum item selecionado possui local de origem identificado.</div>;
    }

    return (
        <section className="historical-map-section">
            <div className="map-summary">
                <strong>{locations.length} local(is) no mapa</strong>
                {missingLocations > 0 && <span>{missingLocations} item(ns) ainda sem localização</span>}
            </div>
            <MapContainer center={[25, 10]} zoom={2} minZoom={2} worldCopyJump className="historical-map">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {locations.map((location) => {
                    const tracks = [...new Set(location.entities.map((entity) => entity.track))];
                    const markerColor = TRACK_COLORS[tracks[0]] || "#4d657a";

                    return (
                        <CircleMarker
                            key={`${location.latitude}-${location.longitude}`}
                            center={[location.latitude, location.longitude]}
                            radius={Math.min(18, 6 + Math.sqrt(location.entities.length) * 2)}
                            pathOptions={{ color: markerColor, fillColor: markerColor, fillOpacity: 0.78 }}
                        >
                            <Tooltip direction="top" offset={[0, -7]} opacity={1}>
                                <div className="map-popup">
                                    {location.entities.map((entity) => (
                                        <div key={entity.id} className="map-popup-entity">
                                            <strong>{entity.name}</strong>
                                            <small>{location.country}</small>
                                            <span style={{ color: TRACK_COLORS[entity.track] || "#4d657a" }}>
                                                {entity.track}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </Tooltip>
                        </CircleMarker>
                    );
                })}
            </MapContainer>
        </section>
    );
}


export default MapView;
