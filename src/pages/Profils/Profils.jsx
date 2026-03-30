import { useState } from 'react';
import { C, pharmacies, orders, fmt } from '../../components/Constant';

export default function ProfilPage() {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    nom: 'Administrateur PharmaPack',
    email: 'admin@pharmapack.sn',
    telephone: '+221 77 000 00 00',
    role: 'Super Administrateur',
    ville: 'Dakar, Sénégal',
  });
  const [saved, setSaved] = useState(false);

  const save = () => {
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const stats = [
    { label:'Pharmacies gérées', val:pharmacies.length, color:C.greenMid },
    { label:'Commandes traitées', val:orders.length, color:C.blue },
    { label:'CA total géré', val:fmt(pharmacies.reduce((s,p)=>s+p.ca,0)), color:'#7c3aed' },
    { label:'Remises accordées', val:fmt(85000), color:C.amber },
  ];

  const activities = [
    { action:'Commande #CMD-2041 validée', time:'Il y a 2h', type:'success' },
    { action:'Pharmacie Almadies ajoutée', time:'Il y a 5h', type:'info' },
    { action:'Remise accordée à Pharmacie Centrale', time:'Hier', type:'warning' },
    { action:'Stock mis à jour pour 3 produits', time:'Hier', type:'info' },
    { action:'Commande #CMD-2037 annulée', time:'Il y a 2 jours', type:'danger' },
    { action:'Rapport mensuel généré', time:'Il y a 3 jours', type:'success' },
  ];

  const typeColor = { success:C.greenMid, info:C.blue, warning:C.amber, danger:'#dc2626' };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'24px' }}>

      {/* Saved toast */}
      {saved && (
        <div style={{ position:'fixed', top:'80px', right:'24px', background:C.greenMid, color:'#fff', padding:'12px 20px', borderRadius:'12px', fontSize:'0.88rem', fontWeight:600, zIndex:999, boxShadow:'0 8px 24px rgba(26,125,82,0.35)', animation:'fadeUp 0.3s ease' }}>
          ✓ Profil mis à jour avec succès
        </div>
      )}

      {/* Profile hero */}
      <div style={{ background:`linear-gradient(135deg, ${C.greenDeep} 0%, ${C.greenMid} 60%, ${C.greenBright} 100%)`, borderRadius:'20px', padding:'32px', display:'flex', alignItems:'center', gap:'24px', flexWrap:'wrap' }}>
        <div style={{ width:'80px', height:'80px', background:'rgba(255,255,255,0.2)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', border:'3px solid rgba(255,255,255,0.4)', flexShrink:0 }}>
          <span style={{ fontSize:'2rem' }}>👤</span>
        </div>
        <div style={{ flex:1 }}>
          <h2 style={{ color:'#fff', fontFamily:'Georgia,serif', fontSize:'1.4rem', fontWeight:700 }}>{form.nom}</h2>
          <p style={{ color:'rgba(255,255,255,0.7)', fontSize:'0.88rem', marginTop:'4px' }}>{form.role} · {form.ville}</p>
          <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.82rem', marginTop:'2px' }}>{form.email}</p>
        </div>
        <button
          onClick={() => setEditing(v => !v)}
          style={{ padding:'10px 20px', background:'rgba(255,255,255,0.18)', border:'1px solid rgba(255,255,255,0.3)', borderRadius:'12px', color:'#fff', fontWeight:600, fontSize:'0.85rem', cursor:'pointer' }}>
          {editing ? '✕ Annuler' : '✎ Modifier'}
        </button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:'20px' }}>

        {/* Edit form */}
        <div style={{ background:C.white, borderRadius:'16px', padding:'24px', boxShadow:'0 2px 12px rgba(13,92,58,0.07)' }}>
          <h3 style={{ fontFamily:'Georgia,serif', fontWeight:700, color:C.textDark, marginBottom:'20px', fontSize:'1rem' }}>
            {editing ? '✎ Modifier le profil' : 'Informations du compte'}
          </h3>
          <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            {[
              { key:'nom', label:'Nom complet', type:'text' },
              { key:'email', label:'Email', type:'email' },
              { key:'telephone', label:'Téléphone', type:'tel' },
              { key:'role', label:'Rôle', type:'text' },
              { key:'ville', label:'Ville', type:'text' },
            ].map(({ key, label, type }) => (
              <div key={key}>
                <p style={{ fontSize:'0.72rem', fontWeight:700, color:C.textMuted, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'5px' }}>{label}</p>
                {editing ? (
                  <input
                    type={type}
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{ width:'100%', padding:'10px 12px', border:`1.5px solid ${C.border}`, borderRadius:'10px', fontSize:'0.88rem', color:C.textDark, background:C.greenPale, outline:'none', boxSizing:'border-box' }}
                  />
                ) : (
                  <p style={{ fontSize:'0.9rem', fontWeight:600, color:C.textDark, padding:'10px 12px', background:C.greenPale, borderRadius:'10px' }}>{form[key]}</p>
                )}
              </div>
            ))}
            {editing && (
              <button onClick={save} style={{ marginTop:'4px', padding:'12px', background:`linear-gradient(135deg,${C.greenMid},${C.greenBright})`, border:'none', borderRadius:'12px', color:'#fff', fontWeight:700, fontSize:'0.9rem', cursor:'pointer', boxShadow:'0 4px 14px rgba(26,125,82,0.28)' }}>
                ✓ Enregistrer les modifications
              </button>
            )}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>

          {/* Stats */}
          <div style={{ background:C.white, borderRadius:'16px', padding:'24px', boxShadow:'0 2px 12px rgba(13,92,58,0.07)' }}>
            <h3 style={{ fontFamily:'Georgia,serif', fontWeight:700, color:C.textDark, marginBottom:'16px', fontSize:'1rem' }}>Statistiques d'activité</h3>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
              {stats.map(({ label, val, color }) => (
                <div key={label} style={{ background:C.greenPale, borderRadius:'12px', padding:'14px', borderLeft:`3px solid ${color}` }}>
                  <p style={{ fontSize:'0.96rem', fontWeight:800, color }}>{val}</p>
                  <p style={{ fontSize:'0.72rem', color:'#6b7280', marginTop:'3px', fontWeight:500 }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent activity */}
          <div style={{ background:C.white, borderRadius:'16px', padding:'24px', boxShadow:'0 2px 12px rgba(13,92,58,0.07)' }}>
            <h3 style={{ fontFamily:'Georgia,serif', fontWeight:700, color:C.textDark, marginBottom:'16px', fontSize:'1rem' }}>Activité récente</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:'0' }}>
              {activities.map((a, i) => (
                <div key={i} style={{ display:'flex', gap:'12px', alignItems:'flex-start', paddingBottom:'14px', marginBottom:'14px', borderBottom:i<activities.length-1?`1px solid ${C.greenPale}`:'none' }}>
                  <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:typeColor[a.type], flexShrink:0, marginTop:'5px' }} />
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:'0.83rem', fontWeight:500, color:C.textDark }}>{a.action}</p>
                    <p style={{ fontSize:'0.72rem', color:'#9ca3af', marginTop:'2px' }}>{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security */}
          <div style={{ background:C.white, borderRadius:'16px', padding:'24px', boxShadow:'0 2px 12px rgba(13,92,58,0.07)' }}>
            <h3 style={{ fontFamily:'Georgia,serif', fontWeight:700, color:C.textDark, marginBottom:'16px', fontSize:'1rem' }}>Sécurité</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              <button style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 14px', background:C.greenPale, border:'none', borderRadius:'12px', cursor:'pointer', textAlign:'left' }}>
                <div>
                  <p style={{ fontSize:'0.85rem', fontWeight:600, color:C.textDark }}>🔒 Changer le mot de passe</p>
                  <p style={{ fontSize:'0.72rem', color:'#6b7280', marginTop:'2px' }}>Dernière modification il y a 30 jours</p>
                </div>
                <span style={{ color:C.textMuted, fontSize:'1.1rem' }}>›</span>
              </button>
              <button style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 14px', background:C.greenPale, border:'none', borderRadius:'12px', cursor:'pointer', textAlign:'left' }}>
                <div>
                  <p style={{ fontSize:'0.85rem', fontWeight:600, color:C.textDark }}>📱 Double authentification</p>
                  <p style={{ fontSize:'0.72rem', color:'#6b7280', marginTop:'2px' }}>Non activée</p>
                </div>
                <span style={{ color:C.textMuted, fontSize:'1.1rem' }}>›</span>
              </button>
              <button style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 14px', background:'#fef2f2', border:'none', borderRadius:'12px', cursor:'pointer', textAlign:'left' }}>
                <div>
                  <p style={{ fontSize:'0.85rem', fontWeight:600, color:'#dc2626' }}>🚪 Déconnexion</p>
                  <p style={{ fontSize:'0.72rem', color:'#6b7280', marginTop:'2px' }}>Terminer la session en cours</p>
                </div>
                <span style={{ color:'#dc2626', fontSize:'1.1rem' }}>›</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}