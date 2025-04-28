import { useState, useEffect } from 'react';
import useAuth from './useAuth';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

function useCart() {
  const { user, token } = useAuth();
  const [cart, setCart] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        if (!user || !token) {
          setCart(null);
          setError('Por favor, inicia sesión para ver tu carrito.');
          return;
        }
        const response = await axios.get(`${API_URL}/carts/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCart(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching cart:', err.response?.status, err.response?.data);
        setError(
          err.response?.status === 401
            ? 'Sesión inválida. Por favor, inicia sesión de nuevo.'
            : 'No se pudo cargar el carrito. Verifica tu conexión o intenta de nuevo.'
        );
        setCart(null);
      }
    };
    fetchCart();
  }, [user, token]);

  const addToCart = async (itemId, quantity = 1) => {
    try {
      const response = await axios.post(
        `${API_URL}/carts/me/items`,
        { item_id: itemId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(response.data);
      setError(null);
    } catch (err) {
      console.error('Error adding to cart:', err.response?.status, err.response?.data);
      setError('No se pudo añadir al carrito.');
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await axios.delete(`${API_URL}/carts/me/items/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const response = await axios.get(`${API_URL}/carts/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(response.data);
      setError(null);
    } catch (err) {
      console.error('Error removing from cart:', err.response?.status, err.response?.data);
      setError('No se pudo eliminar del carrito.');
    }
  };

  return { cart, addToCart, removeFromCart, error };
}

export default useCart;