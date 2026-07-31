"""Atualiza os resumos dos cientistas exibidos nas timelines."""

from app.database import SessionLocal
from app.models import Entity


DESCRIPTIONS = {
    "Hipócrates": "Médico grego associado à consolidação da medicina como prática baseada na observação e no raciocínio clínico.",
    "Euclides": "Matemático da Antiguidade, autor de Os Elementos, obra fundamental para a organização da geometria.",
    "Aristarco de Samos": "Astrônomo grego que propôs um modelo no qual a Terra gira ao redor do Sol.",
    "Arquimedes": "Matemático e inventor grego que formulou princípios fundamentais da mecânica e da hidrostática.",
    "Eratóstenes": "Matemático e geógrafo grego que realizou uma célebre estimativa da circunferência da Terra.",
    "Ptolomeu": "Astrônomo e geógrafo da Antiguidade cujo modelo geocêntrico influenciou a astronomia por muitos séculos.",
    "Galeno": "Médico greco-romano cujos estudos de anatomia e fisiologia orientaram a medicina durante séculos.",
    "Hipátia": "Matemática, astrônoma e filósofa de Alexandria, conhecida por seu ensino e comentários de obras científicas.",
    "Al-Khwarizmi": "Matemático persa cujas obras ajudaram a consolidar a álgebra e difundiram o sistema de numeração indo-arábico.",
    "Alhazen": "Cientista árabe pioneiro no estudo experimental da óptica, da visão e do comportamento da luz.",
    "Al-Biruni": "Sábio persa que produziu estudos rigorosos de astronomia, matemática, geografia e culturas comparadas.",
    "Avicena": "Médico e filósofo persa, autor do Cânone da Medicina, referência médica durante vários séculos.",
    "Omar Khayyam": "Matemático, astrônomo e poeta persa que estudou equações cúbicas e participou da reforma do calendário.",
    "Nicolau Copérnico": "Astrônomo que formulou um modelo heliocêntrico, colocando os planetas em órbita ao redor do Sol.",
    "Tycho Brahe": "Astrônomo conhecido por observações planetárias extremamente precisas realizadas antes do telescópio.",
    "Galileu Galilei": "Físico e astrônomo que aprimorou observações telescópicas e investigou matematicamente o movimento.",
    "Johannes Kepler": "Astrônomo que formulou as três leis matemáticas do movimento dos planetas.",
    "William Harvey": "Médico inglês que demonstrou a circulação do sangue impulsionada pelo coração.",
    "Blaise Pascal": "Matemático e físico francês que contribuiu para a probabilidade, a geometria e o estudo da pressão.",
    "Robert Boyle": "Químico e físico associado à lei que relaciona pressão e volume dos gases.",
    "Christiaan Huygens": "Físico e astrônomo neerlandês que desenvolveu uma teoria ondulatória da luz e aperfeiçoou relógios de pêndulo.",
    "Antonie van Leeuwenhoek": "Microscopista neerlandês que realizou observações pioneiras de microrganismos e células.",
    "Robert Hooke": "Cientista inglês que investigou elasticidade, microscopia e cunhou o termo célula em contexto biológico.",
    "Isaac Newton": "Matemático, físico e astrônomo que formulou as leis do movimento e da gravitação universal.",
    "Benjamin Franklin": "Cientista e inventor que realizou experimentos fundamentais sobre eletricidade e desenvolveu o para-raios.",
    "Carl Linnaeus": "Naturalista sueco que sistematizou a nomenclatura binomial usada na classificação dos seres vivos.",
    "Leonhard Euler": "Matemático suíço que realizou contribuições decisivas à análise, à teoria dos números e à mecânica.",
    "Antoine Lavoisier": "Químico francês que estabeleceu a conservação da massa e ajudou a reformular a nomenclatura química.",
    "Alessandro Volta": "Físico italiano que criou a pilha voltaica, uma das primeiras fontes contínuas de corrente elétrica.",
    "Edward Jenner": "Médico inglês que desenvolveu a primeira vacina bem-sucedida contra a varíola.",
    "John Dalton": "Químico e físico inglês que formulou uma teoria atômica moderna da matéria.",
    "Michael Faraday": "Físico e químico que descobriu a indução eletromagnética e lançou bases para motores e geradores elétricos.",
    "Charles Darwin": "Naturalista inglês que explicou a evolução das espécies pelo mecanismo da seleção natural.",
    "Ada Lovelace": "Matemática inglesa que descreveu um algoritmo para a Máquina Analítica e antecipou possibilidades da computação.",
    "Louis Pasteur": "Químico e microbiologista francês que desenvolveu a pasteurização e contribuiu para a teoria germinal das doenças.",
    "Gregor Mendel": "Naturalista que identificou princípios fundamentais da hereditariedade por meio de experimentos com ervilhas.",
    "James Clerk Maxwell": "Físico escocês que unificou eletricidade, magnetismo e luz em uma teoria matemática.",
    "Dmitri Mendeleev": "Químico russo que organizou a tabela periódica e previu propriedades de elementos ainda desconhecidos.",
    "Thomas Edison": "Inventor e empresário que desenvolveu sistemas práticos de iluminação, gravação sonora e distribuição elétrica.",
    "Alexander Graham Bell": "Inventor e pesquisador conhecido pelo desenvolvimento e patenteamento de um dos primeiros telefones práticos.",
    "Nikola Tesla": "Inventor e engenheiro que contribuiu para sistemas de corrente alternada, motores e tecnologias de alta frequência.",
    "Max Planck": "Físico alemão que introduziu a quantização da energia e iniciou o desenvolvimento da teoria quântica.",
    "Marie Curie": "Física e química pioneira no estudo da radioatividade e primeira pessoa a receber dois prêmios Nobel em áreas científicas distintas.",
    "Albert Einstein": "Físico que formulou as teorias da relatividade e explicou o efeito fotoelétrico em termos de quanta de luz.",
    "Niels Bohr": "Físico dinamarquês que desenvolveu um modelo quântico do átomo e contribuiu para a interpretação da mecânica quântica.",
    "Erwin Schrödinger": "Físico austríaco que formulou uma equação central para descrever a evolução de sistemas quânticos.",
    "Edwin Hubble": "Astrônomo que apresentou evidências de galáxias além da Via Láctea e da expansão do Universo.",
    "Enrico Fermi": "Físico italiano que contribuiu para a física nuclear, a teoria quântica e o desenvolvimento do primeiro reator nuclear.",
    "Werner Heisenberg": "Físico alemão que formulou a mecânica matricial e o princípio da incerteza.",
    "J. Robert Oppenheimer": "Físico teórico que dirigiu o laboratório de Los Alamos durante o Projeto Manhattan.",
    "Alan Turing": "Matemático e pioneiro da computação que formalizou conceitos de algoritmo e participou da criptoanálise na Segunda Guerra.",
    "Richard Feynman": "Físico norte-americano conhecido por contribuições à eletrodinâmica quântica e por seus diagramas de partículas.",
    "Rosalind Franklin": "Química e cristalógrafa cujas imagens de difração de raios X foram essenciais para compreender a estrutura do DNA.",
    "Carl Sagan": "Astrônomo e divulgador científico que pesquisou atmosferas planetárias e popularizou a exploração do cosmos.",
    "Jane Goodall": "Primatóloga britânica conhecida por seu estudo de longa duração sobre chimpanzés selvagens em Gombe.",
    "Kip Thorne": "Físico teórico especializado em relatividade, buracos negros e ondas gravitacionais.",
    "Stephen Hawking": "Físico teórico que investigou buracos negros, cosmologia e a radiação que leva seu nome.",
    "Tim Berners-Lee": "Cientista da computação britânico que criou a World Wide Web e seus fundamentos técnicos iniciais.",
}


def main():
    with SessionLocal() as session:
        scientists = session.query(Entity).filter(Entity.track == "Cientistas").all()
        for scientist in scientists:
            if scientist.name in DESCRIPTIONS:
                scientist.description = DESCRIPTIONS[scientist.name]
        session.commit()
        print(f"Descrições atualizadas: {sum(item.name in DESCRIPTIONS for item in scientists)}")


if __name__ == "__main__":
    main()
