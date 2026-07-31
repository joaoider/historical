"""Adiciona imagens, resumos e locais aos líderes da timeline."""

import json
import mimetypes
import time
from pathlib import Path
from urllib.parse import quote

from sqlalchemy import text

from app.database import engine
from enrich_musicians import download, request_json, safe_filename


ROOT = Path(__file__).resolve().parents[1]
IMAGE_DIRECTORY = ROOT / "frontend" / "public" / "images" / "leaders"

PAGES = {
    "Quéops": "Khufu", "Sargão da Acádia": "Sargon of Akkad", "Moisés": "Moses",
    "Ramsés II": "Ramesses II", "Rei Davi": "David", "Ciro, o Grande": "Cyrus the Great",
    "Buda": "The Buddha", "Péricles": "Pericles", "Alexandre, o Grande": "Alexander the Great",
    "Ashoka": "Ashoka", "Júlio César": "Julius Caesar", "Cleópatra": "Cleopatra",
    "Augusto": "Augustus", "Jesus": "Jesus", "Constantino": "Constantine the Great",
    "Justiniano I": "Justinian I", "Maomé": "Muhammad", "Carlos Magno": "Charlemagne",
    "Harun al-Rashid": "Harun al-Rashid", "Guilherme, o Conquistador": "William the Conqueror",
    "Saladino": "Saladin", "Genghis Khan": "Genghis Khan", "Mansa Musa": "Mansa Musa",
    "Joana d'Arc": "Joan of Arc", "Pachacuti": "Pachacuti", "Solimão, o Magnífico": "Suleiman the Magnificent",
    "Elizabeth I": "Elizabeth I", "Tokugawa Ieyasu": "Tokugawa Ieyasu", "Luís XIV": "Louis XIV",
    "Catarina, a Grande": "Catherine the Great", "George Washington": "George Washington",
    "Napoleão Bonaparte": "Napoleon", "Simón Bolívar": "Simón Bolívar", "Abraham Lincoln": "Abraham Lincoln",
    "Rainha Vitória": "Queen Victoria", "Harriet Tubman": "Harriet Tubman", "Mahatma Gandhi": "Mahatma Gandhi",
    "Winston Churchill": "Winston Churchill", "Franklin D. Roosevelt": "Franklin D. Roosevelt",
    "Nelson Mandela": "Nelson Mandela", "Martin Luther King Jr.": "Martin Luther King Jr.",
    "Dalai Lama": "14th Dalai Lama", "Papa Francisco": "Pope Francis", "Angela Merkel": "Angela Merkel",
    "Barack Obama": "Barack Obama", "Malala Yousafzai": "Malala Yousafzai",
}

DESCRIPTIONS = {
    "Quéops": "Faraó da IV dinastia egípcia associado à construção da Grande Pirâmide de Gizé.",
    "Sargão da Acádia": "Governante mesopotâmico que fundou o Império Acádio e unificou extensos territórios.",
    "Moisés": "Figura central das tradições judaica e cristã, apresentado como legislador e líder dos israelitas.",
    "Ramsés II": "Faraó egípcio de longo reinado, conhecido por campanhas militares e grandes projetos monumentais.",
    "Rei Davi": "Rei de Israel segundo a tradição bíblica, associado à consolidação de Jerusalém como capital.",
    "Ciro, o Grande": "Fundador do Império Aquemênida, conhecido por conquistas e administração tolerante de povos diversos.",
    "Buda": "Mestre espiritual cujos ensinamentos sobre sofrimento e libertação deram origem ao budismo.",
    "Péricles": "Estadista ateniense ligado ao fortalecimento da democracia e ao florescimento cultural de Atenas.",
    "Alexandre, o Grande": "Rei macedônio que formou um vasto império e difundiu a cultura helenística.",
    "Ashoka": "Imperador máuria que promoveu o budismo e políticas de bem-estar após a guerra de Kalinga.",
    "Júlio César": "General e estadista romano cuja ascensão alterou profundamente a República Romana.",
    "Cleópatra": "Última governante ativa do Egito ptolemaico, hábil na diplomacia com Roma.",
    "Augusto": "Primeiro imperador romano, responsável por reorganizar o Estado e inaugurar a Pax Romana.",
    "Jesus": "Pregador judeu do século I cuja vida e ensinamentos estão na origem do cristianismo.",
    "Constantino": "Imperador romano que favoreceu o cristianismo e fundou Constantinopla como nova capital imperial.",
    "Justiniano I": "Imperador bizantino associado à compilação do direito romano e à construção de Santa Sofia.",
    "Maomé": "Profeta do islamismo e líder religioso e político que unificou grande parte da Península Arábica.",
    "Carlos Magno": "Rei dos francos e imperador que expandiu e reorganizou grande parte da Europa ocidental.",
    "Harun al-Rashid": "Califa abássida cujo reinado marcou um período de prosperidade cultural em Bagdá.",
    "Guilherme, o Conquistador": "Duque da Normandia que conquistou a Inglaterra em 1066 e tornou-se seu rei.",
    "Saladino": "Líder muçulmano que unificou territórios e retomou Jerusalém durante as Cruzadas.",
    "Genghis Khan": "Fundador do Império Mongol, que se tornou o maior império terrestre contíguo da história.",
    "Mansa Musa": "Imperador do Mali conhecido pela riqueza, pela peregrinação a Meca e pelo apoio à educação.",
    "Joana d'Arc": "Líder militar francesa que participou de campanhas decisivas na Guerra dos Cem Anos.",
    "Pachacuti": "Governante inca que expandiu Cusco e estruturou o Império Inca.",
    "Solimão, o Magnífico": "Sultão otomano que ampliou o império e promoveu reformas jurídicas e culturais.",
    "Elizabeth I": "Rainha inglesa cujo reinado consolidou o protestantismo e ampliou a projeção marítima inglesa.",
    "Tokugawa Ieyasu": "Fundador do xogunato Tokugawa, que iniciou um longo período de estabilidade no Japão.",
    "Luís XIV": "Rei francês associado à monarquia absolutista e à construção do Palácio de Versalhes.",
    "Catarina, a Grande": "Imperatriz que expandiu o Império Russo e promoveu reformas inspiradas pelo Iluminismo.",
    "George Washington": "Comandante da independência e primeiro presidente dos Estados Unidos.",
    "Napoleão Bonaparte": "General e imperador francês que reformou instituições e transformou a política europeia.",
    "Simón Bolívar": "Líder das independências de diversos territórios sul-americanos do domínio espanhol.",
    "Abraham Lincoln": "Presidente norte-americano que preservou a União durante a Guerra Civil e combateu a escravidão.",
    "Rainha Vitória": "Monarca britânica cujo longo reinado coincidiu com grande expansão industrial e imperial.",
    "Harriet Tubman": "Abolicionista que conduziu pessoas escravizadas à liberdade e atuou pela igualdade de direitos.",
    "Mahatma Gandhi": "Líder da independência indiana que difundiu a resistência não violenta e a desobediência civil.",
    "Winston Churchill": "Primeiro-ministro britânico conhecido por sua liderança durante a Segunda Guerra Mundial.",
    "Franklin D. Roosevelt": "Presidente dos Estados Unidos durante o New Deal e grande parte da Segunda Guerra Mundial.",
    "Nelson Mandela": "Líder contra o apartheid e primeiro presidente negro da África do Sul.",
    "Martin Luther King Jr.": "Líder dos direitos civis que defendeu igualdade racial por meio da ação não violenta.",
    "Dalai Lama": "Líder espiritual tibetano conhecido pela defesa da não violência, do diálogo e da autonomia do Tibete.",
    "Papa Francisco": "Líder da Igreja Católica entre 2013 e 2025, conhecido pela ênfase em justiça social e diálogo.",
    "Angela Merkel": "Chanceler alemã entre 2005 e 2021, figura central da política europeia contemporânea.",
    "Barack Obama": "Presidente dos Estados Unidos entre 2009 e 2017 e primeiro afro-americano no cargo.",
    "Malala Yousafzai": "Ativista paquistanesa pelo direito das meninas à educação e laureada com o Nobel da Paz.",
}

