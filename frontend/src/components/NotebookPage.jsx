import { useEffect, useMemo, useState } from "react";

import { RECOMMENDATIONS_BY_AREA } from "./KnowledgeAreaPage";
import { EXTRA_BOOKS } from "./KnowledgeRecommendationsPage";
import { loadProgress } from "../services/progress";
import "./NotebookPage.css";
import "./NotebookEnhancements.css";

const CATEGORY_NAMES = { books: "Livros", videos: "YouTubes", films: "Filmes e documentários", podcasts: "Podcasts", publications: "Revistas e newsletters", places: "Museus e lugares" };
const AREA_NAMES = { humanidades: "Humanidades", filosofia: "Filosofia", "filosofia/metafisica": "Metafísica", "filosofia/metafisica/tempo-e-espaco": "Tempo e Espaço" };

function catalog() {
    return Object.entries(RECOMMENDATIONS_BY_AREA).flatMap(([areaPath, recommendations]) => [
        ...recommendations.map((item) => ({ ...item, areaPath })),
        ...(EXTRA_BOOKS[areaPath] || []).map((item) => ({ ...item, areaPath, category: "books" })),
    ]);
}

function ConnectionMap({ entries }) {
    const labels = [...new Set(entries.flatMap(({ item, record }) => [AREA_NAMES[item.areaPath] || item.areaPath, ...(record.tags || []), ...(record.connections || [])]))].slice(0, 10);
    if (!labels.length) return <p className="notebook-empty">Adicione etiquetas às suas notas para formar o mapa.</p>;
    const nodes = labels.map((label, index) => { const angle = (Math.PI * 2 * index / labels.length) - Math.PI / 2; return { label, x: 210 + Math.cos(angle) * 150, y: 170 + Math.sin(angle) * 125 }; });
    return <svg className="notebook-connection-map" viewBox="0 0 420 340" role="img" aria-label="Mapa das conexões do caderno">
        {nodes.map((node) => <line key={`line-${node.label}`} x1="210" y1="170" x2={node.x} y2={node.y}/>) }
        <circle className="center" cx="210" cy="170" r="48"/><text className="center-label" x="210" y="166">Meu</text><text className="center-label" x="210" y="181">Caderno</text>
        {nodes.map((node) => <g key={node.label}><circle cx={node.x} cy={node.y} r="34"/><text x={node.x} y={node.y}>{node.label.length > 13 ? `${node.label.slice(0, 12)}…` : node.label}</text></g>)}
    </svg>;
}

