"""Adiciona representantes relevantes nascidos ou criados desde 2000."""

import json
import mimetypes
import time
from pathlib import Path
from urllib.parse import quote

from sqlalchemy import text

from app.database import engine
from enrich_musicians import download, request_json, safe_filename


ROOT = Path(__file__).resolve().parents[1]
IMAGE_DIRECTORY = ROOT / "frontend" / "public" / "images" / "contemporary"

PEOPLE = {
    "Andres Valencia": ("Artistas", 2011, "Estados Unidos", 32.7157, -117.1611, "Jovem artista visual norte-americano reconhecido internacionalmente por pinturas figurativas de cores intensas.", "Andres Valencia (artist)"),
    "Tyler Gordon": ("Artistas", 2006, "Estados Unidos", 37.3382, -121.8863, "Artista norte-americano conhecido por retratos expressivos e por difundir sua produção artística desde a infância.", "Tyler Gordon (artist)"),
    "Autumn de Forest": ("Artistas", 2001, "Estados Unidos", 36.1699, -115.1398, "Artista visual norte-americana que ganhou projeção ainda criança com pinturas ligadas à pop art e ao expressionismo.", "Autumn de Forest"),
    "Gitanjali Rao": ("Cientistas", 2005, "Estados Unidos", 39.9612, -82.9988, "Inventora e divulgadora científica norte-americana que desenvolveu soluções para detectar chumbo na água e combater o cyberbullying.", "Gitanjali Rao (scientist)"),
    "Kiara Nirghin": ("Cientistas", 2000, "África do Sul", -26.2041, 28.0473, "Cientista e inventora sul-africana premiada por desenvolver um material biodegradável capaz de reter água no solo.", "Kiara Nirghin"),
    "Heman Bekele": ("Cientistas", 2009, "Etiópia", 9.0300, 38.7400, "Jovem inventor etíope-americano reconhecido pelo desenvolvimento experimental de um sabonete voltado ao tratamento do câncer de pele.", "Heman Bekele"),
    "Ann Liang": ("Escritores", 2000, "China", 39.9042, 116.4074, "Escritora sino-australiana conhecida por romances contemporâneos para jovens adultos e por A Song to Drown Rivers.", "Ann Liang"),
    "Billie Eilish": ("Músicos", 2001, "Estados Unidos", 34.0522, -118.2437, "Cantora e compositora norte-americana que se tornou uma das principais vozes do pop de sua geração.", "Billie Eilish"),
    "Tyla": ("Músicos", 2002, "África do Sul", -26.2041, 28.0473, "Cantora sul-africana que levou elementos do amapiano ao pop internacional e alcançou projeção mundial com Water.", "Tyla (South African singer)"),
    "The Kid Laroi": ("Músicos", 2003, "Austrália", -33.8688, 151.2093, "Cantor e compositor australiano que alcançou sucesso internacional combinando pop, rap e melodias confessionais.", "The Kid Laroi"),
    "Olivia Rodrigo": ("Músicos", 2003, "Estados Unidos", 33.5539, -117.2139, "Cantora e compositora norte-americana reconhecida por álbuns pop centrados em narrativas juvenis e confessionais.", "Olivia Rodrigo"),
    "Benson Boone": ("Músicos", 2002, "Estados Unidos", 47.8554, -121.9709, "Cantor e compositor norte-americano conhecido por baladas pop e pela projeção internacional de Beautiful Things.", "Benson Boone"),
    "Adélaïde Charlier": ("Líderes", 2000, "Bélgica", 50.4674, 4.8718, "Ativista climática belga e cofundadora do movimento Youth for Climate na Bélgica.", "Adélaïde Charlier"),
    "Greta Thunberg": ("Líderes", 2003, "Suécia", 59.3293, 18.0686, "Ativista sueca que iniciou uma greve escolar pelo clima e inspirou o movimento internacional Fridays for Future.", "Greta Thunberg"),
    "Autumn Peltier": ("Líderes", 2004, "Canadá", 45.7200, -81.9300, "Ativista indígena canadense e comissária-chefe da água da Nação Anishinabek, dedicada ao acesso à água potável.", "Autumn Peltier"),
    "Mari Copeny": ("Líderes", 2007, "Estados Unidos", 43.0125, -83.6875, "Ativista norte-americana conhecida pela defesa do acesso à água limpa durante e após a crise hídrica de Flint.", "Mari Copeny"),
    "Licypriya Kangujam": ("Líderes", 2011, "Índia", 24.8170, 93.9368, "Ativista climática indiana que começou ainda criança a defender políticas de proteção ambiental e educação climática.", "Licypriya Kangujam"),
}

