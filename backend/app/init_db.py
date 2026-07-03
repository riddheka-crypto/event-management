"""Utility to create database tables for development.

Run from the `backend` folder with the project's venv activated, or use the venv python directly:

  .\.venv\Scripts\python.exe -m app.init_db

This is safe for development; for production use migrations (Alembic).
"""
from app.database import engine, Base


def main() -> None:
    print('Creating database tables...')
    Base.metadata.create_all(bind=engine)
    print('Done.')


if __name__ == '__main__':
    main()
