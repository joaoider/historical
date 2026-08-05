import { useEffect, useMemo, useState } from "react";

import { RECOMMENDATIONS_BY_AREA } from "./KnowledgeAreaPage";
import { EXTRA_BOOKS } from "./KnowledgeRecommendationsPage";
import { FILMS } from "./PersonalArchivePage";
import { loadProgress, saveProgress } from "../services/progress";
import "./LibraryItemPage.css";
import "./LibraryItemNotebookFields.css";
import "./BookPdfReader.css";

const CATEGORY_CONFIG = {
    books: { label: "Livro", collection: "Meus livros", storage: "ider-reading-library", states: [{ id: "want", title: "Quero ler" }, { id: "reading", title: "Lendo" }, { id: "read", title: "Lido" }] },
    videos: { label: "YouTube", collection: "Minha YoutubeTeca", storage: "ider-video-library" },
    films: { label: "Filme ou documentário", collection: "Minha Videoteca", storage: "ider-film-library" },
    podcasts: { label: "Podcast", collection: "Meus podcasts", storage: "ider-podcast-library" },
    publications: { label: "Publicação", collection: "Revistas e newsletters", storage: "ider-publication-library" },
    places: { label: "Museu ou lugar", collection: "Minha MuseuTeca", storage: "ider-places-library", states: [{ id: "want", title: "Quero visitar" }, { id: "doing", title: "Planejando" }, { id: "done", title: "Já fui" }] },
};
const MEDIA_STATES = [{ id: "want", title: "Quero" }, { id: "doing", title: "Fazendo" }, { id: "done", title: "Feito" }];
const AREA_NAMES = { humanidades: "Humanidades", filosofia: "Filosofia", "filosofia/metafisica": "Metafísica", "filosofia/metafisica/tempo-e-espaco": "Tempo e Espaço" };
const NOTES_KEY = "ider-library-notes";

function BookPdfReader({ item }) {
    const [zoom, setZoom] = useState(100);
    const titleParts = item.title.split(/\s[—–-]\s/);
    return <section className="book-pdf-reader" aria-label={`Leitor de ${item.title}`}>
        <header><div><p>LEITOR DIGITAL</p><strong>{item.title}</strong></div><div className="pdf-reader-controls"><button type="button" onClick={() => setZoom((value) => Math.max(70, value - 10))} aria-label="Diminuir zoom">−</button><span>{zoom}%</span><button type="button" onClick={() => setZoom((value) => Math.min(160, value + 10))} aria-label="Aumentar zoom">+</button><i>Página 1</i></div></header>
        <div className="pdf-reader-viewport">
            {item.pdfUrl ? <iframe src={item.pdfUrl} title={`PDF de ${item.title}`}/> : <article className="pdf-placeholder-page" style={{ "--reader-zoom": zoom / 100 }}><small>BIBLIOTECA IDER</small><h2>{titleParts[0]}</h2>{titleParts.slice(1).length > 0 && <h3>{titleParts.slice(1).join(" — ")}</h3>}<span>{AREA_NAMES[item.areaPath] || item.areaPath}</span><div><b>PDF</b><p>O arquivo integral aparecerá neste espaço quando for vinculado ao acervo.</p></div></article>}
        </div>
        <footer><span>Visualização de leitura preparada</span><button type="button" disabled={!item.pdfUrl}>Abrir em tela cheia</button></footer>
    </section>;
}

function allLibraryItems() {
    const recommendations = Object.entries(RECOMMENDATIONS_BY_AREA).flatMap(([areaPath, areaRecommendations]) => [
        ...areaRecommendations.map((item) => ({ ...item, areaPath })),
        ...(EXTRA_BOOKS[areaPath] || []).map((item) => ({ ...item, areaPath, category: "books" })),
    ]);
    const keys = new Set(recommendations.map((item) => `${item.category}:${item.areaPath}:${item.title}`));
    return [...recommendations, ...FILMS.filter((item) => !keys.has(`films:${item.areaPath}:${item.title}`)).map((item) => ({ ...item, category: "films", source: item.type }))];
}

