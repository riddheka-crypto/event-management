from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, EmailStr


class Token(BaseModel):
    access_token: str
    token_type: str = 'bearer'


class UserBase(BaseModel):
    name: str
    email: EmailStr


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserCreate(UserBase):
    password: str
    role: Optional[str] = 'user'


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None


class UserOut(UserBase):
    id: int
    role: str

    class Config:
        from_attributes = True


class EventBase(BaseModel):
    title: str
    description: str
    category: str
    location: str
    venue: str
    date: date
    max_participants: int = 200


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    location: Optional[str] = None
    venue: Optional[str] = None
    date: Optional[date] = None
    max_participants: Optional[int] = None
    is_active: Optional[bool] = None


class EventOut(EventBase):
    id: int
    organizer_id: int
    is_active: bool
    created_at: datetime
    registration_count: int = 0
    is_favorite: bool = False

    class Config:
        from_attributes = True


class RegistrationOut(BaseModel):
    id: int
    status: str
    qr_code: Optional[str] = None
    created_at: datetime
    event: EventOut

    class Config:
        from_attributes = True


class ParticipantOut(BaseModel):
    id: int
    status: str
    qr_code: Optional[str] = None
    created_at: datetime
    user: UserOut

    class Config:
        from_attributes = True
