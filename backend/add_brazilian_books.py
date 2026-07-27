from sqlalchemy import select

from backend.app.database import SessionLocal
from backend.app.models import Entity


BOOKS = {
    "Marília de Dirceu": (1792, "Tomás Antônio Gonzaga"),
    "A Moreninha": (1844, "Joaquim Manuel de Macedo"),
    "Memórias de um Sargento de Milícias": (1852, "Manuel Antônio de Almeida"),
    "Iracema": (1865, "José de Alencar"),
    "Senhora": (1875, "José de Alencar"),
    "Memórias Póstumas de Brás Cubas": (1881, "Machado de Assis"),
    "O Ateneu": (1888, "Raul Pompeia"),
    "O Cortiço": (1890, "Aluísio Azevedo"),
    "Quincas Borba": (1891, "Machado de Assis"),
    "Os Sertões": (1902, "Euclides da Cunha"),
    "Triste Fim de Policarpo Quaresma": (1915, "Lima Barreto"),
    "Macunaíma": (1928, "Mário de Andrade"),
    "Capitães da Areia": (1937, "Jorge Amado"),
    "Vidas Secas": (1938, "Graciliano Ramos"),
    "Morte e Vida Severina": (1955, "João Cabral de Melo Neto"),
    "O Auto da Compadecida": (1955, "Ariano Suassuna"),
    "Grande Sertão: Veredas": (1956, "João Guimarães Rosa"),
    "Laços de Família": (1960, "Clarice Lispector"),
    "Quarto de Despejo": (1960, "Carolina Maria de Jesus"),
    "Incidente em Antares": (1971, "Erico Verissimo"),
    "Lavoura Arcaica": (1975, "Raduan Nassar"),
    "A Hora da Estrela": (1977, "Clarice Lispector"),
    "Dois Irmãos": (2000, "Milton Hatoum"),
    "Ponciá Vicêncio": (2003, "Conceição Evaristo"),
    "Torto Arado": (2019, "Itamar Vieira Junior"),
}


def main():
    database = SessionLocal()
    created = 0
    updated = 0

    try:
        existing = {
            entity.name: entity
            for entity in database.scalars(
                select(Entity).where(Entity.track == "Livros", Entity.name.in_(BOOKS))
            )
        }

        for name, (year, author) in BOOKS.items():
            entity = existing.get(name)
            if entity is None:
                entity = Entity(name=name)
                database.add(entity)
                created += 1
            else:
                updated += 1

            entity.entity_type = "Livro"
            entity.track = "Livros"
            entity.start_year = year
            entity.description = f"Autor: {author}."
            entity.origin_country = "Brasil"
            entity.latitude = -14.235
            entity.longitude = -51.925

        database.commit()
        print(f"Livros brasileiros criados: {created} | atualizados: {updated}")
    except Exception:
        database.rollback()
        raise
    finally:
        database.close()


if __name__ == "__main__":
    main()
