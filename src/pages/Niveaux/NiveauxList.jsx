import { useState, useEffect, useCallback } from 'react';
import { C } from '../../components/Constant';
import {
  getNiveaux,
  ajouterNiveau,
  modifierNiveau,
  supprimerNiveau,
} from '../../services/admin.service';

const Icon = ({ d, size = 18, stroke = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke}
    strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
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

const Modal = ({ title, onClose, children }) => (
  <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:500,
    display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }}
    onClick={e => e.target === e.currentTarget && onClose()}>
    <div style={{ background:'#fff', borderRadius:'20px', padding:'32px', width:'100%',
      maxWidth:'480px', boxShadow:'0 24px 60px rgba(0,0,0,0.18)', animation:'fadeUp 0.3s ease both' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px' }}>
        <h3 style={{ fontFamily:'Georgia,serif', fontSize:'1.1rem', color:C.textDark }}>{title}</h3>
        <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:C.textMuted }}>
          <Icon d="M18 6L6 18M6 6l12 12" />
        </button>
      </div>
      {children}
    </div>
  </div>
);

// Couleurs de badge par rang
const RANK_COLORS = [
  { color:'#b45309', bg:'#fef3c7' }, // Bronze
  { color:'#6b7280', bg:'#f3f4f6' }, // Argent
  { color:'#d97706', bg:'#fffbeb' }, // Or
  { color:'#7c3aed', bg:'#ede9fe' }, // Platine
  { color:'#059669', bg:'#d1fae5' }, // Diamond
];

const inputStyle = {
  width:'100%', padding:'11px 14px', border:`1.5px solid ${C.border}`,
  borderRadius:'12px', fontSize:'0.9rem', color:C.textDark,
  background:'#fff', outline:'none', marginBottom:'14px',
  fontFamily:'inherit',
};

const btnPrimary = {
  padding:'11px 22px', border:'none', borderRadius:'12px',
  background:`linear-gradient(135deg,${C.greenDeep},${C.greenMid})`,
  color:'#fff', fontWeight:700, fontSize:'0.9rem', cursor:'pointer',
  fontFamily:'inherit',
};

const btnSecondary = {
  padding:'11px 22px', border:`1.5px solid ${C.border}`, borderRadius:'12px',
  background:'#fff', color:C.textDark, fontWeight:500, fontSize:'0.9rem',
  cursor:'pointer', fontFamily:'inherit',
};

