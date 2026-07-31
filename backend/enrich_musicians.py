"""Adiciona imagens, resumos e locais aos músicos da timeline."""

import json
import mimetypes
import re
import time
import unicodedata
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import quote
from urllib.request import Request, urlopen

from sqlalchemy import text

from app.database import engine


PROJECT_ROOT = Path(__file__).resolve().parents[1]
IMAGE_DIRECTORY = PROJECT_ROOT / "frontend" / "public" / "images" / "musicians"
USER_AGENT = "HistoricalTimeline/1.0 (educational project; local development)"

PAGES = {
    "Guido d'Arezzo": "Guido of Arezzo", "Hildegard von Bingen": "Hildegard of Bingen",
    "Josquin des Prez": "Josquin des Prez", "Giovanni Pierluigi da Palestrina": "Giovanni Pierluigi da Palestrina",
    "Antonio Vivaldi": "Antonio Vivaldi", "Johann Sebastian Bach": "Johann Sebastian Bach",
    "Wolfgang Amadeus Mozart": "Wolfgang Amadeus Mozart", "Ludwig van Beethoven": "Ludwig van Beethoven",
    "Frédéric Chopin": "Frédéric Chopin", "Richard Wagner": "Richard Wagner",
    "Pyotr Ilyich Tchaikovsky": "Pyotr Ilyich Tchaikovsky", "Igor Stravinsky": "Igor Stravinsky",
    "Miles Davis": "Miles Davis", "Elvis Presley": "Elvis Presley", "The Beatles": "The Beatles",
    "Beyoncé": "Beyoncé", "Taylor Swift": "Taylor Swift", "Coldplay": "Coldplay",
}

DESCRIPTIONS = {
    "Guido d'Arezzo": "Monge e teórico musical italiano que desenvolveu métodos de ensino e notação fundamentais para a música ocidental.",
    "Hildegard von Bingen": "Compositora, escritora e abadessa medieval, autora de um dos maiores repertórios preservados de canto sacro monofônico.",
    "Josquin des Prez": "Compositor renascentista franco-flamengo reconhecido pelo domínio da polifonia vocal sacra e secular.",
    "Giovanni Pierluigi da Palestrina": "Compositor italiano cuja polifonia sacra se tornou uma referência central da música renascentista.",
    "Antonio Vivaldi": "Compositor e violinista veneziano do período barroco, conhecido especialmente pelo conjunto de concertos As Quatro Estações.",
    "Johann Sebastian Bach": "Compositor barroco alemão cuja obra reúne contraponto, harmonia e formas instrumentais e vocais de grande influência.",
    "Wolfgang Amadeus Mozart": "Compositor austríaco do classicismo, autor de óperas, sinfonias, concertos e música de câmara.",
    "Ludwig van Beethoven": "Compositor alemão que ampliou as formas clássicas e marcou a transição para o romantismo musical.",
    "Frédéric Chopin": "Compositor e pianista polonês do romantismo, conhecido por obras que transformaram a técnica e a expressão do piano.",
    "Richard Wagner": "Compositor alemão conhecido por seus dramas musicais, pelo uso de leitmotivs e pela expansão da linguagem harmônica.",
    "Pyotr Ilyich Tchaikovsky": "Compositor russo do romantismo, autor de sinfonias, concertos e balés como O Lago dos Cisnes e O Quebra-Nozes.",
    "Igor Stravinsky": "Compositor russo que renovou ritmo, orquestração e linguagem musical em obras como A Sagração da Primavera.",
    "Miles Davis": "Trompetista e compositor norte-americano que liderou transformações importantes no jazz moderno.",
    "Elvis Presley": "Cantor norte-americano que se tornou uma figura central na popularização internacional do rock and roll.",
    "The Beatles": "Banda britânica formada em Liverpool que transformou a composição, a gravação e a cultura da música popular.",
    "Beyoncé": "Cantora, compositora e produtora norte-americana reconhecida por sua influência na música pop e no R&B contemporâneo.",
    "Taylor Swift": "Cantora e compositora norte-americana conhecida pela narrativa autobiográfica e por transitar entre country, pop e folk.",
    "Coldplay": "Banda britânica de rock alternativo formada em Londres, conhecida por canções melódicas e grandes produções ao vivo.",
}

