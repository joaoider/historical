from sqlalchemy import bindparam, text

from app.database import engine


PHILOSOPHER_IDS = (44, 22, 31)


def main():
    with engine.begin() as connection:
        result = connection.execute(
            text(
                """
                DELETE FROM history.entity
                WHERE id IN :ids AND track = 'Filósofos'
                """
            ).bindparams(bindparam("ids", expanding=True)),
            {"ids": PHILOSOPHER_IDS},
        )

    print(f"Registros removidos: {result.rowcount}")


if __name__ == "__main__":
    main()
