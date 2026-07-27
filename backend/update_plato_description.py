from sqlalchemy import text

from app.database import engine


DESCRIPTION = (
    "Discípulo de Sócrates e fundador da Academia de Atenas.\n"
    "Principais obras: A República, O Banquete, Fédon, Apologia de Sócrates, "
    "Timeu e As Leis."
)


def main():
    with engine.begin() as connection:
        result = connection.execute(
            text(
                """
                UPDATE history.entity
                SET description = :description
                WHERE id = 2 AND track = 'Filósofos' AND start_year = -428
                """
            ),
            {"description": DESCRIPTION},
        )

    print(f"Descrições atualizadas: {result.rowcount}")


if __name__ == "__main__":
    main()
