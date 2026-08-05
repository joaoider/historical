import { useEffect, useMemo, useState } from "react";

import { RECOMMENDATIONS_BY_AREA } from "./KnowledgeAreaPage";
import { EXTRA_BOOKS } from "./KnowledgeRecommendationsPage";
import { loadProgress, saveProgress } from "../services/progress";
import "./PersonalLibraryPage.css";
import "./BookCoverPreview.css";
import "./LibraryDragDrop.css";

const SHELVES = [
    { id: "reading", title: "Lendo agora", subtitle: "Livros abertos e em andamento" },
    { id: "want", title: "Próximas leituras", subtitle: "Livros que esperam sua vez" },
    { id: "read", title: "Livros lidos", subtitle: "O acervo que você já percorreu" },
];
const COLORS = ["#315c4a", "#74463d", "#4f4d72", "#94713e", "#35556b", "#7b5947", "#5d633b", "#603f58"];
const AREA_NAMES = { humanidades: "Humanidades", filosofia: "Filosofia", "filosofia/metafisica": "Metafísica", "filosofia/metafisica/tempo-e-espaco": "Tempo e Espaço" };

function booksCatalog() {
    return Object.entries(RECOMMENDATIONS_BY_AREA).flatMap(([areaPath, recommendations]) => [
        ...recommendations.filter((item) => item.category === "books").map((item) => ({ ...item, areaPath })),
        ...(EXTRA_BOOKS[areaPath] || []).map((item) => ({ ...item, areaPath, category: "books" })),
    ]);
}

function bookStyle(book) {
    const hash = [...`${book.areaPath}:${book.title}`].reduce((sum, character) => sum + character.charCodeAt(0), 0);
    return { "--book-color": COLORS[hash % COLORS.length], "--book-height": `${168 + (hash % 39)}px`, "--book-width": `${46 + (hash % 18)}px` };
}

function splitTitle(value) {
    const [title, ...author] = value.split(/\s[—–-]\s/);
    return { title, author: author.join(" — ") };
}

