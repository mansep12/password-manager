import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const baseUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    try {
      const response = await axios.post(`${baseUrl}/users/token`, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('password', password);
      window.location.href = '/table';
    } catch (error) {
      setError('Usuario o contraseña incorrecta');
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 400,
        mx: 'auto', // Centra horizontalmente
        mt: 10, // Espaciado superior
        p: 4,
        boxShadow: 3,
        borderRadius: 2,
        bgcolor: 'white', // Fondo blanco del formulario
        textAlign: 'center',
      }}
    >
      <Typography
        variant="h5"
        mb={2}
        sx={{
          color: '#333', // Cambia el color del texto a gris oscuro
        }}
      >
        Iniciar Sesión
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Usuario"
          variant="outlined"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Contraseña"
          type="password"
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button fullWidth variant="contained" color="primary" type="submit">
          Iniciar sesión
        </Button>
        <Button
          fullWidth
          variant="contained"
          color="secondary"
          sx={{ mt: 2 }}
          onClick={() => navigate('/signup')}
        >
          Registrarse
        </Button>
      </form>
    </Box>
  );
};

export default Login;
