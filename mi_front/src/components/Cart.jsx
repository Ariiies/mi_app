import { useEffect, useState } from 'react';
import useCart from '../hooks/useCart';
import useAuth from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import '../styles/Cart.css';

function Cart() {
  const { cart, removeFromCart, error } = useCart();
  const { user } = useAuth();
  const [itemsWithImages, setItemsWithImages] = useState([]);

  useEffect(() => {
    const fetchItemsWithImages = async () => {
      if (!cart || !cart.items) return;

      const promises = cart.items.map(async (cartItem) => {
        try {
          const res = await fetch(`http://localhost:8000/items/${cartItem.item_id}`);
          const data = await res.json();
          return {
            ...cartItem,
            item: {
              ...data,
              img: data.img ? `data:image/jpeg;base64,${data.img}` : null
            }
          };
        } catch (e) {
          return { ...cartItem, item: { ...cartItem.item, img: null } };
        }
      });

      const results = await Promise.all(promises);
      setItemsWithImages(results);
    };

    fetchItemsWithImages();
  }, [cart]);

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
        {itemsWithImages.map((cartItem) => {
          const imageSrc = cartItem.item.img || 'https://via.placeholder.com/150';
          return (
            <li key={cartItem.item_id} className="cart-item">
              <img
                src={imageSrc}
                alt={cartItem.item.name}
                className="cart-item-img"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div className="cart-item-placeholder" style={{ display: 'none' }}>
                Sin imagen
              </div>
              <div className="cart-item-details">
                <h3>{cartItem.item.name}</h3>
                <p>{cartItem.item.description}</p>
                <p>Precio: ${cartItem.item.price}</p>
                <p>Cantidad: {cartItem.quantity}</p>
                <button
                  onClick={() => removeFromCart(cartItem.item_id)}
                  className="cart-item-remove"
                >
                  Eliminar
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      {itemsWithImages.length > 0 && (
  <div className="cart-summary">
    <p>Total de productos: {itemsWithImages.reduce((acc, item) => acc + item.quantity, 0)}</p>
    <p>Total a pagar: ${itemsWithImages.reduce((acc, item) => acc + (item.item.price * item.quantity), 0).toFixed(2)}</p>
    <button className="checkout-button">Ir a pagar</button>
  </div>
)}
    </div>
  );
}

export default Cart;

