import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ItemCard from './ItemCard';
import '../styles/Catalog.css';
import '../styles/Pagination.css';

function Catalog() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/items/?limit=${itemsPerPage}&offset=${(currentPage - 1) * itemsPerPage}`
        );
        if (!response.ok) {
          throw new Error('Error al cargar los items');
        }
        const data = await response.json();
        const formattedItems = data.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.img ? `data:image/jpeg;base64,${item.img}` : 'https://via.placeholder.com/150'
        }));
        setItems(formattedItems);
        setTotalItems(data.total_items);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchItems();
  }, [currentPage]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (loading) {
    return <div className="catalog">Cargando...</div>;
  }

  if (error) {
    return (
      <div className="catalog">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="catalog">
      <h2 className="catalog-title">Catálogo de Productos</h2>
      <div className="catalog-grid">
        {items.map((item) => (
          <Link key={item.id} to={`/item/${item.id}`} className="item-link">
            <ItemCard name={item.name} price={item.price} image={item.image} />
          </Link>
        ))}
      </div>
      <div className="pagination">
        <button
          className="pagination-button"
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
        >
          Anterior
        </button>
        <span className="pagination-info">Página {currentPage} de {totalPages}</span>
        <button
          className="pagination-button"
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}

export default Catalog;