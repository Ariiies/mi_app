import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import '../styles/AuthForm.css';

function AuthForm({ mode }) {
  const isLogin = mode === 'login';
  const { formData, errors, serverError, loading, handleChange, handleSubmit } = useAuth(mode);

  return (
    <div className="auth-container">
      <h2 className="auth-title">{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Usuario</label>
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
        {!isLogin && (
          <>
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
              <label htmlFor="lastname">Apellido</label>
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
          </>
        )}
        <div className="form-group">
          <label htmlFor="pass">Contraseña</label>
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
        {serverError && <div className="error server-error">{serverError}</div>}
        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Cargando...' : isLogin ? 'Iniciar Sesión' : 'Registrarse'}
        </button>
      </form>
      <p className="auth-switch">
        {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
        <Link to={isLogin ? '/register' : '/login'}>
          {isLogin ? ' Regístrate' : ' Inicia sesión'}
        </Link>
      </p>
    </div>
  );
}

export default AuthForm;