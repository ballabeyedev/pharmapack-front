import { useState, useEffect, useCallback } from 'react';
import { C } from '../../components/Constant';
import {
  getCategories,
  ajouterCategorie,
  modifierCategorie,
  supprimerCategorie,
} from '../../services/admin.service';

/* ── helpers ── */
const Icon = ({ d, size = 18, stroke = 'currentColor', fill = 'none' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const Badge = ({ label, color = C.greenMid, bg = C.greenPale }) => (
  <span style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'3px 10px',
    borderRadius:'20px', fontSize:'0.72rem', fontWeight:700, color, background:bg, letterSpacing:'0.02em' }}>
    {label}
  </span>
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

/* ── Modal ── */
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

/* ── Page principale ── */
export default function CategoriesList() {
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [modal,      setModal]      = useState(null); // null | 'add' | 'edit' | 'delete'
  const [selected,   setSelected]   = useState(null);
  const [form,       setForm]       = useState({ nom:'', description:'' });
  const [toast,      setToast]      = useState(null);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getCategories();
      setCategories(res.categories || []);
    } catch {
      showToast('Erreur lors du chargement', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  const filtered = categories.filter(c =>
    c.nom?.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd    = () => { setForm({ nom:'', description:'' }); setModal('add'); };
  const openEdit   = (cat) => { setSelected(cat); setForm({ nom: cat.nom, description: cat.description || '' }); setModal('edit'); };
  const openDelete = (cat) => { setSelected(cat); setModal('delete'); };

  const handleAdd = async () => {
    if (!form.nom.trim()) return showToast('Le nom est obligatoire', 'error');
    try {
      await ajouterCategorie(form);
      showToast('Catégorie ajoutée avec succès');
      setModal(null);
      loadCategories();
    } catch { showToast("Erreur lors de l'ajout", 'error'); }
  };

  const handleEdit = async () => {
    if (!form.nom.trim()) return showToast('Le nom est obligatoire', 'error');
    try {
      await modifierCategorie(selected.id, form);
      showToast('Catégorie modifiée avec succès');
      setModal(null);
      loadCategories();
    } catch { showToast('Erreur lors de la modification', 'error'); }
  };

  const handleDelete = async () => {
    try {
      await supprimerCategorie(selected.id);
      showToast('Catégorie supprimée');
      setModal(null);
      loadCategories();
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
            Catégories
          </h2>
          <p style={{ color:C.textMuted, fontSize:'0.82rem' }}>
            {categories.length} catégorie{categories.length !== 1 ? 's' : ''} enregistrée{categories.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={openAdd} style={btnPrimary}>
          + Nouvelle catégorie
        </button>
      </div>

      {/* Barre de recherche */}
      <div style={{ background:'#fff', borderRadius:'16px', padding:'16px 20px',
        border:`1px solid ${C.border}`, marginBottom:'20px',
        boxShadow:'0 2px 8px rgba(13,92,58,0.05)' }}>
        <div style={{ position:'relative', maxWidth:'360px' }}>
          <span style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:C.textMuted }}>
            <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </span>
          <input
            placeholder="Rechercher une catégorie..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, paddingLeft:'38px', marginBottom:0 }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ background:'#fff', borderRadius:'20px', border:`1px solid ${C.border}`,
        boxShadow:'0 2px 12px rgba(13,92,58,0.06)', overflow:'hidden' }}>
        {loading ? (
          <div style={{ padding:'60px', textAlign:'center', color:C.textMuted }}>
            <div style={{ fontSize:'2rem', marginBottom:'12px' }}>⏳</div>
            Chargement...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding:'60px', textAlign:'center', color:C.textMuted }}>
            <div style={{ fontSize:'2.5rem', marginBottom:'12px' }}>📂</div>
            <p style={{ fontWeight:600, marginBottom:'4px' }}>Aucune catégorie trouvée</p>
            <p style={{ fontSize:'0.82rem' }}>Ajoutez votre première catégorie</p>
          </div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:C.greenPale, borderBottom:`2px solid ${C.greenBorder}` }}>
                {['#','Nom','Description','Date création','Actions'].map(h => (
                  <th key={h} style={{ padding:'14px 18px', textAlign:'left',
                    fontSize:'0.75rem', fontWeight:700, color:C.greenDeep,
                    textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((cat, idx) => (
                <tr key={cat.id} style={{ borderBottom:`1px solid ${C.border}`,
                  transition:'background 0.15s', animation:`fadeUp 0.3s ease ${idx * 0.04}s both` }}>
                  <td style={td}><span style={{ color:C.textMuted, fontSize:'0.8rem' }}>{idx + 1}</span></td>
                  <td style={td}>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                      <div style={{ width:'34px', height:'34px', borderRadius:'10px',
                        background:C.greenPale, display:'flex', alignItems:'center',
                        justifyContent:'center', flexShrink:0 }}>
                        <Icon d="M4 6h16M4 10h16M4 14h8" stroke={C.greenMid} />
                      </div>
                      <span style={{ fontWeight:600, color:C.textDark, fontSize:'0.9rem' }}>{cat.nom}</span>
                    </div>
                  </td>
                  <td style={td}>
                    <span style={{ color:C.textMuted, fontSize:'0.85rem' }}>
                      {cat.description || <em style={{ opacity:0.5 }}>—</em>}
                    </span>
                  </td>
                  <td style={td}>
                    <Badge label={new Date(cat.created_at).toLocaleDateString('fr-FR')} />
                  </td>
                  <td style={td}>
                    <div style={{ display:'flex', gap:'8px' }}>
                      <button onClick={() => openEdit(cat)} style={actionBtn(C.greenPale, C.greenDeep)} title="Modifier">
                        <Icon d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" size={15} />
                      </button>
                      <button onClick={() => openDelete(cat)} style={actionBtn('#fee2e2', '#dc2626')} title="Supprimer">
                        <Icon d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Add */}
      {modal === 'add' && (
        <Modal title="Ajouter une catégorie" onClose={() => setModal(null)}>
          <label style={labelStyle}>Nom *</label>
          <input style={inputStyle} placeholder="Nom de la catégorie"
            value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} />
          <label style={labelStyle}>Description</label>
          <textarea style={{ ...inputStyle, minHeight:'90px', resize:'vertical' }}
            placeholder="Description (optionnelle)"
            value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end', marginTop:'8px' }}>
            <button onClick={() => setModal(null)} style={btnSecondary}>Annuler</button>
            <button onClick={handleAdd} style={btnPrimary}>Ajouter</button>
          </div>
        </Modal>
      )}

      {/* Modal Edit */}
      {modal === 'edit' && (
        <Modal title="Modifier la catégorie" onClose={() => setModal(null)}>
          <label style={labelStyle}>Nom *</label>
          <input style={inputStyle} value={form.nom}
            onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} />
          <label style={labelStyle}>Description</label>
          <textarea style={{ ...inputStyle, minHeight:'90px', resize:'vertical' }}
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end', marginTop:'8px' }}>
            <button onClick={() => setModal(null)} style={btnSecondary}>Annuler</button>
            <button onClick={handleEdit} style={btnPrimary}>Enregistrer</button>
          </div>
        </Modal>
      )}

      {/* Modal Delete */}
      {modal === 'delete' && (
        <Modal title="Confirmer la suppression" onClose={() => setModal(null)}>
          <div style={{ textAlign:'center', padding:'8px 0 20px' }}>
            <div style={{ fontSize:'2.5rem', marginBottom:'12px' }}>🗑️</div>
            <p style={{ color:C.textMuted, fontSize:'0.9rem' }}>
              Voulez-vous vraiment supprimer la catégorie <strong style={{ color:C.textDark }}>"{selected?.nom}"</strong> ?
              Cette action est irréversible.
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