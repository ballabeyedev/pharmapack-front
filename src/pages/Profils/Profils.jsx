import { useState, useCallback } from 'react';
import { C } from '../../components/Constant';
import { getUser } from '../../services/auth.service';
import { modifierProfil } from '../../services/admin.service'; // adapte si besoin

export default function ProfilPage() {
  const user = getUser(); // { id, nom, prenom, email, telephone, role, ville, photoProfil, createdAt, ... }

  const [editing, setEditing]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [toast,   setToast]     = useState(null);

  const [form, setForm] = useState({
    nom:       user?.nom       || '',
    prenom:    user?.prenom    || '',
    email:     user?.email     || '',
    telephone: user?.telephone || '',
    ville:     user?.ville     || '',
  });

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      await modifierProfil(form);
      setEditing(false);
      showToast('Profil mis à jour avec succès ✓');
    } catch (err) {
      showToast(err?.response?.data?.message || 'Erreur lors de la mise à jour', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm({
      nom:       user?.nom       || '',
      prenom:    user?.prenom    || '',
      email:     user?.email     || '',
      telephone: user?.telephone || '',
      ville:     user?.ville     || '',
    });
    setEditing(false);
  };

  const initiales = `${user?.prenom?.[0] || ''}${user?.nom?.[0] || 'U'}`.toUpperCase();

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
  };

  const fields = [
    { key: 'prenom',    label: 'Prénom',    type: 'text'  },
    { key: 'nom',       label: 'Nom',       type: 'text'  },
    { key: 'email',     label: 'Email',     type: 'email' },
    { key: 'telephone', label: 'Téléphone', type: 'tel'   },
    { key: 'ville',     label: 'Ville',     type: 'text'  },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px',
      fontFamily: 'DM Sans, sans-serif' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: 'fixed', top: '80px', right: '24px', zIndex: 999,
          background: toast.type === 'error' ? '#dc2626' : C.greenMid,
          color: '#fff', padding: '12px 20px', borderRadius: '12px',
          fontSize: '0.88rem', fontWeight: 600,
          boxShadow: '0 8px 24px rgba(26,125,82,0.35)',
          animation: 'fadeUp 0.3s ease',
        }}>
          {toast.msg}
        </div>
      )}

      {/* ── Hero ── */}
      <div style={{
        background: `linear-gradient(135deg, ${C.greenDeep} 0%, ${C.greenMid} 60%, ${C.greenBright} 100%)`,
        borderRadius: '20px', padding: '32px',
        display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap',
      }}>
        {/* Avatar */}
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)',
          border: '3px solid rgba(255,255,255,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', flexShrink: 0,
        }}>
          {user?.photoProfil ? (
            <img src={user.photoProfil} alt="avatar"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '1.7rem', fontWeight: 700, color: '#fff' }}>
              {initiales}
            </span>
          )}
        </div>

        {/* Infos */}
        <div style={{ flex: 1 }}>
          <h2 style={{ color: '#fff', fontFamily: 'Georgia,serif',
            fontSize: '1.4rem', fontWeight: 700, marginBottom: '4px' }}>
            {user?.prenom} {user?.nom}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.88rem' }}>
            {user?.role || '—'}
            {user?.ville ? ` · ${user.ville}` : ''}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', marginTop: '2px' }}>
            {user?.email || '—'}
          </p>
          {user?.createdAt && (
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.76rem', marginTop: '4px' }}>
              Membre depuis le {formatDate(user.createdAt)}
            </p>
          )}
        </div>

        <button
          onClick={() => editing ? handleCancel() : setEditing(true)}
          style={{
            padding: '10px 20px',
            background: 'rgba(255,255,255,0.18)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '12px', color: '#fff',
            fontWeight: 600, fontSize: '0.85rem',
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
          {editing ? '✕ Annuler' : '✎ Modifier'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>

        {/* ── Formulaire ── */}
        <div style={{
          background: '#fff', borderRadius: '16px', padding: '24px',
          boxShadow: '0 2px 12px rgba(13,92,58,0.07)',
          border: `1px solid ${C.border}`,
        }}>
          <h3 style={{ fontFamily: 'Georgia,serif', fontWeight: 700,
            color: C.textDark, marginBottom: '20px', fontSize: '1rem' }}>
            {editing ? '✎ Modifier le profil' : 'Informations du compte'}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {fields.map(({ key, label, type }) => (
              <div key={key}>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, color: C.textMuted,
                  textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '5px' }}>
                  {label}
                </p>
                {editing ? (
                  <input
                    type={type}
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{
                      width: '100%', padding: '10px 12px',
                      border: `1.5px solid ${C.border}`, borderRadius: '10px',
                      fontSize: '0.88rem', color: C.textDark,
                      background: C.greenPale, outline: 'none',
                      boxSizing: 'border-box', fontFamily: 'inherit',
                      transition: 'border-color 0.15s',
                    }}
                    onFocus={e => e.target.style.borderColor = C.greenMid}
                    onBlur={e => e.target.style.borderColor = C.border}
                  />
                ) : (
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, color: C.textDark,
                    padding: '10px 12px', background: C.greenPale, borderRadius: '10px' }}>
                    {form[key] || '—'}
                  </p>
                )}
              </div>
            ))}

            {/* Rôle — lecture seule toujours */}
            <div>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, color: C.textMuted,
                textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '5px' }}>
                Rôle
              </p>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: C.greenDeep,
                padding: '10px 12px', background: C.greenPale, borderRadius: '10px',
                display: 'flex', alignItems: 'center', gap: '7px' }}>
                🛡 {user?.role || '—'}
              </p>
            </div>

            {editing && (
              <button
                onClick={handleSave}
                disabled={loading}
                style={{
                  marginTop: '4px', padding: '12px',
                  background: loading ? '#9ca3af'
                    : `linear-gradient(135deg,${C.greenMid},${C.greenBright})`,
                  border: 'none', borderRadius: '12px',
                  color: '#fff', fontWeight: 700, fontSize: '0.9rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  boxShadow: loading ? 'none' : '0 4px 14px rgba(26,125,82,0.28)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  transition: 'all 0.15s',
                }}>
                {loading ? (
                  <>
                    <span style={{
                      display: 'inline-block', width: '15px', height: '15px',
                      border: '2px solid rgba(255,255,255,0.4)',
                      borderTopColor: '#fff', borderRadius: '50%',
                      animation: 'spin 0.7s linear infinite',
                    }} />
                    Enregistrement…
                  </>
                ) : '✓ Enregistrer les modifications'}
              </button>
            )}
          </div>
        </div>

        {/* ── Colonne droite ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Infos compte (lecture seule DB) */}
          <div style={{
            background: '#fff', borderRadius: '16px', padding: '24px',
            boxShadow: '0 2px 12px rgba(13,92,58,0.07)', border: `1px solid ${C.border}`,
          }}>
            <h3 style={{ fontFamily: 'Georgia,serif', fontWeight: 700,
              color: C.textDark, marginBottom: '16px', fontSize: '1rem' }}>
              Détails du compte
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {[
                { label: 'Identifiant', value: user?.id?.slice(0, 8).toUpperCase() || '—', mono: true },
                { label: 'Rôle',        value: user?.role || '—' },
                { label: 'Téléphone',   value: user?.telephone || '—' },
                { label: 'Ville',       value: user?.ville || '—' },
                { label: 'Membre depuis', value: formatDate(user?.createdAt) },
              ].map(({ label, value, mono }, i, arr) => (
                <div key={label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '11px 0',
                  borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : 'none',
                }}>
                  <span style={{ fontSize: '0.76rem', color: C.textMuted,
                    fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {label}
                  </span>
                  <span style={{
                    fontSize: '0.86rem', fontWeight: 600, color: C.textDark,
                    ...(mono ? {
                      fontFamily: 'monospace',
                      background: '#f3f4f6', color: '#6b7280',
                      padding: '3px 9px', borderRadius: '7px',
                    } : {}),
                  }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sécurité */}
          <div style={{
            background: '#fff', borderRadius: '16px', padding: '24px',
            boxShadow: '0 2px 12px rgba(13,92,58,0.07)', border: `1px solid ${C.border}`,
          }}>
            <h3 style={{ fontFamily: 'Georgia,serif', fontWeight: 700,
              color: C.textDark, marginBottom: '16px', fontSize: '1rem' }}>
              Sécurité
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 14px', background: C.greenPale, border: 'none',
                borderRadius: '12px', cursor: 'pointer', textAlign: 'left',
                fontFamily: 'inherit', transition: 'background 0.15s',
              }}
              onMouseOver={e => e.currentTarget.style.background = '#bbf7d0'}
              onMouseOut={e => e.currentTarget.style.background = C.greenPale}>
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: C.textDark }}>🔒 Changer le mot de passe</p>
                  <p style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '2px' }}>Mettre à jour votre mot de passe</p>
                </div>
                <span style={{ color: C.textMuted, fontSize: '1.1rem' }}>›</span>
              </button>

              <button style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 14px', background: '#fef2f2', border: 'none',
                borderRadius: '12px', cursor: 'pointer', textAlign: 'left',
                fontFamily: 'inherit', transition: 'background 0.15s',
              }}
              onMouseOver={e => e.currentTarget.style.background = '#fee2e2'}
              onMouseOut={e => e.currentTarget.style.background = '#fef2f2'}>
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#dc2626' }}>🚪 Déconnexion</p>
                  <p style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '2px' }}>Terminer la session en cours</p>
                </div>
                <span style={{ color: '#dc2626', fontSize: '1.1rem' }}>›</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}