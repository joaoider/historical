"""Adiciona imagens locais e resumos em português aos cientistas."""

import json
import mimetypes
import re
import time
import unicodedata
from pathlib import Path
from urllib.parse import quote
from urllib.error import HTTPError
from urllib.request import Request, urlopen

from sqlalchemy import text

from app.database import engine


PROJECT_ROOT = Path(__file__).resolve().parents[1]
IMAGE_DIRECTORY = PROJECT_ROOT / "frontend" / "public" / "images" / "scientists"
USER_AGENT = "HistoricalTimeline/1.0 (educational project; local development)"

# Correções de registros cuja localização automática anterior apontou para um
# país historicamente ou geograficamente incompatível com o nascimento.
LOCATION_CORRECTIONS = {
    "Euclides": ("Egito", 31.2001, 29.9187),
    "Arquimedes": ("Itália", 37.0755, 15.2866),
    "Galeno": ("Turquia", 39.1214, 27.1809),
    "Ada Lovelace": ("Reino Unido", 51.5074, -0.1278),
    "Tim Berners-Lee": ("Reino Unido", 51.5074, -0.1278),
}

ENGLISH_PAGES = {
    "Hipócrates": "Hippocrates", "Euclides": "Euclid", "Aristarco de Samos": "Aristarchus of Samos",
    "Arquimedes": "Archimedes", "Eratóstenes": "Eratosthenes", "Ptolomeu": "Ptolemy",
    "Galeno": "Galen", "Hipátia": "Hypatia", "Al-Khwarizmi": "Muhammad ibn Musa al-Khwarizmi",
    "Alhazen": "Ibn al-Haytham", "Al-Biruni": "Al-Biruni", "Avicena": "Avicenna",
    "Omar Khayyam": "Omar Khayyam", "Nicolau Copérnico": "Nicolaus Copernicus", "Tycho Brahe": "Tycho Brahe",
    "Galileu Galilei": "Galileo Galilei", "Johannes Kepler": "Johannes Kepler", "William Harvey": "William Harvey",
    "Blaise Pascal": "Blaise Pascal", "Robert Boyle": "Robert Boyle", "Christiaan Huygens": "Christiaan Huygens",
    "Antonie van Leeuwenhoek": "Antonie van Leeuwenhoek", "Robert Hooke": "Robert Hooke", "Isaac Newton": "Isaac Newton",
    "Benjamin Franklin": "Benjamin Franklin", "Carl Linnaeus": "Carl Linnaeus", "Leonhard Euler": "Leonhard Euler",
    "Antoine Lavoisier": "Antoine Lavoisier", "Alessandro Volta": "Alessandro Volta", "Edward Jenner": "Edward Jenner",
    "John Dalton": "John Dalton", "Michael Faraday": "Michael Faraday", "Charles Darwin": "Charles Darwin",
    "Ada Lovelace": "Ada Lovelace", "Louis Pasteur": "Louis Pasteur", "Gregor Mendel": "Gregor Mendel",
    "James Clerk Maxwell": "James Clerk Maxwell", "Dmitri Mendeleev": "Dmitri Mendeleev", "Thomas Edison": "Thomas Edison",
    "Alexander Graham Bell": "Alexander Graham Bell", "Nikola Tesla": "Nikola Tesla", "Max Planck": "Max Planck",
    "Marie Curie": "Marie Curie", "Albert Einstein": "Albert Einstein", "Niels Bohr": "Niels Bohr",
    "Erwin Schrödinger": "Erwin Schrödinger", "Edwin Hubble": "Edwin Hubble", "Enrico Fermi": "Enrico Fermi",
    "Werner Heisenberg": "Werner Heisenberg", "J. Robert Oppenheimer": "J. Robert Oppenheimer", "Alan Turing": "Alan Turing",
    "Richard Feynman": "Richard Feynman", "Rosalind Franklin": "Rosalind Franklin", "Carl Sagan": "Carl Sagan",
    "Jane Goodall": "Jane Goodall", "Kip Thorne": "Kip Thorne", "Stephen Hawking": "Stephen Hawking",
    "Tim Berners-Lee": "Tim Berners-Lee",
}


def open_with_retry(request, timeout):
    for attempt in range(6):
        try:
            return urlopen(request, timeout=timeout)
        except HTTPError as error:
            if error.code != 429 or attempt == 5:
                raise
            retry_after = error.headers.get("Retry-After")
            wait_seconds = int(retry_after) if retry_after and retry_after.isdigit() else 8 * (attempt + 1)
            print(f"Limite temporário; nova tentativa em {wait_seconds}s...")
            time.sleep(wait_seconds)


def request_json(url):
    request = Request(url, headers={"User-Agent": USER_AGENT})
    with open_with_retry(request, 45) as response:
        return json.load(response)


