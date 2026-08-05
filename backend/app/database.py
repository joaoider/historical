from sqlalchemy import create_engine, text
from sqlalchemy.engine import URL
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from sqlalchemy.orm import declarative_base

import os
from pathlib import Path

# Carregar arquivo .env do diretório backend
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

def get_database_url():
    """Aceita a URL única do Render ou as variáveis usadas localmente."""
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        return database_url.replace("postgresql://", "postgresql+psycopg://", 1)

    required = {
        "DB_HOST": os.getenv("DB_HOST"),
        "DB_PORT": os.getenv("DB_PORT"),
        "DB_NAME": os.getenv("DB_NAME"),
        "DB_USER": os.getenv("DB_USER"),
        "DB_PASSWORD": os.getenv("DB_PASSWORD"),
    }
    missing = [key for key, value in required.items() if not value]
    if missing:
        raise RuntimeError(
            "Configuração do banco incompleta. Defina DATABASE_URL ou: "
            + ", ".join(missing)
        )

    return URL.create(
        drivername="postgresql+psycopg",
        username=required["DB_USER"],
        password=required["DB_PASSWORD"],
        host=required["DB_HOST"],
        port=int(required["DB_PORT"]),
        database=required["DB_NAME"],
    )


DATABASE_URL = get_database_url()

Base = declarative_base()

engine = create_engine(DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


def get_db():
    """Dependency para obter sessão do banco de dados"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def initialize_database():
    """Cria de forma idempotente o schema e as tabelas em bancos novos."""
    with engine.begin() as connection:
        connection.execute(text("CREATE SCHEMA IF NOT EXISTS history"))

    Base.metadata.create_all(bind=engine)
