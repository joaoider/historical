import { DOMAINS, FOUNDATIONS, FOUNDATION_DETAILS, KNOWLEDGE_GROUPS } from "./KnowledgeMap";
import { appendKnowledgePath, knowledgeSlug } from "../utils/knowledgePaths";
import "./KnowledgeAreaPage.css";

function resolveArea(path) {
    const segments = path.split("/").filter(Boolean);
    const foundation = FOUNDATIONS.find((item) => knowledgeSlug(item.name) === segments[0]);
    if (foundation) {
        if (segments.length === 1) return { name: foundation.name, description: foundation.description, color: foundation.name === "Teologia" ? "#8a623a" : "#4f785f", children: foundation.areas.map((name) => ({ name, children: FOUNDATION_DETAILS[name] || [] })) };
        const area = foundation.areas.find((name) => knowledgeSlug(name) === segments[1]);
        if (!area) return null;
        if (segments.length === 2) return { name: area, description: `Subárea de ${foundation.name}.`, color: foundation.name === "Teologia" ? "#8a623a" : "#4f785f", children: (FOUNDATION_DETAILS[area] || []).map((name) => ({ name, children: [] })) };
        const detail = (FOUNDATION_DETAILS[area] || []).find((name) => knowledgeSlug(name) === segments[2]);
        return detail ? { name: detail, description: `${detail} integra o campo de ${area}, em ${foundation.name}.`, color: foundation.name === "Teologia" ? "#8a623a" : "#4f785f", children: [] } : null;
    }

    const group = KNOWLEDGE_GROUPS.find((item) => knowledgeSlug(item.name) === segments[0]);
    if (!group) return null;
    if (segments.length === 1) return { name: group.name, description: `Conjunto de disciplinas que integram ${group.name}.`, color: group.color, children: group.domains.map((name) => ({ name, children: DOMAINS.find((domain) => domain.name === name)?.branches.map((branch) => branch.name) || [] })) };
    const domain = DOMAINS.find((item) => group.domains.includes(item.name) && knowledgeSlug(item.name) === segments[1]);
    if (!domain) return null;
    if (segments.length === 2) return { name: domain.name, description: `Área pertencente a ${group.name}, organizada em ${domain.branches.length} grandes subdivisões.`, color: domain.color, children: domain.branches.map((branch) => ({ name: branch.name, children: branch.children })) };
    const branch = domain.branches.find((item) => knowledgeSlug(item.name) === segments[2]);
    if (!branch) return null;
    if (segments.length === 3) return { name: branch.name, description: `Subdivisão de ${domain.name}.`, color: domain.color, children: branch.children.map((name) => ({ name, children: [] })) };
    const leaf = branch.children.find((name) => knowledgeSlug(name) === segments[3]);
    return leaf ? { name: leaf, description: `${leaf} é uma especialidade vinculada a ${branch.name}, em ${domain.name}.`, color: domain.color, children: [] } : null;
}

function buildBreadcrumbs(path) {
    const segments = path.split("/").filter(Boolean); let current = "";
    return segments.map((segment) => { current = current ? `${current}/${segment}` : segment; const node = resolveArea(current); return { path: current, name: node?.name || segment }; });
}

function KnowledgeAreaPage({ areaPath, onOpenArea, onBack }) {
    const area = resolveArea(areaPath);
    if (!area) return <main className="knowledge-area-page"><div className="knowledge-area-empty"><h2>Área não encontrada</h2><button type="button" onClick={onBack}>Voltar à árvore</button></div></main>;
    const breadcrumbs = buildBreadcrumbs(areaPath);
    return <main className="knowledge-area-page" style={{ "--area-color": area.color }}>
        <nav className="knowledge-area-breadcrumb" aria-label="Caminho da área"><button type="button" onClick={onBack}>Árvore do Conhecimento</button>{breadcrumbs.map((item, index) => <span key={item.path}>› <button type="button" disabled={index === breadcrumbs.length - 1} onClick={() => onOpenArea(item.path)}>{item.name}</button></span>)}</nav>
        <header><p>RAMO DO CONHECIMENTO</p><h2>{area.name}</h2><span>{area.description}</span></header>
        {area.children.length > 0 ? <section className="knowledge-area-tree"><div className="knowledge-area-parent"><strong>{area.name}</strong></div><div className="knowledge-area-children">{area.children.map((child) => { const childPath = appendKnowledgePath(areaPath, child.name); return <article key={child.name}><button type="button" onClick={() => onOpenArea(childPath)}><strong>{child.name}</strong><span>{child.children.length ? `${child.children.length} subdivisões` : "Abrir área"}</span></button>{child.children.length > 0 && <ul>{child.children.map((name) => <li key={name}><button type="button" onClick={() => onOpenArea(appendKnowledgePath(childPath, name))}>{name}</button></li>)}</ul>}</article>; })}</div></section> : <section className="knowledge-area-leaf"><span>ÁREA ESPECIALIZADA</span><h3>{area.name}</h3><p>Este é o último nível de detalhamento atualmente registrado na Árvore do Conhecimento.</p></section>}
        <footer><button type="button" onClick={onBack}>← Voltar à árvore completa</button></footer>
    </main>;
}

export default KnowledgeAreaPage;
