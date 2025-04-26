import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const useProfile = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [formData, setFormData] = useState({
    username: user?.username || '',
    name: user?.name || '',
    lastname: user?.lastname || '',
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
  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = 'El usuario es requerido';
    } else if (formData.username.length < 3) {
      newErrors.username = 'El usuario debe tener al menos 3 caracteres';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    if (!formData.lastname.trim()) {
      newErrors.lastname = 'El apellido es requerido';
    }
    if (formData.pass && formData.pass.length > 0) {
      if (formData.pass.length < 8) {
        newErrors.pass = 'La contraseña debe tener al menos 8 caracteres';
      } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/.test(formData.pass)) {
        newErrors.pass = 'La contraseña debe contener una mayúscula, una minúscula, un número y un carácter especial';
      }
    }
    return newErrors;
  };

  // Manejar submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setServerError(null);

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      const body = {
        username: formData.username,
        name: formData.name,
        lastname: formData.lastname,
        ...(formData.pass && { pass_: formData.pass }), // Incluir pass_ solo si no está vacío
      };

      const response = await fetch(`http://localhost:8000/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'user-id': user.id.toString(),
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error al actualizar datos');
      }

      // Actualizar localStorage
      localStorage.setItem('user', JSON.stringify(data));
      setFormData({
        username: data.username,
        name: data.name,
        lastname: data.lastname,
        pass: '',
      });
      navigate('/profile');
    } catch (err) {
      setServerError(err.message);
      setLoading(false);
    }
  };

  return {
    formData,
    errors,
    serverError,
    loading,
    handleChange,
    handleSubmit,
  };
};

export default useProfile;