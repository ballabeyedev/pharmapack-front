import { C } from '../../components/Constant';

const Icon = ({ d, size = 18, stroke = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={stroke} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

/* Ligne info générique */
const Row = ({ label, value, last }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '11px 0',
    borderBottom: last ? 'none' : `1px solid ${C.border}`,
  }}>
    <span style={{
      fontSize: '0.76rem', color: C.textMuted, fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.05em',
      flexShrink: 0, marginRight: '16px', paddingTop: '2px',
    }}>
      {label}
    </span>
    <span style={{
      fontSize: '0.88rem', color: C.textDark, fontWeight: 500,
      textAlign: 'right', wordBreak: 'break-word',
    }}>
      {value ?? '—'}
    </span>
  </div>
);

/* Titre de section interne */
const SectionTitle = ({ icon, label }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '8px',
    margin: '18px 0 8px',
  }}>
    <div style={{
      width: '26px', height: '26px', borderRadius: '8px',
      background: C.greenPale, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon d={icon} size={13} stroke={C.greenMid} />
    </div>
    <span style={{
      fontSize: '0.7rem', fontWeight: 700, color: C.greenDeep,
      textTransform: 'uppercase', letterSpacing: '0.08em',
    }}>
      {label}
    </span>
  </div>
);

/* Formate une date ISO en lisible français */
const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

/* Badge ID monospace */
const IdBadge = ({ id }) => (
  <span style={{
    fontFamily: 'monospace', fontSize: '0.78rem',
    background: '#f3f4f6', color: '#6b7280',
    padding: '3px 9px', borderRadius: '7px',
    letterSpacing: '0.03em',
  }}>
    {id ? id.slice(0, 8).toUpperCase() : '—'}
  </span>
);

export default function ProduitModal({ produit, onClose }) {
  if (!produit) return null;

  const stockLevel = Number(produit.stock ?? 0);
  const stockColor = stockLevel < 500 ? '#d97706'
    : stockLevel < 2000 ? C.greenMid : C.greenDeep;
  const stockLabel = stockLevel < 500 ? '⚠ Faible'
    : stockLevel < 2000 ? 'Moyen' : '✅ Bon';

  const prix      = Number(produit.prix ?? 0);
  const prixPromo = Number(produit.prix_promo ?? 0);
  const hasPromo  = produit.prix_promo && prixPromo > 0;
  const remise    = hasPromo ? Math.round((1 - prixPromo / prix) * 100) : 0;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          zIndex: 900, backdropFilter: 'blur(3px)',
          animation: 'fadeIn 0.2s ease',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 901, width: '92%', maxWidth: '520px',
        background: '#fff', borderRadius: '22px',
        boxShadow: '0 24px 70px rgba(0,0,0,0.22)',
        overflow: 'hidden',
        animation: 'slideUp 0.25s ease',
        fontFamily: 'DM Sans, sans-serif',
        maxHeight: '92vh', display: 'flex', flexDirection: 'column',
      }}>
        <style>{`
          @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
          @keyframes slideUp { from{opacity:0;transform:translate(-50%,-46%)} to{opacity:1;transform:translate(-50%,-50%)} }
        `}</style>

        {/* ────────── HEADER ────────── */}
        <div style={{
          position: 'relative', background: C.greenPale,
          padding: '22px 20px 18px',
          borderBottom: `1px solid ${C.border}`,
          display: 'flex', alignItems: 'center', gap: '14px',
        }}>
          {/* Image */}
          <div style={{
            width: '68px', height: '68px', borderRadius: '16px',
            background: '#fff', border: `2px solid ${C.greenBorder}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', flexShrink: 0,
            boxShadow: '0 4px 14px rgba(13,92,58,0.13)',
          }}>
            {produit.image
              ? <img src={produit.image} alt={produit.nom}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: '1.9rem' }}>💊</span>
            }
          </div>

          {/* Nom + badges */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              fontFamily: 'Georgia,serif', fontSize: '1.06rem',
              fontWeight: 700, color: C.textDark, marginBottom: '6px',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {produit.nom}
            </h3>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
              {produit.categorie?.nom && (
                <span style={{
                  background: '#fff', color: C.greenDeep,
                  padding: '3px 10px', borderRadius: '20px',
                  fontSize: '0.7rem', fontWeight: 700,
                  border: `1px solid ${C.greenBorder}`,
                }}>
                  📁 {produit.categorie.nom}
                </span>
              )}
              <span style={{
                background: produit.statut ? '#dcfce7' : '#fee2e2',
                color: produit.statut ? '#166534' : '#dc2626',
                padding: '3px 10px', borderRadius: '20px',
                fontSize: '0.7rem', fontWeight: 700,
              }}>
                {produit.statut ? '● Actif' : '● Inactif'}
              </span>
              {hasPromo && remise > 0 && (
                <span style={{
                  background: '#fef3c7', color: '#92400e',
                  padding: '3px 10px', borderRadius: '20px',
                  fontSize: '0.7rem', fontWeight: 700,
                }}>
                  🏷 -{remise}%
                </span>
              )}
            </div>
          </div>

          {/* Fermer */}
          <button onClick={onClose}
            style={{
              position: 'absolute', top: '12px', right: '12px',
              width: '30px', height: '30px', borderRadius: '50%',
              border: 'none', background: 'rgba(0,0,0,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: C.textMuted, transition: 'background 0.15s',
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(0,0,0,0.16)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(0,0,0,0.08)'}
          >
            <Icon d="M18 6L6 18M6 6l12 12" size={14} />
          </button>
        </div>

        {/* ────────── CORPS scrollable ────────── */}
        <div style={{ overflowY: 'auto', padding: '4px 20px 16px', flex: 1 }}>

          {/* Description */}
          {produit.description && (
            <>
              <SectionTitle
                icon="M9 12h6M9 16h4M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"
                label="Description"
              />
              <div style={{
                background: C.greenPale, borderRadius: '12px',
                padding: '12px 14px',
                border: `1px solid ${C.greenBorder}`,
              }}>
                <p style={{ fontSize: '0.84rem', color: C.textDark, lineHeight: 1.65, margin: 0 }}>
                  {produit.description}
                </p>
              </div>
            </>
          )}

          {/* ── Informations produit ── */}
          <SectionTitle
            icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            label="Informations produit"
          />
          <div style={{
            background: '#fafafa', borderRadius: '14px',
            padding: '4px 14px', border: `1px solid ${C.border}`,
          }}>
            <Row label="Référence"  value={<IdBadge id={produit.id} />} />
            <Row label="Catégorie"  value={produit.categorie?.nom} />
            <Row label="Unité"      value={produit.unite} />
            <Row label="Dimension"  value={produit.dimension} last />
          </div>

          {/* ── Prix ── */}
          <SectionTitle
            icon="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2M12 6v6l4 2"
            label="Prix"
          />
          <div style={{
            background: '#fafafa', borderRadius: '14px',
            padding: '4px 14px', border: `1px solid ${C.border}`,
          }}>
            <Row
              label="Prix unitaire"
              value={
                <span style={{ fontSize: '1rem', fontWeight: 800, color: C.greenMid }}>
                  {prix.toLocaleString('fr-FR')} FCFA
                </span>
              }
            />
            <Row
              label="Prix promo"
              value={
                hasPromo ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#dc2626' }}>
                      {prixPromo.toLocaleString('fr-FR')} FCFA
                    </span>
                    {remise > 0 && (
                      <span style={{
                        background: '#fee2e2', color: '#dc2626',
                        padding: '2px 8px', borderRadius: '8px',
                        fontSize: '0.68rem', fontWeight: 700,
                      }}>
                        -{remise}%
                      </span>
                    )}
                  </div>
                ) : null
              }
              last
            />
          </div>

          {/* ── Stock ── */}
          <SectionTitle
            icon="M3 3h18M3 9h18M3 15h18"
            label="Stock"
          />
          <div style={{
            background: '#fafafa', borderRadius: '14px',
            padding: '14px', border: `1px solid ${C.border}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: stockColor }}>
                {stockLevel.toLocaleString('fr-FR')}
              </span>
              <span style={{
                background: stockLevel < 500 ? '#fef3c7' : C.greenPale,
                color: stockColor,
                padding: '4px 14px', borderRadius: '20px',
                fontSize: '0.75rem', fontWeight: 700,
              }}>
                {stockLabel}
              </span>
            </div>
            <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '4px',
                width: `${Math.min((stockLevel / 8000) * 100, 100)}%`,
                background: stockLevel < 500
                  ? '#d97706'
                  : `linear-gradient(90deg, ${C.greenMid}, ${C.greenBright})`,
                transition: 'width 0.5s ease',
              }} />
            </div>
            <p style={{ fontSize: '0.71rem', color: C.textMuted, marginTop: '6px', textAlign: 'right' }}>
              {Math.min(Math.round((stockLevel / 8000) * 100), 100)}% de la capacité max (8 000)
            </p>
          </div>

          {/* ── Traçabilité ── */}
        <SectionTitle
        icon="M12 8v4l3 3M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
        label="Traçabilité"
        />
        <div style={{
        background: '#fafafa', borderRadius: '14px',
        padding: '4px 14px', border: `1px solid ${C.border}`,
        marginBottom: '4px',
        }}>
        <Row label="Créé le"    value={formatDate(produit.createdAt)} />
        <Row
            label="Créé par"
            value={
            produit.createur
                ? `${produit.createur.prenom} ${produit.createur.nom}`
                : '—'
            }
        />
        <Row label="Modifié le" value={formatDate(produit.updatedAt)} />
        <Row
            label="Modifié par"
            value={
            produit.modificateur
                ? `${produit.modificateur.prenom} ${produit.modificateur.nom}`
                : '—'
            }
            last
        />
        </div>

        </div>

        {/* ────────── PIED ────────── */}
        <div style={{
          padding: '14px 20px', borderTop: `1px solid ${C.border}`,
          display: 'flex', justifyContent: 'flex-end',
          background: '#fafafa',
        }}>
          <button onClick={onClose}
            style={{
              padding: '10px 26px', border: `1.5px solid ${C.border}`,
              borderRadius: '12px', background: '#fff', color: C.textDark,
              fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer',
              fontFamily: 'inherit', transition: 'background 0.15s',
            }}
            onMouseOver={e => e.currentTarget.style.background = C.greenPale}
            onMouseOut={e => e.currentTarget.style.background = '#fff'}
          >
            Fermer
          </button>
        </div>
      </div>
    </>
  );
}