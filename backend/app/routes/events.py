import base64
import io
import json
from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException, status
import qrcode
import qrcode.image.svg
from sqlalchemy.orm import Session
from app.auth_utils import get_current_active_user
from app.database import get_db
from app.models import Event, Favorite, Registration, User
from app.schemas import EventCreate, EventOut, EventUpdate, ParticipantOut, RegistrationOut

router = APIRouter()


def _event_out(event: Event, current_user: User | None = None) -> EventOut:
    return EventOut(
        id=event.id,
        title=event.title,
        description=event.description,
        category=event.category,
        location=event.location,
        venue=event.venue,
        date=event.date,
        max_participants=event.max_participants,
        organizer_id=event.organizer_id,
        is_active=event.is_active,
        created_at=event.created_at,
        registration_count=len(event.registrations),
        is_favorite=bool(current_user and any(f.user_id == current_user.id for f in event.favorites)),
    )


def _organizer_required(current_user: User):
    if current_user.role != 'organizer':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Organizer access required')


def _owned_event(event_id: int, current_user: User, db: Session) -> Event:
    _organizer_required(current_user)
    event = db.query(Event).filter(Event.id == event_id, Event.organizer_id == current_user.id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Event not found')
    return event


def _qr_svg_data_uri(ticket_payload: dict) -> str:
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )
    qr.add_data(json.dumps(ticket_payload, separators=(',', ':'), default=str))
    qr.make(fit=True)
    image = qr.make_image(image_factory=qrcode.image.svg.SvgPathImage)
    buffer = io.BytesIO()
    image.save(buffer)
    return 'data:image/svg+xml;base64,' + base64.b64encode(buffer.getvalue()).decode()


def _ticket_payload(registration: Registration) -> dict:
    return {
        'ticket': f'DOM-{registration.id}',
        'registration_id': registration.id,
        'event_id': registration.event.id,
        'event_title': registration.event.title,
        'event_date': registration.event.date.isoformat(),
        'attendee_id': registration.user.id,
        'attendee_name': registration.user.name,
        'attendee_email': registration.user.email,
        'issued_at': registration.created_at.isoformat() if registration.created_at else datetime.now().isoformat(timespec='seconds'),
    }


def _is_legacy_qr(qr_code: str | None) -> bool:
    if not qr_code:
        return True
    if not qr_code.startswith('data:image/svg+xml;base64,'):
        return True
    try:
        svg = base64.b64decode(qr_code.split(',', 1)[1]).decode('utf-8', 'ignore')
    except Exception:
        return True
    return 'viewBox="0 0 21 21"' in svg


def _ensure_real_qr(registration: Registration, db: Session) -> Registration:
    if _is_legacy_qr(registration.qr_code):
        registration.qr_code = _qr_svg_data_uri(_ticket_payload(registration))
        db.commit()
        db.refresh(registration)
    return registration


@router.get('/', response_model=list[EventOut])
def list_events(db: Session = Depends(get_db)):
    return [_event_out(event) for event in db.query(Event).filter(Event.is_active.is_(True)).order_by(Event.date).all()]


