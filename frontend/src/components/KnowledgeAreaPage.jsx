import { useEffect, useState } from "react";
import { DOMAINS, FOUNDATIONS, FOUNDATION_DETAILS, KNOWLEDGE_GROUPS } from "./KnowledgeMap";
import { appendKnowledgePath, knowledgeSlug } from "../utils/knowledgePaths";
import { recordRecommendationActivity } from "../utils/personalActivity";
import { loadProgress, saveProgress } from "../services/progress";
import PhilosophyJourney from "./PhilosophyJourney";
import "./KnowledgeAreaPage.css";
import "./KnowledgeCommunity.css";

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
    if (segments.length === 1) {
        const domainChildren = group.domains.map((name) => ({ name, children: DOMAINS.find((domain) => domain.name === name)?.branches.map((branch) => branch.name) || [] }));
        const foundationChildren = group.name === "Humanidades" ? FOUNDATIONS.map((foundation) => ({ name: foundation.name, path: knowledgeSlug(foundation.name), children: foundation.areas })) : [];
        return { name: group.name, description: `Conjunto de disciplinas que integram ${group.name}.`, color: group.color, children: [...foundationChildren, ...domainChildren] };
    }
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

function buildCommunityTrail(path, breadcrumbs) {
    const names = breadcrumbs.map((item) => item.name);
    if (path === "humanidades") return names;
    if (path === "filosofia" || path.startsWith("filosofia/")) return ["Humanidades", ...names];
    return names;
}

const areaPolar = (radius, angle) => ({ x: 350 + radius * Math.cos((angle - 90) * Math.PI / 180), y: 350 + radius * Math.sin((angle - 90) * Math.PI / 180) });

function areaArc(inner, outer, start, end) {
    const gap = .8; const a = start + gap; const b = end - gap;
    const p1 = areaPolar(outer, a); const p2 = areaPolar(outer, b); const p3 = areaPolar(inner, b); const p4 = areaPolar(inner, a);
    const large = b - a > 180 ? 1 : 0;
    return `M ${p1.x} ${p1.y} A ${outer} ${outer} 0 ${large} 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${inner} ${inner} 0 ${large} 0 ${p4.x} ${p4.y} Z`;
}

function AreaWheelSegment({ name, color, inner, outer, start, end, onClick, level }) {
    const middle = (start + end) / 2;
    const point = areaPolar((inner + outer) / 2, middle);
    const rotation = middle > 180 ? middle + 90 : middle - 90;
    const activate = (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onClick(); } };
    return <g className={`knowledge-area-wheel-segment level-${level}`} role="button" tabIndex="0" aria-label={name} onClick={onClick} onKeyDown={activate}>
        <path d={areaArc(inner, outer, start, end)} fill={color} />
        <text x={point.x} y={point.y} transform={`rotate(${rotation} ${point.x} ${point.y})`}>{name}</text>
    </g>;
}

