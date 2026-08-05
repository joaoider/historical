import { useEffect, useState } from "react";

import MyTrails from "./MyTrails";
import { loadProgress, readLocal, saveProgress } from "../services/progress";
import "./MyIderPage.css";
import "./MyIderNotebook.css";
import "./MyIderBadges.css";
import "./MyIderAvatar.css";
import "./MyIderCompactHeader.css";
import "./MyCollections.css";
import "./MyCollectionsHierarchy.css";
import "./MyCollectionsImages.css";

const DEFAULT_AVATAR = "/images/avatars/meu-ider-avatar.png";
const readStored = readLocal;

const COLLECTIONS = [
    { eyebrow: "BIBLIOTECA", title: "Meus Livros", description: "Leituras em andamento, próximas escolhas e livros concluídos em uma estante pessoal.", view: "library", action: "Abrir Biblioteca", image: "/images/collections/biblioteca.png" },
    { eyebrow: "YOUTUBETECA", title: "Meus YouTubes", description: "Canais, aulas e conversas do YouTube organizados pelo seu progresso.", view: "videoLibrary", action: "Abrir YoutubeTeca", image: "/images/collections/youtubeteca.png" },
    { eyebrow: "PODTECA", title: "Meus Podcasts", description: "Episódios e séries para ouvir, acompanhar e guardar em seu acervo.", view: "podcastLibrary", action: "Abrir PodTeca", image: "/images/collections/podteca.png" },
    { eyebrow: "REVISTOTECA", title: "Minhas Publicações", description: "Revistas e newsletters reunidas para consulta e acompanhamento.", view: "publicationLibrary", action: "Abrir Revistoteca", image: "/images/collections/revistoteca.png" },
    { eyebrow: "VIDEOTECA", title: "Filmes e Documentários", description: "Um acervo separado para cinema, documentários e produções audiovisuais longas.", view: "filmLibrary", action: "Abrir Videoteca", image: "/images/collections/videoteca.png" },
    { eyebrow: "MUSEUTECA", title: "Museus e Lugares", description: "Espaços culturais para visitar, planejar e guardar entre suas experiências.", view: "museumLibrary", action: "Abrir MuseuTeca", image: "/images/collections/museuteca.png" },
];

function MyIderPage({ onNavigate }) {
    const [profile, setProfile] = useState(() => readStored("ider-user-profile", { name: "", nickname: "", subject: "Filosofia", avatar: "" }));
    const [communities, setCommunities] = useState(() => readStored("ider-communities", []));
    useEffect(() => {
        loadProgress("profile", "ider-user-profile", { name: "", nickname: "", subject: "Filosofia", avatar: "" }).then(setProfile);
        loadProgress("communities", "ider-communities", []).then(setCommunities);
    }, []);
    const uploadAvatar = (event) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setProfile((current) => { const next = { ...current, avatar: reader.result }; saveProgress("profile", "ider-user-profile", next); return next; }); reader.readAsDataURL(file); };

    return <main className="my-ider-page">
        <section className="my-ider-identity-hero"><header><p>SEU UNIVERSO PESSOAL</p><h1>Meu IDER</h1><span>Uma visão geral do que você aprende, acompanha e compartilha.</span></header><div className="my-ider-authenticated-name"><p>IDENTIDADE</p><h2>{profile.name || "Usuário IDER"}</h2><span>Seu nome aparecerá automaticamente após o login.</span></div><div className="my-ider-identity-side"><div className="my-ider-avatar"><img className="my-ider-character-avatar" src={profile.avatar || DEFAULT_AVATAR} alt="Avatar do usuário" tabIndex={0}/><label>Alterar avatar<input type="file" accept="image/*" onChange={uploadAvatar}/></label></div></div></section>
        <section className="my-ider-notebook-callout"><div><p>SEU ARQUIVO DE IDEIAS</p><h2>Meu Caderno</h2><span>Pesquise anotações, conecte temas, organize revisões e exporte tudo o que está aprendendo.</span></div><button type="button" onClick={() => onNavigate("notebook")}>Abrir Meu Caderno →</button></section>
        <section className="my-ider-badges-callout"><div className="my-ider-badges-medal" aria-hidden="true"><span>★</span></div><div><p>CONQUISTAS DE APRENDIZADO</p><h2>Minhas Badges</h2><span>Conclua trilhas oficiais, desbloqueie emblemas e acompanhe sua evolução no conhecimento.</span></div><button type="button" onClick={() => onNavigate("badges")}>Ver minhas badges →</button></section>
        <section className="my-ider-block"><header><div><p>CONEXÕES</p><h2>Minhas comunidades</h2></div><button type="button" onClick={() => onNavigate("knowledge-map")}>Explorar a roda →</button></header>{communities.length ? <div className="my-community-grid">{communities.map((community) => <article key={community.path}><span>COMUNIDADE</span><h3>{community.trail || community.name}</h3><button type="button" onClick={() => onNavigate("knowledge-area", community.path)}>Abrir comunidade →</button></article>)}</div> : <p className="my-ider-empty">Você ainda não entrou em nenhuma comunidade.</p>}</section>
        <section className="my-collections"><header><div><p>ACERVOS PESSOAIS</p><h2>Minhas coleções</h2></div><span>Escolha um ambiente para continuar.</span></header><div>{COLLECTIONS.map((collection) => <button type="button" className={`my-collection-card ${collection.view}`} key={collection.view} onClick={() => onNavigate(collection.view)}><img src={collection.image} alt="" loading="lazy" decoding="async"/><span><small>{collection.eyebrow}</small><strong>{collection.title}</strong><p>{collection.description}</p><b>{collection.action} →</b></span></button>)}</div></section>
        <MyTrails />
    </main>;
}

export default MyIderPage;
