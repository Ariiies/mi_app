from fastapi import Path, Query, APIRouter
from fastapi import FastAPI, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from typing import List, Optional
import base64
from database import SessionLocal, engine, Base
from models import User as UserModel, Item as ItemModel  # Modelos de SQLAlchemy
from schemas import UserCreate, User as UserSchema, ItemCreate, Item as ItemSchema  # Esquemas Pydantic
from typing import List, Optional