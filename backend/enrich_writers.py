"""Adiciona imagens locais e descrições em português aos escritores."""

import json
import mimetypes
import time
from pathlib import Path
from urllib.parse import quote

from sqlalchemy import text

from app.database import engine
from enrich_musicians import download, request_json, safe_filename


ROOT = Path(__file__).resolve().parents[1]
IMAGE_DIRECTORY = ROOT / "frontend" / "public" / "images" / "writers"

PAGES = {
    "Homero": "Homer", "Sófocles": "Sophocles", "Virgílio": "Virgil", "Li Bai": "Li Bai",
    "Murasaki Shikibu": "Murasaki Shikibu", "Dante Alighieri": "Dante Alighieri",
    "Geoffrey Chaucer": "Geoffrey Chaucer", "William Shakespeare": "William Shakespeare",
    "Molière": "Molière", "Voltaire": "Voltaire", "Fiódor Dostoiévski": "Fyodor Dostoevsky",
    "Gabriel García Márquez": "Gabriel García Márquez", "Chimamanda Ngozi Adichie": "Chimamanda Ngozi Adichie",
    "Hesíodo": "Hesiod", "Eurípides": "Euripides", "Ovídio": "Ovid", "Plutarco": "Plutarch",
    "Miguel de Cervantes": "Miguel de Cervantes", "Goethe": "Johann Wolfgang von Goethe",
    "Machado de Assis": "Machado de Assis", "Jorge Luis Borges": "Jorge Luis Borges",
    "Haruki Murakami": "Haruki Murakami", "Safo": "Sappho", "Luís de Camões": "Luís de Camões",
    "Franz Kafka": "Franz Kafka", "Virginia Woolf": "Virginia Woolf", "J. K. Rowling": "J. K. Rowling",
    "Jane Austen": "Jane Austen", "Clarice Lispector": "Clarice Lispector", "Elena Ferrante": "Elena Ferrante",
    "Victor Hugo": "Victor Hugo", "George Orwell": "George Orwell", "Sally Rooney": "Sally Rooney",
}

