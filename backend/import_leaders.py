"""Importa os líderes listados em HISTORY OF.xlsx."""

from pathlib import Path
from zipfile import ZipFile
import xml.etree.ElementTree as ET

from backend.app.database import SessionLocal
from backend.app.models import Entity


ROOT = Path(__file__).resolve().parent.parent
WORKBOOK = ROOT / "HISTORY OF.xlsx"
NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
TRACK = "Líderes"

# Anos negativos representam a.C. Cronologias antigas incertas ou tradicionais
# usam datas aproximadas para permitir a representação pontual.
BIRTH_YEARS = {
    "Quéops": -2589,
    "Ramsés II": -1303,
    "Rei Davi": -1040,
    "Buda": -563,
    "Alexandre, o Grande": -356,
    "Jesus": -4,
    "Maomé": 570,
    "Carlos Magno": 742,
    "Guilherme, o Conquistador": 1028,
    "Saladino": 1137,
    "Genghis Khan": 1162,
    "Mansa Musa": 1280,
    "Joana d'Arc": 1412,
    "Solimão, o Magnífico": 1494,
    "Luís XIV": 1638,
    "George Washington": 1732,
    "Napoleão Bonaparte": 1769,
    "Mahatma Gandhi": 1869,
    "Dalai Lama": 1935,
    "Sargão da Acádia": -2400,
    "Moisés": -1391,
    "Péricles": -495,
    "Júlio César": -100,
    "Constantino": 272,
    "Justiniano I": 482,
    "Harun al-Rashid": 763,
    "Pachacuti": 1418,
    "Elizabeth I": 1533,
    "Tokugawa Ieyasu": 1543,
    "Catarina, a Grande": 1729,
    "Abraham Lincoln": 1809,
    "Winston Churchill": 1874,
    "Malala Yousafzai": 1997,
    "Ciro, o Grande": -600,
    "Cleópatra": -69,
    "Augusto": -63,
    "Simón Bolívar": 1783,
    "Rainha Vitória": 1819,
    "Nelson Mandela": 1918,
    "Barack Obama": 1961,
    "Ashoka": -304,
    "Harriet Tubman": 1822,
    "Martin Luther King Jr.": 1929,
    "Angela Merkel": 1954,
    "Franklin D. Roosevelt": 1882,
    "Papa Francisco": 1936,
}


def read_leaders():
    """Lê a seção Líderes (cabeçalho 88 e linhas associadas 89–92)."""
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
        if row_number not in range(88, 93):
            continue
        for cell in row.findall("m:c", NS):
            value = cell.find("m:v", NS)
            if cell.attrib["r"].startswith("A") or value is None or cell.get("t") != "s":
                continue
            names.append(strings[int(value.text)])
    return names


def import_leaders():
    names = read_leaders()
    missing_years = sorted(set(names) - set(BIRTH_YEARS))
    extra_years = sorted(set(BIRTH_YEARS) - set(names))
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

            entity.entity_type = "Pessoa"
            entity.start_year = BIRTH_YEARS[name]
            if not entity.description:
                entity.description = "Líder listado no arquivo HISTORY OF.xlsx."

        database.commit()
        print(f"Planilha: {len(names)} líderes | criados: {created} | atualizados: {updated}")
    except Exception:
        database.rollback()
        raise
    finally:
        database.close()


if __name__ == "__main__":
    import_leaders()
