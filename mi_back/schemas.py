from pydantic import BaseModel, field_validator
from typing import Optional, List
import re


# Equemas para el usuario
class UserBase(BaseModel):
    username: str
    name: str
    lastname: str

class UserCreate(UserBase):
    pass_: str
    is_admin: bool = False  # Nuevo campo para superusuarios, por defecto False

    @field_validator('username')
    @classmethod
    def validate_username(cls, v: str) -> str:
        if len(v) < 3:
            raise ValueError("Username must be at least 3 characters long")
        if not v.isalnum():
            raise ValueError("Username must be alphanumeric")
        return v

    @field_validator('pass_')
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search("[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search("[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search("[0-9]", v):
            raise ValueError("Password must contain at least one digit")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError("Password must contain at least one special character")
        return v

class UserCredentials(BaseModel):
    username: str
    pass_: str

class User(UserBase):
    id: int
    is_admin: bool  # Nuevo campo para incluir en respuestas

    class Config:
        from_attributes = True

# Equemas para los items

class ItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    img: Optional[str] = None

class ItemCreate(ItemBase):
    pass

class Item(ItemBase):
    id: int

    class Config:
        from_attributes = True

class PaginatedItems(BaseModel):
    items: List[Item]
    total_items: int