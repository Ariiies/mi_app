import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAdmin from '../hooks/useAdmin';
import '../styles/AdminPanel.css';

function AdminPanel() {
  const navigate = useNavigate();
  const {
    items,
    formData,
    editingItem,
    errors,
    serverError,
    loading,
    handleChange,
    handleImageChange,
    handleSubmit,
    handleEdit,
    handleDelete,
  } = useAdmin();
  const [view, setView] = useState('home'); // Controlar vista: 'home', 'create', 'list'
  const user = JSON.parse(localStorage.getItem('user'));

  // Proteger ruta
  useEffect(() => {
    if (!user || !user.is_admin) {
      navigate('/login');
    }
  }, [user, navigate]);

  return (
    <div className="admin-panel">
      {view === 'home' && (
        <div className="user-info">
          <h2 className="user-info-title">Panel de Administración</h2>
          <div className="user-details">
            <p><strong>Usuario:</strong> {user?.username}</p>
            <p><strong>Nombre:</strong> {user?.name}</p>
          </div>
          <div className="user-actions">
            <button
              className="action-button"
              onClick={() => setView('create')}
            >
              Crear Ítem
            </button>
            <button
              className="action-button"
              onClick={() => setView('list')}
            >
              Ver Lista de Ítems
            </button>
          </div>
        </div>
      )}

      {view === 'create' && (
        <div className="create-item">
          <h2 className="section-title">{editingItem ? 'Editar Ítem' : 'Crear Ítem'}</h2>
          <form onSubmit={handleSubmit} className="item-form">
            <div className="form-group">
              <label htmlFor="name">Nombre:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'input-error' : ''}
              />
              {errors.name && <span className="error">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="description">Descripción:</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="price">Precio:</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className={errors.price ? 'input-error' : ''}
                step="0.01"
              />
              {errors.price && <span className="error">{errors.price}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="img">Imagen:</label>
              <input
                type="file"
                id="img"
                name="img"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
            {serverError && <p className="error server-error">{serverError}</p>}
            <div className="form-actions">
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? 'Guardando...' : editingItem ? 'Actualizar' : 'Crear'}
              </button>
              <button
                type="button"
                className="back-button"
                onClick={() => setView('home')}
              >
                Volver
              </button>
            </div>
          </form>
        </div>
      )}

      {view === 'list' && (
        <div className="item-list">
          <h2 className="section-title">Lista de Ítems</h2>
          <button
            className="back-button"
            onClick={() => setView('home')}
          >
            Volver
          </button>
          {items.length === 0 ? (
            <p>No hay ítems disponibles.</p>
          ) : (
            <table className="items-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Precio</th>
                  <th>Imagen</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.description || '-'}</td>
                    <td>${item.price.toFixed(2)}</td>
                    <td>
                      {item.img ? (
                        <img
                          src={`data:image/jpeg;base64,${item.img}`}
                          alt={item.name}
                          className="item-image"
                        />
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      <button
                        className="edit-button"
                        onClick={() => {
                          handleEdit(item);
                          setView('create');
                        }}
                      >
                        Editar
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => handleDelete(item.id)}
                      >
                        Borrar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminPanel;