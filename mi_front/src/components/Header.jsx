import '../styles/Header.css';
import { Link } from 'react-router-dom';

function Header() {
    return (
      <header className="header">
        <Link to ="">
              <h1 className="header-title">mi_app</h1>
        </Link>
        <Link to ="/login">
        <button className="sign-in-button">log in</button>
        </Link>
        
      </header>
    );
  }
  
  export default Header;