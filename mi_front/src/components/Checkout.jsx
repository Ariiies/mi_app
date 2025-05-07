import { useEffect, useState } from 'react';
import useCart from '../hooks/useCart';
import useAuth from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import '../styles/Checkout.css';

function Checkout() {
  const { cart } = useCart();
  const { user } = useAuth();
  const [totalPrice, setTotalPrice] = useState(0);
  const [stripePublicKey, setStripePublicKey] = useState("");

  useEffect(() => {
    // Obtener la clave pública de Stripe desde el backend
    const fetchPublicKey = async () => {
      try {
        const response = await fetch('http://localhost:8000/get-public-key');
        const data = await response.json();
        if (data.key) {
          setStripePublicKey(data.key);  // Guardamos la clave pública
        } else {
          console.error('Error al obtener la clave pública de Stripe');
        }
      } catch (error) {
        console.error('Error al obtener la clave pública:', error);
      }
    };
    fetchPublicKey();
  }, []);

  useEffect(() => {
    if (cart && cart.items) {
      const total = cart.items.reduce((sum, item) => {
        return sum + item.quantity * item.item.price;
      }, 0);
      setTotalPrice(total);
    }
  }, [cart]);

  // Manejador de checkout
  const handleCheckout = async () => {
    if (!stripePublicKey) {
      console.error('Clave pública de Stripe no disponible');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/payments/create-checkout-session/${cart.id}`, {
        method: 'POST',
      });
      const data = await response.json();
      const stripeSessionId = data.session_id;

      const stripe = window.Stripe(stripePublicKey); // Usamos la clave pública que obtuvimos
      const { error } = await stripe.redirectToCheckout({ sessionId: stripeSessionId });

      if (error) {
        console.error(error);
        alert('Ocurrió un error, intentalo nuevamente.');
      }
    } catch (error) {
      console.error('Error en el checkout:', error);
      alert('Ocurrió un error, intentalo nuevamente.');
    }
  };

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
      <button className="checkout-button" onClick={handleCheckout} disabled={!stripePublicKey}>
        Proceder al Pago
      </button>
      <Link to="/cart" className="back-to-cart">← Volver al carrito</Link>
    </div>
  );
}

export default Checkout;