DESCRIPTIONS = {
    "Homero": "Poeta grego a quem são atribuídas a Ilíada e a Odisseia, obras fundamentais da tradição literária ocidental.",
    "Sófocles": "Dramaturgo da Grécia Antiga, autor de tragédias como Édipo Rei e Antígona.",
    "Virgílio": "Poeta romano, autor da Eneida, epopeia que vinculou a origem mítica de Roma à tradição homérica.",
    "Li Bai": "Poeta chinês da dinastia Tang, célebre pela linguagem lírica, pelas imagens da natureza e por poemas sobre amizade e viagem.",
    "Murasaki Shikibu": "Escritora e dama da corte japonesa, autora de O Conto de Genji, um dos grandes clássicos da literatura mundial.",
    "Dante Alighieri": "Poeta florentino, autor da Divina Comédia e figura decisiva na consolidação da língua literária italiana.",
    "Geoffrey Chaucer": "Poeta inglês medieval, autor de Os Contos da Cantuária e um dos principais formadores da tradição literária inglesa.",
    "William Shakespeare": "Dramaturgo e poeta inglês, autor de peças como Hamlet, Macbeth, Romeu e Julieta e de uma importante coleção de sonetos.",
    "Molière": "Dramaturgo e ator francês conhecido por comédias satíricas como Tartufo, O Avarento e O Doente Imaginário.",
    "Voltaire": "Escritor e filósofo iluminista francês, autor de Cândido e defensor da tolerância religiosa e da liberdade de expressão.",
    "Fiódor Dostoiévski": "Romancista russo que investigou conflitos morais, psicológicos e sociais em obras como Crime e Castigo e Os Irmãos Karamázov.",
    "Gabriel García Márquez": "Escritor colombiano, vencedor do Nobel de Literatura e autor de Cem Anos de Solidão, marco do realismo mágico.",
    "Chimamanda Ngozi Adichie": "Escritora nigeriana conhecida por romances e ensaios sobre identidade, migração, gênero e a experiência pós-colonial.",
    "Hesíodo": "Poeta grego antigo, autor de Teogonia e Trabalhos e Dias, fontes essenciais sobre mitologia e vida rural gregas.",
    "Eurípides": "Dramaturgo da Grécia Antiga cujas tragédias, como Medeia e As Bacantes, exploram paixões e conflitos humanos.",
    "Ovídio": "Poeta romano, autor de Metamorfoses, vasta narrativa mitológica que exerceu profunda influência sobre a arte e a literatura europeias.",
    "Plutarco": "Escritor, historiador e filósofo grego conhecido por Vidas Paralelas, conjunto de biografias de figuras gregas e romanas.",
    "Miguel de Cervantes": "Escritor espanhol, autor de Dom Quixote, obra central para o desenvolvimento do romance moderno.",
    "Goethe": "Escritor alemão, autor de Fausto e Os Sofrimentos do Jovem Werther, figura central do classicismo de Weimar.",
    "Machado de Assis": "Escritor brasileiro e fundador da Academia Brasileira de Letras, autor de Memórias Póstumas de Brás Cubas e Dom Casmurro.",
    "Jorge Luis Borges": "Escritor argentino conhecido por contos e ensaios que exploram labirintos, espelhos, bibliotecas, tempo e infinito.",
    "Haruki Murakami": "Escritor japonês contemporâneo cujos romances combinam cotidiano, solidão, música e elementos fantásticos.",
    "Safo": "Poeta lírica da Grécia Antiga, originária de Lesbos, conhecida por versos de grande intensidade sobre amor e desejo.",
    "Luís de Camões": "Poeta português, autor de Os Lusíadas, epopeia central da literatura em língua portuguesa.",
    "Franz Kafka": "Escritor de língua alemã, autor de A Metamorfose e O Processo, conhecido por narrativas sobre alienação e poder burocrático.",
    "Virginia Woolf": "Escritora britânica modernista, autora de Mrs Dalloway, Ao Farol e do ensaio Um Teto Todo Seu.",
    "J. K. Rowling": "Escritora britânica conhecida pela série Harry Potter, uma das obras de fantasia mais difundidas da literatura contemporânea.",
    "Jane Austen": "Romancista inglesa conhecida por obras como Orgulho e Preconceito e Emma, marcadas por ironia e observação social.",
    "Clarice Lispector": "Escritora brasileira de origem ucraniana, autora de romances e contos de forte investigação existencial e linguagem inovadora.",
    "Elena Ferrante": "Pseudônimo de uma escritora italiana conhecida pela tetralogia napolitana, iniciada com A Amiga Genial.",
    "Victor Hugo": "Escritor francês do romantismo, autor de Os Miseráveis e Notre-Dame de Paris, além de poeta e dramaturgo.",
    "George Orwell": "Escritor e ensaísta britânico, autor de 1984 e A Revolução dos Bichos, obras críticas ao autoritarismo.",
    "Sally Rooney": "Escritora irlandesa contemporânea conhecida por romances sobre intimidade, classe e relações geracionais, como Pessoas Normais.",
}


def main():
    IMAGE_DIRECTORY.mkdir(parents=True, exist_ok=True)
    manifest_path = IMAGE_DIRECTORY / "sources.json"
    sources = json.loads(manifest_path.read_text(encoding="utf-8")) if manifest_path.exists() else {}

    with engine.begin() as connection:
        for name, description in DESCRIPTIONS.items():
            connection.execute(
                text("UPDATE history.entity SET description=:description WHERE name=:name AND track='Escritores'"),
                {"name": name, "description": description},
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
                sources[name] = {
                    "page": page.get("fullurl"), "image": image_url,
                    "local_path": f"/images/writers/{destination.name}",
                }
                manifest_path.write_text(json.dumps(sources, ensure_ascii=False, indent=2), encoding="utf-8")
                time.sleep(1)
            except Exception as error:
                print(f"Falha em {name}: {error}")
                continue

        with engine.begin() as connection:
            connection.execute(
                text("UPDATE history.entity SET image_url=:image_url WHERE name=:name AND track='Escritores'"),
                {"name": name, "image_url": f"/images/writers/{destination.name}"},
            )
        print(f"Imagem adicionada: {name}")


if __name__ == "__main__":
    main()
