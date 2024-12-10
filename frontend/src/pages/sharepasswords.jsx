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
import { decryptRSA, encryptRSA, importPublicKey, hexToArrayBuffer as hexToArrayBufferRSA, arrayBufferToHex as arrayBufferToHexRSA } from '../encryptionRSAOAEP';
import { hexToArrayBuffer as hexToArrayBufferAES, decryptAESCBC, deriveKeyAESCBC } from '../encryptionAESCBC';

const SharedPasswords = () => {
    const baseUrl = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();
    const [userPasswords, setUserPasswords] = useState([]);
    const [sharedPasswords, setSharedPasswords] = useState([]);
    const [users, setUsers] = useState([]); // State to store the list of users
    const [showShareForm, setShowShareForm] = useState(false);
    const [selectedPasswordId, setSelectedPasswordId] = useState('');
    const [selectedUserIds, setSelectedUserIds] = useState([]); // State to store the selected users
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const curr_password = localStorage.getItem("password")

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
            if (selectedUserIds.length === 1) {
                // get pub key
                const userId = selectedUserIds[0];
                const response = await axios.get(`${baseUrl}/users/pubkey/${userId}`, {});
                const pubKeyHex = response.data;
                const pubKeyArrayBuffer = hexToArrayBufferRSA(pubKeyHex);
                const pubKey = await importPublicKey(pubKeyArrayBuffer);

                // get decrypted password
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

                // encrypt with pubkey
                const encryptedSharedPasswordBuffer = await encryptRSA(pubKey, decryptedPassword);
                const encryptedSharedPassword = arrayBufferToHexRSA(encryptedSharedPasswordBuffer);
                console.log(encryptedSharedPassword);

                await axios.post(
                    `${baseUrl}/shared/`,
                    {
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
            } else {
                // Share with multiple users
                await axios.post(
                    `${baseUrl}/passwords/share/multiple`,
                    {
                        password_id: selectedPasswordId,
                        target_user_ids: selectedUserIds,
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

    useEffect(() => {
        fetchUserPasswords();
        fetchSharedPasswords();
        fetchUsers(); // Fetch the list of users on component mount
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
                    onClick={() => navigate('/table')}>
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
                <DialogTitle sx={{ color: 'var(--color-primary)' }}>Compartir Contraseña</DialogTitle>
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
                            <MenuItem
                                key={password.id}
                                value={password.id}
                                sx={{
                                    bgcolor:
                                        selectedPasswordId === password.id
                                            ? 'var(--color-selected)'
                                            : 'inherit',
                                }}
                            >
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
                                    bgcolor:
                                        selectedUserIds.includes(user.id)
                                            ? 'var(--color-selected)'
                                            : 'inherit',
                                }}
                            >
                                {user.name}
                            </MenuItem>
                        ))}
                    </Select>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setShowShareForm(false)}
                        sx={{
                            color: 'var(--color-error)',
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
                            '&:hover': { backgroundColor: '#003ea8' },
                        }}
                    >
                        Compartir
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SharedPasswords;
