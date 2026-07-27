"""Importa os livros e textos listados em HISTORY OF.xlsx."""

from pathlib import Path
from zipfile import ZipFile
import xml.etree.ElementTree as ET

from backend.app.database import SessionLocal
from backend.app.models import Entity


ROOT = Path(__file__).resolve().parent.parent
WORKBOOK = ROOT / "HISTORY OF.xlsx"
NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
TRACK = "Livros"

# Ano de composição, publicação ou início da tradição textual. Datas antigas
# são aproximações e anos negativos representam a.C.
START_YEARS = {
    "Epopeia de Gilgamesh": -2100,
    "Máximas de Ptahhotep": -2375,
    "História de Sinuhe": -1900,
    "Código de Hamurábi": -1754,
    "O Livro dos Mortos": -1550,
    "Torá (Pentateuco)": -1250,
    "Rigveda": -1500,
    "Ilíada": -750,
    "A República": -375,
    "Eneida": -19,
    "Confissões": 397,
    "Alcorão": 610,
    "Os Contos de Genji": 1008,
    "A Divina Comédia": 1308,
    "Os Contos de Cantuária": 1387,
    "Dom Quixote": 1605,
    "Paraíso Perdido": 1667,
    "O Contrato Social": 1762,
    "Os Miseráveis": 1862,
    "O Ser e o Nada": 1943,
    "O Caçador de Pipas": 2003,
    "Textos das Pirâmides": -2400,
    "Hinos de Enheduanna": -2300,
    "Épico de Atrahasis": -1700,
    "Enuma Elish": -1100,
    "Instruções de Amenemope": -1100,
    "I Ching": -1000,
    "Upanishads (Antigas)": -800,
    "Odisseia": -725,
    "Ética a Nicômaco": -340,
    "Meditações": 170,
    "Consolação da Filosofia": 524,
    "As Mil e Uma Noites": 800,
    "Os Lusíadas": 1572,
    "Os Sofrimentos do Jovem Werther": 1774,
    "Crime e Castigo": 1866,
    "O Estrangeiro": 1942,
    "A Menina que Roubava Livros": 2005,
    "Instruções de Shuruppak": -2600,
    "Livro dos Salmos": -1000,
    "Teogonia": -700,
    "Édipo Rei": -429,
    "Metamorfoses": 8,
    "Hamlet": 1600,
    "Orgulho e Preconceito": 1813,
    "A Metamorfose": 1915,
    "Sapiens: Uma Breve História da Humanidade": 2011,
    "Trabalhos e Dias": -700,
    "A Arte da Guerra": -500,
    "O Príncipe": 1532,
    "Crítica da Razão Pura": 1781,
    "Cem Anos de Solidão": 1967,
    "A Estrada": 2006,
    "Ramayana": -500,
    "Tao Te Ching": -400,
    "Utopia": 1516,
    "Dom Casmurro": 1899,
    "1984": 1949,
    "A Amiga Genial": 2011,
    "O Grande Gatsby": 1925,
    "O Código Da Vinci": 2003,
}


def read_books():
    """Lê a seção Livros (cabeçalho 22 e linhas associadas 23–27)."""
    with ZipFile(WORKBOOK) as workbook:
        strings_xml = ET.fromstring(workbook.read("xl/sharedStrings.xml"))
        strings = [
            "".join(node.text or "" for node in item.iterfind(".//m:t", NS))
            for item in strings_xml
        ]
        sheet = ET.fromstring(workbook.read("xl/worksheets/sheet1.xml"))

    names = []
    for row in sheet.findall(".//m:sheetData/m:row", NS):
        row_number = int(row.attrib["r"])
        if row_number not in range(22, 28):
            continue
        for cell in row.findall("m:c", NS):
            value = cell.find("m:v", NS)
            if cell.attrib["r"].startswith("A") or value is None:
                continue
            name = strings[int(value.text)] if cell.get("t") == "s" else value.text
            names.append("1984" if name in {"1984", "1984.0"} else name)
    return names


def import_books():
    names = read_books()
    missing_years = sorted(set(names) - set(START_YEARS))
    extra_years = sorted(set(START_YEARS) - set(names))
    if missing_years or extra_years:
        raise ValueError(
            f"Mapeamento divergente da planilha. Sem ano: {missing_years}; extras: {extra_years}"
        )

    database = SessionLocal()
    created = 0
    updated = 0
    try:
        existing = {
            entity.name: entity
            for entity in database.query(Entity)
            .filter(Entity.track == TRACK, Entity.name.in_(names))
            .all()
        }
        for name in names:
            entity = existing.get(name)
            if entity is None:
                entity = Entity(name=name, track=TRACK)
                database.add(entity)
                created += 1
            else:
                updated += 1

            entity.entity_type = "Livro"
            entity.start_year = START_YEARS[name]
            if not entity.description:
                entity.description = "Livro ou texto listado no arquivo HISTORY OF.xlsx."

        database.commit()
        print(f"Planilha: {len(names)} livros | criados: {created} | atualizados: {updated}")
    except Exception:
        database.rollback()
        raise
    finally:
        database.close()


if __name__ == "__main__":
    import_books()
