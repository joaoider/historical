#!/usr/bin/env python
"""Script para testar a conexão com o banco de dados"""

import asyncio
from app.database import engine, SessionLocal
from sqlalchemy import text

try:
    # Testar conexão
    with SessionLocal() as session:
        result = session.execute(text("SELECT 1"))
        print("✅ Conexão com banco de dados bem-sucedida!")
        
    # Verificar se as tabelas existem
    with engine.connect() as conn:
        schemas = conn.execute(text("SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'history'"))
        if schemas.fetchone():
            print("✅ Schema 'history' existe!")
            
            # Contar entities
            with SessionLocal() as session:
                from app.models import Entity
                count = session.query(Entity).count()
                print(f"✅ {count} entidades encontradas no banco de dados")
        else:
            print("⚠️  Schema 'history' não encontrado. Execute: psql -d historical -f ../sql/init_database.sql")
            
except Exception as e:
    print(f"❌ Erro ao conectar ao banco de dados: {e}")
    print("\nVerifique:")
    print("1. Se PostgreSQL está rodando")
    print("2. Se o arquivo .env está correto")
    print("3. Se o banco 'historical' existe")
    print("4. Se o schema 'history' foi criado com init_database.sql")
