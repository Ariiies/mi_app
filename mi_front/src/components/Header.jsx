import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import useAuth from '../hooks/useAuth';
import '../styles/Header.css';

function Header() {
  const { logout } = useAuth('login'); // Solo necesitamos logout
  const user = JSON.parse(localStorage.getItem('user')); // Leer user directamente
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false); // Controlar lista desplegable

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="header">
      <Link to="/">
        <h1 className="header-title">mi_app</h1>
      </Link>
      {user ? (
        <div className="dropdown-container">
          <span className="username" onClick={toggleDropdown}>
            {user.username}
          </span>
          {isOpen && (
            <div className="dropdown">
              <Link to="/catalog" className="dropdown-item" onClick={() => setIsOpen(false)}>
                Catálogo
              </Link>
              <button className="dropdown-item logout-button" onClick={handleLogout}>
                Log Out
              </button>
            </div>
          )}
        </div>
      ) : (
        <Link to="/login">
          <button className="sign-in-button">Log In</button>
        </Link>
      )}
    </header>
  );
}

export default Header;