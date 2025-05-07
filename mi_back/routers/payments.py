from fastapi import APIRouter, HTTPException, status, Request
from sqlalchemy.orm import Session
from database import get_db
from models import Payment, Cart, CartStatus
from schemas import PaymentCreate, Payment as PaymentSchema
from fastapi import Depends
from datetime import datetime
import stripe, os

payments_router = APIRouter(prefix="/payments", tags=["Payments"])

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

@payments_router.post("/", response_model=PaymentSchema, status_code=status.HTTP_201_CREATED)
def register_payment(payment_data: PaymentCreate, db: Session = Depends(get_db)):
    existing_payment = db.query(Payment).filter_by(stripe_session_id=payment_data.stripe_session_id).first()
    if existing_payment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment with this Stripe session ID already exists.",
        )
    
    payment = Payment(**payment_data.model_dump())
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment

@payments_router.get("/success")
def payment_success(request: Request, db: Session = Depends(get_db)):
    session_id = request.query_params.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="Missing session_id")

    try:
        session = stripe.checkout.Session.retrieve(session_id)
    except stripe.error.InvalidRequestError:
        raise HTTPException(status_code=400, detail="Invalid Stripe session ID")

    cart_id = session.get("client_reference_id")
    if not cart_id:
        raise HTTPException(status_code=400, detail="No cart associated with session")

    cart = db.query(Cart).filter(Cart.id == int(cart_id)).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    if cart.status == CartStatus.completed:
        return {"message": "Payment already processed"}

    payment = Payment(
        stripe_session_id=session.id,
        amount_total=session.amount_total / 100,
        currency=session.currency,
        cart_id=int(cart_id),
        user_id=cart.user_id,
        created_at=datetime.utcnow()
    )
    db.add(payment)

    cart.status = CartStatus.completed
    db.commit()

    return {"message": "Payment successful", "session_id": session.id}

@payments_router.post("/create-checkout-session/{cart_id}")
def create_checkout_session(cart_id: int, db: Session = Depends(get_db)):
    cart = db.query(Cart).filter(Cart.id == cart_id).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    if not cart.items or len(cart.items) == 0:
        raise HTTPException(status_code=400, detail="Cart is empty")

    line_items = []
    for cart_item in cart.items:
        item = cart_item.item
        line_items.append({
            'price_data': {
                'currency': 'usd',
                'product_data': {
                    'name': item.name,
                    'description': item.description,
                },
                'unit_amount': int(item.price * 100),
            },
            'quantity': cart_item.quantity,
        })

    session = stripe.checkout.Session.create(
        payment_method_types=['card'],
        line_items=line_items,
        mode='payment',
        success_url="http://localhost:5173/payment-success?session_id={CHECKOUT_SESSION_ID}",
        cancel_url="http://localhost:5173/payment-cancelled",
        client_reference_id=str(cart_id),
    )

    return {"session_id": session.id}