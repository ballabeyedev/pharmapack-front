import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from '../pages/Auth/Login';
import AdminDashboard from '../pages/Dashboard/AdminMain';
import ProtectedRoute from "./ProtectedRoute.jsx";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Page login */}
         {/* Racine → login */}
        <Route
          path="/"
          element={<Navigate to="/pharmaPack/auth/login" replace />}
        />

        {/* Page publique */}
        <Route path="/pharmaPack/auth/login" element={<Login />} />

        <Route
          path="/pharmaPack/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Redirection si route inconnue */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;