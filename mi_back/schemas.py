from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime
from enum import Enum
import re

# Enum para estados del carrito
class CartStatus(str, Enum):
    active = "active"
    completed = "completed"

# Esquemas para el usuario
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

class UserUpdate(BaseModel):
    username: Optional[str] = None
    name: Optional[str] = None
    lastname: Optional[str] = None
    pass_: Optional[str] = None

    # Validación opcional para pass_ solo si se proporciona
    @field_validator('pass_')
    @classmethod
    def validate_password_optional(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
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

class User(UserBase):
    id: int
    is_admin: bool  # Nuevo campo para incluir en respuestas

    class Config:
        from_attributes = True

# Esquemas para los items
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

# Esquemas para el carrito
class CartBase(BaseModel):
    status: CartStatus = CartStatus.active

class CartCreate(CartBase):
    pass

class Cart(CartBase):
    id: int
    user_id: int
    created_at: datetime
    items: List["CartItem"] = []

    class Config:
        from_attributes = True

# Esquemas para los ítems del carrito
class CartItemBase(BaseModel):
    item_id: int
    quantity: int

    @field_validator('quantity')
    @classmethod
    def validate_quantity(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("Quantity must be greater than 0")
        return v

class CartItemCreate(CartItemBase):
    pass

class CartItem(CartItemBase):
    id: int
    cart_id: int
    added_at: datetime
    item: Item

    class Config:
        from_attributes = True