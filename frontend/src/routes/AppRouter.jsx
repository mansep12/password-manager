import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from '../pages/login'; 
import Signup from '../pages/signup';
import Passwords from '../pages/passwords';

const AppRouter = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/password" element={<Passwords />} />
    </Routes>
  </Router>
);

export default AppRouter;
