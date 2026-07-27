"""Importa para o banco todos os cientistas listados em HISTORY OF.xlsx."""

from pathlib import Path
from zipfile import ZipFile
import xml.etree.ElementTree as ET

from backend.app.database import SessionLocal
from backend.app.models import Entity


ROOT = Path(__file__).resolve().parent.parent
WORKBOOK = ROOT / "HISTORY OF.xlsx"
NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}

# A planilha separa os nomes por períodos largos; os valores abaixo dão a
# posição pontual solicitada. Anos negativos representam a.C.
BIRTH_YEARS = {
    "Hipócrates": -460,
    "Arquimedes": -287,
    "Ptolomeu": 100,
    "Al-Khwarizmi": 780,
    "Al-Biruni": 973,
    "Omar Khayyam": 1048,
    "Nicolau Copérnico": 1473,
    "Galileu Galilei": 1564,
    "Antonie van Leeuwenhoek": 1632,
    "Carl Linnaeus": 1707,
    "Albert Einstein": 1879,
    "Tim Berners-Lee": 1955,
    "Euclides": -325,
    "Galeno": 129,
    "Avicena": 980,
    "Isaac Newton": 1643,
    "Robert Hooke": 1635,
    "Antoine Lavoisier": 1743,
    "Marie Curie": 1867,
    "Niels Bohr": 1885,
    "Kip Thorne": 1940,
    "Eratóstenes": -276,
    "Alhazen": 965,
    "Johannes Kepler": 1571,
    "Charles Darwin": 1809,
    "Alan Turing": 1912,
    "Aristarco de Samos": -310,
    "Nikola Tesla": 1856,
    "Rosalind Franklin": 1920,
    "Michael Faraday": 1791,
    "Stephen Hawking": 1942,
    "Louis Pasteur": 1822,
    "Richard Feynman": 1918,
    "James Clerk Maxwell": 1831,
    "J. Robert Oppenheimer": 1904,
    "Hipátia": 355,
    "Tycho Brahe": 1546,
    "Blaise Pascal": 1623,
    "Leonhard Euler": 1707,
    "Dmitri Mendeleev": 1834,
    "Werner Heisenberg": 1901,
    "Christiaan Huygens": 1629,
    "Alessandro Volta": 1745,
    "Gregor Mendel": 1822,
    "Carl Sagan": 1934,
    "William Harvey": 1578,
    "Edward Jenner": 1749,
    "Ada Lovelace": 1815,
    "Jane Goodall": 1934,
    "Robert Boyle": 1627,
    "Benjamin Franklin": 1706,
    "Max Planck": 1858,
    "Enrico Fermi": 1901,
    "Thomas Edison": 1847,
    "Erwin Schrödinger": 1887,
    "Alexander Graham Bell": 1847,
    "Edwin Hubble": 1889,
    "John Dalton": 1766,
}


def read_scientists():
    """Lê a seção Cientistas (linha 28 e suas linhas recolhidas 29–41)."""
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
        if row_number not in range(28, 42):
            continue
        for cell in row.findall("m:c", NS):
            value = cell.find("m:v", NS)
            if cell.attrib["r"].startswith("A") or value is None or cell.get("t") != "s":
                continue
            names.append(strings[int(value.text)])
    return names


def import_scientists():
    names = read_scientists()
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
        # Renomeia inclusive eventuais registros antigos que não estejam na planilha.
        renamed = (
            database.query(Entity)
            .filter(Entity.track == "Ciência")
            .update({Entity.track: "Cientistas"}, synchronize_session=False)
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
            entity.track = "Cientistas"
            entity.start_year = BIRTH_YEARS[name]
            if not entity.description:
                entity.description = "Cientista listado no arquivo HISTORY OF.xlsx."

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
    import_scientists()
