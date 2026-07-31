"""Importa para o banco todos os artistas listados em HISTORY OF.xlsx."""

from pathlib import Path
from zipfile import ZipFile
import xml.etree.ElementTree as ET

from backend.app.database import SessionLocal
from backend.app.models import Entity


ROOT = Path(__file__).resolve().parent.parent
WORKBOOK = ROOT / "HISTORY OF.xlsx"
NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}

# Anos negativos representam a.C.; datas incertas da Antiguidade são
# aproximações convencionais para permitir a representação pontual.
BIRTH_YEARS = {
    "Fídias": -480,
    "Leonardo da Vinci": 1452,
    "Caravaggio": 1571,
    "Vincent van Gogh": 1853,
    "Salvador Dalí": 1904,
    "Policleto": -480,
    "Michelangelo": 1475,
    "Rembrandt": 1606,
    "Pablo Picasso": 1881,
    "Frida Kahlo": 1907,
    "Praxíteles": -395,
    "Rafael Sanzio": 1483,
    "Diego Velázquez": 1599,
    "Claude Monet": 1840,
    "Donatello": 1386,
    "Sandro Botticelli": 1445,
    "Auguste Rodin": 1840,
    "Edvard Munch": 1863,
}


def read_artists():
    """Lê a seção Artistas (linha 56 e suas linhas recolhidas 57–60)."""
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
        if row_number not in range(56, 61):
            continue
        for cell in row.findall("m:c", NS):
            value = cell.find("m:v", NS)
            if cell.attrib["r"].startswith("A") or value is None or cell.get("t") != "s":
                continue
            names.append(strings[int(value.text)])
    return names


def import_artists():
    names = read_artists()
    missing_years = sorted(set(names) - set(BIRTH_YEARS))
    extra_years = sorted(set(BIRTH_YEARS) - set(names))
    if missing_years or extra_years:
        raise ValueError(
            f"Mapeamento divergente da planilha. Sem ano: {missing_years}; extras: {extra_years}"
        )

    database = SessionLocal()
    created = 0
    updated = 0
    renamed = 0
    try:
        renamed = (
            database.query(Entity)
            .filter(Entity.track == "Arte")
            .update({Entity.track: "Artistas"}, synchronize_session=False)
        )
        existing = {
            entity.name: entity
            for entity in database.query(Entity).filter(Entity.name.in_(names)).all()
        }

        for name in names:
            entity = existing.get(name)
            if entity is None:
                entity = Entity(name=name)
                database.add(entity)
                created += 1
            else:
                updated += 1

            entity.entity_type = "Pessoa"
            entity.track = "Artistas"
            entity.start_year = BIRTH_YEARS[name]
            if not entity.description:
                entity.description = "Artista listado no arquivo HISTORY OF.xlsx."

        database.commit()
        print(
            f"Planilha: {len(names)} nomes | criados: {created} | "
            f"atualizados: {updated} | categoria renomeada: {renamed}"
        )
    except Exception:
        database.rollback()
        raise
    finally:
        database.close()


if __name__ == "__main__":
    import_artists()
