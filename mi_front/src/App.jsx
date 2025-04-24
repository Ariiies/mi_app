import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Catalog from './components/Catalog';
import ItemDetail from './components/ItemDetail';
import Footer from './components/Footer';
import Hero from './components/Hero';
import AuthForm from './components/AuthForm';
import AdminPanel from './components/AdminPanel';
import './styles/App.css';

function App() {
  return (
    <div className="app-container">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/item/:id" element={<ItemDetail />} />
          <Route path="/login" element={<AuthForm mode="login" />} />
          <Route path="/register" element={<AuthForm mode="register" />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;