import { useState, useEffect, useCallback } from 'react';
import { C } from '../../components/Constant';
import { getAvantages } from '../../services/admin.service';

/* ── helpers ── */
const fmt = (n) => new Intl.NumberFormat('fr-FR', { style:'currency', currency:'XOF', maximumFractionDigits:0 }).format(n ?? 0);

const statusMap = {
  disponible:  { bg:'#d1fae5', color:'#065f46', label:'Disponible' },
  utilisé:     { bg:'#f3f4f6', color:'#374151', label:'Utilisé' },
  'en attente':{ bg:'#fef3c7', color:'#92400e', label:'En attente' },
};

const TYPES = ['Remise volume', 'Bonus fidélité', 'RFA annuelle'];

const Icon = ({ d, size = 18, stroke = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke}
    strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const Badge = ({ status }) => {
  const c = statusMap[status] || { bg:'#f3f4f6', color:'#374151', label: status };
  return (
    <span style={{ background:c.bg, color:c.color, padding:'3px 10px',
      borderRadius:'20px', fontSize:'0.7rem', fontWeight:600, whiteSpace:'nowrap',
      display:'inline-flex', alignItems:'center', gap:'5px' }}>
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
    fontSize:'0.875rem', fontWeight:600, boxShadow:'0 8px 32px rgba(0,0,0,0.18)',
    animation:'fadeUp 0.3s ease both' }}>
    {msg}
  </div>
);

const Skeleton = () => (
  <div style={{ padding:'24px', display:'flex', flexDirection:'column', gap:'12px' }}>
    {[1,2,3,4].map(i => (
      <div key={i} style={{ height:'52px', borderRadius:'10px',
        background:'linear-gradient(90deg,#f0faf5 25%,#e0f2ec 50%,#f0faf5 75%)',
        backgroundSize:'200% 100%', animation:'shimmer 1.4s infinite' }} />
    ))}
    <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
  </div>
);

