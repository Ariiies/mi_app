from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from database import Base
import enum
from datetime import datetime
import base64

# Enum para estados del carrito
class CartStatus(str, enum.Enum):
    active = "active"
    completed = "completed"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(255), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    lastname = Column(String(255), nullable=False)
    pass_ = Column(Text, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)

    carts = relationship("Cart", back_populates="user")

class Item(Base):
    __tablename__ = "items"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    img = Column(String(255))  # Ajustado a VARCHAR(255) para coincidir con la base de datos

    cart_items = relationship("CartItem", back_populates="item")

    def as_dict(self):
        result = {c.name: getattr(self, c.name) for c in self.__table__.columns}
        if self.img and isinstance(self.img, bytes):
            result['img'] = base64.b64encode(self.img).decode('utf-8')
        return result

class Cart(Base):
    __tablename__ = "carts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(Enum(CartStatus), default=CartStatus.active, nullable=False)
    
    user = relationship("User", back_populates="carts")
    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")

class CartItem(Base):
    __tablename__ = "cart_items"
    id = Column(Integer, primary_key=True, index=True)
    cart_id = Column(Integer, ForeignKey("carts.id", ondelete="CASCADE"), nullable=False)
    item_id = Column(Integer, ForeignKey("items.id", ondelete="RESTRICT"), nullable=False)
    quantity = Column(Integer, nullable=False)
    added_at = Column(DateTime, default=datetime.utcnow)
    
    cart = relationship("Cart", back_populates="items")
    item = relationship("Item", back_populates="cart_items")