import api, { setAuth, clearAuth, getAuth } from './api'
/* ========================= LOGIN ========================= */

/**
 * @param {{ email: string, mot_de_passe: string }} credentials
 * @returns {Promise<object>} utilisateur
 */
export const login = async ({ email, mot_de_passe }) => {
  try {
    const response = await api.post('/auth/login', { email, mot_de_passe });
    const { token, utilisateur } = response.data;
    setAuth(token, utilisateur);
    return utilisateur;
  } catch (error) {
    console.error('=== LOGIN ERROR ===');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }

    // ✅ Throw un objet Error standard avec le message dedans
    const message = handleApiError(error);
    return Promise.reject(message);
  }
};

/* ========================= LOGOUT ========================= */

export const logout = () => {
  clearAuth();
  window.location.href = '/';
};

/* ========================= GET USER ========================= */

export const getUser = () => {
  const data = getAuth();
  return data?.user || null;
};

/* ========================= ERROR HANDLER ========================= */

export const handleApiError = (error) => {
  console.error('API ERROR:', error);

  // Le serveur a répondu avec un code d'erreur HTTP
  if (error.response) {
    const msg = error.response.data?.message;
    switch (error.response.status) {
      case 400: return msg || 'Requête invalide';
      case 401: return msg || 'Email ou mot de passe incorrect';
      case 403: return 'Accès refusé';
      case 404: return 'Service introuvable';
      case 500: return 'Erreur interne du serveur';
      default:  return msg || 'Erreur serveur';
    }
  }

  // La requête est partie mais pas de réponse reçue → CORS ou réseau
  if (error.request) {
    console.error('Requête envoyée, pas de réponse:', error.request);
    return 'Serveur injoignable. Vérifiez votre connexion ou réessayez dans quelques secondes.';
  }

  return 'Erreur inconnue';
};

/* ========================= FORM VALIDATION ========================= */

export const validateEmail = (value) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
};

export const validateLoginForm = (email, password) => {
  const errors = {};
  if (!email.trim()) {
    errors.email = "L'email est requis";
  } else if (!validateEmail(email)) {
    errors.email = 'Email invalide';
  }
  if (!password) {
    errors.password = 'Le mot de passe est requis';
  } else if (password.length < 6) {
    errors.password = 'Minimum 6 caractères';
  }
  return errors;
};


export const passwordOublie = async (email) => {
  const name = "Mot de passe oublié";

  try {
    console.log("🚀 [REQUEST]", name);
    console.log("📧 Email envoyé :", email);

    const res = await api.post('/auth/forgot-password', { email });

    console.log("📨 [RESPONSE STATUS]", res.status);
    console.log("📨 [RESPONSE DATA]", res.data);

    return res.data;

  } catch (error) {
    console.error("❌ [ERROR]", name);

    if (error.response) {
      console.error("📛 Status :", error.response.status);
      console.error("📛 Data backend :", error.response.data);
    } else if (error.request) {
      console.error("📡 No response from server :", error.request);
    } else {
      console.error("⚠️ Error message :", error.message);
    }

    throw error;
  }
};

export const resetPassword = async (token, newPassword) => {
  const name = "Réinitialisation mot de passe";

  try {
    console.log("🚀 [REQUEST]", name);
    console.log("🔑 Token :", token);
    console.log("🔒 New password length :", newPassword?.length);

    const res = await api.post(`/auth/reset-password/${token}`, {
      newPassword
    });

    console.log("📨 [RESPONSE STATUS]", res.status);
    console.log("📨 [RESPONSE DATA]", res.data);

    return res.data;

  } catch (error) {
    console.error("❌ [ERROR]", name);

    if (error.response) {
      console.error("📛 Status :", error.response.status);
      console.error("📛 Data backend :", error.response.data);
    } else if (error.request) {
      console.error("📡 No response from server :", error.request);
    } else {
      console.error("⚠️ Error message :", error.message);
    }

    throw error;
  }
};