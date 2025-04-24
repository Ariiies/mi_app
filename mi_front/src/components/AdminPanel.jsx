import { useEffect } from 'react';
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

  // Verificar si el usuario es admin
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.is_admin) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="admin-container">
      <h2 className="admin-title">Panel de Administración</h2>
      
      {/* Formulario para crear/editar ítems */}
      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Nombre</label>
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
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="price">Precio</label>
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
          <label htmlFor="img">Imagen</label>
          <input
            type="file"
            id="img"
            name="img"
            onChange={handleImageChange}
            accept="image/*"
          />
        </div>
        {serverError && <div className="error server-error">{serverError}</div>}
        <button type="submit" className="admin-button" disabled={loading}>
          {loading ? 'Cargando...' : editingItem ? 'Actualizar Ítem' : 'Agregar Ítem'}
        </button>
        {editingItem && (
          <button
            type="button"
            className="cancel-button"
            onClick={() => {
              setFormData({ name: '', description: '', price: '', img: null });
              setEditingItem(null);
            }}
          >
            Cancelar
          </button>
        )}
      </form>

      {/* Lista de ítems */}
      <div className="items-list">
        <h3>Ítems Existentes</h3>
        {items.length === 0 ? (
          <p>No hay ítems</p>
        ) : (
          <ul>
            {items.map(item => (
              <li key={item.id} className="item-row">
                <span>{item.name} - ${item.price}</span>
                <div className="item-actions">
                  <button className="edit-button" onClick={() => handleEdit(item)}>
                    Editar
                  </button>
                  <button className="delete-button" onClick={() => handleDelete(item.id)}>
                    Borrar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;