LOCATION_CORRECTIONS = {
    "The Beatles": ("Reino Unido", 53.4084, -2.9916),
    "Coldplay": ("Reino Unido", 51.5074, -0.1278),
    "Richard Wagner": ("Alemanha", 51.3397, 12.3731),
    "Frédéric Chopin": ("Polônia", 52.2500, 20.3167),
}


def open_with_retry(request, timeout):
    for attempt in range(5):
        try:
            return urlopen(request, timeout=timeout)
        except HTTPError as error:
            if error.code != 429 or attempt == 4:
                raise
            wait_seconds = 6 * (attempt + 1)
            print(f"Limite temporário; nova tentativa em {wait_seconds}s...")
            time.sleep(wait_seconds)


def request_json(url):
    with open_with_retry(Request(url, headers={"User-Agent": USER_AGENT}), 45) as response:
        return json.load(response)


def download(url, destination):
    with open_with_retry(Request(url, headers={"User-Agent": USER_AGENT}), 60) as response:
        destination.write_bytes(response.read())
        return response.headers.get_content_type()


def safe_filename(name):
    normalized = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", "-", normalized.lower()).strip("-")


def main():
    IMAGE_DIRECTORY.mkdir(parents=True, exist_ok=True)
    manifest_path = IMAGE_DIRECTORY / "sources.json"
    sources = json.loads(manifest_path.read_text(encoding="utf-8")) if manifest_path.exists() else {}

    with engine.begin() as connection:
        for name, description in DESCRIPTIONS.items():
            connection.execute(
                text("UPDATE history.entity SET description = :description WHERE name = :name AND track = 'Músicos'"),
                {"name": name, "description": description},
            )
        for name, (country, latitude, longitude) in LOCATION_CORRECTIONS.items():
            connection.execute(
                text("""UPDATE history.entity SET origin_country=:country, latitude=:latitude, longitude=:longitude
                        WHERE name=:name AND track='Músicos'"""),
                {"name": name, "country": country, "latitude": latitude, "longitude": longitude},
            )

    for name, title in PAGES.items():
        matches = [path for path in IMAGE_DIRECTORY.glob(f"{safe_filename(name)}.*") if path.name != "sources.json"]
        if matches:
            public_path = f"/images/musicians/{matches[0].name}"
            with engine.begin() as connection:
                connection.execute(
                    text("UPDATE history.entity SET image_url=:image_url WHERE name=:name AND track='Músicos'"),
                    {"name": name, "image_url": public_path},
                )
            print(f"Já existente: {name}")
            continue

        try:
            summary = request_json(f"https://en.wikipedia.org/api/rest_v1/page/summary/{quote(title)}")
            image_url = summary.get("thumbnail", {}).get("source")
            if not image_url:
                print(f"Sem imagem: {name}")
                continue
            guessed_type = mimetypes.guess_type(image_url)[0] or "image/jpeg"
            extension = mimetypes.guess_extension(guessed_type) or ".jpg"
            destination = IMAGE_DIRECTORY / f"{safe_filename(name)}{extension}"
            actual_type = download(image_url, destination)
            actual_extension = mimetypes.guess_extension(actual_type) or extension
            if actual_extension != destination.suffix:
                corrected = destination.with_suffix(actual_extension)
                destination.replace(corrected)
                destination = corrected
            public_path = f"/images/musicians/{destination.name}"
            with engine.begin() as connection:
                connection.execute(
                    text("UPDATE history.entity SET image_url=:image_url WHERE name=:name AND track='Músicos'"),
                    {"name": name, "image_url": public_path},
                )
            sources[name] = {
                "page": summary.get("content_urls", {}).get("desktop", {}).get("page"),
                "image": image_url,
                "local_path": public_path,
            }
            manifest_path.write_text(json.dumps(sources, ensure_ascii=False, indent=2), encoding="utf-8")
            print(f"Imagem adicionada: {name}")
            time.sleep(1)
        except Exception as error:
            print(f"Falha em {name}: {error}")


if __name__ == "__main__":
    main()
