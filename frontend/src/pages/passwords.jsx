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
  IconButton
} from '@mui/material';
import { ContentCopy } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { decryptRSA, encryptRSA, importPublicKey, hexToArrayBuffer as hexToArrayBufferRSA, arrayBufferToHex as arrayBufferToHexRSA, importPrivateKey } from '../encryptionRSAOAEP';
import {
  hexToArrayBuffer as hexToArrayBufferAES,
  decryptAESCBC,
  deriveKeyAESCBC,
  encryptAESCBC,
  arrayBufferToHex
} from '../encryptionAESCBC';
import { generateRandomPassword } from '../passwordGeneration';

const Passwords = () => {
  const baseUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [userPasswords, setUserPasswords] = useState([]);
  const [sharedPasswords, setSharedPasswords] = useState([]);
  const [users, setUsers] = useState([]);
  const [showShareForm, setShowShareForm] = useState(false);
  const [selectedPasswordId, setSelectedPasswordId] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formErrors, setFormErrors] = useState({
    name: '',
    url: '',
    username: '',
    encrypted_password: '',
  });
  const curr_password = localStorage.getItem("password");

  // Estados y lógica para crear una contraseña
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    username: '',
    encrypted_password: generateRandomPassword(20),
  });
  const token = localStorage.getItem('access_token');

  // Función para validar URL
  const isValidURL = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;  
    }
  };

  // Manejador de cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value,
    });

    // Validación en tiempo real para la URL
    if (name === 'url') {
      if (value === '') {
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          url: 'La URL es requerida.',
        }));
      } else if (!isValidURL(value)) {
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          url: 'La URL no es válida.',
        }));
      } else {
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          url: '',
        }));
      }
    }

    // Validaciones para otros campos
    if (name === 'name') {
      if (value === '') {
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          name: 'El nombre es requerido.',
        }));
      } else {
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          name: '',
        }));
      }
    }

    if (name === 'username') {
      if (value === '') {
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          username: 'El usuario es requerido.',
        }));
      } else {
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          username: '',
        }));
      }
    }

    if (name === 'encrypted_password') {
      if (value === '') {
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          encrypted_password: 'La contraseña es requerida.',
        }));
      } else {
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          encrypted_password: '',
        }));
      }
    }
  };

  // Función para copiar texto al portapapeles
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setSuccess('¡Contraseña copiada al portapapeles!');
      setTimeout(() => setSuccess(''), 2000); // Limpia el mensaje después de 2 segundos
    }).catch(() => {
      setError('Error al copiar la contraseña');
      setTimeout(() => setError(''), 2000);
    });
  };

  // Función para Logout
  const handleLogout = () => {
    // Eliminar token y contraseña del localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('password');

    // Limpiar el estado del componente
    setUserPasswords([]);
    setSharedPasswords([]);
    setUsers([]);
    setSelectedPasswordId('');
    setSelectedUserIds([]);
    setFormData({
      name: '',
      url: '',
      username: '',
      encrypted_password: generateRandomPassword(20),
    });
    setFormErrors({
      name: '',
      url: '',
      username: '',
      encrypted_password: '',
    });
    setError('');
    setSuccess('');

    // Redirigir al usuario a la página principal
    navigate('/');
  };

  // Fetch user's own passwords
  const fetchUserPasswords = async () => {
    try {
      const token = localStorage.getItem('access_token');
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
      const salt = hexToArrayBufferAES(salt_response.data)
      for (const password of response.data) {
        const key = await deriveKeyAESCBC(curr_password, salt);
        password.password = await decryptAESCBC(
          hexToArrayBufferAES(password.encrypted_password),
          key,
          hexToArrayBufferAES(password.iv)
        );
      }
      setUserPasswords(response.data);
    } catch (error) {
      setError('Error al cargar las contraseñas propias.');
      console.log(error.message);
    }
  };

  // Fetch shared passwords
  const fetchSharedPasswords = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${baseUrl}/shared/list`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const priv_key_response = await axios.get(`${baseUrl}/users/priv_key`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const salt_response = await axios.get(`${baseUrl}/users/salt`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const salt = hexToArrayBufferAES(salt_response.data)
      const password = localStorage.getItem("password")
      const [encryptedPrivKeyHex, privKeyIvHex] = priv_key_response.data
      const encryptedPrivKeyBuffer = hexToArrayBufferAES(encryptedPrivKeyHex);
      const privKeyIv = hexToArrayBufferAES(privKeyIvHex);
      const key = await deriveKeyAESCBC(password, salt)
      const privKeyHex = await decryptAESCBC(encryptedPrivKeyBuffer, key, privKeyIv);
      const privKeyBuffer = await hexToArrayBufferRSA(privKeyHex);
      const privKey = await importPrivateKey(privKeyBuffer);
      for (const password of response.data) {
        password.password = await decryptRSA(
          privKey,
          hexToArrayBufferRSA(password.encrypted_password)
        );
      }
      setSharedPasswords(response.data);
    } catch (error) {
      setError('Error al cargar las contraseñas compartidas.');
      console.log(error.message);
    }
  };

  // Fetch all users except the current user
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${baseUrl}/users/list`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data);
    } catch (error) {
      setError('Error al cargar la lista de usuarios.');
    }
  };

  // Share a password
  const handleSharePassword = async () => {
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('access_token');
      const selectedPassword = userPasswords.find(
        (password) => password.id === selectedPasswordId
      );

      if (!selectedPassword) {
        setError('No se encontró la contraseña seleccionada.');
        return;
      }

      const encryptedPassword = selectedPassword.encrypted_password;
      const passwordIv = selectedPassword.iv
      for (const userId of selectedUserIds) {
        const response = await axios.get(`${baseUrl}/users/pubkey/${userId}`, {});
        const pubKeyHex = response.data;
        const pubKeyArrayBuffer = hexToArrayBufferRSA(pubKeyHex);
        const pubKey = await importPublicKey(pubKeyArrayBuffer);

        const salt_response = await axios.get(`${baseUrl}/users/salt`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const salt = hexToArrayBufferAES(salt_response.data)
        const key = await deriveKeyAESCBC(curr_password, salt);
        const decryptedPassword = await decryptAESCBC(
          hexToArrayBufferAES(encryptedPassword),
          key,
          hexToArrayBufferAES(passwordIv)
        );

        // Encrypt with public key
        const encryptedSharedPasswordBuffer = await encryptRSA(pubKey, decryptedPassword);
        const encryptedSharedPassword = arrayBufferToHexRSA(encryptedSharedPasswordBuffer);

        await axios.post(
          `${baseUrl}/shared/`,
          {
            name: selectedPassword.name,
            url: selectedPassword.url,
            username: selectedPassword.username,
            encrypted_password: encryptedSharedPassword,
            shared_with_user_id: userId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
      }
      setSuccess('Contraseña compartida exitosamente.');
      setShowShareForm(false);
      fetchSharedPasswords();
    } catch (error) {
      setError('Error al compartir la contraseña.');
    }
  };

  // Crear nueva contraseña
  const handleCreatePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validación antes de enviar
    let valid = true;
    let errors = {};

    if (!formData.name.trim()) {
      errors.name = 'El nombre es requerido.';
      valid = false;
    }

    if (!formData.url.trim()) {
      errors.url = 'La URL es requerida.';
      valid = false;
    } else if (!isValidURL(formData.url)) {
      errors.url = 'La URL no es válida.';
      valid = false;
    }

    if (!formData.username.trim()) {
      errors.username = 'El usuario es requerido.';
      valid = false;
    }

    if (!formData.encrypted_password.trim()) {
      errors.encrypted_password = 'La contraseña es requerida.';
      valid = false;
    }

    setFormErrors(errors);

    if (!valid) {
      setError('Por favor, corrige los errores en el formulario.');
      return;
    }

    try {
      const salt_response = await axios.get(`${baseUrl}/users/salt`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const salt = hexToArrayBufferAES(salt_response.data);
      const password = localStorage.getItem('password');
      const key = await deriveKeyAESCBC(password, salt);
      const { ciphertext, iv } = await encryptAESCBC(formData.encrypted_password, key);
      const data = {
        ...formData,
        encrypted_password: arrayBufferToHex(ciphertext),
        salt: arrayBufferToHex(salt),
        iv: arrayBufferToHex(iv),
      };
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
      fetchUserPasswords();
    } catch (error) {
      setError('No se pudo crear la contraseña.');
    }
  };

  useEffect(() => {
    fetchUserPasswords();
    fetchSharedPasswords();
    fetchUsers();
  }, []);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', my: 4, px: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Contraseñas
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          variant="contained"
          sx={{
            backgroundColor: 'var(--color-primary)',
            color: '#fff',
            '&:hover': { backgroundColor: '#003ea8' },
            textTransform: 'none',
          }}
          onClick={() => setShowShareForm(true)}
        >
          Compartir Contraseña
        </Button>
        <Button
          variant="contained"
          sx={{
            bgcolor: 'var(--color-success)',
            color: '#fff',
            textTransform: 'none',
            '&:hover': {
              bgcolor: '#2e7d32',
            },
          }}
          onClick={() => setShowForm(true)}
        >
          Crear Contraseña
        </Button>
        <Button
          variant="contained"
          sx={{
            backgroundColor: 'var(--color-error)',
            color: '#fff',
            '&:hover': { backgroundColor: '#c62828' }, // Rojo más oscuro
            textTransform: 'none',
          }}
          onClick={handleLogout}
        >
          Logout
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
              <TableCell>Contraseña</TableCell>
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
                <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                  {password.password}
                  <IconButton
                    onClick={() => handleCopy(password.password)}
                    aria-label="copiar contraseña"
                    size="small"
                    sx={{ ml: 1 }}
                  >
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h5" gutterBottom>
        Compartidas Conmigo
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f0f0f0' }}>
              <TableCell>Propietario</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>URL</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>Contraseña</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sharedPasswords.map((sharedPassword) => (
              <TableRow key={sharedPassword.id}>
                <TableCell>{sharedPassword.owner_username}</TableCell>
                <TableCell>{sharedPassword.name}</TableCell>
                <TableCell>
                  <a href={sharedPassword.url} target="_blank" rel="noopener noreferrer">
                    {sharedPassword.url}
                  </a>
                </TableCell>
                <TableCell>{sharedPassword.username}</TableCell>
                <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                  {sharedPassword.password}
                  <IconButton
                    onClick={() => handleCopy(sharedPassword.password)}
                    aria-label="copiar contraseña"
                    size="small"
                    sx={{ ml: 1 }}
                  >
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog para compartir contraseña */}
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
          <Select
            fullWidth
            multiple
            value={selectedUserIds}
            onChange={(e) => setSelectedUserIds(e.target.value)}
            displayEmpty
            sx={{ mb: 2 }}
          >
            <MenuItem value="" disabled>
              Selecciona usuarios
            </MenuItem>
            {users.map((user) => (
              <MenuItem
                key={user.id}
                value={user.id}
                sx={{
                  bgcolor: selectedUserIds.includes(user.id) ? '#e3f2fd' : 'inherit',
                  '&.Mui-selected': {
                    bgcolor: '#bbdefb',
                  }
                }}
              >
                {user.name}
              </MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => setShowShareForm(false)}
            sx={{
              backgroundColor: 'var(--color-error)',
              color: '#fff',
              '&:hover': { backgroundColor: '#c62828' }, // Rojo más oscuro
              textTransform: 'none',
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSharePassword}
            variant="contained"
            sx={{
              backgroundColor: 'var(--color-primary)',
              color: '#fff',
              '&:hover': { backgroundColor: '#003ea8' }, // Azul más oscuro
              textTransform: 'none',
            }}
          >
            Compartir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para crear contraseña */}
      <Dialog open={showForm} onClose={() => setShowForm(false)}>
        <DialogTitle sx={{ color: 'var(--color-primary)' }}>Crear Contraseña</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nombre"
            name="name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
            error={Boolean(formErrors.name)}
            helperText={formErrors.name}
          />
          <TextField
            fullWidth
            label="URL"
            name="url"
            value={formData.url}
            onChange={handleChange}
            margin="normal"
            error={Boolean(formErrors.url)}
            helperText={formErrors.url}
          />
          <TextField
            fullWidth
            label="Usuario"
            name="username"
            value={formData.username}
            onChange={handleChange}
            margin="normal"
            error={Boolean(formErrors.username)}
            helperText={formErrors.username}
          />
          <TextField
            fullWidth
            label="Contraseña"
            name="encrypted_password"
            value={formData.encrypted_password}
            onChange={handleChange}
            margin="normal"
            error={Boolean(formErrors.encrypted_password)}
            helperText={formErrors.encrypted_password}
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => setShowForm(false)}
            sx={{
              backgroundColor: 'var(--color-error)',
              color: '#fff',
              '&:hover': { backgroundColor: '#c62828' }, // Rojo más oscuro
              textTransform: 'none',
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCreatePassword}
            variant="contained"
            sx={{
              backgroundColor: 'var(--color-primary)',
              color: '#fff',
              '&:hover': { backgroundColor: '#003ea8' }, // Azul más oscuro
              textTransform: 'none',
            }}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default Passwords;
