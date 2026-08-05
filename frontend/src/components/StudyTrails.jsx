import { useEffect, useMemo, useState } from "react";

import api from "../services/api";
import "./StudyTrails.css";
import "./StudyTrailsPreview.css";

const TRAILS = [
    {
        id: "filosofia-grega", title: "Filosofia Grega", area: "Filosofia",
        description: "Dos primeiros pensadores da natureza à síntese de Aristóteles: uma formação progressiva nos problemas, métodos e escolas da filosofia antiga.",
        steps: [
            { name: "Tales de Mileto", focus: "Arché e a busca de uma explicação natural para o mundo." },
            { name: "Anaximandro", focus: "O ápeiron e a origem indeterminada de todas as coisas." },
            { name: "Pitágoras", focus: "Número, proporção, harmonia e ordem do cosmos." },
            { name: "Heráclito", focus: "Mudança, conflito e logos como estrutura da realidade." },
            { name: "Parmênides", focus: "O problema do ser e a oposição entre razão e aparência." },
            { name: "Sócrates", focus: "Diálogo, exame da vida, virtude e método de investigação." },
            { name: "Platão", focus: "Formas, conhecimento, alma, justiça e organização da cidade." },
            { name: "Aristóteles", focus: "Lógica, causas, substância, ética e sistematização do conhecimento." },
        ],
    },
    {
        id: "grandes-esculturas", title: "Grandes Esculturas da História", area: "História da Arte",
        description: "Um percurso pela representação do corpo, do movimento e do ideal artístico, da Grécia Antiga ao Renascimento.",
        steps: [
            { name: "Discóbolo", focus: "Movimento contido, equilíbrio e ideal atlético na escultura grega." },
            { name: "Vênus de Milo", focus: "Beleza ideal, postura e permanência da tradição helenística." },
            { name: "Vitória de Samotrácia", focus: "Dramaticidade, vento, movimento e integração com o espaço." },
            { name: "Pietà", focus: "Virtuosismo do mármore, emoção e composição no Alto Renascimento." },
            { name: "David", focus: "Monumentalidade, anatomia e tensão antes da ação." },
        ],
    },
    {
        id: "grandes-pinturas", title: "Grandes Pinturas da História", area: "História da Arte",
        description: "Obras decisivas para compreender perspectiva, retrato, luz, expressão, modernidade e rupturas na pintura ocidental e brasileira.",
        steps: [
            { name: "O Nascimento de Vênus", focus: "Mitologia clássica, linha, beleza e humanismo renascentista." },
            { name: "Mona Lisa", focus: "Retrato, sfumato, paisagem e ambiguidade psicológica." },
            { name: "A Escola de Atenas", focus: "Perspectiva, arquitetura e síntese visual da filosofia antiga." },
            { name: "As Meninas", focus: "Olhar, representação, espaço pictórico e presença do observador." },
            { name: "A Ronda Noturna", focus: "Luz dramática, ação coletiva e reinvenção do retrato de grupo." },
            { name: "A Noite Estrelada", focus: "Cor, ritmo, paisagem interior e intensidade pós-impressionista." },
            { name: "O Grito", focus: "Angústia moderna, deformação expressiva e força emocional da cor." },
            { name: "Abaporu", focus: "Antropofagia, identidade brasileira e transformação das vanguardas." },
            { name: "Guernica", focus: "Fragmentação cubista, memória da guerra e denúncia política." },
        ],
    },
    {
        id: "teologia-natural", title: "Teologia Natural", area: "Teologia e Filosofia",
        description: "Como a razão investigou Deus, criação, ordem, causalidade e o problema do mal sem partir exclusivamente da revelação.",
        steps: [
            { name: "Aristóteles", focus: "Primeiro motor, causalidade e fundamento metafísico da ordem natural." },
            { name: "Agostinho de Hipona", focus: "Verdade, criação, interioridade e relação entre fé e razão." },
            { name: "Anselmo de Cantuária", focus: "O argumento ontológico e a ideia de Deus como ser máximo concebível." },
            { name: "Tomás de Aquino", focus: "As cinco vias: movimento, causa, contingência, graus e finalidade." },
            { name: "Gottfried Wilhelm Leibniz", focus: "Princípio da razão suficiente, contingência e problema do mal." },
            { name: "Blaise Pascal", focus: "Grandeza e limite da razão diante da existência, da fé e do infinito." },
        ],
    },
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
    const steps = useMemo(() => trail.steps.map((stage) => {
        const entity = entities.find((item) => item.name === stage.name);
        return entity ? { ...entity, trailFocus: stage.focus } : null;
    }).filter(Boolean), [entities, trail]);

    return (
        <main className="study-trails">
            <header><p>PERCURSOS ORIENTADOS</p><h2>Trilhas de estudo</h2><span>Escolha um tema e percorra personagens, ideias e obras em uma sequência histórica introdutória.</span></header>
            <nav aria-label="Escolha uma trilha">{TRAILS.map((item) => <button type="button" className={item.id === selectedTrail ? "active" : ""} key={item.id} onClick={() => setSelectedTrail(item.id)}><small>{item.area}</small><strong>{item.title}</strong></button>)}</nav>
            {error && <p className="trail-error">{error}</p>}
            <section className="trail-content">
                <header><span>{trail.area}</span><h3>{trail.title}</h3><p>{trail.description}</p><small>{steps.length} etapas disponíveis no acervo</small></header>
                <ol>{steps.map((entity, index) => <li key={entity.id}><button type="button" onClick={() => onOpenProfile(entity.id)}>{entity.image_url ? <span className="trail-thumb" style={{ "--preview-image": `url("${entity.image_url}")` }}><img src={entity.image_url} alt="" loading="lazy" /><span className="trail-image-preview" role="img" aria-label={`Imagem ampliada de ${entity.name}`} /></span> : <i>{entity.name[0]}</i>}<span><small>ETAPA {String(index + 1).padStart(2, "0")} · {formatYear(entity.start_year)}</small><strong>{entity.name}</strong><p>{entity.trailFocus}</p><b>Explorar perfil →</b></span></button></li>)}</ol>
            </section>
        </main>
    );
}

export default StudyTrails;
