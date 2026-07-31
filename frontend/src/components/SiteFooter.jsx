import "./SiteFooter.css";
import iderLogo from "../assets/ider-logo-white.svg";

function SiteFooter() {
    return (
        <footer className="site-footer">
            <div className="site-footer-brand">
                <img src={iderLogo} alt="IDER" loading="lazy" />
                <p>Um projeto dedicado à visualização da história, das ideias e das áreas do conhecimento.</p>
            </div>

            <div className="site-footer-owner">
                <small>IDEALIZAÇÃO E DESENVOLVIMENTO</small>
                <strong>João Ider</strong>
                <p>Pesquisa, organização e apresentação visual do conteúdo.</p>
            </div>

            <div className="site-footer-contact">
                <small>CONTATO E COLABORAÇÕES</small>
                <strong>Vamos conversar</strong>
                <p>Canal de contato público a ser informado.</p>
                <nav><a href="/trilhas">Trilhas de estudo</a><a href="/sobre">Sobre o IDER</a><a href="/administracao">Administração</a></nav>
            </div>

            <div className="site-footer-bottom">
                <span>© {new Date().getFullYear()} João Ider. Todos os direitos reservados.</span>
                <span>Conhecimento em perspectiva.</span>
            </div>
        </footer>
    );
}

export default SiteFooter;
