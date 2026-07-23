#!/usr/bin/env python3
"""
Script para inserir mais dados históricos (cientistas e artistas)
Uso: python insert_data.py
"""

from sqlalchemy import text, func
from app.database import SessionLocal
from app.models import Entity, Relationship

def insert_data():
    """Insere dados de cientistas e artistas no banco de dados"""
    
    db = SessionLocal()
    
    try:
        # Verificar se os dados já existem
        existing = db.query(Entity).filter(Entity.name == "Isaac Newton").first()
        if existing:
            print("⚠️  Dados já existem no banco de dados!")
            return
        
        # Inserir cientistas
        print("📚 Inserindo cientistas...")
        newton = Entity(
            name="Isaac Newton",
            entity_type="Pessoa",
            track="Ciência",
            description="Matemático, físico e astrônomo inglês. Desenvolveu as leis do movimento e da gravitação universal.",
            start_year=1643,
            end_year=1727
        )
        
        curie = Entity(
            name="Marie Curie",
            entity_type="Pessoa",
            track="Ciência",
            description="Física e química polonesa-francesa. Pioneira no estudo da radioatividade e primeira mulher a ganhar Prêmio Nobel.",
            start_year=1867,
            end_year=1934
        )
        
        db.add(newton)
        db.add(curie)
        db.flush()  # Flush para obter os IDs
        
        # Inserir artistas
        print("🎨 Inserindo artistas...")
        leonardo = Entity(
            name="Leonardo da Vinci",
            entity_type="Pessoa",
            track="Arte",
            description="Pintor, escultor, arquiteto e inventor italiano do Renascimento. Criador da Mona Lisa e A Última Ceia.",
            start_year=1452,
            end_year=1519
        )
        
        michelangelo = Entity(
            name="Michelangelo",
            entity_type="Pessoa",
            track="Arte",
            description="Escultor, pintor e arquiteto italiano. Responsável pelo afresco do teto da Capela Sistina.",
            start_year=1475,
            end_year=1564
        )
        
        db.add(leonardo)
        db.add(michelangelo)
        db.flush()
        
        # Inserir era do Renascimento
        print("🎭 Inserindo era histórica...")
        renascimento = Entity(
            name="Renascimento",
            entity_type="Era Histórica",
            track="Cultura",
            description="Período de grande desenvolvimento artístico, científico e cultural na Europa.",
            start_year=1300,
            end_year=1600
        )
        
        db.add(renascimento)
        db.flush()
        
        # Criar relacionamentos
        print("🔗 Criando relacionamentos...")
        
        # Leonardo e Michelangelo com Renascimento
        rel1 = Relationship(
            source_entity_id=leonardo.id,
            target_entity_id=renascimento.id,
            relationship_type="participante"
        )
        
        rel2 = Relationship(
            source_entity_id=michelangelo.id,
            target_entity_id=renascimento.id,
            relationship_type="participante"
        )
        
        db.add(rel1)
        db.add(rel2)
        
        # Commit
        db.commit()
        
        # Exibir resultado
        total = db.query(Entity).count()
        print(f"\n✅ Dados inseridos com sucesso!")
        print(f"📊 Total de entidades no banco: {total}")
        
        # Listar todas as pessoas
        print("\n👥 Entidades por track:")
        tracks_count = db.query(Entity.track, func.count(Entity.id)).group_by(Entity.track).all()
        for track, count in tracks_count:
            print(f"   • {track or 'Sem categoria'}: {count} entidade(s)")
        
    except Exception as e:
        print(f"❌ Erro ao inserir dados: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("=" * 50)
    print("  Inserindo dados históricos")
    print("=" * 50)
    print()
    
    insert_data()
    
    print()
    print("=" * 50)
