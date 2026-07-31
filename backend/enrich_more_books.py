"""Adiciona livros historicamente relevantes ausentes do catálogo."""

from sqlalchemy import text

from app.database import engine


# Datas de textos antigos de composição gradual são aproximações convencionais.
BOOKS = {
    "Os Analectos": (-475, "Coletânea de ensinamentos atribuídos a Confúcio e seus discípulos, fundamental para a tradição intelectual do leste asiático.", "China", 35.6000, 116.9833),
    "Mahabharata": (-400, "Grande epopeia sânscrita que reúne narrativas, filosofia, religião e reflexão política da tradição indiana.", "Índia", 28.6139, 77.2090),
    "Dhammapada": (-300, "Coleção de versos budistas sobre ética, mente e libertação, integrada ao cânone páli.", "Índia", 25.3176, 82.9739),
    "Bhagavad Gita": (-200, "Diálogo filosófico e religioso entre Krishna e Arjuna sobre dever, ação, conhecimento e devoção.", "Índia", 29.9695, 76.8783),
    "Beowulf": (800, "Poema épico em inglês antigo sobre heroísmo, lealdade e mortalidade, central para a literatura anglo-saxônica.", "Reino Unido", 52.3555, -1.1743),
    "O Conto dos Heike": (1330, "Epopeia japonesa sobre a ascensão e queda do clã Taira durante as guerras Genpei.", "Japão", 35.0116, 135.7681),
    "Decamerão": (1353, "Coleção de cem novelas de Giovanni Boccaccio narradas durante a Peste Negra, marco da prosa europeia.", "Itália", 43.7696, 11.2558),
    "O Livro da Cidade das Damas": (1405, "Obra de Christine de Pizan que responde à misoginia medieval e defende as capacidades intelectuais das mulheres.", "França", 48.8566, 2.3522),
    "Ensaios": (1580, "Obra de Michel de Montaigne que consolidou o ensaio como forma literária de investigação pessoal e filosófica.", "França", 44.8378, -0.5792),
    "Jornada ao Oeste": (1592, "Romance chinês atribuído a Wu Cheng'en que combina aventura, sátira e tradições budistas e taoistas.", "China", 32.0603, 118.7969),
    "O Sonho da Câmara Vermelha": (1791, "Romance de Cao Xueqin sobre a decadência de uma família aristocrática, considerado um ápice da ficção chinesa.", "China", 39.9042, 116.4074),
    "Frankenstein": (1818, "Romance de Mary Shelley sobre criação, responsabilidade e isolamento, precursor decisivo da ficção científica.", "Reino Unido", 51.5074, -0.1278),
    "Jane Eyre": (1847, "Romance de Charlotte Brontë sobre autonomia, moralidade, classe e afetos na Inglaterra vitoriana.", "Reino Unido", 53.8310, -1.9570),
    "Manifesto Comunista": (1848, "Texto político de Karl Marx e Friedrich Engels que apresentou uma interpretação histórica baseada no conflito de classes.", "Reino Unido", 51.5074, -0.1278),
    "Moby Dick": (1851, "Romance de Herman Melville sobre a perseguição à baleia branca, explorando obsessão, natureza e destino.", "Estados Unidos", 40.7128, -74.0060),
    "Madame Bovary": (1857, "Romance de Gustave Flaubert que renovou o realismo literário por sua linguagem e crítica à sociedade burguesa.", "França", 49.4432, 1.0993),
    "A Origem das Espécies": (1859, "Obra de Charles Darwin que apresentou extensa argumentação científica para a evolução por seleção natural.", "Reino Unido", 51.5074, -0.1278),
    "Guerra e Paz": (1869, "Romance de Liev Tolstói que articula vidas familiares, sociedade e as guerras napoleônicas na Rússia.", "Rússia", 55.7558, 37.6173),
    "Os Irmãos Karamázov": (1880, "Último romance de Dostoiévski, dedicado a questões de fé, liberdade, culpa, família e responsabilidade moral.", "Rússia", 59.9311, 30.3609),
    "A Interpretação dos Sonhos": (1899, "Obra de Sigmund Freud que estabeleceu conceitos centrais da psicanálise e da interpretação do inconsciente.", "Áustria", 48.2082, 16.3738),
    "As Almas do Povo Negro": (1903, "Livro de W. E. B. Du Bois que analisou racismo, identidade e cidadania por meio do conceito de dupla consciência.", "Estados Unidos", 33.7490, -84.3880),
    "Ulisses": (1922, "Romance modernista de James Joyce que acompanha um dia em Dublin por meio de experimentação linguística e fluxo de consciência.", "Irlanda", 53.3498, -6.2603),
    "Mrs Dalloway": (1925, "Romance de Virginia Woolf que explora memória, tempo e vida interior ao longo de um único dia em Londres.", "Reino Unido", 51.5074, -0.1278),
    "Admirável Mundo Novo": (1932, "Distopia de Aldous Huxley sobre condicionamento social, tecnologia, consumo e perda de autonomia.", "Reino Unido", 51.5074, -0.1278),
    "O Segundo Sexo": (1949, "Estudo de Simone de Beauvoir sobre a construção histórica e social da condição feminina.", "França", 48.8566, 2.3522),
    "O Senhor dos Anéis": (1954, "Epopeia fantástica de J. R. R. Tolkien que transformou profundamente a literatura de fantasia moderna.", "Reino Unido", 51.7520, -1.2577),
    "O Mundo se Despedaça": (1958, "Romance de Chinua Achebe sobre a sociedade igbo e os impactos do colonialismo britânico na Nigéria.", "Nigéria", 6.5244, 3.3792),
    "Primavera Silenciosa": (1962, "Livro de Rachel Carson que expôs os efeitos ambientais de pesticidas e impulsionou o movimento ambiental moderno.", "Estados Unidos", 38.9072, -77.0369),
    "Pedagogia do Oprimido": (1968, "Obra de Paulo Freire que propõe uma educação dialógica voltada à consciência crítica e à transformação social.", "Brasil", -23.5505, -46.6333),
    "Orientalismo": (1978, "Estudo de Edward Said sobre como representações ocidentais do Oriente se relacionaram ao poder colonial.", "Estados Unidos", 40.7128, -74.0060),
    "Os Filhos da Meia-Noite": (1981, "Romance de Salman Rushdie que relaciona destinos pessoais à independência e à formação da Índia moderna.", "Reino Unido", 51.5074, -0.1278),
    "O Conto da Aia": (1985, "Distopia de Margaret Atwood sobre autoritarismo, fundamentalismo e controle político dos corpos femininos.", "Canadá", 43.6532, -79.3832),
    "Amada": (1987, "Romance de Toni Morrison sobre os traumas da escravidão, a memória e os vínculos familiares nos Estados Unidos.", "Estados Unidos", 40.7128, -74.0060),
    "Harry Potter e a Pedra Filosofal": (1997, "Primeiro volume da série de J. K. Rowling, fenômeno editorial que marcou a literatura juvenil contemporânea.", "Reino Unido", 51.5074, -0.1278),
    "Persépolis": (2000, "Narrativa gráfica autobiográfica de Marjane Satrapi sobre infância, revolução, guerra e identidade iraniana.", "França", 48.8566, 2.3522),
    "Meio Sol Amarelo": (2006, "Romance de Chimamanda Ngozi Adichie sobre relações pessoais e a Guerra de Biafra.", "Nigéria", 6.4527, 7.5103),
    "Jogos Vorazes": (2008, "Distopia juvenil de Suzanne Collins sobre desigualdade, espetáculo midiático e resistência política.", "Estados Unidos", 40.7128, -74.0060),
}


def main():
    created = 0
    updated = 0
    with engine.begin() as connection:
        for name, (year, description, country, latitude, longitude) in BOOKS.items():
            entity_id = connection.execute(
                text("SELECT id FROM history.entity WHERE name=:name AND track='Livros' LIMIT 1"),
                {"name": name},
            ).scalar()
            values = {"name": name, "year": year, "description": description, "country": country,
                      "latitude": latitude, "longitude": longitude}
            if entity_id is None:
                connection.execute(text("""
                    INSERT INTO history.entity
                        (name, entity_type, track, description, origin_country, latitude, longitude, start_year)
                    VALUES (:name, 'Livro', 'Livros', :description, :country, :latitude, :longitude, :year)
                """), values)
                created += 1
            else:
                connection.execute(text("""
                    UPDATE history.entity SET entity_type='Livro', description=:description,
                        origin_country=:country, latitude=:latitude, longitude=:longitude, start_year=:year
                    WHERE id=:entity_id
                """), {**values, "entity_id": entity_id})
                updated += 1
    print(f"Livros adicionados: {created}; atualizados: {updated}; seleção: {len(BOOKS)}")


if __name__ == "__main__":
    main()
