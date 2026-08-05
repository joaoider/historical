import { useEffect, useMemo, useState } from "react";

import { loadProgress } from "../services/progress";
import { OFFICIAL_TRAILS } from "./MyTrails";
import "./BadgesPage.css";
import "./BadgeLevels.css";

const BADGE_DETAILS = {
    filosofia: { symbol: "Φ", tier: "Ouro", description: "Dominou os fundamentos da investigação filosófica.", color: "#70558d" },
    humanidades: { symbol: "H", tier: "Prata", description: "Conectou história, cultura, sociedade e experiência humana.", color: "#956b3f" },
    metafisica: { symbol: "∞", tier: "Ouro", description: "Explorou ser, realidade, causalidade, tempo e espaço.", color: "#406b76" },
};

const FUTURE_BADGES = [
    { id: "filosofia-grega", title: "Sabedoria Grega", area: "Filosofia Grega", symbol: "Ω", description: "Conclua a trilha dos pré-socráticos a Aristóteles.", color: "#9b6b31" },
    { id: "teologia-natural", title: "Razão e Transcendência", area: "Teologia Natural", symbol: "✦", description: "Conclua a trilha de razão, fé e argumentos sobre o divino.", color: "#697d42" },
    { id: "artes", title: "Olhar de Curador", area: "História da Arte", symbol: "◇", description: "Conclua as trilhas de grandes pinturas e esculturas.", color: "#9a4f58" },
];

function BadgesPage({ onBack, onOpenTrails }) {
    const [progress, setProgress] = useState({});
    const [filter, setFilter] = useState("all");
    useEffect(() => { loadProgress("official-trails", "ider-official-trails", {}).then(setProgress); }, []);
    const badges = useMemo(() => {
        const official = OFFICIAL_TRAILS.map((trail) => {
            const done = progress[trail.id]?.length || 0;
            const percent = Math.min(100, Math.round(done / trail.tasks.length * 100));
            return { ...trail, ...BADGE_DETAILS[trail.id], percent, status: percent === 100 ? "earned" : "progress" };
        });
        return [...official, ...FUTURE_BADGES.map((badge) => ({ ...badge, tier: "Em breve", percent: 0, status: "locked" }))];
    }, [progress]);
    const visible = filter === "all" ? badges : badges.filter((badge) => badge.status === filter);
    const earned = badges.filter((badge) => badge.status === "earned").length;
    const average = Math.round(badges.slice(0, OFFICIAL_TRAILS.length).reduce((total, badge) => total + badge.percent, 0) / OFFICIAL_TRAILS.length);
    const completedTasks = OFFICIAL_TRAILS.reduce((total, trail) => total + Math.min(progress[trail.id]?.length || 0, trail.tasks.length), 0);
    const xp = completedTasks * 100;
    const level = Math.floor(xp / 500) + 1;
    const levelProgress = (xp % 500) / 5;
    const xpToNextLevel = 500 - (xp % 500 || 0);
    const rank = level >= 4 ? "Mestre do Conhecimento" : level >= 3 ? "Investigador do Conhecimento" : level >= 2 ? "Explorador do Conhecimento" : "Aprendiz do Conhecimento";
    const nextBadge = badges.filter((badge) => badge.status === "progress").sort((a, b) => b.percent - a.percent)[0];

    return <main className="badges-page">
        <nav className="badges-breadcrumb"><button type="button" onClick={onBack}>← Meu IDER</button><span>Conquistas e gamificação</span></nav>
        <header className="badges-hero"><div><p>SUA JORNADA EM SÍMBOLOS</p><h1>Minhas Badges</h1><span>Cada emblema registra uma trilha concluída e uma nova área do conhecimento conquistada.</span></div><aside><strong>{earned}</strong><span>badges conquistadas</span><small>{average}% de avanço nas trilhas oficiais</small></aside></header>
        <section className="badge-level"><div><span>NÍVEL {level} · {xp} XP</span><strong>{rank}</strong><small>Cada etapa concluída vale 100 XP</small></div><div><div className="badge-level-track"><i style={{ width: `${levelProgress}%` }}/></div><small>{xpToNextLevel} XP para o nível {level + 1}</small></div><b>{Math.round(levelProgress)}%</b></section>
        <nav className="badge-filters" aria-label="Filtrar badges">{[["all","Todas"],["earned","Conquistadas"],["progress","Em progresso"],["locked","Bloqueadas"]].map(([id,label]) => <button type="button" className={filter === id ? "active" : ""} onClick={() => setFilter(id)} key={id}>{label}<small>{id === "all" ? badges.length : badges.filter((badge) => badge.status === id).length}</small></button>)}</nav>
        <section className="badges-gallery" aria-label="Coleção de badges">{visible.map((badge) => <article className={`badge-card ${badge.status}`} style={{ "--badge-color": badge.color }} key={badge.id}><div className="badge-emblem"><span>{badge.symbol}</span></div><div className="badge-card-copy"><header><small>{badge.area} · {badge.tier}</small><span>{badge.status === "earned" ? "CONQUISTADA" : badge.status === "locked" ? "BLOQUEADA" : "EM PROGRESSO"}</span></header><h2>{badge.title}</h2><p>{badge.description}</p>{badge.status !== "locked" && <><div className="badge-progress"><i style={{ width: `${badge.percent}%` }}/></div><b>{badge.percent}% · {badge.status === "earned" ? "trilha concluída" : "continue sua trilha"}</b></>}{badge.status === "locked" && <b>Disponível quando esta trilha for lançada</b>}</div></article>)}</section>
        <section className="badges-next-step"><div><p>PRÓXIMA CONQUISTA</p><h2>{nextBadge ? `${nextBadge.title} · ${nextBadge.percent}%` : "Todas as trilhas atuais foram concluídas"}</h2><span>{nextBadge ? `A trilha de ${nextBadge.area} é a conquista mais próxima. Complete as etapas restantes para receber a badge.` : "Novas trilhas e badges serão adicionadas à sua jornada."}</span></div><button type="button" onClick={onOpenTrails}>{nextBadge ? "Continuar esta trilha" : "Ver Minhas Trilhas"} →</button></section>
    </main>;
}

export default BadgesPage;
