"""Importa para o banco todos os teólogos listados em HISTORY OF.xlsx."""

from pathlib import Path
from zipfile import ZipFile
import xml.etree.ElementTree as ET

from backend.app.database import SessionLocal
from backend.app.models import Entity


ROOT = Path(__file__).resolve().parent.parent
WORKBOOK = ROOT / "HISTORY OF.xlsx"
NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}

# Datas antigas incertas são aproximações convencionais para a posição pontual.
BIRTH_YEARS = {
    "Orígenes": 185,
    "Isidoro de Sevilha": 560,
    "João Damasceno": 675,
    "Anselmo de Cantuária": 1033,
    "Pedro Lombardo": 1096,
    "Tomás de Aquino": 1225,
    "John Wycliffe": 1328,
    "Jan Hus": 1369,
    "Martinho Lutero": 1483,
    "Blaise Pascal": 1623,
    "Jonathan Edwards": 1703,
    "Friedrich Schleiermacher": 1768,
    "Karl Barth": 1886,
    "Gustavo Gutiérrez": 1928,
    "Tertuliano": 155,
    "Bernardo de Claraval": 1090,
    "Boaventura": 1217,
    "João Calvino": 1509,
    "Søren Kierkegaard": 1813,
    "C.S. Lewis": 1898,
    "Irineu de Lyon": 130,
    "Atanásio de Alexandria": 296,
    "Beda, o Venerável": 672,
    "Simeão, o Novo Teólogo": 949,
    "Pedro Abelardo": 1079,
    "Alberto Magno": 1200,
    "Meister Eckhart": 1260,
    "Tomás de Kempis": 1380,
    "Ulrico Zuínglio": 1484,
    "Jacob Armínio": 1560,
    "John Wesley": 1703,
    "John Henry Newman": 1801,
    "Dietrich Bonhoeffer": 1906,
    "N. T. Wright": 1948,
    "Clemente de Alexandria": 150,
    "João Crisóstomo": 347,
    "João Escoto Erígena": 815,
    "Hugo de São Vítor": 1096,
    "Duns Scotus": 1266,
    "Gregório Palamas": 1296,
    "Girolamo Savonarola": 1452,
    "Filipe Melâncton": 1497,
    "John Owen": 1616,
    "George Whitefield": 1714,
    "Charles Spurgeon": 1834,
    "Paul Tillich": 1886,
    "R. C. Sproul": 1939,
}


def read_theologians():
    """Lê a seção Teólogos (linhas recolhidas 75–78 sob o cabeçalho 74)."""
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
        if row_number not in range(75, 79):
            continue
        for cell in row.findall("m:c", NS):
            value = cell.find("m:v", NS)
            if cell.attrib["r"].startswith("A") or value is None or cell.get("t") != "s":
                continue
            names.append(strings[int(value.text)])
    return names


def import_theologians():
    names = read_theologians()
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
            .filter(Entity.track == "Teólogos", Entity.name.in_(names))
            .all()
        }

        for name in names:
            entity = existing.get(name)
            if entity is None:
                entity = Entity(name=name, track="Teólogos")
                database.add(entity)
                created += 1
            else:
                updated += 1

            entity.entity_type = "Pessoa"
            entity.start_year = BIRTH_YEARS[name]
            if not entity.description:
                entity.description = "Teólogo listado no arquivo HISTORY OF.xlsx."

        database.commit()
        print(f"Planilha: {len(names)} nomes | criados: {created} | atualizados: {updated}")
    except Exception:
        database.rollback()
        raise
    finally:
        database.close()


if __name__ == "__main__":
    import_theologians()
