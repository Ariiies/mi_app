import '../styles/Hero.css'
import { Link } from 'react-router-dom';
const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Demuestra tu fanatismo con el Jersey de tu equipo!</h1>
        <p>los mejores jerseys al mejor precio.</p>
        <div className="hero-buttons">
          <Link to ="/catalog">
            <button className="secondary-btn">Ver Catalogo →</button>
          </Link>
        </div>
      </div>
      <div className="hero-image">
        <img 
          src="/src/assets/banner.jpeg" 
          alt="Aplicación demo" 
        />
      </div>
    </section>
  )
}

export default Hero