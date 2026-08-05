import { useEffect, useState } from "react";
import { loadProgress, readLocal, saveProgress } from "../services/progress";
import "./MyTrails.css";

const OFFICIAL_TRAILS = [
    { id: "filosofia", title: "Fundamentos da Filosofia", area: "Filosofia", tasks: ["Ler O mundo de Sofia", "Ler Convite à Filosofia", "Assistir à Introdução à Filosofia", "Ouvir Filosofia Pop", "Publicar uma reflexão na comunidade"] },
    { id: "humanidades", title: "Olhares sobre as Humanidades", area: "Humanidades", tasks: ["Ler uma obra de Humanidades", "Assistir ao vídeo sobre Ciências Humanas", "Ouvir Casa das Humanidades", "Explorar uma publicação da ANPOCS", "Visitar virtualmente um museu indicado"] },
    { id: "metafisica", title: "Questões de Metafísica", area: "Metafísica", tasks: ["Ler uma introdução à Metafísica", "Assistir à aula O que é Metafísica?", "Ler Metafísica Analítica", "Participar da comunidade", "Explorar Tempo e Espaço"] },
];
const readStored = readLocal;

function certificate(trail) {
    const profile = readStored("ider-user-profile", {}); const name = profile.name || profile.nickname || "Estudante IDER"; const date = new Intl.DateTimeFormat("pt-BR").format(new Date());
    const html = `<!doctype html><meta charset="utf-8"><title>Certificado IDER</title><style>body{padding:40px;background:#eee6d8;color:#382d21;font-family:Georgia}.c{min-height:600px;padding:70px;border:12px double #725c91;background:#fffdf7;text-align:center}h1{font-size:55px;font-weight:400;margin-top:70px}.n,.t{font-size:30px}.t{color:#725c91}p{font-size:18px}</style><main class="c"><b>IDER</b><h1>Certificado de conclusão</h1><p>Certificamos que</p><p class="n">${name}</p><p>concluiu todas as atividades da trilha oficial</p><p class="t">${trail.title}</p><p>Emitido em ${date}</p></main>`;
    const url = URL.createObjectURL(new Blob([html], { type: "text/html" })); const a = document.createElement("a"); a.href = url; a.download = `certificado-${trail.id}.html`; a.click(); URL.revokeObjectURL(url);
}

function MyTrails() {
    const [progress, setProgress] = useState({});
    const [custom, setCustom] = useState([]);
    useEffect(() => {
        loadProgress("official-trails", "ider-official-trails", {}).then(setProgress);
        loadProgress("custom-trails", "ider-custom-trails", []).then(setCustom);
    }, []);
    const [draft, setDraft] = useState({ title: "", tasks: "" }); const [showForm, setShowForm] = useState(false);
    const toggleProgress = (trailId, index) => setProgress((current) => { const done = current[trailId] || []; const values = done.includes(index) ? done.filter((item) => item !== index) : [...done, index]; const next = { ...current, [trailId]: values }; saveProgress("official-trails", "ider-official-trails", next); return next; });
    const create = (event) => { event.preventDefault(); const tasks = draft.tasks.split("\n").map((item) => item.trim()).filter(Boolean); if (!tasks.length) return; const next = [...custom, { id: crypto.randomUUID(), title: draft.title, tasks, done: [] }]; setCustom(next); saveProgress("custom-trails", "ider-custom-trails", next); setDraft({ title: "", tasks: "" }); setShowForm(false); };
    const toggleCustom = (id, index) => setCustom((current) => { const next = current.map((trail) => trail.id !== id ? trail : { ...trail, done: trail.done.includes(index) ? trail.done.filter((item) => item !== index) : [...trail.done, index] }); saveProgress("custom-trails", "ider-custom-trails", next); return next; });
    return <section className="my-trails"><header><div><p>APRENDIZADO ORIENTADO</p><h2>Minhas trilhas</h2><span>Complete percursos oficiais ou construa seu próprio caminho.</span></div><button type="button" onClick={() => setShowForm(!showForm)}>{showForm ? "Cancelar" : "+ Criar trilha personalizada"}</button></header>
        {showForm && <form onSubmit={create}><label>Nome<input required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })}/></label><label>Etapas — uma por linha<textarea required rows="4" value={draft.tasks} onChange={(e) => setDraft({ ...draft, tasks: e.target.value })}/></label><button>Criar trilha</button></form>}
        <div className="official-trails">{OFFICIAL_TRAILS.map((trail, trailIndex) => { const done = progress[trail.id]?.length || 0; const percent = Math.round(done / trail.tasks.length * 100); return <article className={percent === 100 ? "complete" : ""} key={trail.id}><header><small>0{trailIndex + 1} · TRILHA OFICIAL</small><h3>{trail.title}</h3><span>{trail.area} · certificado ao concluir</span></header><div className="trail-bar"><i style={{ width: `${percent}%` }}/></div><strong>{percent}% concluída</strong><ul>{trail.tasks.map((task, index) => <li key={task}><label><input type="checkbox" checked={progress[trail.id]?.includes(index) || false} onChange={() => toggleProgress(trail.id, index)}/><span>{task}</span></label></li>)}</ul>{percent === 100 ? <button onClick={() => certificate(trail)}>Baixar certificado</button> : <p>Certificado bloqueado · conclua as {trail.tasks.length} etapas</p>}</article>; })}</div>
        {custom.length > 0 && <section className="custom-trails"><h3>Trilhas personalizadas</h3><div>{custom.map((trail) => <article key={trail.id}><header><h4>{trail.title}</h4><b>{Math.round(trail.done.length / trail.tasks.length * 100)}%</b></header><ul>{trail.tasks.map((task, index) => <li key={task}><label><input type="checkbox" checked={trail.done.includes(index)} onChange={() => toggleCustom(trail.id, index)}/>{task}</label></li>)}</ul></article>)}</div></section>}
    </section>;
}
export { OFFICIAL_TRAILS };
export default MyTrails;
