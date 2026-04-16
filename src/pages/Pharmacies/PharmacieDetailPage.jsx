import { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { C } from '../../components/Constant';
import {
  getPharmacieById,
  validerPharmacie,
  rejeterPharmacie,
} from '../../services/admin.service';

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
const Icon = ({ d, size = 16, stroke = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={stroke} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const STATUT_CFG = {
  actif:      { bg: '#d1fae5', color: '#065f46', label: 'Actif'      },
  inactif:    { bg: '#fee2e2', color: '#991b1b', label: 'Inactif'    },
  en_attente: { bg: '#fef3c7', color: '#92400e', label: 'En attente' },
};

const StatutBadge = ({ statut }) => {
  const c = STATUT_CFG[statut] || { bg: '#f3f4f6', color: '#374151', label: statut };
  return (
    <span style={{
      background: c.bg, color: c.color, padding: '4px 14px',
      borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap',
      display: 'inline-flex', alignItems: 'center', gap: '6px',
    }}>
      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: c.color, display: 'inline-block' }} />
      {c.label}
    </span>
  );
};

const Toast = ({ msg, type }) => (
  <div style={{
    position: 'fixed', bottom: '28px', right: '28px', zIndex: 1000,
    background: type === 'error' ? '#dc2626' : C.greenDeep,
    color: '#fff', padding: '12px 22px', borderRadius: '14px',
    fontSize: '0.875rem', fontWeight: 600,
    boxShadow: '0 8px 32px rgba(0,0,0,0.18)', animation: 'fadeUp 0.3s ease both',
  }}>
    {msg}
  </div>
);

const InfoCard = ({ label, value, icon }) => (
  <div style={{
    background: C.greenPale, borderRadius: '12px', padding: '14px 16px',
    display: 'flex', flexDirection: 'column', gap: '4px',
  }}>
    <p style={{ fontSize: '0.68rem', color: C.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'flex', alignItems: 'center', gap: '5px' }}>
      {icon && <span style={{ fontSize: '0.85rem' }}>{icon}</span>}
      {label}
    </p>
    <p style={{ fontSize: '0.9rem', fontWeight: 600, color: C.textDark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      {value || '—'}
    </p>
  </div>
);

/* ─────────────────────────────────────────────
   Modal Confirmation
───────────────────────────────────────────── */
const ConfirmModal = ({ pharmacie, action, onConfirm, onClose, loading }) => {
  const isValider = action === 'valider';
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: '20px', padding: '32px', maxWidth: '420px',
        width: '100%', boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
        animation: 'fadeUp 0.3s ease both', textAlign: 'center',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>{isValider ? '✅' : '⛔'}</div>
        <h3 style={{ fontFamily: 'Georgia,serif', fontSize: '1.1rem', fontWeight: 700, color: C.textDark, marginBottom: '8px' }}>
          {isValider ? 'Valider la pharmacie ?' : 'Rejeter la pharmacie ?'}
        </h3>
        <p style={{ fontSize: '0.85rem', color: C.textMuted, marginBottom: '24px' }}>
          {isValider
            ? `La pharmacie « ${pharmacie?.nom_pharmacie} » sera marquée comme active.`
            : `La pharmacie « ${pharmacie?.nom_pharmacie} » sera rejetée et ne pourra plus accéder à la plateforme.`}
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button onClick={onClose}
            style={{ padding: '10px 20px', border: `1.5px solid ${C.border}`, borderRadius: '12px', background: '#fff', color: C.textMuted, fontSize: '0.87rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            Annuler
          </button>
          <button onClick={onConfirm} disabled={loading}
            style={{
              padding: '10px 24px', border: 'none', borderRadius: '12px',
              background: isValider ? C.greenDeep : '#dc2626',
              color: '#fff', fontSize: '0.87rem', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
              opacity: loading ? 0.7 : 1,
            }}>
            {loading ? 'En cours…' : isValider ? 'Confirmer' : 'Rejeter'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Page Détail
───────────────────────────────────────────── */
export default function PharmacieDetailPage() {
  const { id }       = useParams();
  const { state }    = useLocation();
  const navigate     = useNavigate();

  const [pharmacie,     setPharmacie]     = useState(state?.pharmacie || null);
  const [loading,       setLoading]       = useState(!state?.pharmacie);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirm,       setConfirm]       = useState(null);
  const [toast,         setToast]         = useState(null);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }, []);

  /* Charger depuis l'API si pas de state */
  useEffect(() => {
    if (!pharmacie) {
      setLoading(true);
      getPharmacieById(id)
        .then(data => setPharmacie(data.pharmacie || data))
        .catch(() => showToast('Impossible de charger la pharmacie', 'error'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleConfirmAction = async () => {
    if (!confirm) return;
    const { action } = confirm;
    try {
      setActionLoading(true);
      if (action === 'valider') {
        await validerPharmacie(id);
        showToast(`Pharmacie validée avec succès`);
        // Mettre à jour le statut local
        setPharmacie(prev => ({
          ...prev,
          pharmacien: { ...prev.pharmacien, statut: 'actif' },
        }));
      } else {
        await rejeterPharmacie(id);
        showToast(`Pharmacie rejetée`, 'error');
        setPharmacie(prev => ({
          ...prev,
          pharmacien: { ...prev.pharmacien, statut: 'inactif' },
        }));
      }
      setConfirm(null);
    } catch {
      showToast('Une erreur est survenue', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const u            = pharmacie?.pharmacien || {};
  const nomComplet   = `${u.prenom || ''} ${u.nom || ''}`.trim() || '—';
  const isEnAttente  = u.statut === 'en_attente';

  /* ── Skeleton ── */
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'DM Sans, sans-serif' }}>
        <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
        {[240, 120, 320].map((h, i) => (
          <div key={i} style={{
            height: `${h}px`, borderRadius: '20px',
            background: 'linear-gradient(90deg,#f0faf5 25%,#e0f2ec 50%,#f0faf5 75%)',
            backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite',
          }} />
        ))}
      </div>
    );
  }

  if (!pharmacie) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'DM Sans, sans-serif' }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* ── Breadcrumb / Retour ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button onClick={() => navigate(-1)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', border: `1.5px solid ${C.border}`, borderRadius: '10px', background: '#fff', color: C.textMuted, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          <Icon d="M19 12H5M12 5l-7 7 7 7" size={14} />
          Retour
        </button>
        <span style={{ fontSize: '0.8rem', color: C.textMuted }}>
          Pharmacies › <strong style={{ color: C.textDark }}>{pharmacie.nom_pharmacie}</strong>
        </span>
      </div>

      {/* ── Hero card ── */}
      <div style={{
        background: '#fff', borderRadius: '24px', padding: '32px',
        border: `1px solid ${C.border}`, boxShadow: '0 4px 20px rgba(13,92,58,0.07)',
        animation: 'fadeUp 0.35s ease both',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>
          {/* Logo / Initiale */}
          <div style={{
            width: '80px', height: '80px', flexShrink: 0,
            background: `linear-gradient(135deg,${C.greenMid},${C.greenBright})`,
            borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 4px 16px ${C.greenMid}44`,
          }}>
            {pharmacie.logo
              ? <img src={pharmacie.logo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px' }} />
              : <span style={{ color: '#fff', fontWeight: 900, fontSize: '2rem' }}>{(pharmacie.nom_pharmacie || '?')[0].toUpperCase()}</span>
            }
          </div>

          {/* Infos principales */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '6px' }}>
              <h1 style={{ fontFamily: 'Georgia,serif', fontSize: '1.4rem', fontWeight: 700, color: C.textDark, margin: 0 }}>
                {pharmacie.nom_pharmacie || '—'}
              </h1>
              <StatutBadge statut={u.statut} />
            </div>
            <p style={{ fontSize: '0.88rem', color: C.textMuted, margin: 0 }}>
              📍 {[pharmacie.adresse_pharmacie, pharmacie.ville_pharmacie].filter(Boolean).join(', ') || '—'}
            </p>
            {pharmacie.created_at && (
              <p style={{ fontSize: '0.76rem', color: '#9ca3af', marginTop: '6px' }}>
                Inscrit le {new Date(pharmacie.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>

          {/* Boutons d'action (si en attente) */}
          {isEnAttente && (
            <div style={{ display: 'flex', gap: '10px', flexShrink: 0, marginLeft: 'auto' }}>
              <button onClick={() => setConfirm({ pharmacie, action: 'valider' })}
                style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 20px', border: 'none', borderRadius: '12px', background: '#d1fae5', color: '#065f46', fontWeight: 700, fontSize: '0.87rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                <Icon d="M20 6L9 17l-5-5" size={14} stroke="#065f46" />
                Valider
              </button>
              <button onClick={() => setConfirm({ pharmacie, action: 'rejeter' })}
                style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 20px', border: 'none', borderRadius: '12px', background: '#fee2e2', color: '#991b1b', fontWeight: 700, fontSize: '0.87rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                <Icon d="M18 6L6 18M6 6l12 12" size={14} stroke="#991b1b" />
                Rejeter
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Grille d'infos ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', animation: 'fadeUp 0.4s ease 0.05s both' }}>

        {/* Section Pharmacie */}
        <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', border: `1px solid ${C.border}`, boxShadow: '0 2px 10px rgba(13,92,58,0.05)' }}>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '0.95rem', fontWeight: 700, color: C.textDark, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🏪 Informations pharmacie
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <InfoCard label="Nom"       value={pharmacie.nom_pharmacie}       icon="🏷️" />
            <InfoCard label="Téléphone" value={pharmacie.telephone_pharmacie} icon="📞" />
            <InfoCard label="Ville"     value={pharmacie.ville_pharmacie}     icon="🏙️" />
            <InfoCard label="Adresse"   value={pharmacie.adresse_pharmacie}   icon="📍" />
          </div>
        </div>

        {/* Section Responsable */}
        <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', border: `1px solid ${C.border}`, boxShadow: '0 2px 10px rgba(13,92,58,0.05)' }}>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '0.95rem', fontWeight: 700, color: C.textDark, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            👤 Responsable
          </h2>

          {/* Avatar + nom */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', padding: '12px', background: C.greenPale, borderRadius: '12px' }}>
            <div style={{
              width: '46px', height: '46px', borderRadius: '50%', flexShrink: 0,
              background: `linear-gradient(135deg,${C.greenMid},${C.greenBright})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 800, fontSize: '1rem',
            }}>
              {nomComplet !== '—' ? nomComplet[0].toUpperCase() : '?'}
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', color: C.textDark, margin: 0 }}>{nomComplet}</p>
              <StatutBadge statut={u.statut} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <InfoCard label="Email"     value={u.email}     icon="✉️" />
            <InfoCard label="Téléphone" value={u.telephone} icon="📱" />
          </div>
        </div>
      </div>

      {/* ── Modals & Toast ── */}
      {confirm && (
        <ConfirmModal
          pharmacie={confirm.pharmacie}
          action={confirm.action}
          onConfirm={handleConfirmAction}
          onClose={() => setConfirm(null)}
          loading={actionLoading}
        />
      )}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}