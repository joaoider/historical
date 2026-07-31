from pydantic import BaseModel


class EntityBase(BaseModel):
    name: str
    entity_type: str
    description: str | None = None
    notable_works: str | None = None
    key_ideas: str | None = None
    legacy: str | None = None
    sources: str | None = None
    image_source: str | None = None
    image_license: str | None = None
    reviewed_at: str | None = None
    certainty_level: str | None = "confirmado"
    editorial_status: str | None = "rascunho"
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
    id: int
    source_id: int
    source: str
    relation: str
    target: str
    target_id: int
    notes: str | None = None
    source_reference: str | None = None

class RelationshipCreate(BaseModel):
    source_entity_id: int
    target_entity_id: int
    relationship_type: str
    notes: str | None = None
    source_reference: str | None = None

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
    sources: str | None = None
    image_source: str | None = None
    image_license: str | None = None
    reviewed_at: str | None = None
    certainty_level: str | None = None
    editorial_status: str | None = None
    image_url: str | None = None
    origin_country: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    start_year: int | None = None
    end_year: int | None = None



class StatsResponse(BaseModel):
    total_entities: int
    types: dict[str, int]
