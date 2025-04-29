from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Cart as CartModel, CartItem as CartItemModel, User
from schemas import Cart as CartSchema, CartItem as CartItemSchema, CartItemCreate
import jwt
from database import get_db
import base64

carts_router = APIRouter(prefix="/carts", tags=["carts"])

# Clave secreta para JWT (misma que en users.py)
SECRET_KEY = "mi_clave_secreta_123"
ALGORITHM = "HS256"

# Dependencia para obtener el usuario autenticado
async def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token no proporcionado")
    
    try:
        # Suponemos que el token viene como "Bearer <token>"
        token = authorization.replace("Bearer ", "")
        # Decodificar el token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token inválido")
        
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="Usuario no encontrado")
        return user
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

# Obtener el carrito activo del usuario
@carts_router.get("/me", response_model=CartSchema)
def get_cart(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cart = db.query(CartModel).filter(CartModel.user_id == current_user.id, CartModel.status == "active").first()
    if not cart:
        cart = CartModel(user_id=current_user.id, status="active")
        db.add(cart)
        db.commit()
        db.refresh(cart)
    
    # Asegurarse de que las imágenes sean strings válidos
    for cart_item in cart.items:
        if cart_item.item.img and isinstance(cart_item.item.img, bytes):
            cart_item.item.img = base64.b64encode(cart_item.item.img).decode('utf-8')
        else:
            cart_item.item.img = ""  # Asegúrate de asignar un string vacío si no hay imagen
    
    return cart

# Añadir un item al carrito
@carts_router.post("/me/items", response_model=CartItemSchema)
def add_item_to_cart(
    item: CartItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cart = db.query(CartModel).filter(CartModel.user_id == current_user.id, CartModel.status == "active").first()
    if not cart:
        cart = CartModel(user_id=current_user.id, status="active")
        db.add(cart)
        db.commit()
        db.refresh(cart)
    
    # Verificar si el item ya está en el carrito
    existing_item = db.query(CartItemModel).filter(
        CartItemModel.cart_id == cart.id, CartItemModel.item_id == item.item_id
    ).first()
    if existing_item:
        existing_item.quantity += item.quantity
        db.commit()
        db.refresh(existing_item)

        if existing_item.item.img and isinstance(existing_item.item.img, bytes):
            existing_item.item.img = base64.b64encode(existing_item.item.img).decode('utf-8')
        else:
            existing_item.item.img = ""  # Asignar string vacío si no hay imagen

        return existing_item
    
    # Crear nuevo item en el carrito
    cart_item = CartItemModel(cart_id=cart.id, item_id=item.item_id, quantity=item.quantity)
    db.add(cart_item)
    db.commit()
    db.refresh(cart_item)

    if cart_item.item.img and isinstance(cart_item.item.img, bytes):
        cart_item.item.img = base64.b64encode(cart_item.item.img).decode('utf-8')
    else:
        cart_item.item.img = ""  # Asignar string vacío si no hay imagen

    return cart_item

# Eliminar un item del carrito
@carts_router.delete("/me/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_item_from_cart(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cart = db.query(CartModel).filter(CartModel.user_id == current_user.id, CartModel.status == "active").first()
    if not cart:
        raise HTTPException(status_code=404, detail="Carrito no encontrado")
    
    cart_item = db.query(CartItemModel).filter(
        CartItemModel.cart_id == cart.id, CartItemModel.item_id == item_id
    ).first()
    if not cart_item:
        raise HTTPException(status_code=404, detail="Item no encontrado en el carrito")
    
    db.delete(cart_item)
    db.commit()
    return None
