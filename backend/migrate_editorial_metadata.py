"""Adiciona metadados editoriais e relacionais sem alterar o acervo existente."""

from sqlalchemy import text

from app.database import engine


ENTITY_COLUMNS = {
    "sources": "TEXT",
    "image_source": "VARCHAR(500)",
    "image_license": "VARCHAR(120)",
    "reviewed_at": "VARCHAR(10)",
    "certainty_level": "VARCHAR(30) DEFAULT 'confirmado'",
    "editorial_status": "VARCHAR(30) DEFAULT 'rascunho'",
}

RELATIONSHIP_COLUMNS = {
    "notes": "TEXT",
    "source_reference": "VARCHAR(500)",
}


def migrate():
    with engine.begin() as connection:
        for name, column_type in ENTITY_COLUMNS.items():
            connection.execute(text(f"ALTER TABLE history.entity ADD COLUMN IF NOT EXISTS {name} {column_type}"))
        for name, column_type in RELATIONSHIP_COLUMNS.items():
            connection.execute(text(f"ALTER TABLE history.relationship ADD COLUMN IF NOT EXISTS {name} {column_type}"))
    print("Metadados editoriais adicionados com sucesso.")


if __name__ == "__main__":
    migrate()