const PHILOSOPHY_RECOMMENDATIONS = [
    { category: "books", platform: "amazon", source: "Amazon", title: "A coragem de não agradar", description: "Uma introdução acessível à filosofia e à psicologia adleriana, construída como diálogo.", action: "Ver livro", url: "https://www.amazon.com.br/coragem-n%C3%A3o-agradar-Ichiro-Kishimi/dp/8543105692" },
    { category: "videos", platform: "youtube", source: "YouTube", title: "Introdução à Filosofia", description: "Um primeiro contato em vídeo com perguntas, conceitos e maneiras de pensar filosoficamente.", action: "Assistir vídeo", url: "https://www.youtube.com/watch?v=L1w4Ewe732M" },
    { category: "films", platform: "cinema", source: "Filme", title: "Sócrates", description: "O filme de Roberto Rossellini acompanha os últimos dias de Sócrates e transforma seus diálogos em uma introdução viva à filosofia.", action: "Conhecer o filme", url: "https://www.imdb.com/title/tt0210296/" },
    { category: "courses", platform: "usp", source: "USP", title: "Graduação em Filosofia — FFLCH", description: "Conheça o bacharelado, a licenciatura e as linhas de pesquisa do Departamento de Filosofia da USP.", action: "Conhecer o curso", url: "https://filosofia.fflch.usp.br/departamento?language=pt-br" },
    { category: "jobs", platform: "linkedin", source: "LinkedIn", title: "Vagas relacionadas à Filosofia", description: "Busca atualizada de oportunidades em ensino, pesquisa, conteúdo e áreas relacionadas no Brasil.", action: "Explorar vagas", url: "https://br.linkedin.com/jobs/filosofia-vagas" },
    { category: "podcasts", platform: "spotify", source: "Spotify", title: "Podcast Filosofia Pop", description: "Conversas que aproximam questões filosóficas da cultura, da educação e da vida contemporânea.", action: "Ouvir no Spotify", url: "https://open.spotify.com/show/3wNgwqFVIkdvN0qUyOCbg7" },
    { category: "publications", platform: "anpof", source: "ANPOF", title: "Boletim ANPOF", description: "Notícias, chamadas, lançamentos e uma agenda recorrente da comunidade filosófica brasileira.", action: "Ler o boletim", url: "https://mail.anpof.org/comunicacoes/boletim/boletim-anpof-345" },
    { category: "events", platform: "anpof", source: "ANPOF", title: "Agenda de Filosofia", description: "Encontros, colóquios, seminários e outras atividades acadêmicas presenciais e online.", action: "Ver agenda", url: "https://www.anpof.org/agenda" },
    { category: "profiles", platform: "profile", source: "Perfil", title: "Mario Sergio Cortella", description: "Filósofo, professor e escritor brasileiro que aproxima reflexão filosófica, educação e cotidiano.", action: "Acompanhar perfil", url: "https://www.mscortella.com.br/" },
    { category: "places", platform: "museus", source: "MuseusBr", title: "Mapa dos Museus do Brasil", description: "Descubra museus, acervos e espaços culturais para ampliar sua experiência com história e pensamento.", action: "Explorar lugares", url: "https://cadastro.museus.gov.br/" },
];

const METAPHYSICS_RECOMMENDATIONS = [
    { category: "books", platform: "amazon", source: "Amazon", title: "Metafísica — Aristóteles", description: "O tratado clássico sobre ser, substância, causalidade e os primeiros princípios.", action: "Procurar o livro", url: "https://www.amazon.com.br/s?k=Metaf%C3%ADsica+Arist%C3%B3teles" },
    { category: "videos", platform: "youtube", source: "YouTube", title: "O que é Metafísica?", description: "Videoaula introdutória sobre a origem, os objetos e os principais problemas da metafísica.", action: "Assistir no YouTube", url: "https://www.youtube.com/results?search_query=o+que+e+metafisica+videoaula" },
    { category: "films", platform: "cinema", source: "Filme", title: "Matrix", description: "Uma ficção filosófica sobre realidade, aparência, liberdade e os limites do que podemos conhecer.", action: "Conhecer o filme", url: "https://www.imdb.com/title/tt0133093/" },
    { category: "podcasts", platform: "spotify", source: "Spotify", title: "Metafísica Original", description: "Episódios dedicados a conceitos, questões e interpretações ligadas à metafísica.", action: "Ouvir no Spotify", url: "https://creators.spotify.com/pod/profile/metafisica" },
    { category: "courses", platform: "university", source: "Coimbra", title: "Temas de Metafísica", description: "Unidade curricular sobre o ser enquanto ser, a história da metafísica, suas críticas e transformações.", action: "Ver o programa", url: "https://apps.uc.pt/courses/PT/unit/80833/15665/2025-2026?id=5501&type=ram" },
    { category: "jobs", platform: "linkedin", source: "LinkedIn", title: "Docência e pesquisa em Filosofia", description: "Busca de oportunidades relacionadas a ensino, pesquisa acadêmica e produção de conteúdo filosófico.", action: "Explorar vagas", url: "https://br.linkedin.com/jobs/search?keywords=Professor%20de%20Filosofia" },
    { category: "publications", platform: "anpof", source: "ANPOF", title: "Metafísica Analítica", description: "Coletânea acadêmica brasileira dedicada a problemas contemporâneos da metafísica analítica.", action: "Ler publicação", url: "https://anpof.org.br/wlib/arqs/publicacoes/126.pdf" },
    { category: "events", platform: "anpof", source: "ANPOF", title: "Agenda de Metafísica", description: "Agenda nacional com colóquios, lançamentos e seminários, incluindo atividades sobre metafísica.", action: "Ver eventos", url: "https://www.anpof.org/agenda" },
    { category: "profiles", platform: "profile", source: "IEA-USP", title: "Pesquisadores de Filosofia Antiga", description: "Acompanhe pesquisadores envolvidos na tradução e discussão da Metafísica de Aristóteles.", action: "Conhecer pesquisadores", url: "https://www.iea.usp.br/eventos/metafisica-de-aristoteles" },
    { category: "places", platform: "museus", source: "Atenas", title: "Museu da Acrópole", description: "Um lugar para aproximar a filosofia grega de seu contexto histórico, religioso e artístico.", action: "Visitar o museu", url: "https://www.theacropolismuseum.gr/en" },
];

