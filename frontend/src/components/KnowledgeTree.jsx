import { useEffect, useMemo, useState } from "react";

import api from "../services/api";

import "./KnowledgeTree.css";


const KNOWLEDGE_AREAS = [
    {
        key: "theology", name: "Teologia", color: "#87613a",
        description: "A evolução das reflexões sobre o divino, a revelação, a fé, a tradição e a experiência religiosa.",
        stages: [
            { name: "Tradições e textos fundadores", period: "Antiguidade", description: "Formação das tradições bíblicas e primeiras sistematizações religiosas.", people: ["Moisés", "Isaías", "Confúcio", "Buda"] },
            { name: "Patrística", period: "Séculos I–VIII", description: "Definição das doutrinas cristãs e diálogo com a filosofia antiga.", people: ["Paulo de Tarso", "Orígenes", "Agostinho de Hipona"] },
            { name: "Escolástica medieval", period: "Séculos IX–XV", description: "Síntese entre fé e razão e desenvolvimento da teologia sistemática.", people: ["Anselmo de Cantuária", "Pedro Abelardo", "Tomás de Aquino", "Duns Scotus"] },
            { name: "Reforma e confessionalização", period: "Séculos XVI–XVII", description: "Debates sobre Escritura, graça, salvação, Igreja e autoridade.", people: ["Martinho Lutero", "João Calvino", "Teresa de Ávila"] },
            { name: "Teologia moderna", period: "Séculos XVIII–XIX", description: "Crítica histórica, experiência religiosa e diálogo com a modernidade.", people: ["Friedrich Schleiermacher", "Søren Kierkegaard", "John Henry Newman"] },
            { name: "Teologias contemporâneas", period: "Séculos XX–XXI", description: "Teologia dialética, política, libertação, ecumenismo e diálogo inter-religioso.", people: ["Karl Barth", "Dietrich Bonhoeffer", "Paul Tillich", "Gustavo Gutiérrez", "Leonardo Boff"] },
        ],
    },
    {
        key: "philosophy", name: "Filosofia", color: "#4f785f",
        description: "A transformação histórica das perguntas sobre realidade, conhecimento, razão, ação, política e valor.",
        stages: [
            { name: "Pensamento pré-socrático", period: "Séculos VII–V a.C.", description: "Investigação racional da natureza, do ser, da mudança e dos princípios do cosmos.", people: ["Tales de Mileto", "Anaximandro", "Heráclito", "Parmênides", "Pitágoras"] },
            { name: "Filosofia clássica", period: "Séculos V–IV a.C.", description: "Ética, política, conhecimento, lógica e metafísica ganham formulações sistemáticas.", people: ["Sócrates", "Platão", "Aristóteles"] },
            { name: "Escolas helenísticas", period: "Séculos IV a.C.–III d.C.", description: "A vida boa, a liberdade interior, a virtude e a tranquilidade tornam-se centrais.", people: ["Epicuro", "Zenão de Cítio", "Sêneca", "Epicteto", "Marco Aurélio"] },
            { name: "Filosofia medieval", period: "Séculos V–XV", description: "Fé e razão, universais, existência de Deus e natureza da alma.", people: ["Agostinho de Hipona", "Avicena", "Averróis", "Tomás de Aquino", "Guilherme de Ockham"] },
            { name: "Racionalismo e empirismo", period: "Séculos XVI–XVIII", description: "Novos fundamentos para o conhecimento, ciência, experiência e subjetividade.", people: ["René Descartes", "Baruch Spinoza", "John Locke", "David Hume"] },
            { name: "Iluminismo e idealismo", period: "Séculos XVIII–XIX", description: "Crítica da razão, autonomia, liberdade, história e formação do espírito.", people: ["Jean-Jacques Rousseau", "Immanuel Kant", "Georg Hegel"] },
            { name: "Críticas da modernidade", period: "Século XIX", description: "Capital, existência, vontade, religião e valores modernos são questionados.", people: ["Karl Marx", "Søren Kierkegaard", "Friedrich Nietzsche"] },
            { name: "Filosofias contemporâneas", period: "Séculos XX–XXI", description: "Fenomenologia, existencialismo, linguagem, poder e diferença.", people: ["Edmund Husserl", "Martin Heidegger", "Ludwig Wittgenstein", "Simone de Beauvoir", "Michel Foucault", "Hannah Arendt"] },
        ],
    },
    {
        key: "physics", name: "Física", color: "#356f9e",
        description: "Da investigação do movimento à estrutura quântica e cosmológica do universo.",
        stages: [
            { name: "Mecânica e óptica antigas", period: "Antiguidade – Idade Média", description: "Primeiras formulações sobre equilíbrio, máquinas, luz e movimento.", people: ["Arquimedes", "Alhazen"] },
            { name: "Mecânica clássica", period: "Séculos XVI–XVIII", description: "Matematização do movimento e formulação das leis universais da mecânica.", people: ["Galileu Galilei", "Christiaan Huygens", "Isaac Newton", "Leonhard Euler"] },
            { name: "Eletricidade e eletromagnetismo", period: "Séculos XVIII–XIX", description: "Unificação dos fenômenos elétricos, magnéticos e ópticos.", people: ["Benjamin Franklin", "Alessandro Volta", "Michael Faraday", "James Clerk Maxwell", "Nikola Tesla"] },
            { name: "Física quântica", period: "Séculos XIX–XX", description: "Nova descrição da matéria e da energia em escalas atômicas e subatômicas.", people: ["Max Planck", "Albert Einstein", "Niels Bohr", "Erwin Schrödinger", "Werner Heisenberg", "Enrico Fermi", "J. Robert Oppenheimer", "Richard Feynman"] },
            { name: "Relatividade e gravitação", period: "Séculos XX–XXI", description: "Espaço-tempo, buracos negros, ondas gravitacionais e estrutura do cosmos.", people: ["Albert Einstein", "Edwin Hubble", "Kip Thorne", "Stephen Hawking"] },
        ],
    },
    {
        key: "earth-space", name: "Terra e Espaço", color: "#537b73",
        description: "Da observação da Terra e do céu à geologia, astronomia, astrofísica e cosmologia moderna.",
        stages: [
            { name: "Astronomia antiga", period: "Antiguidade", description: "Medições da Terra, modelos planetários e catálogos do céu.", people: ["Aristarco de Samos", "Eratóstenes", "Ptolomeu", "Hipátia"] },
            { name: "Astronomia islâmica medieval", period: "Séculos X–XI", description: "Observações, instrumentos e crítica matemática dos modelos antigos.", people: ["Al-Biruni", "Alhazen", "Omar Khayyam"] },
            { name: "Revolução heliocêntrica", period: "Séculos XV–XVII", description: "Substituição do cosmos geocêntrico por modelos heliocêntricos quantitativos.", people: ["Nicolau Copérnico", "Tycho Brahe", "Galileu Galilei", "Johannes Kepler", "Isaac Newton"] },
            { name: "Astrofísica e cosmologia", period: "Séculos XX–XXI", description: "Expansão do universo, evolução estelar, relatividade e buracos negros.", people: ["Albert Einstein", "Edwin Hubble", "Carl Sagan", "Kip Thorne", "Stephen Hawking"] },
        ],
    },
    {
        key: "mathematics", name: "Matemática", color: "#a05a35",
        description: "Da geometria dedutiva à álgebra, ao cálculo e à análise matemática.",
        stages: [
            { name: "Geometria e matemática antiga", period: "Antiguidade", description: "Demonstração, proporção, geometria e métodos de cálculo.", people: ["Euclides", "Arquimedes", "Eratóstenes", "Hipátia"] },
            { name: "Álgebra e métodos medievais", period: "Séculos IX–XI", description: "Sistematização da álgebra, algoritmos e resolução de equações.", people: ["Al-Khwarizmi", "Al-Biruni", "Omar Khayyam"] },
            { name: "Cálculo e análise", period: "Séculos XVII–XVIII", description: "Novos instrumentos para modelar mudança, movimento e sistemas físicos.", people: ["Isaac Newton", "Leonhard Euler"] },
            { name: "Matemática aplicada", period: "Séculos XVII–XX", description: "Aplicação de estruturas matemáticas à física, à engenharia e a problemas complexos.", people: ["Blaise Pascal", "John von Neumann"] },
        ],
    },
    {
        key: "computing", name: "Computação", color: "#317b86",
        description: "Da concepção de máquinas programáveis aos fundamentos digitais e à Web.",
        stages: [
            { name: "Máquinas de cálculo", period: "Séculos XVII–XIX", description: "Instrumentos mecânicos para automatizar operações e representar procedimentos.", people: ["Blaise Pascal", "Charles Babbage"] },
            { name: "Programação pioneira", period: "Século XIX", description: "Reconhecimento de que máquinas poderiam manipular símbolos seguindo instruções gerais.", people: ["Ada Lovelace", "Charles Babbage"] },
            { name: "Fundamentos da computação", period: "Século XX", description: "Computabilidade, arquitetura de programas armazenados e teoria matemática da informação.", people: ["Alan Turing", "John von Neumann", "Claude Shannon"] },
            { name: "Linguagens e software", period: "Século XX", description: "Compiladores e linguagens de alto nível que aproximaram programação e linguagem humana.", people: ["Grace Hopper"] },
            { name: "Computação em rede", period: "Séculos XX–XXI", description: "Infraestrutura aberta para organizar e compartilhar informação em escala mundial.", people: ["Tim Berners-Lee"] },
        ],
    },
    {
        key: "statistics", name: "Estatística", color: "#8c5278",
        description: "A evolução dos métodos para aprender com dados, medir incerteza e planejar experimentos.",
        stages: [
            { name: "Probabilidade", period: "Séculos XVII–XVIII", description: "Primeiras formulações matemáticas do acaso, expectativa e atualização de probabilidades.", people: ["Blaise Pascal", "Christiaan Huygens", "Thomas Bayes"] },
            { name: "Dados sociais e visualização", period: "Século XIX", description: "Uso sistemático de dados e gráficos para compreender população, saúde e sociedade.", people: ["Florence Nightingale", "Francis Galton"] },
            { name: "Estatística matemática", period: "Séculos XIX–XX", description: "Correlação, testes de hipóteses, distribuições e fundamentos da inferência moderna.", people: ["Karl Pearson", "Ronald Fisher"] },
            { name: "Planejamento experimental", period: "Século XX", description: "Métodos para organizar experimentos, comparar tratamentos e produzir conclusões confiáveis.", people: ["Ronald Fisher", "Gertrude Cox"] },
            { name: "Análise exploratória de dados", period: "Século XX", description: "Técnicas visuais e robustas para descobrir padrões antes da modelagem formal.", people: ["John Tukey"] },
        ],
    },
    {
        key: "life", name: "Biologia", color: "#39805b",
        description: "Do estudo dos organismos à evolução, genética, ecologia e biologia molecular.",
        stages: [
            { name: "Medicina antiga", period: "Antiguidade – Idade Média", description: "Observação clínica, anatomia e organização do conhecimento médico.", people: ["Hipócrates", "Galeno", "Avicena"] },
            { name: "Anatomia e microscopia", period: "Séculos XVI–XVII", description: "Circulação sanguínea, células e descoberta do mundo microscópico.", people: ["William Harvey", "Robert Hooke", "Antonie van Leeuwenhoek"] },
            { name: "Classificação e evolução", period: "Séculos XVIII–XX", description: "Organização da biodiversidade e explicação da transformação das espécies.", people: ["Carl Linnaeus", "Charles Darwin", "Jane Goodall"] },
            { name: "Imunologia e microbiologia", period: "Séculos XVIII–XIX", description: "Vacinação, germes, fermentação e prevenção de doenças infecciosas.", people: ["Edward Jenner", "Louis Pasteur"] },
            { name: "Genética e biologia molecular", period: "Séculos XIX–XX", description: "Leis da hereditariedade e estrutura molecular da informação genética.", people: ["Gregor Mendel", "Rosalind Franklin"] },
            { name: "Inovação biomédica", period: "Século XXI", description: "Soluções experimentais criadas por uma nova geração de pesquisadores.", people: ["Gitanjali Rao", "Heman Bekele"] },
        ],
    },
    {
        key: "chemistry", name: "Química", color: "#8d6535",
        description: "A passagem da filosofia natural para uma ciência quantitativa da matéria.",
        stages: [
            { name: "Química experimental", period: "Século XVII", description: "Experimentos com gases, pressão e propriedades da matéria.", people: ["Robert Boyle", "Robert Hooke"] },
            { name: "Revolução química", period: "Séculos XVIII–XIX", description: "Conservação da massa, elementos e teoria atômica moderna.", people: ["Antoine Lavoisier", "John Dalton"] },
            { name: "Classificação dos elementos", period: "Século XIX", description: "Organização periódica das propriedades químicas.", people: ["Dmitri Mendeleev"] },
            { name: "Radioatividade e química nuclear", period: "Séculos XIX–XX", description: "Transformações atômicas, novos elementos e aplicações da radiação.", people: ["Marie Curie", "Enrico Fermi"] },
            { name: "Química ambiental e materiais", period: "Século XXI", description: "Materiais sustentáveis e soluções para água, solo e saúde.", people: ["Kiara Nirghin", "Gitanjali Rao"] },
        ],
    },
    {
        key: "technology", name: "Engenharia", color: "#b06b2e",
        description: "A aplicação do conhecimento científico em comunicação, energia e informação.",
        stages: [
            { name: "Máquinas e instrumentos", period: "Antiguidade – século XVII", description: "Mecanismos, lentes e instrumentos para ampliar a ação e a observação humanas.", people: ["Arquimedes", "Alhazen", "Galileu Galilei", "Robert Hooke"] },
            { name: "Eletricidade aplicada", period: "Séculos XVIII–XIX", description: "Pilhas, motores, iluminação e sistemas elétricos.", people: ["Alessandro Volta", "Michael Faraday", "Thomas Edison", "Nikola Tesla"] },
            { name: "Telecomunicações", period: "Séculos XIX–XX", description: "Transmissão de voz e informação a distância.", people: ["Alexander Graham Bell", "Nikola Tesla"] },
            { name: "Máquinas programáveis", period: "Séculos XIX–XX", description: "Programação, computabilidade e arquitetura conceitual dos computadores.", people: ["Ada Lovelace", "Alan Turing"] },
            { name: "Web e inovação digital", period: "Séculos XX–XXI", description: "Redes abertas, comunicação global e inovação orientada a problemas sociais.", people: ["Tim Berners-Lee", "Gitanjali Rao"] },
        ],
    },
    {
        key: "medicine", name: "Medicina e Saúde", color: "#a44952",
        description: "Da observação clínica às especialidades médicas, saúde pública e biomedicina.",
        stages: [
            { name: "Medicina antiga", period: "Antiguidade – Idade Média", description: "Sistematização da prática clínica, anatomia e farmacologia.", people: ["Hipócrates", "Galeno", "Avicena"] },
            { name: "Anatomia e fisiologia", period: "Séculos XVI–XVII", description: "Investigação experimental da estrutura e do funcionamento do corpo.", people: ["William Harvey", "Robert Hooke"] },
            { name: "Microbiologia e prevenção", period: "Séculos XVIII–XIX", description: "Vacinação, teoria microbiana e controle das infecções.", people: ["Edward Jenner", "Louis Pasteur", "Florence Nightingale"] },
            { name: "Medicina contemporânea", period: "Séculos XX–XXI", description: "Genética, diagnóstico, terapias especializadas e saúde coletiva.", people: ["Rosalind Franklin", "Jonas Salk"] },
        ],
    },
    {
        key: "law", name: "Direito", color: "#725c91",
        description: "A evolução das normas, instituições, direitos e teorias da justiça.",
        stages: [
            { name: "Leis antigas", period: "Antiguidade", description: "Primeiras codificações e reflexões sobre lei, poder e justiça.", people: ["Hamurábi", "Sólon", "Cícero"] },
            { name: "Direito natural e moderno", period: "Séculos XVI–XVIII", description: "Direitos naturais, soberania e separação dos poderes.", people: ["Hugo Grócio", "John Locke", "Montesquieu"] },
            { name: "Direito contemporâneo", period: "Séculos XIX–XX", description: "Constitucionalismo, direitos humanos e teorias modernas do direito.", people: ["Hans Kelsen", "Norberto Bobbio"] },
        ],
    },
    {
        key: "sociology", name: "Sociologia", color: "#9a5364",
        description: "O estudo sistemático das sociedades, instituições, desigualdades e transformações sociais.",
        stages: [
            { name: "Pensamento social", period: "Séculos XVIII–XIX", description: "Industrialização, revoluções e nascimento da análise social moderna.", people: ["Alexis de Tocqueville", "Karl Marx", "Auguste Comte"] },
            { name: "Sociologia clássica", period: "Séculos XIX–XX", description: "Instituições, ação social, solidariedade e racionalização.", people: ["Émile Durkheim", "Max Weber", "Georg Simmel"] },
            { name: "Teorias contemporâneas", period: "Séculos XX–XXI", description: "Poder, cultura, identidade, gênero e estrutura social.", people: ["W. E. B. Du Bois", "Pierre Bourdieu", "Judith Butler"] },
        ],
    },
    {
        key: "psychology", name: "Psicologia", color: "#657b9b",
        description: "A evolução do estudo da mente, do comportamento, do desenvolvimento e da cognição.",
        stages: [
            { name: "Fundação experimental", period: "Século XIX", description: "A mente e a percepção passam a ser investigadas experimentalmente.", people: ["Wilhelm Wundt", "William James"] },
            { name: "Psicanálise e comportamento", period: "Século XX", description: "Inconsciente, aprendizagem e explicações sistemáticas do comportamento.", people: ["Sigmund Freud", "Carl Jung", "Ivan Pavlov", "B. F. Skinner"] },
            { name: "Desenvolvimento e cognição", period: "Séculos XX–XXI", description: "Desenvolvimento infantil, linguagem, memória e processos cognitivos.", people: ["Jean Piaget", "Lev Vygotsky", "Daniel Kahneman"] },
        ],
    },
    {
        key: "economics", name: "Economia", color: "#71813d",
        description: "A formação das teorias sobre produção, mercados, trabalho, desenvolvimento e políticas públicas.",
        stages: [
            { name: "Economia política clássica", period: "Séculos XVIII–XIX", description: "Mercados, valor, divisão do trabalho e distribuição da riqueza.", people: ["Adam Smith", "David Ricardo", "Karl Marx"] },
            { name: "Economia moderna", period: "Séculos XIX–XX", description: "Marginalismo, macroeconomia e novas explicações dos ciclos econômicos.", people: ["Alfred Marshall", "John Maynard Keynes", "Friedrich Hayek"] },
            { name: "Economia contemporânea", period: "Séculos XX–XXI", description: "Instituições, desenvolvimento, comportamento e desigualdade.", people: ["Milton Friedman", "Amartya Sen", "Elinor Ostrom", "Daniel Kahneman"] },
        ],
    },
    {
        key: "humanities", name: "História e Humanidades", color: "#84654d",
        description: "A investigação das experiências humanas por meio da história, linguagem, literatura, arte e cultura.",
        stages: [
            { name: "Historiografia antiga", period: "Antiguidade", description: "Narrativa, investigação e interpretação dos acontecimentos humanos.", people: ["Heródoto", "Tucídides", "Plutarco"] },
            { name: "Humanismo e crítica", period: "Séculos XIV–XVIII", description: "Retorno aos textos clássicos, filologia e crítica histórica.", people: ["Petrarca", "Erasmo de Roterdã", "Giambattista Vico"] },
            { name: "Humanidades modernas", period: "Séculos XIX–XXI", description: "História científica, linguística, cultura, literatura e interpretação.", people: ["Leopold von Ranke", "Ferdinand de Saussure", "Michel Foucault"] },
        ],
    },
    {
        key: "education", name: "Educação", color: "#a47743",
        description: "A evolução das ideias sobre ensino, aprendizagem, formação humana e instituições educacionais.",
        stages: [
            { name: "Educação clássica", period: "Antiguidade", description: "Formação moral, política e intelectual nas tradições antigas.", people: ["Confúcio", "Sócrates", "Platão", "Aristóteles"] },
            { name: "Pedagogia moderna", period: "Séculos XVII–XIX", description: "Métodos de ensino, infância e educação universal.", people: ["Comenius", "Jean-Jacques Rousseau", "Johann Pestalozzi"] },
            { name: "Educação contemporânea", period: "Séculos XIX–XXI", description: "Aprendizagem ativa, autonomia, democracia e pedagogia crítica.", people: ["Maria Montessori", "John Dewey", "Jean Piaget", "Paulo Freire"] },
        ],
    },
];