function NotebookPage({ onBack, onOpenItem }) {
    const [records, setRecords] = useState({});
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("all");
    const [tag, setTag] = useState("all");
    const [onlyReviews, setOnlyReviews] = useState(false);

    useEffect(() => { loadProgress("library-notes", "ider-library-notes", {}).then(setRecords); }, []);
    const entries = useMemo(() => catalog().map((item) => ({ item, record: records[`${item.areaPath}:${item.title}`] })).filter(({ record }) => record && (record.notes || record.highlight || record.comments?.length || record.tags?.length)), [records]);
    const tags = [...new Set(entries.flatMap(({ record }) => record.tags || []))].sort((a, b) => a.localeCompare(b));
    const today = new Date().toISOString().slice(0, 10);
    const filtered = entries.filter(({ item, record }) => {
        const searchable = [item.title, item.description, record.notes, record.highlight, ...(record.tags || []), ...(record.connections || []), ...(record.comments || []).map((entry) => entry.text)].join(" ").toLocaleLowerCase("pt-BR");
        return (!query || searchable.includes(query.toLocaleLowerCase("pt-BR"))) && (category === "all" || item.category === category) && (tag === "all" || record.tags?.includes(tag)) && (!onlyReviews || (record.reviewDate && record.reviewDate <= today));
    });
    const commentCount = entries.reduce((sum, { record }) => sum + (record.comments?.length || 0), 0);
    const dueReviews = entries.filter(({ record }) => record.reviewDate && record.reviewDate <= today).length;
    const exportMarkdown = () => {
        const content = ["# Meu Caderno IDER", "", ...filtered.flatMap(({ item, record }) => [`## ${item.title}`, `**${CATEGORY_NAMES[item.category]} · ${AREA_NAMES[item.areaPath] || item.areaPath}**`, record.tags?.length ? `Etiquetas: ${record.tags.join(", ")}` : "", record.connections?.length ? `Conexões: ${record.connections.join(", ")}` : "", record.reviewDate ? `Revisar em: ${record.reviewDate}` : "", record.highlight ? `> ${record.highlight}` : "", record.notes || "", ...(record.comments || []).map((entry) => `- ${new Date(entry.createdAt).toLocaleDateString("pt-BR")}: ${entry.text}`), ""])].filter((line) => line !== "").join("\n\n");
        const link = document.createElement("a");
        link.href = URL.createObjectURL(new Blob([content], { type: "text/markdown;charset=utf-8" }));
        link.download = "meu-caderno-ider.md";
        link.click();
        URL.revokeObjectURL(link.href);
    };

    return <main className="notebook-page">
        <nav className="notebook-breadcrumb"><button type="button" onClick={onBack}>← Meu IDER</button><span>Seu arquivo pessoal de conhecimento</span></nav>
        <header className="notebook-hero"><div><p>CONHECIMENTO EM CONSTRUÇÃO</p><h1>Meu Caderno</h1><span>Encontre, conecte e revise tudo o que você registrou durante seus estudos.</span></div><div className="notebook-summary"><strong>{entries.length}</strong><span>conteúdos anotados</span><strong>{commentCount}</strong><span>comentários</span><strong>{dueReviews}</strong><span>revisões pendentes</span></div></header>
        <section className="notebook-toolbar" aria-label="Filtros do caderno"><label className="notebook-search">Buscar em tudo<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Título, ideia, comentário ou etiqueta..."/></label><label>Tipo<select value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">Todos</option>{Object.entries(CATEGORY_NAMES).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><label>Etiqueta<select value={tag} onChange={(event) => setTag(event.target.value)}><option value="all">Todas</option>{tags.map((value) => <option value={value} key={value}>{value}</option>)}</select></label><label className="notebook-review-toggle"><input type="checkbox" checked={onlyReviews} onChange={(event) => setOnlyReviews(event.target.checked)}/> Revisar agora</label><div><button type="button" onClick={exportMarkdown}>Exportar Markdown</button><button type="button" onClick={() => window.print()}>Salvar em PDF</button></div></section>
        <div className="notebook-layout">
            <section className="notebook-results"><header><div><p>ARQUIVO</p><h2>Todas as anotações</h2></div><strong>{filtered.length}</strong></header>{filtered.map(({ item, record }) => <article className="notebook-card" key={`${item.areaPath}:${item.title}`}><div className="notebook-card-meta"><span>{CATEGORY_NAMES[item.category]}</span><small>{AREA_NAMES[item.areaPath] || item.areaPath}</small>{record.reviewDate && <time className={record.reviewDate <= today ? "due" : ""}>Revisão: {new Date(`${record.reviewDate}T12:00:00`).toLocaleDateString("pt-BR")}</time>}</div><h3>{item.title}</h3>{record.tags?.length > 0 && <div className="notebook-tags">{record.tags.map((value) => <button type="button" key={value} onClick={() => setTag(value)}>#{value}</button>)}</div>}{record.connections?.length > 0 && <small className="notebook-connections">Conectado a: {record.connections.join(" · ")}</small>}{record.highlight && <blockquote>{record.highlight}</blockquote>}{record.notes && <p>{record.notes}</p>}<footer><span>{record.comments?.length || 0} comentários</span><button type="button" onClick={() => onOpenItem(item)}>Abrir e editar →</button></footer></article>)}{!filtered.length && <p className="notebook-empty">Nenhuma anotação corresponde aos filtros.</p>}</section>
            <aside className="notebook-insights"><section><header><p>RELAÇÕES</p><h2>Mapa do conhecimento</h2></header><ConnectionMap entries={entries}/></section><section><header><p>ETIQUETAS</p><h2>Temas recorrentes</h2></header><div className="notebook-tag-cloud">{tags.map((value) => <button type="button" className={tag === value ? "active" : ""} key={value} onClick={() => setTag(tag === value ? "all" : value)}>#{value}</button>)}{!tags.length && <p className="notebook-empty">Nenhuma etiqueta criada.</p>}</div></section></aside>
        </div>
    </main>;
}

export default NotebookPage;
