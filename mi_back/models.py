from sqlalchemy import Column, Integer, String, Float, LargeBinary, Text, Boolean
from database import Base



class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(255), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    lastname = Column(String(255), nullable=False)
    pass_ = Column(Text, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)

class Item(Base):
    __tablename__ = "items"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    img = Column(LargeBinary)