function PersonalLibraryPage({ onBack, onOpenBook }) {
    const [statuses, setStatuses] = useState({});
    const [bookOrder, setBookOrder] = useState({});
    const [query, setQuery] = useState("");
    const [draggedBookKey, setDraggedBookKey] = useState("");
    const [dropShelf, setDropShelf] = useState("");
    const [bookDropTarget, setBookDropTarget] = useState(null);
    const [movementMessage, setMovementMessage] = useState("");
    const books = useMemo(() => booksCatalog(), []);
    useEffect(() => {
        loadProgress("library-books", "ider-reading-library", {}).then(setStatuses);
        loadProgress("library-book-order", "ider-library-book-order", {}).then(setBookOrder);
    }, []);
    const statusFor = (book) => statuses[`${book.areaPath}:${book.title}`] || "want";
    const visibleBooks = books.filter((book) => [book.title, book.description, AREA_NAMES[book.areaPath] || book.areaPath].join(" ").toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR")));
    const booksOnShelf = (shelfId) => {
        const matches = visibleBooks.filter((book) => statusFor(book) === shelfId);
        const order = bookOrder[shelfId] || [];
        return [...matches].sort((first, second) => {
            const firstIndex = order.indexOf(`${first.areaPath}:${first.title}`);
            const secondIndex = order.indexOf(`${second.areaPath}:${second.title}`);
            if (firstIndex < 0 && secondIndex < 0) return 0;
            if (firstIndex < 0) return 1;
            if (secondIndex < 0) return -1;
            return firstIndex - secondIndex;
        });
    };
    const saveBookOrder = (next) => { setBookOrder(next); saveProgress("library-book-order", "ider-library-book-order", next); };
    const placeBook = (bookKey, shelfId, targetKey = "", after = false) => {
        const currentOrder = Object.fromEntries(SHELVES.map((shelf) => [shelf.id, (bookOrder[shelf.id] || booksOnShelf(shelf.id).map((book) => `${book.areaPath}:${book.title}`)).filter((key) => key !== bookKey)]));
        const targetOrder = currentOrder[shelfId];
        const targetIndex = targetKey ? targetOrder.indexOf(targetKey) : targetOrder.length;
        targetOrder.splice(targetIndex < 0 ? targetOrder.length : targetIndex + (after ? 1 : 0), 0, bookKey);
        saveBookOrder(currentOrder);
    };
    const moveBook = (bookKey, status) => {
        const book = books.find((item) => `${item.areaPath}:${item.title}` === bookKey);
        if (!book || statusFor(book) === status) return;
        const next = { ...statuses, [bookKey]: status };
        setStatuses(next);
        saveProgress("library-books", "ider-reading-library", next);
        setMovementMessage(`${book.title} foi movido para ${SHELVES.find((shelf) => shelf.id === status)?.title}.`);
    };
    const dropBook = (event, status) => {
        event.preventDefault();
        const bookKey = event.dataTransfer.getData("text/plain") || draggedBookKey;
        moveBook(bookKey, status);
        placeBook(bookKey, status);
        setDraggedBookKey("");
        setDropShelf("");
        setBookDropTarget(null);
    };
    const dropBesideBook = (event, shelfId, targetKey, after) => {
        event.preventDefault();
        event.stopPropagation();
        const bookKey = event.dataTransfer.getData("text/plain") || draggedBookKey;
        if (!bookKey || bookKey === targetKey) return;
        const book = books.find((item) => `${item.areaPath}:${item.title}` === bookKey);
        const changedShelf = book && statusFor(book) !== shelfId;
        if (changedShelf) moveBook(bookKey, shelfId);
        placeBook(bookKey, shelfId, targetKey, after);
        const movedBook = books.find((item) => `${item.areaPath}:${item.title}` === bookKey);
        if (!changedShelf && movedBook) setMovementMessage(`${movedBook.title} mudou de posição em ${SHELVES.find((shelf) => shelf.id === shelfId)?.title}.`);
        setDraggedBookKey("");
        setDropShelf("");
        setBookDropTarget(null);
    };

    return <main className="personal-library-page">
        <nav className="personal-library-breadcrumb"><button type="button" onClick={onBack}>← Meu IDER</button><span>Seu acervo pessoal</span></nav>
        <header className="personal-library-hero"><div><p>BIBLIOTECA PARTICULAR</p><h1>Minha Biblioteca</h1><span>Uma casa para os livros que acompanham sua jornada pelo conhecimento.</span></div><aside><strong>{books.length}</strong><span>livros no acervo</span><small>{books.filter((book) => statusFor(book) === "read").length} leituras concluídas</small></aside></header>
        <p className="library-movement-message" aria-live="polite">{movementMessage}</p>
        <section className={`library-room ${draggedBookKey ? "is-rearranging" : ""}`} aria-label="Estante da Minha Biblioteca">
            <div className="library-room-light" aria-hidden="true"/>
            <header className="library-room-toolbar"><div><span>ESTANTE PRINCIPAL</span><strong>Escolha um livro pela lombada</strong></div><label>Buscar livro<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Título, autor ou assunto..."/></label></header>
            <div className="wooden-bookcase">
                {SHELVES.map((shelf) => { const shelfBooks = booksOnShelf(shelf.id); return <section className={`wooden-shelf ${dropShelf === shelf.id ? "is-drop-target" : ""}`} key={shelf.id} onDragEnter={() => setDropShelf(shelf.id)} onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; setDropShelf(shelf.id); }} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) { setDropShelf(""); setBookDropTarget(null); } }} onDrop={(event) => dropBook(event, shelf.id)}><header><div><h2>{shelf.title}</h2><span>{draggedBookKey ? "Posicione entre os livros e solte" : shelf.subtitle}</span></div><b>{shelfBooks.length}</b></header><div className="shelf-books">{shelfBooks.map((book) => { const parts = splitTitle(book.title); const bookKey = `${book.areaPath}:${book.title}`; const marker = bookDropTarget?.key === bookKey ? `is-insert-${bookDropTarget.side}` : ""; return <button type="button" draggable="true" className={`book-spine ${draggedBookKey === bookKey ? "is-dragging" : ""} ${marker}`} style={bookStyle(book)} key={bookKey} onClick={() => onOpenBook(book)} onDragStart={(event) => { event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", bookKey); setDraggedBookKey(bookKey); setMovementMessage(""); }} onDragOver={(event) => { event.preventDefault(); event.stopPropagation(); if (draggedBookKey === bookKey) return; const bounds = event.currentTarget.getBoundingClientRect(); const side = event.clientX < bounds.left + bounds.width / 2 ? "before" : "after"; setBookDropTarget({ key: bookKey, side, shelf: shelf.id }); setDropShelf(shelf.id); }} onDrop={(event) => { const bounds = event.currentTarget.getBoundingClientRect(); dropBesideBook(event, shelf.id, bookKey, event.clientX >= bounds.left + bounds.width / 2); }} onDragEnd={() => { setDraggedBookKey(""); setDropShelf(""); setBookDropTarget(null); }} aria-label={`Abrir ou arrastar ${book.title}`}><span className="book-spine-ridge"/><span className="book-spine-title">{parts.title}</span>{parts.author && <small>{parts.author}</small>}<i>{AREA_NAMES[book.areaPath] || book.areaPath}</i><span className="book-cover-preview" aria-hidden="true"><span className="book-cover-mark">IDER</span><strong>{parts.title}</strong>{parts.author && <small>{parts.author}</small>}<span className="book-cover-area">{AREA_NAMES[book.areaPath] || book.areaPath}</span><b>Ver detalhes →</b></span></button>; })}{!shelfBooks.length && <p>{draggedBookKey ? "Solte o livro aqui." : query ? "Nenhum livro encontrado nesta prateleira." : "Esta prateleira ainda está vazia."}</p>}</div><div className="shelf-board" aria-hidden="true"/></section>; })}
            </div>
            <footer className="library-room-footer"><span aria-hidden="true">☕</span><p>Arraste os livros entre as prateleiras para atualizar seu progresso em todo o IDER.</p><span aria-hidden="true">⌁</span></footer>
        </section>
    </main>;
}

export default PersonalLibraryPage;
