from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.auth import router as auth_router
from app.routes.events import router as events_router
from app.routes.dashboard import router as dashboard_router

app = FastAPI(title='DOMinators API', version='1.0.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(auth_router, prefix='/api/auth', tags=['auth'])
app.include_router(events_router, prefix='/api/events', tags=['events'])
app.include_router(dashboard_router, prefix='/api/dashboard', tags=['dashboard'])

@app.get('/health')
def health_check():
    return {'status': 'ok'}


@app.on_event('startup')
def create_tables_on_startup():
    try:
        from app.database import engine, Base
        from sqlalchemy import text

        Base.metadata.create_all(bind=engine)
        if engine.url.get_backend_name() == 'postgresql':
            with engine.begin() as connection:
                connection.execute(text('ALTER TABLE registrations ALTER COLUMN qr_code TYPE TEXT'))
    except Exception:
        # In case migrations or DB are managed externally, don't crash startup
        pass
