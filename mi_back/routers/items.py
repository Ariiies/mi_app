from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from typing import List, Optional
import base64
from database import SessionLocal, engine, Base
from models import  Item as ItemModel  # Modelos de SQLAlchemy
from schemas import ItemCreate, Item as ItemSchema, PaginatedItems  # Esquemas Pydantic
from database import get_db

items_router = APIRouter()



# Endpoints para Items
@items_router.post("/items/", response_model=ItemSchema, tags=["items"])
async def create_item(
    name: str,
    description: Optional[str] = None,
    price: float = 0.0,
    img: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    item_data = {"name": name, "description": description, "price": price}
    
    if img:
        # Guardar los bytes directamente (opción recomendada para almacenamiento)
        image_bytes = await img.read()
        item_data["img"] = image_bytes
        
        # O convertir a base64 si necesitas enviarlo en la respuesta
        # item_data["img"] = base64.b64encode(image_bytes).decode('utf-8')
    
    new_item = ItemModel(**item_data)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    
    # Para la respuesta, no incluyas la imagen o usa base64
    response_data = {
        "id": new_item.id,
        "name": new_item.name,
        "description": new_item.description,
        "price": new_item.price,
        # "img": base64.b64encode(new_item.img).decode('utf-8') if new_item.img else None
    }
    
    return response_data


# endpoint para obtener un solo item dependiedo del id
@items_router.get("/items/{item_id}", response_model=ItemSchema, tags=["items"])
def get_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(ItemModel).filter(ItemModel.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if item.img:
        item.img = base64.b64encode(item.img).decode("utf-8")
    return item


"""
@items_router.get("/items/", response_model=List[ItemSchema], tags=["items"])
def read_items(db: Session = Depends(get_db)):
    items = db.query(ItemModel).all()
    for item in items:
        if item.img:
            item.img = base64.b64encode(item.img).decode("utf-8")
    return items"""


@items_router.get("/items/", response_model=PaginatedItems, tags=["items"])
def read_items(db: Session = Depends(get_db), limit: int = 8, offset: int = 0):
    # Obtener el número total de items
    total_items = db.query(ItemModel).count()
    # Obtener los items paginados
    items = db.query(ItemModel).offset(offset).limit(limit).all()
    # Convertir imágenes a base64
    for item in items:
        if item.img:
            item.img = base64.b64encode(item.img).decode("utf-8")
    return {"items": items, "total_items": total_items}



# endoint para actualizar un item dependiendo del id
@items_router.put("/items/{item_id}", response_model=ItemSchema, tags=["items"])
async def update_item(
    item_id: int,
    name: str,
    description: Optional[str] = None,
    price: float = 0.0,
    img: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    db_item = db.query(ItemModel).filter(ItemModel.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    db_item.name = name
    db_item.description = description
    db_item.price = price
    if img:
        db_item.img = await img.read()
    db.commit()
    db.refresh(db_item)
    return db_item

# endpoint para eliminar un item dependiendo del id
@items_router.delete("/items/{item_id}", tags=["items"])
def delete_item(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(ItemModel).filter(ItemModel.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(db_item)
    db.commit()
    return {"detail": "Item deleted"}