from fastapi import APIRouter, Depends, HTTPException, status, Request, Header, Body
from sqlalchemy.orm import Session
from typing import List
from database import SessionLocal
from passlib.context import CryptContext
from models import User as UserModel
from schemas import UserCreate, User as UserSchema, UserCredentials, UserUpdate
from database import get_db

user_router = APIRouter()

# Configuración para el hashing de contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Endpoints para Users
# Endpoint para crear un nuevo usuario
@user_router.post("/users/", response_model=UserSchema, tags=["users"])
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """
    Crea un nuevo usuario con contraseña hasheada
    La contraseña necesita un minimo de 8 caracteres, al menos una letra mayuscula, una minuscula, un numero y un caracter especial
    el usuario no debe existir en la base de datos y debe tener un minimo de 3 caracteres
    """
    db_user = db.query(UserModel).filter(UserModel.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
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


# endoint para actualizar un usuario por ID
@user_router.put("/users/{user_id}", response_model=UserSchema, tags=["users"])
def update_user(
    user_id: int,
    user: UserUpdate = Body(..., example={
        "username": "nuevo_usuario",
        "name": "Nuevo",
        "lastname": "Usuario",
        "pass_": "nuevacontraseña"
    }),
    user_id_header: int = Header(..., 
                               alias="user-id", 
                               description="ID del usuario autenticado (debe coincidir con user_id)",
                               example=123),
    db: Session = Depends(get_db),
):
    """
    Actualiza un usuario existente, hasheando la contraseña si se proporciona.
    
    Requiere:
    - Header 'user-id' con el ID del usuario autenticado
    - El user-id del header debe coincidir con el user_id del path
    
    Campos opcionales:
    - username (debe ser único)
    - name
    - lastname
    - pass_ (se hasheará automáticamente)
    """
    # Verificar que el usuario está actualizando su propio perfil
    if user_id_header != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No autorizado para actualizar este usuario"
        )

    # Obtener el usuario de la base de datos
    db_user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    # Validar unicidad del username si se proporciona
    if user.username and user.username != db_user.username:
        existing_user = db.query(UserModel).filter(
            UserModel.username == user.username
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El nombre de usuario ya está registrado"
            )
        db_user.username = user.username

    # Actualizar campos proporcionados
    if user.name is not None:
        db_user.name = user.name
    if user.lastname is not None:
        db_user.lastname = user.lastname
    if user.pass_:
        db_user.pass_hash = pwd_context.hash(user.pass_)

    db.commit()
    db.refresh(db_user)
    return db_user

# endopoint para eliminar un usuario
@user_router.delete("/users/{user_id}", tags=["users"])
def delete_user(user_id: int, db: Session = Depends(get_db)):
    """
    Elimina un usuario existente
    """
    db_user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(db_user)
    db.commit()
    return {"detail": "User deleted"}

# Endpoint para autenticar un usuario
@user_router.post("/user/auth/", response_model=UserSchema, tags=["users"])
def authenticate_user(credentials: UserCredentials, db: Session = Depends(get_db)):
    """
    Endpoint POST más seguro para autenticación
    """
    db_user = db.query(UserModel).filter(UserModel.username == credentials.username).first()
    if not db_user or not pwd_context.verify(credentials.pass_, db_user.pass_):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Eliminamos la contraseña hasheada de la respuesta por seguridad
    db_user.pass_ = None
    return db_user