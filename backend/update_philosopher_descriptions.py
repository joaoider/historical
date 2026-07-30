"""Substitui descrições genéricas dos filósofos por resumos curtos."""

from app.database import SessionLocal
from app.models import Entity


DESCRIPTIONS = {
    "Tales de Mileto": "Pensador pré-socrático da Escola de Mileto que buscou na água o princípio fundamental da natureza.",
    "Anaximandro": "Pensador pré-socrático que propôs o ápeiron, princípio ilimitado e indeterminado, como origem de todas as coisas.",
    "Anaxímenes": "Filósofo milesiano que considerou o ar o princípio básico da realidade e explicou mudanças por condensação e rarefação.",
    "Lao-Tsé": "Sábio tradicionalmente associado ao Tao Te Ching e à origem do taoismo filosófico.",
    "Pitágoras": "Filósofo e matemático grego que relacionou números, harmonia musical e a ordem do cosmos.",
    "Confúcio": "Pensador chinês que ensinou uma ética baseada em virtude, ritos, educação e responsabilidade nas relações humanas.",
    "Heráclito": "Filósofo pré-socrático que destacou a mudança constante do mundo e o logos que organiza seus opostos.",
    "Parmênides": "Fundador da escola eleata, defendeu que o ser é uno, eterno e imutável.",
    "Sócrates": "Filósofo ateniense que usava o diálogo e perguntas para investigar a virtude, o conhecimento e a vida justa.",
    "Platão": "Discípulo de Sócrates, autor de diálogos filosóficos e fundador da Academia de Atenas.",
    "Aristóteles": "Discípulo de Platão e fundador do Liceu, escreveu estudos fundamentais sobre lógica, ética, política e natureza.",
    "Séneca": "Filósofo estoico romano que escreveu sobre virtude, serenidade, tempo e preparação diante das adversidades.",
    "Epicteto": "Mestre estoico que ensinou a distinguir aquilo que depende de nós daquilo que não podemos controlar.",
    "Marco Aurélio": "Imperador romano e filósofo estoico, autor de Meditações, obra sobre dever, disciplina e aceitação.",
    "Agostinho de Hipona": "Pensador cristão que articulou fé e filosofia platônica em reflexões sobre tempo, memória, liberdade e graça.",
    "Boécio": "Filósofo romano que ajudou a transmitir a tradição grega ao pensamento medieval e escreveu A Consolação da Filosofia.",
    "Averróis": "Filósofo andalusino conhecido por seus comentários a Aristóteles e pela defesa da investigação racional.",
    "Thomas Hobbes": "Filósofo político inglês que justificou no Leviatã um poder soberano capaz de assegurar paz e ordem.",
    "René Descartes": "Filósofo racionalista que desenvolveu a dúvida metódica e tomou o cogito como ponto inicial do conhecimento.",
    "Baruch Spinoza": "Filósofo racionalista que identificou Deus e Natureza e relacionou liberdade à compreensão das causas.",
    "John Locke": "Filósofo empirista que defendeu direitos naturais, governo por consentimento e a origem experimental do conhecimento.",
    "Gottfried Wilhelm Leibniz": "Filósofo, lógico e matemático que propôs uma realidade formada por mônadas e uma harmonia preestabelecida.",
    "David Hume": "Filósofo empirista e cético que investigou experiência, causalidade, hábitos, paixões e limites da razão.",
    "Jean-Jacques Rousseau": "Filósofo que defendeu soberania popular e examinou as relações entre sociedade, liberdade e desigualdade.",
    "Immanuel Kant": "Filósofo que investigou os limites da razão e formulou uma ética do dever baseada no imperativo categórico.",
    "G. W. F. Hegel": "Filósofo idealista que compreendeu realidade e história como processos de desenvolvimento dialético.",
    "Schopenhauer": "Filósofo que descreveu o mundo como vontade e representação e enfatizou sofrimento, arte e compaixão.",
    "Søren Kierkegaard": "Pensador dinamarquês que explorou escolha individual, angústia, desespero e o salto da fé.",
    "Karl Marx": "Filósofo e crítico da economia política que analisou capitalismo, luta de classes, trabalho e transformação histórica.",
    "Friedrich Nietzsche": "Filósofo que criticou a moral tradicional e investigou niilismo, criação de valores e vontade de potência.",
    "Ludwig Wittgenstein": "Filósofo que reformulou o estudo da linguagem, primeiro por sua estrutura lógica e depois por seus usos cotidianos.",
    "Jean-Paul Sartre": "Filósofo existencialista que afirmou a liberdade e a responsabilidade humanas em um mundo sem essência predeterminada.",
    "Albert Camus": "Escritor e pensador que examinou o absurdo, a revolta e a busca humana por sentido.",
    "Michel Foucault": "Filósofo que estudou como saber, instituições e práticas sociais produzem relações de poder e formas de subjetividade.",
    "Jürgen Habermas": "Filósofo da Escola de Frankfurt que desenvolveu a teoria do agir comunicativo e da democracia deliberativa."
}


def main():
    with SessionLocal() as session:
        philosophers = session.query(Entity).filter(Entity.track == "Filósofos").all()
        updated = 0
        for philosopher in philosophers:
            description = DESCRIPTIONS.get(philosopher.name)
            if description:
                philosopher.description = description
                updated += 1
        session.commit()
        print(f"Descrições atualizadas: {updated}")


if __name__ == "__main__":
    main()