RECENT_ENTITIES = {
    "Tecnologias": [
        ("Wikipedia", 2001, "Enciclopédia colaborativa on-line lançada em 2001 e construída por comunidades de editores.", "Tecnologia"),
        ("YouTube", 2005, "Plataforma de compartilhamento de vídeos lançada em 2005 que transformou a distribuição audiovisual.", "Tecnologia"),
        ("Bitcoin", 2009, "Sistema monetário digital descentralizado apresentado por Satoshi Nakamoto e colocado em operação em 2009.", "Tecnologia"),
        ("Vacinas de mRNA", 2020, "Tecnologia de vacinação baseada em RNA mensageiro aplicada em larga escala durante a pandemia de COVID-19.", "Tecnologia"),
        ("ChatGPT", 2022, "Assistente conversacional de inteligência artificial generativa disponibilizado publicamente pela OpenAI em 2022.", "Tecnologia"),
    ],
    "Obras": [
        ("Girl with Balloon", 2002, "Obra de Banksy que apresenta uma menina alcançando um balão vermelho em forma de coração.", "Obra de arte"),
        ("The Weather Project", 2003, "Instalação de Olafur Eliasson apresentada na Tate Modern, criando a experiência de um grande sol artificial.", "Obra de arte"),
        ("The Gates", 2005, "Instalação de Christo e Jeanne-Claude formada por milhares de portais de tecido no Central Park.", "Obra de arte"),
        ("Sunflower Seeds", 2010, "Instalação de Ai Weiwei composta por milhões de sementes de girassol de porcelana feitas à mão.", "Obra de arte"),
        ("Love is in the Bin", 2018, "Obra de Banksy parcialmente triturada durante um leilão, transformando a performance em parte do trabalho.", "Obra de arte"),
    ],
    "Livros": [
        ("Klara e o Sol", 2021, "Romance de Kazuo Ishiguro narrado por uma inteligência artificial criada para acompanhar crianças.", "Livro"),
        ("Amanhã, Amanhã, e Ainda Outro Amanhã", 2022, "Romance de Gabrielle Zevin sobre amizade, criação artística e desenvolvimento de jogos.", "Livro"),
        ("James", 2024, "Romance de Percival Everett que reimagina As Aventuras de Huckleberry Finn pela perspectiva de Jim.", "Livro"),
    ],
}

IMAGE_FALLBACKS = {
    "Autumn Peltier": "https://commons.wikimedia.org/wiki/Special:Redirect/file/Autumn_Peltier.jpg?width=500",
}


def upsert_entities():
    with engine.begin() as connection:
        for name, (track, year, country, latitude, longitude, description, _) in PEOPLE.items():
            values = {"name": name, "track": track, "description": description, "country": country,
                      "latitude": latitude, "longitude": longitude, "year": year}
            entity_id = connection.execute(
                text("SELECT id FROM history.entity WHERE name=:name AND track=:track LIMIT 1"), values
            ).scalar()
            if entity_id is None:
                connection.execute(text("""
                    INSERT INTO history.entity
                        (name, entity_type, track, description, origin_country, latitude, longitude, start_year)
                    VALUES (:name, 'Pessoa', :track, :description, :country, :latitude, :longitude, :year)
                """), values)
            else:
                connection.execute(text("""
                    UPDATE history.entity SET entity_type='Pessoa', description=:description,
                        origin_country=:country, latitude=:latitude, longitude=:longitude, start_year=:year
                    WHERE id=:entity_id
                """), {**values, "entity_id": entity_id})

        for track, entries in RECENT_ENTITIES.items():
            for name, year, description, entity_type in entries:
                values = {"name": name, "entity_type": entity_type, "track": track,
                          "description": description, "year": year}
                exists = connection.execute(
                    text("SELECT 1 FROM history.entity WHERE name=:name AND track=:track LIMIT 1"), values
                ).scalar()
                if not exists:
                    connection.execute(text("""
                        INSERT INTO history.entity (name, entity_type, track, description, start_year)
                        VALUES (:name, :entity_type, :track, :description, :year)
                    """), values)


def download_portraits():
    IMAGE_DIRECTORY.mkdir(parents=True, exist_ok=True)
    manifest_path = IMAGE_DIRECTORY / "sources.json"
    sources = json.loads(manifest_path.read_text(encoding="utf-8")) if manifest_path.exists() else {}
    titles = "|".join(data[-1] for data in PEOPLE.values())
    result = request_json(
        "https://en.wikipedia.org/w/api.php?action=query&redirects=1&prop=pageimages|info"
        f"&pithumbsize=500&inprop=url&format=json&titles={quote(titles)}"
    )
    pages = {page.get("title", "").casefold(): page for page in result.get("query", {}).get("pages", {}).values()}
    aliases = {item["from"].casefold(): item["to"].casefold()
               for key in ("normalized", "redirects") for item in result.get("query", {}).get(key, [])}

    for name, (track, *_, title) in PEOPLE.items():
        lookup = title.casefold()
        while lookup in aliases:
            lookup = aliases[lookup]
        page = pages.get(lookup, {})
        existing = [path for path in IMAGE_DIRECTORY.glob(f"{safe_filename(name)}.*") if path.name != "sources.json"]
        if existing:
            destination = existing[0]
        else:
            image_url = page.get("thumbnail", {}).get("source") or IMAGE_FALLBACKS.get(name)
            if not image_url:
                print(f"Sem imagem: {name}")
                continue
            extension = mimetypes.guess_extension(mimetypes.guess_type(image_url)[0] or "image/jpeg") or ".jpg"
            destination = IMAGE_DIRECTORY / f"{safe_filename(name)}{extension}"
            actual_extension = mimetypes.guess_extension(download(image_url, destination)) or extension
            if actual_extension != destination.suffix:
                corrected = destination.with_suffix(actual_extension); destination.replace(corrected); destination = corrected
            sources[name] = {"page": page.get("fullurl"), "image": image_url,
                             "local_path": f"/images/contemporary/{destination.name}"}
            manifest_path.write_text(json.dumps(sources, ensure_ascii=False, indent=2), encoding="utf-8")
            time.sleep(2)
        with engine.begin() as connection:
            connection.execute(text("UPDATE history.entity SET image_url=:url WHERE name=:name AND track=:track"),
                               {"url": f"/images/contemporary/{destination.name}", "name": name, "track": track})
        print(f"Adicionado: {name}")


def main():
    upsert_entities()
    download_portraits()


if __name__ == "__main__":
    main()
