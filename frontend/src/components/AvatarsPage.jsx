import { useState } from "react";
import "./AvatarsPage.css";
import "./SocratesAvatar.css";

const AVATARS = [
    {
        id: "socrates",
        name: "Sócrates",
        discipline: "Humanidades · Filosofia",
        era: "c. 470–399 a.C.",
        description: "Um guia inspirado no método socrático para introduzir perguntas, conceitos e caminhos de estudo em Filosofia.",
        greeting: "Olá, sou Sócrates. Vamos estudar Filosofia?",
        image: "/images/avatars/socrates-avatar.png",
        video: "/videos/socrates.mp4",
        areaPath: "filosofia",
        status: "Modelo disponível",
    },
    {
        id: "platao",
        name: "Platão",
        discipline: "Humanidades · Filosofia",
        era: "c. 428–348 a.C.",
        description: "Um guia para investigar ideias, conhecimento, política e realidade a partir das grandes questões da tradição platônica.",
        greeting: "Olá, sou Platão. Vamos investigar o mundo das ideias?",
        image: "/images/avatars/platao-avatar.png",
        video: "/videos/platao.mp4",
        areaPath: "filosofia",
        status: "Modelo disponível",
    },
    {
        id: "aristoteles",
        name: "Aristóteles",
        discipline: "Humanidades · Filosofia",
        era: "384–322 a.C.",
        description: "Um guia para observar o mundo, organizar o conhecimento e explorar questões de lógica, ética, política e natureza.",
        greeting: "Olá, sou Aristóteles. Vamos investigar o mundo a partir da experiência?",
        image: "/images/avatars/aristoteles-avatar.png",
        video: "/videos/aristoteles.mp4",
        areaPath: "filosofia",
        status: "Modelo disponível",
    },
    {
        id: "pitagoras",
        name: "Pitágoras",
        discipline: "Ciências Formais · Matemática",
        era: "c. 570–495 a.C.",
        description: "Um guia para explorar as relações entre número, proporção, música, natureza e as origens do pensamento matemático.",
        greeting: "Olá, sou Pitágoras. Vamos descobrir a ordem presente nos números?",
        image: "/images/avatars/pitagoras-avatar.png",
        areaPath: "matematica",
    },
    {
        id: "santo-agostinho",
        name: "Santo Agostinho",
        discipline: "Humanidades · Teologia e Filosofia",
        era: "354–430",
        description: "Um guia para refletir sobre memória, tempo, vontade, conhecimento, fé e as grandes questões da filosofia cristã.",
        greeting: "Olá, sou Agostinho. Vamos investigar o tempo, a memória e a verdade?",
        image: "/images/avatars/santo-agostinho-avatar.png",
        areaPath: "filosofia",
    },
    {
        id: "rene-descartes",
        name: "René Descartes",
        discipline: "Humanidades · Filosofia",
        era: "1596–1650",
        description: "Um guia para explorar dúvida metódica, razão, conhecimento e as relações entre mente, corpo e mundo.",
        greeting: "Olá, sou Descartes. De que podemos ter certeza?",
        image: "/images/avatars/rene-descartes-avatar.png",
        areaPath: "filosofia",
    },
    {
        id: "immanuel-kant",
        name: "Immanuel Kant",
        discipline: "Humanidades · Filosofia",
        era: "1724–1804",
        description: "Um guia para investigar os limites da razão, as condições do conhecimento, a moral e a liberdade.",
        greeting: "Olá, sou Kant. O que podemos conhecer e o que devemos fazer?",
        image: "/images/avatars/immanuel-kant-avatar.png",
        areaPath: "filosofia",
    },
    {
        id: "friedrich-nietzsche",
        name: "Friedrich Nietzsche",
        discipline: "Humanidades · Filosofia",
        era: "1844–1900",
        description: "Um guia para questionar valores, moral, cultura, verdade e as forças que moldam nossas formas de viver.",
        greeting: "Olá, sou Nietzsche. Você está disposto a reavaliar seus valores?",
        image: "/images/avatars/friedrich-nietzsche-avatar.png",
        areaPath: "filosofia",
    },
    {
        id: "jean-jacques-rousseau",
        name: "Jean-Jacques Rousseau",
        discipline: "Humanidades · Filosofia",
        era: "1712–1778",
        description: "Um guia para refletir sobre natureza humana, liberdade, desigualdade, educação e contrato social.",
        greeting: "Olá, sou Rousseau. Como podemos ser livres vivendo em sociedade?",
        image: "/images/avatars/jean-jacques-rousseau-avatar.png",
        areaPath: "filosofia",
    },
    {
        id: "confucio",
        name: "Confúcio",
        discipline: "Humanidades · Filosofia",
        era: "551–479 a.C.",
        description: "Um guia para compreender virtude, educação, responsabilidade, relações humanas e harmonia social.",
        greeting: "Olá, sou Confúcio. Como o cultivo pessoal transforma a comunidade?",
        image: "/images/avatars/confucio-avatar.png",
        areaPath: "filosofia",
    },
    {
        id: "hipatia",
        name: "Hipátia",
        discipline: "Humanidades · Filosofia e Matemática",
        era: "c. 355–415",
        description: "Uma guia para aproximar filosofia, matemática e astronomia por meio da investigação racional e do ensino.",
        greeting: "Olá, sou Hipátia. Vamos observar como razão e matemática iluminam o mundo?",
        image: "/images/avatars/hipatia-avatar.png",
        areaPath: "filosofia",
    },
];

const SCIENTIST_AVATARS = [
    { id: "galileu-galilei", name: "Galileu Galilei", discipline: "Ciências Naturais · Astronomia e Física", era: "1564–1642", description: "Um guia para explorar observação, experimentação, movimento e a transformação da astronomia moderna.", greeting: "Olá, sou Galileu. Vamos observar o céu e questionar o que parece evidente?", image: "/images/avatars/galileu-galilei-avatar.png", areaPath: "ciencias-naturais" },
    { id: "isaac-newton", name: "Isaac Newton", discipline: "Ciências Naturais · Física e Matemática", era: "1643–1727", description: "Um guia para compreender movimento, gravitação, luz, cálculo e as leis matemáticas da natureza.", greeting: "Olá, sou Newton. Que leis unem o movimento dos corpos e dos astros?", image: "/images/avatars/isaac-newton-avatar.png", areaPath: "ciencias-naturais" },
    { id: "charles-darwin", name: "Charles Darwin", discipline: "Ciências Naturais · Biologia", era: "1809–1882", description: "Um guia para investigar evolução, seleção natural, adaptação e a diversidade da vida na Terra.", greeting: "Olá, sou Darwin. Vamos investigar como as espécies mudam ao longo do tempo?", image: "/images/avatars/charles-darwin-avatar.png", areaPath: "ciencias-naturais" },
    { id: "marie-curie", name: "Marie Curie", discipline: "Ciências Naturais · Física e Química", era: "1867–1934", description: "Uma guia para explorar radioatividade, matéria, pesquisa experimental e a construção rigorosa de descobertas científicas.", greeting: "Olá, sou Marie Curie. Vamos compreender o invisível por meio da experimentação?", image: "/images/avatars/marie-curie-avatar.png", areaPath: "ciencias-naturais" },
    { id: "albert-einstein", name: "Albert Einstein", discipline: "Ciências Naturais · Física", era: "1879–1955", description: "Um guia para refletir sobre espaço, tempo, gravidade, energia e as mudanças de perspectiva da física moderna.", greeting: "Olá, sou Einstein. Vamos imaginar novas maneiras de compreender espaço e tempo?", image: "/images/avatars/albert-einstein-avatar.png", areaPath: "ciencias-naturais" },
    { id: "ada-lovelace", name: "Ada Lovelace", discipline: "Ciências Formais · Computação", era: "1815–1852", description: "Uma guia para conhecer algoritmos, máquinas de cálculo e as origens conceituais da programação.", greeting: "Olá, sou Ada Lovelace. Vamos descobrir como uma máquina pode executar ideias?", image: "/images/avatars/ada-lovelace-avatar.png", areaPath: "ciencias-formais" },
    { id: "leonardo-da-vinci", name: "Leonardo da Vinci", discipline: "Ciências Aplicadas · Engenharia", era: "1452–1519", description: "Um guia para aproximar observação, desenho, mecanismos, invenção e pensamento interdisciplinar.", greeting: "Olá, sou Leonardo. Vamos transformar observação e imaginação em invenções?", image: "/images/avatars/leonardo-da-vinci-avatar.png", areaPath: "ciencias-aplicadas/engenharia" },
    { id: "hipocrates", name: "Hipócrates", discipline: "Ciências Aplicadas · Medicina e Saúde", era: "c. 460–370 a.C.", description: "Um guia para explorar observação clínica, cuidado, ética e as origens do pensamento médico sistemático.", greeting: "Olá, sou Hipócrates. Vamos compreender a saúde por meio da observação e do cuidado?", image: "/images/avatars/hipocrates-avatar.png", areaPath: "ciencias-aplicadas/medicina-e-saude" },
];

const SOCIAL_HUMANITIES_AVATARS = [
    { id: "cicero", name: "Cícero", discipline: "Ciências Sociais · Direito", era: "106–43 a.C.", description: "Um guia para refletir sobre lei, justiça, dever, república, argumentação e a tradição jurídica romana.", greeting: "Olá, sou Cícero. Como a justiça deve orientar as leis e a vida pública?", image: "/images/avatars/cicero-avatar.png", areaPath: "ciencias-sociais/direito" },
    { id: "karl-marx", name: "Karl Marx", discipline: "Ciências Sociais · Sociologia", era: "1818–1883", description: "Um guia para investigar trabalho, classes sociais, economia, poder e transformações históricas.", greeting: "Olá, sou Marx. Como as relações materiais organizam a sociedade?", image: "/images/avatars/karl-marx-avatar.png", areaPath: "ciencias-sociais/sociologia" },
    { id: "sigmund-freud", name: "Sigmund Freud", discipline: "Ciências Sociais · Psicologia", era: "1856–1939", description: "Um guia para conhecer inconsciente, sonhos, conflitos psíquicos e as origens da psicanálise.", greeting: "Olá, sou Freud. O que nossos pensamentos revelam além do que percebemos conscientemente?", image: "/images/avatars/sigmund-freud-avatar.png", areaPath: "ciencias-sociais/psicologia" },
    { id: "adam-smith", name: "Adam Smith", discipline: "Ciências Sociais · Economia", era: "1723–1790", description: "Um guia para explorar trabalho, mercados, divisão de tarefas, moral e formação da economia política.", greeting: "Olá, sou Adam Smith. Como cooperação, interesse e instituições organizam a economia?", image: "/images/avatars/adam-smith-avatar.png", areaPath: "ciencias-sociais/economia" },
    { id: "herodoto", name: "Heródoto", discipline: "Humanidades · História", era: "c. 484–425 a.C.", description: "Um guia para investigar povos, acontecimentos, narrativas, fontes e as origens da escrita da história.", greeting: "Olá, sou Heródoto. Vamos ouvir relatos e investigar como os acontecimentos foram lembrados?", image: "/images/avatars/herodoto-avatar.png", areaPath: "humanidades/historia-e-humanidades" },
    { id: "paulo-freire", name: "Paulo Freire", discipline: "Ciências Sociais · Educação", era: "1921–1997", description: "Um guia para compreender diálogo, consciência crítica, alfabetização e educação transformadora.", greeting: "Olá, sou Paulo Freire. Vamos aprender por meio do diálogo e da leitura do mundo?", image: "/images/avatars/paulo-freire-avatar.png", areaPath: "ciencias-sociais/educacao" },
];

function AvatarCollectionGallery({ avatars, ariaLabel, playingAvatar, setPlayingAvatar, onNavigate }) {
    return <section className="avatars-gallery" aria-label={ariaLabel}>
        {avatars.map((avatar) => <article className="avatar-profile-card" key={avatar.id}>
            <div className={`avatar-profile-visual${playingAvatar === avatar.id ? " is-playing" : ""}`}>
                <div className="avatar-profile-orbit" aria-hidden="true"/>
                <img src={avatar.image} alt={`${avatar.name}, avatar de ${avatar.discipline}`}/>
                <blockquote>“{avatar.greeting}”</blockquote>
            </div>
            <div className="avatar-profile-content">
                <header><div><small>{avatar.discipline}</small><h2>{avatar.name}</h2><i>{avatar.era}</i></div></header>
                <p>{avatar.description}</p>
                <div className="avatar-profile-capabilities"><span>Apresentações em desenvolvimento</span><span>Guia da disciplina</span><span>Conversa em desenvolvimento</span></div>
                <button type="button" onClick={() => { setPlayingAvatar(null); onNavigate("knowledge-area", avatar.areaPath); }}>Abrir área do conhecimento →</button>
            </div>
        </article>)}
    </section>;
}

function AvatarsPage({ onNavigate }) {
    const [playingAvatar, setPlayingAvatar] = useState(null);

    return <main className="avatars-page">
        <header className="avatars-hero">
            <div><p>PERSONAGENS DO CONHECIMENTO</p><h1>Avatares</h1><span>Encontre os pensadores e especialistas virtuais que dão rosto, voz e contexto às disciplinas do IDER.</span></div>
            <aside><strong>{AVATARS.length}</strong><span>{AVATARS.length === 1 ? "avatar disponível" : "avatares disponíveis"}</span><small>Novos personagens serão adicionados à medida que as disciplinas evoluírem.</small></aside>
        </header>

        <section className="avatars-introduction">
            <div><span>COMO FUNCIONA</span><h2>Aprenda em primeira pessoa</h2></div>
            <p>Cada avatar pertence a uma área da Roda do Conhecimento. Ele pode apresentar conteúdos, participar de diálogos e, futuramente, conversar com o usuário por meio de inteligência artificial.</p>
        </section>

        <header className="avatars-section-heading"><span>HUMANIDADES E PENSAMENTO</span><h2>Filósofos</h2><p>Pensadores que ajudam a explorar ideias, valores, conhecimento e diferentes modos de compreender o mundo.</p></header>
        <section className="avatars-gallery" aria-label="Galeria de filósofos">
            {AVATARS.map((avatar) => <article className="avatar-profile-card" key={avatar.id}>
                <div className={`avatar-profile-visual${playingAvatar === avatar.id ? " is-playing" : ""}`}>
                    <div className="avatar-profile-orbit" aria-hidden="true"/>
                    {playingAvatar === avatar.id ? <>
                        <video controls autoPlay playsInline preload="metadata" poster={avatar.image} aria-label={`Vídeo de apresentação de ${avatar.name}`}>
                            <source src={avatar.video} type="video/mp4"/>
                            Seu navegador não suporta a reprodução deste vídeo.
                        </video>
                        <button type="button" className="avatar-video-close" onClick={() => setPlayingAvatar(null)} aria-label={`Fechar vídeo de ${avatar.name}`}>×</button>
                    </> : <>
                        <img src={avatar.image} alt={`${avatar.name}, avatar de ${avatar.discipline}`}/>
                        <blockquote>“{avatar.greeting}”</blockquote>
                    </>}
                </div>
                <div className="avatar-profile-content">
                    <header><div><small>{avatar.discipline}</small><h2>{avatar.name}</h2><i>{avatar.era}</i></div>{avatar.video && <button type="button" className="avatar-watch-button" onClick={() => setPlayingAvatar(avatar.id)}><span aria-hidden="true">▶</span> Assistir apresentação</button>}</header>
                    <p>{avatar.description}</p>
                    <div className="avatar-profile-capabilities"><span>Apresentações em vídeo</span><span>Guia da disciplina</span><span>Conversa em desenvolvimento</span></div>
                    <button type="button" onClick={() => onNavigate("knowledge-area", avatar.areaPath)}>Abrir área do conhecimento →</button>
                </div>
            </article>)}
        </section>

        <header className="avatars-section-heading scientist-heading"><span>DESCOBERTA E INVESTIGAÇÃO</span><h2>Cientistas</h2><p>Pesquisadores que transformaram nossa compreensão da natureza, da vida, da matéria e da computação.</p></header>
        <AvatarCollectionGallery avatars={SCIENTIST_AVATARS} ariaLabel="Galeria de cientistas" playingAvatar={playingAvatar} setPlayingAvatar={setPlayingAvatar} onNavigate={onNavigate}/>

        <header className="avatars-section-heading social-heading"><span>SOCIEDADE, CULTURA E FORMAÇÃO</span><h2>Ciências Sociais e Humanidades</h2><p>Representantes que ajudam a compreender leis, sociedade, mente, economia, história e educação.</p></header>
        <AvatarCollectionGallery avatars={SOCIAL_HUMANITIES_AVATARS} ariaLabel="Galeria de ciências sociais e humanidades" playingAvatar={playingAvatar} setPlayingAvatar={setPlayingAvatar} onNavigate={onNavigate}/>

        <section className="avatars-coming-soon">
            <div><span>PRÓXIMOS AVATARES</span><h2>Uma galeria em construção</h2><p>Este espaço crescerá com personagens de diferentes períodos e disciplinas.</p></div>
            <div className="avatars-placeholders" aria-label="Avatares planejados"><article><b>+</b><span>Novo avatar</span><small>Próxima disciplina</small></article></div>
        </section>
    </main>;
}

export default AvatarsPage;
