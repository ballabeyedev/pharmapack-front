import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../services/auth.service';
import '../../assets/css/login/ForgotPassword.css'; // réutilise le même CSS
import '../../assets/css/login/ResetPassword.css';  // styles spécifiques

export default function ResetPassword() {
  const { token }                         = useParams();
  const navigate                          = useNavigate();

  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew,         setShowNew]         = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState('');
  const [success,         setSuccess]         = useState(false);

  /* Vérifie qu'un token est présent dans l'URL */
  useEffect(() => {
    if (!token) {
      setError('Lien invalide ou expiré. Veuillez refaire une demande.');
    }
  }, [token]);

  /* Indicateur de force du mot de passe */
  const getStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8)              score++;
    if (/[A-Z]/.test(pwd))            score++;
    if (/[0-9]/.test(pwd))            score++;
    if (/[^A-Za-z0-9]/.test(pwd))     score++;
    return score; // 0-4
  };

  const strength      = getStrength(newPassword);
  const strengthLabel = ['', 'Faible', 'Moyen', 'Bon', 'Fort'][strength];
  const strengthColor = ['#e5e7eb', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'][strength];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!newPassword.trim()) {
      setError('Veuillez saisir un nouveau mot de passe.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err) {
      const msg = err?.response?.data?.message;
      setError(msg || 'Lien expiré ou invalide. Veuillez refaire une demande.');
    } finally {
      setLoading(false);
    }
  };

  /* Icône œil pour afficher/masquer */
  const EyeIcon = ({ visible }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      {visible ? (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </>
      ) : (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </>
      )}
    </svg>
  );

  return (
    <div className="fp-page">
      <div className="fp-card">

        {/* Icône décorative */}
        <div className="fp-icon-wrap">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>

        {!success ? (
          <>
            <div className="fp-header">
              <p className="fp-eyebrow">Nouveau mot de passe</p>
              <h2 className="fp-title">Réinitialiser<br/><span>votre accès</span></h2>
              <p className="fp-desc">
                Choisissez un mot de passe sécurisé d'au moins 8 caractères.
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

              {/* Nouveau mot de passe */}
              <div className="fp-field">
                <label htmlFor="newPassword">Nouveau mot de passe</label>
                <div className="fp-input-wrapper">
                  <span className="fp-input-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input
                    id="newPassword"
                    type={showNew ? 'text' : 'password'}
                    placeholder="Min. 8 caractères"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    className="rp-input-padded-right"
                  />
                  <button
                    type="button"
                    className="rp-eye-btn"
                    onClick={() => setShowNew(v => !v)}
                    tabIndex={-1}
                  >
                    <EyeIcon visible={showNew} />
                  </button>
                </div>

                {/* Barre de force */}
                {newPassword.length > 0 && (
                  <div className="rp-strength">
                    <div className="rp-strength-bar">
                      {[1, 2, 3, 4].map(i => (
                        <div
                          key={i}
                          className="rp-strength-segment"
                          style={{ background: i <= strength ? strengthColor : '#e5e7eb' }}
                        />
                      ))}
                    </div>
                    <span className="rp-strength-label" style={{ color: strengthColor }}>
                      {strengthLabel}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirmation */}
              <div className="fp-field">
                <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                <div className="fp-input-wrapper">
                  <span className="fp-input-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  </span>
                  <input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Répétez le mot de passe"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    className="rp-input-padded-right"
                  />
                  <button
                    type="button"
                    className="rp-eye-btn"
                    onClick={() => setShowConfirm(v => !v)}
                    tabIndex={-1}
                  >
                    <EyeIcon visible={showConfirm} />
                  </button>
                </div>

                {/* Indicateur de correspondance */}
                {confirmPassword.length > 0 && (
                  <p className="rp-match-hint" style={{ color: newPassword === confirmPassword ? '#10b981' : '#ef4444' }}>
                    {newPassword === confirmPassword ? '✓ Les mots de passe correspondent' : '✗ Les mots de passe ne correspondent pas'}
                  </p>
                )}
              </div>

              <button type="submit" className="fp-btn-submit" disabled={loading || !token}>
                {loading ? (
                  <><div className="fp-spinner" /> Mise à jour…</>
                ) : (
                  <>
                    Réinitialiser le mot de passe
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
          /* ── Succès ── */
          <div className="fp-success">
            <div className="fp-success-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h3 className="fp-success-title">Mot de passe mis à jour !</h3>
            <p className="fp-success-desc">
              Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="fp-btn-submit"
              style={{ marginTop: '8px' }}
            >
              Aller à la connexion
              <svg className="fp-btn-arrow" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
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