const TIME_SPACE_RECOMMENDATIONS = [
    { category: "books", platform: "publisher", source: "Companhia", title: "A ordem do tempo — Carlo Rovelli", description: "Uma investigação acessível e poética sobre como a física contemporânea transforma nossa ideia de tempo.", action: "Ver o livro", url: "https://www.companhiadasletras.com.br/livro/9788547000561/a-ordem-do-tempo" },
    { category: "videos", platform: "youtube", source: "YouTube", title: "O Espaço-Tempo Explicado", description: "O canal Ciência Todo Dia apresenta de forma visual a ligação entre espaço, tempo e relatividade.", action: "Assistir vídeo", url: "https://www.youtube.com/watch?v=kJ5xNaSIeTI" },
    { category: "films", platform: "cinema", source: "Filme", title: "Interestelar", description: "Uma jornada cinematográfica por relatividade, gravidade e diferentes experiências do tempo.", action: "Conhecer o filme", url: "https://www.imdb.com/title/tt0816692/" },
    { category: "podcasts", platform: "spotify", source: "Spotify", title: "Vozes do Cosmos", description: "Entrevistas sobre astronomia, astrofísica, cosmologia e os grandes problemas do universo.", action: "Ouvir no Spotify", url: "https://open.spotify.com/show/3WjVLQy4MUT3uvihjc1TeQ" },
    { category: "courses", platform: "university", source: "ICTP-SAIFR", title: "A geometria do espaço-tempo", description: "Minicurso introdutório sobre relatividade, geometria do espaço-tempo e buracos negros.", action: "Acessar curso", url: "https://www.classcentral.com/course/youtube-andre-landulfo-a-geometria-do-espaco-tempo-uma-introducao-geometrica-aula-1-476211" },
    { category: "jobs", platform: "linkedin", source: "LinkedIn", title: "Vagas em Física e Cosmologia", description: "Oportunidades de pesquisa, docência e atuação técnica relacionadas à física e ao espaço.", action: "Explorar vagas", url: "https://br.linkedin.com/jobs/search?keywords=F%C3%ADsica%20Cosmologia" },
    { category: "publications", platform: "journal", source: "Prometeus", title: "Resenha: A ordem do tempo", description: "Leitura acadêmica da obra de Rovelli e de suas implicações conceituais sobre a natureza do tempo.", action: "Ler artigo", url: "https://periodicos.ufs.br/prometeus/article/download/12030/11001/41960" },
    { category: "events", platform: "anpof", source: "ANPOF", title: "Filosofia da Ciência em debate", description: "Acompanhe seminários e encontros sobre realidade, ciência, física e seus fundamentos filosóficos.", action: "Ver agenda", url: "https://www.anpof.org/agenda" },
    { category: "profiles", platform: "profile", source: "Autor", title: "Carlo Rovelli", description: "Físico teórico e divulgador conhecido por aproximar gravidade quântica, tempo e filosofia da ciência.", action: "Conhecer o autor", url: "https://www.companhiadasletras.com.br/autor.php?codigo=03753" },
    { category: "places", platform: "museus", source: "Berna", title: "Casa de Einstein", description: "O apartamento onde Einstein viveu durante o período em que formulou ideias decisivas sobre espaço e tempo.", action: "Conhecer o lugar", url: "https://www.22.einstein-bern.ch/en/booking" },
];

