import { useState } from "react";

import { appendKnowledgePath, knowledgeSlug } from "../utils/knowledgePaths";
import "./KnowledgeMap.css";


const FOUNDATIONS = [
    {
        name: "Teologia",
        description: "Investigação sistemática do divino, da revelação, da fé e das tradições religiosas.",
        areas: ["Teologia bíblica", "Teologia sistemática", "Teologia histórica", "Teologia moral", "Teologia prática", "Teologia natural", "Teologia comparada", "Estudos religiosos"],
    },
    {
        name: "Filosofia",
        description: "Investigação racional dos fundamentos da realidade, do conhecimento, da ação e do valor.",
        areas: ["Metafísica", "Epistemologia", "Lógica", "Ética", "Estética", "Filosofia política", "Filosofia da linguagem", "Filosofia da mente", "Filosofia da ciência", "Filosofia do direito", "Filosofia da religião"],
    },
];

const FOUNDATION_DETAILS = {
    "Teologia bíblica": ["Antigo Testamento", "Novo Testamento", "Exegese", "Hermenêutica", "Línguas bíblicas"],
    "Teologia sistemática": ["Teologia própria", "Cristologia", "Pneumatologia", "Antropologia teológica", "Hamartiologia", "Soteriologia", "Eclesiologia", "Escatologia", "Angelologia"],
    "Teologia histórica": ["Patrística", "Medieval", "Reforma", "Moderna", "Contemporânea"],
    "Teologia moral": ["Ética fundamental", "Bioética", "Ética social", "Doutrina social"],
    "Teologia prática": ["Teologia pastoral", "Homilética", "Liturgia", "Missiologia", "Aconselhamento"],
    "Teologia natural": ["Existência de Deus", "Atributos divinos", "Fé e razão", "Problema do mal"],
    "Teologia comparada": ["Cristianismo", "Judaísmo", "Islamismo", "Religiões asiáticas", "Diálogo inter-religioso"],
    "Estudos religiosos": ["História das religiões", "Sociologia da religião", "Antropologia da religião", "Psicologia da religião", "Fenomenologia da religião"],
    "Metafísica": ["Ontologia", "Causalidade", "Identidade", "Tempo e espaço", "Modalidade"],
    "Epistemologia": ["Fontes do conhecimento", "Justificação", "Ceticismo", "Epistemologia social", "Epistemologia formal"],
    "Lógica": ["Lógica proposicional", "Lógica de predicados", "Lógicas modais", "Lógicas não clássicas", "Teoria da argumentação"],
    "Ética": ["Metaética", "Ética normativa", "Ética aplicada", "Ética das virtudes", "Ética ambiental"],
    "Estética": ["Filosofia da arte", "Teoria do belo", "Experiência estética", "Crítica de arte"],
    "Filosofia política": ["Justiça", "Estado", "Liberdade", "Democracia", "Poder"],
    "Filosofia da linguagem": ["Significado", "Referência", "Pragmática", "Atos de fala", "Semântica filosófica"],
    "Filosofia da mente": ["Consciência", "Intencionalidade", "Identidade pessoal", "Mente e corpo", "Cognição"],
    "Filosofia da ciência": ["Método científico", "Explicação", "Realismo científico", "Confirmação", "Ciências especiais"],
    "Filosofia do direito": ["Natureza do direito", "Positivismo jurídico", "Direito natural", "Justiça", "Responsabilidade"],
    "Filosofia da religião": ["Conceito de Deus", "Argumentos teístas", "Problema do mal", "Experiência religiosa", "Pluralismo religioso"],
};

