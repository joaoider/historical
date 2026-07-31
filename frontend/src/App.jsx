import { lazy, Suspense, useEffect, useRef, useState } from "react";

import api from "./services/api";
import iderLogo from "./assets/ider-logo-white.svg";
import Filters from "./components/Filters";
import GlobalSearch from "./components/GlobalSearch";
import SiteFooter from "./components/SiteFooter";
import { pathForView, routeFromPath } from "./utils/routes";

import "./App.css";

const HomePage = lazy(() => import("./components/HomePage"));
const Timeline = lazy(() => import("./components/Timeline"));
const VerticalTimeline = lazy(() => import("./components/VerticalTimeline"));
const PhilosophyTree = lazy(() => import("./components/PhilosophyTree"));
const KnowledgeMap = lazy(() => import("./components/KnowledgeMap"));
const KnowledgeTree = lazy(() => import("./components/KnowledgeTree"));
const MapView = lazy(() => import("./components/MapView"));
const ProfileView = lazy(() => import("./components/ProfileView"));
const AboutPage = lazy(() => import("./components/AboutPage"));
const AdminPage = lazy(() => import("./components/AdminPage"));
const StudyTrails = lazy(() => import("./components/StudyTrails"));
const KnowledgeAreaPage = lazy(() => import("./components/KnowledgeAreaPage"));

function primarySection(view) {
    if (["timeline", "vertical", "philosophy-tree"].includes(view)) return "timeline";
    if (["knowledge-tree", "knowledge-map", "knowledge-area"].includes(view)) return "knowledge";
    return view;
}

