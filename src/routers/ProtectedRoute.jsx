import { Navigate } from "react-router-dom";

/**
 * ProtectedRoute — garde de route côté front
 * 
 * Vérifie :
 * 1. Présence du token dans le localStorage
 * 2. Présence de l'objet utilisateur
 * 3. Rôle === "Admin"
 * 
 * Si l'une des conditions échoue → redirect /login
 */
export default function ProtectedRoute({ children }) {
  // Récupère l'objet auth complet
  let auth = null;
  try {
    const raw = localStorage.getItem("auth");
    auth = raw ? JSON.parse(raw) : null;
  } catch {
    auth = null;
  }

  // Vérifie token et utilisateur
  if (!auth?.token || !auth.user) {
    return <Navigate to="/pharmaPack/auth/login" replace />;
  }

  // Vérifie rôle
  if (auth.user.role !== "admin") {
    return <Navigate to="/pharmaPack/auth/login" replace />;
  }

  return children;
}