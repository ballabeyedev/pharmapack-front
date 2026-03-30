import api, { setAuth, clearAuth, getAuth } from './api'
/* ========================= LOGIN ========================= */

/**
 * @param {{ email: string, mot_de_passe: string }} credentials
 * @returns {Promise<object>} utilisateur
 */
export const login = async ({ email, mot_de_passe }) => {
  try {
    // Log avant l'appel
    console.log('=== LOGIN REQUEST ===');
    console.log('Email:', email);
    console.log('Mot de passe:', mot_de_passe);

    // Afficher l'URL finale utilisée par Axios
    console.log('Request URL:', api.defaults.baseURL + '/auth/login');

    const response = await api.post('/auth/login', {
      email,
      mot_de_passe,
    });

    console.log('=== LOGIN RESPONSE ===');
    console.log(response.data);

    const { token, utilisateur } = response.data;

    setAuth(token, utilisateur);

    return utilisateur;
  } catch (error) {
    // Log de l'erreur complète
    console.error('=== LOGIN ERROR ===');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('Request sent but no response:', error.request);
    } else {
      console.error('Other error:', error.message);
    }

    throw handleApiError(error);
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