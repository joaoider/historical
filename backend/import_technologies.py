"""Importa as tecnologias listadas em HISTORY OF.xlsx."""

from pathlib import Path
from zipfile import ZipFile
import xml.etree.ElementTree as ET

from backend.app.database import SessionLocal
from backend.app.models import Entity


ROOT = Path(__file__).resolve().parent.parent
WORKBOOK = ROOT / "HISTORY OF.xlsx"
NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
TRACK = "Tecnologias"

# Ano de surgimento, invenção ou primeira demonstração. Tecnologias antigas
# de desenvolvimento gradual usam datas aproximadas; anos negativos são a.C.
START_YEARS = {
    "Papiro": -3000,
    "Bronze": -3300,
    "Roda com raios": -2000,
    "Alfabeto": -1800,
    "Relógio de sol": -1500,
    "Trabalho em ferro": -1200,
    "Moedas": -600,
    "Catapulta": -400,
    "Besta": -600,
    "Moinho de água": -300,
    "Bússola": -200,
    "Arado pesado": 600,
    "Pólvora": 850,
    "Impressão (China)": 868,
    "Bússola magnética": 1040,
    "Óculos": 1286,
    "Relógio mecânico": 1280,
    "Imprensa": 1440,
    "Mosquete": 1521,
    "Telescópio": 1608,
    "Máquina a vapor": 1712,
    "Locomotiva": 1804,
    "Avião": 1903,
    "Smartphone": 1994,
    "Roda de oleiro": -3500,
    "Carruagem": -2000,
    "Sistema de esgoto": -2600,
    "Vidro": -3500,
    "Espada de ferro": -1200,
    "Aqueduto": -700,
    "Polia": -750,
    "Guindaste": -600,
    "Astrolábio": -200,
    "Papel": 105,
    "Estribo": 300,
    "Moinho de vento": 644,
    "Fogo grego": 672,
    "Papel-moeda": 1024,
    "Roca de fiar": 1000,
    "Canhão": 1326,
    "Arcabuz": 1450,
    "Lápis": 1564,
    "Microscópio": 1590,
    "Para-raios": 1752,
    "Fotografia": 1826,
    "Computador": 1945,
    "Internet Banda Larga": 2000,
    "Parafuso de Arquimedes": -250,
    "Termômetro": 1593,
    "Bateria": 1800,
    "Telégrafo": 1837,
    "Internet": 1969,
    "Inteligência Artificial": 1956,
    "Barômetro": 1643,
    "Balão de ar quente": 1783,
    "Telefone": 1876,
    "Televisão": 1927,
    "Redes Sociais": 1997,
    "Relógio de pêndulo": 1656,
    "Tear mecânico": 1785,
    "Lâmpada incandescente": 1879,
    "Transistor": 1947,
    "CRISPR": 2012,
    "Motor de combustão": 1860,
    "Satélite artificial": 1957,
    "Realidade Virtual": 1968,
}


def read_technologies():
    """Lê a seção Tecnologias (cabeçalho 79 e linhas associadas 80–84)."""
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
        if row_number not in range(79, 85):
            continue
        for cell in row.findall("m:c", NS):
            value = cell.find("m:v", NS)
            if cell.attrib["r"].startswith("A") or value is None or cell.get("t") != "s":
                continue
            names.append(strings[int(value.text)])
    return names


def import_technologies():
    names = read_technologies()
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

            entity.entity_type = "Tecnologia"
            entity.start_year = START_YEARS[name]
            if not entity.description:
                entity.description = "Tecnologia listada no arquivo HISTORY OF.xlsx."

        database.commit()
        print(f"Planilha: {len(names)} tecnologias | criadas: {created} | atualizadas: {updated}")
    except Exception:
        database.rollback()
        raise
    finally:
        database.close()


if __name__ == "__main__":
    import_technologies()
