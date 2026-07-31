import { useEffect, useMemo, useState } from "react";

import api from "../services/api";
import "./StudyTrails.css";

const TRAILS = [
    { id: "fisica", title: "Das estrelas à física moderna", area: "Ciências Naturais", description: "Do heliocentrismo à relatividade, acompanhe mudanças decisivas em nossa compreensão do universo.", names: ["Aristarco de Samos", "Nicolau Copérnico", "Galileu Galilei", "Isaac Newton", "Albert Einstein"] },
    { id: "filosofia", title: "Formação da filosofia ocidental", area: "Filosofia", description: "Ideias clássicas, modernas e contemporâneas em uma sequência introdutória.", names: ["Platão", "Aristóteles", "René Descartes", "Immanuel Kant", "G. W. F. Hegel", "Karl Marx"] },
    { id: "computacao", title: "Origens da computação", area: "Ciências Formais", description: "Dos primeiros projetos de máquinas à teoria e arquitetura dos computadores.", names: ["Charles Babbage", "Ada Lovelace", "Alan Turing", "John von Neumann", "Claude Shannon", "Grace Hopper"] },
    { id: "estatistica", title: "Nascimento da estatística", area: "Matemática", description: "Probabilidade, inferência e aplicação de dados à ciência e à sociedade.", names: ["Blaise Pascal", "Thomas Bayes", "Florence Nightingale", "Francis Galton", "Karl Pearson", "Ronald Fisher"] },
    { id: "teologia", title: "Grandes caminhos da teologia cristã", area: "Teologia", description: "Uma introdução à patrística, escolástica, Reforma e teologia contemporânea.", names: ["Agostinho de Hipona", "Tomás de Aquino", "Martinho Lutero", "João Calvino", "Friedrich Schleiermacher", "Karl Barth", "Dietrich Bonhoeffer"] },
    { id: "evolucao", title: "Evolução e ciências da vida", area: "Biologia", description: "Uma trilha pelos fundamentos históricos do pensamento evolutivo.", names: ["Aristóteles", "Charles Darwin", "Francis Galton"] },
];

function formatYear(year) {
    if (!Number.isInteger(year)) return "Data não registrada";
    return year < 0 ? `${Math.abs(year)} a.C.` : `${year} d.C.`;
}

function StudyTrails({ onOpenProfile }) {
    const [entities, setEntities] = useState([]);
    const [selectedTrail, setSelectedTrail] = useState(TRAILS[0].id);
    const [error, setError] = useState("");

    useEffect(() => {
        api.get("/entities").then((response) => setEntities(response.data)).catch(() => setError("Não foi possível carregar as trilhas."));
    }, []);

    const trail = TRAILS.find((item) => item.id === selectedTrail) || TRAILS[0];
    const steps = useMemo(() => trail.names.map((name) => entities.find((entity) => entity.name === name)).filter(Boolean), [entities, trail]);

    return (
        <main className="study-trails">
            <header><p>PERCURSOS ORIENTADOS</p><h2>Trilhas de estudo</h2><span>Escolha um tema e percorra seus personagens em uma sequência histórica introdutória.</span></header>
            <nav aria-label="Escolha uma trilha">{TRAILS.map((item) => <button type="button" className={item.id === selectedTrail ? "active" : ""} key={item.id} onClick={() => setSelectedTrail(item.id)}><small>{item.area}</small><strong>{item.title}</strong></button>)}</nav>
            {error && <p className="trail-error">{error}</p>}
            <section className="trail-content">
                <header><span>{trail.area}</span><h3>{trail.title}</h3><p>{trail.description}</p><small>{steps.length} etapas disponíveis no acervo</small></header>
                <ol>{steps.map((entity, index) => <li key={entity.id}><button type="button" onClick={() => onOpenProfile(entity.id)}>{entity.image_url ? <img src={entity.image_url} alt="" loading="lazy" /> : <i>{entity.name[0]}</i>}<span><small>ETAPA {String(index + 1).padStart(2, "0")} · {formatYear(entity.start_year)}</small><strong>{entity.name}</strong><p>{entity.description || entity.key_ideas || "Abra o perfil para conhecer sua contribuição."}</p><b>Explorar perfil →</b></span></button></li>)}</ol>
            </section>
        </main>
    );
}

export default StudyTrails;
