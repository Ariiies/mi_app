import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Catalog from './components/Catalog';
import ItemDetail from './components/ItemDetail';
import Footer from './components/Footer';
import Hero from './components/Hero';
import AuthForm from './components/AuthForm';
import AdminPanel from './components/AdminPanel';
import Profile from './components/Profile';
import Cart from './components/Cart';
import useAuth from './hooks/useAuth';
import Checkout from './components/Checkout';
import CheckKey from './components/CheckKey';
import PaymentSuccess from './components/PaymentSuccess';
import PaymentCancelled from './components/PaymentCancelled'; 
import './styles/App.css';

function RedirectIfAuthenticated({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/" /> : children;
}

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <div className="app-container">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/item/:id" element={<ItemDetail />} />
          <Route path="/Checkout" element={<Checkout />} />
          <Route path="/CheckKey" element={<CheckKey />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-cancelled" element={<PaymentCancelled />} />
          <Route
            path="/login"
            element={
              <RedirectIfAuthenticated>
                <AuthForm mode="login" />
              </RedirectIfAuthenticated>
            }
          />
          <Route
            path="/register"
            element={
              <RedirectIfAuthenticated>
                <AuthForm mode="register" />
              </RedirectIfAuthenticated>
            }
          />
          <Route path="/cart" element={<Cart />} /> {/* Eliminado ProtectedRoute */}
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;