const HUMANITIES_RECOMMENDATIONS = [
    { category: "books", platform: "amazon", source: "Amazon", title: "Sapiens — Uma breve história da humanidade", description: "Uma síntese de grande alcance sobre sociedades, cultura e transformações da experiência humana.", action: "Procurar o livro", url: "https://www.amazon.com.br/s?k=Sapiens+Yuval+Noah+Harari" },
    { category: "videos", platform: "youtube", source: "Canal USP", title: "A importância das Ciências Humanas", description: "Uma reflexão sobre a contribuição das humanidades para democracia, inclusão e compreensão social.", action: "Assistir vídeo", url: "https://www.youtube.com/watch?v=66juFRrneFA" },
    { category: "films", platform: "cinema", source: "Documentário", title: "A 13ª Emenda", description: "Um documentário sobre escravidão, encarceramento em massa, desigualdade e as estruturas históricas da sociedade.", action: "Conhecer o documentário", url: "https://www.imdb.com/title/tt5895028/" },
    { category: "podcasts", platform: "spotify", source: "Spotify", title: "Casa das Humanidades", description: "Pesquisadores da FGV CPDOC discutem história, antropologia, arquivos e questões sociais contemporâneas.", action: "Ouvir no Spotify", url: "https://open.spotify.com/show/1tAuPaA66Z3kiVk2OyTqre" },
    { category: "courses", platform: "university", source: "UFBA", title: "Bacharelado Interdisciplinar em Humanidades", description: "Formação que combina perspectivas humanísticas, científicas e artísticas com itinerários interdisciplinares.", action: "Conhecer o curso", url: "https://ihac.ufba.br/course/bacharelado-interdisciplinar-em-humanidades/" },
    { category: "jobs", platform: "linkedin", source: "LinkedIn", title: "Vagas em Ciências Humanas", description: "Oportunidades em pesquisa, educação, cultura, comunicação, projetos sociais e produção de conteúdo.", action: "Explorar vagas", url: "https://br.linkedin.com/jobs/search?keywords=Ci%C3%AAncias%20Humanas" },
    { category: "publications", platform: "journal", source: "ANPOCS", title: "Revista Brasileira de Ciências Sociais", description: "Artigos e ensaios sobre política, sociedade, desigualdades, cultura, violência e democracia.", action: "Conhecer a revista", url: "https://anpocs.org.br/" },
    { category: "events", platform: "anpof", source: "ANPOCS", title: "Encontro Anual da ANPOCS", description: "Um dos principais encontros brasileiros para pesquisas e debates nas Ciências Humanas e Sociais.", action: "Ver programação", url: "https://www.encontro2026.anpocs.org.br/cronograma" },
    { category: "profiles", platform: "profile", source: "Pesquisadora", title: "Lilia Moritz Schwarcz", description: "Historiadora e antropóloga brasileira com trabalhos sobre raça, memória, imagens e história do Brasil.", action: "Conhecer o trabalho", url: "https://masp.org.br/palestras/por-outros-22" },
    { category: "places", platform: "museus", source: "MASP", title: "Museu de Arte de São Paulo", description: "Arte, arquitetura, história e vida social reunidas em um dos espaços culturais mais importantes do país.", action: "Conhecer o MASP", url: "https://masp.com.br/pt-br/sobre-o-masp" },
];

const RECOMMENDATIONS_BY_AREA = {
    humanidades: HUMANITIES_RECOMMENDATIONS,
    filosofia: PHILOSOPHY_RECOMMENDATIONS,
    "filosofia/metafisica": METAPHYSICS_RECOMMENDATIONS,
    "filosofia/metafisica/tempo-e-espaco": TIME_SPACE_RECOMMENDATIONS,
};

