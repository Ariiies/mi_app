from sqlalchemy import Column, Integer, String, LargeBinary, Text, Float, Boolean
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    name = Column(String)
    lastname = Column(String)
    pass_ = Column(String)
    is_admin = Column(Boolean, default=False)  # Campo para superusuarios

    
class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text, nullable=True)
    img = Column(LargeBinary, nullable=True)
    price = Column(Float)