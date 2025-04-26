import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useProfile from '../hooks/useProfile';
import '../styles/Profile.css';

function Profile() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [view, setView] = useState('home');
  const {
    formData,
    errors,
    serverError,
    loading,
    handleChange,
    handleSubmit,
  } = useProfile();

  // Proteger ruta
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  return (
    <div className="profile-page">
      {view === 'home' && (
        <div className="user-info">
          <h2 className="user-info-title">Perfil de Usuario</h2>
          <div className="user-details">
            <p><strong>Usuario:</strong> {user?.username}</p>
            <p><strong>Nombre:</strong> {user?.name}</p>
            <p><strong>Apellido:</strong> {user?.lastname}</p>
          </div>
          <div className="user-actions">
            <button className="action-button disabled" disabled>
              Ver Canasta
            </button>
            <button className="action-button disabled" disabled>
              Historial de Compras
            </button>
            <button
              className="action-button"
              onClick={() => setView('update')}
            >
              Actualizar Datos
            </button>
          </div>
        </div>
      )}

      {view === 'update' && (
        <div className="update-user">
          <h2 className="section-title">Actualizar Datos</h2>
          <form onSubmit={handleSubmit} className="user-form">
            <div className="form-group">
              <label htmlFor="username">Usuario:</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={errors.username ? 'input-error' : ''}
              />
              {errors.username && <span className="error">{errors.username}</span>}
            </div>
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
              <label htmlFor="lastname">Apellido:</label>
              <input
                type="text"
                id="lastname"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                className={errors.lastname ? 'input-error' : ''}
              />
              {errors.lastname && <span className="error">{errors.lastname}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="pass">Contraseña (opcional):</label>
              <input
                type="password"
                id="pass"
                name="pass"
                value={formData.pass}
                onChange={handleChange}
                className={errors.pass ? 'input-error' : ''}
              />
              {errors.pass && <span className="error">{errors.pass}</span>}
            </div>
            {serverError && <p className="error server-error">{serverError}</p>}
            <div className="form-actions">
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? 'Actualizando...' : 'Actualizar'}
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
    </div>
  );
}

export default Profile;