function LibraryItemPage({ itemRef, onBack }) {
    const item = useMemo(() => allLibraryItems().find((candidate) => candidate.category === itemRef?.category && candidate.areaPath === itemRef?.areaPath && candidate.title === itemRef?.title), [itemRef]);
    const config = CATEGORY_CONFIG[itemRef?.category] || CATEGORY_CONFIG.books;
    const states = config.states || MEDIA_STATES;
    const itemKey = item ? `${item.areaPath}:${item.title}` : "";
    const [notesLibrary, setNotesLibrary] = useState({});
    const [statusLibrary, setStatusLibrary] = useState({});
    const [notes, setNotes] = useState("");
    const [highlight, setHighlight] = useState("");
    const [tags, setTags] = useState("");
    const [connections, setConnections] = useState("");
    const [reviewDate, setReviewDate] = useState("");
    const [comment, setComment] = useState("");
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        loadProgress("library-notes", NOTES_KEY, {}).then((data) => {
            setNotesLibrary(data);
            setNotes(data[itemKey]?.notes || "");
            setHighlight(data[itemKey]?.highlight || "");
            setTags((data[itemKey]?.tags || []).join(", "));
            setConnections((data[itemKey]?.connections || []).join(", "));
            setReviewDate(data[itemKey]?.reviewDate || "");
        });
        loadProgress(`library-${itemRef?.category}`, config.storage, {}).then(setStatusLibrary);
    }, [config.storage, itemKey, itemRef?.category]);

    if (!item) return <main className="library-detail-page"><section className="library-detail-missing"><p>ITEM NÃO ENCONTRADO</p><h1>Este conteúdo não está mais disponível.</h1><button type="button" onClick={onBack}>Voltar ao Meu IDER</button></section></main>;

    const record = notesLibrary[itemKey] || { notes: "", comments: [], tags: [], connections: [] };
    const studyFields = () => ({ notes, highlight, tags: tags.split(",").map((value) => value.trim()).filter(Boolean), connections: connections.split(",").map((value) => value.trim()).filter(Boolean), reviewDate });
    const persistRecord = (nextRecord) => {
        const next = { ...notesLibrary, [itemKey]: nextRecord };
        setNotesLibrary(next);
        saveProgress("library-notes", NOTES_KEY, next);
    };
    const saveNotes = () => {
        persistRecord({ ...record, ...studyFields(), updatedAt: new Date().toISOString() });
        setSaved(true);
    };
    const addComment = (event) => {
        event.preventDefault();
        const text = comment.trim();
        if (!text) return;
        persistRecord({ ...record, ...studyFields(), comments: [...(record.comments || []), { id: `${Date.now()}`, text, createdAt: new Date().toISOString() }], updatedAt: new Date().toISOString() });
        setComment("");
        setSaved(true);
    };
    const editComment = (entry) => {
        const text = window.prompt("Edite seu comentário:", entry.text)?.trim();
        if (!text || text === entry.text) return;
        persistRecord({ ...record, ...studyFields(), comments: (record.comments || []).map((commentEntry) => commentEntry.id === entry.id ? { ...commentEntry, text, editedAt: new Date().toISOString() } : commentEntry), updatedAt: new Date().toISOString() });
    };
    const deleteComment = (entry) => {
        if (!window.confirm("Excluir este comentário do seu caderno?")) return;
        persistRecord({ ...record, ...studyFields(), comments: (record.comments || []).filter((commentEntry) => commentEntry.id !== entry.id), updatedAt: new Date().toISOString() });
    };
    const changeStatus = (status) => {
        const next = { ...statusLibrary, [itemKey]: status };
        setStatusLibrary(next);
        saveProgress(`library-${item.category}`, config.storage, next);
    };

    return <main className="library-detail-page">
        <nav className="library-detail-breadcrumb"><button type="button" onClick={onBack}>← Meu IDER</button><span>{config.collection} · {AREA_NAMES[item.areaPath] || item.areaPath}</span></nav>
        <header className="library-detail-hero"><div><p>{config.label.toUpperCase()} · ARQUIVO PESSOAL</p><h1>{item.title}</h1><span>{item.description || "Conteúdo salvo em sua biblioteca pessoal."}</span></div><aside><label>Meu progresso<select value={statusLibrary[itemKey] || "want"} onChange={(event) => changeStatus(event.target.value)}>{states.map((state) => <option value={state.id} key={state.id}>{state.title}</option>)}</select></label>{item.source && <small>Fonte: {item.source}</small>}{item.url && <a href={item.url} target="_blank" rel="noreferrer">Acessar conteúdo ↗</a>}</aside></header>
        <div className={`library-detail-workspace ${item.category === "books" ? "has-pdf-reader" : ""}`}>
            {item.category === "books" && <BookPdfReader item={item}/>} 
            <section className="library-notes-panel"><header><div><p>CADERNO</p><h2>Minhas anotações</h2></div>{record.updatedAt && <small>Salvo em {new Date(record.updatedAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</small>}</header><div className="library-study-fields"><label>Etiquetas<input value={tags} onChange={(event) => { setTags(event.target.value); setSaved(false); }} placeholder="Ex.: metafísica, revisar, ideia importante"/></label><label>Conectar com<input value={connections} onChange={(event) => { setConnections(event.target.value); setSaved(false); }} placeholder="Ex.: Platão, Aristóteles, Teologia Natural"/></label><label>Revisar em<input type="date" value={reviewDate} onChange={(event) => { setReviewDate(event.target.value); setSaved(false); }}/></label></div><label className="library-highlight-field">Trecho ou ideia em destaque<textarea value={highlight} onChange={(event) => { setHighlight(event.target.value); setSaved(false); }} placeholder="Guarde aqui a passagem ou ideia central deste conteúdo..."/></label><textarea className="library-main-notes" value={notes} onChange={(event) => { setNotes(event.target.value); setSaved(false); }} placeholder="Registre ideias, conceitos, dúvidas e relações com outros conteúdos..."/><button type="button" onClick={saveNotes}>{saved ? "Anotações salvas ✓" : "Salvar no Meu Caderno"}</button></section>
            <section className="library-comments-panel"><header><p>REFLEXÕES</p><h2>Meus comentários</h2><span>Guarde impressões pontuais ao longo do estudo.</span></header><form onSubmit={addComment}><textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Escreva um novo comentário..."/><button type="submit">Adicionar comentário</button></form><div className="library-comment-list">{[...(record.comments || [])].reverse().map((entry) => <article key={entry.id}><time>{new Date(entry.createdAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}{entry.editedAt ? " · editado" : ""}</time><p>{entry.text}</p><footer><button type="button" onClick={() => editComment(entry)}>Editar</button><button type="button" onClick={() => deleteComment(entry)}>Excluir</button></footer></article>)}{!record.comments?.length && <p className="library-comments-empty">Seus comentários aparecerão aqui.</p>}</div></section>
        </div>
    </main>;
}

export default LibraryItemPage;
