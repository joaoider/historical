from sqlalchemy import text

from app.database import engine


LOCATIONS = {
    "Tales de Mileto": ("Turquia", 37.530, 27.280),
    "Anaximandro": ("Turquia", 37.530, 27.280),
    "Anaxímenes": ("Turquia", 37.530, 27.280),
    "Pitágoras": ("Grécia", 37.754, 26.978),
    "Heráclito": ("Turquia", 37.939, 27.341),
    "Confúcio": ("China", 35.596, 116.991),
    "Parmênides": ("Itália", 40.162, 15.155),
    "Sócrates": ("Grécia", 37.984, 23.728),
    "Platão": ("Grécia", 37.984, 23.728),
    "Aristóteles": ("Grécia", 40.530, 23.750),
    "Lao-Tsé": ("China", 33.870, 115.480),
    "Sêneca": ("Espanha", 37.888, -4.779),
    "Epicteto": ("Turquia", 37.926, 29.126),
    "Marco Aurélio": ("Itália", 41.903, 12.496),
    "Agostinho de Hipona": ("Argélia", 36.286, 7.954),
    "Boécio": ("Itália", 41.903, 12.496),
    "Averróis": ("Espanha", 37.888, -4.779),
    "Thomas Hobbes": ("Reino Unido", 51.186, -2.194),
    "René Descartes": ("França", 46.974, 0.699),
    "John Locke": ("Reino Unido", 51.350, -2.770),
    "Baruch Spinoza": ("Países Baixos", 52.367, 4.904),
    "Gottfried Wilhelm Leibniz": ("Alemanha", 51.340, 12.375),
    "David Hume": ("Reino Unido", 55.953, -3.189),
    "Jean-Jacques Rousseau": ("Suíça", 46.204, 6.143),
    "Immanuel Kant": ("Rússia", 54.710, 20.510),
    "G. W. F. Hegel": ("Alemanha", 48.776, 9.183),
    "Schopenhauer": ("Polônia", 54.352, 18.646),
    "Søren Kierkegaard": ("Dinamarca", 55.676, 12.568),
    "Karl Marx": ("Alemanha", 49.750, 6.637),
    "Friedrich Nietzsche": ("Alemanha", 51.209, 11.948),
    "Ludwig Wittgenstein": ("Áustria", 48.208, 16.373),
    "Jean-Paul Sartre": ("França", 48.857, 2.352),
    "Albert Camus": ("Argélia", 36.883, 8.333),
    "Michel Foucault": ("França", 46.580, 0.340),
    "Jürgen Habermas": ("Alemanha", 51.257, 7.150),
}


def main():
    updated = 0
    with engine.begin() as connection:
        for name, (country, latitude, longitude) in LOCATIONS.items():
            result = connection.execute(
                text(
                    """
                    UPDATE history.entity
                    SET origin_country = :country,
                        latitude = :latitude,
                        longitude = :longitude
                    WHERE name = :name AND track = 'Filósofos'
                    """
                ),
                {
                    "name": name,
                    "country": country,
                    "latitude": latitude,
                    "longitude": longitude,
                },
            )
            updated += result.rowcount

        # Compatibilidade com a composição Unicode do registro legado de Sêneca.
        connection.execute(
            text(
                """
                UPDATE history.entity
                SET origin_country = 'Espanha', latitude = 37.888, longitude = -4.779
                WHERE track = 'Filósofos' AND start_year = -4
                """
            )
        )

    print(f"Localizações de filósofos atualizadas: {updated}")


if __name__ == "__main__":
    main()
