import api from './api';

/* ========================= HELPER LOG ========================= */

const logRequest = (name, data = null) => {
  console.log(`🚀 [REQUEST] ${name}`, data || '');
};

const logResponse = (name, res) => {
  console.log(`✅ [RESPONSE] ${name}`, res.data);
};

const logError = (name, error) => {
  console.error(`❌ [ERROR] ${name}`, {
    message: error.message,
    data: error.response?.data,
    status: error.response?.status
  });
};

/* ========================= UTILISATEURS ========================= */

export const activerUtilisateur = async (id) => {
  const name = "Activer Utilisateur";
  try {
    logRequest(name, { id });

    const res = await api.put(`/admin/activer-utilisateur/${id}`);

    logResponse(name, res);
    return res.data;

  } catch (error) {
    logError(name, error);
    throw error;
  }
};

export const desactiverUtilisateur = async (id) => {
  const name = "Désactiver Utilisateur";
  try {
    logRequest(name, { id });

    const res = await api.put(`/admin/desactiver-utilisateur/${id}`);

    logResponse(name, res);
    return res.data;

  } catch (error) {
    logError(name, error);
    throw error;
  }
};

/* ========================= PRODUITS ========================= */

export const getProduits = async () => {
  const name = "Liste Produits";
  try {
    logRequest(name);

    const res = await api.get('/admin/liste-produits');

    logResponse(name, res);
    return res.data;

  } catch (error) {
    logError(name, error);
    throw error;
  }
};

export const ajouterProduit = async (data) => {
  const name = "Ajouter Produit";
  try {
    logRequest(name, data);

    const res = await api.post('/admin/ajout-produits', data);

    logResponse(name, res);
    return res.data;

  } catch (error) {
    logError(name, error);
    throw error;
  }
};

export const modifierProduit = async (id, data) => {
  const name = "Modifier Produit";
  try {
    logRequest(name, { id, data });

    const res = await api.put(`/admin/modifier-produits/${id}`, data);

    logResponse(name, res);
    return res.data;

  } catch (error) {
    logError(name, error);
    throw error;
  }
};

export const supprimerProduit = async (id) => {
  const name = "Supprimer Produit";
  try {
    logRequest(name, { id });

    const res = await api.delete(`/admin/supprimer-produits/${id}`);

    logResponse(name, res);
    return res.data;

  } catch (error) {
    logError(name, error);
    throw error;
  }
};

/* ========================= COMMANDES ========================= */

export const getCommandes = async () => {
  const name = "Liste Commandes";
  try {
    logRequest(name);

    const res = await api.get('/admin/liste-commandes');

    logResponse(name, res);
    return res.data;

  } catch (error) {
    logError(name, error);
    throw error;
  }
};

export const validerCommande = async (id) => {
  const name = "Valider Commande";
  try {
    logRequest(name, { id });

    const res = await api.put(`/admin/valider-commandes/${id}`);

    logResponse(name, res);
    return res.data;

  } catch (error) {
    logError(name, error);
    throw error;
  }
};

export const rejeterCommande = async (id) => {
  const name = "Rejeter Commande";
  try {
    logRequest(name, { id });

    const res = await api.put(`/admin/rejeter-commandes/${id}`);

    logResponse(name, res);
    return res.data;

  } catch (error) {
    logError(name, error);
    throw error;
  }
};

export const livrerCommande = async (id) => {
  const name = "Livrer Commande";
  try {
    logRequest(name, { id });

    const res = await api.put(`/admin/livrer-commandes/${id}`);

    logResponse(name, res);
    return res.data;

  } catch (error) {
    logError(name, error);
    throw error;
  }
};

/* ========================= PHARMACIES ========================= */

export const getPharmacies = async () => {
  const name = "Liste Pharmacies";
  try {
    logRequest(name);

    const res = await api.get('/admin/liste-pharmacies');

    logResponse(name, res);
    return res.data;

  } catch (error) {
    logError(name, error);
    throw error;
  }
};

