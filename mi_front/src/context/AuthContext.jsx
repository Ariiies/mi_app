import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const useAuth = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

  // Estado del formulario
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    lastname: '',
    pass: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
    setServerError(null);
  };

  // Validar formulario
  const validateForm = (isLogin) => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = 'El usuario es requerido';
    } else if (!isLogin && formData.username.length < 3) {
      newErrors.username = 'El usuario debe tener al menos 3 caracteres';
    }
    if (!isLogin && !formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    if (!isLogin && !formData.lastname.trim()) {
      newErrors.lastname = 'El apellido es requerido';
    }
    if (!formData.pass) {
      newErrors.pass = 'La contraseña es requerida';
    } else if (!isLogin) {
      if (formData.pass.length < 8) {
        newErrors.pass = 'La contraseña debe tener al menos 8 caracteres';
      } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/.test(formData.pass)) {
        newErrors.pass = 'La contraseña debe contener una mayúscula, una minúscula, un número y un carácter especial';
      }
    }
    console.log('Validación:', { formData, newErrors });
    return newErrors;
  };

  // Manejar submit
  const handleSubmit = async (e, isLogin = true) => {
    e.preventDefault();
    setLoading(true);
    setServerError(null);

    // Validar formulario
    const validationErrors = validateForm(isLogin);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      const endpoint = isLogin ? '/user/auth/' : '/users/';
      const body = isLogin
        ? { username: formData.username, pass_: formData.pass }
        : {
            username: formData.username,
            name: formData.name,
            lastname: formData.lastname,
            pass_: formData.pass,
            is_admin: false,
          };
      console.log('Enviando solicitud:', { endpoint, body });

      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      console.log('Respuesta del servidor:', { status: response.status, data });

      if (!response.ok) {
        if (response.status === 422 && data.detail && Array.isArray(data.detail)) {
          const errorMessages = data.detail.map(err => err.msg).join('; ');
          throw new Error(errorMessages || 'Error de validación en los datos');
        }
        throw new Error(data.detail || 'Error en la solicitud');
      }

      if (isLogin) {
        // Almacenar usuario en localStorage y actualizar estado
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        window.location.reload(); // Forzar recarga tras login
      }

      // Redirigir al hero tras éxito
      navigate('/');
    } catch (err) {
      console.error('Error:', err.message);
      setServerError(err.message);
      setLoading(false);
    }
  };

  // Manejar logout
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return {
    user,
    formData,
    errors,
    serverError,
    loading,
    handleChange,
    handleSubmit,
    logout,
  };
};

export default useAuth;