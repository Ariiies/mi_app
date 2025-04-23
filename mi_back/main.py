from fastapi import FastAPI, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from typing import List, Optional
import base64
from database import SessionLocal, engine, Base
from models import User as UserModel, Item as ItemModel  # Modelos de SQLAlchemy
from schemas import UserCreate, User as UserSchema, ItemCreate, Item as ItemSchema  # Esquemas Pydantic
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from routers.users import user_router as ur
from routers.items import items_router as ir



app = FastAPI()
app.title = "mi_app"
app.version = "v.0.0.1"
app.include_router(router=ur)
app.include_router(router=ir)
# Configura CORS para permitir tu frontend (React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # URL de tu frontend (React con Vite)
    allow_methods=["*"],  # Permite todos los métodos (GET, POST, etc.)
    allow_headers=["*"],  # Permite todos los headers
    allow_credentials=True,  # Permite credenciales (cookies, autenticación, etc.)
)

# Get method is used to geta data  from the server
@app.get("/", tags=["main"], status_code=200, response_description="Everything okay")
async def root():
    return {"message": "Hello World"}

# Ejemplo de ruta para obtener items
@app.get("/api/items", tags=["items"], response_model=List[ItemSchema])
def read_items():
    return [{"id": 1, "name": "Item 1", "description":"item description....", "img":"IMAGEN", "price":1999.99}]  # Datos de ejemplo



# to run the app in the server uvicorn by the port 8000 and reloaded
if __name__ == "__main__":
    uvicorn.run("main:app",port=8000, reload=True)