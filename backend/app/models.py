from sqlalchemy import Boolean, Column, Date, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default='user')
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    events = relationship('Event', back_populates='organizer')
    registrations = relationship('Registration', back_populates='user')
    favorites = relationship('Favorite', back_populates='user')


class Event(Base):
    __tablename__ = 'events'

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), nullable=False)
    location = Column(String(100), nullable=False)
    venue = Column(String(200), nullable=False)
    date = Column(Date, nullable=False)
    organizer_id = Column(Integer, ForeignKey('users.id'))
    max_participants = Column(Integer, default=200)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    organizer = relationship('User', back_populates='events')
    registrations = relationship('Registration', back_populates='event')
    favorites = relationship('Favorite', back_populates='event')


class Registration(Base):
    __tablename__ = 'registrations'
    __table_args__ = (UniqueConstraint('user_id', 'event_id', name='uq_registration_user_event'),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    event_id = Column(Integer, ForeignKey('events.id'))
    status = Column(String(20), default='confirmed')
    qr_code = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship('User', back_populates='registrations')
    event = relationship('Event', back_populates='registrations')


class Favorite(Base):
    __tablename__ = 'favorites'
    __table_args__ = (UniqueConstraint('user_id', 'event_id', name='uq_favorite_user_event'),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    event_id = Column(Integer, ForeignKey('events.id'))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship('User', back_populates='favorites')
    event = relationship('Event', back_populates='favorites')
