import { useState, useEffect } from 'react';

const useAdmin = () => {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    img: null,
  });
  const [editingItem, setEditingItem] = useState(null);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Obtener ítems
  const fetchItems = async () => {
    try {
      const response = await fetch('http://localhost:8000/items/?limit=100');
      const data = await response.json();
      setItems(data.items);
    } catch (err) {
      setServerError('Error al cargar ítems');
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
    setServerError(null);
  };

  // Manejar cambio de imagen
  const handleImageChange = (e) => {
    setFormData({ ...formData, img: e.target.files[0] });
    setErrors({ ...errors, img: '' });
    setServerError(null);
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0';
    }
    return newErrors;
  };

  // Manejar submit (crear o actualizar)
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
      const form = new FormData();
      form.append('name', formData.name);
      form.append('description', formData.description);
      form.append('price', formData.price);
      if (formData.img) {
        form.append('img', formData.img);
      }

      const endpoint = editingItem ? `/items/${editingItem.id}` : '/items/';
      const method = editingItem ? 'PUT' : 'POST';
      const user = JSON.parse(localStorage.getItem('user'));

      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method,
        headers: {
          'user-id': user.id.toString(),
        },
        body: form,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Error en la solicitud');
      }

      await fetchItems();
      setFormData({ name: '', description: '', price: '', img: null });
      setEditingItem(null);
      setLoading(false);
    } catch (err) {
      setServerError(err.message);
      setLoading(false);
    }
  };

  // Editar ítem
  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      img: null,
    });
  };

  // Borrar ítem
  const handleDelete = async (itemId) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`http://localhost:8000/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'user-id': user.id.toString(),
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Error al borrar ítem');
      }

      await fetchItems();
    } catch (err) {
      setServerError(err.message);
    }
  };

  return {
    items,
    formData,
    editingItem,
    errors,
    serverError,
    loading,
    handleChange,
    handleImageChange,
    handleSubmit,
    handleEdit,
    handleDelete,
  };
};

export default useAdmin;