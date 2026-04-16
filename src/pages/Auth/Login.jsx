import React, { useState } from 'react';
import { login } from '../../services/auth.service';
import { useNavigate, Link } from 'react-router-dom';
import '../../assets/css/login/Login.css';

export default function Login() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [showPass, setShowPass] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Ne pas effacer l'erreur immédiatement — on la garde
    // jusqu'à ce qu'une nouvelle tentative soit en cours
    setError('');
    setLoading(true);

    if (!email.trim() || !password) {
      setError('Veuillez remplir tous les champs.');
      setLoading(false);
      return;
    }

    try {
      await login({ email: email.trim(), mot_de_passe: password });
      navigate('/pharmaPack/admin/dashboard');
    } catch (err) {
  const message = typeof err === 'string'
    ? err
    : err?.message || 'Une erreur est survenue';

  setError(message);

  setTimeout(() => {
    setError('');
  }, 8000);
} finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="form-header">
          <p className="form-eyebrow">Espace administrateur</p>
          <h2 className="form-title">
            Bon retour,<br/>
            <span>connectez-vous</span>
          </h2>
          <p className="form-desc">Entrez vos identifiants pour accéder au tableau de bord.</p>
        </div>

        {/* ✅ Le banner persiste tant que error n'est pas vide */}
        {error && (
          <div className="error-banner">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        {/* ✅ onSubmit sur le form, pas de action="", pas de méthode GET */}
        <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(e);
            }}
            noValidate
          >
          <div className="field-group">

            {/* Email */}
            <div className="field">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <input
                  id="email"
                  type="email"
                  placeholder="admin@pharmacie.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div className="field">
              <label htmlFor="password">Mot de passe</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  autoComplete="current-password"
                  style={{ paddingRight: '42px' }}
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPass(v => !v)}
                  aria-label={showPass ? 'Masquer' : 'Afficher'}
                >
                  {showPass ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="field-row">
            <Link to="/forgot-password" className="forgot-link">
              Mot de passe oublié ?
            </Link>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? (
              <><div className="spinner" /> Connexion…</>
            ) : (
              <>
                Se connecter
                <svg className="btn-arrow" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}