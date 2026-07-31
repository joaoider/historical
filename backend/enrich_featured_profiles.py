"""Adiciona conteúdo aprofundado a uma seleção de perfis individuais."""

from sqlalchemy import text

from app.database import engine


def profile(works, ideas, legacy):
    return {"notable_works": "\n".join(works), "key_ideas": "\n".join(ideas), "legacy": legacy}


PROFILES = {
    "Sócrates": profile(
        ["Método de investigação por diálogo", "Defesa registrada na Apologia", "Ensinamentos preservados por Platão e Xenofonte"],
        ["Conhece-te a ti mesmo", "Virtude ligada ao conhecimento", "Reconhecimento da própria ignorância", "Exame crítico das crenças"],
        "Transformou a filosofia ao colocar o diálogo, a ética e o exame racional da vida no centro da investigação."),
    "Aristóteles": profile(
        ["Ética a Nicômaco", "Política", "Metafísica", "Poética", "Organon", "Da Alma"],
        ["Lógica silogística", "Teoria das quatro causas", "Virtude como justo meio", "Hilemorfismo", "Conhecimento pela observação"],
        "Fundou o Liceu e estruturou campos como lógica, ética, política, biologia, retórica e teoria literária."),
    "Confúcio": profile(
        ["Ensinamentos reunidos nos Analectos", "Tradição dos Cinco Clássicos"],
        ["Ren, humanidade e benevolência", "Li, ritos e conduta adequada", "Piedade filial", "Educação moral", "Governo pelo exemplo"],
        "Seus ensinamentos moldaram sistemas educacionais, políticos e familiares do leste asiático durante mais de dois milênios."),
    "René Descartes": profile(
        ["Discurso do Método", "Meditações Metafísicas", "Princípios da Filosofia", "As Paixões da Alma"],
        ["Dúvida metódica", "Cogito, ergo sum", "Dualismo mente-corpo", "Racionalismo", "Geometria analítica"],
        "Foi decisivo para a filosofia moderna e para a união entre álgebra e geometria que sustenta a matemática analítica."),
    "Immanuel Kant": profile(
        ["Crítica da Razão Pura", "Crítica da Razão Prática", "Crítica da Faculdade de Julgar", "Fundamentação da Metafísica dos Costumes"],
        ["Idealismo transcendental", "Imperativo categórico", "Autonomia moral", "Limites do conhecimento", "Juízo estético"],
        "Reorganizou a epistemologia, a ética e a estética, influenciando profundamente a filosofia posterior."),
    "Friedrich Nietzsche": profile(
        ["Assim Falou Zaratustra", "Além do Bem e do Mal", "Genealogia da Moral", "O Nascimento da Tragédia", "A Gaia Ciência"],
        ["Crítica da moral tradicional", "Vontade de potência", "Eterno retorno", "Perspectivismo", "Transvaloração dos valores"],
        "Sua crítica da moral, da religião e da cultura marcou o existencialismo, a psicologia, a literatura e a teoria crítica."),
    "Galileu Galilei": profile(
        ["Sidereus Nuncius", "Diálogo sobre os Dois Máximos Sistemas do Mundo", "Duas Novas Ciências"],
        ["Observação telescópica", "Defesa do heliocentrismo", "Matematização da natureza", "Estudo do movimento"],
        "Suas observações e experimentos ajudaram a consolidar métodos quantitativos fundamentais para a ciência moderna."),
    "Isaac Newton": profile(
        ["Principia Mathematica", "Óptica", "Desenvolvimento do cálculo"],
        ["Leis do movimento", "Gravitação universal", "Decomposição da luz", "Cálculo infinitesimal"],
        "Estabeleceu uma síntese matemática da mecânica e da gravitação que orientou a física por séculos."),
    "Charles Darwin": profile(
        ["A Origem das Espécies", "A Descendência do Homem", "A Viagem do Beagle"],
        ["Evolução por seleção natural", "Descendência comum", "Adaptação", "Seleção sexual"],
        "Transformou as ciências da vida ao oferecer uma explicação natural e testável para a diversidade das espécies."),
    "Marie Curie": profile(
        ["Pesquisas sobre radioatividade", "Descoberta do polônio", "Descoberta do rádio", "Unidades móveis de radiografia"],
        ["Radioatividade", "Isolamento de elementos radioativos", "Aplicações médicas da radiação"],
        "Foi a primeira pessoa a receber dois prêmios Nobel em áreas científicas diferentes e abriu caminhos para a física nuclear e a medicina."),
    "Albert Einstein": profile(
        ["Relatividade especial", "Relatividade geral", "Explicação do efeito fotoelétrico", "Estudos do movimento browniano"],
        ["Equivalência entre massa e energia", "Espaço-tempo", "Gravitação como geometria", "Quanta de luz"],
        "Reformulou os conceitos de espaço, tempo, energia e gravidade e tornou-se uma figura central da física do século XX."),
    "Ada Lovelace": profile(
        ["Notas sobre a Máquina Analítica", "Algoritmo para números de Bernoulli"],
        ["Computação de propósito geral", "Representação simbólica", "Algoritmos executados por máquinas"],
        "Antecipou possibilidades da computação além do cálculo numérico e é frequentemente reconhecida como pioneira da programação."),
    "Dante Alighieri": profile(
        ["Divina Comédia", "Vida Nova", "Convívio", "Da Monarquia"],
        ["Jornada moral e espiritual", "Justiça e responsabilidade", "Amor como força transformadora", "Política e ordem universal"],
        "Consolidou o italiano como língua literária e criou uma das obras mais influentes da tradição ocidental."),
    "William Shakespeare": profile(
        ["Hamlet", "Macbeth", "Romeu e Julieta", "Otelo", "Rei Lear", "Sonetos"],
        ["Ambição e poder", "Identidade e representação", "Amor e conflito", "Linguagem e condição humana"],
        "Sua dramaturgia transformou o teatro e permanece central na literatura, na língua inglesa e nas artes cênicas."),
    "Miguel de Cervantes": profile(
        ["Dom Quixote", "Novelas Exemplares", "Os Trabalhos de Persiles e Sigismunda"],
        ["Conflito entre ideal e realidade", "Metaficção", "Crítica aos romances de cavalaria", "Multiplicidade de perspectivas"],
        "Dom Quixote tornou-se referência essencial para o desenvolvimento do romance moderno."),
    "Fiódor Dostoiévski": profile(
        ["Crime e Castigo", "Os Irmãos Karamázov", "O Idiota", "Os Demônios", "Memórias do Subsolo"],
        ["Liberdade e responsabilidade", "Culpa e redenção", "Fé e dúvida", "Psicologia do conflito moral"],
        "Sua exploração da consciência influenciou a literatura, a psicologia, o existencialismo e o pensamento religioso."),
    "Machado de Assis": profile(
        ["Memórias Póstumas de Brás Cubas", "Dom Casmurro", "Quincas Borba", "Esaú e Jacó", "O Alienista"],
        ["Narrador não confiável", "Ironia social", "Memória e ciúme", "Crítica da elite brasileira"],
        "É uma figura central da literatura brasileira e um inovador da narrativa moderna em língua portuguesa."),
    "Virginia Woolf": profile(
        ["Mrs Dalloway", "Ao Farol", "Orlando", "As Ondas", "Um Teto Todo Seu"],
        ["Fluxo de consciência", "Tempo psicológico", "Experiência feminina", "Memória e percepção"],
        "Renovou a forma do romance modernista e tornou-se referência para a crítica literária e o pensamento feminista."),
    "Leonardo da Vinci": profile(
        ["Mona Lisa", "A Última Ceia", "Homem Vitruviano", "Cadernos de anatomia e engenharia"],
        ["Observação interdisciplinar", "Perspectiva e sfumato", "Anatomia artística", "Integração entre arte e ciência"],
        "Tornou-se símbolo do ideal renascentista por combinar investigação científica, invenção e produção artística."),
    "Michelangelo": profile(
        ["Davi", "Pietà", "Teto da Capela Sistina", "Juízo Final", "Basílica de São Pedro"],
        ["Monumentalidade", "Expressividade anatômica", "Tensão espiritual", "Integração entre escultura e arquitetura"],
        "Definiu padrões do Alto Renascimento e exerceu influência duradoura sobre escultura, pintura e arquitetura."),
    "Vincent van Gogh": profile(
        ["A Noite Estrelada", "Os Girassóis", "Quarto em Arles", "Os Comedores de Batata", "Autorretratos"],
        ["Cor emocional", "Pincelada expressiva", "Paisagem interior", "Representação da vida cotidiana"],
        "Embora pouco reconhecido em vida, tornou-se uma referência decisiva para o expressionismo e a arte moderna."),
    "Pablo Picasso": profile(
        ["Guernica", "Les Demoiselles d'Avignon", "O Velho Guitarrista", "Mulher Chorando"],
        ["Cubismo", "Fragmentação da perspectiva", "Experimentação formal", "Arte como denúncia política"],
        "Ajudou a redefinir a representação visual no século XX e atuou em pintura, escultura, gravura e cerâmica."),
    "Frida Kahlo": profile(
        ["As Duas Fridas", "A Coluna Partida", "Autorretrato com Colar de Espinhos", "Hospital Henry Ford"],
        ["Autorretrato e identidade", "Corpo e dor", "Cultura mexicana", "Gênero e experiência pessoal"],
        "Sua obra autobiográfica tornou-se referência global para debates sobre identidade, deficiência, gênero e cultura."),
    "Johann Sebastian Bach": profile(
        ["Paixão Segundo São Mateus", "O Cravo Bem Temperado", "Concertos de Brandemburgo", "Missa em Si Menor", "Variações Goldberg"],
        ["Contraponto", "Harmonia tonal", "Forma fugada", "Síntese de tradições musicais europeias"],
        "Sua música tornou-se uma base da tradição ocidental e referência para composição, interpretação e teoria musical."),
    "Wolfgang Amadeus Mozart": profile(
        ["As Bodas de Fígaro", "Don Giovanni", "A Flauta Mágica", "Sinfonia nº 40", "Réquiem"],
        ["Equilíbrio clássico", "Drama musical", "Inovação harmônica", "Virtuosismo instrumental"],
        "Elevou formas como ópera, sinfonia, concerto e música de câmara a novos níveis de expressão e integração dramática."),
    "Ludwig van Beethoven": profile(
        ["Nona Sinfonia", "Quinta Sinfonia", "Sonata ao Luar", "Fidelio", "Últimos quartetos"],
        ["Expansão da forma sinfônica", "Motivo como estrutura", "Expressão individual", "Transição ao romantismo"],
        "Transformou as formas clássicas e consolidou a figura moderna do compositor como criador autônomo."),
    "The Beatles": profile(
        ["Sgt. Pepper's Lonely Hearts Club Band", "Abbey Road", "Revolver", "The White Album", "A Hard Day's Night"],
        ["Composição pop autoral", "Experimentação de estúdio", "Álbum como obra integrada", "Fusão de gêneros"],
        "Mudaram a produção, a composição e o alcance cultural da música popular na segunda metade do século XX."),
    "Tomás de Aquino": profile(
        ["Suma Teológica", "Suma contra os Gentios", "Do Ente e da Essência"],
        ["Síntese entre fé e razão", "Lei natural", "Cinco vias", "Analogia do ser", "Virtudes e finalidade humana"],
        "Sua síntese entre Aristóteles e a teologia cristã tornou-se uma das bases intelectuais do pensamento católico."),
    "Martinho Lutero": profile(
        ["Noventa e Cinco Teses", "Da Liberdade Cristã", "Tradução alemã da Bíblia", "Catecismos"],
        ["Justificação pela fé", "Autoridade das Escrituras", "Sacerdócio de todos os crentes", "Crítica às indulgências"],
        "Iniciou a Reforma Protestante e influenciou profundamente religião, política, educação e língua alemã."),
    "João Calvino": profile(
        ["Institutas da Religião Cristã", "Comentários bíblicos", "Ordenanças Eclesiásticas"],
        ["Soberania divina", "Predestinação", "Disciplina eclesiástica", "Vocação"],
        "Sistematizou a teologia reformada e influenciou comunidades protestantes na Europa e nas Américas."),
    "Søren Kierkegaard": profile(
        ["Ou Isto ou Aquilo", "Temor e Tremor", "O Conceito de Angústia", "A Doença para a Morte"],
        ["Escolha e responsabilidade", "Salto de fé", "Angústia", "Desespero", "Existência individual"],
        "É considerado precursor do existencialismo e um crítico decisivo da religião institucional e dos sistemas filosóficos abstratos."),
    "C.S. Lewis": profile(
        ["Cristianismo Puro e Simples", "As Crônicas de Nárnia", "Cartas de um Diabo a seu Aprendiz", "O Problema do Sofrimento"],
        ["Apologética cristã", "Lei moral", "Imaginação e fé", "Sofrimento e liberdade"],
        "Uniu produção literária, fantasia e apologética, tornando-se um dos autores cristãos mais lidos do século XX."),
    "Cleópatra": profile(
        ["Preservação do poder ptolemaico", "Alianças diplomáticas com Júlio César e Marco Antônio", "Administração do Egito"],
        ["Diplomacia dinástica", "Legitimidade real", "Autonomia egípcia diante de Roma"],
        "Foi a última governante ativa do Egito ptolemaico e tornou-se uma das figuras políticas mais representadas da Antiguidade."),
    "Napoleão Bonaparte": profile(
        ["Código Napoleônico", "Reformas administrativas", "Campanhas napoleônicas", "Reorganização educacional francesa"],
        ["Centralização estatal", "Igualdade civil perante a lei", "Mérito administrativo", "Expansão imperial"],
        "Suas reformas jurídicas e administrativas influenciaram diversos Estados, enquanto suas guerras redesenharam a Europa."),
    "Mahatma Gandhi": profile(
        ["Campanha do sal", "Movimento de não cooperação", "Quit India", "Experimentos com a Verdade"],
        ["Satyagraha", "Não violência", "Desobediência civil", "Autossuficiência", "Pluralismo religioso"],
        "Liderou movimentos decisivos da independência indiana e inspirou campanhas não violentas em várias partes do mundo."),
    "Nelson Mandela": profile(
        ["Luta contra o apartheid", "Presidência da África do Sul", "Comissão da Verdade e Reconciliação", "Longa Caminhada até a Liberdade"],
        ["Democracia multirracial", "Reconciliação", "Igualdade jurídica", "Resistência ao apartheid"],
        "Tornou-se símbolo mundial da luta contra o racismo institucional e da transição democrática sul-africana."),
    "Martin Luther King Jr.": profile(
        ["Marcha sobre Washington", "Campanha de Birmingham", "Marchas de Selma", "Carta da Prisão de Birmingham"],
        ["Não violência", "Desobediência civil", "Igualdade racial", "Justiça econômica", "Comunidade amada"],
        "Foi uma liderança central do movimento dos direitos civis nos Estados Unidos e referência global de ação não violenta."),
}


def main():
    updated = 0
    missing = []
    with engine.begin() as connection:
        for name, values in PROFILES.items():
            result = connection.execute(text("""
                UPDATE history.entity
                SET notable_works=:notable_works, key_ideas=:key_ideas, legacy=:legacy
                WHERE name=:name
            """), {"name": name, **values})
            if result.rowcount:
                updated += result.rowcount
            else:
                missing.append(name)
    print(f"Perfis atualizados: {updated}; nomes da seleção: {len(PROFILES)}")
    if missing:
        print("Não encontrados: " + ", ".join(missing))


if __name__ == "__main__":
    main()
