
import { useState, useEffect } from 'react';
import { C } from '../../components/Constant';
import { getProduits } from '../../services/admin.service';

export default function ProduitsPage() {
  const [filterCat, setFilterCat] = useState('all');
  const [search, setSearch]       = useState('');
  const [view, setView]           = useState('grid');
  
  const [produits, setProduits] = useState([]);
const [loading, setLoading] = useState(true);

const CATEGORIES = [
  ...new Set(produits.map(p => p.categorie?.nom).filter(Boolean))
];// grid | table

  const filtered = produits.filter(p => {
  const matchC = filterCat === 'all' || p.categorie?.nom === filterCat;

  const matchS =
    p.nom.toLowerCase().includes(search.toLowerCase()) ||
    (p.categorie?.nom || '').toLowerCase().includes(search.toLowerCase());

  return matchC && matchS;
});

  const loadProduits = async () => {
  try {
    setLoading(true);
    const data = await getProduits();
    setProduits(data.produits || []);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  loadProduits();
}, []);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <h2 style={{ fontFamily:'Georgia,serif', fontSize:'1.15rem', fontWeight:700, color:C.textDark }}>Catalogue produits</h2>
          <p style={{ fontSize:'0.78rem', color:C.textMuted, marginTop:'2px' }}>{filtered.length} produit{filtered.length>1?'s':''}</p>
        </div>
        <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
          <div style={{ display:'flex', background:C.greenPale, borderRadius:'10px', padding:'3px' }}>
            {['grid','table'].map(v => (
              <button key={v} onClick={() => setView(v)} style={{ padding:'6px 14px', borderRadius:'8px', border:'none', cursor:'pointer', background:view===v?C.greenMid:'transparent', color:view===v?'#fff':C.textMuted, fontWeight:600, fontSize:'0.8rem', transition:'all 0.15s' }}>
                {v === 'grid' ? '▦ Grille' : '☰ Liste'}
              </button>
            ))}
          </div>
          <button style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 18px', background:`linear-gradient(135deg,${C.greenMid},${C.greenBright})`, border:'none', borderRadius:'12px', color:'#fff', fontWeight:600, fontSize:'0.85rem', cursor:'pointer', boxShadow:'0 4px 14px rgba(26,125,82,0.3)' }}>
            ＋ Ajouter produit
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:'10px', flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ position:'relative', flex:'1', minWidth:'180px' }}>
          <span style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:C.textMuted, pointerEvents:'none', fontSize:'14px' }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un produit…"
            style={{ width:'100%', padding:'10px 12px 10px 36px', border:`1.5px solid ${C.border}`, borderRadius:'12px', fontSize:'0.87rem', background:C.white, outline:'none', color:C.textDark, boxSizing:'border-box' }}
          />
        </div>
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
          {['all', ...CATEGORIES].map(cat => (
            <button key={cat} onClick={() => setFilterCat(cat)} style={{ padding:'8px 14px', borderRadius:'20px', border:'none', cursor:'pointer', fontSize:'0.79rem', fontWeight:600, background:filterCat===cat?C.greenMid:C.white, color:filterCat===cat?'#fff':'#6b7280', boxShadow:filterCat===cat?'0 3px 10px rgba(26,125,82,0.28)':'0 1px 4px rgba(0,0,0,0.06)', transition:'all 0.15s' }}>
              {cat === 'all' ? 'Tous' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Stock alerts */}
      {produits.some(p => p.stock < 500) && (
        <div style={{ background:'#fef3c7', border:'1px solid #fde68a', borderRadius:'12px', padding:'12px 16px', display:'flex', alignItems:'center', gap:'10px' }}>
          <span style={{ fontSize:'1.2rem' }}>⚠️</span>
          <p style={{ fontSize:'0.84rem', color:'#92400e', fontWeight:500 }}>
            {produits.filter(p => p.stock < 500).length} produit(s) avec un stock faible.
            <span style={{ fontWeight:700 }}> Pensez à réapprovisionner.</span>
          </p>
        </div>
      )}

      {/* Grid view */}
      {view === 'grid' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:'16px' }}>
          {filtered.map(p => (
            <div key={p.id} style={{ background:C.white, borderRadius:'16px', padding:'20px', boxShadow:'0 2px 10px rgba(13,92,58,0.07)', display:'flex', flexDirection:'column', gap:'12px', border:p.stock<500?'1.5px solid #fde68a':'1.5px solid transparent', transition:'transform 0.15s, box-shadow 0.15s' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div style={{ width:'48px', height:'48px', background:C.greenPale, borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem' }}>
                  {p.image ? (
                    <img 
                        src={p.image} 
                        alt="" 
                        style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'8px' }} 
                    />
                    ) : '💊'}
                </div>
                {p.stock < 500 && (
                  <span style={{ background:'#fef3c7', color:'#92400e', padding:'3px 8px', borderRadius:'8px', fontSize:'0.67rem', fontWeight:700 }}>Stock faible</span>
                )}
              </div>
              <div>
                <p style={{ fontWeight:700, fontSize:'0.9rem', color:C.textDark }}>{p.nom}</p>
                <p style={{ fontSize:'0.74rem', color:C.textMuted, marginTop:'2px' }}>{p.categorie}</p>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <p style={{ fontSize:'1.15rem', fontWeight:800, color:C.greenMid }}>{Number(p.prix).toLocaleString('fr-FR')} F</p>
                  <p style={{ fontSize:'0.7rem', color:'#9ca3af' }}>par {p.unite || 'unité'}</p>
                </div>
                <div style={{ textAlign:'right' }}>
                  <p style={{ fontSize:'0.88rem', fontWeight:700, color:p.stock<500?'#d97706':C.textDark }}>{p.stock.toLocaleString('fr-FR')}</p>
                  <p style={{ fontSize:'0.7rem', color:'#9ca3af' }}>en stock</p>
                </div>
              </div>
              <div style={{ height:'4px', background:'#e5e7eb', borderRadius:'2px', overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${Math.min((p.stock/8000)*100,100)}%`, background:p.stock<500?C.amber:C.greenBright, borderRadius:'2px' }} />
              </div>
              <div style={{ display:'flex', gap:'8px' }}>
                <button style={{ flex:1, padding:'8px', background:C.greenPale, border:'none', borderRadius:'10px', color:C.greenMid, fontWeight:600, fontSize:'0.8rem', cursor:'pointer' }}>Éditer</button>
                <button style={{ flex:1, padding:'8px', background:`linear-gradient(135deg,${C.greenMid},${C.greenBright})`, border:'none', borderRadius:'10px', color:'#fff', fontWeight:600, fontSize:'0.8rem', cursor:'pointer' }}>Commander</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table view */}
      {view === 'table' && (
        <div style={{ background:C.white, borderRadius:'16px', boxShadow:'0 2px 12px rgba(13,92,58,0.07)', overflow:'hidden' }}>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', minWidth:'520px' }}>
              <thead>
                <tr style={{ background:C.greenPale }}>
                  {['Produit','Catégorie','Prix unitaire','Stock','Actions'].map(h => (
                    <th key={h} style={{ padding:'12px 14px', textAlign:'left', fontSize:'0.7rem', fontWeight:700, color:'#374151', textTransform:'uppercase', letterSpacing:'0.07em', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={p.id} style={{ background:i%2===0?C.white:'#fafffe', borderBottom:`1px solid ${C.greenPale}` }}>
                    <td style={{ padding:'13px 14px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                        <span style={{ fontSize:'1.4rem' }}>{p.photo}</span>
                        <span style={{ fontWeight:700, fontSize:'0.85rem', color:C.textDark }}>{p.nom}</span>
                      </div>
                    </td>
                    <td style={{ padding:'13px 14px', fontSize:'0.84rem', color:'#6b7280' }}>{p.categorie?.nom}</td>
                    <td style={{ padding:'13px 14px', fontWeight:700, color:C.greenMid, fontSize:'0.88rem' }}>{p.prix.toLocaleString('fr-FR')} F/{p.unite}</td>
                    <td style={{ padding:'13px 14px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                        <span style={{ fontWeight:700, fontSize:'0.88rem', color:p.stock<500?C.amber:C.textDark }}>{p.stock.toLocaleString('fr-FR')}</span>
                        {p.stock < 500 && <span style={{ background:'#fef3c7', color:'#92400e', padding:'2px 8px', borderRadius:'8px', fontSize:'0.67rem', fontWeight:700 }}>⚠ Faible</span>}
                      </div>
                    </td>
                    <td style={{ padding:'13px 14px' }}>
                      <div style={{ display:'flex', gap:'6px' }}>
                        <button style={{ padding:'6px 12px', background:C.greenPale, border:'none', borderRadius:'8px', color:C.greenMid, fontWeight:600, fontSize:'0.76rem', cursor:'pointer' }}>Éditer</button>
                        <button style={{ padding:'6px 12px', background:'#fef2f2', border:'none', borderRadius:'8px', color:'#dc2626', fontWeight:600, fontSize:'0.76rem', cursor:'pointer' }}>Supprimer</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}