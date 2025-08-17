import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { useAuth } from './context/AuthContext';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ItemsPage from './pages/ItemsPage';
import TransactionsPage from './pages/TransactionsPage';
import ReportsPage from './pages/ReportsPage';

import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} />
          <Route path="/*" element={<PrivateRoute />}>
            <Route path="" element={<Layout><DashboardPage /></Layout>} />
            <Route path="items" element={<Layout><ItemsPage /></Layout>} />
            <Route path="transactions" element={<Layout><TransactionsPage /></Layout>} />
            <Route path="reports" element={<Layout><ReportsPage /></Layout>} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;