import { useState, useEffect } from 'react';
import useAuth from './useAuth';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

function useCart() {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        if (!user) {
          setCart(null);
          return;
        }
        const response = await axios.get(`${API_URL}/carts/me`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setCart(response.data);
        setError(null);
      } catch (err) {
        setError('No se pudo cargar el carrito. Intenta de nuevo.');
        setCart(null);
      }
    };
    fetchCart();
  }, [user]);

  const addToCart = async (itemId) => {
    try {
      const response = await axios.post(
        `${API_URL}/carts/me/items`,
        { item_id: itemId },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setCart(response.data);
      setError(null);
    } catch (err) {
      setError('No se pudo añadir al carrito.');
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const response = await axios.delete(`${API_URL}/carts/me/items/${itemId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setCart(response.data);
      setError(null);
    } catch (err) {
      setError('No se pudo eliminar del carrito.');
    }
  };

  return { cart, addToCart, removeFromCart, error };
}

export default useCart;