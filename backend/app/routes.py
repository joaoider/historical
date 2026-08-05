from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
import json

from sqlalchemy.orm import Session

from .database import get_db
from .models import Entity, Relationship, UserProgress
from .schemas import ProgressResponse, ProgressUpdate, StatsResponse

from .schemas import (
    EntityResponse,
    EntityCreate,
    RelationshipCreate,
    RelationshipResponse,
    RelationshipDetailResponse,
    TimelineResponse
)


router = APIRouter()


@router.get("/progress/{scope}", response_model=ProgressResponse)
def get_progress(scope: str, user_id: str = "mvp-user", db: Session = Depends(get_db)):
    progress = db.query(UserProgress).filter(
        UserProgress.user_id == user_id,
        UserProgress.scope == scope,
    ).first()
    if progress is None:
        return {"user_id": user_id, "scope": scope, "data": {}, "updated_at": None}
    try:
        data = json.loads(progress.data)
    except json.JSONDecodeError:
        data = {}
    return {
        "user_id": progress.user_id,
        "scope": progress.scope,
        "data": data,
        "updated_at": progress.updated_at.isoformat() if progress.updated_at else None,
    }


@router.put("/progress/{scope}", response_model=ProgressResponse)
def save_progress(scope: str, payload: ProgressUpdate, db: Session = Depends(get_db)):
    progress = db.query(UserProgress).filter(
        UserProgress.user_id == payload.user_id,
        UserProgress.scope == scope,
    ).first()
    if progress is None:
        progress = UserProgress(user_id=payload.user_id, scope=scope)
        db.add(progress)
    progress.data = json.dumps(payload.data, ensure_ascii=False)
    db.commit()
    db.refresh(progress)
    return {
        "user_id": progress.user_id,
        "scope": progress.scope,
        "data": payload.data,
        "updated_at": progress.updated_at.isoformat() if progress.updated_at else None,
    }


@router.delete("/progress/{scope}", status_code=status.HTTP_204_NO_CONTENT)
def delete_progress(scope: str, user_id: str = "mvp-user", db: Session = Depends(get_db)):
    db.query(UserProgress).filter(
        UserProgress.user_id == user_id,
        UserProgress.scope == scope,
    ).delete(synchronize_session=False)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


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

    if entity is None:
        raise HTTPException(status_code=404, detail="Entidade não encontrada")
    return entity

@router.post(
    "/entities",
    response_model=EntityResponse
)
def create_entity(
    entity: EntityCreate,
    db: Session = Depends(get_db)
):

    db_entity = Entity(**entity.model_dump())

    db.add(db_entity)

    db.commit()

    db.refresh(db_entity)

    return db_entity

@router.put("/entities/{entity_id}", response_model=EntityResponse)
def update_entity(entity_id: int, entity: EntityCreate, db: Session = Depends(get_db)):
    db_entity = db.query(Entity).filter(Entity.id == entity_id).first()
    if db_entity is None:
        raise HTTPException(status_code=404, detail="Entidade não encontrada")
    for field, value in entity.model_dump().items():
        setattr(db_entity, field, value)
    db.commit()
    db.refresh(db_entity)
    return db_entity

@router.delete("/entities/{entity_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_entity(entity_id: int, db: Session = Depends(get_db)):
    db_entity = db.query(Entity).filter(Entity.id == entity_id).first()
    if db_entity is None:
        raise HTTPException(status_code=404, detail="Entidade não encontrada")
    db.query(Relationship).filter(
        (Relationship.source_entity_id == entity_id) | (Relationship.target_entity_id == entity_id)
    ).delete(synchronize_session=False)
    db.delete(db_entity)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)




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
                "id": r.id,
                "source_id": r.source_entity_id,
                "source": r.source_entity.name,
                "relation": r.relationship_type,
                "target": r.target_entity.name,
                "target_id": r.target_entity_id,
                "notes": r.notes,
                "source_reference": r.source_reference,
            }
        )

    return result

@router.post("/relationships", response_model=RelationshipResponse)
def create_relationship(relationship: RelationshipCreate, db: Session = Depends(get_db)):
    if relationship.source_entity_id == relationship.target_entity_id:
        raise HTTPException(status_code=400, detail="Uma entidade não pode se relacionar consigo mesma")
    entity_ids = {row[0] for row in db.query(Entity.id).filter(Entity.id.in_([
        relationship.source_entity_id, relationship.target_entity_id
    ])).all()}
    if len(entity_ids) != 2:
        raise HTTPException(status_code=400, detail="Entidade de origem ou destino não encontrada")
    db_relationship = Relationship(**relationship.model_dump())
    db.add(db_relationship)
    db.commit()
    db.refresh(db_relationship)
    return db_relationship

@router.delete("/relationships/{relationship_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_relationship(relationship_id: int, db: Session = Depends(get_db)):
    relationship = db.query(Relationship).filter(Relationship.id == relationship_id).first()
    if relationship is None:
        raise HTTPException(status_code=404, detail="Relação não encontrada")
    db.delete(relationship)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)



@router.get(
    "/timeline",
    response_model=list[TimelineResponse]
)
def get_timeline(
    track: list[str] | None = Query(default=None),
    db: Session = Depends(get_db)
):
    """
    Retorna eventos da timeline, aceitando uma ou várias categorias.

    - **track**: Parâmetro repetível, por exemplo `?track=Livros&track=Artistas`.
    """

    query = db.query(Entity)

    if track:
        query = query.filter(
            Entity.track.in_(track)
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
