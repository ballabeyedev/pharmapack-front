import { useEffect, useState } from 'react';
import { C } from '../../components/Constant';
import { getStatistiqueAdmin } from '../../services/admin.service';

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
const Icon = ({ d, size = 20, stroke = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={stroke} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

/* ─────────────────────────────────────────────
   Skeleton loader
───────────────────────────────────────────── */
const Skeleton = ({ w = '100%', h = '20px', r = '8px' }) => (
  <div style={{
    width: w, height: h, borderRadius: r,
    background: 'linear-gradient(90deg,#f0faf5 25%,#e0f2ec 50%,#f0faf5 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
  }} />
);

/* ─────────────────────────────────────────────
   StatCard
───────────────────────────────────────────── */
const StatCard = ({ label, value, sub, icon, color, delay = 0, loading }) => (
  <div style={{
    background: C.white, borderRadius: '16px', padding: '22px',
    boxShadow: '0 2px 12px rgba(13,92,58,0.07)',
    borderLeft: `4px solid ${color}`,
    animation: `fadeUp 0.45s ${delay}s both`,
    display: 'flex', flexDirection: 'column', gap: '10px',
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
          {label}
        </p>
        {loading
          ? <Skeleton w="80px" h="36px" r="8px" />
          : <p style={{ fontSize: '1.9rem', fontWeight: 800, color: C.textDark, lineHeight: 1.2 }}>{value}</p>
        }
      </div>
      <div style={{ width: '44px', height: '44px', borderRadius: '12px',
        background: `${color}18`, display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexShrink: 0 }}>
        <Icon d={icon} size={22} stroke={color} />
      </div>
    </div>
    {loading
      ? <Skeleton w="60%" h="14px" />
      : <p style={{ fontSize: '0.76rem', color: '#6b7280' }}>{sub}</p>
    }
  </div>
);

/* ─────────────────────────────────────────────
   Donut simple (SVG)
───────────────────────────────────────────── */
const Donut = ({ segments }) => {
  const r = 52, cx = 60, cy = 60, stroke = 14;
  const circ = 2 * Math.PI * r;
  const total = segments.reduce((s, sg) => s + sg.value, 0);
  let offset = 0;
  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth={stroke} />
      {segments.map((sg, i) => {
        const dash = (sg.value / total) * circ;
        const gap  = circ - dash;
        const el = (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={sg.color} strokeWidth={stroke}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset}
            strokeLinecap="butt"
            style={{ transform: 'rotate(-90deg)', transformOrigin: '60px 60px', transition: 'stroke-dasharray 0.6s ease' }}
          />
        );
        offset += dash;
        return el;
      })}
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize="15" fontWeight="800" fill={C.textDark}>
        {total}
      </text>
    </svg>
  );
};

/* ─────────────────────────────────────────────
   Page principale
───────────────────────────────────────────── */
export default function DashboardPage({ setPage }) {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await getStatistiqueAdmin();
        // Le backend retourne { message, stats: { ... } }
        setStats(res.stats);
      } catch (err) {
        console.error('Erreur dashboard :', err);
        setError('Impossible de charger les statistiques.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* Valeurs extraites avec fallback */
  const pharmaciesActives   = stats?.pharmaciesActives   ?? 0;
  const pharmaciesEnAttente = stats?.pharmaciesEnAttente ?? 0;
  const commandesValidees   = stats?.commandesValidees   ?? 0;
  const commandesEnAttente  = stats?.commandesEnAttente  ?? 0;
  const totalProduits       = stats?.totalProduits       ?? 0;
  const totalCommandes      = commandesValidees + commandesEnAttente;

  const pharmaciesTotal = pharmaciesActives + pharmaciesEnAttente;

  /* Segments donut pharmacies */
  const donutPharmacies = [
    { label: 'Actives',     value: pharmaciesActives   || 0, color: C.greenMid  },
    { label: 'En attente',  value: pharmaciesEnAttente || 0, color: '#d97706'   },
  ].filter(s => s.value > 0);

  /* Segments donut commandes */
  const donutCommandes = [
    { label: 'Validées',    value: commandesValidees   || 0, color: C.greenMid  },
    { label: 'En attente',  value: commandesEnAttente  || 0, color: '#d97706'   },
  ].filter(s => s.value > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'DM Sans, sans-serif' }}>
      <style>{`
        @keyframes fadeUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>

      {/* ── Erreur ── */}
      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '14px',
          padding: '14px 18px', color: '#991b1b', fontSize: '0.875rem', fontWeight: 600 }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── Welcome banner ── */}
      <div style={{
        background: `linear-gradient(135deg, ${C.greenDeep} 0%, ${C.greenMid} 60%, ${C.greenBright} 100%)`,
        borderRadius: '18px', padding: '24px 28px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '16px', animation: 'fadeUp 0.4s both',
      }}>
        <div>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem', marginBottom: '6px' }}>Bonjour 👋</p>
          <h2 style={{ color: '#fff', fontFamily: 'Georgia, serif',
            fontSize: 'clamp(1.1rem, 3vw, 1.55rem)', fontWeight: 700 }}>
            Bienvenue sur PharmaPack Admin
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.83rem', marginTop: '6px' }}>
            {loading
              ? 'Chargement des statistiques...'
              : `${pharmaciesActives} pharmacie${pharmaciesActives !== 1 ? 's' : ''} active${pharmaciesActives !== 1 ? 's' : ''} · ${commandesEnAttente} commande${commandesEnAttente !== 1 ? 's' : ''} en attente`
            }
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => setPage('pharmacies')}
            style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.18)',
              border: '1px solid rgba(255,255,255,0.28)', borderRadius: '10px',
              color: '#fff', fontSize: '0.84rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            Voir pharmacies
          </button>
          <button onClick={() => setPage('orders')}
            style={{ padding: '10px 20px', background: '#fff', border: 'none',
              borderRadius: '10px', color: C.greenDeep, fontSize: '0.84rem',
              fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            Voir commandes
          </button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '16px' }}>
        <StatCard
          label="Pharmacies actives"
          value={pharmaciesActives}
          sub={`/${pharmaciesTotal} enregistrée${pharmaciesTotal !== 1 ? 's' : ''}`}
          icon="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM12 8v8M8 12h8"
          color={C.greenMid} delay={0} loading={loading}
        />
        <StatCard
          label="Pharmacies en attente"
          value={pharmaciesEnAttente}
          sub="En attente de validation"
          icon="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
          color="#d97706" delay={0.05} loading={loading}
        />
        <StatCard
          label="Commandes validées"
          value={commandesValidees}
          sub="Statut : en préparation"
          icon={["M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2","M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2","M9 12h6","M9 16h4"]}
          color="#2563eb" delay={0.1} loading={loading}
        />
        <StatCard
          label="Commandes en attente"
          value={commandesEnAttente}
          sub={`${totalCommandes} commande${totalCommandes !== 1 ? 's' : ''} au total`}
          icon="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
          color="#dc2626" delay={0.15} loading={loading}
        />
        <StatCard
          label="Produits catalogue"
          value={totalProduits}
          sub="Produits enregistrés"
          icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          color="#7c3aed" delay={0.2} loading={loading}
        />
      </div>

      {/* ── Donuts + taux ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>

        {/* Donut pharmacies */}
        <div style={card}>
          <p style={{ fontFamily:'Georgia,serif', fontWeight:700, color:C.textDark,
            marginBottom:'20px', fontSize:'0.95rem' }}>
            Répartition des pharmacies
          </p>
          {loading ? (
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              <Skeleton w="120px" h="120px" r="50%" />
              <Skeleton h="16px" />
              <Skeleton w="70%" h="16px" />
            </div>
          ) : (
            <div style={{ display:'flex', alignItems:'center', gap:'24px', flexWrap:'wrap' }}>
              {(donutPharmacies.length > 0)
                ? <Donut segments={donutPharmacies} />
                : <p style={{ color:C.textMuted, fontSize:'0.85rem' }}>Aucune donnée</p>
              }
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {[
                  { label:'Actives',    value:pharmaciesActives,   color:C.greenMid },
                  { label:'En attente', value:pharmaciesEnAttente, color:'#d97706'  },
                ].map(s => (
                  <div key={s.label} style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                    <span style={{ width:'10px', height:'10px', borderRadius:'50%',
                      background:s.color, flexShrink:0 }} />
                    <span style={{ fontSize:'0.82rem', color:C.textMuted }}>{s.label}</span>
                    <span style={{ marginLeft:'auto', fontWeight:700, color:C.textDark,
                      fontSize:'0.88rem', paddingLeft:'12px' }}>
                      {s.value}
                    </span>
                  </div>
                ))}
                <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:'8px', marginTop:'2px' }}>
                  <span style={{ fontSize:'0.78rem', color:C.textMuted }}>Total : </span>
                  <span style={{ fontWeight:700, color:C.textDark }}>{pharmaciesTotal}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Donut commandes */}
        <div style={card}>
          <p style={{ fontFamily:'Georgia,serif', fontWeight:700, color:C.textDark,
            marginBottom:'20px', fontSize:'0.95rem' }}>
            Répartition des commandes
          </p>
          {loading ? (
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              <Skeleton w="120px" h="120px" r="50%" />
              <Skeleton h="16px" />
              <Skeleton w="70%" h="16px" />
            </div>
          ) : (
            <div style={{ display:'flex', alignItems:'center', gap:'24px', flexWrap:'wrap' }}>
              {(donutCommandes.length > 0)
                ? <Donut segments={donutCommandes} />
                : <p style={{ color:C.textMuted, fontSize:'0.85rem' }}>Aucune commande</p>
              }
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {[
                  { label:'Validées',   value:commandesValidees,  color:C.greenMid },
                  { label:'En attente', value:commandesEnAttente, color:'#d97706'  },
                ].map(s => (
                  <div key={s.label} style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                    <span style={{ width:'10px', height:'10px', borderRadius:'50%',
                      background:s.color, flexShrink:0 }} />
                    <span style={{ fontSize:'0.82rem', color:C.textMuted }}>{s.label}</span>
                    <span style={{ marginLeft:'auto', fontWeight:700, color:C.textDark,
                      fontSize:'0.88rem', paddingLeft:'12px' }}>
                      {s.value}
                    </span>
                  </div>
                ))}
                <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:'8px', marginTop:'2px' }}>
                  <span style={{ fontSize:'0.78rem', color:C.textMuted }}>Total : </span>
                  <span style={{ fontWeight:700, color:C.textDark }}>{totalCommandes}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Taux de validation */}
        <div style={card}>
          <p style={{ fontFamily:'Georgia,serif', fontWeight:700, color:C.textDark,
            marginBottom:'20px', fontSize:'0.95rem' }}>
            Indicateurs clés
          </p>
          {loading ? (
            <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              {[1,2,3].map(i => <Skeleton key={i} h="52px" r="12px" />)}
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              {[
                {
                  label: 'Taux validation pharmacies',
                  value: pharmaciesTotal > 0
                    ? `${Math.round((pharmaciesActives / pharmaciesTotal) * 100)}%`
                    : '—',
                  pct: pharmaciesTotal > 0
                    ? (pharmaciesActives / pharmaciesTotal) * 100
                    : 0,
                  color: C.greenMid,
                  icon: '🏪',
                },
                {
                  label: 'Commandes traitées',
                  value: totalCommandes > 0
                    ? `${Math.round((commandesValidees / totalCommandes) * 100)}%`
                    : '—',
                  pct: totalCommandes > 0
                    ? (commandesValidees / totalCommandes) * 100
                    : 0,
                  color: '#2563eb',
                  icon: '📦',
                },
                {
                  label: 'Produits disponibles',
                  value: totalProduits,
                  pct: 100,
                  color: '#7c3aed',
                  icon: '💊',
                },
              ].map(({ label, value, pct, color, icon }) => (
                <div key={label} style={{ padding:'12px 14px', background:C.greenPale,
                  borderRadius:'12px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between',
                    alignItems:'center', marginBottom:'8px' }}>
                    <span style={{ fontSize:'0.82rem', color:C.textDark, fontWeight:600 }}>
                      {icon} {label}
                    </span>
                    <span style={{ fontSize:'0.9rem', fontWeight:800, color }}>
                      {value}
                    </span>
                  </div>
                  <div style={{ height:'6px', background:'#e5e7eb', borderRadius:'3px',
                    overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${pct}%`,
                      background:`linear-gradient(90deg,${color},${color}99)`,
                      borderRadius:'3px', transition:'width 0.8s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Actions rapides ── */}
      <div style={card}>
        <p style={{ fontFamily:'Georgia,serif', fontWeight:700, color:C.textDark,
          marginBottom:'16px', fontSize:'0.95rem' }}>
          Accès rapides
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(170px, 1fr))', gap:'12px' }}>
          {[
            { label:'Pharmacies actives',    page:'pharmacies',   icon:'🏪', count: pharmaciesActives,   color:C.greenMid },
            { label:'En attente validation', page:'pharmacies',   icon:'⏳', count: pharmaciesEnAttente, color:'#d97706'  },
            { label:'Commandes en attente',  page:'orders',       icon:'📦', count: commandesEnAttente,  color:'#dc2626'  },
            { label:'Commandes validées',    page:'orders',       icon:'✅', count: commandesValidees,   color:'#2563eb'  },
            { label:'Catalogue produits',    page:'produits',     icon:'💊', count: totalProduits,       color:'#7c3aed'  },
          ].map(({ label, page, icon, count, color }) => (
            <button key={label} onClick={() => setPage(page)}
              style={{ padding:'16px', border:`1.5px solid ${C.border}`,
                borderRadius:'14px', background:'#fff', cursor:'pointer',
                textAlign:'left', transition:'all 0.15s', fontFamily:'inherit',
                display:'flex', flexDirection:'column', gap:'8px' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.background = `${color}08`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = '#fff'; }}>
              <span style={{ fontSize:'1.4rem' }}>{icon}</span>
              <span style={{ fontSize:'1.4rem', fontWeight:800, color,
                lineHeight:1 }}>
                {loading ? '—' : count}
              </span>
              <span style={{ fontSize:'0.75rem', color:C.textMuted, fontWeight:500,
                lineHeight:1.3 }}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}

const card = {
  background: C.white, borderRadius: '16px', padding: '22px',
  boxShadow: '0 2px 12px rgba(13,92,58,0.07)',
  border: `1px solid ${C.border}`,
};