import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import '../styles/Header.css';

function Header() {
  const { logout } = useAuth('login');
  const user = JSON.parse(localStorage.getItem('user')); // para leer el usuario actual
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <Link to="/">
        <h1 className="header-title">mi_app</h1>
      </Link>
      {user ? (
        <button onClick={handleLogout} className="logout-button">
          Log Out
        </button>
      ) : (
        <Link to="/login">
          <button className="sign-in-button">Log In</button>
        </Link>
      )}
    </header>
  );
}

export default Header;