const PHILOSOPHY_CHARACTERS = [
    { id: "socrates", name: "Sócrates", initials: "SÓ", status: "Disponível", video: "/videos/socrates.mp4", title: "A arte de perguntar", description: "Sócrates abre a Ágora com um convite ao questionamento e à investigação filosófica.", message: "Antes de responder, quero saber: o que você entende por uma vida boa?", suggestions: ["O que é virtude?", "Como questionar melhor?"] },
    { id: "platao", name: "Platão", initials: "PL", status: "Disponível", video: "/videos/platao.mp4", title: "O mundo das ideias", description: "Platão apresenta um caminho para refletir sobre conhecimento, justiça e a realidade além das aparências.", message: "Diga-me: como podemos distinguir uma opinião de um conhecimento verdadeiro?", suggestions: ["O que são as ideias?", "O que é justiça?"] },
    { id: "aristoteles", name: "Aristóteles", initials: "AR", status: "Disponível", video: "/videos/aristoteles.mp4", poster: "/images/avatars/aristoteles-avatar.png", title: "Conhecer pela experiência", description: "Aristóteles convida você a observar, classificar e compreender o mundo a partir da experiência.", message: "Comecemos pelos fatos: o que você observa antes de formular uma explicação?", suggestions: ["O que é uma causa?", "Como alcançar a virtude?"] },
];

const AREA_REPRESENTATIVES = {
    filosofia: { name: "Sócrates", image: "/images/avatars/socrates-avatar.png" },
    teologia: { name: "Santo Agostinho", image: "/images/avatars/santo-agostinho-avatar.png" },
    "ciencias-formais/matematica": { name: "Pitágoras", image: "/images/avatars/pitagoras-avatar.png" },
    "ciencias-formais/computacao": { name: "Ada Lovelace", image: "/images/avatars/ada-lovelace-avatar.png" },
    "ciencias-naturais/fisica": { name: "Albert Einstein", image: "/images/avatars/albert-einstein-avatar.png" },
    "ciencias-naturais/quimica": { name: "Marie Curie", image: "/images/avatars/marie-curie-avatar.png" },
    "ciencias-naturais/biologia": { name: "Charles Darwin", image: "/images/avatars/charles-darwin-avatar.png" },
    "ciencias-naturais/terra-e-espaco": { name: "Galileu Galilei", image: "/images/avatars/galileu-galilei-avatar.png" },
    "ciencias-aplicadas/engenharia": { name: "Leonardo da Vinci", image: "/images/avatars/leonardo-da-vinci-avatar.png" },
    "ciencias-aplicadas/medicina-e-saude": { name: "Hipócrates", image: "/images/avatars/hipocrates-avatar.png" },
    "ciencias-sociais/direito": { name: "Cícero", image: "/images/avatars/cicero-avatar.png" },
    "ciencias-sociais/sociologia": { name: "Karl Marx", image: "/images/avatars/karl-marx-avatar.png" },
    "ciencias-sociais/psicologia": { name: "Sigmund Freud", image: "/images/avatars/sigmund-freud-avatar.png" },
    "ciencias-sociais/economia": { name: "Adam Smith", image: "/images/avatars/adam-smith-avatar.png" },
    "ciencias-sociais/educacao": { name: "Paulo Freire", image: "/images/avatars/paulo-freire-avatar.png" },
    "humanidades/historia-e-humanidades": { name: "Heródoto", image: "/images/avatars/herodoto-avatar.png" },
};

const RECOMMENDATION_SECTIONS = [
    { id: "books", slug: "livros", number: "01", title: "Livros", description: "Obras para começar e aprofundar sua formação filosófica." },
    { id: "videos", slug: "videos", number: "02", title: "YouTubes", description: "Vídeos do YouTube selecionados exclusivamente para este subtema." },
    { id: "films", slug: "filmes-documentarios", number: "03", title: "Vídeos", description: "Filmes e documentários relacionados exclusivamente a este subtema." },
    { id: "podcasts", slug: "podcasts", number: "04", title: "Podcasts", description: "Filosofia para acompanhar em conversas e entrevistas." },
    { id: "courses", slug: "cursos", number: "05", title: "Cursos", description: "Caminhos de formação acadêmica e livre." },
    { id: "jobs", slug: "vagas", number: "06", title: "Vagas", description: "Oportunidades profissionais ligadas à área." },
    { id: "publications", slug: "publicacoes", number: "07", title: "Revistas e newsletters", description: "Publicações para acompanhar ideias e pesquisas em circulação." },
    { id: "events", slug: "eventos", number: "08", title: "Eventos", description: "Encontros para aprender, apresentar trabalhos e fazer conexões." },
    { id: "profiles", slug: "perfis", number: "09", title: "Perfis para acompanhar", description: "Pesquisadores, professores e divulgadores da área." },
    { id: "places", slug: "lugares", number: "10", title: "Museus e lugares", description: "Espaços onde história, cultura e pensamento ganham presença." },
];

