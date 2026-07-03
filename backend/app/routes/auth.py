from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.auth_utils import create_access_token, get_current_active_user, get_password_hash, verify_password
from app.database import get_db
from app.models import User
from app.schemas import Token, UserCreate, UserLogin, UserOut, UserUpdate

router = APIRouter()


@router.post('/register', response_model=UserOut)
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail='Email already registered')
    db_user = User(name=user.name, email=user.email, hashed_password=get_password_hash(user.password), role=user.role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.post('/login', response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid credentials')
    token = create_access_token({'sub': user.email, 'role': user.role})
    return {'access_token': token, 'token_type': 'bearer'}


@router.get('/me', response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_active_user)):
    return current_user


@router.patch('/me', response_model=UserOut)
def update_current_user(user_update: UserUpdate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    if user_update.email and user_update.email != current_user.email:
        existing = db.query(User).filter(User.email == user_update.email).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Email already registered')
        current_user.email = user_update.email
    if user_update.name:
        current_user.name = user_update.name
    if user_update.password:
        current_user.hashed_password = get_password_hash(user_update.password)
    db.commit()
    db.refresh(current_user)
    return current_user
