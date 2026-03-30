import { C } from './Constant';

const NAV_ITEMS = [
  {
    group: 'Principal',
    items: [
      { key: 'dashboard',    label: 'Tableau de bord', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
      { key: 'pharmacies',   label: 'Pharmacies',      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
      { key: 'orders',       label: 'Commandes',       icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
      { key: 'produits',     label: 'Produits',        icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    ]
  },
  {
    group: 'Gestion',
    items: [
      { key: 'avantages',    label: 'Avantages',       icon: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7' },
      { key: 'categories',   label: 'Catégories',      icon: 'M4 6h16M4 10h16M4 14h8' },
      { key: 'niveaux',      label: 'Niveaux',         icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    ]
  },
  {
    group: 'Compte',
    items: [
      { key: 'profil',       label: 'Mon profil',      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    ]
  }
];

const Icon = ({ d, size = 18, stroke = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke}
    strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

export default function Sidebar({ page, setPage, open, mobile, mobileSide, setMobileSide, onLogout }) {
  const isVisible = mobile ? mobileSide : open;
  const width     = isVisible ? '240px' : '72px';

  const handleNav = (key) => {
    setPage(key);
    if (mobile && setMobileSide) setMobileSide(false);
  };

  return (
    <div style={{
      width, minWidth: width, height: '100vh', background: C.greenDeep,
      display: 'flex', flexDirection: 'column', transition: 'width 0.25s ease, min-width 0.25s ease',
      overflow: 'hidden', position: mobile ? 'fixed' : 'sticky', top: 0, zIndex: mobile ? 300 : 'auto',
      boxShadow: mobile && mobileSide ? '4px 0 24px rgba(0,0,0,0.25)' : 'none',
      transform: mobile && !mobileSide ? 'translateX(-100%)' : 'translateX(0)',
    }}>

      {/* Logo */}
      <div style={{ padding: isVisible ? '22px 20px 18px' : '22px 0 18px',
        display: 'flex', alignItems: 'center', gap: '12px',
        justifyContent: isVisible ? 'flex-start' : 'center',
        borderBottom: '1px solid rgba(255,255,255,0.12)', flexShrink: 0 }}>
        <div style={{ width:'36px', height:'36px', borderRadius:'12px',
          background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center',
          justifyContent:'center', fontSize:'1.2rem', flexShrink:0 }}>
          💊
        </div>
        {isVisible && (
          <div>
            <p style={{ color:'#fff', fontFamily:'Georgia,serif', fontSize:'1rem', fontWeight:700, lineHeight:1.1 }}>
              PharmaPack
            </p>
            <p style={{ color:'rgba(255,255,255,0.55)', fontSize:'0.7rem', marginTop:'2px' }}>
              Administration
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex:1, overflowY:'auto', overflowX:'hidden', padding:'12px 0' }}>
        {NAV_ITEMS.map(group => (
          <div key={group.group}>
            {isVisible && (
              <p style={{ padding:'10px 20px 4px', fontSize:'0.65rem', fontWeight:700,
                color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.1em' }}>
                {group.group}
              </p>
            )}
            {group.items.map(item => {
              const active = page === item.key;
              return (
                <button key={item.key} onClick={() => handleNav(item.key)}
                  title={!isVisible ? item.label : ''}
                  style={{ width:'100%', padding: isVisible ? '10px 20px' : '10px 0',
                    display:'flex', alignItems:'center', gap:'12px', border:'none', cursor:'pointer',
                    background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                    color: active ? '#fff' : 'rgba(255,255,255,0.65)',
                    fontFamily:'inherit', fontSize:'0.875rem', fontWeight: active ? 700 : 500,
                    transition:'all 0.15s', position:'relative', textAlign:'left',
                    justifyContent: isVisible ? 'flex-start' : 'center',
                    borderLeft: active ? '3px solid rgba(255,255,255,0.8)' : '3px solid transparent' }}>
                  <Icon d={item.icon} size={18} stroke={active ? '#fff' : 'rgba(255,255,255,0.65)'} />
                  {isVisible && <span style={{ whiteSpace:'nowrap' }}>{item.label}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: isVisible ? '12px 12px 20px' : '12px 0 20px',
        borderTop:'1px solid rgba(255,255,255,0.12)', flexShrink:0 }}>
        <button onClick={onLogout}
          style={{ width:'100%', padding: isVisible ? '10px 16px' : '10px 0',
            display:'flex', alignItems:'center', gap:'10px', border:'none', cursor:'pointer',
            background:'rgba(220,38,38,0.15)', borderRadius:'12px', color:'#fca5a5',
            fontFamily:'inherit', fontSize:'0.875rem', fontWeight:600, transition:'all 0.15s',
            justifyContent: isVisible ? 'flex-start' : 'center' }}>
          <Icon d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            size={18} stroke="#fca5a5" />
          {isVisible && <span>Déconnexion</span>}
        </button>
      </div>
    </div>
  );
}