function RecommendationLogo({ platform }) {
    if (platform === "cinema") return <svg viewBox="0 0 48 48" aria-hidden="true"><rect x="5" y="8" width="38" height="32" rx="7" fill="#292d31"/><path d="M20 17l13 7-13 7z" fill="#f4c66a"/><path d="M10 13h28" stroke="#f4c66a" strokeWidth="2" strokeDasharray="4 3"/></svg>;
    if (platform === "youtube") return <svg viewBox="0 0 48 48" aria-hidden="true"><rect x="4" y="10" width="40" height="28" rx="8" fill="#ff0033"/><path d="M20 17l13 7-13 7z" fill="white"/></svg>;
    if (platform === "linkedin") return <svg viewBox="0 0 48 48" aria-hidden="true"><rect x="5" y="5" width="38" height="38" rx="5" fill="#0a66c2"/><circle cx="15" cy="17" r="3" fill="white"/><path d="M12 22h6v15h-6zm9 0h6v2.1c1.3-1.7 3-2.8 5.5-2.8 4.2 0 6.5 2.7 6.5 7.6V37h-6v-7.1c0-2.1-.8-3.5-2.8-3.5-2.2 0-3.2 1.5-3.2 4.3V37h-6z" fill="white"/></svg>;
    if (platform === "spotify") return <svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21" fill="#1ed760"/><path d="M13 18c8-2.2 17.5-1.6 24 2M14.5 24c7-1.7 15-1.1 21 1.8M16 30c5.8-1.2 12-.8 17 1.3" fill="none" stroke="#111" strokeWidth="3" strokeLinecap="round"/></svg>;
    if (platform === "amazon") return <span className="recommendation-wordmark amazon-mark" aria-hidden="true">amazon<i>⌣</i></span>;
    if (platform === "usp") return <span className="recommendation-wordmark usp-mark" aria-hidden="true">USP</span>;
    if (platform === "university") return <span className="recommendation-wordmark university-mark" aria-hidden="true">UNI</span>;
    if (platform === "publisher") return <span className="recommendation-wordmark publisher-mark" aria-hidden="true">Cia.</span>;
    if (platform === "journal") return <span className="recommendation-wordmark journal-mark" aria-hidden="true">ART</span>;
    if (platform === "anpof") return <span className="recommendation-wordmark anpof-mark" aria-hidden="true">ANPOF</span>;
    if (platform === "museus") return <span className="recommendation-wordmark museus-mark" aria-hidden="true">M+</span>;
    return <span className="recommendation-wordmark profile-mark" aria-hidden="true">MS</span>;
}

