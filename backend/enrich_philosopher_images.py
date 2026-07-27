import json
import mimetypes
import time
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import quote
from urllib.request import Request, urlopen

from sqlalchemy import text

from app.database import engine


PAGES = {
    "Lao-Tsé": "Laozi",
    "Sêneca": "Seneca the Younger",
    "Epicteto": "Epictetus",
    "Marco Aurélio": "Marcus Aurelius",
    "Agostinho de Hipona": "Augustine of Hippo",
    "Boécio": "Boethius",
    "Averróis": "Averroes",
    "Thomas Hobbes": "Thomas Hobbes",
    "René Descartes": "René Descartes",
    "John Locke": "John Locke",
    "Baruch Spinoza": "Baruch Spinoza",
    "Gottfried Wilhelm Leibniz": "Gottfried Wilhelm Leibniz",
    "David Hume": "David Hume",
    "Jean-Jacques Rousseau": "Jean-Jacques Rousseau",
    "Immanuel Kant": "Immanuel Kant",
    "G. W. F. Hegel": "Georg Wilhelm Friedrich Hegel",
    "Schopenhauer": "Arthur Schopenhauer",
    "Søren Kierkegaard": "Søren Kierkegaard",
    "Karl Marx": "Karl Marx",
    "Friedrich Nietzsche": "Friedrich Nietzsche",
    "Ludwig Wittgenstein": "Ludwig Wittgenstein",
    "Jean-Paul Sartre": "Jean-Paul Sartre",
    "Albert Camus": "Albert Camus",
    "Michel Foucault": "Michel Foucault",
    "Jürgen Habermas": "Jürgen Habermas",
}

PROJECT_ROOT = Path(__file__).resolve().parents[1]
IMAGE_DIRECTORY = PROJECT_ROOT / "frontend" / "public" / "images" / "philosophers"
USER_AGENT = "HistoricalTimeline/1.0 (educational project)"


def open_with_retry(request, timeout):
    for attempt in range(5):
        try:
            return urlopen(request, timeout=timeout)
        except HTTPError as error:
            if error.code != 429 or attempt == 4:
                raise
            time.sleep(5 * (attempt + 1))


def request_json(url):
    request = Request(url, headers={"User-Agent": USER_AGENT})
    with open_with_retry(request, 30) as response:
        return json.load(response)


def download(url, destination):
    request = Request(url, headers={"User-Agent": USER_AGENT})
    with open_with_retry(request, 60) as response:
        destination.write_bytes(response.read())
        return response.headers.get_content_type()


def safe_filename(name):
    replacements = str.maketrans("áàâãäéèêëíìîïóòôõöúùûüçñøž", "aaaaaeeeeiiiiooooouuuucnoz")
    return "-".join(name.lower().translate(replacements).replace(".", "").split())


def main():
    IMAGE_DIRECTORY.mkdir(parents=True, exist_ok=True)
    manifest = IMAGE_DIRECTORY / "additional-sources.json"
    sources = json.loads(manifest.read_text(encoding="utf-8")) if manifest.exists() else {}
    updates = []

    with engine.connect() as connection:
        completed_names = set(
            connection.execute(
                text(
                    """
                    SELECT name FROM history.entity
                    WHERE track = 'Filósofos' AND image_url IS NOT NULL
                    """
                )
            ).scalars()
        )

    for name, page_title in PAGES.items():
        if name in completed_names:
            print(f"Já existente: {name}")
            continue

        summary_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{quote(page_title)}"
        try:
            summary = request_json(summary_url)
            image_url = summary.get("thumbnail", {}).get("source")
            if not image_url:
                print(f"Sem imagem: {name}")
                continue

            content_type = mimetypes.guess_type(image_url)[0] or "image/jpeg"
            extension = mimetypes.guess_extension(content_type) or ".jpg"
            destination = IMAGE_DIRECTORY / f"{safe_filename(name)}{extension}"
            downloaded_type = download(image_url, destination)
            actual_extension = mimetypes.guess_extension(downloaded_type) or extension

            if actual_extension != destination.suffix:
                corrected_destination = destination.with_suffix(actual_extension)
                destination.replace(corrected_destination)
                destination = corrected_destination

            public_path = f"/images/philosophers/{destination.name}"
            updates.append({"name": name, "image_url": public_path})
            sources[name] = {
                "page": summary.get("content_urls", {}).get("desktop", {}).get("page"),
                "image": image_url,
                "local_path": public_path,
            }
            print(f"Imagem adicionada: {name}")
            time.sleep(2)
        except Exception as error:
            print(f"Falha em {name}: {error}")

    with engine.begin() as connection:
        for values in updates:
            connection.execute(
                text(
                    """
                    UPDATE history.entity
                    SET image_url = :image_url
                    WHERE name = :name AND track = 'Filósofos'
                    """
                ),
                values,
            )

        # O registro legado de Sêneca pode ter uma composição Unicode diferente.
        connection.execute(
            text(
                """
                UPDATE history.entity
                SET image_url = '/images/philosophers/seneca.jpg'
                WHERE track = 'Filósofos' AND start_year = -4
                """
            )
        )

    manifest.write_text(json.dumps(sources, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Total atualizado: {len(updates)}")


if __name__ == "__main__":
    main()
