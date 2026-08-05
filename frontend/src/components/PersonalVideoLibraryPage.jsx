import { useEffect, useMemo, useState } from "react";

import { RECOMMENDATIONS_BY_AREA } from "./KnowledgeAreaPage";
import { loadProgress, saveProgress } from "../services/progress";
import { readLocal } from "../services/progress";
import "./PersonalVideoLibraryPage.css";
import "./VideoLibraryDragDrop.css";

const GROUPS = [
    { id: "done", title: "Já assisti", eyebrow: "ACERVO CONCLUÍDO", description: "YouTubes que já fazem parte da sua história de aprendizagem." },
    { id: "doing", title: "Assistindo", eyebrow: "EM EXIBIÇÃO", description: "Conteúdos que você está acompanhando agora." },
    { id: "want", title: "Quero assistir", eyebrow: "PRÓXIMAS SESSÕES", description: "Sua seleção para os próximos momentos de estudo." },
];
const AREA_NAMES = { humanidades: "Humanidades", filosofia: "Filosofia", "filosofia/metafisica": "Metafísica", "filosofia/metafisica/tempo-e-espaco": "Tempo e Espaço" };
const COLORS = [["#75484a", "#251c25"], ["#355d55", "#172b27"], ["#605077", "#262132"], ["#8a693e", "#32281d"], ["#3e5f78", "#192936"]];

function videoCatalog() {
    return Object.entries(RECOMMENDATIONS_BY_AREA).flatMap(([areaPath, recommendations]) => recommendations.filter((item) => item.category === "videos").map((item) => ({ ...item, areaPath })));
}

function videoStyle(video) {
    const hash = [...`${video.areaPath}:${video.title}`].reduce((sum, character) => sum + character.charCodeAt(0), 0);
    const colors = COLORS[hash % COLORS.length];
    return { "--video-color": colors[0], "--video-dark": colors[1] };
}

function PersonalVideoLibraryPage({ onBack, onOpenVideo }) {
    const [statuses, setStatuses] = useState({});
    const [query, setQuery] = useState("");
    const [draggedVideoKey, setDraggedVideoKey] = useState("");
    const [dropGroup, setDropGroup] = useState("");
    const [movementMessage, setMovementMessage] = useState("");
    const videos = useMemo(() => videoCatalog(), []);
    const activity = useMemo(() => readLocal("ider-recommendation-activity", []), []);
    useEffect(() => { loadProgress("library-videos", "ider-video-library", {}).then(setStatuses); }, []);
    const statusFor = (video) => statuses[`${video.areaPath}:${video.title}`] || (activity.some((entry) => entry.category === "videos" && entry.title === video.title) ? "doing" : "want");
    const visible = videos.filter((video) => [video.title, video.description, AREA_NAMES[video.areaPath] || video.areaPath].join(" ").toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR")));
    const featured = visible.find((video) => statusFor(video) === "doing") || visible.find((video) => statusFor(video) === "done") || visible[0];
    const moveVideo = (videoKey, status) => {
        const video = videos.find((item) => `${item.areaPath}:${item.title}` === videoKey);
        if (!video || statusFor(video) === status) return;
        const next = { ...statuses, [videoKey]: status };
        setStatuses(next);
        saveProgress("library-videos", "ider-video-library", next);
        setMovementMessage(`${video.title} foi movido para ${GROUPS.find((group) => group.id === status)?.title}.`);
    };
    const dropVideo = (event, status) => {
        event.preventDefault();
        moveVideo(event.dataTransfer.getData("text/plain") || draggedVideoKey, status);
        setDraggedVideoKey("");
        setDropGroup("");
    };

    return <main className="personal-video-library-page">
        <nav className="video-library-breadcrumb"><button type="button" onClick={onBack}>← Meu IDER</button><span>Seu acervo audiovisual</span></nav>
        <header className="video-library-hero"><div><p>YOUTUBETECA PARTICULAR</p><h1>Minha YoutubeTeca</h1><span>Reveja canais, aulas e conversas do YouTube que marcaram sua jornada.</span></div><aside><strong>{videos.filter((video) => statusFor(video) === "done").length}</strong><span>YouTubes assistidos</span><small>{videos.length} títulos no acervo</small></aside></header>
        <p className="video-movement-message" aria-live="polite">{movementMessage}</p>
        <section className={`video-screening-room ${draggedVideoKey ? "is-rearranging" : ""}`}>
            {featured && <button type="button" className="video-library-featured" style={videoStyle(featured)} onClick={() => onOpenVideo(featured)}><span className="video-curtain left"/><span className="video-curtain right"/><div className="video-featured-content"><small>EM DESTAQUE · {AREA_NAMES[featured.areaPath] || featured.areaPath}</small><i aria-hidden="true">▶</i><h2>{featured.title}</h2><p>{featured.description}</p><b>Abrir vídeo e anotações →</b></div></button>}
            <div className="video-library-toolbar"><div><span>ARQUIVO AUDIOVISUAL</span><strong>Escolha uma sessão</strong></div><label>Buscar no acervo<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Título, assunto ou área..."/></label></div>
            {GROUPS.map((group) => { const items = visible.filter((video) => statusFor(video) === group.id); return <section className={`video-archive-group ${dropGroup === group.id ? "is-drop-target" : ""}`} key={group.id} onDragEnter={() => setDropGroup(group.id)} onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; setDropGroup(group.id); }} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setDropGroup(""); }} onDrop={(event) => dropVideo(event, group.id)}><header><div><p>{group.eyebrow}</p><h2>{group.title}</h2><span>{draggedVideoKey ? "Solte o vídeo nesta seção" : group.description}</span></div><b>{items.length}</b></header><div className="video-archive-grid">{items.map((video, index) => { const videoKey = `${video.areaPath}:${video.title}`; return <button type="button" draggable="true" className={`video-archive-card ${draggedVideoKey === videoKey ? "is-dragging" : ""}`} style={videoStyle(video)} key={videoKey} onClick={() => onOpenVideo(video)} onDragStart={(event) => { event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", videoKey); setDraggedVideoKey(videoKey); setMovementMessage(""); }} onDragEnd={() => { setDraggedVideoKey(""); setDropGroup(""); }}><div className="video-thumbnail"><span className="film-number">{String(index + 1).padStart(2, "0")}</span><i aria-hidden="true">▶</i><small>{video.source || "Vídeo"}</small></div><div><span>{AREA_NAMES[video.areaPath] || video.areaPath}</span><strong>{video.title}</strong><p>{video.description}</p><b>Abrir ou arrastar →</b></div></button>; })}{!items.length && <p className="video-library-empty">{draggedVideoKey ? "Solte o vídeo aqui." : "Nenhum vídeo nesta seção."}</p>}</div></section>; })}
        </section>
    </main>;
}

export default PersonalVideoLibraryPage;