function formatYear(year) {
    return year < 0 ? `${Math.abs(year)} a.C.` : `${year || 1} d.C.`;
}


function KnowledgeTree({ onOpenProfile }) {
    const [entities, setEntities] = useState([]);
    const [activeArea, setActiveArea] = useState(KNOWLEDGE_AREAS[0].key);
    const [expandedStages, setExpandedStages] = useState(new Set(KNOWLEDGE_AREAS[0].stages.map((_, index) => index)));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/entities")
            .then((response) => setEntities(response.data))
            .finally(() => setLoading(false));
    }, []);

    const area = KNOWLEDGE_AREAS.find((candidate) => candidate.key === activeArea);
    const entityByName = useMemo(() => new Map(entities.map((entity) => [entity.name, entity])), [entities]);
    const renderAreaButton = (candidate) => (
        <button
            type="button"
            key={candidate.key}
            className={candidate.key === activeArea ? "active" : ""}
            style={{ "--tab-color": candidate.color }}
            onClick={() => { setActiveArea(candidate.key); setExpandedStages(new Set(candidate.stages.map((_, index) => index))); }}
        >
            {candidate.name}
        </button>
    );

    if (loading) return <div className="knowledge-tree-status">Carregando áreas do conhecimento...</div>;

    return (
        <section className="knowledge-tree-view" style={{ "--area-color": area.color }} aria-labelledby="knowledge-tree-title">
            <header className="knowledge-tree-intro">
                <p>HISTÓRIA DAS IDEIAS E DOS SABERES</p>
                <h2 id="knowledge-tree-title">Evolução das áreas do conhecimento</h2>
                <span>Explore como pensamentos religiosos, filosóficos, científicos, sociais e humanísticos se desenvolveram através de seus representantes.</span>
            </header>

            <nav className="knowledge-area-tabs" aria-label="Áreas do conhecimento">
                <div className="knowledge-foundation-tabs" aria-label="Áreas fundamentais">
                    {KNOWLEDGE_AREAS.slice(0, 2).map(renderAreaButton)}
                </div>
                <div className="knowledge-discipline-tabs" aria-label="Demais áreas">
                    {KNOWLEDGE_AREAS.slice(2).map(renderAreaButton)}
                </div>
            </nav>

            <article className="knowledge-area-tree">
                <header className="knowledge-area-root">
                    <span>ÁREA DO CONHECIMENTO</span>
                    <h3>{area.name}</h3>
                    <p>{area.description}</p>
                </header>

                <div className="knowledge-tree-actions">
                    <button type="button" className={expandedStages.size === area.stages.length ? "active" : ""} aria-pressed={expandedStages.size === area.stages.length} onClick={() => setExpandedStages(new Set(area.stages.map((_, index) => index)))}>Expandir tudo</button>
                    <button type="button" className={expandedStages.size === 0 ? "active" : ""} aria-pressed={expandedStages.size === 0} onClick={() => setExpandedStages(new Set())}>Recolher tudo</button>
                </div>

                <div className="knowledge-stages">
                    {area.stages.map((stage, stageIndex) => {
                        const people = stage.people.map((name) => entityByName.get(name)).filter(Boolean);
                        return (
                            <section className="knowledge-stage" key={stage.name}>
                                <header>
                                    <i>{stageIndex + 1}</i>
                                    <div><span>{stage.period}</span><h4>{stage.name}</h4><p>{stage.description}</p></div>
                                    <button
                                        type="button"
                                        className="knowledge-stage-toggle"
                                        aria-expanded={expandedStages.has(stageIndex)}
                                        onClick={() => setExpandedStages((current) => {
                                            const next = new Set(current);
                                            if (next.has(stageIndex)) next.delete(stageIndex); else next.add(stageIndex);
                                            return next;
                                        })}
                                    >{expandedStages.has(stageIndex) ? "−" : "+"}</button>
                                </header>
                                {expandedStages.has(stageIndex) && <ol>
                                    {people.map((scientist) => (
                                        <li key={scientist.id}>
                                            <button type="button" onClick={() => onOpenProfile?.(scientist.id)} title={scientist.description || scientist.name}>
                                                <span className="knowledge-person-image">
                                                    {scientist.image_url ? <img src={scientist.image_url} alt="" loading="lazy" /> : scientist.name.charAt(0)}
                                                </span>
                                                <strong>{scientist.name}</strong>
                                                <time>{formatYear(scientist.start_year)}</time>
                                            </button>
                                        </li>
                                    ))}
                                </ol>}
                            </section>
                        );
                    })}
                </div>
            </article>
        </section>
    );
}


export default KnowledgeTree;
