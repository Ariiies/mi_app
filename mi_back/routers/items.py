from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, status
from sqlalchemy.orm import Session
from typing import Optional
import base64
from database import get_db
from models import Item as ItemModel, User as UserModel
from schemas import Item as ItemSchema, PaginatedItems

items_router = APIRouter()

# Dependencia para verificar admin
def get_current_admin(user_id: int = Depends(lambda x: int(x.headers.get('user-id', '0'))), db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user or not user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return user

# Crear un ítem
@items_router.post("/items/", response_model=ItemSchema, tags=["items"])
async def create_item(
    name: str,
    description: Optional[str] = None,
    price: float = 0.0,
    img: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_admin: UserModel = Depends(get_current_admin)
):
    item_data = {"name": name, "description": description, "price": price}
    if img:
        item_data["img"] = await img.read()
    
    new_item = ItemModel(**item_data)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    
    if new_item.img:
        new_item.img = base64.b64encode(new_item.img).decode("utf-8")
    return new_item

# Obtener un ítem por ID
@items_router.get("/items/{item_id}", response_model=ItemSchema, tags=["items"])
def get_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(ItemModel).filter(ItemModel.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if item.img:
        item.img = base64.b64encode(item.img).decode("utf-8")
    return item

# Listar ítems (paginado)
@items_router.get("/items/", response_model=PaginatedItems, tags=["items"])
def read_items(db: Session = Depends(get_db), limit: int = 8, offset: int = 0):
    total_items = db.query(ItemModel).count()
    items = db.query(ItemModel).offset(offset).limit(limit).all()
    for item in items:
        if item.img:
            item.img = base64.b64encode(item.img).decode("utf-8")
    return {"items": items, "total_items": total_items}

# Actualizar un ítem
@items_router.put("/items/{item_id}", response_model=ItemSchema, tags=["items"])
async def update_item(
    item_id: int,
    name: str,
    description: Optional[str] = None,
    price: float = 0.0,
    img: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_admin: UserModel = Depends(get_current_admin)
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
    if db_item.img:
        db_item.img = base64.b64encode(db_item.img).decode("utf-8")
    return db_item

# Borrar un ítem
@items_router.delete("/items/{item_id}", tags=["items"])
def delete_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_admin: UserModel = Depends(get_current_admin)
):
    db_item = db.query(ItemModel).filter(ItemModel.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(db_item)
    db.commit()
    return {"detail": "Item deleted"}