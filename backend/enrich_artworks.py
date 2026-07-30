"""Renomeia e enriquece as obras de arte da timeline."""

import json
import mimetypes
import html
import re
import time
from pathlib import Path
from urllib.parse import quote

from sqlalchemy import text

from app.database import engine
from enrich_musicians import download, request_json, safe_filename
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
IMAGE_DIRECTORY = ROOT / "frontend" / "public" / "images" / "artworks"

PAGES = {
    "Discóbolo": "Discobolus", "Vitória de Samotrácia": "Winged Victory of Samothrace",
    "Vênus de Milo": "Venus de Milo", "O Nascimento de Vênus": "The Birth of Venus",
    "A Última Ceia": "The Last Supper (Leonardo)", "Pietà": "Pietà (Michelangelo)",
    "David": "David (Michelangelo)", "Mona Lisa": "Mona Lisa",
    "A Escola de Atenas": "The School of Athens", "A Ronda Noturna": "The Night Watch",
    "As Meninas": "Las Meninas", "Os Girassóis": "Sunflowers (Van Gogh series)",
    "A Noite Estrelada": "The Starry Night", "O Grito": "The Scream",
    "Abaporu": "Abaporu", "A Persistência da Memória": "The Persistence of Memory", "Guernica": "Guernica (Picasso)",
}

DESCRIPTIONS = {
    "Discóbolo": "Escultura grega atribuída a Míron que representa um atleta no instante anterior ao lançamento do disco.",
    "Vitória de Samotrácia": "Escultura helenística da deusa Nice, concebida para produzir forte sensação de movimento e vento.",
    "Vênus de Milo": "Escultura helenística em mármore, provavelmente representando Afrodite, encontrada na ilha de Milos.",
    "O Nascimento de Vênus": "Pintura de Botticelli que representa Vênus chegando à costa, inspirada na mitologia clássica.",
    "A Última Ceia": "Pintura mural de Leonardo da Vinci que retrata a reação dos apóstolos ao anúncio da traição de Jesus.",
    "Pietà": "Escultura em mármore de Michelangelo que mostra Maria sustentando o corpo de Jesus após a crucificação.",
    "David": "Escultura monumental de Michelangelo que representa o herói bíblico antes do confronto com Golias.",
    "Mona Lisa": "Retrato de Leonardo da Vinci conhecido pela expressão ambígua, pelo sfumato e pela paisagem atmosférica.",
    "A Escola de Atenas": "Afresco de Rafael que reúne grandes pensadores da Antiguidade em uma arquitetura idealizada.",
    "A Ronda Noturna": "Pintura de Rembrandt que transforma um retrato coletivo de milícia em uma cena dinâmica e dramática.",
    "As Meninas": "Pintura de Velázquez que explora perspectiva, representação e a relação entre artista, modelo e observador.",
    "Os Girassóis": "Série de naturezas-mortas de Van Gogh marcada por amarelos intensos e pinceladas expressivas.",
    "A Noite Estrelada": "Paisagem noturna de Van Gogh que combina uma aldeia serena com um céu de movimento intenso.",
    "O Grito": "Composição de Edvard Munch que se tornou um símbolo visual da ansiedade e da angústia modernas.",
    "Abaporu": "Pintura de Tarsila do Amaral que inspirou o Manifesto Antropófago e se tornou ícone do modernismo brasileiro.",
    "A Persistência da Memória": "Pintura surrealista de Salvador Dalí conhecida pelos relógios moles em uma paisagem desolada.",
    "Guernica": "Pintura monumental de Picasso criada como denúncia do bombardeio de Guernica durante a Guerra Civil Espanhola.",
}