export const getPharmaciesEnAttente = async () => {
  const name = "Pharmacies en attente";
  try {
    logRequest(name);

    const res = await api.get('/admin/liste-pharmacies-enattente');

    logResponse(name, res);
    return res.data;

  } catch (error) {
    logError(name, error);
    throw error;
  }
};

export const validerPharmacie = async (id) => {
  const name = "Valider Pharmacie";
  try {
    logRequest(name, { id });

    const res = await api.put(`/admin/valider-pharmacies/${id}`);

    logResponse(name, res);
    return res.data;

  } catch (error) {
    logError(name, error);
    throw error;
  }
};

export const rejeterPharmacie = async (id) => {
  const name = "Rejeter Pharmacie";
  try {
    logRequest(name, { id });

    const res = await api.put(`/admin/rejeter-pharmacies/${id}`);

    logResponse(name, res);
    return res.data;

  } catch (error) {
    logError(name, error);
    throw error;
  }
};

/* ========================= AVANTAGES ========================= */

export const getAvantages = async () => {
  const name = "Liste Avantages";
  try {
    logRequest(name);

    const res = await api.get('/admin/liste-avantages');

    logResponse(name, res);
    return res.data;

  } catch (error) {
    logError(name, error);
    throw error;
  }
};

export const ajouterAvantage = async (data) => {
  const name = "Ajouter Avantage";
  try {
    logRequest(name, data);

    const res = await api.post('/admin/ajout-avantages', data);

    logResponse(name, res);
    return res.data;

  } catch (error) {
    logError(name, error);
    throw error;
  }
};

export const modifierAvantage = async (id, data) => {
  const name = "Modifier Avantage";
  try {
    logRequest(name, { id, data });

    const res = await api.put(`/admin/modifier-avantages/${id}`, data);

    logResponse(name, res);
    return res.data;

  } catch (error) {
    logError(name, error);
    throw error;
  }
};

export const supprimerAvantage = async (id) => {
  const name = "Supprimer Avantage";
  try {
    logRequest(name, { id });

    const res = await api.delete(`/admin/supprimer-avantages/${id}`);

    logResponse(name, res);
    return res.data;

  } catch (error) {
    logError(name, error);
    throw error;
  }
};

/* ========================= CATEGORIES ========================= */

export const getCategories = async () => {
  const name = "Liste Categories";
  try {
    logRequest(name);

    const res = await api.get('/admin/liste-categories');

    logResponse(name, res);
    return res.data;

  } catch (error) {
    logError(name, error);
    throw error;
  }
};

export const ajouterCategorie = async (data) => {
  const name = "Ajouter Categorie";
  try {
    logRequest(name, data);

    const res = await api.post('/admin/ajout-categories', data);

    logResponse(name, res);
    return res.data;

  } catch (error) {
    logError(name, error);
    throw error;
  }
};

export const modifierCategorie = async (id, data) => {
  const name = "Modifier Categorie";
  try {
    logRequest(name, { id, data });

    const res = await api.put(`/admin/modifier-categories/${id}`, data);

    logResponse(name, res);
    return res.data;

  } catch (error) {
    logError(name, error);
    throw error;
  }
};

export const supprimerCategorie = async (id) => {
  const name = "Supprimer Categorie";
  try {
    logRequest(name, { id });

    const res = await api.delete(`/admin/supprimer-categories/${id}`);

    logResponse(name, res);
    return res.data;

  } catch (error) {
    logError(name, error);
    throw error;
  }
};

/* ========================= NIVEAUX ========================= */ 

export const getNiveaux = async () => {
  const name = "Liste Niveaux";
  try {
    logRequest(name);

    const res = await api.get('/admin/liste-niveaux');

    logResponse(name, res);
    return res.data;

  } catch (error) {
    logError(name, error);
    throw error;
  }
};

