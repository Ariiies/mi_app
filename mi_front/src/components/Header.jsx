import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import useAuth from '../hooks/useAuth';
import '../styles/Header.css';

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

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
      <nav className="nav">
        <Link to="/cart">
          <button className="cart-button">
            <svg
              className="cart-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span className="text_app">Carrito</span>
          </button>
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
                <Link to="/profile" className="dropdown-item" onClick={() => setIsOpen(false)}>
                  Perfil
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
      </nav>
    </header>
  );
}

export default Header;