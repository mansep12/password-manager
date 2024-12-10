import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import {
  deriveKeyAESCBC,
  encryptAESCBC,
  arrayBufferToHex,
  hexToArrayBuffer,
  decryptAESCBC,
  importKeyFromBytes,
} from '../encryptionAESCBC';
import { generateRandomPassword } from '../passwordGeneration';
import { KeyContext } from '../keyContext';

const PasswordTable = () => {
  const baseUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate(); // Inicializa useNavigate
  const [passwords, setPasswords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    username: '',
    encrypted_password: generateRandomPassword(20),
  });
  const [error, setError] = useState('');
  const { derivedKey } = useContext(KeyContext);
  const curr_password = localStorage.getItem("password")
  const token = localStorage.getItem('access_token');

  const fetchPasswords = async () => {
    try {
      const response = await axios.get(`${baseUrl}/passwords/list`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const salt_response = await axios.get(`${baseUrl}/users/salt`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const salt = hexToArrayBuffer(salt_response.data)
      console.log("salt", salt)
      for (const password of response.data) {
        const key = await deriveKeyAESCBC(curr_password, salt);
        password.password = await decryptAESCBC(
          hexToArrayBuffer(password.encrypted_password),
          key,
          hexToArrayBuffer(password.iv)
        );
      }
      setPasswords(response.data);
    } catch (error) {
      setError('No se pudieron cargar las contraseñas.');
      console.log(error.message);
    }
  };

  const handleCreatePassword = async (e) => {
    e.preventDefault();
    setError('');
    // const salt = crypto.getRandomValues(new Uint8Array(16));
    const salt_response = await axios.get(`${baseUrl}/users/salt`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const salt = hexToArrayBuffer(salt_response.data);
    const password = localStorage.getItem('password');
    const key = await deriveKeyAESCBC(password, salt);
    // const keyBuffer = localStorage.getItem('key');
    // console.log("keybuffer", keyBuffer);
    // const key = JSON.parse(keyBuffer);
    // console.log("key", key);
    const { ciphertext, iv } = await encryptAESCBC(formData.encrypted_password, key);
    const data = {
      ...formData,
      encrypted_password: arrayBufferToHex(ciphertext),
      salt: arrayBufferToHex(salt),
      iv: arrayBufferToHex(iv),
    };
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${baseUrl}/passwords/`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setShowForm(false);
      setFormData({
        name: '',
        url: '',
        username: '',
        encrypted_password: generateRandomPassword(20),
      });
      fetchPasswords();
    } catch (error) {
      setError('No se pudo crear la contraseña.');
    }
  };

  useEffect(() => {
    fetchPasswords();
  }, []);

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', my: 4, px: 2 }}>
      <Typography
        variant="h4"
        align="left"
        gutterBottom
        sx={{ color: '#333', fontWeight: 'bold', mb: 3 }}
      >
        Lista de Contraseñas
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowForm(true)}
          sx={{ textTransform: 'none' }}
        >
          Crear Contraseña
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => navigate('/share-password')} // Redirige a /share-password
          sx={{ textTransform: 'none' }}
        >
          Compartir Contraseñas
        </Button>
      </Box>
      <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f0f0f0' }}>
              <TableCell>Nombre</TableCell>
              <TableCell>URL</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>Contraseña</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {passwords.map((password) => (
              <TableRow key={password.id}>
                <TableCell>{password.name}</TableCell>
                <TableCell>
                  <a href={password.url} target="_blank" rel="noopener noreferrer">
                    {password.url}
                  </a>
                </TableCell>
                <TableCell>{password.username}</TableCell>
                <TableCell>{password.password}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={showForm} onClose={() => setShowForm(false)}>
        <DialogTitle>Crear Contraseña</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nombre"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="URL"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Usuario"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Contraseña"
            value={formData.encrypted_password}
            onChange={(e) =>
              setFormData({ ...formData, encrypted_password: e.target.value })
            }
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowForm(false)} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleCreatePassword} variant="contained" color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PasswordTable;
