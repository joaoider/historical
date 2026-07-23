from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Entity(Base):
    __tablename__ = "entity"

    __table_args__ = {
    "schema": "history"
                      }

    id = Column(
        Integer,
        primary_key=True,
        index=True)

    name = Column(
        String(200),
        nullable=False)

    entity_type = Column(
        String(50),
        nullable=False)

    track = Column(String, nullable=True)

    description = Column(
        Text)

    start_year = Column(
        Integer)

    end_year = Column(
        Integer)



class Relationship(Base):
    __tablename__ = "relationship"

    __table_args__ = {
        "schema": "history"}

    id = Column(
        Integer,
        primary_key=True,
        index=True)

    source_entity_id = Column(
        Integer,
        ForeignKey("history.entity.id"),
        nullable=False)

    target_entity_id = Column(
        Integer,
        ForeignKey("history.entity.id"),
        nullable=False)

    relationship_type = Column(
        String(100),
        nullable=False)

    source_entity = relationship(
        "Entity",
        foreign_keys=[source_entity_id])

    target_entity = relationship(
        "Entity",
        foreign_keys=[target_entity_id])