export default function AvantagesPage() {
  const [avantages,    setAvantages]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filterType,   setFilterType]   = useState('all');
  const [filterStatut, setFilterStatut] = useState('all');
  const [toast,        setToast]        = useState(null);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAvantages();
      setAvantages(data.avantages || []);
    } catch {
      showToast('Erreur lors du chargement des avantages', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  /* ── Données filtrées ── */
  const filtered = avantages.filter(a => {
    const matchT = filterType   === 'all' || a.type   === filterType;
    const matchS = filterStatut === 'all' || a.statut === filterStatut;
    return matchT && matchS;
  });

  /* ── KPI ── */
  const totalAll  = avantages.reduce((s, a) => s + (a.montant ?? 0), 0);
  const nbActifs  = avantages.filter(a => a.statut === 'disponible').length;

  /* ── Résumé par pharmacie (via relation incluse) ── */
  const byPharmacy = Object.values(
    avantages.reduce((acc, a) => {
      const pId   = a.pharmacie?.id   ?? a.pharmacie_id;
      const pName = a.pharmacie?.nom  ?? `Pharmacie #${pId}`;
      if (!acc[pId]) acc[pId] = { id: pId, name: pName, avantages: [], total: 0, dispo: 0 };
      acc[pId].avantages.push(a);
      acc[pId].total += a.montant ?? 0;
      if (a.statut === 'disponible') acc[pId].dispo += a.montant ?? 0;
      return acc;
    }, {})
  ).sort((a, b) => b.dispo - a.dispo);

  const typeIcon = (type) => {
    if (type === 'Remise volume') return '📊';
    if (type === 'Bonus fidélité') return '⭐';
    return '💼';
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'24px', fontFamily:'DM Sans, sans-serif' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* ── Header ── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
        flexWrap:'wrap', gap:'12px' }}>
        <div>
          <h2 style={{ fontFamily:'Georgia,serif', fontSize:'1.15rem', fontWeight:700,
            color:C.textDark, marginBottom:'3px' }}>
            Avantages & Remises
          </h2>
          <p style={{ fontSize:'0.78rem', color:C.textMuted }}>
            {loading ? '...' : `${avantages.length} avantage${avantages.length !== 1 ? 's' : ''} enregistré${avantages.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div style={{ display:'flex', gap:'10px' }}>
          <button onClick={load}
            style={{ display:'flex', alignItems:'center', gap:'6px', padding:'10px 16px',
              border:`1.5px solid ${C.border}`, borderRadius:'12px',
              background:'#fff', color:C.textMuted, fontSize:'0.85rem',
              cursor:'pointer', fontFamily:'inherit' }}>
            <Icon d="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15" size={14} />
            Actualiser
          </button>
          <button style={{ display:'flex', alignItems:'center', gap:'8px',
            padding:'10px 18px',
            background:`linear-gradient(135deg,${C.greenDeep},${C.greenMid})`,
            border:'none', borderRadius:'12px', color:'#fff', fontWeight:600,
            fontSize:'0.85rem', cursor:'pointer',
            boxShadow:'0 4px 14px rgba(13,92,58,0.25)', fontFamily:'inherit' }}>
            + Ajouter avantage
          </button>
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:'14px' }}>
        {[
          { label:'Total accordé',    val: fmt(totalAll),                                                                                          color:'#7c3aed', icon:'💰' },
          { label:'Disponible',       val: fmt(avantages.filter(a => a.statut === 'disponible').reduce((s, a) => s + (a.montant ?? 0), 0)),        color:C.greenMid, icon:'✅' },
          { label:'Utilisé',          val: fmt(avantages.filter(a => a.statut === 'utilisé').reduce((s, a) => s + (a.montant ?? 0), 0)),           color:'#6b7280', icon:'🔄' },
          { label:'Avantages actifs', val: `${nbActifs}`,                                                                                          color:'#d97706', icon:'⭐' },
        ].map(({ label, val, color, icon }, idx) => (
          <div key={label} style={{ background:'#fff', borderRadius:'16px', padding:'20px',
            boxShadow:'0 2px 10px rgba(13,92,58,0.07)', borderTop:`3px solid ${color}`,
            animation:`fadeUp 0.3s ease ${idx * 0.06}s both` }}>
            <p style={{ fontSize:'1.5rem', marginBottom:'6px' }}>{icon}</p>
            <p style={{ fontSize:'1.25rem', fontWeight:800, color }}>{loading ? '—' : val}</p>
            <p style={{ fontSize:'0.74rem', color:'#6b7280', marginTop:'2px', fontWeight:500 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* ── Répartition par type ── */}
      {!loading && avantages.length > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:'14px' }}>
          {TYPES.map(type => {
            const items = avantages.filter(a => a.type === type);
            const total = items.reduce((s, a) => s + (a.montant ?? 0), 0);
            return (
              <div key={type} style={{ background:'#fff', borderRadius:'14px', padding:'16px',
                boxShadow:'0 2px 8px rgba(13,92,58,0.06)' }}>
                <p style={{ fontSize:'0.78rem', color:C.textMuted, fontWeight:600, marginBottom:'6px' }}>{type}</p>
                <p style={{ fontSize:'1.15rem', fontWeight:800, color:C.textDark }}>{fmt(total)}</p>
                <p style={{ fontSize:'0.72rem', color:'#9ca3af', marginTop:'3px' }}>
                  {items.length} attribution{items.length > 1 ? 's' : ''}
                </p>
                <div style={{ height:'4px', background:'#e5e7eb', borderRadius:'2px',
                  marginTop:'10px', overflow:'hidden' }}>
                  <div style={{ height:'100%', borderRadius:'2px',
                    width: totalAll > 0 ? `${(total / totalAll) * 100}%` : '0%',
                    background:`linear-gradient(90deg,${C.greenMid},${C.greenBright})` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Filtres ── */}
      <div style={{ background:'#fff', borderRadius:'16px', padding:'16px 20px',
        border:`1px solid ${C.border}`, boxShadow:'0 2px 8px rgba(13,92,58,0.05)',
        display:'flex', gap:'12px', flexWrap:'wrap', alignItems:'center' }}>
        <Icon d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" size={16} stroke={C.textMuted} />
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          style={selectStyle}>
          <option value="all">Tous les types</option>
          {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)}
          style={selectStyle}>
          <option value="all">Tous les statuts</option>
          <option value="disponible">Disponible</option>
          <option value="utilisé">Utilisé</option>
          <option value="en attente">En attente</option>
        </select>
        {(filterType !== 'all' || filterStatut !== 'all') && (
          <button onClick={() => { setFilterType('all'); setFilterStatut('all'); }}
            style={{ padding:'8px 14px', border:'none', borderRadius:'10px',
              background:C.dangerPale, color:'#dc2626', fontSize:'0.78rem',
              fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
            ✕ Réinitialiser
          </button>
        )}
        <span style={{ marginLeft:'auto', fontSize:'0.78rem', color:C.textMuted }}>
          {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Table ── */}
      <div style={{ background:'#fff', borderRadius:'20px',
        border:`1px solid ${C.border}`,
        boxShadow:'0 2px 12px rgba(13,92,58,0.06)', overflow:'hidden' }}>
        {loading ? <Skeleton /> : filtered.length === 0 ? (
          <div style={{ padding:'60px', textAlign:'center', color:C.textMuted }}>
            <div style={{ fontSize:'2.5rem', marginBottom:'12px' }}>🎁</div>
            <p style={{ fontWeight:600, marginBottom:'4px' }}>Aucun avantage trouvé</p>
            <p style={{ fontSize:'0.82rem' }}>Modifiez vos filtres ou ajoutez un avantage</p>
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', minWidth:'600px' }}>
              <thead>
                <tr style={{ background:C.greenPale, borderBottom:`2px solid ${C.greenBorder}` }}>
                  {['Pharmacie', "Type d'avantage", 'Montant', 'Date', 'Statut', 'Actions'].map(h => (
                    <th key={h} style={{ padding:'13px 16px', textAlign:'left',
                      fontSize:'0.72rem', fontWeight:700, color:C.greenDeep,
                      textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((a, i) => (
                  <tr key={a.id} style={{ borderBottom:`1px solid ${C.border}`,
                    transition:'background 0.15s', animation:`fadeUp 0.3s ease ${i * 0.03}s both` }}>
                    <td style={td}>
                      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                        <div style={{ width:'34px', height:'34px', borderRadius:'10px',
                          background:C.greenPale, display:'flex', alignItems:'center',
                          justifyContent:'center', fontSize:'1rem', flexShrink:0 }}>
                          🏪
                        </div>
                        <span style={{ fontWeight:600, color:C.textDark, fontSize:'0.88rem' }}>
                          {a.pharmacie?.nom ?? `Pharmacie #${a.pharmacie_id}`}
                        </span>
                      </div>
                    </td>
                    <td style={td}>
                      <span style={{ display:'flex', alignItems:'center', gap:'6px',
                        fontSize:'0.84rem', color:'#374151' }}>
                        <span style={{ fontSize:'1rem' }}>{typeIcon(a.type)}</span>
                        {a.type || '—'}
                      </span>
                    </td>
                    <td style={td}>
                      <span style={{ fontWeight:800, color:'#7c3aed', fontSize:'0.9rem',
                        whiteSpace:'nowrap' }}>
                        {fmt(a.montant)}
                      </span>
                    </td>
                    <td style={td}>
                      <span style={{ fontSize:'0.8rem', color:C.textMuted }}>
                        {a.created_at
                          ? new Date(a.created_at).toLocaleDateString('fr-FR')
                          : '—'}
                      </span>
                    </td>
                    <td style={td}><Badge status={a.statut} /></td>
                    <td style={td}>
                      <div style={{ display:'flex', gap:'6px' }}>
                        <button style={{ padding:'5px 12px', background:'#ede9fe',
                          border:'none', borderRadius:'8px', color:'#7c3aed',
                          fontWeight:600, fontSize:'0.74rem', cursor:'pointer',
                          fontFamily:'inherit' }}>
                          Modifier
                        </button>
                        <button style={{ padding:'5px 12px', background:C.dangerPale,
                          border:'none', borderRadius:'8px', color:'#dc2626',
                          fontWeight:600, fontSize:'0.74rem', cursor:'pointer',
                          fontFamily:'inherit' }}>
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Solde par pharmacie ── */}
      {!loading && byPharmacy.length > 0 && (
        <div style={{ background:'#fff', borderRadius:'16px', padding:'22px',
          boxShadow:'0 2px 12px rgba(13,92,58,0.07)',
          border:`1px solid ${C.border}` }}>
          <h3 style={{ fontFamily:'Georgia,serif', fontWeight:700, color:C.textDark,
            marginBottom:'16px', fontSize:'1rem' }}>
            Solde par pharmacie
          </h3>
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {byPharmacy.map((p, idx) => (
              <div key={p.id} style={{ display:'flex', alignItems:'center', gap:'14px',
                padding:'12px 16px', background:C.greenPale, borderRadius:'12px',
                flexWrap:'wrap', animation:`fadeUp 0.3s ease ${idx * 0.05}s both` }}>
                <div style={{ width:'36px', height:'36px', borderRadius:'10px',
                  background:`linear-gradient(135deg,${C.greenMid},${C.greenBright})`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'1rem', flexShrink:0 }}>
                  🏪
                </div>
                <div style={{ flex:1, minWidth:'140px' }}>
                  <p style={{ fontWeight:700, fontSize:'0.88rem', color:C.textDark }}>{p.name}</p>
                  <p style={{ fontSize:'0.73rem', color:C.textMuted, marginTop:'1px' }}>
                    {p.avantages.length} avantage{p.avantages.length > 1 ? 's' : ''}
                  </p>
                </div>
                <div style={{ display:'flex', gap:'20px', alignItems:'center', flexWrap:'wrap' }}>
                  <div style={{ textAlign:'right' }}>
                    <p style={{ fontSize:'0.65rem', color:C.textMuted, fontWeight:700,
                      textTransform:'uppercase', letterSpacing:'0.05em' }}>Disponible</p>
                    <p style={{ fontSize:'0.95rem', fontWeight:800, color:C.greenMid }}>
                      {fmt(p.dispo)}
                    </p>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <p style={{ fontSize:'0.65rem', color:C.textMuted, fontWeight:700,
                      textTransform:'uppercase', letterSpacing:'0.05em' }}>Total</p>
                    <p style={{ fontSize:'0.95rem', fontWeight:800, color:'#7c3aed' }}>
                      {fmt(p.total)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}

const td = {
  padding:'13px 16px', fontSize:'0.875rem', color:C.textDark, verticalAlign:'middle'
};

const selectStyle = {
  padding:'9px 14px', border:`1.5px solid ${C.border}`, borderRadius:'12px',
  fontSize:'0.85rem', color:C.textDark, background:'#fff',
  cursor:'pointer', outline:'none', fontFamily:'inherit',
};