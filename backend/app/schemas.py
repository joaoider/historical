from pydantic import BaseModel


class EntityBase(BaseModel):
    name: str
    entity_type: str
    description: str | None = None
    notable_works: str | None = None
    key_ideas: str | None = None
    legacy: str | None = None
    image_url: str | None = None
    origin_country: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    track: str | None = None
    start_year: int | None = None
    end_year: int | None = None


class EntityResponse(EntityBase):
    id: int
    track: str | None = None
    class Config:
        from_attributes = True

class EntityCreate(EntityBase):
    track: str | None = None
    pass

class RelationshipDetailResponse(BaseModel):
    source: str
    relation: str
    target: str

class RelationshipCreate(BaseModel):
    source_entity_id: int
    target_entity_id: int
    relationship_type: str

class RelationshipResponse(RelationshipCreate):
    id: int
    class Config:
        from_attributes = True



class TimelineResponse(BaseModel):
    id: int
    name: str
    entity_type: str
    track: str | None = None
    description: str | None = None
    notable_works: str | None = None
    key_ideas: str | None = None
    legacy: str | None = None
    image_url: str | None = None
    origin_country: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    start_year: int | None = None
    end_year: int | None = None



class StatsResponse(BaseModel):
    total_entities: int
    types: dict[str, int]
