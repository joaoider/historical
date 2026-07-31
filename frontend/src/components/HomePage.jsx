import "./HomePage.css";
import lampadaIder from "../assets/ider-lamp-green.svg";

const STUDY_OPTIONS = [
    { view: "timeline", number: "01", title: "Tempo Horizontal", text: "Compare personagens, obras e acontecimentos ao longo dos séculos em uma linha cronológica panorâmica.", action: "Explorar cronologia" },
    { view: "vertical", number: "02", title: "Tempo Vertical", text: "Percorra a história de cima para baixo, observando períodos, movimentos e eventos em sequência.", action: "Percorrer o tempo" },
    { view: "philosophy-tree", number: "03", title: "Árvore Genealógica", text: "Veja pessoas de diferentes áreas reunidas por época, com relações visuais entre gerações históricas.", action: "Abrir a árvore" },
    { view: "profiles", number: "04", title: "Perfis Individuais", text: "Aprofunde-se em uma pessoa, livro ou obra: origem, contexto, ideias, produção e contribuições.", action: "Consultar perfis" },
    { view: "knowledge-tree", number: "05", title: "Áreas do Conhecimento", text: "Acompanhe a evolução temporal da Física, Matemática, Estatística, Computação e outras ciências.", action: "Ver evoluções" },
    { view: "knowledge-map", number: "06", title: "Mapa do Conhecimento", text: "Navegue pela genealogia fixa das disciplinas, da Teologia e Filosofia às áreas e especialidades atuais.", action: "Navegar pelas áreas" },
    { view: "map", number: "07", title: "Mapa de Origens", text: "Descubra onde nasceram personagens e ideias, conectando conhecimento, história e território.", action: "Explorar o mapa" },
    { view: "trails", number: "08", title: "Trilhas de Estudo", text: "Siga percursos temáticos organizados em etapas e aprofunde cada personagem em seu perfil.", action: "Escolher uma trilha" },
];

function HomePage({ onNavigate, entities = [], trackCount = 0 }) {
    const featured = entities.find((entity) => entity.name === "Platão") || entities[0] || null;
    const profileCount = new Set(entities.map((entity) => entity.id)).size;

    return (
        <main className="home-page">
            <section className="home-hero">
                <img className="home-symbol" src={lampadaIder} alt="Símbolo da lâmpada do IDER" />
                <p className="home-eyebrow">HISTÓRIA · IDEIAS · CONHECIMENTO</p>
                <h2>Uma forma visual de compreender como o conhecimento atravessa o tempo</h2>
                <p className="home-lead">Este projeto reúne personagens, livros, obras, acontecimentos e disciplinas em diferentes mapas de estudo. Compare épocas, acompanhe influências e aprofunde-se nos temas que formaram nossa história.</p>
                <button type="button" onClick={() => onNavigate("timeline")}>Começar a explorar <span aria-hidden="true">→</span></button>
            </section>
            <section className="home-collection" aria-label="Dimensão do acervo">
                <div><strong>{profileCount || "—"}</strong><span>itens disponíveis</span></div>
                <div><strong>{trackCount || "—"}</strong><span>categorias de estudo</span></div>
                <div><strong>5</strong><span>perspectivas principais</span></div>
                {featured && <button type="button" onClick={() => onNavigate("profiles", featured.id)}><small>DESTAQUE DO ACERVO</small><strong>{featured.name}</strong><span>{featured.track} →</span></button>}
            </section>
            <section className="home-purpose" aria-label="Como usar o projeto">
                <div><strong>1</strong><span>Escolha uma visualização</span><small>Cronológica, geográfica, genealógica ou individual.</small></div>
                <div><strong>2</strong><span>Selecione os temas</span><small>Combine Filosofia, Ciência, Arte, Literatura e outros grupos.</small></div>
                <div><strong>3</strong><span>Descubra relações</span><small>Observe proximidades, contextos, especializações e continuidades.</small></div>
            </section>

            <section className="home-journeys">
                <header><p>PERCURSOS SUGERIDOS</p><h3>Por onde começar?</h3></header>
                <div>
                    <button type="button" onClick={() => onNavigate("philosophy-tree")}><span>01</span><strong>Formação das ideias</strong><small>Observe épocas, movimentos e personagens na árvore histórica.</small></button>
                    <button type="button" onClick={() => onNavigate("knowledge-tree")}><span>02</span><strong>Revoluções científicas</strong><small>Acompanhe a evolução das áreas e seus principais representantes.</small></button>
                    <button type="button" onClick={() => onNavigate("trails")}><span>03</span><strong>Estudo orientado</strong><small>Siga uma sequência temática e aprofunde cada etapa em seu próprio ritmo.</small></button>
                </div>
            </section>
            <section className="home-study">
                <header><p>CAMINHOS DE ESTUDO</p><h3>O que você encontrará</h3><span>Cada visualização responde a um tipo diferente de pergunta.</span></header>
                <div className="home-options-grid">
                    {STUDY_OPTIONS.map((option) => (
                        <button type="button" className="home-option" key={option.view} onClick={() => onNavigate(option.view)}>
                            <span className="home-option-number">{option.number}</span><h4>{option.title}</h4><p>{option.text}</p>
                            <span className="home-option-action">{option.action} <b aria-hidden="true">→</b></span>
                        </button>
                    ))}
                </div>
            </section>
            <section className="home-closing"><p>UM ACERVO EM EXPANSÃO</p><h3>Da visão geral ao estudo individual</h3><span>Comece por uma época, uma área ou um nome. As diferentes páginas permitem retornar ao mesmo conteúdo por novas perspectivas.</span></section>
        </main>
    );
}

export default HomePage;
