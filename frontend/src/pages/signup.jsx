import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const baseUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await axios.post(`${baseUrl}/users/`, formData, {
        headers: { 'Content-Type': 'application/json' },
      });
      setSuccess('Cuenta creada exitosamente. Redirigiendo al inicio de sesión...');
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      setError(error.response?.data?.detail || 'Error al crear la cuenta.');
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 400,
        mx: 'auto',
        mt: 5,
        p: 4,
        boxShadow: 3,
        borderRadius: 2,
        bgcolor: 'background.paper',
      }}
    >
      <Typography variant="h5" align="center" mb={2}>
        Registrarse
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Correo Electrónico"
          variant="outlined"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          sx={{ mb: 2 }}
          required
        />
        <TextField
          fullWidth
          label="Nombre"
          variant="outlined"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          sx={{ mb: 2 }}
          required
        />
        <TextField
          fullWidth
          label="Contraseña"
          type="password"
          variant="outlined"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          sx={{ mb: 2 }}
          required
        />
        <Button fullWidth variant="contained" color="primary" type="submit">
          Registrarse
        </Button>
        <Button
          fullWidth
          variant="contained"
          color="secondary"
          sx={{ mt: 2 }}
          onClick={() => navigate('/')}
        >
          Cancelar
        </Button>
      </form>
    </Box>
  );
};

export default Signup;