export const ajouterNiveau = async (data) => {
  const name = "Ajouter Niveau";
  try {
    logRequest(name, data);

    const res = await api.post('/admin/ajout-niveaux', data);

    logResponse(name, res);
    return res.data;

  } catch (error) {
    logError(name, error);
    throw error;
  }
};

export const modifierNiveau = async (id, data) => {
  const name = "Modifier Niveau";
  try {
    logRequest(name, { id, data });

    const res = await api.put(`/admin/modifier-niveaux/${id}`, data);

    logResponse(name, res);
    return res.data;

  } catch (error) {
    logError(name, error);
    throw error;
  }
};

export const supprimerNiveau = async (id) => {
  const name = "Supprimer Niveau";
  try {
    logRequest(name, { id });

    const res = await api.delete(`/admin/supprimer-niveaux/${id}`);

    logResponse(name, res);
    return res.data;

  } catch (error) {
    logError(name, error);
    throw error;
  }
};


export const getStatistiqueAdmin = async () => {
  const name = "Statistique dashboard admin";
  try {
    logRequest(name);

    const res = await api.get('/admin/donnee-dashboard');

    logResponse(name, res);
    return res.data;

  } catch (error) {
    logError(name, error);
    throw error;
  }
};

// ─────────────────────────────────────────────
// ADMINS
// ─────────────────────────────────────────────
export const getAdmins = async () => {
  const name = "Liste admins";
  try {
    logRequest(name);
    const res = await api.get('/admin/liste-admin');
    logResponse(name, res);
    return res.data;
  } catch (error) {
    logError(name, error);
    throw error;
  }
};

export const creerAdmin = async (data) => {
  const name = "Créer admin";
  try {
    logRequest(name, data);
    const res = await api.post('/admin/ajout-admin', data);
    logResponse(name, res);
    return res.data;
  } catch (error) {
    logError(name, error);
    throw error;
  }
};

export const modifierAdmin = async (id, data) => {
  const name = "Modifier admin";
  try {
    logRequest(name, { id, data });
    const res = await api.put(`/admin/modifier-admin/${id}`, data);
    logResponse(name, res);
    return res.data;
  } catch (error) {
    logError(name, error);
    throw error;
  }
};

export const activerAdmin = async (id) => {
  const name = "Activer admin";
  try {
    logRequest(name, { id });
    const res = await api.put(`/admin/activer-admin/${id}`);
    logResponse(name, res);
    return res.data;
  } catch (error) {
    logError(name, error);
    throw error;
  }
};

export const desactiverAdmin = async (id) => {
  const name = "Désactiver admin";
  try {
    logRequest(name, { id });
    const res = await api.put(`/admin/desactiver-admin/${id}`);
    logResponse(name, res);
    return res.data;
  } catch (error) {
    logError(name, error);
    throw error;
  }
};

// ─────────────────────────────────────────────
// PERMISSIONS
// ─────────────────────────────────────────────
export const getPermissions = async () => {
  const name = "Liste permissions";
  try {
    logRequest(name);
    const res = await api.get('/admin/liste-permissions');
    logResponse(name, res);
    return res.data;
  } catch (error) {
    logError(name, error);
    throw error;
  }
};

export const creerPermission = async (data) => {
  const name = "Créer permission";
  try {
    logRequest(name, data);
    const res = await api.post('/admin/ajout-permission', data);
    logResponse(name, res);
    return res.data;
  } catch (error) {
    logError(name, error);
    throw error;
  }
};

export const modifierPermission = async (id, data) => {
  const name = "Modifier permission";
  try {
    logRequest(name, { id, data });
    const res = await api.put(`/admin/modifier-permission/${id}`, data);
    logResponse(name, res);
    return res.data;
  } catch (error) {
    logError(name, error);
    throw error;
  }
};

export const supprimerPermission = async (id) => {
  const name = "Supprimer permission";
  try {
    logRequest(name, { id });
    const res = await api.delete(`/admin/supprimer-permission/${id}`);
    logResponse(name, res);
    return res.data;
  } catch (error) {
    logError(name, error);
    throw error;
  }
};