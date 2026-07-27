"""Importa para o banco todos os filósofos listados em HISTORY OF.xlsx."""

from pathlib import Path
from zipfile import ZipFile
import xml.etree.ElementTree as ET

from backend.app.database import SessionLocal
from backend.app.models import Entity


ROOT = Path(__file__).resolve().parent.parent
WORKBOOK = ROOT / "HISTORY OF.xlsx"
NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}

# A planilha organiza os nomes por períodos largos. Estes são os anos de
# nascimento tradicionalmente aceitos; valores negativos representam a.C.
BIRTH_YEARS = {
    "Tales de Mileto": -624,
    "Anaximandro": -610,
    "Anaxímenes": -586,
    "Heráclito": -535,
    "Parmênides": -515,
    "Pitágoras": -570,
    "Platão": -428,
    "Sócrates": -470,
    "Aristóteles": -384,
    "Confúcio": -551,
    "Lao-Tsé": -571,
    "Séneca": -4,
    "Agostinho de Hipona": 354,
    "Epicteto": 50,
    "Marco Aurélio": 121,
    "Boécio": 477,
    "Averróis": 1126,
    "René Descartes": 1596,
    "Baruch Spinoza": 1632,
    "John Locke": 1632,
    "Thomas Hobbes": 1588,
    "Gottfried Wilhelm Leibniz": 1646,
    "Immanuel Kant": 1724,
    "Schopenhauer": 1788,
    "David Hume": 1711,
    "Jean-Jacques Rousseau": 1712,
    "Friedrich Nietzsche": 1844,
    "G. W. F. Hegel": 1770,
    "Karl Marx": 1818,
    "Søren Kierkegaard": 1813,
    "Jean-Paul Sartre": 1905,
    "Michel Foucault": 1926,
    "Albert Camus": 1913,
    "Hannah Arendt": 1906,
    "Ludwig Wittgenstein": 1889,
    "Slavoj Žižek": 1949,
    "Judith Butler": 1956,
    "Jürgen Habermas": 1929,
}


def read_philosophers():
    """Lê a seção Filósofos (linha 2 e suas linhas recolhidas 3–7)."""
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
        if row_number not in range(2, 8):
            continue
        for cell in row.findall("m:c", NS):
            reference = cell.attrib["r"]
            value = cell.find("m:v", NS)
            if reference.startswith("A") or value is None or cell.get("t") != "s":
                continue
            names.append(strings[int(value.text)])
    return names


def import_philosophers():
    names = read_philosophers()
    missing_years = sorted(set(names) - set(BIRTH_YEARS))
    extra_years = sorted(set(BIRTH_YEARS) - set(names))
    if missing_years or extra_years:
        raise ValueError(
            f"Mapeamento divergente da planilha. Sem ano: {missing_years}; extras: {extra_years}"
        )

    created = 0
    updated = 0
    database = SessionLocal()
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
            entity.track = "Filósofos"
            entity.start_year = BIRTH_YEARS[name]
            if not entity.description:
                entity.description = "Filósofo listado no arquivo HISTORY OF.xlsx."

        database.commit()
        print(f"Planilha: {len(names)} nomes | criados: {created} | atualizados: {updated}")
    except Exception:
        database.rollback()
        raise
    finally:
        database.close()


if __name__ == "__main__":
    import_philosophers()
