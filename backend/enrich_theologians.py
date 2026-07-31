"""Enriquece teólogos com retratos, descrições e locais de nascimento."""

import json
import mimetypes
import time
from pathlib import Path
from urllib.parse import quote

from sqlalchemy import text

from app.database import engine
from enrich_musicians import download, request_json, safe_filename


ROOT = Path(__file__).resolve().parents[1]
IMAGE_DIRECTORY = ROOT / "frontend" / "public" / "images" / "theologians"

# Títulos estáveis na Wikipédia em inglês, usados apenas para resolver a página,
# a imagem e o identificador Wikidata de cada pessoa.
PAGES = {
    "Irineu de Lyon": "Irenaeus", "Clemente de Alexandria": "Clement of Alexandria",
    "Tertuliano": "Tertullian", "Orígenes": "Origen", "Atanásio de Alexandria": "Athanasius of Alexandria",
    "João Crisóstomo": "John Chrysostom", "Isidoro de Sevilha": "Isidore of Seville",
    "Beda, o Venerável": "Bede", "João Damasceno": "John of Damascus",
    "João Escoto Erígena": "John Scotus Eriugena", "Simeão, o Novo Teólogo": "Symeon the New Theologian",
    "Anselmo de Cantuária": "Anselm of Canterbury", "Bernardo de Claraval": "Bernard of Clairvaux",
    "Pedro Abelardo": "Peter Abelard", "Pedro Lombardo": "Peter Lombard", "Hugo de São Vítor": "Hugh of Saint Victor",
    "Alberto Magno": "Albertus Magnus", "Boaventura": "Bonaventure", "Tomás de Aquino": "Thomas Aquinas",
    "Meister Eckhart": "Meister Eckhart", "Duns Scotus": "Duns Scotus", "Gregório Palamas": "Gregory Palamas",
    "John Wycliffe": "John Wycliffe", "Jan Hus": "Jan Hus", "Tomás de Kempis": "Thomas à Kempis",
    "Girolamo Savonarola": "Girolamo Savonarola", "Martinho Lutero": "Martin Luther",
    "Ulrico Zuínglio": "Huldrych Zwingli", "Filipe Melâncton": "Philip Melanchthon", "João Calvino": "John Calvin",
    "Jacob Armínio": "Jacobus Arminius", "John Owen": "John Owen (theologian)", "Blaise Pascal": "Blaise Pascal",
    "Jonathan Edwards": "Jonathan Edwards (theologian)", "John Wesley": "John Wesley",
    "George Whitefield": "George Whitefield", "Friedrich Schleiermacher": "Friedrich Schleiermacher",
    "John Henry Newman": "John Henry Newman", "Søren Kierkegaard": "Søren Kierkegaard",
    "Charles Spurgeon": "Charles Spurgeon", "Karl Barth": "Karl Barth", "Paul Tillich": "Paul Tillich",
    "C.S. Lewis": "C. S. Lewis", "Dietrich Bonhoeffer": "Dietrich Bonhoeffer",
    "Gustavo Gutiérrez": "Gustavo Gutiérrez", "R. C. Sproul": "R. C. Sproul", "N. T. Wright": "N. T. Wright",
}

# Correções e aproximações históricas para casos em que o Wikidata não traz
# coordenadas do local de nascimento. As coordenadas representam a cidade ou
# região tradicionalmente associada ao nascimento.
LOCATION_FALLBACKS = {
    "Irineu de Lyon": ("Turquia", 38.4192, 27.1287), "Clemente de Alexandria": ("Grécia", 37.9838, 23.7275),
    "Tertuliano": ("Tunísia", 36.8065, 10.1815), "Orígenes": ("Egito", 31.2001, 29.9187),
    "Atanásio de Alexandria": ("Egito", 31.2001, 29.9187), "João Crisóstomo": ("Turquia", 36.2021, 36.1600),
    "Isidoro de Sevilha": ("Espanha", 37.3891, -5.9845), "Beda, o Venerável": ("Reino Unido", 54.9783, -1.6178),
    "João Damasceno": ("Síria", 33.5138, 36.2765), "João Escoto Erígena": ("Irlanda", 53.1424, -7.6921),
    "Simeão, o Novo Teólogo": ("Turquia", 40.9781, 27.5110), "Anselmo de Cantuária": ("Itália", 45.7375, 7.3201),
    "Bernardo de Claraval": ("França", 47.3220, 5.0415), "Pedro Abelardo": ("França", 47.1986, -1.7234),
    "Pedro Lombardo": ("Itália", 45.5845, 9.2744), "Hugo de São Vítor": ("Alemanha", 51.1657, 10.4515),
    "Alberto Magno": ("Alemanha", 48.4011, 10.0048), "Boaventura": ("Itália", 42.6264, 12.1137),
    "Tomás de Aquino": ("Itália", 41.4920, 13.8146), "Meister Eckhart": ("Alemanha", 50.9848, 11.0299),
    "Duns Scotus": ("Reino Unido", 55.7080, -2.4600), "Gregório Palamas": ("Turquia", 41.0082, 28.9784),
    "John Wycliffe": ("Reino Unido", 54.4700, -1.8500), "Jan Hus": ("Tchéquia", 49.0520, 14.0260),
    "Tomás de Kempis": ("Alemanha", 51.8350, 6.2460), "Girolamo Savonarola": ("Itália", 44.8381, 11.6198),
    "Martinho Lutero": ("Alemanha", 51.5270, 11.5480), "Ulrico Zuínglio": ("Suíça", 47.1960, 9.3110),
    "Filipe Melâncton": ("Alemanha", 49.0360, 8.7070), "João Calvino": ("França", 49.5800, 3.0000),
    "Jacob Armínio": ("Países Baixos", 52.0833, 4.8833), "John Owen": ("Reino Unido", 51.6400, -1.1600),
    "Blaise Pascal": ("França", 45.7772, 3.0870), "Jonathan Edwards": ("Estados Unidos", 41.7637, -72.6851),
    "John Wesley": ("Reino Unido", 53.4940, -0.7900), "George Whitefield": ("Reino Unido", 51.8642, -2.2382),
    "Friedrich Schleiermacher": ("Polônia", 51.1490, 15.0080), "John Henry Newman": ("Reino Unido", 51.5074, -0.1278),
    "Søren Kierkegaard": ("Dinamarca", 55.6761, 12.5683), "Charles Spurgeon": ("Reino Unido", 51.9450, 0.6390),
    "Karl Barth": ("Suíça", 47.3769, 8.5417), "Paul Tillich": ("Polônia", 52.4720, 14.5900),
    "C.S. Lewis": ("Reino Unido", 54.5973, -5.9301), "Dietrich Bonhoeffer": ("Polônia", 51.1079, 17.0385),
    "Gustavo Gutiérrez": ("Peru", -12.0464, -77.0428), "R. C. Sproul": ("Estados Unidos", 40.4406, -79.9959),
    "N. T. Wright": ("Reino Unido", 54.0466, -2.8007),
}

