import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import useCart from '../hooks/useCart';
import useAuth from '../hooks/useAuth'; 
import '../styles/ItemDetail.css';

function ItemDetail() {
  // Obtenemos el parámetro 'id' de la URL (e.g., /item/1 → id = "1")
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth(); 
  // Estado para almacenar los datos del item obtenidos del backend, loading y error
  // 'item' contendrá los datos del item, 'loading' indica si se está cargando y 'error' para manejar errores
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect ejecuta la solicitud al backend cuando el componente se monta o 'id' cambia
  useEffect(() => {
    // Función asíncrona para obtener los datos del item
    const fetchItem = async () => {
      try {
        // Hacemos una solicitud GET al endpoint del backend
        const response = await fetch(`http://localhost:8000/items/${id}`);
        // Si la respuesta no es exitosa (e.g., 404), lanzamos un error
        if (!response.ok) {
          throw new Error('Item not found');
        }
        // Parseamos la respuesta JSON
        const data = await response.json();
        // Actualizamos el estado con los datos del item
        // Convertimos la imagen base64 a un formato de URL de datos para la etiqueta <img>
        setItem({
          ...data,
          img: data.img ? `data:image/jpeg;base64,${data.img}` : null
        });
        // Marcamos la carga como completa
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]); // Dependencia

  // Si está cargando, mostramos un mensaje simple
  if (loading) {
    return <div className="item-detail">Cargando...</div>;
  }

  // Si hay un error, mostramos el mensaje de error y un botón para regresar
  if (error) {
    return (
      <div className="item-detail">
        <Link to="/" className="back-button">Regresar</Link>
        <p>Error: {error}</p>
      </div>
    );
  }
  const handleAddToCart = (itemId) => {
    if (!user) {
      alert('Por favor, inicia sesión para añadir al carrito.');
      return;
    }
    addToCart(itemId, 1);
  };
  // Si hay datos, renderizamos la vista completa del item
  return (
    <div className="item-detail">
      <Link to="/catalog" className="back-button">Regresar</Link>
      <div className="item-detail-content">
        <img 
          src={item.img || 'https://via.placeholder.com/300'} 
          alt={item.name} 
          className="item-detail-image" 
        />
        <div className="item-detail-info">
          <h2 className="item-detail-title">{item.name}</h2>
          <p className="item-detail-price">${item.price}</p>
          <p className="item-detail-description">{item.description}</p>
          <div className="item-detail-buttons">
            <button 
            className="add-to-cart-button"
            onClick={() => handleAddToCart(item.id)}
            >Agregar al Carrito</button>
            <button className="buy-now-button">Comprar Ahora</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemDetail;