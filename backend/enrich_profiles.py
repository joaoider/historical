"""Cria os campos de perfil e adiciona o primeiro perfil detalhado."""

from sqlalchemy import text

from app.database import engine


PLATO = {
    "notable_works": "A República\nO Banquete\nFédon\nFedro\nApologia de Sócrates\nCríton\nMênon\nTimeu\nAs Leis",
    "key_ideas": "Teoria das Formas\nAlegoria da Caverna\nConhecimento como reminiscência\nDivisão tripartite da alma\nO filósofo-rei\nJustiça como harmonia\nDistinção entre opinião e conhecimento",
    "legacy": (
        "Fundou a Academia de Atenas, uma das instituições mais influentes da Antiguidade. "
        "Seus diálogos moldaram a metafísica, a epistemologia, a ética e a filosofia política "
        "ocidentais, preservando também parte essencial do pensamento de Sócrates."
    ),
}


def main():
    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE history.entity ADD COLUMN IF NOT EXISTS notable_works TEXT"))
        connection.execute(text("ALTER TABLE history.entity ADD COLUMN IF NOT EXISTS key_ideas TEXT"))
        connection.execute(text("ALTER TABLE history.entity ADD COLUMN IF NOT EXISTS legacy TEXT"))
        connection.execute(
            text("""
                UPDATE history.entity
                SET notable_works=:notable_works, key_ideas=:key_ideas, legacy=:legacy
                WHERE name='Platão' AND track='Filósofos'
            """),
            PLATO,
        )
    print("Campos de perfil criados e perfil de Platão enriquecido.")


if __name__ == "__main__":
    main()
