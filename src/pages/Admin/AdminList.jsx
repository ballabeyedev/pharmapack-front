import { useState, useEffect, useCallback } from 'react';
import { C } from '../../components/Constant';
import { getAdmins, modifierAdmin } from '../../services/admin.service';

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
const Icon = ({ d, size = 18, stroke = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={stroke} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const Toast = ({ msg, type }) => (
  <div style={{ position:'fixed', bottom:'28px', right:'28px', zIndex:1000,
    background: type === 'error' ? '#dc2626' : C.greenDeep,
    color:'#fff', padding:'12px 22px', borderRadius:'14px',
    fontSize:'0.875rem', fontWeight:600, boxShadow:'0 8px 32px rgba(0,0,0,0.18)',
    animation:'fadeUp 0.3s ease both' }}>
    {msg}
  </div>
);

const SkeletonRow = () => (
  <tr>
    {[48, 180, 140, 160, 110, 90].map((w, i) => (
      <td key={i} style={{ padding:'14px 16px' }}>
        <div style={{ height:'16px', width:`${w}px`, maxWidth:'100%', borderRadius:'6px',
          background:'linear-gradient(90deg,#f0faf5 25%,#e0f2ec 50%,#f0faf5 75%)',
          backgroundSize:'200% 100%', animation:'shimmer 1.4s infinite' }} />
      </td>
    ))}
  </tr>
);

/* Avatar initiales */
const Avatar = ({ user, size = 40 }) => {
  const initiales = `${user?.prenom?.[0] || ''}${user?.nom?.[0] || ''}`.toUpperCase() || '?';
  return (
    <div style={{ width:`${size}px`, height:`${size}px`, borderRadius:'50%',
      overflow:'hidden', flexShrink:0,
      background:`linear-gradient(135deg,${C.greenMid},${C.greenBright})`,
      display:'flex', alignItems:'center', justifyContent:'center' }}>
      {user?.photo ? (
        <img src={user.photo} alt=""
          style={{ width:'100%', height:'100%', objectFit:'cover' }} />
      ) : (
        <span style={{ color:'#fff', fontWeight:700,
          fontSize: size > 48 ? '1.2rem' : '0.78rem' }}>
          {initiales}
        </span>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   Modal Consulter
───────────────────────────────────────────── */
const ConsulterModal = ({ admin, onClose }) => (
  <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:500,
    display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }}
    onClick={e => e.target === e.currentTarget && onClose()}>
    <div style={{ background:'#fff', borderRadius:'20px', padding:'32px', width:'100%',
      maxWidth:'460px', boxShadow:'0 24px 60px rgba(0,0,0,0.18)',
      animation:'fadeUp 0.3s ease both' }}>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between',
        alignItems:'flex-start', marginBottom:'24px' }}>
        <h3 style={{ fontFamily:'Georgia,serif', fontSize:'1.1rem',
          fontWeight:700, color:C.textDark }}>
          Détail administrateur
        </h3>
        <button onClick={onClose} style={{ background:'none', border:'none',
          cursor:'pointer', color:C.textMuted, padding:'4px' }}>
          <Icon d="M18 6L6 18M6 6l12 12" />
        </button>
      </div>

      {/* Avatar + nom */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
        gap:'12px', marginBottom:'24px', padding:'20px',
        background:C.greenPale, borderRadius:'14px' }}>
        <Avatar user={admin} size={72} />
        <div style={{ textAlign:'center' }}>
          <p style={{ fontWeight:800, fontSize:'1.1rem', color:C.textDark }}>
            {admin.prenom} {admin.nom}
          </p>
          <span style={{ display:'inline-block', marginTop:'6px', padding:'3px 12px',
            borderRadius:'20px', fontSize:'0.72rem', fontWeight:700,
            background:`linear-gradient(135deg,${C.greenDeep},${C.greenMid})`,
            color:'#fff' }}>
            Administrateur
          </span>
        </div>
      </div>

      {/* Infos */}
      <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
        {[
          { icon:'M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z', label:'Email', val: admin.email },
          { icon:'M3 5a2 2 0 0 1 2-2h3.28a1 1 0 0 1 .948.684l1.498 4.493a1 1 0 0 1-.502 1.21l-2.257 1.13a11.042 11.042 0 0 0 5.516 5.516l1.13-2.257a1 1 0 0 1 1.21-.502l4.493 1.498a1 1 0 0 1 .684.949V19a2 2 0 0 1-2 2h-1C9.716 21 3 14.284 3 6V5z', label:'Téléphone', val: admin.telephone || '—' },
          { icon:'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z', label:'Prénom', val: admin.prenom },
          { icon:'M10 6H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-5m-4 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1m-4 0h4', label:'Nom', val: admin.nom },
        ].map(({ icon, label, val }) => (
          <div key={label} style={{ display:'flex', alignItems:'center', gap:'12px',
            padding:'11px 14px', background:'#f9fafb', borderRadius:'10px',
            border:`1px solid ${C.border}` }}>
            <div style={{ width:'32px', height:'32px', borderRadius:'8px',
              background:C.greenPale, display:'flex', alignItems:'center',
              justifyContent:'center', flexShrink:0 }}>
              <Icon d={icon} size={15} stroke={C.greenMid} />
            </div>
            <div>
              <p style={{ fontSize:'0.67rem', color:C.textMuted, fontWeight:700,
                textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'2px' }}>
                {label}
              </p>
              <p style={{ fontSize:'0.87rem', fontWeight:600, color:C.textDark }}>{val}</p>
            </div>
          </div>
        ))}
      </div>

      {admin.created_at && (
        <p style={{ marginTop:'16px', fontSize:'0.74rem', color:C.textMuted, textAlign:'right' }}>
          Compte créé le {new Date(admin.created_at).toLocaleDateString('fr-FR', {
            day:'numeric', month:'long', year:'numeric'
          })}
        </p>
      )}
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   Modal Modifier
───────────────────────────────────────────── */
const inputStyle = {
  width:'100%', padding:'10px 14px', border:`1.5px solid ${C.border}`,
  borderRadius:'12px', fontSize:'0.88rem', color:C.textDark,
  background:'#fff', outline:'none', fontFamily:'inherit',
  boxSizing:'border-box', marginBottom:'14px',
};

const ModifierModal = ({ admin, onClose, onSaved }) => {
  const [form,    setForm]    = useState({
    nom:       admin.nom       || '',
    prenom:    admin.prenom    || '',
    email:     admin.email     || '',
    telephone: admin.telephone || '',
    photo:     admin.photo     || '',
  });
  const [saving, setSaving]   = useState(false);
  const [error,  setError]    = useState('');

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = async () => {
    if (!form.nom.trim() || !form.prenom.trim() || !form.email.trim()) {
      setError('Nom, prénom et email sont obligatoires.');
      return;
    }
    try {
      setSaving(true);
      await modifierAdmin(admin.id, form);
      onSaved('Administrateur modifié avec succès');
    } catch (err) {
      setError(err?.response?.data?.message || 'Erreur lors de la modification');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:500,
      display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background:'#fff', borderRadius:'20px', padding:'32px', width:'100%',
        maxWidth:'480px', boxShadow:'0 24px 60px rgba(0,0,0,0.18)',
        animation:'fadeUp 0.3s ease both' }}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between',
          alignItems:'center', marginBottom:'24px' }}>
          <h3 style={{ fontFamily:'Georgia,serif', fontSize:'1.1rem',
            fontWeight:700, color:C.textDark }}>
            Modifier l'administrateur
          </h3>
          <button onClick={onClose} style={{ background:'none', border:'none',
            cursor:'pointer', color:C.textMuted }}>
            <Icon d="M18 6L6 18M6 6l12 12" />
          </button>
        </div>

        {/* Avatar preview */}
        <div style={{ display:'flex', justifyContent:'center', marginBottom:'20px' }}>
          <Avatar user={{ ...admin, ...form }} size={64} />
        </div>

        {/* Champs */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 14px' }}>
          <div>
            <label style={labelStyle}>Prénom *</label>
            <input style={inputStyle} value={form.prenom}
              onChange={e => set('prenom', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Nom *</label>
            <input style={inputStyle} value={form.nom}
              onChange={e => set('nom', e.target.value)} />
          </div>
        </div>

        <label style={labelStyle}>Email *</label>
        <input style={inputStyle} type="email" value={form.email}
          onChange={e => set('email', e.target.value)} />

        <label style={labelStyle}>Téléphone</label>
        <input style={inputStyle} value={form.telephone}
          placeholder="+221 77 000 00 00"
          onChange={e => set('telephone', e.target.value)} />

        <label style={labelStyle}>URL photo de profil</label>
        <input style={{ ...inputStyle, marginBottom:'4px' }} value={form.photo}
          placeholder="https://exemple.com/photo.jpg"
          onChange={e => set('photo', e.target.value)} />

        {error && (
          <p style={{ color:'#dc2626', fontSize:'0.78rem', marginBottom:'12px',
            padding:'8px 12px', background:'#fee2e2', borderRadius:'8px' }}>
            {error}
          </p>
        )}

        {/* Boutons */}
        <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end', marginTop:'8px' }}>
          <button onClick={onClose}
            style={{ padding:'10px 20px', border:`1.5px solid ${C.border}`,
              borderRadius:'12px', background:'#fff', color:C.textDark,
              fontWeight:500, fontSize:'0.88rem', cursor:'pointer', fontFamily:'inherit' }}>
            Annuler
          </button>
          <button onClick={handleSave} disabled={saving}
            style={{ padding:'10px 22px', border:'none', borderRadius:'12px',
              background: saving ? '#9ca3af'
                : `linear-gradient(135deg,${C.greenDeep},${C.greenMid})`,
              color:'#fff', fontWeight:700, fontSize:'0.88rem',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontFamily:'inherit', display:'flex', alignItems:'center', gap:'7px' }}>
            {saving ? (
              <>
                <span style={{ width:'14px', height:'14px', borderRadius:'50%',
                  border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'#fff',
                  display:'inline-block', animation:'spin 0.7s linear infinite' }} />
                Enregistrement…
              </>
            ) : (
              <>
                <Icon d="M5 13l4 4L19 7" size={15} stroke="#fff" />
                Enregistrer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Page principale
───────────────────────────────────────────── */
export default function AdminList() {
  const [admins,   setAdmins]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [modal,    setModal]    = useState(null); // null | 'voir' | 'modifier'
  const [selected, setSelected] = useState(null);
  const [toast,    setToast]    = useState(null);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAdmins();
      // Adapter selon ce que retourne votre service : { admins } ou { utilisateurs }
      setAdmins(data.admins || data.utilisateurs || []);
    } catch {
      showToast('Erreur lors du chargement des administrateurs', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const filtered = admins.filter(a => {
    const q = search.toLowerCase();
    return (
      (a.nom     || '').toLowerCase().includes(q) ||
      (a.prenom  || '').toLowerCase().includes(q) ||
      (a.email   || '').toLowerCase().includes(q) ||
      (a.telephone || '').includes(q)
    );
  });

  const openVoir     = (a) => { setSelected(a); setModal('voir');     };
  const openModifier = (a) => { setSelected(a); setModal('modifier'); };
  const closeModal   = ()  => { setModal(null); setSelected(null);    };

  const handleSaved = (msg) => {
    showToast(msg);
    closeModal();
    load();
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px',
      fontFamily:'DM Sans, sans-serif' }}>
      <style>{`
        @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        tr:hover td        { background:#f0faf5 !important; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display:'flex', justifyContent:'space-between',
        alignItems:'center', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <h2 style={{ fontFamily:'Georgia,serif', fontSize:'1.15rem',
            fontWeight:700, color:C.textDark, marginBottom:'3px' }}>
            Administrateurs
          </h2>
          <p style={{ fontSize:'0.78rem', color:C.textMuted }}>
            {loading ? 'Chargement...'
              : `${admins.length} administrateur${admins.length !== 1 ? 's' : ''}`}
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

      {/* ── Recherche ── */}
      <div style={{ background:'#fff', borderRadius:'16px', padding:'16px 20px',
        border:`1px solid ${C.border}`, boxShadow:'0 2px 8px rgba(13,92,58,0.05)' }}>
        <div style={{ position:'relative', maxWidth:'400px' }}>
          <span style={{ position:'absolute', left:'12px', top:'50%',
            transform:'translateY(-50%)', color:C.textMuted, pointerEvents:'none' }}>
            <Icon d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0" size={16} />
          </span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Nom, prénom, email, téléphone…"
            style={{ width:'100%', padding:'10px 12px 10px 38px',
              border:`1.5px solid ${C.border}`, borderRadius:'12px',
              fontSize:'0.87rem', background:'#fff', outline:'none',
              color:C.textDark, boxSizing:'border-box', fontFamily:'inherit' }} />
        </div>
      </div>

      {/* ── Table ── */}
      <div style={{ background:'#fff', borderRadius:'20px',
        border:`1px solid ${C.border}`,
        boxShadow:'0 2px 12px rgba(13,92,58,0.06)', overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', minWidth:'620px' }}>
            <thead>
              <tr style={{ background:C.greenPale,
                borderBottom:`2px solid ${C.greenBorder}` }}>
                {['Photo','Nom complet','Email','Téléphone','Actions'].map(h => (
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
                ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                : filtered.length === 0
                  ? (
                    <tr>
                      <td colSpan={5} style={{ padding:'60px', textAlign:'center',
                        color:C.textMuted }}>
                        <div style={{ fontSize:'2.5rem', marginBottom:'12px' }}>👤</div>
                        <p style={{ fontWeight:600, marginBottom:'4px' }}>
                          Aucun administrateur trouvé
                        </p>
                        <p style={{ fontSize:'0.82rem' }}>Modifiez votre recherche</p>
                      </td>
                    </tr>
                  )
                  : filtered.map((a, i) => (
                    <tr key={a.id} style={{ borderBottom:`1px solid ${C.border}`,
                      transition:'background 0.15s',
                      animation:`fadeUp 0.3s ease ${i * 0.04}s both` }}>

                      {/* Photo */}
                      <td style={td}>
                        <Avatar user={a} size={42} />
                      </td>

                      {/* Nom complet */}
                      <td style={td}>
                        <p style={{ fontWeight:700, fontSize:'0.9rem',
                          color:C.textDark, marginBottom:'2px' }}>
                          {a.prenom} {a.nom}
                        </p>
                        <span style={{ display:'inline-block', padding:'2px 8px',
                          borderRadius:'20px', fontSize:'0.68rem', fontWeight:700,
                          background:`linear-gradient(135deg,${C.greenDeep},${C.greenMid})`,
                          color:'#fff' }}>
                          Admin
                        </span>
                      </td>

                      {/* Email */}
                      <td style={td}>
                        <div style={{ display:'flex', alignItems:'center', gap:'7px' }}>
                          <Icon d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z"
                            size={14} stroke={C.textMuted} />
                          <span style={{ fontSize:'0.84rem', color:C.textMuted }}>
                            {a.email || '—'}
                          </span>
                        </div>
                      </td>

                      {/* Téléphone */}
                      <td style={td}>
                        <div style={{ display:'flex', alignItems:'center', gap:'7px' }}>
                          <Icon d="M3 5a2 2 0 0 1 2-2h3.28a1 1 0 0 1 .948.684l1.498 4.493a1 1 0 0 1-.502 1.21l-2.257 1.13a11.042 11.042 0 0 0 5.516 5.516l1.13-2.257a1 1 0 0 1 1.21-.502l4.493 1.498a1 1 0 0 1 .684.949V19a2 2 0 0 1-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            size={14} stroke={C.textMuted} />
                          <span style={{ fontSize:'0.84rem', color:C.textMuted }}>
                            {a.telephone || '—'}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={td}>
                        <div style={{ display:'flex', gap:'8px' }}>
                          <button onClick={() => openVoir(a)}
                            style={{ padding:'6px 14px', border:'none', borderRadius:'8px',
                              background:C.greenPale, color:C.greenDeep,
                              fontWeight:700, fontSize:'0.78rem', cursor:'pointer',
                              fontFamily:'inherit', display:'flex',
                              alignItems:'center', gap:'5px' }}>
                            <Icon d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"
                              size={13} stroke={C.greenDeep} />
                            Consulter
                          </button>
                          <button onClick={() => openModifier(a)}
                            style={{ padding:'6px 14px', border:'none', borderRadius:'8px',
                              background:'#ede9fe', color:'#7c3aed',
                              fontWeight:700, fontSize:'0.78rem', cursor:'pointer',
                              fontFamily:'inherit', display:'flex',
                              alignItems:'center', gap:'5px' }}>
                            <Icon d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                              size={13} stroke="#7c3aed" />
                            Modifier
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modals ── */}
      {modal === 'voir'     && selected && (
        <ConsulterModal admin={selected} onClose={closeModal} />
      )}
      {modal === 'modifier' && selected && (
        <ModifierModal  admin={selected} onClose={closeModal} onSaved={handleSaved} />
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

const labelStyle = {
  display:'block', fontSize:'0.75rem', fontWeight:700,
  color:C.textMuted, textTransform:'uppercase',
  letterSpacing:'0.05em', marginBottom:'5px',
};