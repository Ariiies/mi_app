import useCart from '../hooks/useCart';
import useAuth from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import '../styles/Cart.css';

function Cart() {
  const { cart, removeFromCart, error } = useCart();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="cart">
        <h2>Carrito</h2>
        <p>El carrito está vacío. Por favor, inicia sesión para ver tu carrito.</p>
        <Link to="/login">Iniciar sesión</Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart">
        <h2>Carrito</h2>
        <p>{error}</p>
        <Link to="/catalog">Volver al catálogo</Link>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="cart">
        <h2>Carrito</h2>
        <p>El carrito está vacío.</p>
        <Link to="/catalog">Volver al catálogo</Link>
      </div>
    );
  }

  return (
    <div className="cart">
      <h2>Carrito</h2>
      <ul className="cart-items">
        {cart.items.map((cartItem) => (
          <li key={cartItem.item_id} className="cart-item">
            <img
              src={`data:image/jpeg;base64,${cartItem.item.img}`}
              alt={cartItem.item.name}
              className="cart-item-image"
            />
            <div className="cart-item-details">
              <h3>{cartItem.item.name}</h3>
              <p>{cartItem.item.description}</p>
              <p>Precio: ${cartItem.item.price}</p>
              <button
                onClick={() => removeFromCart(cartItem.item_id)}
                className="cart-item-remove"
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Cart;