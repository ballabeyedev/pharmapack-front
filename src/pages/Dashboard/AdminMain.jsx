import { useState } from 'react';
import Sidebar           from '../../components/Sidebar';
import Navbar            from '../../components/Navbar';
import DashboardPage     from '../Dashboard/Dashboard';
import PharmaciesPage    from '../Pharmacies/PharmaciesList';
import OrdersPage        from '../Commandes/CommandesList';
import AvantagesPage     from '../Avantages/AvantagesList';
import ProduitsPage      from '../Produits/ProduitList.jsx';
import ProfilPage        from '../Profils/Profils.jsx';
import CategoriesPage    from '../Categories/CategoriesList.jsx';
import NiveauxPage       from '../Niveaux/NiveauxList.jsx';

/* ── Logout modal ─────────────────────────────────────────── */
const LogoutModal = ({ onCancel, onConfirm }) => (
  <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:999,
    display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }}>
    <div style={{ background:'#fff', borderRadius:'20px', padding:'36px 32px', maxWidth:'360px',
      width:'100%', textAlign:'center', boxShadow:'0 24px 60px rgba(0,0,0,0.18)',
      animation:'fadeUp 0.3s ease both' }}>
      <div style={{ width:'60px', height:'60px', background:'#fee2e2', borderRadius:'50%',
        display:'flex', alignItems:'center', justifyContent:'center',
        margin:'0 auto 16px', fontSize:'1.6rem' }}>🚪</div>
      <h3 style={{ fontFamily:'Georgia,serif', fontSize:'1.2rem', color:'#0a2e1e', marginBottom:'8px' }}>
        Déconnexion
      </h3>
      <p style={{ color:'#6b7280', fontSize:'0.88rem', marginBottom:'24px' }}>
        Êtes-vous sûr de vouloir vous déconnecter de PharmaPack ?
      </p>
      <div style={{ display:'flex', gap:'12px' }}>
        <button onClick={onCancel}
          style={{ flex:1, padding:'12px', border:'1.5px solid #d1d5db', borderRadius:'12px',
            background:'#fff', fontSize:'0.9rem', cursor:'pointer', color:'#374151',
            fontWeight:500, fontFamily:'inherit' }}>
          Annuler
        </button>
        <button onClick={onConfirm}
          style={{ flex:1, padding:'12px', border:'none', borderRadius:'12px',
            background:'linear-gradient(135deg,#dc2626,#ef4444)',
            color:'#fff', fontSize:'0.9rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
          Déconnecter
        </button>
      </div>
    </div>
  </div>
);

/* ── Main ─────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const [page,        setPage]       = useState('dashboard');
  const [sidebarOpen, setSidebar]    = useState(true);
  const [mobileSide,  setMobileSide] = useState(false);
  const [logoutModal, setLogout]     = useState(false);

  const handleLogout = () => {
    // Replace with: logout() from auth.service then navigate('/')
    window.location.href = '/';
  };

  const pages = {
    dashboard:    <DashboardPage    setPage={setPage} />,
    pharmacies:   <PharmaciesPage />,
    orders:       <OrdersPage />,
    avantages:    <AvantagesPage />,
    produits:     <ProduitsPage />,
    profil:       <ProfilPage />,
    categories:   <CategoriesPage />,
    niveaux:      <NiveauxPage />,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');
        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'DM Sans', sans-serif; background:#f4faf7; -webkit-font-smoothing:antialiased; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        button { font-family:inherit; }
        input, select, textarea { font-family:inherit; }
        ::-webkit-scrollbar { width:6px; height:6px; }
        ::-webkit-scrollbar-track { background:#f4faf7; }
        ::-webkit-scrollbar-thumb { background:#b8dece; border-radius:3px; }
        tr:hover td { background:#f0faf5 !important; }
        .hide-mobile { display:flex !important; }
        .show-mobile { display:none !important; }
        .hide-small  { display:inline !important; }
        @media(max-width:768px) {
          .hide-mobile { display:none !important; }
          .show-mobile { display:flex !important; }
        }
        @media(max-width:420px) {
          .hide-small { display:none !important; }
        }
      `}</style>

      <div style={{ display:'flex', minHeight:'100vh', background:'#f4faf7' }}>

        {/* Desktop sidebar */}
        <div className="hide-mobile">
          <Sidebar
            page={page} setPage={setPage}
            open={sidebarOpen} mobile={false}
            onLogout={() => setLogout(true)}
          />
        </div>

        {/* Mobile overlay */}
        {mobileSide && (
          <div onClick={() => setMobileSide(false)}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:200 }} />
        )}

        {/* Mobile sidebar */}
        <div className="show-mobile">
          <Sidebar
            page={page} setPage={setPage}
            open={true} mobile={true}
            mobileSide={mobileSide} setMobileSide={setMobileSide}
            onLogout={() => setLogout(true)}
          />
        </div>

        {/* Content area */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden' }}>
          <Navbar
            page={page}
            sidebarOpen={sidebarOpen} setSidebar={setSidebar}
            mobileSide={mobileSide} setMobileSide={setMobileSide}
          />
          <main style={{ flex:1, padding:'clamp(14px, 3vw, 28px)', overflowY:'auto', overflowX:'hidden' }}>
            {pages[page] || <DashboardPage setPage={setPage} />}
          </main>
        </div>
      </div>

      {logoutModal && (
        <LogoutModal
          onCancel={() => setLogout(false)}
          onConfirm={handleLogout}
        />
      )}
    </>
  );
}