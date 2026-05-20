import { useState, useEffect, useCallback } from 'react';
import { C } from '../../components/Constant';
import { getConversions, validerConversion, rejeterConversion } from '../../services/admin.service';

const fmt = (n) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n ?? 0);

const statusMap = {
  en_attente: { bg: '#fef3c7', color: '#92400e', label: 'En attente' },
  valide: { bg: '#d1fae5', color: '#065f46', label: 'Validé' },
  rejete: { bg: '#fee2e2', color: '#991b1b', label: 'Rejeté' },
};

const Icon = ({ d, size = 18, stroke = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke}
    strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const Badge = ({ status }) => {
  const c = statusMap[status] || { bg: '#f3f4f6', color: '#374151', label: status };
  return (
    <span style={{
      background: c.bg, color: c.color, padding: '4px 12px',
      borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600, whiteSpace: 'nowrap',
      display: 'inline-flex', alignItems: 'center', gap: '5px'
    }}>
      <span style={{
        width: '6px', height: '6px', borderRadius: '50%',
        background: c.color, display: 'inline-block'
      }} />
      {c.label}
    </span>
  );
};

const Toast = ({ msg, type }) => (
  <div style={{
    position: 'fixed', bottom: '28px', right: '28px', zIndex: 1000,
    background: type === 'error' ? '#dc2626' : C.greenDeep,
    color: '#fff', padding: '12px 22px', borderRadius: '14px',
    fontSize: '0.875rem', fontWeight: 600, boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
    animation: 'fadeUp 0.3s ease both'
  }}>
    {msg}
  </div>
);

const Skeleton = () => (
  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
    {[1, 2, 3, 4].map(i => (
      <div key={i} style={{
        height: '52px', borderRadius: '10px',
        background: 'linear-gradient(90deg,#f0faf5 25%,#e0f2ec 50%,#f0faf5 75%)',
        backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite'
      }} />
    ))}
    <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
  </div>
);

export default function ConversionsPage() {
  const [conversions, setConversions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterStatut, setFilterStatut] = useState('all');
  const [toast, setToast] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [motifReject, setMotifReject] = useState('');

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getConversions();
      setConversions(data.conversions || []);
    } catch (err) {
      showToast('Erreur lors du chargement des demandes de conversion', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const handleApprove = async (id) => {
    if (!window.confirm('Voulez-vous vraiment valider cette demande de conversion ?')) return;
    try {
      const res = await validerConversion(id);
      if (res.success) {
        showToast('Demande de conversion validée avec succès !');
        load();
      } else {
        showToast(res.message || 'Erreur lors de la validation', 'error');
      }
    } catch (err) {
      showToast('Erreur de connexion', 'error');
    }
  };

  const handleReject = async () => {
    if (!motifReject.trim()) {
      alert('Veuillez spécifier un motif de rejet');
      return;
    }
    try {
      const res = await rejeterConversion(rejectingId, motifReject);
      if (res.success) {
        showToast('Demande de conversion rejetée et solde remboursé.');
        setRejectingId(null);
        setMotifReject('');
        load();
      } else {
        showToast(res.message || 'Erreur lors du rejet', 'error');
      }
    } catch (err) {
      showToast('Erreur de connexion', 'error');
    }
  };

  const filtered = conversions.filter(c => {
    const matchT = filterType === 'all' || c.type_conversion === filterType;
    const matchS = filterStatut === 'all' || c.statut === filterStatut;
    return matchT && matchS;
  });

  // KPIs
  const totalConversions = conversions.length;
  const pendingCount = conversions.filter(c => c.statut === 'en_attente').length;
  const approvedTotal = conversions.filter(c => c.statut === 'valide').reduce((s, c) => s + Number(c.montant), 0);
  const rejectedCount = conversions.filter(c => c.statut === 'rejete').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'DM Sans, sans-serif' }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .td-style { padding: 13px 16px; font-size: 0.875rem; color: ${C.textDark}; vertical-align: middle; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '1.25rem', fontWeight: 700, color: C.textDark, marginBottom: '3px' }}>
            Demandes de Conversion d'Avantages
          </h2>
          <p style={{ fontSize: '0.8rem', color: C.textMuted }}>
            {loading ? 'Chargement...' : `${conversions.length} demande(s) de conversion enregistrée(s)`}
          </p>
        </div>
        <button onClick={load}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px',
            border: `1.5px solid ${C.border}`, borderRadius: '12px',
            background: '#fff', color: C.textMuted, fontSize: '0.85rem',
            cursor: 'pointer', fontFamily: 'inherit'
          }}>
          <Icon d="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15" size={14} />
          Actualiser
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
        {[
          { label: 'Demandes totales', val: `${totalConversions}`, color: '#7c3aed', icon: '📥' },
          { label: 'En attente validation', val: `${pendingCount}`, color: '#d97706', icon: '⏳' },
          { label: 'Total converti validé', val: fmt(approvedTotal), color: C.greenMid, icon: '✅' },
          { label: 'Demandes rejetées', val: `${rejectedCount}`, color: '#dc2626', icon: '❌' },
        ].map(({ label, val, color, icon }, idx) => (
          <div key={label} style={{
            background: '#fff', borderRadius: '16px', padding: '20px',
            boxShadow: '0 2px 10px rgba(13,92,58,0.07)', borderTop: `3px solid ${color}`,
            animation: `fadeUp 0.3s ease ${idx * 0.06}s both`
          }}>
            <p style={{ fontSize: '1.5rem', marginBottom: '6px' }}>{icon}</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 800, color }}>{loading ? '—' : val}</p>
            <p style={{ fontSize: '0.74rem', color: '#6b7280', marginTop: '2px', fontWeight: 500 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{
        background: '#fff', borderRadius: '16px', padding: '16px 20px',
        border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(13,92,58,0.05)',
        display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center'
      }}>
        <Icon d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" size={16} stroke={C.textMuted} />
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          style={{
            padding: '9px 14px', border: `1.5px solid ${C.border}`, borderRadius: '12px',
            fontSize: '0.85rem', color: C.textDark, background: '#fff',
            cursor: 'pointer', outline: 'none', fontFamily: 'inherit'
          }}>
          <option value="all">Tous les types</option>
          <option value="cash">Cash (Option 3)</option>
          <option value="marchandise">Marchandises (Option 2)</option>
        </select>

        <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)}
          style={{
            padding: '9px 14px', border: `1.5px solid ${C.border}`, borderRadius: '12px',
            fontSize: '0.85rem', color: C.textDark, background: '#fff',
            cursor: 'pointer', outline: 'none', fontFamily: 'inherit'
          }}>
          <option value="all">Tous les statuts</option>
          <option value="en_attente">En attente</option>
          <option value="valide">Validé</option>
          <option value="rejete">Rejeté</option>
        </select>

        {(filterType !== 'all' || filterStatut !== 'all') && (
          <button onClick={() => { setFilterType('all'); setFilterStatut('all'); }}
            style={{
              padding: '8px 14px', border: 'none', borderRadius: '10px',
              background: '#fee2e2', color: '#dc2626', fontSize: '0.78rem',
              fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
            }}>
            ✕ Réinitialiser
          </button>
        )}

        <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: C.textMuted }}>
          {filtered.length} résultat(s)
        </span>
      </div>

      {/* Table */}
      <div style={{
        background: '#fff', borderRadius: '20px',
        border: `1px solid ${C.border}`,
        boxShadow: '0 2px 12px rgba(13,92,58,0.06)', overflow: 'hidden'
      }}>
        {loading ? <Skeleton /> : filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: C.textMuted }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🪙</div>
            <p style={{ fontWeight: 600, marginBottom: '4px' }}>Aucune demande trouvée</p>
            <p style={{ fontSize: '0.82rem' }}>Modifiez vos filtres ou attendez de nouvelles demandes des pharmacies.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
              <thead>
                <tr style={{ background: C.greenPale, borderBottom: `2px solid ${C.border}` }}>
                  {['Pharmacie', 'Type de conversion', 'Montant', 'Date soumission', 'Statut', 'Actions'].map(h => (
                    <th key={h} style={{
                      padding: '13px 16px', textAlign: 'left',
                      fontSize: '0.72rem', fontWeight: 700, color: C.greenDeep,
                      textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap'
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={c.id} style={{
                    borderBottom: `1px solid ${C.border}`,
                    transition: 'background 0.15s', animation: `fadeUp 0.3s ease ${i * 0.03}s both`
                  }}>
                    <td className="td-style">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '34px', height: '34px', borderRadius: '10px',
                          background: C.greenPale, display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: '1rem', flexShrink: 0
                        }}>
                          🏪
                        </div>
                        <div>
                          <span style={{ fontWeight: 600, color: C.textDark, fontSize: '0.88rem', display: 'block' }}>
                            {c.pharmacie?.nomOfficine ?? `Pharmacie #${c.pharmacie_id}`}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: C.textMuted }}>
                            {c.pharmacie?.ville || 'Sénégal'} · {c.pharmacie?.telephone || ''}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="td-style">
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        fontSize: '0.84rem', color: '#374151', fontWeight: 500
                      }}>
                        {c.type_conversion === 'cash' ? '💵 Cash (Option 3)' : '🎁 Marchandise (Option 2)'}
                      </span>
                    </td>
                    <td className="td-style">
                      <span style={{ fontWeight: 800, color: '#7c3aed', fontSize: '0.92rem' }}>
                        {fmt(c.montant)}
                      </span>
                    </td>
                    <td className="td-style">
                      <span style={{ fontSize: '0.8rem', color: C.textMuted }}>
                        {new Date(c.createdAt || c.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </td>
                    <td className="td-style"><Badge status={c.statut} /></td>
                    <td className="td-style">
                      {c.statut === 'en_attente' ? (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => handleApprove(c.id)}
                            style={{
                              padding: '6px 12px', background: C.greenLight,
                              border: 'none', borderRadius: '8px', color: C.greenDeep,
                              fontWeight: 700, fontSize: '0.74rem', cursor: 'pointer',
                              fontFamily: 'inherit', transition: 'all 0.15s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = C.greenBright}
                            onMouseLeave={e => e.currentTarget.style.background = C.greenLight}>
                            Approuver
                          </button>
                          <button onClick={() => setRejectingId(c.id)}
                            style={{
                              padding: '6px 12px', background: '#fee2e2',
                              border: 'none', borderRadius: '8px', color: '#dc2626',
                              fontWeight: 700, fontSize: '0.74rem', cursor: 'pointer',
                              fontFamily: 'inherit', transition: 'all 0.15s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#fca5a5'}
                            onMouseLeave={e => e.currentTarget.style.background = '#fee2e2'}>
                            Rejeter
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: C.textMuted, fontStyle: 'italic' }}>
                          Aucune action
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rejection Modal Overlay */}
      {rejectingId && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 999,
          display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            background: '#fff', borderRadius: '20px', padding: '28px', maxWidth: '400px',
            width: '100%', boxShadow: '0 24px 60px rgba(0,0,0,0.15)'
          }}>
            <h3 style={{ fontFamily: 'Georgia,serif', fontSize: '1.1rem', color: C.textDark, marginBottom: '10px' }}>
              Rejeter la demande de conversion
            </h3>
            <p style={{ fontSize: '0.8rem', color: C.textMuted, marginBottom: '14px' }}>
              Veuillez spécifier le motif du rejet. Le solde fidélité de la pharmacie sera immédiatement recrédité.
            </p>
            <textarea value={motifReject} onChange={e => setMotifReject(e.target.value)}
              placeholder="Ex: Montant trop faible / Client instable / Pièces justificatives manquantes"
              rows={4}
              style={{
                width: '100%', padding: '10px', border: `1.5px solid ${C.border}`,
                borderRadius: '12px', outline: 'none', fontFamily: 'inherit',
                fontSize: '0.85rem', color: C.textDark, marginBottom: '18px', resize: 'none'
              }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { setRejectingId(null); setMotifReject(''); }}
                style={{
                  flex: 1, padding: '10px', border: `1.5px solid ${C.border}`,
                  borderRadius: '10px', background: '#fff', color: C.textMuted,
                  fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
                }}>
                Annuler
              </button>
              <button onClick={handleReject}
                style={{
                  flex: 1, padding: '10px', border: 'none', borderRadius: '10px',
                  background: 'linear-gradient(135deg,#dc2626,#ef4444)', color: '#fff',
                  fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit'
                }}>
                Rejeter & Recréditer
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}
