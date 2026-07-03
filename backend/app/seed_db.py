"""Seed minimal data for development/QA.

Usage (from backend folder with venv):
  .\.venv\Scripts\python.exe -m app.seed_db
"""
from app.auth_utils import get_password_hash
from app.database import SessionLocal, engine, Base
from app.models import User


def main():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        organizer = db.query(User).filter(User.email == 'org@example.com').first()
        if not organizer:
            organizer = User(
                name='Seed Organizer',
                email='org@example.com',
                hashed_password=get_password_hash('organizerpass'),
                role='organizer',
            )
            db.add(organizer)
            db.commit()
            db.refresh(organizer)
            print('Seeded organizer user with id', organizer.id)
        else:
            print('Organizer already exists with id', organizer.id)
        print('Create events from the organizer dashboard or API.')
    finally:
        db.close()


if __name__ == '__main__':
    main()