const DOMAINS = [
    {
        name: "Matemática", color: "#a05a35", branches: [
            { name: "Fundamentos", children: ["Lógica matemática", "Teoria dos conjuntos", "Teoria das categorias", "Filosofia da matemática"] },
            { name: "Álgebra", children: ["Álgebra linear", "Álgebra abstrata", "Teoria de grupos", "Teoria de anéis", "Teoria de corpos"] },
            { name: "Geometria", children: ["Euclidiana", "Analítica", "Diferencial", "Algébrica", "Não euclidiana", "Fractal"] },
            { name: "Cálculo e análise", children: ["Cálculo diferencial", "Cálculo integral", "Equações diferenciais", "Análise real", "Análise complexa", "Análise funcional"] },
            { name: "Estruturas discretas", children: ["Combinatória", "Teoria dos grafos", "Teoria dos números", "Matemática discreta"] },
            { name: "Matemática aplicada", children: ["Otimização", "Sistemas dinâmicos", "Análise numérica", "Pesquisa operacional", "Modelagem matemática"] },
            { name: "Estatística", children: ["Probabilidade", "Processos estocásticos", "Inferência", "Inferência bayesiana", "Inferência causal", "Regressão", "Séries temporais", "Análise multivariada", "Planejamento experimental", "Amostragem", "Bioestatística", "Econometria", "Psicometria", "Ciência de dados"] },
        ],
    },
    {
        name: "Física", color: "#356f9e", branches: [
            { name: "Física clássica", children: ["Mecânica", "Estática", "Dinâmica", "Mecânica dos fluidos", "Termodinâmica", "Acústica"] },
            { name: "Eletromagnetismo", children: ["Eletrostática", "Eletrodinâmica", "Magnetismo", "Óptica", "Fotônica"] },
            { name: "Relatividade", children: ["Relatividade especial", "Relatividade geral", "Gravitação", "Ondas gravitacionais"] },
            { name: "Física quântica", children: ["Mecânica quântica", "Teoria quântica de campos", "Informação quântica", "Óptica quântica"] },
            { name: "Matéria e partículas", children: ["Física atômica", "Física molecular", "Física nuclear", "Partículas", "Matéria condensada", "Plasma"] },
            { name: "Campos interdisciplinares", children: ["Astrofísica", "Biofísica", "Geofísica", "Física médica", "Física computacional"] },
        ],
    },
    {
        name: "Química", color: "#8d6535", branches: [
            { name: "Química orgânica", children: ["Síntese orgânica", "Polímeros", "Produtos naturais", "Química medicinal"] },
            { name: "Química inorgânica", children: ["Coordenação", "Organometálica", "Estado sólido", "Bioinorgânica"] },
            { name: "Físico-química", children: ["Termoquímica", "Cinética", "Eletroquímica", "Química quântica", "Espectroscopia"] },
            { name: "Química analítica", children: ["Análise instrumental", "Cromatografia", "Espectrometria", "Quimiometria"] },
            { name: "Campos aplicados", children: ["Bioquímica", "Materiais", "Química ambiental", "Química nuclear", "Química industrial"] },
        ],
    },
    {
        name: "Biologia", color: "#39805b", branches: [
            { name: "Biologia celular e molecular", children: ["Citologia", "Biologia molecular", "Bioquímica", "Genômica", "Proteômica"] },
            { name: "Genética", children: ["Genética clássica", "Genética molecular", "Genética de populações", "Epigenética"] },
            { name: "Organismos", children: ["Botânica", "Zoologia", "Microbiologia", "Micologia", "Parasitologia"] },
            { name: "Estrutura e função", children: ["Anatomia", "Fisiologia", "Embriologia", "Biologia do desenvolvimento", "Neurobiologia"] },
            { name: "Evolução e ambiente", children: ["Biologia evolutiva", "Ecologia", "Etologia", "Biogeografia", "Conservação"] },
            { name: "Biologia aplicada", children: ["Biotecnologia", "Bioinformática", "Biologia sintética", "Biologia marinha"] },
        ],
    },
    {
        name: "Terra e Espaço", color: "#537b73", branches: [
            { name: "Ciências da Terra", children: ["Geologia", "Geofísica", "Geoquímica", "Paleontologia", "Mineralogia", "Vulcanologia", "Sismologia"] },
            { name: "Geografia física", children: ["Geomorfologia", "Climatologia", "Hidrologia", "Glaciologia", "Biogeografia"] },
            { name: "Atmosfera e oceanos", children: ["Meteorologia", "Ciência climática", "Oceanografia física", "Oceanografia química", "Oceanografia biológica"] },
            { name: "Astronomia", children: ["Astronomia observacional", "Astrometria", "Ciência planetária", "Astronomia estelar", "Astronomia galáctica"] },
            { name: "Cosmologia", children: ["Universo primordial", "Estrutura em grande escala", "Matéria escura", "Energia escura"] },
        ],
    },
    {
        name: "Computação", color: "#317b86", branches: [
            { name: "Fundamentos", children: ["Teoria da computação", "Linguagens formais", "Complexidade", "Algoritmos", "Criptografia"] },
            { name: "Sistemas", children: ["Arquitetura de computadores", "Sistemas operacionais", "Redes", "Sistemas distribuídos", "Computação em nuvem"] },
            { name: "Software e dados", children: ["Engenharia de software", "Linguagens de programação", "Bancos de dados", "Compiladores", "Ciência de dados"] },
            { name: "Inteligência artificial", children: ["Aprendizado de máquina", "Aprendizado profundo", "Processamento de linguagem", "Visão computacional", "Robótica"] },
            { name: "Interação e mídia", children: ["Interação humano-computador", "Computação gráfica", "Realidade virtual", "Visualização de dados"] },
            { name: "Novas fronteiras", children: ["Computação quântica", "Computação ubíqua", "Computação bioinspirada", "Segurança cibernética"] },
        ],
    },
    {
        name: "Engenharia", color: "#b06b2e", branches: [
            { name: "Engenharia civil", children: ["Estruturas", "Geotécnica", "Transportes", "Hidráulica", "Construção"] },
            { name: "Engenharia mecânica", children: ["Mecânica aplicada", "Termofluidos", "Manufatura", "Mecatrônica"] },
            { name: "Engenharia elétrica", children: ["Eletrônica", "Potência", "Telecomunicações", "Controle e automação"] },
            { name: "Engenharia química", children: ["Processos", "Reatores", "Bioprocessos", "Petróleo e gás"] },
            { name: "Engenharias especializadas", children: ["Aeroespacial", "Computação", "Materiais", "Produção", "Ambiental", "Biomédica", "Nuclear"] },
        ],
    },
    {
        name: "Medicina e Saúde", color: "#a44952", branches: [
            { name: "Ciências básicas", children: ["Anatomia", "Fisiologia", "Patologia", "Farmacologia", "Imunologia", "Microbiologia médica"] },
            { name: "Medicina clínica", children: ["Clínica médica", "Pediatria", "Geriatria", "Psiquiatria", "Neurologia", "Dermatologia"] },
            { name: "Especialidades cirúrgicas", children: ["Cirurgia geral", "Ortopedia", "Neurocirurgia", "Cardiovascular", "Oftalmologia"] },
            { name: "Diagnóstico e terapias", children: ["Radiologia", "Patologia clínica", "Oncologia", "Medicina nuclear", "Fisioterapia"] },
            { name: "Saúde coletiva", children: ["Epidemiologia", "Saúde pública", "Medicina preventiva", "Saúde ambiental", "Políticas de saúde"] },
            { name: "Outras profissões", children: ["Enfermagem", "Odontologia", "Nutrição", "Farmácia", "Terapia ocupacional"] },
        ],
    },
    {
        name: "Direito", color: "#725c91", branches: [
            { name: "Direito público", children: ["Constitucional", "Administrativo", "Penal", "Tributário", "Eleitoral"] },
            { name: "Direito privado", children: ["Civil", "Empresarial", "Contratual", "Família", "Sucessões"] },
            { name: "Direito social", children: ["Trabalho", "Previdenciário", "Consumidor", "Direitos humanos"] },
            { name: "Direito internacional", children: ["Público", "Privado", "Humanitário", "Comércio internacional"] },
            { name: "Processo e aplicação", children: ["Processo civil", "Processo penal", "Arbitragem", "Mediação", "Criminologia"] },
            { name: "Novos campos", children: ["Ambiental", "Digital", "Proteção de dados", "Bioética", "Propriedade intelectual"] },
        ],
    },
    {
        name: "Sociologia", color: "#9a5364", branches: [
            { name: "Teoria social", children: ["Teoria clássica", "Teoria crítica", "Funcionalismo", "Interacionismo", "Pós-estruturalismo"] },
            { name: "Estruturas sociais", children: ["Classes", "Raça e etnicidade", "Gênero", "Família", "Religião", "Educação"] },
            { name: "Instituições e poder", children: ["Sociologia política", "Econômica", "Direito", "Organizações", "Trabalho"] },
            { name: "Espaço e população", children: ["Sociologia urbana", "Rural", "Demografia", "Migrações", "Desenvolvimento"] },
            { name: "Cultura e contemporaneidade", children: ["Cultura", "Comunicação", "Ciência e tecnologia", "Sociologia digital", "Movimentos sociais"] },
        ],
    },
    {
        name: "Psicologia", color: "#657b9b", branches: [
            { name: "Fundamentos", children: ["Psicologia cognitiva", "Comportamental", "Psicodinâmica", "Humanista", "Evolucionista"] },
            { name: "Desenvolvimento e sociedade", children: ["Desenvolvimento", "Social", "Personalidade", "Cultural", "Psicologia comunitária"] },
            { name: "Bases biológicas", children: ["Neuropsicologia", "Psicofisiologia", "Neurociência cognitiva", "Psicofarmacologia"] },
            { name: "Aplicações", children: ["Clínica", "Escolar", "Organizacional", "Esporte", "Jurídica", "Saúde"] },
            { name: "Métodos", children: ["Psicometria", "Psicologia experimental", "Avaliação psicológica", "Métodos qualitativos"] },
        ],
    },
    {
        name: "Economia", color: "#71813d", branches: [
            { name: "Teoria econômica", children: ["Microeconomia", "Macroeconomia", "Economia política", "História do pensamento econômico"] },
            { name: "Métodos", children: ["Econometria", "Economia matemática", "Economia experimental", "Teoria dos jogos"] },
            { name: "Economia pública e social", children: ["Setor público", "Saúde", "Educação", "Trabalho", "Desigualdade"] },
            { name: "Mercados e organizações", children: ["Finanças", "Industrial", "Empresas", "Inovação", "Comportamental"] },
            { name: "Escala global", children: ["Internacional", "Desenvolvimento", "Ambiental", "Recursos naturais", "Economia regional"] },
        ],
    },
    {
        name: "História e Humanidades", color: "#84654d", branches: [
            { name: "História por períodos", children: ["Antiga", "Medieval", "Moderna", "Contemporânea", "Tempo presente"] },
            { name: "Campos históricos", children: ["Política", "Econômica", "Social", "Cultural", "Global", "Ciência", "Arte", "Religiões"] },
            { name: "Linguagem", children: ["Linguística", "Filologia", "Semiótica", "Tradução", "Análise do discurso"] },
            { name: "Literatura", children: ["Teoria literária", "Literatura comparada", "Crítica textual", "Narratologia", "Estudos pós-coloniais"] },
            { name: "Artes", children: ["Artes visuais", "Música", "Teatro", "Dança", "Cinema", "Arquitetura", "Design"] },
            { name: "Patrimônio e cultura", children: ["Arqueologia", "Museologia", "Arquivologia", "Estudos culturais", "Antropologia cultural"] },
        ],
    },
    {
        name: "Educação", color: "#a47743", branches: [
            { name: "Fundamentos", children: ["Filosofia da educação", "História da educação", "Sociologia da educação", "Psicologia educacional"] },
            { name: "Ensino e currículo", children: ["Didática", "Currículo", "Avaliação", "Formação docente", "Tecnologia educacional"] },
            { name: "Modalidades", children: ["Educação infantil", "Básica", "Superior", "Profissional", "Educação de adultos"] },
            { name: "Inclusão e diversidade", children: ["Educação especial", "Educação inclusiva", "Intercultural", "Educação do campo"] },
            { name: "Gestão e políticas", children: ["Gestão escolar", "Políticas educacionais", "Planejamento", "Educação comparada"] },
        ],
    },
];

