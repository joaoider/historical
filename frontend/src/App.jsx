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
const StudyTrails = lazy(() => import("./components/StudyTrails"));
const KnowledgeAreaPage = lazy(() => import("./components/KnowledgeAreaPage"));
const KnowledgeRecommendationsPage = lazy(() => import("./components/KnowledgeRecommendationsPage"));
const MyIderPage = lazy(() => import("./components/MyIderPage"));
const LibraryItemPage = lazy(() => import("./components/LibraryItemPage"));
const NotebookPage = lazy(() => import("./components/NotebookPage"));
const BadgesPage = lazy(() => import("./components/BadgesPage"));
const PersonalLibraryPage = lazy(() => import("./components/PersonalLibraryPage"));
const PersonalVideoLibraryPage = lazy(() => import("./components/PersonalVideoLibraryPage"));
const PersonalArchivePage = lazy(() => import("./components/PersonalArchivePage"));
const AvatarsPage = lazy(() => import("./components/AvatarsPage"));

function primarySection(view) {
    if (["timeline", "vertical", "philosophy-tree"].includes(view)) return "timeline";
    if (view === "knowledge-tree") return "explore";
    if (["knowledge-map", "knowledge-area", "knowledge-recommendations"].includes(view)) return "knowledge";
    if (["library-item", "notebook", "badges", "library", "videoLibrary", "podcastLibrary", "publicationLibrary", "filmLibrary", "museumLibrary"].includes(view)) return "my-ider";
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
    const [recommendationCategory, setRecommendationCategory] = useState(initialRoute.recommendationCategory || "");
    const [libraryItem, setLibraryItem] = useState(initialRoute.libraryItem || null);
    const [selectedTracks, setSelectedTracks] = useState(null);
    const latestTimelineRequest = useRef(0);
    const tracksRequested = useRef(false);
    const exploreMenu = useRef(null);
    const usesTimeline = ["timeline", "vertical", "philosophy-tree", "map"].includes(activeView);
    const needsTimelineData = activeView === "home" || usesTimeline;

    const navigate = (view, entityId = null) => {
        if (exploreMenu.current) exploreMenu.current.open = false;
        const path = pathForView(view, entityId);
        if (window.location.pathname !== path) window.history.pushState(null, "", path);
        setActiveView(view);
        if (view === "profiles") setProfileEntityId(entityId);
        if (view === "knowledge-area") setKnowledgeAreaPath(entityId || "");
        if (view === "knowledge-recommendations") { setKnowledgeAreaPath(entityId.areaPath); setRecommendationCategory(entityId.category); }
        if (view === "library-item") setLibraryItem(entityId);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const openProfile = (entityId) => navigate("profiles", entityId);

    useEffect(() => {
        const syncRoute = () => {
            const route = routeFromPath(window.location.pathname);
            setActiveView(route.view);
            if (route.view === "profiles") setProfileEntityId(route.entityId);
            if (route.view === "knowledge-area") setKnowledgeAreaPath(route.areaPath || "");
            if (route.view === "knowledge-recommendations") { setKnowledgeAreaPath(route.areaPath || ""); setRecommendationCategory(route.recommendationCategory || ""); }
            if (route.view === "library-item") setLibraryItem(route.libraryItem || null);
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
            "knowledge-map": "Roda do Conhecimento", "knowledge-area": "Área do Conhecimento", "knowledge-recommendations": "Indicações", "my-ider": "Meu IDER", "library-item": "Anotações", notebook: "Meu Caderno", badges: "Minhas Badges", library: "Minha Biblioteca", videoLibrary: "Minha YoutubeTeca", podcastLibrary: "Minha PodTeca", publicationLibrary: "Minha Revistoteca", filmLibrary: "Minha Videoteca", museumLibrary: "Minha MuseuTeca", trails: "Trilhas de Estudo", profiles: "Perfis", avatars: "Avatares", map: "Mapa de Origens", about: "Sobre",
        };
        document.title = `${labels[activeView]} · IDER`;
    }, [activeView]);

    useEffect(() => {
        if (!needsTimelineData || tracksRequested.current) return;
        tracksRequested.current = true;
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
    }, [needsTimelineData]);

    useEffect(() => {
        if (!needsTimelineData || selectedTracks === null) return;
        if (selectedTracks.length === 0) {
            const clearEmpty = window.setTimeout(() => { setTimeline([]); setLoading(false); }, 0);
            return () => window.clearTimeout(clearEmpty);
        }
        const requestId = ++latestTimelineRequest.current;
        const params = new URLSearchParams();
        selectedTracks.forEach((track) => params.append("track", track));
        api.get("/timeline", { params })
            .then((response) => {
                if (requestId === latestTimelineRequest.current) setTimeline(response.data);
            })
            .catch(() => {
                if (requestId === latestTimelineRequest.current) setError("Não foi possível carregar os conteúdos selecionados.");
            })
            .finally(() => {
                if (requestId === latestTimelineRequest.current) setLoading(false);
            });
    }, [needsTimelineData, selectedTracks]);

    const section = primarySection(activeView);

    const renderActiveView = () => {
        if (activeView === "home") return <HomePage onNavigate={navigate} entities={timeline} trackCount={tracks.length} />;
        if (activeView === "about") return <AboutPage />;
        if (activeView === "avatars") return <AvatarsPage onNavigate={navigate} />;
        if (activeView === "trails") return <StudyTrails onOpenProfile={openProfile} />;
        if (activeView === "profiles") return <ProfileView initialEntityId={profileEntityId} onNavigate={navigate} />;
        if (activeView === "knowledge-tree") return <KnowledgeTree onOpenProfile={openProfile} />;
        if (activeView === "knowledge-map") return <KnowledgeMap onOpenArea={(path) => navigate("knowledge-area", path)} />;
        if (activeView === "knowledge-area") return <KnowledgeAreaPage areaPath={knowledgeAreaPath} onOpenArea={(path) => navigate("knowledge-area", path)} onOpenRecommendations={(category) => navigate("knowledge-recommendations", { areaPath: knowledgeAreaPath, category })} onOpenMyIder={() => navigate("my-ider")} onBack={() => navigate("knowledge-map")} />;
        if (activeView === "knowledge-recommendations") return <KnowledgeRecommendationsPage areaPath={knowledgeAreaPath} categorySlug={recommendationCategory} onBack={() => navigate("knowledge-area", knowledgeAreaPath)} onOpenCategory={(category) => navigate("knowledge-recommendations", { areaPath: knowledgeAreaPath, category })} />;
        if (activeView === "my-ider") return <MyIderPage onNavigate={navigate} />;
        if (activeView === "library-item") return <LibraryItemPage itemRef={libraryItem} onBack={() => navigate("my-ider")} />;
        if (activeView === "notebook") return <NotebookPage onBack={() => navigate("my-ider")} onOpenItem={(item) => navigate("library-item", { category: item.category, areaPath: item.areaPath, title: item.title })} />;
        if (activeView === "badges") return <BadgesPage onBack={() => navigate("my-ider")} onOpenTrails={() => navigate("my-ider")} />;
        if (activeView === "library") return <PersonalLibraryPage onBack={() => navigate("my-ider")} onOpenBook={(item) => navigate("library-item", { category: "books", areaPath: item.areaPath, title: item.title })} />;
        if (activeView === "videoLibrary") return <PersonalVideoLibraryPage onBack={() => navigate("my-ider")} onOpenVideo={(item) => navigate("library-item", { category: "videos", areaPath: item.areaPath, title: item.title })} />;
        if (["podcastLibrary", "publicationLibrary", "filmLibrary", "museumLibrary"].includes(activeView)) return <PersonalArchivePage archive={activeView} onBack={() => navigate("my-ider")} onOpenItem={(item) => navigate("library-item", { category: item.category, areaPath: item.areaPath, title: item.title })} />;
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
                <nav className="view-tabs" aria-label="Navegação principal">
                    <button type="button" className={section === "home" ? "active" : ""} onClick={() => navigate("home")}>Início</button>
                    <details className={`view-tabs-group ${["timeline", "profiles", "map", "explore"].includes(section) ? "active" : ""}`} ref={exploreMenu}>
                        <summary>Explorar <span aria-hidden="true">⌄</span></summary>
                        <div className="view-tabs-menu">
                            <button type="button" className={section === "timeline" ? "active" : ""} onClick={() => navigate("philosophy-tree")}><span>Linha do Tempo</span><small>Explore períodos e acontecimentos</small></button>
                            <button type="button" className={section === "profiles" ? "active" : ""} onClick={() => navigate("profiles")}><span>Perfis</span><small>Conheça pessoas, livros e obras</small></button>
                            <button type="button" className={section === "map" ? "active" : ""} onClick={() => navigate("map")}><span>Mapa</span><small>Veja as origens no território</small></button>
                            <button type="button" className={activeView === "knowledge-tree" ? "active" : ""} onClick={() => navigate("knowledge-tree")}><span>Evolução das áreas</span><small>Acompanhe como os campos do saber se desenvolveram</small></button>
                        </div>
                    </details>
                    <button type="button" className={section === "knowledge" ? "active" : ""} onClick={() => navigate("knowledge-map")}>Conhecimento</button>
                    <button type="button" className={section === "avatars" ? "active" : ""} onClick={() => navigate("avatars")}>Avatares</button>
                    <button type="button" className={section === "trails" ? "active" : ""} onClick={() => navigate("trails")}>Trilhas</button>
                    <button type="button" className={section === "my-ider" ? "active" : ""} onClick={() => navigate("my-ider")}>Meu IDER</button>
                </nav>
                <GlobalSearch onSelect={openProfile} />
            </header>

            <div className="app-content">

                {section === "timeline" && (
                    <nav className="subview-tabs" aria-label="Modos da linha do tempo">
                        <button type="button" className={activeView === "philosophy-tree" ? "active" : ""} onClick={() => navigate("philosophy-tree")}>Árvore histórica</button>
                        <button type="button" className={activeView === "timeline" ? "active" : ""} onClick={() => navigate("timeline")}>Horizontal</button>
                        <button type="button" className={activeView === "vertical" ? "active" : ""} onClick={() => navigate("vertical")}>Vertical</button>
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
