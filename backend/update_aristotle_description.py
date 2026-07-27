from sqlalchemy import text

from app.database import engine


DESCRIPTION = (
    "Discípulo de Platão, tutor de Alexandre, o Grande, e fundador do Liceu em Atenas.\n"
    "Principais obras: Ética a Nicômaco, Política, Metafísica, Poética, "
    "De Anima e Organon."
)


def main():
    with engine.begin() as connection:
        result = connection.execute(
            text(
                """
                UPDATE history.entity
                SET description = :description
                WHERE name = :name AND track = 'Filósofos' AND start_year = -384
                """
            ),
            {"name": "Aristóteles", "description": DESCRIPTION},
        )

    print(f"Descrições atualizadas: {result.rowcount}")


if __name__ == "__main__":
    main()