def download(url, destination):
    request = Request(url, headers={"User-Agent": USER_AGENT})
    with open_with_retry(request, 60) as response:
        destination.write_bytes(response.read())
        return response.headers.get_content_type()


def safe_filename(name):
    normalized = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", "-", normalized.lower()).strip("-")


def existing_local_image(name):
    matches = list(IMAGE_DIRECTORY.glob(f"{safe_filename(name)}.*"))
    matches = [path for path in matches if path.name != "sources.json"]
    return f"/images/scientists/{matches[0].name}" if matches else None


def short_summary(extract):
    clean = " ".join(extract.split())
    sentences = re.split(r"(?<=[.!?])\s+", clean)
    summary = " ".join(sentences[:2])
    if len(summary) > 420:
        summary = summary[:417].rsplit(" ", 1)[0] + "..."
    return summary


def find_page(name):
    title = ENGLISH_PAGES[name]
    summary = request_json(f"https://en.wikipedia.org/api/rest_v1/page/summary/{quote(title)}")
    return {
        "title": summary.get("title"),
        "extract": "",  # Não substituir textos em português por conteúdo em inglês.
        "thumbnail": summary.get("thumbnail"),
        "fullurl": summary.get("content_urls", {}).get("desktop", {}).get("page"),
    }


def main():
    IMAGE_DIRECTORY.mkdir(parents=True, exist_ok=True)
    manifest_path = IMAGE_DIRECTORY / "sources.json"
    sources = json.loads(manifest_path.read_text(encoding="utf-8")) if manifest_path.exists() else {}

    with engine.connect() as connection:
        scientists = connection.execute(
            text("SELECT name, image_url FROM history.entity WHERE track = 'Cientistas' ORDER BY start_year")
        ).mappings().all()

    updates = []
    for scientist in scientists:
        name = scientist["name"]
        local_image = existing_local_image(name)
        if local_image and not scientist["image_url"]:
            with engine.begin() as connection:
                connection.execute(
                    text("UPDATE history.entity SET image_url = :image_url WHERE name = :name AND track = 'Cientistas'"),
                    {"name": name, "image_url": local_image},
                )
            scientist = {**scientist, "image_url": local_image}
            sources.setdefault(name, {"page": None, "image": None, "local_path": local_image})
            print(f"Arquivo local sincronizado: {name}")
        if scientist["image_url"] and name in sources:
            print(f"Já concluído: {name}")
            continue
        try:
            page = find_page(name)
            if not page:
                print(f"Página não encontrada: {name}")
                continue

            values = {"name": name, "description": short_summary(page.get("extract", "")) or None}
            image_url = page.get("thumbnail", {}).get("source")
            if image_url:
                guessed_type = mimetypes.guess_type(image_url)[0] or "image/jpeg"
                extension = mimetypes.guess_extension(guessed_type) or ".jpg"
                destination = IMAGE_DIRECTORY / f"{safe_filename(name)}{extension}"
                downloaded_type = download(image_url, destination)
                actual_extension = mimetypes.guess_extension(downloaded_type) or extension
                if destination.suffix != actual_extension:
                    corrected = destination.with_suffix(actual_extension)
                    destination.replace(corrected)
                    destination = corrected
                values["image_url"] = f"/images/scientists/{destination.name}"

            updates.append(values)
            sources[name] = {
                "page": page.get("fullurl"),
                "image": image_url,
                "local_path": values.get("image_url"),
            }
            print(f"Preparado: {name} -> {page.get('title')}")
            with engine.begin() as connection:
                connection.execute(
                    text(
                        """
                        UPDATE history.entity
                        SET description = COALESCE(:description, description),
                            image_url = COALESCE(:image_url, image_url)
                        WHERE name = :name AND track = 'Cientistas'
                        """
                    ),
                    {"image_url": None, **values},
                )
            manifest_path.write_text(json.dumps(sources, ensure_ascii=False, indent=2), encoding="utf-8")
            time.sleep(1)
        except Exception as error:
            print(f"Falha em {name}: {error}")

    with engine.begin() as connection:
        for values in updates:
            connection.execute(
                text(
                    """
                    UPDATE history.entity
                    SET description = COALESCE(:description, description),
                        image_url = COALESCE(:image_url, image_url)
                    WHERE name = :name AND track = 'Cientistas'
                    """
                ),
                {"image_url": None, **values},
            )
        for name, (country, latitude, longitude) in LOCATION_CORRECTIONS.items():
            connection.execute(
                text(
                    """
                    UPDATE history.entity
                    SET origin_country = :country, latitude = :latitude, longitude = :longitude
                    WHERE name = :name AND track = 'Cientistas'
                    """
                ),
                {"name": name, "country": country, "latitude": latitude, "longitude": longitude},
            )

    manifest_path.write_text(json.dumps(sources, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Registros enriquecidos: {len(updates)} de {len(scientists)}")


if __name__ == "__main__":
    main()
