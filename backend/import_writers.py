"""Importa para o banco todos os escritores listados em HISTORY OF.xlsx."""

from pathlib import Path
from zipfile import ZipFile
import xml.etree.ElementTree as ET

from backend.app.database import SessionLocal
from backend.app.models import Entity


ROOT = Path(__file__).resolve().parent.parent
WORKBOOK = ROOT / "HISTORY OF.xlsx"
NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}

# Anos negativos representam a.C. Datas incertas de autores antigos são
# aproximações convencionais, necessárias para a representação pontual.
BIRTH_YEARS = {
    "Homero": -800,
    "Sófocles": -496,
    "Virgílio": -70,
    "Li Bai": 701,
    "Murasaki Shikibu": 973,
    "Dante Alighieri": 1265,
    "Geoffrey Chaucer": 1343,
    "William Shakespeare": 1564,
    "Molière": 1622,
    "Voltaire": 1694,
    "Fiódor Dostoiévski": 1821,
    "Gabriel García Márquez": 1927,
    "Chimamanda Ngozi Adichie": 1977,
    "Hesíodo": -700,
    "Eurípides": -480,
    "Ovídio": -43,
    "Plutarco": 46,
    "Miguel de Cervantes": 1547,
    "Goethe": 1749,
    "Machado de Assis": 1839,
    "Jorge Luis Borges": 1899,
    "Haruki Murakami": 1949,
    "Safo": -630,
    "Luís de Camões": 1524,
    "Franz Kafka": 1883,
    "Virginia Woolf": 1882,
    "J. K. Rowling": 1965,
    "Jane Austen": 1775,
    "Clarice Lispector": 1920,
    "Elena Ferrante": 1943,
    "Victor Hugo": 1802,
    "George Orwell": 1903,
    "Sally Rooney": 1991,
}


def read_writers():
    """Lê a seção Escritores (linha 17 e suas linhas recolhidas 18–21)."""
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
        if row_number not in range(17, 22):
            continue
        for cell in row.findall("m:c", NS):
            value = cell.find("m:v", NS)
            if cell.attrib["r"].startswith("A") or value is None or cell.get("t") != "s":
                continue
            names.append(strings[int(value.text)])
    return names


def import_writers():
    names = read_writers()
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
            entity.track = "Escritores"
            entity.start_year = BIRTH_YEARS[name]
            if not entity.description:
                entity.description = "Escritor listado no arquivo HISTORY OF.xlsx."

        database.commit()
        print(f"Planilha: {len(names)} nomes | criados: {created} | atualizados: {updated}")
    except Exception:
        database.rollback()
        raise
    finally:
        database.close()


if __name__ == "__main__":
    import_writers()
