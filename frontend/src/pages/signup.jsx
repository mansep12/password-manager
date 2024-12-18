import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { deriveKeyAESCBC, encryptAESCBC, arrayBufferToHex as arrayBufferToHexAES } from '../encryptionAESCBC';
import { generateKeyPair, exportPublicKey, arrayBufferToHex, exportPrivateKey } from '../encryptionRSAOAEP';

const Signup = () => {
  const baseUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
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
      const salt = crypto.getRandomValues(new Uint8Array(16));
      formData.salt = arrayBufferToHex(salt)
      const keyPair = await generateKeyPair();
      const exportedPubKey = await exportPublicKey(keyPair.publicKey)
      const hexPubKey = arrayBufferToHex(exportedPubKey);
      formData.pub_key = hexPubKey;
      console.log("pub_key", formData.pub_key);

      const exportedPrivKey = await exportPrivateKey(keyPair.privateKey)
      const hexPrivKey = arrayBufferToHex(exportedPrivKey);
      const key = await deriveKeyAESCBC(formData.password, salt)
      const encryptedKeyObject = await encryptAESCBC(hexPrivKey, key);
      formData.encrypted_priv_key = arrayBufferToHexAES(encryptedKeyObject.ciphertext);
      formData.priv_key_iv = arrayBufferToHexAES(encryptedKeyObject.iv)

      await axios.post(`${baseUrl}/users/`, formData, {
        headers: { 'Content-Type': 'application/json' },
      });

      setSuccess('Cuenta creada exitosamente. Redirigiendo al inicio de sesión...');
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      setError(error.response?.data?.detail || 'Error al crear la cuenta.');
      console.log(error.message)
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
        bgcolor: 'white',
        border: '1px solid var(--color-border)',
      }}
    >
      <Typography
        variant="h5"
        align="center"
        mb={2}
        sx={{ color: 'var(--color-primary)', fontWeight: 'bold' }}
      >
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
          Registrarse
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
          onClick={() => navigate('/')}
        >
          Cancelar
        </Button>
      </form>
    </Box>
  );
};

export default Signup;
