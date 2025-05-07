import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/PaymentSuccess.css';

function PaymentSuccess() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const session_id = query.get('session_id');

    if (session_id) {
      setSessionId(session_id);

      fetch(`http://localhost:8000/payments/success?session_id=${session_id}`)
        .then(res => {
          if (!res.ok) throw new Error('Error al confirmar el pago.');
          return res.json();
        })
        .then(data => {
          setMessage('¡Pago realizado con éxito! Gracias por tu compra.');
        })
        .catch(err => {
          console.error(err);
          setMessage('Hubo un problema al confirmar tu pago. Intenta más tarde.');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setMessage('No se proporcionó un session_id válido.');
      setLoading(false);
    }
  }, []);

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center' }}>
      <h2>Resultado del pago</h2>
      {loading ? (
        <p>Confirmando tu pago, por favor espera...</p>
      ) : (
        <>
          <p>{message}</p>
          <p><strong>ID de sesión:</strong> {sessionId}</p>
          <Link to="/catalog">← Volver al catálogo</Link>
        </>
      )}
    </div>
  );
}

export default PaymentSuccess;
