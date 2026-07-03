from collections import defaultdict
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.auth_utils import get_current_active_user
from app.database import get_db
from app.models import Event, Registration

router = APIRouter()


def _month_labels(span: int = 6) -> list[str]:
    today = date.today()
    labels = []
    for offset in range(span - 1, -1, -1):
        month = today.month - offset
        year = today.year
        while month <= 0:
            month += 12
            year -= 1
        labels.append(date(year, month, 1).strftime('%b'))
    return labels


@router.get('/analytics')
def analytics(current_user=Depends(get_current_active_user), db: Session = Depends(get_db)):
    if current_user.role != 'organizer':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Organizer access required')

    event_query = db.query(Event).filter(Event.organizer_id == current_user.id, Event.is_active.is_(True))
    event_ids = [event.id for event in event_query.all()]

    total_events = len(event_ids)
    upcoming_events = event_query.filter(Event.date >= date.today()).count()
    completed_events = event_query.filter(Event.date < date.today()).count()
    total_registrations = db.query(func.count(Registration.id)).filter(Registration.event_id.in_(event_ids)).scalar() or 0
    today_registrations = (
        db.query(func.count(Registration.id))
        .filter(Registration.event_id.in_(event_ids))
        .filter(func.date(Registration.created_at) == date.today())
        .scalar()
        or 0
    )
    month_labels = _month_labels()
    registration_rows = db.query(Registration.created_at).filter(Registration.event_id.in_(event_ids)).all()
    counts = defaultdict(int)
    for row in registration_rows:
        created_at = row[0]
        if created_at:
            month_label = created_at.strftime('%b')
            counts[month_label] += 1
    monthly_registration_trend = [counts[label] for label in month_labels]
    category_rows = db.query(Event.category, func.count(Event.id)).filter(Event.id.in_(event_ids)).group_by(Event.category).all()
    popular_row = (
        db.query(Event.title, func.count(Registration.id).label('registrations'))
        .outerjoin(Registration)
        .filter(Event.id.in_(event_ids))
        .group_by(Event.id)
        .order_by(func.count(Registration.id).desc())
        .first()
    )
    return {
        'total_events': total_events,
        'upcoming_events': upcoming_events,
        'completed_events': completed_events,
        'total_registrations': total_registrations,
        'today_registrations': today_registrations,
        'month_labels': month_labels,
        'monthly_registration_trend': monthly_registration_trend,
        'event_mix': [{'name': category, 'value': count} for category, count in category_rows],
        'popular_event': popular_row[0] if popular_row else None,
    }
