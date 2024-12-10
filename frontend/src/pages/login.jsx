import React, { useState, useContext } from 'react';
import axios from 'axios';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { deriveKeyAESCBC, hexToArrayBuffer } from '../encryptionAESCBC';
import { KeyContext } from '../keyContext';

const Login = () => {
  const baseUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { derivedKey, setDerivedKey } = useContext(KeyContext);

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

      const salt_response = await axios.get(`${baseUrl}/users/salt`, {
        headers: {
          Authorization: `Bearer ${response.data.access_token}`,
        },
      });
      // const salt = hexToArrayBuffer(salt_response.data);
      // const key = await deriveKeyAESCBC(password, salt);
      // const keyBuffer = JSON.stringify(key);
      localStorage.setItem('password', password)
      window.location.href = '/table';
    } catch (error) {
      setError('Usuario o contraseña incorrecta');
      console.log(error.message);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 400,
        mx: 'auto',
        mt: 5,
        p: 4,
        boxShadow: 4,
        borderRadius: 3,
        bgcolor: 'white', // Fondo blanco
        textAlign: 'center',
        border: '1px solid var(--color-border)', // Borde gris claro
      }}
    >
      <Typography
        variant="h5"
        mb={2}
        sx={{
          color: 'var(--color-primary)', // Azul Primario
          fontWeight: 'bold',
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
        <Button
          fullWidth
          variant="contained"
          sx={{
            backgroundColor: 'var(--color-primary)',
            color: '#fff',
            '&:hover': { backgroundColor: '#003ea8' },
          }}
          type="submit"
        >
          Iniciar sesión
        </Button>
        <Button
          fullWidth
          variant="outlined"
          sx={{
            mt: 2,
            borderColor: 'var(--color-secondary)',
            color: 'var(--color-secondary)',
            '&:hover': { backgroundColor: 'rgba(40, 167, 69, 0.1)' },
          }}
          onClick={() => navigate('/signup')}
        >
          Registrarse
        </Button>
      </form>
    </Box>

  );
};

export default Login;
