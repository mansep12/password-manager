import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { deriveKeyAESCBC, encryptAESCBC } from '../encryptionAESCBC';
import { generateRandomPassword } from '../passwordGeneration';

const PasswordTable = () => {
  const baseUrl = import.meta.env.VITE_API_URL;
  const [passwords, setPasswords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    username: '',
    encrypted_password: generateRandomPassword(20),
  });
  const [error, setError] = useState('');

  const fetchPasswords = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${baseUrl}/passwords/list`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPasswords(response.data);
    } catch (error) {
      console.error('Error al obtener contraseñas:', error.message);
      setError('No se pudieron cargar las contraseñas.');
    }
  };

  const handleCreatePassword = async (e) => {
    e.preventDefault();
    setError('');

    // Aplica la transformación/encriptación
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const password = localStorage.getItem("password")
    const key = await deriveKeyAESCBC(password, salt)
    const { ciphertext, iv } = await encryptAESCBC(formData.encrypted_password, key);
    const ciphertextBase64 = ciphertext.reduce((acc, byte) => acc + String.fromCharCode(byte), "");
    console.log(ciphertextBase64)
    const data = { ...formData, encrypted_password: ciphertextBase64 }
    console.log(data)
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(
        `${baseUrl}/passwords/`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setShowForm(false);
      setFormData({
        name: '',
        url: '',
        username: '',
        encrypted_password: generateRandomPassword(20),
      });
      fetchPasswords(); // Actualiza la lista después de crear la contraseña
    } catch (error) {
      console.error('Error al crear contraseña:', error.message);
      setError('No se pudo crear la contraseña.');
    }
  };

  useEffect(() => {
    fetchPasswords();
  }, []);

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', marginTop: '50px' }}>
      <h1>Lista de Contraseñas</h1>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      <button onClick={() => setShowForm(true)}>Crear Contraseña</button>
      <table border="1" style={{ width: '100%', marginTop: '20px' }}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>URL</th>
            <th>Usuario</th>
            <th>Contraseña</th>
          </tr>
        </thead>
        <tbody>
          {passwords.map((password) => (
            <tr key={password.id}>
              <td>{password.name}</td>
              <td>
                <a href={password.url} target="_blank" rel="noopener noreferrer">
                  {password.url}
                </a>
              </td>
              <td>{password.username}</td>
              <td>{password.encrypted_password}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <div style={{ marginTop: '20px' }}>
          <h2>Crear Contraseña</h2>
          <form onSubmit={handleCreatePassword}>
            <input
              type="text"
              placeholder="Nombre"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{ display: 'block', width: '100%', marginBottom: '10px' }}
              required
            />
            <input
              type="url"
              placeholder="URL"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              style={{ display: 'block', width: '100%', marginBottom: '10px' }}
            />
            <input
              type="text"
              placeholder="Usuario"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              style={{ display: 'block', width: '100%', marginBottom: '10px' }}
            />
            <input
              type="text"
              placeholder="Contraseña"
              value={formData.encrypted_password}
              onChange={(e) =>
                setFormData({ ...formData, encrypted_password: e.target.value })
              }
              style={{ display: 'block', width: '100%', marginBottom: '10px' }}
              required
            />
            <button type="submit">Guardar</button>
            <button type="button" onClick={() => setShowForm(false)}>
              Cancelar
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PasswordTable;