@router.get('/my/registrations', response_model=list[RegistrationOut])
def my_registrations(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    rows = db.query(Registration).filter(Registration.user_id == current_user.id).order_by(Registration.created_at.desc()).all()
    return [
        RegistrationOut(
            id=row.id,
            status=row.status,
            qr_code=row.qr_code,
            created_at=row.created_at,
            event=_event_out(row.event, current_user),
        )
        for row in [_ensure_real_qr(row, db) for row in rows]
    ]


@router.get('/my', response_model=list[EventOut])
def my_events(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    events = (
        db.query(Event)
        .join(Registration)
        .filter(Registration.user_id == current_user.id)
        .distinct()
        .order_by(Event.date)
        .all()
    )
    return [_event_out(event, current_user) for event in events]


@router.get('/favorites', response_model=list[EventOut])
def favorite_events(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    rows = db.query(Favorite).filter(Favorite.user_id == current_user.id).order_by(Favorite.created_at.desc()).all()
    return [_event_out(row.event, current_user) for row in rows if row.event and row.event.is_active]


@router.get('/organizer', response_model=list[EventOut])
def organizer_events(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    _organizer_required(current_user)
    return [_event_out(event, current_user) for event in db.query(Event).filter(Event.organizer_id == current_user.id).order_by(Event.date).all()]


@router.post('/', response_model=EventOut)
def create_event(event: EventCreate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    _organizer_required(current_user)
    db_event = Event(**event.model_dump(), organizer_id=current_user.id)
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return _event_out(db_event, current_user)


@router.get('/{event_id}', response_model=EventOut)
def get_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id, Event.is_active.is_(True)).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Event not found')
    return _event_out(event)


@router.patch('/{event_id}', response_model=EventOut)
def update_event(event_id: int, event_update: EventUpdate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    event = _owned_event(event_id, current_user, db)
    for key, value in event_update.model_dump(exclude_unset=True).items():
        setattr(event, key, value)
    db.commit()
    db.refresh(event)
    return _event_out(event, current_user)


@router.delete('/{event_id}')
def delete_event(event_id: int, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    event = _owned_event(event_id, current_user, db)
    event.is_active = False
    db.commit()
    return {'message': 'Event deleted successfully'}


@router.post('/{event_id}/register')
def register_for_event(event_id: int, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id, Event.is_active.is_(True)).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Event not found')
    if event.date < date.today():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='This event has already started')
    existing = db.query(Registration).filter(Registration.event_id == event.id, Registration.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Already registered')
    confirmed_count = db.query(Registration).filter(Registration.event_id == event.id, Registration.status == 'confirmed').count()
    if confirmed_count >= event.max_participants:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Event capacity reached')
    registration = Registration(
        event_id=event.id,
        user_id=current_user.id,
        status='confirmed',
    )
    db.add(registration)
    db.commit()
    db.refresh(registration)
    registration.qr_code = _qr_svg_data_uri(_ticket_payload(registration))
    db.commit()
    db.refresh(registration)
    return {
        'message': 'Registered successfully',
        'registration_id': registration.id,
        'qr_code': registration.qr_code,
    }


@router.post('/{event_id}/favorite')
def add_favorite(event_id: int, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id, Event.is_active.is_(True)).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Event not found')
    existing = db.query(Favorite).filter(Favorite.event_id == event_id, Favorite.user_id == current_user.id).first()
    if not existing:
        db.add(Favorite(event_id=event_id, user_id=current_user.id))
        db.commit()
    return {'message': 'Favorite saved'}


@router.delete('/{event_id}/favorite')
def remove_favorite(event_id: int, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    favorite = db.query(Favorite).filter(Favorite.event_id == event_id, Favorite.user_id == current_user.id).first()
    if favorite:
        db.delete(favorite)
        db.commit()
    return {'message': 'Favorite removed'}


@router.get('/{event_id}/participants', response_model=list[ParticipantOut])
def event_participants(event_id: int, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    _owned_event(event_id, current_user, db)
    rows = db.query(Registration).filter(Registration.event_id == event_id).order_by(Registration.created_at.desc()).all()
    return [_ensure_real_qr(row, db) for row in rows]


@router.patch('/{event_id}/participants/{registration_id}', response_model=ParticipantOut)
def update_participant(event_id: int, registration_id: int, payload: dict, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    _owned_event(event_id, current_user, db)
    registration = db.query(Registration).filter(Registration.id == registration_id, Registration.event_id == event_id).first()
    if not registration:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Registration not found')
    status_value = payload.get('status')
    if status_value not in {'confirmed', 'pending', 'cancelled'}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Invalid participant status')
    registration.status = status_value
    db.commit()
    db.refresh(registration)
    return registration


@router.delete('/{event_id}/participants/{registration_id}')
def delete_participant(event_id: int, registration_id: int, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    _owned_event(event_id, current_user, db)
    registration = db.query(Registration).filter(Registration.id == registration_id, Registration.event_id == event_id).first()
    if not registration:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Registration not found')
    db.delete(registration)
    db.commit()
    return {'message': 'Participant removed'}
