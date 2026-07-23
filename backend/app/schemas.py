from pydantic import BaseModel


class EntityBase(BaseModel):

    name: str

    entity_type: str

    description: str | None = None

    start_year: int | None = None

    end_year: int | None = None


class EntityResponse(EntityBase):

    id: int

    class Config:

        from_attributes = True

class EntityCreate(EntityBase):
    pass

class RelationshipDetailResponse(BaseModel):

    source: str

    relation: str

    target: str



class TimelineResponse(BaseModel):

    id: int

    name: str

    entity_type: str

    description: str | None = None

    start_year: int | None = None

    end_year: int | None = None



class StatsResponse(BaseModel):

    total_entities: int

    types: dict[str, int]