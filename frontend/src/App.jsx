import {
    useEffect,
    useState
} from "react";


import api from "./services/api";

import Timeline from "./components/Timeline";
import Filters from "./components/Filters";

import "./App.css";


function App() {

    const [timeline, setTimeline] = useState([]);
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [selectedTracks, setSelectedTracks] = useState(null);


    // Carregar eventos da timeline
    useEffect(() => {
        fetchTracks();
    }, []);


    // Recarregar timeline quando filtros mudam
    useEffect(() => {
        if (selectedTracks !== null) fetchTimeline();
    }, [selectedTracks]);


    const fetchTimeline = async () => {
        if (selectedTracks.length === 0) {
            setTimeline([]);
            setError(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            
            selectedTracks.forEach((track) => params.append("track", track));

            const response = await api.get("/timeline", { params });
            setTimeline(response.data);

        } catch (err) {
            console.error("Erro ao carregar timeline:", err);
            setError("Falha ao carregar eventos. Verifique se o servidor está rodando.");
            setTimeline([]);
        } finally {
            setLoading(false);
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
                            <Timeline
                                entities={timeline}
                            />
                        </>
                    )}
                </div>
            </div>

        </div>
    );
}


export default App;
