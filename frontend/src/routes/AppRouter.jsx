import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from '../pages/login'; 
import Table from '../pages/table';
import Signup from '../pages/signup';
import SharePasssword from '../pages/sharepasswords';

const AppRouter = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/table" element={<Table />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/share-password" element={<SharePasssword />} />
    </Routes>
  </Router>
);

export default AppRouter;
