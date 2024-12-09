import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
  const baseUrl = import.meta.env.VITE_API_URL;
  console.log(baseUrl);
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
      // Redirecciona a la ruta principal o a la que requieras
      window.location.href = '/';
    } catch (error) {
      console.log(error.message);
      console.log(`${baseUrl}/users/token`);
      setError('Usuario o contraseña incorrecta');
    }
  };

  return (
    <div style={{ maxWidth: '300px', margin: '0 auto', marginTop: '50px' }}>
      <h1>Iniciar Sesión</h1>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ display: 'block', width: '100%', marginBottom: '10px' }}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ display: 'block', width: '100%', marginBottom: '10px' }}
        />
        <button type="submit">Iniciar sesión</button>
      </form>
    </div>
  );
};

export default Login;
