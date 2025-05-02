import { useEffect, useState } from 'react';
import useCart from '../hooks/useCart';
import useAuth from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import '../styles/Checkout.css';

function Checkout() {
  const { cart } = useCart();
  const { user } = useAuth();
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    if (cart && cart.items) {
      const total = cart.items.reduce((sum, item) => {
        return sum + item.quantity * item.item.price;
      }, 0);
      setTotalPrice(total);
    }
  }, [cart]);

  if (!user) {
    return (
      <div className="checkout">
        <h2>Checkout</h2>
        <p>Por favor, inicia sesión para continuar con el pago.</p>
        <Link to="/login">Iniciar sesión</Link>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="checkout">
        <h2>Checkout</h2>
        <p>Tu carrito está vacío.</p>
        <Link to="/catalog">Volver al catálogo</Link>
      </div>
    );
  }

  return (
    <div className="checkout">
      <h2>Resumen del pedido</h2>
      <ul className="checkout-items">
        {cart.items.map((item) => (
          <li key={item.item_id} className="checkout-item">
            <span>{item.item.name} × {item.quantity}</span>
            <span>${item.item.price * item.quantity}</span>
          </li>
        ))}
      </ul>
      <div className="checkout-total">
        <strong>Total:</strong> ${totalPrice.toFixed(2)}
      </div>
      <button className="checkout-button" disabled>
        Proceder al Pago (proximamente)
      </button>
      <Link to="/cart" className="back-to-cart">← Volver al carrito</Link>
    </div>
  );
}

export default Checkout;
