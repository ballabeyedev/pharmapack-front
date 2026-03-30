import { C } from './Constant';
import { getUser } from '../services/auth.service';

const PAGE_TITLES = {
  dashboard:    'Tableau de bord',
  pharmacies:   'Liste des pharmacies',
  orders:       'Liste des commandes',
  avantages:    'Avantages & Remises',
  produits:     'Catalogue produits',
  profil:       'Profil administrateur',
  categories:   'Gestion des catégories',
  niveaux:      'Niveaux de fidélité',
};

const Icon = ({ d, size = 20, stroke = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke}
    strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

export default function Navbar({ page, sidebarOpen, setSidebar, mobileSide, setMobileSide }) {
  const user = getUser();

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <header style={{
      height: '64px', background: C.white, borderBottom: `1px solid ${C.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 20px 0 16px', position: 'sticky', top: 0, zIndex: 100,
      boxShadow: '0 1px 6px rgba(13,92,58,0.07)', flexShrink: 0, gap: '12px',
    }}>

      {/* ── LEFT ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
        <button onClick={() => setSidebar(v => !v)} className="hide-mobile"
          style={btnReset} title={sidebarOpen ? 'Réduire' : 'Agrandir'}>
          <Icon d="M3 12h18M3 6h18M3 18h18" size={20} stroke={C.greenDeep} />
        </button>
        <button onClick={() => setMobileSide(v => !v)} className="show-mobile" style={btnReset}>
          <Icon d="M3 12h18M3 6h18M3 18h18" size={20} stroke={C.greenDeep} />
        </button>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)',
            fontWeight: 700, color: C.textDark, whiteSpace: 'nowrap',
            overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {PAGE_TITLES[page] || 'PharmaPack Admin'}
          </h1>
          <p className="hide-small" style={{ fontSize: '0.72rem', color: C.textMuted,
            marginTop: '1px', textTransform: 'capitalize' }}>
            {today}
          </p>
        </div>
      </div>

      {/* ── RIGHT ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <div className="hide-mobile" style={{ width: '1px', height: '32px', background: C.border }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px',
          padding: '6px 12px 6px 6px', background: C.greenPale, borderRadius: '24px', cursor: 'pointer' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden',
            background: `linear-gradient(135deg, ${C.greenMid}, ${C.greenBright})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '0.75rem', fontWeight: 'bold' }}>
            {user?.photoProfil ? (
              <img src={user.photoProfil} alt="avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              `${user?.prenom?.[0] || ''}${user?.nom?.[0] || 'U'}`
            )}
          </div>
          <div className="hide-small">
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: C.textDark, lineHeight: 1 }}>
              {user?.prenom || 'Utilisateur'} {user?.nom || ''}
            </p>
            <p style={{ fontSize: '0.67rem', color: C.textMuted, marginTop: '1px' }}>
              {user?.role || 'Rôle'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

const btnReset = {
  background: 'none', border: 'none', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: '8px', borderRadius: '10px', transition: 'background 0.15s',
};