import React, { useState, useEffect } from 'react';
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
  MenuItem,
  Select,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const SharedPasswords = () => {
  const baseUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [userPasswords, setUserPasswords] = useState([]);
  const [sharedPasswords, setSharedPasswords] = useState([]);
  const [showShareForm, setShowShareForm] = useState(false);
  const [selectedPasswordId, setSelectedPasswordId] = useState('');
  const [shareTarget, setShareTarget] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch user's own passwords
  const fetchUserPasswords = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${baseUrl}/passwords/list`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserPasswords(response.data);
    } catch (error) {
      setError('Error al cargar las contraseñas propias.');
    }
  };

  // Fetch shared passwords
  const fetchSharedPasswords = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${baseUrl}/passwords/shared`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSharedPasswords(response.data);
    } catch (error) {
      setError('Error al cargar las contraseñas compartidas.');
    }
  };

  // Share a password
  const handleSharePassword = async () => {
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(
        `${baseUrl}/passwords/share`,
        {
          password_id: selectedPasswordId,
          target: shareTarget, // Could be email or user ID
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setSuccess('Contraseña compartida exitosamente.');
      setShowShareForm(false);
      fetchSharedPasswords();
    } catch (error) {
      setError('Error al compartir la contraseña.');
    }
  };

  useEffect(() => {
    fetchUserPasswords();
    fetchSharedPasswords();
  }, []);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', my: 4, px: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Contraseñas Compartidas
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="contained" color="primary" onClick={() => setShowShareForm(true)}>
          Compartir Contraseña
        </Button>
        <Button variant="contained" color="secondary" onClick={() => navigate('/table')}>
          Volver a Lista de Contraseñas
        </Button>
      </Box>

      <Typography variant="h5" gutterBottom>
        Mis Contraseñas
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f0f0f0' }}>
              <TableCell>Nombre</TableCell>
              <TableCell>URL</TableCell>
              <TableCell>Usuario</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {userPasswords.map((password) => (
              <TableRow key={password.id}>
                <TableCell>{password.name}</TableCell>
                <TableCell>
                  <a href={password.url} target="_blank" rel="noopener noreferrer">
                    {password.url}
                  </a>
                </TableCell>
                <TableCell>{password.username}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h5" gutterBottom>
        Contraseñas Compartidas
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f0f0f0' }}>
              <TableCell>Nombre</TableCell>
              <TableCell>URL</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>Compartido Con</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sharedPasswords.map((password) => (
              <TableRow key={password.id}>
                <TableCell>{password.name}</TableCell>
                <TableCell>
                  <a href={password.url} target="_blank" rel="noopener noreferrer">
                    {password.url}
                  </a>
                </TableCell>
                <TableCell>{password.username}</TableCell>
                <TableCell>{password.shared_with}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={showShareForm} onClose={() => setShowShareForm(false)}>
        <DialogTitle>Compartir Contraseña</DialogTitle>
        <DialogContent>
          <Select
            fullWidth
            value={selectedPasswordId}
            onChange={(e) => setSelectedPasswordId(e.target.value)}
            displayEmpty
            sx={{ mb: 2 }}
          >
            <MenuItem value="" disabled>
              Selecciona una contraseña
            </MenuItem>
            {userPasswords.map((password) => (
              <MenuItem key={password.id} value={password.id}>
                {password.name}
              </MenuItem>
            ))}
          </Select>
          <TextField
            fullWidth
            label="Compartir con (correo o ID)"
            value={shareTarget}
            onChange={(e) => setShareTarget(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowShareForm(false)} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleSharePassword} variant="contained" color="primary">
            Compartir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SharedPasswords;
