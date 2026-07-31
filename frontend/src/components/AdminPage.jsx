import { useEffect, useMemo, useState } from "react";

import api from "../services/api";
import "./AdminPage.css";

const EMPTY = { name: "", entity_type: "person", track: "", start_year: "", end_year: "", origin_country: "", image_url: "", description: "", notable_works: "", key_ideas: "", legacy: "", latitude: "", longitude: "" };

function normalizeForm(form) {
    const nullableNumber = (value) => value === "" ? null : Number(value);
    return { ...form, start_year: nullableNumber(form.start_year), end_year: nullableNumber(form.end_year), latitude: nullableNumber(form.latitude), longitude: nullableNumber(form.longitude), track: form.track || null };
}

function AdminPage() {
    const [entities, setEntities] = useState([]);
    const [form, setForm] = useState(EMPTY);
    const [editingId, setEditingId] = useState(null);
    const [query, setQuery] = useState("");
    const [status, setStatus] = useState("");
    const [relation, setRelation] = useState({ source_entity_id: "", target_entity_id: "", relationship_type: "influenciou" });

    const reload = () => api.get("/entities").then((response) => setEntities(response.data.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))));
    useEffect(() => { reload().catch(() => setStatus("Não foi possível carregar o acervo.")); }, []);
    const filtered = useMemo(() => entities.filter((entity) => entity.name.toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR"))).slice(0, 80), [entities, query]);

    const edit = (entity) => {
        setEditingId(entity.id);
        setForm(Object.fromEntries(Object.keys(EMPTY).map((key) => [key, entity[key] ?? ""])));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };
    const reset = () => { setEditingId(null); setForm(EMPTY); };
    const submit = async (event) => {
        event.preventDefault(); setStatus("Salvando...");
        try {
            if (editingId) await api.put(`/entities/${editingId}`, normalizeForm(form));
            else await api.post("/entities", normalizeForm(form));
            await reload(); reset(); setStatus("Conteúdo salvo com sucesso.");
        } catch { setStatus("Não foi possível salvar. Confira os campos e a API."); }
    };
    const remove = async (entity) => {
        if (!window.confirm(`Excluir definitivamente “${entity.name}” e suas relações?`)) return;
        await api.delete(`/entities/${entity.id}`); await reload(); if (editingId === entity.id) reset();
    };
    const createRelation = async (event) => {
        event.preventDefault();
        try { await api.post("/relationships", { ...relation, source_entity_id: Number(relation.source_entity_id), target_entity_id: Number(relation.target_entity_id) }); setStatus("Relação criada."); }
        catch { setStatus("Não foi possível criar a relação."); }
    };

    return (
        <main className="admin-page">
            <header><p>FERRAMENTA LOCAL</p><h2>Painel administrativo</h2><span>Cadastre, revise e relacione conteúdos. Antes de publicar, esta área deverá receber autenticação.</span></header>
            {status && <div className="admin-status" role="status">{status}</div>}
            <section className="admin-editor">
                <h3>{editingId ? `Editando #${editingId}` : "Novo conteúdo"}</h3>
                <form onSubmit={submit}>
                    {Object.keys(EMPTY).map((field) => {
                        const long = ["description", "notable_works", "key_ideas", "legacy"].includes(field);
                        const numeric = ["start_year", "end_year", "latitude", "longitude"].includes(field);
                        return <label className={long ? "wide" : ""} key={field}><span>{field.replaceAll("_", " ")}</span>{long ? <textarea rows="4" value={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })} /> : <input required={["name", "entity_type"].includes(field)} type={numeric ? "number" : "text"} step={["latitude", "longitude"].includes(field) ? "any" : undefined} value={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })} />}</label>;
                    })}
                    <div className="admin-form-actions"><button type="submit">{editingId ? "Salvar alterações" : "Criar conteúdo"}</button>{editingId && <button type="button" onClick={reset}>Cancelar</button>}</div>
                </form>
            </section>
            <section className="admin-relation">
                <h3>Nova relação</h3>
                <form onSubmit={createRelation}>
                    <select required value={relation.source_entity_id} onChange={(event) => setRelation({ ...relation, source_entity_id: event.target.value })}><option value="">Origem</option>{entities.map((entity) => <option value={entity.id} key={entity.id}>{entity.name}</option>)}</select>
                    <input required value={relation.relationship_type} onChange={(event) => setRelation({ ...relation, relationship_type: event.target.value })} aria-label="Tipo de relação" />
                    <select required value={relation.target_entity_id} onChange={(event) => setRelation({ ...relation, target_entity_id: event.target.value })}><option value="">Destino</option>{entities.map((entity) => <option value={entity.id} key={entity.id}>{entity.name}</option>)}</select>
                    <button type="submit">Criar relação</button>
                </form>
            </section>
            <section className="admin-list"><div><h3>Acervo ({entities.length})</h3><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Localizar conteúdo" /></div>{filtered.map((entity) => <article key={entity.id}><span><strong>{entity.name}</strong><small>{entity.track || entity.entity_type}</small></span><button type="button" onClick={() => edit(entity)}>Editar</button><button type="button" className="danger" onClick={() => remove(entity)}>Excluir</button></article>)}</section>
        </main>
    );
}

export default AdminPage;