export default function NiveauxList() {
  const [niveaux,  setNiveaux]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [modal,    setModal]    = useState(null);
  const [selected, setSelected] = useState(null);
  const [form,     setForm]     = useState({ nom:'', description:'', points_requis:'', remise:'' });
  const [toast,    setToast]    = useState(null);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getNiveaux();
      setNiveaux(res.niveaux || []);
    } catch {
      showToast('Erreur lors du chargement', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const filtered = niveaux.filter(n =>
    n.nom?.toLowerCase().includes(search.toLowerCase())
  );

  const emptyForm = { nom:'', description:'', points_requis:'', remise:'' };
  const openAdd  = () => { setForm(emptyForm); setModal('add'); };
  const openEdit = (n) => { setSelected(n); setForm({ nom: n.nom, description: n.description || '', points_requis: n.points_requis || '', remise: n.remise || '' }); setModal('edit'); };
  const openDel  = (n) => { setSelected(n); setModal('delete'); };

  const handleAdd = async () => {
    if (!form.nom.trim()) return showToast('Le nom est obligatoire', 'error');
    try {
      await ajouterNiveau(form);
      showToast('Niveau ajouté avec succès');
      setModal(null); load();
    } catch { showToast("Erreur lors de l'ajout", 'error'); }
  };

  const handleEdit = async () => {
    if (!form.nom.trim()) return showToast('Le nom est obligatoire', 'error');
    try {
      await modifierNiveau(selected.id, form);
      showToast('Niveau modifié avec succès');
      setModal(null); load();
    } catch { showToast('Erreur lors de la modification', 'error'); }
  };

  const handleDelete = async () => {
    try {
      await supprimerNiveau(selected.id);
      showToast('Niveau supprimé');
      setModal(null); load();
    } catch { showToast('Erreur lors de la suppression', 'error'); }
  };

  return (
    <div style={{ fontFamily:'DM Sans, sans-serif' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        flexWrap:'wrap', gap:'12px', marginBottom:'24px' }}>
        <div>
          <h2 style={{ fontFamily:'Georgia,serif', fontSize:'1.4rem', color:C.textDark, marginBottom:'3px' }}>
            Niveaux de fidélité
          </h2>
          <p style={{ color:C.textMuted, fontSize:'0.82rem' }}>
            {niveaux.length} niveau{niveaux.length !== 1 ? 'x' : ''} configuré{niveaux.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={openAdd} style={btnPrimary}>+ Nouveau niveau</button>
      </div>

      {/* Stats cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px,1fr))',
        gap:'14px', marginBottom:'24px' }}>
        {filtered.map((n, idx) => {
          const rc = RANK_COLORS[idx % RANK_COLORS.length];
          return (
            <div key={n.id} style={{ background:'#fff', borderRadius:'16px', padding:'18px',
              border:`1px solid ${C.border}`, boxShadow:'0 2px 8px rgba(13,92,58,0.05)',
              animation:`fadeUp 0.3s ease ${idx * 0.06}s both` }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }}>
                <span style={{ fontSize:'1.4rem' }}>🏆</span>
                <span style={{ padding:'3px 10px', borderRadius:'20px', fontSize:'0.7rem',
                  fontWeight:700, color: rc.color, background: rc.bg }}>
                  Rang {idx + 1}
                </span>
              </div>
              <p style={{ fontWeight:700, color:C.textDark, fontSize:'0.95rem', marginBottom:'4px' }}>{n.nom}</p>
              {n.points_requis && <p style={{ color:C.textMuted, fontSize:'0.75rem' }}>{n.points_requis} pts requis</p>}
              {n.remise && <p style={{ color:C.greenMid, fontSize:'0.75rem', fontWeight:700 }}>{n.remise}% remise</p>}
            </div>
          );
        })}
      </div>

      {/* Recherche */}
      <div style={{ background:'#fff', borderRadius:'16px', padding:'16px 20px',
        border:`1px solid ${C.border}`, marginBottom:'20px',
        boxShadow:'0 2px 8px rgba(13,92,58,0.05)' }}>
        <div style={{ position:'relative', maxWidth:'360px' }}>
          <span style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:C.textMuted }}>
            <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </span>
          <input placeholder="Rechercher un niveau..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, paddingLeft:'38px', marginBottom:0 }} />
        </div>
      </div>

      {/* Table */}
      <div style={{ background:'#fff', borderRadius:'20px', border:`1px solid ${C.border}`,
        boxShadow:'0 2px 12px rgba(13,92,58,0.06)', overflow:'hidden' }}>
        {loading ? (
          <div style={{ padding:'60px', textAlign:'center', color:C.textMuted }}>
            <div style={{ fontSize:'2rem', marginBottom:'12px' }}>⏳</div>Chargement...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding:'60px', textAlign:'center', color:C.textMuted }}>
            <div style={{ fontSize:'2.5rem', marginBottom:'12px' }}>🏆</div>
            <p style={{ fontWeight:600 }}>Aucun niveau trouvé</p>
          </div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:C.greenPale, borderBottom:`2px solid ${C.greenBorder}` }}>
                {['Rang','Nom','Description','Points requis','Remise (%)','Actions'].map(h => (
                  <th key={h} style={{ padding:'14px 18px', textAlign:'left',
                    fontSize:'0.75rem', fontWeight:700, color:C.greenDeep,
                    textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((n, idx) => {
                const rc = RANK_COLORS[idx % RANK_COLORS.length];
                return (
                  <tr key={n.id} style={{ borderBottom:`1px solid ${C.border}`,
                    transition:'background 0.15s', animation:`fadeUp 0.3s ease ${idx * 0.04}s both` }}>
                    <td style={td}>
                      <span style={{ padding:'4px 12px', borderRadius:'20px', fontSize:'0.75rem',
                        fontWeight:700, color: rc.color, background: rc.bg }}>
                        #{idx + 1}
                      </span>
                    </td>
                    <td style={td}>
                      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                        <div style={{ width:'34px', height:'34px', borderRadius:'10px',
                          background: rc.bg, display:'flex', alignItems:'center',
                          justifyContent:'center', fontSize:'1rem', flexShrink:0 }}>
                          🏆
                        </div>
                        <span style={{ fontWeight:700, color:C.textDark }}>{n.nom}</span>
                      </div>
                    </td>
                    <td style={td}><span style={{ color:C.textMuted, fontSize:'0.85rem' }}>{n.description || '—'}</span></td>
                    <td style={td}>
                      {n.points_requis
                        ? <span style={{ padding:'3px 10px', borderRadius:'20px', fontSize:'0.75rem',
                            fontWeight:700, color:'#2563eb', background:'#dbeafe' }}>
                            {n.points_requis} pts
                          </span>
                        : <span style={{ color:C.textMuted }}>—</span>
                      }
                    </td>
                    <td style={td}>
                      {n.remise
                        ? <span style={{ padding:'3px 10px', borderRadius:'20px', fontSize:'0.75rem',
                            fontWeight:700, color:C.greenMid, background:C.greenPale }}>
                            {n.remise}%
                          </span>
                        : <span style={{ color:C.textMuted }}>—</span>
                      }
                    </td>
                    <td style={td}>
                      <div style={{ display:'flex', gap:'8px' }}>
                        <button onClick={() => openEdit(n)} style={actionBtn(C.greenPale, C.greenDeep)}>
                          <Icon d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" size={15} />
                        </button>
                        <button onClick={() => openDel(n)} style={actionBtn('#fee2e2', '#dc2626')}>
                          <Icon d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Ajouter un niveau' : 'Modifier le niveau'} onClose={() => setModal(null)}>
          <label style={labelStyle}>Nom *</label>
          <input style={inputStyle} placeholder="Ex: Bronze, Argent, Or..."
            value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} />
          <label style={labelStyle}>Description</label>
          <textarea style={{ ...inputStyle, minHeight:'70px', resize:'vertical' }}
            placeholder="Description du niveau"
            value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            <div>
              <label style={labelStyle}>Points requis</label>
              <input style={inputStyle} type="number" placeholder="0"
                value={form.points_requis} onChange={e => setForm(f => ({ ...f, points_requis: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Remise (%)</label>
              <input style={inputStyle} type="number" placeholder="0"
                value={form.remise} onChange={e => setForm(f => ({ ...f, remise: e.target.value }))} />
            </div>
          </div>
          <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
            <button onClick={() => setModal(null)} style={btnSecondary}>Annuler</button>
            <button onClick={modal === 'add' ? handleAdd : handleEdit} style={btnPrimary}>
              {modal === 'add' ? 'Ajouter' : 'Enregistrer'}
            </button>
          </div>
        </Modal>
      )}

      {modal === 'delete' && (
        <Modal title="Confirmer la suppression" onClose={() => setModal(null)}>
          <div style={{ textAlign:'center', padding:'8px 0 20px' }}>
            <div style={{ fontSize:'2.5rem', marginBottom:'12px' }}>🗑️</div>
            <p style={{ color:C.textMuted, fontSize:'0.9rem' }}>
              Supprimer le niveau <strong style={{ color:C.textDark }}>"{selected?.nom}"</strong> ?
            </p>
          </div>
          <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
            <button onClick={() => setModal(null)} style={btnSecondary}>Annuler</button>
            <button onClick={handleDelete}
              style={{ ...btnPrimary, background:'linear-gradient(135deg,#dc2626,#ef4444)' }}>
              Supprimer
            </button>
          </div>
        </Modal>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}

const td = { padding:'14px 18px', fontSize:'0.875rem', color:C.textDark, verticalAlign:'middle' };
const labelStyle = { display:'block', fontSize:'0.78rem', fontWeight:700, color:C.textMuted,
  textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'6px' };
const actionBtn = (bg, color) => ({
  width:'32px', height:'32px', border:'none', borderRadius:'9px',
  background: bg, color, cursor:'pointer',
  display:'flex', alignItems:'center', justifyContent:'center',
});