from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .database import get_db
from .models import Entity, Relationship
from .schemas import StatsResponse

from .schemas import (
    EntityResponse,
    EntityCreate,
    RelationshipDetailResponse,
    TimelineResponse
)


router = APIRouter()


@router.get(
    "/entities",
    response_model=list[EntityResponse]
)
def get_entities(
    db: Session = Depends(get_db)
):
    entities = db.query(Entity).all()

    return entities





@router.get(
    "/entities/{entity_id}",
    response_model=EntityResponse
)
def get_entity(
    entity_id: int,
    db: Session = Depends(get_db)
):

    entity = (
        db.query(Entity)
        .filter(Entity.id == entity_id)
        .first()
    )

    return entity

@router.post(
    "/entities",
    response_model=EntityResponse
)
def create_entity(
    entity: EntityCreate,
    db: Session = Depends(get_db)
):

    db_entity = Entity(
        name=entity.name,
        entity_type=entity.entity_type,
        description=entity.description,
        track=entity.track,
        start_year=entity.start_year,
        end_year=entity.end_year
    )

    db.add(db_entity)

    db.commit()

    db.refresh(db_entity)

    return db_entity




@router.get(
    "/relationships",
    response_model=list[RelationshipDetailResponse]
)
def get_relationships(
    db: Session = Depends(get_db)
):

    relationships = (
        db.query(Relationship)
        .all()
    )


    result = []

    for r in relationships:

        result.append(
            {
                "source": r.source_entity.name,
                "relation": r.relationship_type,
                "target": r.target_entity.name
            }
        )

    return result



@router.get(
    "/timeline",
    response_model=list[TimelineResponse]
)
def get_timeline(
    type: str | None = None,
    track: str | None = None,
    start: int | None = None,
    end: int | None = None,
    db: Session = Depends(get_db)
):
    """
    Retorna eventos da timeline com suporte a filtros por tipo, track e período.
    
    - **type**: Filtrar por tipo de entidade (ex: "Política", "Tecnologia")
    - **track**: Filtrar por track/categoria (ex: "História", "Ciência")
    - **start**: Filtrar por ano inicial (>=)
    - **end**: Filtrar por ano final (<=)
    """

    query = db.query(Entity)

    if type:
        query = query.filter(
            Entity.entity_type == type
        )

    if track:
        query = query.filter(
            Entity.track == track
        )

    if start:
        query = query.filter(
            Entity.start_year >= start
        )

    if end:
        query = query.filter(
            Entity.start_year <= end
        )

    timeline = (
        query
        .order_by(Entity.start_year)
        .all()
    )

    return timeline


@router.get("/tracks")
def get_tracks(db: Session = Depends(get_db)):
    """Retorna lista de todas as tracks/categorias disponíveis"""
    tracks = (
        db.query(Entity.track)
        .distinct()
        .filter(Entity.track.isnot(None))
        .all()
    )
    return [{"name": t[0]} for t in tracks]


@router.get(
    "/stats",
    response_model=StatsResponse
)
def get_stats(
    db: Session = Depends(get_db)
):

    total = (
        db.query(Entity)
        .count()
    )


    entities = (
        db.query(
            Entity.entity_type
        )
        .all()
    )


    types = {}


    for entity in entities:

        entity_type = entity[0]

        if entity_type in types:

            types[entity_type] += 1

        else:

            types[entity_type] = 1


    return {
        "total_entities": total,
        "types": types
    }