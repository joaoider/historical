from sqlalchemy import text

from app.database import engine


def main():
    with engine.begin() as connection:
        connection.execute(
            text("ALTER TABLE history.entity ADD COLUMN IF NOT EXISTS origin_country VARCHAR(120)")
        )
        connection.execute(
            text("ALTER TABLE history.entity ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION")
        )
        connection.execute(
            text("ALTER TABLE history.entity ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION")
        )

    print("Campos geográficos adicionados.")


if __name__ == "__main__":
    main()
