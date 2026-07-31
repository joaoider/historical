"""Adiciona pioneiros essenciais de computação e estatística."""

import json
import mimetypes
import time
from pathlib import Path
from urllib.parse import quote

from sqlalchemy import text

from app.database import engine
from enrich_musicians import download, request_json, safe_filename


ROOT = Path(__file__).resolve().parents[1]
IMAGE_DIRECTORY = ROOT / "frontend" / "public" / "images" / "scientists"

SCIENTISTS = {
    "Thomas Bayes": (1701, 1761, "Reino Unido", 51.5074, -0.1278, "Matemático e ministro presbiteriano britânico associado ao teorema que fundamenta a inferência bayesiana.", "Thomas Bayes"),
    "Charles Babbage": (1791, 1871, "Reino Unido", 51.5074, -0.1278, "Matemático e inventor britânico que projetou máquinas de cálculo programáveis, incluindo a Máquina Analítica.", "Charles Babbage"),
    "Florence Nightingale": (1820, 1910, "Itália", 43.7696, 11.2558, "Enfermeira e estatística britânica que aplicou visualização de dados e análise quantitativa à reforma da saúde pública.", "Florence Nightingale"),
    "Francis Galton": (1822, 1911, "Reino Unido", 52.4862, -1.8904, "Cientista britânico que desenvolveu métodos iniciais de correlação e regressão, embora também ligado à história problemática da eugenia.", "Francis Galton"),
    "Karl Pearson": (1857, 1936, "Reino Unido", 51.5074, -0.1278, "Matemático britânico que ajudou a estabelecer a estatística matemática e desenvolveu o teste qui-quadrado e o coeficiente de correlação.", "Karl Pearson"),
    "Ronald Fisher": (1890, 1962, "Reino Unido", 51.5074, -0.1278, "Estatístico e geneticista britânico central para o desenvolvimento da inferência, do planejamento experimental e da genética de populações.", "Ronald Fisher"),
    "John von Neumann": (1903, 1957, "Hungria", 47.4979, 19.0402, "Matemático húngaro-americano que contribuiu para a arquitetura de computadores, teoria dos jogos, física e matemática aplicada.", "John von Neumann"),
    "Grace Hopper": (1906, 1992, "Estados Unidos", 40.7128, -74.0060, "Cientista da computação e oficial naval norte-americana pioneira de compiladores e linguagens de programação de alto nível.", "Grace Hopper"),
    "Gertrude Cox": (1900, 1978, "Estados Unidos", 42.3601, -71.0589, "Estatística norte-americana que ampliou o ensino e a aplicação do planejamento experimental em agricultura, biologia e indústria.", "Gertrude Mary Cox"),
    "John Tukey": (1915, 2000, "Estados Unidos", 42.3601, -71.0589, "Estatístico e matemático norte-americano que desenvolveu métodos de análise exploratória de dados e contribuiu para o processamento digital.", "John Tukey"),
    "Claude Shannon": (1916, 2001, "Estados Unidos", 42.7325, -84.5555, "Matemático e engenheiro norte-americano fundador da teoria da informação e figura central da comunicação digital.", "Claude Shannon"),
}


def upsert():
    with engine.begin() as connection:
        for name, (start, end, country, latitude, longitude, description, _) in SCIENTISTS.items():
            values = {"name": name, "start": start, "end": end, "country": country,
                      "latitude": latitude, "longitude": longitude, "description": description}
            entity_id = connection.execute(
                text("SELECT id FROM history.entity WHERE name=:name AND track='Cientistas' LIMIT 1"), values
            ).scalar()
            if entity_id is None:
                connection.execute(text("""
                    INSERT INTO history.entity
                        (name, entity_type, track, description, origin_country, latitude, longitude, start_year, end_year)
                    VALUES (:name, 'Pessoa', 'Cientistas', :description, :country, :latitude, :longitude, :start, :end)
                """), values)
            else:
                connection.execute(text("""
                    UPDATE history.entity SET description=:description, origin_country=:country,
                        latitude=:latitude, longitude=:longitude, start_year=:start, end_year=:end
                    WHERE id=:entity_id
                """), {**values, "entity_id": entity_id})


def download_images():
    IMAGE_DIRECTORY.mkdir(parents=True, exist_ok=True)
    manifest_path = IMAGE_DIRECTORY / "additional-sources.json"
    sources = json.loads(manifest_path.read_text(encoding="utf-8")) if manifest_path.exists() else {}
    titles = "|".join(data[-1] for data in SCIENTISTS.values())
    result = request_json(
        "https://en.wikipedia.org/w/api.php?action=query&redirects=1&prop=pageimages|info"
        f"&pithumbsize=500&inprop=url&format=json&titles={quote(titles)}"
    )
    pages = {page.get("title", "").casefold(): page for page in result.get("query", {}).get("pages", {}).values()}
    aliases = {item["from"].casefold(): item["to"].casefold()
               for key in ("normalized", "redirects") for item in result.get("query", {}).get(key, [])}

    for name, (*_, title) in SCIENTISTS.items():
        lookup = title.casefold()
        while lookup in aliases:
            lookup = aliases[lookup]
        page = pages.get(lookup, {})
        existing = [path for path in IMAGE_DIRECTORY.glob(f"{safe_filename(name)}.*") if not path.name.endswith("sources.json")]
        if existing:
            destination = existing[0]
        else:
            image_url = page.get("thumbnail", {}).get("source")
            if not image_url:
                print(f"Sem imagem: {name}")
                continue
            extension = mimetypes.guess_extension(mimetypes.guess_type(image_url)[0] or "image/jpeg") or ".jpg"
            destination = IMAGE_DIRECTORY / f"{safe_filename(name)}{extension}"
            actual_extension = mimetypes.guess_extension(download(image_url, destination)) or extension
            if actual_extension != destination.suffix:
                corrected = destination.with_suffix(actual_extension); destination.replace(corrected); destination = corrected
            sources[name] = {"page": page.get("fullurl"), "image": image_url,
                             "local_path": f"/images/scientists/{destination.name}"}
            manifest_path.write_text(json.dumps(sources, ensure_ascii=False, indent=2), encoding="utf-8")
            time.sleep(2)
        with engine.begin() as connection:
            connection.execute(text("UPDATE history.entity SET image_url=:url WHERE name=:name AND track='Cientistas'"),
                               {"url": f"/images/scientists/{destination.name}", "name": name})
        print(f"Adicionado: {name}")


def main():
    upsert()
    download_images()


if __name__ == "__main__":
    main()
