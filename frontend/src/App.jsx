import {
    useEffect,
    useRef,
    useState
} from "react";


import api from "./services/api";

import Timeline from "./components/Timeline";
import Filters from "./components/Filters";
import MapView from "./components/MapView";

import "./App.css";


function App() {

    const [timeline, setTimeline] = useState([]);
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeView, setActiveView] = useState("timeline");

    const [selectedTracks, setSelectedTracks] = useState(null);
    const latestTimelineRequest = useRef(0);


    // Carregar eventos da timeline
    useEffect(() => {
        fetchTracks();
    }, []);


    // Recarregar timeline quando filtros mudam
    useEffect(() => {
        if (selectedTracks === null) return;

        const requestId = ++latestTimelineRequest.current;
        fetchTimeline(selectedTracks, requestId);
    }, [selectedTracks]);


    const fetchTimeline = async (tracksToFetch, requestId) => {
        if (tracksToFetch.length === 0) {
            setTimeline([]);
            setError(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const responses = await Promise.all(
                tracksToFetch.map((track) => api.get("/timeline", { params: { track } }))
            );
            const combinedTimeline = responses.flatMap((response) => response.data);

            if (requestId === latestTimelineRequest.current) {
                setTimeline(combinedTimeline);
            }

        } catch (err) {
            if (requestId !== latestTimelineRequest.current) return;
            console.error("Erro ao carregar timeline:", err);
            setError("Falha ao carregar eventos. Verifique se o servidor está rodando.");
            setTimeline([]);
        } finally {
            if (requestId === latestTimelineRequest.current) {
                setLoading(false);
            }
        }
    };


    const fetchTracks = async () => {
        try {
            const response = await api.get("/tracks");
            const trackNames = response.data.map((track) => track.name);
            setTracks(trackNames);
            setSelectedTracks(trackNames);
        } catch (err) {
            console.error("Erro ao carregar tracks:", err);
        }
    };


    return (
        <div className="app-container">

            <header className="app-header">
                <h1>📜 Linha do Tempo Histórica</h1>
                <p>Explore eventos históricos organizados por categorias</p>
            </header>

            <div className="app-content">
                <nav className="view-tabs" aria-label="Visualizações">
                    <button
                        type="button"
                        className={activeView === "timeline" ? "active" : ""}
                        onClick={() => setActiveView("timeline")}
                    >
                        Linha do tempo
                    </button>
                    <button
                        type="button"
                        className={activeView === "map" ? "active" : ""}
                        onClick={() => setActiveView("map")}
                    >
                        Mapa de origens
                    </button>
                </nav>

                <Filters
                    tracks={tracks}
                    selectedTracks={selectedTracks || []}
                    setSelectedTracks={setSelectedTracks}
                />

                <div className="timeline-section">
                    {error && (
                        <div className="error-message">
                            ⚠️ {error}
                        </div>
                    )}

                    {loading && (
                        <div className="loading-message">
                            Carregando eventos...
                        </div>
                    )}

                    {!loading && (
                        <>
                            {activeView === "timeline" ? (
                                <Timeline entities={timeline} />
                            ) : (
                                <MapView entities={timeline} />
                            )}
                        </>
                    )}
                </div>
            </div>

        </div>
    );
}


export default App;