function KnowledgeAreaPage({ areaPath, onOpenArea, onOpenRecommendations, onOpenMyIder, onBack }) {
    const [agoraMode, setAgoraMode] = useState("dialogue");
    const [selectedCharacter, setSelectedCharacter] = useState("socrates");
    const [joinedCommunities, setJoinedCommunities] = useState([]);
    useEffect(() => { loadProgress("communities", "ider-communities", []).then(setJoinedCommunities); }, []);
    const area = resolveArea(areaPath);
    if (!area) return <main className="knowledge-area-page"><div className="knowledge-area-empty"><h2>Área não encontrada</h2><button type="button" onClick={onBack}>Voltar à roda</button></div></main>;
    const breadcrumbs = buildBreadcrumbs(areaPath);
    const communityTrail = buildCommunityTrail(areaPath, breadcrumbs);
    const joinedCommunity = joinedCommunities.some((item) => item.path === areaPath);
    const joinCommunity = () => setJoinedCommunities((current) => {
        if (current.some((item) => item.path === areaPath)) return current;
        const next = [...current, { path: areaPath, name: area.name, trail: communityTrail.join(" | ") }];
        saveProgress("communities", "ider-communities", next);
        return next;
    });
    const recommendations = RECOMMENDATIONS_BY_AREA[areaPath] || [];
    const weights = area.children.map((child) => Math.max(child.children.length, 1));
    const totalWeight = weights.reduce((sum, value) => sum + value, 0);
    const layout = area.children.map((child, index) => {
        const previousWeight = weights.slice(0, index).reduce((sum, value) => sum + value, 0);
        const start = (previousWeight / totalWeight) * 360;
        const end = start + (weights[index] / totalWeight) * 360;
        const leafSize = child.children.length ? (end - start) / child.children.length : 0;
        const leaves = child.children.map((name, leafIndex) => ({ name, start: start + leafIndex * leafSize, end: start + (leafIndex + 1) * leafSize }));
        return { ...child, start, end, leaves };
    });
    const currentCharacter = PHILOSOPHY_CHARACTERS.find((character) => character.id === selectedCharacter) || PHILOSOPHY_CHARACTERS[0];
    const representative = AREA_REPRESENTATIVES[areaPath];

    return <main className="knowledge-area-page" style={{ "--area-color": area.color }}>
        <nav className="knowledge-area-breadcrumb" aria-label="Caminho da área"><button type="button" onClick={onBack}>Roda do Conhecimento</button>{breadcrumbs.map((item, index) => <span key={item.path}>› <button type="button" disabled={index === breadcrumbs.length - 1} onClick={() => onOpenArea(item.path)}>{item.name}</button></span>)}</nav>
        <header><p>RAMO DO CONHECIMENTO</p><h2>{area.name}</h2><span>{area.description}</span></header>
        {representative && <figure className="area-representative" aria-label={`${representative.name}, representante de ${area.name}`}><img src={representative.image} alt={`${representative.name}, representante da área de ${area.name}`}/><figcaption><strong>{representative.name}</strong><span>Representante da área</span></figcaption></figure>}
        {areaPath === "filosofia" && <aside className="knowledge-agora" aria-labelledby="avatar-guide-title">
            <header><div><span>ÁGORA VIRTUAL · PROTÓTIPO</span><h3 id="avatar-guide-title">Filosofia em primeira pessoa</h3></div><i aria-hidden="true">IA</i></header>
            <p className="knowledge-agora-intro">Assista a encontros entre grandes pensadores ou escolha um deles para conversar.</p>
            <div className="knowledge-agora-tabs" role="tablist" aria-label="Experiências da Ágora">
                <button type="button" role="tab" aria-selected={agoraMode === "dialogue"} onClick={() => setAgoraMode("dialogue")}>Diálogos</button>
                <button type="button" role="tab" aria-selected={agoraMode === "chat"} onClick={() => setAgoraMode("chat")}>Conversar</button>
            </div>
            <div className="knowledge-agora-people" aria-label="Personagens">
                {PHILOSOPHY_CHARACTERS.map((character) => <button type="button" className={selectedCharacter === character.id ? "selected" : ""} key={character.id} onClick={() => setSelectedCharacter(character.id)}><b>{character.initials}</b><span>{character.name}<small>{character.status}</small></span></button>)}
            </div>
            {agoraMode === "dialogue" ? <div className="knowledge-agora-dialogue">
                <div className="knowledge-avatar-video"><video key={currentCharacter.video} controls playsInline preload="metadata" poster={currentCharacter.poster}><source src={currentCharacter.video} type="video/mp4"/>Seu navegador não suporta a reprodução deste vídeo.</video><span>APRESENTAÇÃO</span></div>
                <h4>{currentCharacter.name}: {currentCharacter.title}</h4>
                <p>{currentCharacter.description}</p>
                <button type="button" className="knowledge-agora-primary" onClick={() => setAgoraMode("chat")}>Conversar com {currentCharacter.name}</button>
            </div> : <div className="knowledge-agora-chat">
                <div className="knowledge-agora-message"><b>{currentCharacter.name}</b><p>{currentCharacter.message}</p></div>
                <div className="knowledge-agora-suggestions"><span>Experimente perguntar</span>{currentCharacter.suggestions.map((suggestion) => <button type="button" key={suggestion}>{suggestion}</button>)}</div>
                <div className="knowledge-agora-compose"><input aria-label={`Mensagem para ${currentCharacter.name}`} placeholder={`Pergunte a ${currentCharacter.name}...`}/><button type="button" title="Recurso demonstrativo">Enviar</button></div>
                <small>Prévia da experiência. A conversa com voz e IA será conectada em uma próxima etapa.</small>
            </div>}
        </aside>}
        {area.children.length > 0 ? <section className="knowledge-area-wheel-section" aria-label={`Subdivisões de ${area.name}`}>
            <svg className="knowledge-area-wheel" viewBox="0 0 700 700" role="img" aria-label={`Roda de conhecimento de ${area.name}`}>
                <circle cx="350" cy="350" r="112" className="knowledge-area-wheel-center" />
                <text x="350" y="344" className="knowledge-area-wheel-title">{area.name}</text>
                <text x="350" y="369" className="knowledge-area-wheel-hint">área atual</text>
                {layout.map((child) => { const childPath = child.path || appendKnowledgePath(areaPath, child.name); return <AreaWheelSegment key={child.name} name={child.name} color={area.color} inner={117} outer={225} start={child.start} end={child.end} level="child" onClick={() => onOpenArea(childPath)} />; })}
                {layout.flatMap((child) => { const childPath = child.path || appendKnowledgePath(areaPath, child.name); return child.leaves.map((leaf) => <AreaWheelSegment key={`${child.name}-${leaf.name}`} name={leaf.name} color={area.color} inner={230} outer={342} start={leaf.start} end={leaf.end} level="leaf" onClick={() => onOpenArea(appendKnowledgePath(childPath, leaf.name))} />); })}
            </svg>
            <p>Área atual → subdivisões → especialidades. Clique em um segmento para continuar.</p>
        </section> : <section className="knowledge-area-leaf"><span>ÁREA ESPECIALIZADA</span><h3>{area.name}</h3><p>Este é o último nível de detalhamento atualmente registrado na Roda do Conhecimento.</p></section>}
        {areaPath === "filosofia" && <PhilosophyJourney onOpenRecommendations={onOpenRecommendations} onOpenMyIder={onOpenMyIder}/>} 
        <section className={`knowledge-community${joinedCommunity ? " joined" : ""}`} aria-labelledby="knowledge-community-title">
            <div className="knowledge-community-symbol" aria-hidden="true"><span>◌</span><i>●</i><b>●</b></div>
            <div><p>COMUNIDADE DESTA CAMADA</p><h3 id="knowledge-community-title">Converse sobre {communityTrail.join(" | ")}</h3><span>Encontre pessoas interessadas neste assunto, compartilhe referências, faça perguntas e participe de discussões.</span></div>
            <button type="button" disabled={joinedCommunity} onClick={joinCommunity}>{joinedCommunity ? "Você entrou na comunidade ✓" : "Entrar na comunidade"}</button>
        </section>
        {recommendations.length > 0 && <section className="knowledge-recommendations" aria-labelledby="area-recommendations-title">
            <header><p>PARA CONTINUAR EXPLORANDO</p><h3 id="area-recommendations-title">Indicações de {area.name}</h3><span>Uma seleção de caminhos para ler, assistir, estudar, conhecer e trabalhar.</span></header>
            <div className="knowledge-recommendation-sections">
                {RECOMMENDATION_SECTIONS.map((section) => <section className="knowledge-recommendation-shelf" key={section.id} aria-labelledby={`recommendation-${section.id}`}>
                    <header><span>{section.number}</span><div><h4 id={`recommendation-${section.id}`}>{section.title}</h4><p>{section.description}</p><button type="button" className="recommendation-shelf-link" onClick={() => onOpenRecommendations(section.slug)}>Ver todas as indicações →</button></div></header>
                    <div className="knowledge-recommendations-grid">
                        {recommendations.filter((item) => item.category === section.id).map((item) => <article className={`knowledge-recommendation-card platform-${item.platform}`} key={item.title}>
                            <div className="knowledge-recommendation-platform"><RecommendationLogo platform={item.platform}/><small>{item.source}</small></div>
                            <div><h5>{item.title}</h5><p>{item.description}</p></div>
                            <a href={item.url} target="_blank" rel="noreferrer" onClick={() => recordRecommendationActivity(item, areaPath)}>{item.action}<span aria-hidden="true">↗</span></a>
                        </article>)}
                    </div>
                </section>)}
            </div>
        </section>}
        <footer><button type="button" onClick={onBack}>← Voltar à roda completa</button></footer>
    </main>;
}

export { RECOMMENDATIONS_BY_AREA, RECOMMENDATION_SECTIONS };
export default KnowledgeAreaPage;
