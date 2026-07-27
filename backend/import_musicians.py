"""Substitui Cultura e importa os músicos listados em HISTORY OF.xlsx."""

from pathlib import Path
from zipfile import ZipFile
import xml.etree.ElementTree as ET

from backend.app.database import SessionLocal
from backend.app.models import Entity, Relationship


ROOT = Path(__file__).resolve().parent.parent
WORKBOOK = ROOT / "HISTORY OF.xlsx"
NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}

# Para bandas, o valor representa o ano de formação (início), não nascimento.
START_YEARS = {
    "Guido d'Arezzo": 991,
    "Hildegard von Bingen": 1098,
    "Josquin des Prez": 1450,
    "Giovanni Pierluigi da Palestrina": 1525,
    "Johann Sebastian Bach": 1685,
    "Wolfgang Amadeus Mozart": 1756,
    "Frédéric Chopin": 1810,
    "The Beatles": 1960,
    "Beyoncé": 1981,
    "Antonio Vivaldi": 1678,
    "Ludwig van Beethoven": 1770,
    "Pyotr Ilyich Tchaikovsky": 1840,
    "Elvis Presley": 1935,
    "Coldplay": 1997,
    "Richard Wagner": 1813,
    "Miles Davis": 1926,
    "Taylor Swift": 1989,
    "Igor Stravinsky": 1882,
}

BANDS = {"The Beatles", "Coldplay"}


def read_musicians():
    """Lê a seção musical (linha 70 e suas linhas recolhidas 71–73)."""
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
        if row_number not in range(70, 74):
            continue
        for cell in row.findall("m:c", NS):
            value = cell.find("m:v", NS)
            if cell.attrib["r"].startswith("A") or value is None or cell.get("t") != "s":
                continue
            names.append(strings[int(value.text)])
    return names


def import_musicians():
    names = read_musicians()
    missing_years = sorted(set(names) - set(START_YEARS))
    extra_years = sorted(set(START_YEARS) - set(names))
    if missing_years or extra_years:
        raise ValueError(
            f"Mapeamento divergente da planilha. Sem ano: {missing_years}; extras: {extra_years}"
        )

    database = SessionLocal()
    created = 0
    updated = 0
    removed = 0
    removed_relationships = 0
    try:
        # Cultura continha somente dados de demonstração e está sendo substituída.
        culture_entities = database.query(Entity).filter(Entity.track == "Cultura").all()
        culture_ids = [entity.id for entity in culture_entities]
        if culture_ids:
            removed_relationships = (
                database.query(Relationship)
                .filter(
                    (Relationship.source_entity_id.in_(culture_ids))
                    | (Relationship.target_entity_id.in_(culture_ids))
                )
                .delete(synchronize_session=False)
            )
            removed = (
                database.query(Entity)
                .filter(Entity.id.in_(culture_ids))
                .delete(synchronize_session=False)
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

            entity.entity_type = "Banda" if name in BANDS else "Pessoa"
            entity.track = "Músicos"
            entity.start_year = START_YEARS[name]
            if not entity.description:
                entity.description = "Nome listado na seção musical do arquivo HISTORY OF.xlsx."

        database.commit()
        print(
            f"Planilha: {len(names)} nomes | criados: {created} | atualizados: {updated} | "
            f"Cultura removida: {removed} item(ns), {removed_relationships} vínculo(s)"
        )
    except Exception:
        database.rollback()
        raise
    finally:
        database.close()


if __name__ == "__main__":
    import_musicians()
