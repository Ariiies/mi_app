import { Link } from 'react-router-dom';
import '../styles/PaymentCancelled.css';

function PaymentCancelled() {
  return (
    <div className="payment-cancelled">
      <h2>Pago cancelado</h2>
      <p>Tu pago fue cancelado o no se completó correctamente.</p>
      <Link to="/cart">← Volver al carrito</Link>
    </div>
  );
}

export default PaymentCancelled;