const KNOWLEDGE_GROUPS = [
    { name: "Ciências Formais", color: "#725c91", domains: ["Matemática", "Computação"] },
    { name: "Ciências Naturais", color: "#39805b", domains: ["Física", "Química", "Biologia", "Terra e Espaço"] },
    { name: "Ciências Aplicadas", color: "#b06b2e", domains: ["Engenharia", "Medicina e Saúde"] },
    { name: "Ciências Sociais", color: "#9a5364", domains: ["Sociologia", "Psicologia", "Economia", "Direito", "Educação"] },
    { name: "Humanidades", color: "#84654d", domains: ["História e Humanidades"] },
];


function KnowledgeMapLegacy() {
    return (
        <section className="knowledge-map-view" aria-labelledby="knowledge-map-title">
            <header className="knowledge-map-intro">
                <p>UMA CARTOGRAFIA DAS DISCIPLINAS</p>
                <h2 id="knowledge-map-title">Árvore do conhecimento</h2>
                <span>Mapa conceitual abrangente; áreas interdisciplinares podem pertencer a mais de um ramo.</span>
            </header>

            <div className="knowledge-foundation-trunk">
                {FOUNDATIONS.map((foundation) => (
                    <article className="knowledge-foundation-family" key={foundation.name}>
                        <div className="knowledge-foundation-node">
                            <h3>{foundation.name}</h3>
                            <p>{foundation.description}</p>
                        </div>
                        <div className="knowledge-foundation-children" aria-label={`Subareas de ${foundation.name}`}>
                            {foundation.areas.map((area) => <span key={area}>{area}</span>)}
                        </div>
                    </article>
                ))}
            </div>

            <div className="knowledge-domain-bridge"><span>Grandes áreas e suas subdivisões</span></div>

            <div className="knowledge-domains-grid">
                {DOMAINS.map((domain) => (
                    <article className="knowledge-domain" style={{ "--domain-color": domain.color }} key={domain.name}>
                        <h3>{domain.name}</h3>
                        <div className="knowledge-domain-branches">
                            {domain.branches.map((branch) => (
                                <section key={branch.name}>
                                    <h4>{branch.name}</h4>
                                    <ul>{branch.children.map((child) => <li key={child}>{child}</li>)}</ul>
                                </section>
                            ))}
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}


function KnowledgeMap({ onOpenArea }) {
    const [expandedDomains, setExpandedDomains] = useState(new Set(DOMAINS.map((domain) => domain.name)));
    const [foundationsExpanded, setFoundationsExpanded] = useState(true);
    const allExpanded = foundationsExpanded && expandedDomains.size === DOMAINS.length;
    const allCollapsed = !foundationsExpanded && expandedDomains.size === 0;

    const toggleDomain = (name) => setExpandedDomains((current) => {
        const next = new Set(current);
        if (next.has(name)) next.delete(name); else next.add(name);
        return next;
    });

    return (
        <section className="knowledge-map-view" aria-labelledby="knowledge-map-title">
            <header className="knowledge-map-intro">
                <p>UMA CARTOGRAFIA DAS DISCIPLINAS</p>
                <h2 id="knowledge-map-title">Árvore do conhecimento</h2>
                <span>Teologia, Filosofia e as gerações sucessivas das áreas do conhecimento.</span>
            </header>

            <div className="knowledge-genealogy-scroll">
                <div className="knowledge-genealogy">
                    <div className={`knowledge-root-lineage ${foundationsExpanded ? "expanded" : ""}`}>
                        <article className="knowledge-root-node knowledge-theology">
                            <h3><button type="button" onClick={() => onOpenArea(knowledgeSlug(FOUNDATIONS[0].name))}>{FOUNDATIONS[0].name}</button></h3>
                            <p>{FOUNDATIONS[0].description}</p>
                            {foundationsExpanded && <div className="knowledge-root-subareas" aria-label={`Subáreas de ${FOUNDATIONS[0].name}`}>
                                {FOUNDATIONS[0].areas.map((area) => (
                                    <section className="knowledge-root-subarea" key={area}>
                                        <h4><button type="button" onClick={() => onOpenArea(appendKnowledgePath(knowledgeSlug(FOUNDATIONS[0].name), area))}>{area}</button></h4>
                                        <div>{FOUNDATION_DETAILS[area]?.map((detail) => <button type="button" key={detail} onClick={() => onOpenArea(appendKnowledgePath(appendKnowledgePath(knowledgeSlug(FOUNDATIONS[0].name), area), detail))}>{detail}</button>)}</div>
                                    </section>
                                ))}
                            </div>}
                        </article>
                        <article className="knowledge-root-node knowledge-philosophy">
                            <h3><button type="button" onClick={() => onOpenArea(knowledgeSlug(FOUNDATIONS[1].name))}>{FOUNDATIONS[1].name}</button></h3>
                            <p>{FOUNDATIONS[1].description}</p>
                            {foundationsExpanded && <div className="knowledge-root-subareas" aria-label={`Subáreas de ${FOUNDATIONS[1].name}`}>
                                {FOUNDATIONS[1].areas.map((area) => (
                                    <section className="knowledge-root-subarea" key={area}>
                                        <h4><button type="button" onClick={() => onOpenArea(appendKnowledgePath(knowledgeSlug(FOUNDATIONS[1].name), area))}>{area}</button></h4>
                                        <div>{FOUNDATION_DETAILS[area]?.map((detail) => <button type="button" key={detail} onClick={() => onOpenArea(appendKnowledgePath(appendKnowledgePath(knowledgeSlug(FOUNDATIONS[1].name), area), detail))}>{detail}</button>)}</div>
                                    </section>
                                ))}
                            </div>}
                        </article>
                    </div>

                    <div className="knowledge-map-actions">
                        <button type="button" className={allExpanded ? "active" : ""} aria-pressed={allExpanded} onClick={() => { setFoundationsExpanded(true); setExpandedDomains(new Set(DOMAINS.map((domain) => domain.name))); }}>Expandir tudo</button>
                        <button type="button" className={allCollapsed ? "active" : ""} aria-pressed={allCollapsed} onClick={() => { setFoundationsExpanded(false); setExpandedDomains(new Set()); }}>Recolher tudo</button>
                    </div>
                    <div className="knowledge-domain-generation" aria-label="Grupos e áreas do conhecimento">
                        {KNOWLEDGE_GROUPS.map((group) => {
                            const groupDomains = group.domains.map((name) => DOMAINS.find((domain) => domain.name === name)).filter(Boolean);
                            return (
                                <section className="knowledge-group" style={{ "--group-color": group.color, "--domain-count": groupDomains.length }} key={group.name}>
                                    <h2><button type="button" onClick={() => onOpenArea(knowledgeSlug(group.name))}>{group.name}</button></h2>
                                    <div className="knowledge-group-domains">
                                        {groupDomains.map((domain) => (
                                            <article className="knowledge-family" style={{ "--domain-color": domain.color }} key={domain.name}>
                                                <h3><button type="button" className="knowledge-area-link" onClick={() => onOpenArea(appendKnowledgePath(knowledgeSlug(group.name), domain.name))}>{domain.name}</button><button type="button" className="knowledge-expand-button" aria-expanded={expandedDomains.has(domain.name)} aria-label={`${expandedDomains.has(domain.name) ? "Recolher" : "Expandir"} ${domain.name}`} onClick={() => toggleDomain(domain.name)}>{expandedDomains.has(domain.name) ? "−" : "+"}</button></h3>
                                                {expandedDomains.has(domain.name) && <div className="knowledge-branch-generation">
                                                    {domain.branches.map((branch) => (
                                                        <section key={branch.name}>
                                                            <h4><button type="button" onClick={() => onOpenArea(appendKnowledgePath(appendKnowledgePath(knowledgeSlug(group.name), domain.name), branch.name))}>{branch.name}</button></h4>
                                                            <ul>{branch.children.map((child) => <li key={child}><button type="button" onClick={() => onOpenArea(appendKnowledgePath(appendKnowledgePath(appendKnowledgePath(knowledgeSlug(group.name), domain.name), branch.name), child))}>{child}</button></li>)}</ul>
                                                        </section>
                                                    ))}
                                                </div>}
                                            </article>
                                        ))}
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}

void KnowledgeMapLegacy;

export { DOMAINS, FOUNDATIONS, FOUNDATION_DETAILS, KNOWLEDGE_GROUPS };

export default KnowledgeMap;