function App() {
    const initialRoute = routeFromPath(window.location.pathname);
    const [timeline, setTimeline] = useState([]);
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeView, setActiveView] = useState(initialRoute.view);
    const [profileEntityId, setProfileEntityId] = useState(initialRoute.entityId);
    const [knowledgeAreaPath, setKnowledgeAreaPath] = useState(initialRoute.areaPath || "");
    const [selectedTracks, setSelectedTracks] = useState(null);
    const latestTimelineRequest = useRef(0);

    const navigate = (view, entityId = null) => {
        const path = pathForView(view, entityId);
        if (window.location.pathname !== path) window.history.pushState(null, "", path);
        setActiveView(view);
        if (view === "profiles") setProfileEntityId(entityId);
        if (view === "knowledge-area") setKnowledgeAreaPath(entityId || "");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const openProfile = (entityId) => navigate("profiles", entityId);

    useEffect(() => {
        const syncRoute = () => {
            const route = routeFromPath(window.location.pathname);
            setActiveView(route.view);
            if (route.view === "profiles") setProfileEntityId(route.entityId);
            if (route.view === "knowledge-area") setKnowledgeAreaPath(route.areaPath || "");
        };
        window.addEventListener("popstate", syncRoute);
        if (window.location.hash.startsWith("#/")) { window.history.replaceState(null, "", window.location.hash.slice(1)); syncRoute(); }
        else if (window.location.pathname === "/") window.history.replaceState(null, "", "/inicio");
        return () => window.removeEventListener("popstate", syncRoute);
    }, []);

    useEffect(() => {
        const labels = {
            home: "Início", timeline: "Tempo Horizontal", vertical: "Tempo Vertical",
            "philosophy-tree": "Árvore Histórica", "knowledge-tree": "Evolução do Conhecimento",
            "knowledge-map": "Árvore do Conhecimento", "knowledge-area": "Área do Conhecimento", trails: "Trilhas de Estudo", profiles: "Perfis", map: "Mapa de Origens", about: "Sobre", admin: "Administração",
        };
        document.title = `${labels[activeView]} · IDER`;
    }, [activeView]);

    useEffect(() => {
        api.get("/tracks").then((response) => {
            const names = response.data.map((track) => track.name);
            setTracks(names);
            setSelectedTracks(names);
            if (!names.length) setError("Nenhuma categoria foi encontrada no banco de dados.");
        }).catch(() => {
            setError("Não foi possível conectar à base de dados.");
            setSelectedTracks([]);
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        if (selectedTracks === null) return;
        const requestId = ++latestTimelineRequest.current;
        Promise.all(selectedTracks.map((track) => api.get("/timeline", { params: { track } })))
            .then((responses) => {
                if (requestId === latestTimelineRequest.current) setTimeline(responses.flatMap((response) => response.data));
            })
            .catch(() => {
                if (requestId === latestTimelineRequest.current) setError("Não foi possível carregar os conteúdos selecionados.");
            })
            .finally(() => {
                if (requestId === latestTimelineRequest.current) setLoading(false);
            });
    }, [selectedTracks]);

    const section = primarySection(activeView);
    const usesTimeline = ["timeline", "vertical", "philosophy-tree", "map"].includes(activeView);

    const renderActiveView = () => {
        if (activeView === "home") return <HomePage onNavigate={navigate} entities={timeline} trackCount={tracks.length} />;
        if (activeView === "about") return <AboutPage />;
        if (activeView === "admin") return <AdminPage />;
        if (activeView === "trails") return <StudyTrails onOpenProfile={openProfile} />;
        if (activeView === "profiles") return <ProfileView initialEntityId={profileEntityId} onNavigate={navigate} />;
        if (activeView === "knowledge-tree") return <KnowledgeTree onOpenProfile={openProfile} />;
        if (activeView === "knowledge-map") return <KnowledgeMap onOpenArea={(path) => navigate("knowledge-area", path)} />;
        if (activeView === "knowledge-area") return <KnowledgeAreaPage areaPath={knowledgeAreaPath} onOpenArea={(path) => navigate("knowledge-area", path)} onBack={() => navigate("knowledge-map")} />;
        if (loading) return <div className="loading-message">Carregando conteúdos...</div>;
        if (activeView === "timeline") return <Timeline entities={timeline} onOpenProfile={openProfile} />;
        if (activeView === "vertical") return <VerticalTimeline entities={timeline} onOpenProfile={openProfile} />;
        if (activeView === "philosophy-tree") return <PhilosophyTree entities={timeline} />;
        return <MapView entities={timeline} />;
    };

    return (
        <div className="app-container">
            <header className={`app-header ${activeView === "home" ? "home" : "compact"}`}>
                <button type="button" className="app-brand" onClick={() => navigate("home")} aria-label="Ir para o início">
                    <img src={iderLogo} alt="IDER" />
                </button>
                <GlobalSearch onSelect={openProfile} />
            </header>

            <div className="app-content">
                <nav className="view-tabs" aria-label="Navegação principal">
                    <button type="button" className={section === "home" ? "active" : ""} onClick={() => navigate("home")}>Início</button>
                    <button type="button" className={section === "timeline" ? "active" : ""} onClick={() => navigate("philosophy-tree")}>Linha do Tempo</button>
                    <button type="button" className={section === "knowledge" ? "active" : ""} onClick={() => navigate("knowledge-map")}>Conhecimento</button>
                    <button type="button" className={section === "trails" ? "active" : ""} onClick={() => navigate("trails")}>Trilhas</button>
                    <button type="button" className={section === "profiles" ? "active" : ""} onClick={() => navigate("profiles")}>Perfis</button>
                    <button type="button" className={section === "map" ? "active" : ""} onClick={() => navigate("map")}>Mapa</button>
                </nav>

                {section === "timeline" && (
                    <nav className="subview-tabs" aria-label="Modos da linha do tempo">
                        <button type="button" className={activeView === "philosophy-tree" ? "active" : ""} onClick={() => navigate("philosophy-tree")}>Árvore histórica</button>
                        <button type="button" className={activeView === "timeline" ? "active" : ""} onClick={() => navigate("timeline")}>Horizontal</button>
                        <button type="button" className={activeView === "vertical" ? "active" : ""} onClick={() => navigate("vertical")}>Vertical</button>
                    </nav>
                )}
                {section === "knowledge" && (
                    <nav className="subview-tabs" aria-label="Modos de conhecimento">
                        <button type="button" className={["knowledge-map", "knowledge-area"].includes(activeView) ? "active" : ""} onClick={() => navigate("knowledge-map")}>Árvore do conhecimento</button>
                        <button type="button" className={activeView === "knowledge-tree" ? "active" : ""} onClick={() => navigate("knowledge-tree")}>Evolução das áreas</button>
                    </nav>
                )}

                {usesTimeline && <Filters tracks={tracks} selectedTracks={selectedTracks || []} setSelectedTracks={setSelectedTracks} />}

                <div className="timeline-section">
                    {usesTimeline && error && <div className="error-message" role="alert">⚠ {error}</div>}
                    <Suspense fallback={<div className="loading-message">Carregando página...</div>}>{renderActiveView()}</Suspense>
                </div>
            </div>
            <SiteFooter />
        </div>
    );
}

export default App;