LOCATIONS = {
    "Discóbolo": ("Grécia", 37.9838, 23.7275), "Vitória de Samotrácia": ("Grécia", 40.4741, 25.5257),
    "Vênus de Milo": ("Grécia", 36.6914, 24.3936), "O Nascimento de Vênus": ("Itália", 43.7696, 11.2558),
    "A Última Ceia": ("Itália", 45.4659, 9.1706), "Pietà": ("Vaticano", 41.9022, 12.4539),
    "David": ("Itália", 43.7696, 11.2558), "Mona Lisa": ("Itália", 43.7696, 11.2558),
    "A Escola de Atenas": ("Vaticano", 41.9040, 12.4530), "A Ronda Noturna": ("Países Baixos", 52.3676, 4.9041),
    "As Meninas": ("Espanha", 40.4168, -3.7038), "Os Girassóis": ("França", 43.6766, 4.6278),
    "A Noite Estrelada": ("França", 43.7884, 4.8317), "O Grito": ("Noruega", 59.9139, 10.7522),
    "Abaporu": ("Brasil", -23.5505, -46.6333), "A Persistência da Memória": ("Espanha", 42.2888, 3.2776),
    "Guernica": ("França", 48.8566, 2.3522),
}

INSTITUTIONAL_PAGES = {
    "A Persistência da Memória": "https://www.moma.org/collection/works/79018",
    "Guernica": "https://guernica.museoreinasofia.es/en",
}


def institutional_image(page_url):
    request = Request(page_url, headers={"User-Agent": "HistoricalTimeline/1.0 (educational project)"})
    with urlopen(request, timeout=45) as response:
        document = response.read().decode("utf-8", errors="ignore")
    match = re.search(r'<meta[^>]+(?:property|name)=["\']og:image["\'][^>]+content=["\']([^"\']+)', document, re.I)
    if not match:
        match = re.search(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+(?:property|name)=["\']og:image["\']', document, re.I)
    return html.unescape(match.group(1)) if match else None


def main():
    IMAGE_DIRECTORY.mkdir(parents=True, exist_ok=True)
    manifest_path = IMAGE_DIRECTORY / "sources.json"
    sources = json.loads(manifest_path.read_text(encoding="utf-8")) if manifest_path.exists() else {}

    with engine.begin() as connection:
        connection.execute(text("UPDATE history.entity SET track='Obras' WHERE track='Obras Pinturas | Esculturas'"))
        for name, description in DESCRIPTIONS.items():
            country, latitude, longitude = LOCATIONS[name]
            connection.execute(
                text("""UPDATE history.entity SET description=:description, origin_country=:country,
                        latitude=:latitude, longitude=:longitude WHERE name=:name AND track='Obras'"""),
                {"name": name, "description": description, "country": country, "latitude": latitude, "longitude": longitude},
            )

    titles = "|".join(PAGES.values())
    result = request_json(
        "https://en.wikipedia.org/w/api.php?action=query&redirects=1&prop=pageimages|info"
        f"&pithumbsize=700&inprop=url&format=json&titles={quote(titles)}"
    )
    pages = {page.get("title", "").casefold(): page for page in result.get("query", {}).get("pages", {}).values()}
    aliases = {item["from"].casefold(): item["to"].casefold() for key in ("normalized", "redirects") for item in result.get("query", {}).get(key, [])}

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
            source_page = page.get("fullurl")
            if not image_url and name in INSTITUTIONAL_PAGES:
                source_page = INSTITUTIONAL_PAGES[name]
                image_url = institutional_image(source_page)
            if not image_url:
                print(f"Sem imagem: {name}")
                continue
            try:
                extension = mimetypes.guess_extension(mimetypes.guess_type(image_url)[0] or "image/jpeg") or ".jpg"
                destination = IMAGE_DIRECTORY / f"{safe_filename(name)}{extension}"
                actual_extension = mimetypes.guess_extension(download(image_url, destination)) or extension
                if actual_extension != destination.suffix:
                    corrected = destination.with_suffix(actual_extension); destination.replace(corrected); destination = corrected
                sources[name] = {"page": source_page, "image": image_url, "local_path": f"/images/artworks/{destination.name}"}
                manifest_path.write_text(json.dumps(sources, ensure_ascii=False, indent=2), encoding="utf-8")
                time.sleep(3)
            except Exception as error:
                print(f"Falha em {name}: {error}")
                continue
        with engine.begin() as connection:
            connection.execute(text("UPDATE history.entity SET image_url=:image_url WHERE name=:name AND track='Obras'"), {"name": name, "image_url": f"/images/artworks/{destination.name}"})
        print(f"Imagem adicionada: {name}")


if __name__ == "__main__":
    main()
