import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from '../pages/Auth/Login';
import AdminDashboard from '../pages/Dashboard/AdminMain';
import ProtectedRoute from "./ProtectedRoute.jsx"; 
import ForgotPassword from '../pages/Auth/ForgotPassword';
import PharmacieDetailPage from '../pages/Pharmacies/PharmacieDetailPage';
import ResetPassword from '../pages/Auth/ResetPassword';

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

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route
          path="/pharmaPack/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pharmaPack/admin/pharmacies/:id"
          element={
            <ProtectedRoute>
              <PharmacieDetailPage />
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