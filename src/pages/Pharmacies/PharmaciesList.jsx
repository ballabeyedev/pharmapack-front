import { useState, useEffect, useCallback } from 'react';
import { C } from '../../components/Constant';
import { getPharmacies } from '../../services/admin.service';

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
  actif:      { bg:'#d1fae5', color:'#065f46', label:'Actif'      },
  inactif:    { bg:'#fee2e2', color:'#991b1b', label:'Inactif'    },
  en_attente: { bg:'#fef3c7', color:'#92400e', label:'En attente' },
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

/* Skeleton row */
const SkeletonRow = () => (
  <tr>
    {[200, 100, 130, 80, 70].map((w, i) => (
      <td key={i} style={{ padding:'14px 16px' }}>
        <div style={{ height:'16px', width:`${w}px`, maxWidth:'100%', borderRadius:'6px',
          background:'linear-gradient(90deg,#f0faf5 25%,#e0f2ec 50%,#f0faf5 75%)',
          backgroundSize:'200% 100%', animation:'shimmer 1.4s infinite' }} />
      </td>
    ))}
  </tr>
);

/* ─────────────────────────────────────────────
   Modal détail
───────────────────────────────────────────── */
const DetailModal = ({ pharmacie, onClose }) => {
  const u = pharmacie.pharmacien || {};
  const nomComplet = `${u.prenom || ''} ${u.nom || ''}`.trim() || '—';

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:999,
      display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }}
      onClick={onClose}>
      <div style={{ background:'#fff', borderRadius:'20px', padding:'32px', maxWidth:'500px',
        width:'100%', boxShadow:'0 24px 60px rgba(0,0,0,0.18)',
        animation:'fadeUp 0.3s ease both' }}
        onClick={e => e.stopPropagation()}>

        {/* Header modal */}
        <div style={{ display:'flex', justifyContent:'space-between',
          alignItems:'flex-start', marginBottom:'24px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
            <div style={{ width:'52px', height:'52px',
              background:`linear-gradient(135deg,${C.greenMid},${C.greenBright})`,
              borderRadius:'14px', display:'flex', alignItems:'center',
              justifyContent:'center', flexShrink:0 }}>
              <span style={{ color:'#fff', fontWeight:800, fontSize:'1.3rem' }}>
                {(pharmacie.nom || '?')[0].toUpperCase()}
              </span>
            </div>
            <div>
              <h3 style={{ fontFamily:'Georgia,serif', fontSize:'1.1rem',
                fontWeight:700, color:C.textDark, marginBottom:'4px' }}>
                {pharmacie.nom || '—'}
              </h3>
              <StatutBadge statut={u.statut} />
            </div>
          </div>
          <button onClick={onClose}
            style={{ background:'none', border:'none', cursor:'pointer',
              color:'#6b7280', fontSize:'1.2rem', padding:'4px' }}>
            ✕
          </button>
        </div>

        {/* Grille infos */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
          {[
            { label:'Responsable',  val: nomComplet },
            { label:'Email',        val: u.email || '—' },
            { label:'Rôle',         val: u.role  || '—' },
            { label:'Statut compte',val: u.statut || '—' },
            { label:'Adresse',      val: pharmacie.adresse || '—' },
            { label:'Téléphone',    val: pharmacie.telephone || '—' },
            { label:'Ville',        val: pharmacie.ville || '—' },
            { label:'NINEA / RC',   val: pharmacie.ninea || '—' },
          ].map(({ label, val }) => (
            <div key={label} style={{ background:C.greenPale, borderRadius:'10px', padding:'12px' }}>
              <p style={{ fontSize:'0.67rem', color:C.textMuted, fontWeight:700,
                textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'4px' }}>
                {label}
              </p>
              <p style={{ fontSize:'0.87rem', fontWeight:600, color:C.textDark,
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {val}
              </p>
            </div>
          ))}
        </div>

        {/* Date inscription */}
        {pharmacie.created_at && (
          <p style={{ marginTop:'16px', fontSize:'0.76rem', color:C.textMuted, textAlign:'right' }}>
            Inscrit le {new Date(pharmacie.created_at).toLocaleDateString('fr-FR', {
              day:'numeric', month:'long', year:'numeric'
            })}
          </p>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Page principale
───────────────────────────────────────────── */
export default function PharmaciesPage() {
  const [pharmacies,    setPharmacies]    = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState('');
  const [filterStatut,  setFilterStatut]  = useState('all');
  const [selected,      setSelected]      = useState(null);
  const [toast,         setToast]         = useState(null);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPharmacies();
      setPharmacies(data.pharmacies || []);
    } catch {
      showToast('Erreur lors du chargement des pharmacies', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  /* ── Filtrage ── */
  const filtered = pharmacies.filter(p => {
    const u = p.pharmacien || {};
    const nomPharmacie = (p.nom || '').toLowerCase();
    const nomResponsable = `${u.prenom || ''} ${u.nom || ''}`.toLowerCase();
    const ville = (p.ville || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    const q = search.toLowerCase();

    const matchSearch =
      nomPharmacie.includes(q) ||
      nomResponsable.includes(q) ||
      ville.includes(q) ||
      email.includes(q);

    const matchStatut =
      filterStatut === 'all' || (p.pharmacien?.statut === filterStatut);

    return matchSearch && matchStatut;
  });

  /* ── Compteurs ── */
  const nbActif   = pharmacies.filter(p => p.pharmacien?.statut === 'actif').length;
  const nbInactif = pharmacies.filter(p => p.pharmacien?.statut === 'inactif').length;
  const total     = pharmacies.length;

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
            Liste des pharmacies
          </h2>
          <p style={{ fontSize:'0.78rem', color:C.textMuted }}>
            {loading ? 'Chargement...' : `${filtered.length} pharmacie${filtered.length !== 1 ? 's' : ''} trouvée${filtered.length !== 1 ? 's' : ''}`}
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
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(130px, 1fr))', gap:'12px' }}>
        {[
          { label:'Total',    val: total,     color:C.greenMid, icon:'🏪' },
          { label:'Actifs',   val: nbActif,   color:'#059669',  icon:'✅' },
          { label:'Inactifs', val: nbInactif, color:'#dc2626',  icon:'⛔' },
        ].map(({ label, val, color, icon }, idx) => (
          <div key={label} style={{ background:'#fff', borderRadius:'14px', padding:'18px',
            boxShadow:'0 2px 8px rgba(13,92,58,0.06)', textAlign:'center',
            borderTop:`3px solid ${color}`,
            animation:`fadeUp 0.35s ease ${idx * 0.06}s both` }}>
            <p style={{ fontSize:'1.4rem', marginBottom:'4px' }}>{icon}</p>
            <p style={{ fontSize:'1.6rem', fontWeight:800, color, lineHeight:1 }}>
              {loading ? '—' : val}
            </p>
            <p style={{ fontSize:'0.75rem', color:'#6b7280', marginTop:'4px', fontWeight:500 }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* ── Filtres ── */}
      <div style={{ background:'#fff', borderRadius:'16px', padding:'16px 20px',
        border:`1px solid ${C.border}`, boxShadow:'0 2px 8px rgba(13,92,58,0.05)',
        display:'flex', gap:'12px', flexWrap:'wrap', alignItems:'center' }}>
        {/* Recherche */}
        <div style={{ flex:'1', minWidth:'200px', position:'relative' }}>
          <span style={{ position:'absolute', left:'12px', top:'50%',
            transform:'translateY(-50%)', color:C.textMuted, pointerEvents:'none' }}>
            <Icon d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0" size={16} />
          </span>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Nom, responsable, ville, email…"
            style={{ width:'100%', padding:'10px 12px 10px 38px',
              border:`1.5px solid ${C.border}`, borderRadius:'12px',
              fontSize:'0.87rem', background:'#fff', outline:'none',
              color:C.textDark, boxSizing:'border-box', fontFamily:'inherit' }}
          />
        </div>
        {/* Filtre statut */}
        <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)}
          style={{ padding:'10px 14px', border:`1.5px solid ${C.border}`,
            borderRadius:'12px', fontSize:'0.87rem', color:C.textDark,
            background:'#fff', cursor:'pointer', outline:'none', fontFamily:'inherit' }}>
          <option value="all">Tous les statuts</option>
          <option value="actif">Actifs</option>
          <option value="inactif">Inactifs</option>
        </select>
        {/* Reset */}
        {(search || filterStatut !== 'all') && (
          <button onClick={() => { setSearch(''); setFilterStatut('all'); }}
            style={{ padding:'9px 14px', border:'none', borderRadius:'10px',
              background:'#fee2e2', color:'#dc2626', fontSize:'0.8rem',
              fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
            ✕ Réinitialiser
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div style={{ background:'#fff', borderRadius:'20px',
        border:`1px solid ${C.border}`,
        boxShadow:'0 2px 12px rgba(13,92,58,0.06)', overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', minWidth:'680px' }}>
            <thead>
              <tr style={{ background:C.greenPale,
                borderBottom:`2px solid ${C.greenBorder}` }}>
                {['Pharmacie','Ville / Adresse','Responsable','Email','Statut','Actions'].map(h => (
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
                ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                : filtered.length === 0
                  ? (
                    <tr>
                      <td colSpan={6} style={{ padding:'60px', textAlign:'center',
                        color:C.textMuted }}>
                        <div style={{ fontSize:'2.5rem', marginBottom:'10px' }}>🔍</div>
                        <p style={{ fontWeight:600, marginBottom:'4px' }}>Aucune pharmacie trouvée</p>
                        <p style={{ fontSize:'0.82rem' }}>Modifiez vos critères de recherche</p>
                      </td>
                    </tr>
                  )
                  : filtered.map((p, i) => {
                    const u = p.pharmacien || {};
                    const nomResponsable = `${u.prenom || ''} ${u.nom || ''}`.trim() || '—';
                    const initiale = (p.nom || '?')[0].toUpperCase();

                    return (
                      <tr key={p.id} style={{ borderBottom:`1px solid ${C.border}`,
                        transition:'background 0.15s',
                        animation:`fadeUp 0.3s ease ${i * 0.04}s both` }}>

                        {/* Pharmacie */}
                        <td style={td}>
                          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                            <div style={{ width:'38px', height:'38px', flexShrink:0,
                              background:`linear-gradient(135deg,${C.greenMid},${C.greenBright})`,
                              borderRadius:'10px', display:'flex', alignItems:'center',
                              justifyContent:'center' }}>
                              <span style={{ color:'#fff', fontWeight:800,
                                fontSize:'0.9rem' }}>{initiale}</span>
                            </div>
                            <div>
                              <p style={{ fontWeight:700, fontSize:'0.87rem',
                                color:C.textDark, marginBottom:'2px' }}>
                                {p.nom || '—'}
                              </p>
                              {p.telephone && (
                                <p style={{ fontSize:'0.72rem', color:'#9ca3af' }}>
                                  {p.telephone}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Ville */}
                        <td style={td}>
                          <p style={{ fontSize:'0.85rem', color:C.textDark,
                            fontWeight:500 }}>
                            {p.ville || '—'}
                          </p>
                          {p.adresse && (
                            <p style={{ fontSize:'0.72rem', color:'#9ca3af',
                              marginTop:'2px', maxWidth:'160px',
                              overflow:'hidden', textOverflow:'ellipsis',
                              whiteSpace:'nowrap' }}>
                              {p.adresse}
                            </p>
                          )}
                        </td>

                        {/* Responsable */}
                        <td style={td}>
                          <p style={{ fontSize:'0.85rem', color:C.textDark,
                            fontWeight:600 }}>
                            {nomResponsable}
                          </p>
                          <p style={{ fontSize:'0.72rem', color:'#9ca3af',
                            marginTop:'2px', textTransform:'capitalize' }}>
                            {u.role || '—'}
                          </p>
                        </td>

                        {/* Email */}
                        <td style={td}>
                          <span style={{ fontSize:'0.82rem', color:C.textMuted }}>
                            {u.email || '—'}
                          </span>
                        </td>

                        {/* Statut */}
                        <td style={td}>
                          <StatutBadge statut={u.statut} />
                        </td>

                        {/* Actions */}
                        <td style={td}>
                          <div style={{ display:'flex', gap:'6px' }}>
                            <button onClick={() => setSelected(p)}
                              style={{ padding:'6px 12px', background:C.greenPale,
                                border:'none', borderRadius:'8px', color:C.greenDeep,
                                fontWeight:700, fontSize:'0.76rem',
                                cursor:'pointer', fontFamily:'inherit',
                                display:'flex', alignItems:'center', gap:'4px' }}>
                              <Icon d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"
                                size={12} stroke={C.greenDeep} />
                              Voir
                            </button>
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
        <DetailModal pharmacie={selected} onClose={() => setSelected(null)} />
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