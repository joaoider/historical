"""Cria uma seleção inicial de relações históricas entre registros existentes."""

from sqlalchemy import select

from app.database import SessionLocal
from app.models import Entity, Relationship


RELATIONSHIPS = [
    ("Platão", "influenciou", "Aristóteles", "Aristóteles estudou na Academia de Platão."),
    ("Platão", "influenciou", "Agostinho de Hipona", "O platonismo marcou a formação filosófica de Agostinho."),
    ("Aristóteles", "influenciou", "Tomás de Aquino", "A filosofia aristotélica foi central para a síntese escolástica de Aquino."),
    ("Euclides", "influenciou", "René Descartes", "O método geométrico foi uma referência para o racionalismo moderno."),
    ("René Descartes", "influenciou", "Isaac Newton", "A geometria analítica integrou a base matemática da física moderna."),
    ("Nicolau Copérnico", "influenciou", "Galileu Galilei", "Galileu defendeu e desenvolveu consequências do heliocentrismo."),
    ("Galileu Galilei", "influenciou", "Isaac Newton", "A mecânica de Galileu preparou princípios usados por Newton."),
    ("Isaac Newton", "influenciou", "Albert Einstein", "A relatividade reformulou os limites da mecânica newtoniana."),
    ("Immanuel Kant", "influenciou", "G. W. F. Hegel", "Hegel desenvolveu sua filosofia em diálogo crítico com Kant."),
    ("G. W. F. Hegel", "influenciou", "Karl Marx", "Marx transformou criticamente elementos da dialética hegeliana."),
    ("Charles Darwin", "influenciou", "Sigmund Freud", "O pensamento evolucionista integrou o contexto intelectual de Freud."),
    ("Alan Turing", "influenciou", "John von Neumann", "Computabilidade e arquitetura de computadores se desenvolveram em campos próximos."),
    ("Charles Babbage", "influenciou", "Ada Lovelace", "Lovelace trabalhou sobre a Máquina Analítica concebida por Babbage."),
    ("Blaise Pascal", "contribuiu para", "Thomas Bayes", "A teoria inicial das probabilidades antecedeu a inferência bayesiana."),
    ("Thomas Bayes", "influenciou", "Ronald Fisher", "A inferência estatística moderna dialoga com tradições bayesianas e frequentistas."),
    ("Florence Nightingale", "contribuiu para", "Karl Pearson", "A estatística aplicada à saúde precedeu sua institucionalização moderna."),
    ("Martinho Lutero", "influenciou", "João Calvino", "A Reforma de Lutero precedeu e influenciou a tradição reformada."),
    ("Agostinho de Hipona", "influenciou", "Martinho Lutero", "A leitura de Agostinho marcou a teologia da Reforma."),
    ("Tomás de Aquino", "influenciou", "Duns Scotus", "Scotus desenvolveu posições escolásticas em diálogo crítico com Aquino."),
    ("Friedrich Schleiermacher", "influenciou", "Karl Barth", "Barth reagiu criticamente à tradição liberal associada a Schleiermacher."),
    ("Karl Barth", "influenciou", "Dietrich Bonhoeffer", "Bonhoeffer estudou e dialogou intensamente com a teologia de Barth."),
    ("Jonathan Edwards", "influenciou", "George Whitefield", "Ambos foram referências do Grande Despertamento."),
    ("John Wesley", "contemporâneo de", "George Whitefield", "Atuaram no avivamento britânico do século XVIII."),
]


def seed():
    with SessionLocal() as session:
        entities = {entity.name: entity for entity in session.scalars(select(Entity)).all()}
        existing = {
            (item.source_entity_id, item.relationship_type, item.target_entity_id)
            for item in session.scalars(select(Relationship)).all()
        }
        created = 0
        skipped = []
        for source_name, relation_type, target_name, notes in RELATIONSHIPS:
            source = entities.get(source_name)
            target = entities.get(target_name)
            if not source or not target:
                skipped.append((source_name, target_name))
                continue
            key = (source.id, relation_type, target.id)
            if key in existing:
                continue
            session.add(Relationship(
                source_entity_id=source.id,
                target_entity_id=target.id,
                relationship_type=relation_type,
                notes=notes,
            ))
            existing.add(key)
            created += 1
        session.commit()
        print(f"{created} relações criadas; {len(skipped)} ignoradas por ausência de registro.")
        for pair in skipped:
            print("-", " -> ".join(pair))


if __name__ == "__main__":
    seed()
