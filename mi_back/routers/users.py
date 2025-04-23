
from fastapi import  APIRouter
from fastapi import  Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import SessionLocal
from passlib.context import CryptContext
from models import User as UserModel # Modelos de SQLAlchemy
from schemas import UserCreate, User as UserSchema,  UserCredentials  # Esquemas Pydantic
from database import get_db

user_router = APIRouter()


# Configuración para el hashing de contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Endpoints para Users
# endpoimt para crear un nuevo usuario
@user_router.post("/users/", response_model=UserSchema, tags=["users"])
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """
    Crea un nuevo usuario con contraseña hasheada
    La contraseña neceista un minimo de 8 caracteres, al menos una letra mayuscula, una minuscula, un numero y un caracter especial
    el ususrio no debe existir en la base de datos y debe tener un minio de 3 caracteres
    """
    db_user = db.query(UserModel).filter(
        UserModel.username == user.username
    ).first()
    
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Username already registered"
        )
    
    hashed_password = pwd_context.hash(user.pass_)
    user_data = user.model_dump()
    user_data["pass_"] = hashed_password
    
    new_user = UserModel(**user_data)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user



@user_router.get("/users/", response_model=List[UserSchema], tags=["users"])
def read_users(db: Session = Depends(get_db)):
    return db.query(UserModel).all()

@user_router.put("/users/{user_id}", response_model=UserSchema, tags=["users"])
def update_user(user_id: int, user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    for key, value in user.model_dump().items():
        setattr(db_user, key, value)
    db.commit()
    db.refresh(db_user)
    return db_user

@user_router.delete("/users/{user_id}", tags=["users"])
def delete_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(db_user)
    db.commit()
    return {"detail": "User deleted"}


# Endpoint para autenticar un usuario
@user_router.post("/user/auth/", response_model=UserSchema, tags=["users"])
def authenticate_user(
    credentials: UserCredentials,
    db: Session = Depends(get_db)
):
    """
    Endpoint POST más seguro para autenticación
    """
    db_user = db.query(UserModel).filter(
        UserModel.username == credentials.username
    ).first()

    if not db_user or not pwd_context.verify(credentials.pass_, db_user.pass_):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Eliminamos la contraseña hasheada de la respuesta por seguridad
    db_user.pass_ = None
    return db_user





