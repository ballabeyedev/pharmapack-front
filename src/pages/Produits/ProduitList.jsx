import { useState, useEffect, useCallback } from 'react';
import { C } from '../../components/Constant';
import { getProduits, supprimerProduit } from '../../services/admin.service';
import AddProduit from './AddProduit';
import EditProduit from './EditProduit';
import ProduitModal from './ProduitModal';

const Icon = ({ d, size = 16, stroke = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={stroke} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

/* ── Dialogue de confirmation suppression ── */
function DeleteConfirm({ produit, onConfirm, onCancel, loading }) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onCancel}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          zIndex: 900, backdropFilter: 'blur(3px)',
          animation: 'fadeIn 0.2s ease',
        }}
      />
      {/* Boîte */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 901, width: '90%', maxWidth: '420px',
        background: '#fff', borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        padding: '28px 28px 24px',
        fontFamily: 'DM Sans, sans-serif',
        animation: 'slideUp 0.25s ease',
      }}>
        {/* Icône danger */}
        <div style={{
          width: '52px', height: '52px', borderRadius: '50%',
          background: '#fee2e2', display: 'flex', alignItems: 'center',
          justifyContent: 'center', marginBottom: '18px',
        }}>
          <Icon d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
            size={24} stroke="#dc2626" />
        </div>

        <h3 style={{
          fontFamily: 'Georgia,serif', fontSize: '1.05rem',
          fontWeight: 700, color: C.textDark, marginBottom: '10px',
        }}>
          Supprimer le produit ?
        </h3>
        <p style={{ fontSize: '0.88rem', color: C.textMuted, lineHeight: 1.6, marginBottom: '24px' }}>
          Vous êtes sur le point de supprimer{' '}
          <strong style={{ color: C.textDark }}>« {produit?.nom} »</strong>.
          Cette action est <strong>irréversible</strong>.
        </p>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} disabled={loading}
            style={{
              padding: '10px 22px', border: `1.5px solid ${C.border}`,
              borderRadius: '12px', background: '#fff', color: C.textDark,
              fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer',
              fontFamily: 'inherit',
            }}>
            Annuler
          </button>
          <button onClick={onConfirm} disabled={loading}
            style={{
              padding: '10px 22px', border: 'none',
              borderRadius: '12px',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg,#dc2626,#ef4444)',
              color: '#fff', fontWeight: 700, fontSize: '0.88rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '7px',
              boxShadow: loading ? 'none' : '0 4px 14px rgba(220,38,38,0.3)',
              transition: 'all 0.15s',
            }}>
            {loading ? (
              <>
                <span style={{
                  display: 'inline-block', width: '14px', height: '14px',
                  border: '2px solid rgba(255,255,255,0.4)',
                  borderTopColor: '#fff', borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite',
                }} />
                Suppression…
              </>
            ) : (
              <>
                <Icon d="M3 6h18M19 6l-1 14H6L5 6M8 6V4h8v2" size={15} stroke="#fff" />
                Supprimer
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   Page principale ProduitsPage
───────────────────────────────────────────── */
export default function ProduitsPage() {
  const [filterCat,     setFilterCat]     = useState('all');
  const [search,        setSearch]        = useState('');
  const [view,          setView]          = useState('grid');
  const [produits,      setProduits]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [toast,         setToast]         = useState(null);

  /* Vues */
  const [showAdd,       setShowAdd]       = useState(false);
  const [editProduit,   setEditProduit]   = useState(null);  // produit en cours d'édition
  const [viewProduit,   setViewProduit]   = useState(null);  // produit à voir dans modal
  const [deleteTarget,  setDeleteTarget]  = useState(null);  // produit à supprimer
  const [deleteLoading, setDeleteLoading] = useState(false);

  const CATEGORIES = [...new Set(produits.map(p => p.categorie?.nom).filter(Boolean))];

  const showToast = useCallback((msg, type = 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }, []);

  const loadProduits = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProduits();
      setProduits(data.produits || []);
    } catch (error) {
      console.error(error);
      showToast('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { loadProduits(); }, [loadProduits]);

  const filtered = produits.filter(p => {
    const matchC = filterCat === 'all' || p.categorie?.nom === filterCat;
    const matchS =
      (p.nom || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.categorie?.nom || '').toLowerCase().includes(search.toLowerCase());
    return matchC && matchS;
  });

  /* ── Suppression ── */
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await supprimerProduit(deleteTarget.id);
      showToast(`« ${deleteTarget.nom} » supprimé avec succès`, 'success');
      setDeleteTarget(null);
      loadProduits();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Erreur lors de la suppression';
      showToast(msg, 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  /* ── Rendu AddProduit ── */
  if (showAdd) {
    return (
      <AddProduit
        onBack={() => setShowAdd(false)}
        onSuccess={() => { setShowAdd(false); loadProduits(); }}
      />
    );
  }

  /* ── Rendu EditProduit ── */
  if (editProduit) {
    return (
      <EditProduit
        produit={editProduit}
        onBack={() => setEditProduit(null)}
        onSuccess={() => { setEditProduit(null); loadProduits(); }}
      />
    );
  }

  /* ── Rendu liste ── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'DM Sans, sans-serif' }}>
      <style>{`
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translate(-50%,-46%)} to{opacity:1;transform:translate(-50%,-50%)} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        tr:hover td { background:#f0faf5 !important; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '1.15rem', fontWeight: 700, color: C.textDark, marginBottom: '3px' }}>
            Catalogue produits
          </h2>
          <p style={{ fontSize: '0.78rem', color: C.textMuted }}>
            {loading ? 'Chargement...' : `${filtered.length} produit${filtered.length > 1 ? 's' : ''}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>

          {/* Toggle vue */}
          <div style={{ display: 'flex', background: C.greenPale, borderRadius: '10px', padding: '3px' }}>
            {['grid', 'table'].map(v => (
              <button key={v} onClick={() => setView(v)}
                style={{
                  padding: '6px 14px', borderRadius: '8px', border: 'none',
                  cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
                  fontSize: '0.8rem', transition: 'all 0.15s',
                  background: view === v ? C.greenMid : 'transparent',
                  color: view === v ? '#fff' : C.textMuted,
                }}>
                {v === 'grid' ? '▦ Grille' : '☰ Liste'}
              </button>
            ))}
          </div>

          {/* Actualiser */}
          <button onClick={loadProduits}
            style={{
              padding: '10px 14px', border: `1.5px solid ${C.border}`,
              borderRadius: '12px', background: '#fff', color: C.textMuted,
              fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit',
            }}>
            ↺
          </button>

          {/* Ajouter */}
          <button onClick={() => setShowAdd(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 18px', border: 'none', borderRadius: '12px',
              background: `linear-gradient(135deg,${C.greenMid},${C.greenBright})`,
              color: '#fff', fontWeight: 600, fontSize: '0.85rem',
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 4px 14px rgba(26,125,82,0.3)',
            }}>
            ＋ Ajouter produit
          </button>
        </div>
      </div>

      {/* ── Filtres ── */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '180px' }}>
          <span style={{
            position: 'absolute', left: '12px', top: '50%',
            transform: 'translateY(-50%)', color: C.textMuted,
            pointerEvents: 'none', fontSize: '14px',
          }}>🔍</span>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un produit…"
            style={{
              width: '100%', padding: '10px 12px 10px 36px',
              border: `1.5px solid ${C.border}`, borderRadius: '12px',
              fontSize: '0.87rem', background: '#fff', outline: 'none',
              color: C.textDark, boxSizing: 'border-box', fontFamily: 'inherit',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['all', ...CATEGORIES].map(cat => (
            <button key={cat} onClick={() => setFilterCat(cat)}
              style={{
                padding: '8px 14px', borderRadius: '20px', border: 'none',
                cursor: 'pointer', fontSize: '0.79rem', fontWeight: 600,
                fontFamily: 'inherit', transition: 'all 0.15s',
                background: filterCat === cat ? C.greenMid : '#fff',
                color: filterCat === cat ? '#fff' : '#6b7280',
                boxShadow: filterCat === cat
                  ? '0 3px 10px rgba(26,125,82,0.28)'
                  : '0 1px 4px rgba(0,0,0,0.06)',
              }}>
              {cat === 'all' ? 'Tous' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Alerte stock faible ── */}
      {!loading && produits.some(p => (p.stock ?? 0) < 500) && (
        <div style={{
          background: '#fef3c7', border: '1px solid #fde68a',
          borderRadius: '12px', padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <span style={{ fontSize: '1.2rem' }}>⚠️</span>
          <p style={{ fontSize: '0.84rem', color: '#92400e', fontWeight: 500 }}>
            {produits.filter(p => (p.stock ?? 0) < 500).length} produit(s) avec un stock faible.{' '}
            <span style={{ fontWeight: 700 }}>Pensez à réapprovisionner.</span>
          </p>
        </div>
      )}

      {/* ── Skeleton ── */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{
              borderRadius: '16px', height: '200px',
              background: 'linear-gradient(90deg,#f0faf5 25%,#e0f2ec 50%,#f0faf5 75%)',
              backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite',
            }} />
          ))}
        </div>
      )}

      {/* ── Vue Grille ── */}
      {!loading && view === 'grid' && (
        filtered.length === 0 ? (
          <div style={{
            padding: '60px', textAlign: 'center', color: C.textMuted,
            background: '#fff', borderRadius: '20px', border: `1px solid ${C.border}`,
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>💊</div>
            <p style={{ fontWeight: 600, marginBottom: '4px' }}>Aucun produit trouvé</p>
            <p style={{ fontSize: '0.82rem' }}>Modifiez vos filtres ou ajoutez un produit</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
            {filtered.map((p, idx) => (
              <div key={p.id} style={{
                background: '#fff', borderRadius: '16px', padding: '20px',
                boxShadow: '0 2px 10px rgba(13,92,58,0.07)',
                display: 'flex', flexDirection: 'column', gap: '12px',
                border: (p.stock ?? 0) < 500 ? '1.5px solid #fde68a' : `1.5px solid ${C.border}`,
                transition: 'transform 0.15s, box-shadow 0.15s',
                animation: `fadeUp 0.3s ease ${idx * 0.04}s both`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '48px', height: '48px', background: C.greenPale,
                    borderRadius: '12px', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '1.5rem', overflow: 'hidden',
                  }}>
                    {p.image
                      ? <img src={p.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                      : '💊'
                    }
                  </div>
                  {(p.stock ?? 0) < 500 && (
                    <span style={{
                      background: '#fef3c7', color: '#92400e',
                      padding: '3px 8px', borderRadius: '8px',
                      fontSize: '0.67rem', fontWeight: 700,
                    }}>
                      Stock faible
                    </span>
                  )}
                </div>

                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem', color: C.textDark }}>{p.nom}</p>
                  <p style={{ fontSize: '0.74rem', color: C.textMuted, marginTop: '2px' }}>
                    {p.categorie?.nom || '—'}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '1.15rem', fontWeight: 800, color: C.greenMid }}>
                      {Number(p.prix ?? 0).toLocaleString('fr-FR')} F
                    </p>
                    <p style={{ fontSize: '0.7rem', color: '#9ca3af' }}>par {p.unite || 'unité'}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.88rem', fontWeight: 700, color: (p.stock ?? 0) < 500 ? '#d97706' : C.textDark }}>
                      {(p.stock ?? 0).toLocaleString('fr-FR')}
                    </p>
                    <p style={{ fontSize: '0.7rem', color: '#9ca3af' }}>en stock</p>
                  </div>
                </div>

                <div style={{ height: '4px', background: '#e5e7eb', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '2px',
                    width: `${Math.min(((p.stock ?? 0) / 8000) * 100, 100)}%`,
                    background: (p.stock ?? 0) < 500 ? '#d97706' : C.greenBright,
                  }} />
                </div>

                {/* ── Actions carte ── */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  {/* Voir */}
                  <button
                    onClick={() => setViewProduit(p)}
                    title="Voir les détails"
                    style={{
                      width: '34px', height: '34px', padding: '0',
                      background: '#f3f4f6', border: 'none',
                      borderRadius: '8px', color: '#6b7280',
                      fontWeight: 600, fontSize: '0.8rem',
                      cursor: 'pointer', fontFamily: 'inherit',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background 0.15s',
                      flexShrink: 0,
                    }}
                    onMouseOver={e => e.currentTarget.style.background = '#e5e7eb'}
                    onMouseOut={e => e.currentTarget.style.background = '#f3f4f6'}
                  >
                    <Icon d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" size={15} />
                  </button>

                  {/* Éditer */}
                  <button
                    onClick={() => setEditProduit(p)}
                    style={{
                      flex: 1, padding: '8px', background: C.greenPale,
                      border: 'none', borderRadius: '8px', color: C.greenMid,
                      fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
                      fontFamily: 'inherit', transition: 'background 0.15s',
                    }}
                    onMouseOver={e => e.currentTarget.style.background = '#bbf7d0'}
                    onMouseOut={e => e.currentTarget.style.background = C.greenPale}
                  >
                    Éditer
                  </button>

                  {/* Supprimer */}
                  <button
                    onClick={() => setDeleteTarget(p)}
                    style={{
                      flex: 1, padding: '8px', background: '#fef2f2',
                      border: 'none', borderRadius: '8px', color: '#dc2626',
                      fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
                      fontFamily: 'inherit', transition: 'background 0.15s',
                    }}
                    onMouseOver={e => e.currentTarget.style.background = '#fee2e2'}
                    onMouseOut={e => e.currentTarget.style.background = '#fef2f2'}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ── Vue Table ── */}
      {!loading && view === 'table' && (
        <div style={{
          background: '#fff', borderRadius: '20px',
          border: `1px solid ${C.border}`,
          boxShadow: '0 2px 12px rgba(13,92,58,0.06)', overflow: 'hidden',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '580px' }}>
              <thead>
                <tr style={{ background: C.greenPale, borderBottom: `2px solid ${C.greenBorder}` }}>
                  {['Produit', 'Catégorie', 'Prix unitaire', 'Stock', 'Actions'].map(h => (
                    <th key={h} style={{
                      padding: '13px 16px', textAlign: 'left', fontSize: '0.72rem',
                      fontWeight: 700, color: C.greenDeep, textTransform: 'uppercase',
                      letterSpacing: '0.06em', whiteSpace: 'nowrap',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '60px', textAlign: 'center', color: C.textMuted }}>
                      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💊</div>
                      <p>Aucun produit trouvé</p>
                    </td>
                  </tr>
                ) : filtered.map((p, i) => (
                  <tr key={p.id} style={{
                    borderBottom: `1px solid ${C.border}`,
                    transition: 'background 0.15s',
                    animation: `fadeUp 0.3s ease ${i * 0.03}s both`,
                  }}>
                    {/* Produit */}
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '34px', height: '34px', borderRadius: '8px',
                          background: C.greenPale, display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: '1.1rem',
                          overflow: 'hidden', flexShrink: 0,
                        }}>
                          {p.image
                            ? <img src={p.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : '💊'
                          }
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '0.87rem', color: C.textDark }}>
                          {p.nom}
                        </span>
                      </div>
                    </td>

                    {/* Catégorie */}
                    <td style={tdStyle}>
                      <span style={{ fontSize: '0.84rem', color: '#6b7280' }}>
                        {p.categorie?.nom || '—'}
                      </span>
                    </td>

                    {/* Prix */}
                    <td style={tdStyle}>
                      <span style={{ fontWeight: 700, color: C.greenMid, fontSize: '0.88rem', whiteSpace: 'nowrap' }}>
                        {Number(p.prix ?? 0).toLocaleString('fr-FR')} F/{p.unite || 'u'}
                      </span>
                    </td>

                    {/* Stock */}
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          fontWeight: 700, fontSize: '0.88rem',
                          color: (p.stock ?? 0) < 500 ? '#d97706' : C.textDark,
                        }}>
                          {(p.stock ?? 0).toLocaleString('fr-FR')}
                        </span>
                        {(p.stock ?? 0) < 500 && (
                          <span style={{
                            background: '#fef3c7', color: '#92400e',
                            padding: '2px 8px', borderRadius: '8px',
                            fontSize: '0.67rem', fontWeight: 700,
                          }}>
                            ⚠ Faible
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {/* Voir */}
                        <button
                          onClick={() => setViewProduit(p)}
                          title="Voir les détails"
                          style={{
                            width: '32px', height: '32px', padding: '0',
                            background: '#f3f4f6', border: 'none',
                            borderRadius: '8px', color: '#6b7280',
                            cursor: 'pointer', fontFamily: 'inherit',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'background 0.15s', flexShrink: 0,
                          }}
                          onMouseOver={e => e.currentTarget.style.background = '#e5e7eb'}
                          onMouseOut={e => e.currentTarget.style.background = '#f3f4f6'}
                        >
                          <Icon d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" size={14} />
                        </button>

                        {/* Éditer */}
                        <button
                          onClick={() => setEditProduit(p)}
                          style={{
                            padding: '6px 14px', background: C.greenPale, border: 'none',
                            borderRadius: '8px', color: C.greenMid, fontWeight: 600,
                            fontSize: '0.76rem', cursor: 'pointer', fontFamily: 'inherit',
                            transition: 'background 0.15s',
                          }}
                          onMouseOver={e => e.currentTarget.style.background = '#bbf7d0'}
                          onMouseOut={e => e.currentTarget.style.background = C.greenPale}
                        >
                          Éditer
                        </button>

                        {/* Supprimer */}
                        <button
                          onClick={() => setDeleteTarget(p)}
                          style={{
                            padding: '6px 14px', background: '#fef2f2', border: 'none',
                            borderRadius: '8px', color: '#dc2626', fontWeight: 600,
                            fontSize: '0.76rem', cursor: 'pointer', fontFamily: 'inherit',
                            transition: 'background 0.15s',
                          }}
                          onMouseOver={e => e.currentTarget.style.background = '#fee2e2'}
                          onMouseOut={e => e.currentTarget.style.background = '#fef2f2'}
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '28px', right: '28px', zIndex: 1000,
          background: toast.type === 'error' ? '#dc2626' : C.greenDeep,
          color: '#fff', padding: '12px 22px', borderRadius: '14px',
          fontSize: '0.875rem', fontWeight: 600,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          animation: 'fadeUp 0.3s ease both',
        }}>
          {toast.msg}
        </div>
      )}

      {/* ── Modal détail produit ── */}
      {viewProduit && (
        <ProduitModal
          produit={viewProduit}
          onClose={() => setViewProduit(null)}
        />
      )}

      {/* ── Dialogue suppression ── */}
      {deleteTarget && (
        <DeleteConfirm
          produit={deleteTarget}
          loading={deleteLoading}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

const tdStyle = {
  padding: '13px 16px',
  fontSize: '0.875rem',
  color: '#111827',
  verticalAlign: 'middle',
  transition: 'background 0.15s',
};