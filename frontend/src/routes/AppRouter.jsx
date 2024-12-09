import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from '../pages/login'; 
import Table from '../pages/table'; 
const AppRouter = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/table" element={<Table />} />
    </Routes>
  </Router>
);

export default AppRouter;
