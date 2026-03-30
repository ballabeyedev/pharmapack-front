import React, { useState } from 'react';
import { login } from '../../services/auth.service';
import { useNavigate, Link } from 'react-router-dom';


const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --green-deep: #0d5c3a;
    --green-mid: #1a7d52;
    --green-bright: #22a96b;
    --green-pale: #f0faf5;
    --white: #ffffff;
    --text-dark: #0a2e1e;
    --text-muted: #5a8a72;
    --border: #b8dece;
  }

  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--green-pale);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
  }

  .login-page {
    min-height: 100vh;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--green-pale);
    padding: 16px;
  }

  .login-card {
    width: 100%;
    max-width: 460px;
    background: var(--white);
    border-radius: 24px;
    padding: 48px 44px;
    box-shadow: 0 24px 64px rgba(13, 92, 58, 0.14), 0 6px 20px rgba(13, 92, 58, 0.08);
    animation: fadeUp 0.55s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .form-header { margin-bottom: 32px; }

  .form-eyebrow {
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--green-bright);
    margin-bottom: 10px;
  }

  .form-title {
    font-family: 'DM Serif Display', serif;
    font-size: 1.9rem;
    color: var(--text-dark);
    line-height: 1.15;
  }

  .form-title span { color: var(--green-mid); }

  .form-desc {
    margin-top: 8px;
    font-size: 0.87rem;
    color: var(--text-muted);
    font-weight: 300;
  }

  .field-group {
    display: flex;
    flex-direction: column;
    gap: 18px;
    margin-bottom: 22px;
  }

  .field { display: flex; flex-direction: column; gap: 6px; }

  .field label {
    font-size: 0.76rem;
    font-weight: 600;
    color: var(--text-dark);
    letter-spacing: 0.04em;
  }

  .input-wrapper { position: relative; }

  .input-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
    pointer-events: none;
    display: flex;
  }

  .input-wrapper input {
    width: 100%;
    padding: 13px 14px 13px 42px;
    border: 1.5px solid var(--border);
    border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.92rem;
    color: var(--text-dark);
    background: var(--green-pale);
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    outline: none;
  }

  .input-wrapper input::placeholder { color: #9cbdaf; font-weight: 300; }

  .input-wrapper input:focus {
    border-color: var(--green-bright);
    background: var(--white);
    box-shadow: 0 0 0 4px rgba(34, 169, 107, 0.12);
  }

  .eye-btn {
    position: absolute;
    right: 13px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-muted);
    display: flex;
    padding: 0;
  }

  .field-row {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-bottom: 26px;
    flex-wrap: wrap;
    gap: 8px;
  }

  .forgot-link {
    font-size: 0.82rem;
    color: var(--green-mid);
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
  }

  .forgot-link:hover { color: var(--green-deep); text-decoration: underline; }

  .btn-submit {
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, var(--green-mid) 0%, var(--green-bright) 100%);
    color: var(--white);
    border: none;
    border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.95rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.2s, opacity 0.2s;
    box-shadow: 0 6px 20px rgba(26, 125, 82, 0.28);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }

  .btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(26, 125, 82, 0.36); }
  .btn-submit:active:not(:disabled) { transform: translateY(0); opacity: 0.9; }
  .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

  .btn-arrow { transition: transform 0.2s; }
  .btn-submit:hover .btn-arrow { transform: translateX(4px); }

  .error-banner {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 10px;
    padding: 11px 14px;
    font-size: 0.83rem;
    color: #b91c1c;
    margin-bottom: 18px;
    display: flex;
    align-items: center;
    gap: 8px;
    animation: shake 0.35s ease;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-6px); }
    60% { transform: translateX(6px); }
  }

  .spinner {
    width: 17px;
    height: 17px;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 480px) {
    .login-card { padding: 36px 24px; border-radius: 20px; }
    .form-title { font-size: 1.6rem; }
  }

  @media (max-width: 360px) {
    .login-card { padding: 28px 18px; }
  }
`;

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [showPass, setShowPass] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    setLoading(true);

    try {
      // ✅ On passe bien un objet { email, mot_de_passe } comme attendu par l'API
      await login({ email: email.trim(), mot_de_passe: password });
      navigate('/pharmaPack/admin/dashboard');
    } catch (err) {
      // err est déjà une string grâce à handleApiError
      setError(typeof err === 'string' ? err : 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>

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

          <form onSubmit={handleSubmit}>
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
                    onChange={e => setEmail(e.target.value)}
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
                    onChange={e => setPassword(e.target.value)}
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
    </>
  );
}