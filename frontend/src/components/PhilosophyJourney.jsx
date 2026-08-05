import { useCallback, useEffect, useState } from "react";
import { loadProgress } from "../services/progress";
import "./PhilosophyJourney.css";

const empty = { communities: [], books: {}, videos: {}, podcasts: {}, trails: {} };

function PhilosophyJourney({ onOpenRecommendations, onOpenMyIder }) {
    const [data, setData] = useState(empty);
    const refresh = useCallback(async () => {
        const [communities, books, videos, podcasts, trails] = await Promise.all([
            loadProgress("communities", "ider-communities", []),
            loadProgress("library-books", "ider-reading-library", {}),
            loadProgress("library-videos", "ider-video-library", {}),
            loadProgress("library-podcasts", "ider-podcast-library", {}),
            loadProgress("official-trails", "ider-official-trails", {}),
        ]);
        setData({ communities, books, videos, podcasts, trails });
    }, []);

    useEffect(() => {
        const initialLoad = window.setTimeout(refresh, 0);
        const update = () => refresh();
        window.addEventListener("ider-progress-updated", update);
        return () => { window.clearTimeout(initialLoad); window.removeEventListener("ider-progress-updated", update); };
    }, [refresh]);

    const philosophyEntries = (collection) => Object.entries(collection).filter(([key]) => key.startsWith("filosofia:"));
    const joined = data.communities.some((item) => item.path === "filosofia");
    const choseBook = philosophyEntries(data.books).length > 0;
    const completedMaterial = philosophyEntries(data.books).some(([, value]) => value === "read") || philosophyEntries(data.videos).some(([, value]) => value === "done") || philosophyEntries(data.podcasts).some(([, value]) => value === "done");
    const completedTrail = (data.trails.filosofia || []).length >= 5;
    const stages = [
        { title: "Descobrir Filosofia", detail: "Explore a roda e conheça as áreas.", done: true },
        { title: "Entrar na comunidade", detail: "Participe da conversa sobre Filosofia.", done: joined },
        { title: "Escolher uma leitura", detail: "Adicione um livro à sua biblioteca.", done: choseBook, action: () => onOpenRecommendations("livros"), label: "Escolher livro" },
        { title: "Concluir um material", detail: "Finalize um livro, vídeo ou podcast.", done: completedMaterial, action: () => onOpenRecommendations("videos"), label: "Ver materiais" },
        { title: "Completar a trilha oficial", detail: "Conclua as cinco etapas e libere o certificado.", done: completedTrail, action: onOpenMyIder, label: "Abrir minha trilha" },
    ];
    const done = stages.filter((stage) => stage.done).length;
    const percent = Math.round(done / stages.length * 100);
    const next = stages.find((stage) => !stage.done);

    return <section className="philosophy-journey" aria-labelledby="philosophy-journey-title">
        <header><div><p>SUA JORNADA</p><h3 id="philosophy-journey-title">Filosofia, do primeiro contato à conclusão</h3><span>Seu avanço é salvo automaticamente e aparece no Meu IDER.</span></div><strong>{percent}%</strong></header>
        <div className="philosophy-journey-bar" aria-label={`${percent}% concluído`}><i style={{ width: `${percent}%` }}/></div>
        <ol>{stages.map((stage, index) => <li className={stage.done ? "done" : stage === next ? "current" : ""} key={stage.title}><b>{stage.done ? "✓" : index + 1}</b><div><strong>{stage.title}</strong><span>{stage.detail}</span></div>{!stage.done && stage.action && <button type="button" onClick={stage.action}>{stage === next ? stage.label : "Abrir"}</button>}</li>)}</ol>
        {percent === 100 && <div className="philosophy-journey-complete"><strong>Jornada concluída!</strong><span>Seu certificado está disponível em Meu IDER.</span><button type="button" onClick={onOpenMyIder}>Ver certificado</button></div>}
    </section>;
}

export default PhilosophyJourney;