IMAGE_FALLBACKS = {
    "João Escoto Erígena": "https://commons.wikimedia.org/wiki/Special:Redirect/file/John-Scotus-Eriugena.png?width=500",
    "Paul Tillich": "https://commons.wikimedia.org/wiki/Special:Redirect/file/Paul_Tillich_bust.JPG?width=500",
}


def sentence(description):
    if not description:
        return None
    return description[0].upper() + description[1:].rstrip(".") + "."


def main():
    IMAGE_DIRECTORY.mkdir(parents=True, exist_ok=True)
    manifest_path = IMAGE_DIRECTORY / "sources.json"
    sources = json.loads(manifest_path.read_text(encoding="utf-8")) if manifest_path.exists() else {}

    titles = "|".join(PAGES.values())
    wikipedia = request_json(
        "https://en.wikipedia.org/w/api.php?action=query&redirects=1&prop=pageimages|pageprops|info"
        f"&pithumbsize=500&inprop=url&format=json&titles={quote(titles)}"
    )
    pages = {page.get("title", "").casefold(): page for page in wikipedia.get("query", {}).get("pages", {}).values()}
    aliases = {
        item["from"].casefold(): item["to"].casefold()
        for key in ("normalized", "redirects") for item in wikipedia.get("query", {}).get(key, [])
    }
    resolved = {}
    for name, title in PAGES.items():
        lookup = title.casefold()
        while lookup in aliases:
            lookup = aliases[lookup]
        resolved[name] = pages.get(lookup, {})

    qids = [page.get("pageprops", {}).get("wikibase_item") for page in resolved.values()]
    qids = [qid for qid in qids if qid]
    wikidata = request_json(
        "https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=descriptions"
        f"&languages=pt|pt-br|en&languagefallback=1&ids={quote('|'.join(qids))}"
    ).get("entities", {})

    for name, page in resolved.items():
        qid = page.get("pageprops", {}).get("wikibase_item")
        data = wikidata.get(qid, {})
        descriptions = data.get("descriptions", {})
        description_data = descriptions.get("pt") or descriptions.get("pt-br")
        description = sentence(description_data.get("value")) if description_data else None
        if not description:
            description = f"Teólogo e pensador religioso associado à tradição e aos debates de sua época."

        country, latitude, longitude = LOCATION_FALLBACKS[name]
        with engine.begin() as connection:
            connection.execute(
                text("""
                    UPDATE history.entity
                    SET description=:description, origin_country=:country,
                        latitude=:latitude, longitude=:longitude
                    WHERE name=:name AND track='Teólogos'
                """),
                {"name": name, "description": description, "country": country,
                 "latitude": latitude, "longitude": longitude},
            )

        existing = [path for path in IMAGE_DIRECTORY.glob(f"{safe_filename(name)}.*") if path.name != "sources.json"]
        if existing:
            destination = existing[0]
        else:
            image_url = page.get("thumbnail", {}).get("source") or IMAGE_FALLBACKS.get(name)
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
                sources[name] = {"page": page.get("fullurl"), "image": image_url,
                                 "local_path": f"/images/theologians/{destination.name}"}
                manifest_path.write_text(json.dumps(sources, ensure_ascii=False, indent=2), encoding="utf-8")
                time.sleep(3)
            except Exception as error:
                print(f"Falha em {name}: {error}")
                continue

        with engine.begin() as connection:
            connection.execute(
                text("UPDATE history.entity SET image_url=:image_url WHERE name=:name AND track='Teólogos'"),
                {"name": name, "image_url": f"/images/theologians/{destination.name}"},
            )
        print(f"Enriquecido: {name}")


if __name__ == "__main__":
    main()
