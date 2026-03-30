import { useState, useEffect } from 'react';
import { C } from '../../components/Constant';
import { getCommandes } from '../../services/admin.service';

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
const fmt = (n) =>
  new Intl.NumberFormat('fr-FR', { style:'currency', currency:'XOF', maximumFractionDigits:0 }).format(n ?? 0);

const Icon = ({ d, size = 16, stroke = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={stroke} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

/* Statuts backend → affichage */
const STATUT_CFG = {
  en_attente:    { bg:'#fef3c7', color:'#92400e', label:'En attente'    },
  en_preparation:{ bg:'#dbeafe', color:'#1e40af', label:'En préparation'},
  livree:        { bg:'#d1fae5', color:'#065f46', label:'Livrée'        },
  annulee:       { bg:'#fee2e2', color:'#991b1b', label:'Annulée'       },
};

const StatutBadge = ({ statut }) => {
  const c = STATUT_CFG[statut] || { bg:'#f3f4f6', color:'#374151', label: statut };
  return (
    <span style={{ background:c.bg, color:c.color, padding:'3px 10px',
      borderRadius:'20px', fontSize:'0.7rem', fontWeight:600, whiteSpace:'nowrap',
      display:'inline-flex', alignItems:'center', gap:'4px' }}>
      <span style={{ width:'6px', height:'6px', borderRadius:'50%',
        background:c.color, display:'inline-block' }} />
      {c.label}
    </span>
  );
};

const Toast = ({ msg, type }) => (
  <div style={{ position:'fixed', bottom:'28px', right:'28px', zIndex:1000,
    background: type === 'error' ? '#dc2626' : C.greenDeep,
    color:'#fff', padding:'12px 22px', borderRadius:'14px',
    fontSize:'0.875rem', fontWeight:600,
    boxShadow:'0 8px 32px rgba(0,0,0,0.18)', animation:'fadeUp 0.3s ease both' }}>
    {msg}
  </div>
);

const SkeletonRow = () => (
  <tr>
    {[160, 140, 70, 90, 80, 70].map((w, i) => (
      <td key={i} style={{ padding:'14px 16px' }}>
        <div style={{ height:'16px', width:`${w}px`, maxWidth:'100%', borderRadius:'6px',
          background:'linear-gradient(90deg,#f0faf5 25%,#e0f2ec 50%,#f0faf5 75%)',
          backgroundSize:'200% 100%', animation:'shimmer 1.4s infinite' }} />
      </td>
    ))}
  </tr>
);

/* ─────────────────────────────────────────────
   Modal détail commande
───────────────────────────────────────────── */
const DetailModal = ({ commande, onClose, onValider, onRejeter, onLivrer }) => {
  const pharmacieNom = commande.pharmacie?.nom ?? `Pharmacie #${commande.pharmacie_id}`;
  const details = commande.details || [];
  const totalArticles = details.reduce((s, d) => s + (d.quantite ?? 0), 0);
  const montantTotal  = details.reduce((s, d) => s + ((d.quantite ?? 0) * (d.prix_unitaire ?? d.produit?.prix ?? 0)), 0);

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:999,
      display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }}
      onClick={onClose}>
      <div style={{ background:'#fff', borderRadius:'20px', padding:'32px', maxWidth:'520px',
        width:'100%', maxHeight:'90vh', overflowY:'auto',
        boxShadow:'0 24px 60px rgba(0,0,0,0.18)', animation:'fadeUp 0.3s ease both' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between',
          alignItems:'flex-start', marginBottom:'20px' }}>
          <div>
            <h3 style={{ fontFamily:'Georgia,serif', fontSize:'1.1rem',
              fontWeight:700, color:C.textDark, marginBottom:'6px' }}>
              Commande #{commande.id}
            </h3>
            <StatutBadge statut={commande.statut} />
          </div>
          <button onClick={onClose}
            style={{ background:'none', border:'none', cursor:'pointer',
              color:'#6b7280', fontSize:'1.2rem', padding:'4px' }}>
            ✕
          </button>
        </div>

        {/* Infos générales */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'20px' }}>
          {[
            { label:'Pharmacie',    val: pharmacieNom },
            { label:'Date',         val: commande.created_at ? new Date(commande.created_at).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' }) : '—' },
            { label:'Nb articles',  val: `${totalArticles} article${totalArticles !== 1 ? 's' : ''}` },
            { label:'Montant total',val: fmt(montantTotal) },
          ].map(({ label, val }) => (
            <div key={label} style={{ background:C.greenPale, borderRadius:'10px', padding:'11px 14px' }}>
              <p style={{ fontSize:'0.67rem', color:C.textMuted, fontWeight:700,
                textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'3px' }}>
                {label}
              </p>
              <p style={{ fontSize:'0.88rem', fontWeight:700, color:C.textDark }}>{val}</p>
            </div>
          ))}
        </div>

        {/* Détails articles */}
        {details.length > 0 && (
          <div style={{ marginBottom:'20px' }}>
            <p style={{ fontSize:'0.78rem', fontWeight:700, color:C.textMuted,
              textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'10px' }}>
              Articles commandés
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {details.map((d, i) => {
                const produit = d.produit || {};
                const prixU   = d.prix_unitaire ?? produit.prix ?? 0;
                const sousTotal = (d.quantite ?? 0) * prixU;
                return (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px',
                    padding:'10px 14px', background:'#f9fafb', borderRadius:'10px',
                    border:`1px solid ${C.border}` }}>
                    <div style={{ width:'32px', height:'32px', borderRadius:'8px',
                      background:C.greenPale, display:'flex', alignItems:'center',
                      justifyContent:'center', fontSize:'1rem', flexShrink:0 }}>
                      💊
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontWeight:600, fontSize:'0.85rem', color:C.textDark,
                        overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {produit.nom || produit.name || `Produit #${d.produit_id}`}
                      </p>
                      <p style={{ fontSize:'0.73rem', color:C.textMuted, marginTop:'1px' }}>
                        {fmt(prixU)} × {d.quantite ?? 0}
                      </p>
                    </div>
                    <span style={{ fontWeight:800, color:C.greenMid,
                      fontSize:'0.88rem', whiteSpace:'nowrap' }}>
                      {fmt(sousTotal)}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Total */}
            <div style={{ display:'flex', justifyContent:'space-between',
              alignItems:'center', padding:'12px 14px', marginTop:'8px',
              background:`linear-gradient(135deg,${C.greenDeep},${C.greenMid})`,
              borderRadius:'10px' }}>
              <span style={{ color:'rgba(255,255,255,0.8)', fontSize:'0.82rem', fontWeight:600 }}>
                Total commande
              </span>
              <span style={{ color:'#fff', fontWeight:800, fontSize:'1rem' }}>
                {fmt(montantTotal)}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
          {commande.statut === 'en_attente' && (
            <>
              <button onClick={() => onValider(commande.id)}
                style={{ flex:1, padding:'11px', border:'none', borderRadius:'12px',
                  background:`linear-gradient(135deg,${C.greenDeep},${C.greenMid})`,
                  color:'#fff', fontWeight:700, fontSize:'0.88rem',
                  cursor:'pointer', fontFamily:'inherit' }}>
                ✓ Valider
              </button>
              <button onClick={() => onRejeter(commande.id)}
                style={{ flex:1, padding:'11px', background:'#fef2f2',
                  border:'1px solid #fecaca', borderRadius:'12px', color:'#dc2626',
                  fontWeight:700, fontSize:'0.88rem', cursor:'pointer', fontFamily:'inherit' }}>
                ✕ Rejeter
              </button>
            </>
          )}
          {commande.statut === 'en_preparation' && (
            <button onClick={() => onLivrer(commande.id)}
              style={{ flex:1, padding:'11px', border:'none', borderRadius:'12px',
                background:`linear-gradient(135deg,${C.greenDeep},${C.greenMid})`,
                color:'#fff', fontWeight:700, fontSize:'0.88rem',
                cursor:'pointer', fontFamily:'inherit',
                display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
              <Icon d="M5 12h14M12 5l7 7-7 7" size={16} stroke="#fff" />
              Marquer comme livrée
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Page principale
───────────────────────────────────────────── */
const STATUS_TABS = [
  { key:'all',            label:'Toutes'         },
  { key:'en_attente',     label:'En attente'     },
  { key:'en_preparation', label:'En préparation' },
  { key:'livree',         label:'Livrées'        },
  { key:'annulee',        label:'Annulées'       },
];

export default function CommandesList() {
  const [commandes,     setCommandes]     = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState('');
  const [filterStatut,  setFilterStatut]  = useState('all');
  const [selected,      setSelected]      = useState(null);
  const [toast,         setToast]         = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const load = async () => {
    try {
      setLoading(true);
      const data = await getCommandes();
      // Backend retourne { message, commandes }
      setCommandes(data.commandes || []);
    } catch {
      showToast('Erreur lors du chargement des commandes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  /* ── Actions ── */
  const handleValider = async (id) => {
    try {
      const { validerCommande } = await import('../../services/admin.service');
      await validerCommande(id);
      showToast('Commande validée avec succès');
      setSelected(null);
      load();
    } catch { showToast('Erreur lors de la validation', 'error'); }
  };

  const handleRejeter = async (id) => {
    try {
      const { rejeterCommande } = await import('../../services/admin.service');
      await rejeterCommande(id);
      showToast('Commande rejetée');
      setSelected(null);
      load();
    } catch { showToast('Erreur lors du rejet', 'error'); }
  };

  const handleLivrer = async (id) => {
    try {
      const { livrerCommande } = await import('../../services/admin.service');
      await livrerCommande(id);
      showToast('Commande marquée comme livrée');
      setSelected(null);
      load();
    } catch { showToast('Erreur lors de la livraison', 'error'); }
  };

  /* ── Filtrage ── */
  const filtered = commandes.filter(c => {
    const pharmacieNom = (c.pharmacie?.nom || '').toLowerCase();
    const ref = String(c.id).toLowerCase();
    const q = search.toLowerCase();
    const matchSearch  = ref.includes(q) || pharmacieNom.includes(q);
    const matchStatut  = filterStatut === 'all' || c.statut === filterStatut;
    return matchSearch && matchStatut;
  });

  /* ── Compteurs ── */
  const count = (s) => s === 'all' ? commandes.length : commandes.filter(c => c.statut === s).length;

  /* ── Montant total des résultats ── */
  const totalFiltered = filtered.reduce((sum, c) => {
    const details = c.details || [];
    return sum + details.reduce((s, d) => {
      const prixU = d.prix_unitaire ?? d.produit?.prix ?? 0;
      return s + (d.quantite ?? 0) * prixU;
    }, 0);
  }, 0);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px',
      fontFamily:'DM Sans, sans-serif' }}>
      <style>{`
        @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        tr:hover td { background:#f0faf5 !important; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display:'flex', justifyContent:'space-between',
        alignItems:'center', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <h2 style={{ fontFamily:'Georgia,serif', fontSize:'1.15rem',
            fontWeight:700, color:C.textDark, marginBottom:'3px' }}>
            Liste des commandes
          </h2>
          <p style={{ fontSize:'0.78rem', color:C.textMuted }}>
            {loading ? 'Chargement...' : `${filtered.length} commande${filtered.length !== 1 ? 's' : ''} · ${fmt(totalFiltered)}`}
          </p>
        </div>
        <button onClick={load}
          style={{ display:'flex', alignItems:'center', gap:'6px',
            padding:'10px 16px', border:`1.5px solid ${C.border}`,
            borderRadius:'12px', background:'#fff', color:C.textMuted,
            fontSize:'0.85rem', cursor:'pointer', fontFamily:'inherit' }}>
          <Icon d="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15" size={14} />
          Actualiser
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(130px,1fr))', gap:'12px' }}>
        {[
          { label:'Total',           statut:'all',            color:C.greenMid, icon:'📋' },
          { label:'En attente',      statut:'en_attente',     color:'#d97706',  icon:'⏳' },
          { label:'En préparation',  statut:'en_preparation', color:'#2563eb',  icon:'📦' },
          { label:'Livrées',         statut:'livree',         color:'#059669',  icon:'✅' },
          { label:'Annulées',        statut:'annulee',        color:'#dc2626',  icon:'❌' },
        ].map(({ label, statut, color, icon }, idx) => (
          <div key={label}
            onClick={() => setFilterStatut(statut)}
            style={{ background: filterStatut === statut ? color : '#fff',
              borderRadius:'14px', padding:'16px',
              boxShadow:'0 2px 8px rgba(13,92,58,0.06)',
              textAlign:'center', borderTop:`3px solid ${color}`,
              cursor:'pointer', transition:'all 0.15s',
              animation:`fadeUp 0.35s ease ${idx * 0.05}s both` }}>
            <p style={{ fontSize:'1.3rem', marginBottom:'4px' }}>{icon}</p>
            <p style={{ fontSize:'1.6rem', fontWeight:800,
              color: filterStatut === statut ? '#fff' : color, lineHeight:1 }}>
              {loading ? '—' : count(statut)}
            </p>
            <p style={{ fontSize:'0.72rem', marginTop:'4px', fontWeight:500,
              color: filterStatut === statut ? 'rgba(255,255,255,0.85)' : '#6b7280' }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* ── Tabs statut ── */}
      <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
        {STATUS_TABS.map(tab => (
          <button key={tab.key} onClick={() => setFilterStatut(tab.key)}
            style={{ padding:'7px 16px', borderRadius:'20px', border:'none',
              cursor:'pointer', fontSize:'0.8rem', fontWeight:600,
              background: filterStatut === tab.key ? C.greenMid : '#fff',
              color: filterStatut === tab.key ? '#fff' : '#6b7280',
              boxShadow: filterStatut === tab.key
                ? '0 3px 10px rgba(26,125,82,0.3)'
                : '0 1px 4px rgba(0,0,0,0.06)',
              transition:'all 0.15s', fontFamily:'inherit',
              display:'flex', alignItems:'center', gap:'6px' }}>
            {tab.label}
            <span style={{ padding:'1px 7px', borderRadius:'10px', fontSize:'0.72rem',
              background: filterStatut === tab.key
                ? 'rgba(255,255,255,0.25)' : C.greenPale,
              color: filterStatut === tab.key ? '#fff' : C.greenMid }}>
              {loading ? '…' : count(tab.key)}
            </span>
          </button>
        ))}
      </div>

      {/* ── Recherche ── */}
      <div style={{ position:'relative', maxWidth:'380px' }}>
        <span style={{ position:'absolute', left:'12px', top:'50%',
          transform:'translateY(-50%)', color:C.textMuted, pointerEvents:'none' }}>
          <Icon d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0" size={16} />
        </span>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Référence ou pharmacie…"
          style={{ width:'100%', padding:'10px 12px 10px 38px',
            border:`1.5px solid ${C.border}`, borderRadius:'12px',
            fontSize:'0.87rem', background:'#fff', outline:'none',
            color:C.textDark, boxSizing:'border-box', fontFamily:'inherit' }} />
      </div>

      {/* ── Table ── */}
      <div style={{ background:'#fff', borderRadius:'20px',
        border:`1px solid ${C.border}`,
        boxShadow:'0 2px 12px rgba(13,92,58,0.06)', overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', minWidth:'640px' }}>
            <thead>
              <tr style={{ background:C.greenPale,
                borderBottom:`2px solid ${C.greenBorder}` }}>
                {['Référence','Pharmacie','Articles','Montant','Date','Statut','Actions'].map(h => (
                  <th key={h} style={{ padding:'13px 16px', textAlign:'left',
                    fontSize:'0.72rem', fontWeight:700, color:C.greenDeep,
                    textTransform:'uppercase', letterSpacing:'0.06em',
                    whiteSpace:'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                : filtered.length === 0
                  ? (
                    <tr>
                      <td colSpan={7} style={{ padding:'60px', textAlign:'center',
                        color:C.textMuted }}>
                        <div style={{ fontSize:'2.5rem', marginBottom:'10px' }}>📋</div>
                        <p style={{ fontWeight:600, marginBottom:'4px' }}>Aucune commande trouvée</p>
                        <p style={{ fontSize:'0.82rem' }}>Modifiez vos critères de recherche</p>
                      </td>
                    </tr>
                  )
                  : filtered.map((c, i) => {
                    const pharmacieNom = c.pharmacie?.nom ?? `Pharmacie #${c.pharmacie_id}`;
                    const details = c.details || [];
                    const nbArticles  = details.reduce((s, d) => s + (d.quantite ?? 0), 0);
                    const montant     = details.reduce((s, d) => {
                      const prixU = d.prix_unitaire ?? d.produit?.prix ?? 0;
                      return s + (d.quantite ?? 0) * prixU;
                    }, 0);

                    return (
                      <tr key={c.id} style={{ borderBottom:`1px solid ${C.border}`,
                        transition:'background 0.15s',
                        animation:`fadeUp 0.3s ease ${i * 0.03}s both` }}>

                        {/* Référence */}
                        <td style={td}>
                          <span style={{ fontWeight:800, color:C.greenDeep,
                            fontFamily:'monospace', fontSize:'0.86rem' }}>
                            #{c.id}
                          </span>
                        </td>

                        {/* Pharmacie */}
                        <td style={td}>
                          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                            <div style={{ width:'30px', height:'30px', borderRadius:'8px',
                              background:C.greenPale, display:'flex', alignItems:'center',
                              justifyContent:'center', fontSize:'0.9rem', flexShrink:0 }}>
                              🏪
                            </div>
                            <span style={{ fontWeight:600, fontSize:'0.86rem',
                              color:C.textDark }}>
                              {pharmacieNom}
                            </span>
                          </div>
                        </td>

                        {/* Articles */}
                        <td style={td}>
                          <span style={{ background:C.greenPale, color:C.greenDeep,
                            padding:'3px 10px', borderRadius:'8px',
                            fontSize:'0.8rem', fontWeight:700 }}>
                            {nbArticles} art.
                          </span>
                        </td>

                        {/* Montant */}
                        <td style={td}>
                          <span style={{ fontWeight:800, color:C.textDark,
                            fontSize:'0.88rem', whiteSpace:'nowrap' }}>
                            {fmt(montant)}
                          </span>
                        </td>

                        {/* Date */}
                        <td style={td}>
                          <span style={{ fontSize:'0.8rem', color:C.textMuted }}>
                            {c.created_at
                              ? new Date(c.created_at).toLocaleDateString('fr-FR', {
                                  day:'numeric', month:'short', year:'numeric'
                                })
                              : '—'}
                          </span>
                        </td>

                        {/* Statut */}
                        <td style={td}><StatutBadge statut={c.statut} /></td>

                        {/* Actions */}
                        <td style={td}>
                          <div style={{ display:'flex', gap:'6px' }}>
                            <button onClick={() => setSelected(c)}
                              style={{ padding:'6px 12px', background:C.greenPale,
                                border:'none', borderRadius:'8px', color:C.greenDeep,
                                fontWeight:700, fontSize:'0.76rem',
                                cursor:'pointer', fontFamily:'inherit',
                                display:'flex', alignItems:'center', gap:'4px' }}>
                              <Icon d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"
                                size={12} stroke={C.greenDeep} />
                              Détail
                            </button>
                            {/* Actions rapides */}
                            {c.statut === 'en_attente' && (
                              <button onClick={() => handleValider(c.id)}
                                style={{ padding:'6px 10px', background:'#d1fae5',
                                  border:'none', borderRadius:'8px', color:'#065f46',
                                  fontWeight:700, fontSize:'0.76rem',
                                  cursor:'pointer', fontFamily:'inherit' }}>
                                ✓
                              </button>
                            )}
                            {c.statut === 'en_attente' && (
                              <button onClick={() => handleRejeter(c.id)}
                                style={{ padding:'6px 10px', background:'#fee2e2',
                                  border:'none', borderRadius:'8px', color:'#991b1b',
                                  fontWeight:700, fontSize:'0.76rem',
                                  cursor:'pointer', fontFamily:'inherit' }}>
                                ✕
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal détail ── */}
      {selected && (
        <DetailModal
          commande={selected}
          onClose={() => setSelected(null)}
          onValider={handleValider}
          onRejeter={handleRejeter}
          onLivrer={handleLivrer}
        />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}

const td = {
  padding:'13px 16px', fontSize:'0.875rem',
  color:C.textDark, verticalAlign:'middle',
  transition:'background 0.15s',
};