LOCATIONS = {
    "Mansa Musa": ("Mali", 12.6392, -8.0029), "Rainha Vitória": ("Reino Unido", 51.5074, -0.1278),
    "Dalai Lama": ("China", 36.6333, 101.8667), "Justiniano I": ("Macedônia do Norte", 41.8981, 21.6114),
    "Ciro, o Grande": ("Irã", 30.1938, 53.1679), "Carlos Magno": ("Reino Franco", 50.8503, 4.3517),
}


def main():
    IMAGE_DIRECTORY.mkdir(parents=True, exist_ok=True)
    manifest_path = IMAGE_DIRECTORY / "sources.json"
    sources = json.loads(manifest_path.read_text(encoding="utf-8")) if manifest_path.exists() else {}

    with engine.begin() as connection:
        for name, description in DESCRIPTIONS.items():
            connection.execute(text("UPDATE history.entity SET description=:description WHERE name=:name AND track='Líderes'"), {"name": name, "description": description})
        for name, (country, latitude, longitude) in LOCATIONS.items():
            connection.execute(text("UPDATE history.entity SET origin_country=:country,latitude=:latitude,longitude=:longitude WHERE name=:name AND track='Líderes'"), {"name": name, "country": country, "latitude": latitude, "longitude": longitude})

    titles = "|".join(PAGES.values())
    batch_url = (
        "https://en.wikipedia.org/w/api.php?action=query&redirects=1&prop=pageimages|info"
        f"&pithumbsize=600&inprop=url&format=json&titles={quote(titles)}"
    )
    batch_result = request_json(batch_url)
    page_results = {
        page.get("title", "").casefold(): page
        for page in batch_result.get("query", {}).get("pages", {}).values()
    }
    normalized = {
        item["from"].casefold(): item["to"].casefold()
        for key in ("normalized", "redirects")
        for item in batch_result.get("query", {}).get(key, [])
    }

    for name, title in PAGES.items():
        existing = [p for p in IMAGE_DIRECTORY.glob(f"{safe_filename(name)}.*") if p.name != "sources.json"]
        if existing:
            public_path = f"/images/leaders/{existing[0].name}"
        else:
            try:
                lookup_title = title.casefold()
                while lookup_title in normalized:
                    lookup_title = normalized[lookup_title]
                summary = page_results.get(lookup_title, {})
                image_url = summary.get("thumbnail", {}).get("source")
                if not image_url:
                    print(f"Sem imagem: {name}")
                    continue
                extension = mimetypes.guess_extension(mimetypes.guess_type(image_url)[0] or "image/jpeg") or ".jpg"
                destination = IMAGE_DIRECTORY / f"{safe_filename(name)}{extension}"
                actual_extension = mimetypes.guess_extension(download(image_url, destination)) or extension
                if actual_extension != destination.suffix:
                    corrected = destination.with_suffix(actual_extension); destination.replace(corrected); destination = corrected
                public_path = f"/images/leaders/{destination.name}"
                sources[name] = {"page": summary.get("fullurl"), "image": image_url, "local_path": public_path}
                manifest_path.write_text(json.dumps(sources, ensure_ascii=False, indent=2), encoding="utf-8")
                time.sleep(3)
            except Exception as error:
                print(f"Falha em {name}: {error}")
                continue
        with engine.begin() as connection:
            connection.execute(text("UPDATE history.entity SET image_url=:image_url WHERE name=:name AND track='Líderes'"), {"name": name, "image_url": public_path})
        print(f"Imagem adicionada: {name}")


if __name__ == "__main__":
    main()
