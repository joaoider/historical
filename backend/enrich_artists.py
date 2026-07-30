"""Adiciona imagens, resumos e locais aos artistas da timeline."""

import json
import mimetypes
import time
from pathlib import Path
from urllib.parse import quote

from sqlalchemy import text

from app.database import engine
from enrich_musicians import download, request_json, safe_filename


ROOT = Path(__file__).resolve().parents[1]
IMAGE_DIRECTORY = ROOT / "frontend" / "public" / "images" / "artists"

PAGES = {
    "Policleto": "Doryphoros", "Fídias": "Phidias", "Praxíteles": "Praxiteles",
    "Donatello": "Donatello", "Sandro Botticelli": "Sandro Botticelli",
    "Leonardo da Vinci": "Leonardo da Vinci", "Michelangelo": "Michelangelo",
    "Rafael Sanzio": "Raphael", "Caravaggio": "Caravaggio", "Diego Velázquez": "Diego Velázquez",
    "Rembrandt": "Rembrandt", "Auguste Rodin": "Auguste Rodin", "Claude Monet": "Claude Monet",
    "Vincent van Gogh": "Vincent van Gogh", "Edvard Munch": "Edvard Munch",
    "Pablo Picasso": "Pablo Picasso", "Salvador Dalí": "Salvador Dalí", "Frida Kahlo": "Frida Kahlo",
}

DESCRIPTIONS = {
    "Policleto": "Escultor grego conhecido pelo Cânone, tratado que relacionava proporção matemática e beleza do corpo humano.",
    "Fídias": "Escultor grego responsável por grandes obras da Atenas clássica, incluindo a decoração do Partenon.",
    "Praxíteles": "Escultor grego célebre por figuras de postura natural, formas suaves e representação humanizada dos deuses.",
    "Donatello": "Escultor florentino do Renascimento que renovou a escultura monumental, o relevo e o nu em bronze.",
    "Sandro Botticelli": "Pintor renascentista florentino conhecido por O Nascimento de Vênus e A Primavera.",
    "Leonardo da Vinci": "Artista e inventor renascentista, autor da Mona Lisa e de A Última Ceia.",
    "Michelangelo": "Escultor, pintor e arquiteto renascentista, autor de Davi, Pietà e do teto da Capela Sistina.",
    "Rafael Sanzio": "Pintor e arquiteto do Alto Renascimento conhecido pela harmonia de suas Madonas e dos afrescos do Vaticano.",
    "Caravaggio": "Pintor barroco italiano que transformou a pintura com forte realismo e contrastes dramáticos de luz e sombra.",
    "Diego Velázquez": "Pintor da corte espanhola, autor de retratos marcantes e da complexa composição As Meninas.",
    "Rembrandt": "Pintor e gravador neerlandês conhecido pelo uso expressivo da luz, por retratos e autorretratos introspectivos.",
    "Auguste Rodin": "Escultor francês que renovou a escultura moderna com superfícies expressivas e obras como O Pensador.",
    "Claude Monet": "Pintor francês e figura central do impressionismo, conhecido por séries sobre luz, paisagens e nenúfares.",
    "Vincent van Gogh": "Pintor pós-impressionista neerlandês conhecido por cores intensas, pinceladas expressivas e paisagens emocionais.",
    "Edvard Munch": "Pintor norueguês ligado ao simbolismo e ao expressionismo, autor de O Grito.",
    "Pablo Picasso": "Artista espanhol que ajudou a criar o cubismo e explorou pintura, escultura, gravura e cerâmica.",
    "Salvador Dalí": "Artista espanhol do surrealismo conhecido por imagens oníricas, técnica minuciosa e A Persistência da Memória.",
    "Frida Kahlo": "Pintora mexicana conhecida por autorretratos que abordam identidade, corpo, dor e cultura mexicana.",
}


def main():
    IMAGE_DIRECTORY.mkdir(parents=True, exist_ok=True)
    manifest_path = IMAGE_DIRECTORY / "sources.json"
    sources = json.loads(manifest_path.read_text(encoding="utf-8")) if manifest_path.exists() else {}

    with engine.begin() as connection:
        for name, description in DESCRIPTIONS.items():
            connection.execute(
                text("UPDATE history.entity SET description=:description WHERE name=:name AND track='Artistas'"),
                {"name": name, "description": description},
            )
        connection.execute(
            text("UPDATE history.entity SET origin_country='Itália' WHERE name IN ('Donatello','Sandro Botticelli') AND track='Artistas'")
        )

    titles = "|".join(PAGES.values())
    result = request_json(
        "https://en.wikipedia.org/w/api.php?action=query&redirects=1&prop=pageimages|info"
        f"&pithumbsize=600&inprop=url&format=json&titles={quote(titles)}"
    )
    pages = {page.get("title", "").casefold(): page for page in result.get("query", {}).get("pages", {}).values()}
    aliases = {
        item["from"].casefold(): item["to"].casefold()
        for key in ("normalized", "redirects") for item in result.get("query", {}).get(key, [])
    }

    for name, title in PAGES.items():
        existing = [path for path in IMAGE_DIRECTORY.glob(f"{safe_filename(name)}.*") if path.name != "sources.json"]
        if existing:
            destination = existing[0]
        else:
            lookup = title.casefold()
            while lookup in aliases:
                lookup = aliases[lookup]
            page = pages.get(lookup, {})
            image_url = page.get("thumbnail", {}).get("source")
            if not image_url:
                print(f"Sem imagem: {name}")
                continue
            try:
                extension = mimetypes.guess_extension(mimetypes.guess_type(image_url)[0] or "image/jpeg") or ".jpg"
                destination = IMAGE_DIRECTORY / f"{safe_filename(name)}{extension}"
                actual_extension = mimetypes.guess_extension(download(image_url, destination)) or extension
                if actual_extension != destination.suffix:
                    corrected = destination.with_suffix(actual_extension)
                    destination.replace(corrected)
                    destination = corrected
                sources[name] = {"page": page.get("fullurl"), "image": image_url, "local_path": f"/images/artists/{destination.name}"}
                manifest_path.write_text(json.dumps(sources, ensure_ascii=False, indent=2), encoding="utf-8")
                time.sleep(3)
            except Exception as error:
                print(f"Falha em {name}: {error}")
                continue

        public_path = f"/images/artists/{destination.name}"
        with engine.begin() as connection:
            connection.execute(
                text("UPDATE history.entity SET image_url=:image_url WHERE name=:name AND track='Artistas'"),
                {"name": name, "image_url": public_path},
            )
        print(f"Imagem adicionada: {name}")


if __name__ == "__main__":
    main()
