import { useState, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { C } from '../../components/Constant';
import { ajouterProduit } from '../../services/admin.service';

/* ─── Icône SVG légère ─── */
const Icon = ({ d, size = 18, stroke = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={stroke} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

/* ─── Mapping des colonnes attendues ─── */
const COL_MAP = {
  nom:         ['nom', 'nom *', 'nom★', 'nomduproduit', 'name', 'produit'],
  description: ['description', 'desc'],
  categorie:   ['categorie', 'catégorie', 'category', 'cat'],
  prix:        ['prix', 'prix *', 'prix★', 'prixunitaire', 'prixunitaire(fcfa)', 'price', 'prix_unitaire'],
  prix_promo:  ['prix_promo', 'prixpromo', 'prixpromo(fcfa)', 'promo', 'prixpromotionnel', 'prix_promotion'],
  stock:       ['stock', 'stockinitial', 'quantite', 'quantité', 'qty'],
  unite:       ['unite', 'unité', 'unitédevente', 'unit'],
  dimension:   ['dimension', 'dimension/contenance', 'contenance', 'dosage'],
  statut:      ['statut', 'status', 'état'],
  image_url:   ['image_url', 'imageurl', 'urlimage', 'image', 'url_image', 'photo'],
};

/* Normalise une clé d'en-tête — enlève tout sauf lettres/chiffres */
const normalizeKey = (key) =>
  (key || '').toString().trim().toLowerCase()
    .replace(/[*★\s/().-]+/g, '')
    .replace(/_+/g, '');

/* Trouve le nom de champ depuis un en-tête */
const resolveField = (rawHeader) => {
  const norm = normalizeKey(rawHeader);
  for (const [field, aliases] of Object.entries(COL_MAP)) {
    if (aliases.some(a => normalizeKey(a) === norm)) return field;
  }
  return null;
};

/* ─── Validation d'une ligne ─── */
const validateRow = (row) => {
  const errors = [];
  if (!row.nom?.trim())
    errors.push('Nom manquant');
  if (!row.prix || isNaN(Number(row.prix)) || Number(row.prix) <= 0)
    errors.push('Prix invalide ou manquant');
  if (row.prix_promo && (isNaN(Number(row.prix_promo)) || Number(row.prix_promo) < 0))
    errors.push('Prix promo invalide');
  if (row.stock !== undefined && row.stock !== '' && (isNaN(Number(row.stock)) || Number(row.stock) < 0))
    errors.push('Stock invalide');
  return errors;
};

/* ─── Composant principal ─── */
export default function ImportProduits({ onBack, onSuccess, categories = [] }) {
  const [step,       setStep]       = useState('upload');
  const [rows,       setRows]       = useState([]);
  const [errors,     setErrors]     = useState({});
  const [progress,   setProgress]   = useState({ done: 0, total: 0, failed: 0 });
  const [log,        setLog]        = useState([]);
  const [dragOver,   setDragOver]   = useState(false);
  const [fileName,   setFileName]   = useState('');
  const fileInputRef = useRef();

  /* ─── Télécharger le template Excel depuis /public ─── */
  const downloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/modele_import_produits.xlsx';
    link.download = 'modele_import_produits.xlsx';
    link.click();
  };

  /* ─── Télécharger le template CSV ─── */
  const downloadCSV = () => {
    const headers = 'nom *,description,categorie,prix *,prix_promo,stock,unite,dimension,statut,image_url';
    const guide   = '→ Nom obligatoire,Description,Catégorie,Prix FCFA,Prix promo,Stock,paquet/carton/lot/boite,Ex: 30 comprimés,actif/inactif,URL image';
    const blob = new Blob([`${headers}\n${guide}\n`], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = 'modele_import_produits.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ─── Parser le fichier ─── */
  const parseFile = useCallback((file) => {
    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        let rawRows = [];

        if (file.name.toLowerCase().endsWith('.csv')) {
          /* ── CSV ── */
          const text    = e.target.result;
          const lines   = text.split(/\r?\n/).filter(l => l.trim());
          const headers = lines[0].split(',').map(h => h.trim());

          rawRows = lines.slice(1)
            .filter(l => !l.trimStart().startsWith('→') && l.trim())
            .map(line => {
              const vals = line.split(',');
              const obj  = {};
              headers.forEach((h, i) => { obj[h] = (vals[i] || '').trim(); });
              return obj;
            });

        } else {
          /* ── EXCEL ── */
          const data = new Uint8Array(e.target.result);
          const wb   = XLSX.read(data, { type: 'array' });

          // Toujours lire le premier onglet
          const ws   = wb.Sheets[wb.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

          // ── Trouver la ligne d'en-têtes ──
          // On cherche la ligne qui contient le mot "nom" (après normalisation)
          let headerRow = -1;
          for (let i = 0; i < json.length; i++) {
            const hasNomCol = json[i].some(cell => {
              const v = normalizeKey(String(cell || ''));
              return v === 'nom' || v === 'nom*' || v === 'nom★' || v === 'nomduproduit';
            });
            if (hasNomCol) { headerRow = i; break; }
          }

          if (headerRow < 0) {
            throw new Error(
              'Colonne "nom" introuvable. Vérifiez que la ligne d\'en-têtes est présente dans le fichier.'
            );
          }

          const headers = json[headerRow];

          // ── Lignes de données (après les en-têtes) ──
          rawRows = json.slice(headerRow + 1).filter(r => {
            const vals    = r.map(c => String(c || '').trim());
            const isEmpty = vals.every(v => !v);
            const isGuide = vals[0].startsWith('→') || vals[0].startsWith('ℹ');
            return !isEmpty && !isGuide;
          }).map(r => {
            const obj = {};
            headers.forEach((h, i) => {
              obj[String(h || '').trim()] = String(r[i] ?? '').trim();
            });
            return obj;
          });
        }

        // ── Résoudre les champs via COL_MAP ──
        const parsed = rawRows.map(raw => {
          const resolved = {};
          for (const [rawKey, val] of Object.entries(raw)) {
            const field = resolveField(rawKey);
            if (field) resolved[field] = val;
          }
          return resolved;
        }).filter(r => Object.keys(r).length > 0 && (r.nom || r.prix));

        if (parsed.length === 0) {
          throw new Error(
            'Aucune donnée trouvée. Vérifiez que vous avez rempli les lignes à partir de la ligne 6 du modèle.'
          );
        }

        // ── Valider chaque ligne ──
        const errs = {};
        parsed.forEach((row, i) => {
          const e = validateRow(row);
          if (e.length) errs[i] = e;
        });

        setRows(parsed);
        setErrors(errs);
        setStep('preview');

      } catch (err) {
        alert('❌ Erreur lors de la lecture du fichier :\n' + err.message);
      }
    };

    if (file.name.toLowerCase().endsWith('.csv')) {
      reader.readAsText(file, 'UTF-8');
    } else {
      reader.readAsArrayBuffer(file);
    }
  }, []);

  /* ─── Drag & Drop ─── */
  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) parseFile(file);
  };

  /* ─── Import vers l'API ─── */
  const handleImport = async () => {
    const validRows = rows.filter((_, i) => !errors[i]);
    if (!validRows.length) return;

    setStep('importing');
    setProgress({ done: 0, total: validRows.length, failed: 0 });
    setLog([]);

    let failed = 0;
    const newLog = [];

    for (let i = 0; i < validRows.length; i++) {
      const r = validRows[i];
      try {
        const cat = categories.find(
          c => (c.nom || '').toLowerCase() === (r.categorie || '').toLowerCase()
        );

        await ajouterProduit({
          nom:          r.nom?.trim()         || '',
          description:  r.description?.trim() || null,
          prix:         Number(r.prix)        || 0,
          prix_promo:   r.prix_promo && !isNaN(Number(r.prix_promo)) ? Number(r.prix_promo) : null,
          stock:        r.stock !== '' && !isNaN(Number(r.stock)) ? Number(r.stock) : 0,
          image:        r.image_url?.trim()   || null,
          dimension:    r.dimension?.trim()   || null,
          unite:        r.unite?.trim()       || null,
          statut:       (r.statut || 'actif').toLowerCase() !== 'inactif',
          categorie_id: cat?.id               || null,
        });

        newLog.push({ nom: r.nom, ok: true });
      } catch (err) {
        failed++;
        const msg = err?.response?.data?.message || 'Erreur inconnue';
        newLog.push({ nom: r.nom, ok: false, msg });
      }

      setProgress({ done: i + 1, total: validRows.length, failed });
      setLog([...newLog]);
    }

    setStep('done');
  };

  /* ─── Styles communs ─── */
  const s = {
    card: {
      background: '#fff', borderRadius: '16px', padding: '24px',
      border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(13,92,58,0.05)',
    },
    btn: (variant = 'primary') => ({
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '11px 22px', border: 'none', borderRadius: '12px',
      fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: '0.88rem',
      cursor: 'pointer', transition: 'all 0.15s',
      ...(variant === 'primary' ? {
        background: `linear-gradient(135deg,${C.greenDeep},${C.greenMid})`,
        color: '#fff', boxShadow: '0 4px 14px rgba(13,92,58,0.3)',
      } : variant === 'outline' ? {
        background: '#fff', color: C.textDark,
        border: `1.5px solid ${C.border}`,
      } : variant === 'ghost' ? {
        background: C.greenPale, color: C.greenMid, border: 'none',
      } : {}),
    }),
  };

  /* ═══════════════════════════════════════════
     STEP 1 — Upload
  ═══════════════════════════════════════════ */
  if (step === 'upload') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px',
      fontFamily: 'DM Sans, sans-serif', maxWidth: '720px' }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button onClick={onBack} style={s.btn('outline')}>
          <Icon d="M19 12H5M12 19l-7-7 7-7" size={15} /> Retour
        </button>
        <div>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '1.25rem',
            fontWeight: 700, color: C.textDark, marginBottom: '2px' }}>
            Importer des produits
          </h2>
          <p style={{ color: C.textMuted, fontSize: '0.8rem' }}>
            Via un fichier Excel (.xlsx) ou CSV
          </p>
        </div>
      </div>

      {/* Télécharger le modèle */}
      <div style={{ ...s.card, background: C.greenPale, border: `1.5px solid ${C.greenBorder}` }}>
        <p style={{ fontWeight: 700, color: C.greenDeep, marginBottom: '6px', fontSize: '0.92rem' }}>
          📥 Étape 1 — Téléchargez le modèle
        </p>
        <p style={{ fontSize: '0.82rem', color: C.textMuted, marginBottom: '16px', lineHeight: 1.6 }}>
          Téléchargez le fichier modèle, remplissez-le avec vos produits, puis importez-le ci-dessous.
        </p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={downloadTemplate} style={s.btn('primary')}>
            <Icon d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1M16 12l-4 4-4-4M12 3v13"
              size={16} stroke="#fff" />
            Modèle Excel (.xlsx)
          </button>
          <button onClick={downloadCSV} style={s.btn('outline')}>
            <Icon d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1M16 12l-4 4-4-4M12 3v13"
              size={16} />
            Modèle CSV (.csv)
          </button>
        </div>
      </div>

      {/* Zone de dépôt */}
      <div style={s.card}>
        <p style={{ fontWeight: 700, color: C.textDark, marginBottom: '6px', fontSize: '0.92rem' }}>
          📤 Étape 2 — Importez votre fichier rempli
        </p>

        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            marginTop: '14px', padding: '48px 24px',
            border: `2px dashed ${dragOver ? C.greenMid : C.border}`,
            borderRadius: '14px',
            background: dragOver ? C.greenPale : '#fafafa',
            cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
          }}
        >
          <div style={{ width: '56px', height: '56px', borderRadius: '14px',
            background: C.greenPale, display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 16px' }}>
            <Icon d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1M16 12l-4 4-4-4M12 3v13"
              size={26} stroke={C.greenMid} />
          </div>
          <p style={{ fontWeight: 700, color: C.textDark, fontSize: '0.95rem', marginBottom: '6px' }}>
            Glissez-déposez votre fichier ici
          </p>
          <p style={{ fontSize: '0.8rem', color: C.textMuted }}>
            ou <span style={{ color: C.greenMid, fontWeight: 700 }}>cliquez pour parcourir</span>
          </p>
          <p style={{ fontSize: '0.74rem', color: '#9ca3af', marginTop: '8px' }}>
            Formats acceptés : .xlsx, .xls, .csv
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) parseFile(f); }}
        />
      </div>

      {/* Consignes */}
      <div style={{ ...s.card, padding: '18px 22px' }}>
        <p style={{ fontWeight: 700, color: C.textDark, fontSize: '0.88rem', marginBottom: '10px' }}>
          ℹ️ Consignes de remplissage
        </p>
        <ul style={{ fontSize: '0.8rem', color: C.textMuted, lineHeight: 1.9, paddingLeft: '18px', margin: 0 }}>
          <li><strong>nom</strong> et <strong>prix</strong> sont <strong>obligatoires</strong></li>
          <li>La colonne <strong>categorie</strong> doit correspondre exactement au nom d'une catégorie existante</li>
          <li><strong>statut</strong> : écrire <code>actif</code> ou <code>inactif</code></li>
          <li><strong>unite</strong> : <code>paquet</code>, <code>carton</code>, <code>lot</code> ou <code>boite</code></li>
          <li>Ne supprimez pas la ligne d'en-têtes du modèle</li>
          <li>Laissez les champs optionnels vides plutôt que d'écrire "N/A"</li>
          <li>Pour les images, collez une <strong>URL</strong> ou laissez vide (ajout possible après l'import)</li>
        </ul>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════
     STEP 2 — Prévisualisation
  ═══════════════════════════════════════════ */
  if (step === 'preview') {
    const validCount   = rows.filter((_, i) => !errors[i]).length;
    const invalidCount = rows.length - validCount;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'DM Sans, sans-serif' }}>
        <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button onClick={() => { setStep('upload'); setRows([]); setErrors({}); }}
              style={s.btn('outline')}>
              <Icon d="M19 12H5M12 19l-7-7 7-7" size={15} /> Retour
            </button>
            <div>
              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '1.15rem',
                fontWeight: 700, color: C.textDark, marginBottom: '2px' }}>
                Prévisualisation — {fileName}
              </h2>
              <p style={{ fontSize: '0.78rem', color: C.textMuted }}>
                {rows.length} ligne{rows.length > 1 ? 's' : ''} détectée{rows.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <button
            onClick={handleImport}
            disabled={validCount === 0}
            style={{
              ...s.btn('primary'),
              opacity: validCount === 0 ? 0.5 : 1,
              cursor: validCount === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            <Icon d="M5 13l4 4L19 7" size={16} stroke="#fff" />
            Importer {validCount} produit{validCount > 1 ? 's' : ''}
          </button>
        </div>

        {/* Résumé compteurs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '12px' }}>
          {[
            { label: 'Total lignes', val: rows.length,   color: C.textDark,  bg: '#f3f4f6' },
            { label: 'Valides',      val: validCount,    color: C.greenDeep, bg: C.greenPale },
            { label: 'Avec erreurs', val: invalidCount,  color: '#dc2626',   bg: '#fef2f2' },
          ].map(({ label, val, color, bg }) => (
            <div key={label} style={{ ...s.card, background: bg, textAlign: 'center', padding: '16px' }}>
              <p style={{ fontSize: '1.6rem', fontWeight: 800, color }}>{val}</p>
              <p style={{ fontSize: '0.76rem', color: C.textMuted, marginTop: '2px' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Alerte erreurs */}
        {invalidCount > 0 && (
          <div style={{ background: '#fef3c7', border: '1px solid #fde68a',
            borderRadius: '12px', padding: '12px 16px',
            display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>⚠️</span>
            <p style={{ fontSize: '0.82rem', color: '#92400e', lineHeight: 1.6 }}>
              <strong>{invalidCount} ligne{invalidCount > 1 ? 's' : ''} ignorée{invalidCount > 1 ? 's' : ''}</strong>{' '}
              à cause d'erreurs (surlignées en rouge). Corrigez le fichier et réimportez,
              ou continuez pour importer uniquement les lignes valides.
            </p>
          </div>
        )}

        {/* Tableau */}
        <div style={{ ...s.card, padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
              <thead>
                <tr style={{ background: C.greenPale, borderBottom: `2px solid ${C.greenBorder}` }}>
                  {['#', 'Nom *', 'Catégorie', 'Prix', 'Stock', 'Unité', 'Statut', 'Validité'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const rowErrors = errors[i];
                  const hasError  = !!rowErrors;
                  return (
                    <tr key={i} style={{
                      borderBottom: `1px solid ${C.border}`,
                      background: hasError ? '#fff5f5' : i % 2 === 0 ? '#fff' : '#f9fbf9',
                      animation: `fadeUp 0.2s ease ${i * 0.02}s both`,
                    }}>
                      <td style={{ ...tdStyle, color: '#9ca3af', fontSize: '0.75rem' }}>{i + 1}</td>
                      <td style={{ ...tdStyle, fontWeight: 700, color: C.textDark }}>{row.nom || '—'}</td>
                      <td style={tdStyle}>{row.categorie || <span style={{ color: '#9ca3af' }}>—</span>}</td>
                      <td style={{ ...tdStyle, fontWeight: 700, color: C.greenMid }}>
                        {row.prix
                          ? `${Number(row.prix).toLocaleString('fr-FR')} F`
                          : <span style={{ color: '#dc2626' }}>—</span>}
                      </td>
                      <td style={tdStyle}>{row.stock || '0'}</td>
                      <td style={tdStyle}>{row.unite || '—'}</td>
                      <td style={tdStyle}>
                        <span style={{
                          padding: '3px 10px', borderRadius: '20px',
                          fontSize: '0.72rem', fontWeight: 700,
                          background: (row.statut || 'actif').toLowerCase() === 'inactif'
                            ? '#f3f4f6' : C.greenPale,
                          color: (row.statut || 'actif').toLowerCase() === 'inactif'
                            ? '#6b7280' : C.greenDeep,
                        }}>
                          {(row.statut || 'actif').toLowerCase() === 'inactif' ? '⛔ Inactif' : '✅ Actif'}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        {hasError ? (
                          <div>
                            <span style={{ color: '#dc2626', fontSize: '0.72rem', fontWeight: 700 }}>
                              ✗ Erreur
                            </span>
                            {rowErrors.map((e, ei) => (
                              <p key={ei} style={{ color: '#dc2626', fontSize: '0.7rem', margin: '2px 0 0' }}>
                                • {e}
                              </p>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: C.greenMid, fontSize: '0.75rem', fontWeight: 700 }}>✓ OK</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════
     STEP 3 — Import en cours
  ═══════════════════════════════════════════ */
  if (step === 'importing') {
    const pct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px',
        fontFamily: 'DM Sans, sans-serif', maxWidth: '560px' }}>
        <div style={{ background: '#fff', borderRadius: '16px', padding: '40px 32px',
          border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(13,92,58,0.05)',
          textAlign: 'center' }}>

          {/* Cercle de progression */}
          <div style={{ position: 'relative', width: '90px', height: '90px', margin: '0 auto 24px' }}>
            <svg viewBox="0 0 90 90" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="45" cy="45" r="38" fill="none" stroke="#e5e7eb" strokeWidth="8" />
              <circle cx="45" cy="45" r="38" fill="none"
                stroke={C.greenMid} strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 38}`}
                strokeDashoffset={`${2 * Math.PI * 38 * (1 - pct / 100)}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.4s ease' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem', fontWeight: 800, color: C.greenDeep }}>
              {pct}%
            </div>
          </div>

          <h3 style={{ fontFamily: 'Georgia,serif', fontSize: '1.1rem',
            fontWeight: 700, color: C.textDark, marginBottom: '6px' }}>
            Import en cours…
          </h3>
          <p style={{ fontSize: '0.84rem', color: C.textMuted, marginBottom: '24px' }}>
            {progress.done} / {progress.total} produits traités
            {progress.failed > 0 && (
              <span style={{ color: '#dc2626', marginLeft: '8px' }}>
                · {progress.failed} échec{progress.failed > 1 ? 's' : ''}
              </span>
            )}
          </p>

          {/* Barre */}
          <div style={{ height: '10px', background: '#e5e7eb', borderRadius: '5px',
            overflow: 'hidden', marginBottom: '20px' }}>
            <div style={{
              height: '100%', borderRadius: '5px', width: `${pct}%`,
              background: `linear-gradient(90deg,${C.greenDeep},${C.greenBright})`,
              transition: 'width 0.4s ease',
            }} />
          </div>

          {/* Log temps réel */}
          <div style={{ maxHeight: '200px', overflowY: 'auto', textAlign: 'left',
            border: `1px solid ${C.border}`, borderRadius: '10px', padding: '10px' }}>
            {log.slice(-20).map((entry, i) => (
              <div key={i} style={{ fontSize: '0.76rem', padding: '3px 0',
                color: entry.ok ? C.greenDeep : '#dc2626',
                borderBottom: i < log.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                {entry.ok ? '✓' : '✗'} {entry.nom}
                {!entry.ok && (
                  <span style={{ color: '#9ca3af', marginLeft: '6px' }}>({entry.msg})</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════
     STEP 4 — Terminé
  ═══════════════════════════════════════════ */
  if (step === 'done') {
    const successCount = progress.done - progress.failed;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px',
        fontFamily: 'DM Sans, sans-serif', maxWidth: '560px' }}>

        <div style={{ background: '#fff', borderRadius: '16px', padding: '40px 32px',
          border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(13,92,58,0.05)',
          textAlign: 'center' }}>

          <div style={{ width: '72px', height: '72px', borderRadius: '50%',
            background: progress.failed === progress.done ? '#fee2e2' : C.greenPale,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', fontSize: '2rem' }}>
            {progress.failed === progress.done ? '😢' : successCount === progress.done ? '🎉' : '✅'}
          </div>

          <h3 style={{ fontFamily: 'Georgia,serif', fontSize: '1.2rem',
            fontWeight: 700, color: C.textDark, marginBottom: '8px' }}>
            Import terminé !
          </h3>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', margin: '16px 0 24px' }}>
            <div>
              <p style={{ fontSize: '2rem', fontWeight: 800, color: C.greenDeep }}>{successCount}</p>
              <p style={{ fontSize: '0.76rem', color: C.textMuted }}>Importés</p>
            </div>
            {progress.failed > 0 && (
              <div>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: '#dc2626' }}>{progress.failed}</p>
                <p style={{ fontSize: '0.76rem', color: C.textMuted }}>Échoués</p>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => { setStep('upload'); setRows([]); setErrors({}); setLog([]); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '11px 22px', border: `1.5px solid ${C.border}`,
                borderRadius: '12px', background: '#fff', color: C.textDark,
                fontFamily: 'DM Sans, sans-serif', fontWeight: 700,
                fontSize: '0.88rem', cursor: 'pointer',
              }}>
              Nouvel import
            </button>
            <button onClick={onSuccess} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '11px 22px', border: 'none', borderRadius: '12px',
              background: `linear-gradient(135deg,${C.greenDeep},${C.greenMid})`,
              color: '#fff', fontFamily: 'DM Sans, sans-serif', fontWeight: 700,
              fontSize: '0.88rem', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(13,92,58,0.3)',
            }}>
              <Icon d="M5 13l4 4L19 7" size={16} stroke="#fff" />
              Voir les produits
            </button>
          </div>
        </div>

        {/* Journal complet */}
        {log.length > 0 && (
          <div style={{ background: '#fff', borderRadius: '16px', padding: '16px 20px',
            border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(13,92,58,0.05)' }}>
            <p style={{ fontWeight: 700, color: C.textDark, fontSize: '0.88rem', marginBottom: '12px' }}>
              Journal d'import
            </p>
            <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
              {log.map((entry, i) => (
                <div key={i} style={{ fontSize: '0.78rem', padding: '5px 0',
                  color: entry.ok ? C.greenDeep : '#dc2626',
                  borderBottom: i < log.length - 1 ? `1px solid ${C.border}` : 'none',
                  display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.9rem' }}>{entry.ok ? '✓' : '✗'}</span>
                  <span>{entry.nom}</span>
                  {!entry.ok && (
                    <span style={{ color: '#9ca3af', fontSize: '0.72rem' }}>— {entry.msg}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

/* ─── Styles tableau ─── */
const thStyle = {
  padding: '12px 14px', textAlign: 'left', fontSize: '0.7rem',
  fontWeight: 700, color: '#1a7d52', textTransform: 'uppercase',
  letterSpacing: '0.05em', whiteSpace: 'nowrap',
};
const tdStyle = {
  padding: '10px 14px', fontSize: '0.82rem',
  color: '#374151', verticalAlign: 'middle',
};