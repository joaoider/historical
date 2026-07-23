from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from sqlalchemy.orm import declarative_base

import os

load_dotenv()

DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")

#print(DB_HOST)
#print(DB_NAME)

DATABASE_URL = (
    f"postgresql+psycopg://{DB_USER}:{DB_PASSWORD}"
    f"@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

Base = declarative_base()

engine = create_engine(
    DATABASE_URL
)

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


#print(DB_USER)
#print(DB_PASSWORD)
#print(DB_NAME)
#print(DATABASE_URL)

"""
if __name__ == "__main__":

    connection = engine.connect()

    print("Conexão realizada com sucesso!")

    connection.close()
"""

def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()