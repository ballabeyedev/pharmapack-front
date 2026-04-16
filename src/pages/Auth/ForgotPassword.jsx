import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { passwordOublie } from '../../services/auth.service';
import '../../assets/css/login/ForgotPassword.css';

export default function ForgotPassword() {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Veuillez entrer votre adresse email.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Veuillez entrer une adresse email valide.');
      return;
    }

    setLoading(true);
    try {
      await passwordOublie(email.trim());
      setSuccess(true);
    } catch (err) {
      const msg = err?.response?.data?.message;
      setError(msg || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fp-page">
      <div className="fp-card">

        <div className="fp-icon-wrap">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>

        {!success ? (
          <>
            <div className="fp-header">
              <p className="fp-eyebrow">Récupération de compte</p>
              <h2 className="fp-title">Mot de passe<br/><span>oublié ?</span></h2>
              <p className="fp-desc">
                Saisissez l'adresse email associée à votre compte. Nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>
            </div>

            {error && (
              <div className="fp-error-banner">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="fp-field">
                <label htmlFor="email">Adresse email</label>
                <div className="fp-input-wrapper">
                  <span className="fp-input-icon">
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
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
              </div>

              <button type="submit" className="fp-btn-submit" disabled={loading}>
                {loading ? (
                  <><div className="fp-spinner" /> Envoi en cours…</>
                ) : (
                  <>
                    Envoyer le lien
                    <svg className="fp-btn-arrow" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                      <polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="fp-success">
            <div className="fp-success-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h3 className="fp-success-title">Email envoyé !</h3>
            <p className="fp-success-desc">
              Un lien de réinitialisation a été envoyé à <strong>{email}</strong>. Vérifiez votre boîte de réception.
            </p>
          </div>
        )}

        <div className="fp-back">
          <Link to="/login" className="fp-back-link">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Retour à la connexion
          </Link>
        </div>

      </div>
    </div>
  );
}