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

    // Filtros
    const [selectedTrack, setSelectedTrack] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const [startYear, setStartYear] = useState(null);
    const [endYear, setEndYear] = useState(null);


    // Carregar eventos da timeline
    useEffect(() => {
        fetchTimeline();
        fetchTracks();
    }, []);


    // Recarregar timeline quando filtros mudam
    useEffect(() => {
        fetchTimeline();
    }, [selectedTrack, selectedType, startYear, endYear]);


    const fetchTimeline = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            
            if (selectedTrack) params.append("track", selectedTrack);
            if (selectedType) params.append("type", selectedType);
            if (startYear) params.append("start", startYear);
            if (endYear) params.append("end", endYear);

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
            setTracks(response.data.map(t => t.name));
        } catch (err) {
            console.error("Erro ao carregar tracks:", err);
        }
    };


    const handleClearFilters = () => {
        setSelectedTrack(null);
        setSelectedType(null);
        setStartYear(null);
        setEndYear(null);
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
                    selectedTrack={selectedTrack}
                    setSelectedTrack={setSelectedTrack}
                    selectedType={selectedType}
                    setSelectedType={setSelectedType}
                    startYear={startYear}
                    setStartYear={setStartYear}
                    endYear={endYear}
                    setEndYear={setEndYear}
                    onClearFilters={handleClearFilters}
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
                            <div className="timeline-info">
                                <span>{timeline.length} evento(s) encontrado(s)</span>
                            </div>
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