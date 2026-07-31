"""Importa pinturas e esculturas listadas em HISTORY OF.xlsx."""

from pathlib import Path
from zipfile import ZipFile
import xml.etree.ElementTree as ET

from backend.app.database import SessionLocal
from backend.app.models import Entity


ROOT = Path(__file__).resolve().parent.parent
WORKBOOK = ROOT / "HISTORY OF.xlsx"
NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
TRACK = "Obras"

# Ano de criação ou início da execução. Valores negativos representam a.C.;
# obras antigas sem data exata usam uma aproximação convencional.
START_YEARS = {
    "Vênus de Milo": -130,
    "A Última Ceia": 1495,
    "Mona Lisa": 1503,
    "A Noite Estrelada": 1889,
    "Guernica": 1937,
    "Discóbolo": -460,
    "Pietà": 1498,
    "David": 1501,
    "O Grito": 1893,
    "A Persistência da Memória": 1931,
    "Vitória de Samotrácia": -190,
    "O Nascimento de Vênus": 1485,
    "A Escola de Atenas": 1509,
    "Os Girassóis": 1888,
    "Abaporu": 1928,
    "As Meninas": 1656,
    "A Ronda Noturna": 1642,
}


def read_artworks():
    """Lê o cabeçalho 65 e suas linhas associadas 66–69."""
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
        if row_number not in range(65, 70):
            continue
        for cell in row.findall("m:c", NS):
            value = cell.find("m:v", NS)
            if cell.attrib["r"].startswith("A") or value is None or cell.get("t") != "s":
                continue
            names.append(strings[int(value.text)])
    return names


def import_artworks():
    names = read_artworks()
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
        database.query(Entity).filter(
            Entity.track == "Obras Pinturas | Esculturas"
        ).update({Entity.track: TRACK}, synchronize_session=False)
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

            entity.entity_type = "Obra de arte"
            entity.start_year = START_YEARS[name]
            if not entity.description:
                entity.description = "Obra listada no arquivo HISTORY OF.xlsx."

        database.commit()
        print(f"Planilha: {len(names)} obras | criadas: {created} | atualizadas: {updated}")
    except Exception:
        database.rollback()
        raise
    finally:
        database.close()


if __name__ == "__main__":
    import_artworks()
