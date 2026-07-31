import "./AboutPage.css";

function AboutPage() {
    return (
        <main className="about-page">
            <header><p>SOBRE O PROJETO</p><h2>Como o IDER organiza o conhecimento</h2><span>Ideias, Descobertas, Evoluções e Raízes</span></header>
            <section className="about-lead"><h3>Um atlas visual da experiência humana</h3><p>O IDER reúne pessoas, livros, obras, acontecimentos e disciplinas para mostrar como ideias surgem, se relacionam e se transformam ao longo do tempo e do espaço.</p></section>
            <div className="about-grid">
                <section><span>01</span><h3>Critérios de seleção</h3><p>São priorizados conteúdos com relevância histórica, intelectual, científica, artística ou cultural, buscando diversidade de épocas, regiões e tradições.</p></section>
                <section><span>02</span><h3>Datas e incertezas</h3><p>Datas antigas podem ser aproximadas. Atribuições disputadas e tradições com diferentes cronologias devem ser apresentadas como interpretações, não como certezas absolutas.</p></section>
                <section><span>03</span><h3>Fontes e imagens</h3><p>Cada registro deve evoluir para indicar referências bibliográficas, origem das imagens, licença de uso e data da última revisão editorial.</p></section>
                <section><span>04</span><h3>Áreas interdisciplinares</h3><p>A árvore mostra uma origem principal para facilitar a leitura, mas áreas como Computação, Psicologia, Economia e Bioquímica podem pertencer a mais de um ramo.</p></section>
                <section><span>05</span><h3>Revisão contínua</h3><p>O acervo é educativo e permanece em revisão. Correções documentadas, novas fontes e perspectivas complementares fazem parte do desenvolvimento do projeto.</p></section>
                <section><span>06</span><h3>Responsabilidade</h3><p>Idealização, pesquisa, organização e desenvolvimento por João Ider. Conteúdos devem ser conferidos em fontes especializadas antes de uso acadêmico formal.</p></section>
            </div>
            <section className="about-contact"><p>CONTATO E COLABORAÇÕES</p><h3>Ajude a ampliar e revisar o acervo</h3><span>O canal público de contato será acrescentado quando definido pelo proprietário.</span></section>
        </main>
    );
}

export default AboutPage;
