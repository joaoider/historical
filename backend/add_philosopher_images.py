from sqlalchemy import text

from app.database import engine


IMAGE_URLS = {
    "Tales de Mileto": "/images/philosophers/thales.jpg",
    "Anaxímenes": "/images/philosophers/anaximenes.jpg",
    "Anaximandro": "/images/philosophers/anaximander.jpg",
    "Pitágoras": "/images/philosophers/pythagoras.jpg",
    "Heráclito": "/images/philosophers/heraclitus.jpg",
    "Confúcio": "/images/philosophers/confucius.png",
    "Parmênides": "/images/philosophers/parmenides.jpg",
    "Sócrates": "/images/philosophers/socrates.jpg",
    "Platão": "/images/philosophers/plato.png",
    "Aristóteles": "/images/philosophers/aristotle.jpg",
}


def main():
    with engine.begin() as connection:
        connection.execute(
            text("ALTER TABLE history.entity ADD COLUMN IF NOT EXISTS image_url VARCHAR(500)")
        )

        for name, image_url in IMAGE_URLS.items():
            connection.execute(
                text(
                    """
                    UPDATE history.entity
                    SET image_url = :image_url
                    WHERE name = :name AND track = 'Filósofos'
                    """
                ),
                {"name": name, "image_url": image_url},
            )

    print(f"{len(IMAGE_URLS)} imagens de filósofos adicionadas.")


if __name__ == "__main__":
    main()
