import { useState, useEffect, useCallback } from 'react';
import { C } from '../../components/Constant';
import { ajouterProduit, getCategories } from '../../services/admin.service';

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
const Icon = ({ d, size = 18, stroke = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={stroke} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const inputStyle = (error) => ({
  width: '100%',
  padding: '11px 14px',
  border: `1.5px solid ${error ? '#dc2626' : C.border}`,
  borderRadius: '12px',
  fontSize: '0.9rem',
  color: C.textDark,
  background: '#fff',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
});

const Label = ({ children, required }) => (
  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700,
    color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em',
    marginBottom: '6px' }}>
    {children}
    {required && <span style={{ color: '#dc2626', marginLeft: '3px' }}>*</span>}
  </label>
);

const ErrorMsg = ({ msg }) => msg
  ? <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '4px' }}>{msg}</p>
  : null;

const Section = ({ title, icon, children }) => (
  <div style={{ background: '#fff', borderRadius: '16px', padding: '24px',
    border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(13,92,58,0.05)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px',
      paddingBottom: '14px', borderBottom: `1px solid ${C.border}` }}>
      <div style={{ width: '34px', height: '34px', borderRadius: '10px',
        background: C.greenPale, display: 'flex', alignItems: 'center',
        justifyContent: 'center' }}>
        <Icon d={icon} size={16} stroke={C.greenMid} />
      </div>
      <h3 style={{ fontFamily: 'Georgia,serif', fontSize: '0.95rem',
        fontWeight: 700, color: C.textDark }}>
        {title}
      </h3>
    </div>
    {children}
  </div>
);

/* ─────────────────────────────────────────────
   Page AddProduit
───────────────────────────────────────────── */
export default function AddProduit({ onBack, onSuccess }) {
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [preview,    setPreview]    = useState(null); // aperçu image
  const [toast,      setToast]      = useState(null);
  const [errors,     setErrors]     = useState({});

  const [form, setForm] = useState({
    nom:          '',
    description:  '',
    prix:         '',
    prix_promo:   '',
    stock:        '',
    image:        '',
    imageFile:    null,
    dimension:    '',
    unite:        '',
    statut:       true,
    categorie_id: '',
  });

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  /* Charger les catégories */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await getCategories();
        setCategories(res.categories || []);
      } catch {
        showToast('Impossible de charger les catégories', 'error');
      }
    };
    load();
  }, [showToast]);

  /* Mise à jour d'un champ */
  const set = (key, value) => {
    setForm(f => ({ ...f, [key]: value }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }));
  };

  /* Validation */
  const validate = () => {
    const e = {};
    if (!form.nom.trim())         e.nom   = 'Le nom est obligatoire';
    if (!form.prix || isNaN(form.prix) || Number(form.prix) <= 0)
                                  e.prix  = 'Prix invalide';
    if (form.prix_promo && (isNaN(form.prix_promo) || Number(form.prix_promo) < 0))
                                  e.prix_promo = 'Prix promo invalide';
    if (form.stock !== '' && (isNaN(form.stock) || Number(form.stock) < 0))
                                  e.stock = 'Stock invalide';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* Soumission */
  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      setLoading(true);

      // Si une image est sélectionnée → FormData (multipart)
      // Sinon → JSON classique
      let payload;
      if (form.imageFile) {
        payload = new FormData();
        payload.append('nom',          form.nom.trim());
        payload.append('description',  form.description.trim() || '');
        payload.append('prix',         Number(form.prix));
        payload.append('prix_promo',   form.prix_promo ? Number(form.prix_promo) : '');
        payload.append('stock',        form.stock !== '' ? Number(form.stock) : 0);
        payload.append('dimension',    form.dimension.trim() || '');
        payload.append('unite',        form.unite || '');
        payload.append('statut',       form.statut);
        payload.append('categorie_id', form.categorie_id || '');
        payload.append('image',        form.imageFile);
      } else {
        payload = {
          nom:          form.nom.trim(),
          description:  form.description.trim() || null,
          prix:         Number(form.prix),
          prix_promo:   form.prix_promo ? Number(form.prix_promo) : null,
          stock:        form.stock !== '' ? Number(form.stock) : 0,
          image:        null,
          dimension:    form.dimension.trim() || null,
          unite:        form.unite || null,
          statut:       form.statut,
          categorie_id: form.categorie_id || null,
        };
      }

      await ajouterProduit(payload);
      showToast('Produit ajouté avec succès ! 🎉');
      setTimeout(() => onSuccess?.(), 1500);
    } catch (err) {
      const msg = err?.response?.data?.message || "Erreur lors de l'ajout du produit";
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  /* Sélection fichier image */
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifications
    if (!file.type.startsWith('image/')) {
      showToast('Fichier invalide — choisissez une image', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("L'image ne doit pas dépasser 5 Mo", 'error');
      return;
    }

    // Stocker le fichier dans le form et générer l'aperçu
    setForm(f => ({ ...f, imageFile: file, image: file.name }));
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setForm(f => ({ ...f, imageFile: null, image: '' }));
    setPreview(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px',
      fontFamily: 'DM Sans, sans-serif', maxWidth: '860px' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
        <button onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: '6px',
            padding: '9px 14px', border: `1.5px solid ${C.border}`,
            borderRadius: '10px', background: '#fff', color: C.textMuted,
            fontSize: '0.84rem', cursor: 'pointer', fontFamily: 'inherit',
            fontWeight: 600 }}>
          <Icon d="M19 12H5M12 19l-7-7 7-7" size={15} />
          Retour
        </button>
        <div>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '1.3rem',
            fontWeight: 700, color: C.textDark, marginBottom: '2px' }}>
            Ajouter un produit
          </h2>
          <p style={{ color: C.textMuted, fontSize: '0.8rem' }}>
            Remplissez les informations du nouveau produit
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* ── Section Informations générales ── */}
        <div style={{ gridColumn: '1 / -1' }}>
          <Section title="Informations générales"
            icon="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 12h6M9 16h4">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

              {/* Nom */}
              <div style={{ gridColumn: '1 / -1' }}>
                <Label required>Nom du produit</Label>
                <input style={inputStyle(errors.nom)} placeholder="Ex: Doliprane 1000mg"
                  value={form.nom} onChange={e => set('nom', e.target.value)} />
                <ErrorMsg msg={errors.nom} />
              </div>

              {/* Description */}
              <div style={{ gridColumn: '1 / -1' }}>
                <Label>Description</Label>
                <textarea
                  style={{ ...inputStyle(false), minHeight: '90px', resize: 'vertical' }}
                  placeholder="Description du produit (optionnelle)"
                  value={form.description}
                  onChange={e => set('description', e.target.value)} />
              </div>

              {/* Catégorie */}
              <div>
                <Label>Catégorie</Label>
                <select style={{ ...inputStyle(false), cursor: 'pointer' }}
                  value={form.categorie_id}
                  onChange={e => set('categorie_id', e.target.value)}>
                  <option value="">— Sélectionner —</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nom}</option>
                  ))}
                </select>
              </div>

              {/* Unité */}
              <div>
                <Label>Unité de vente</Label>
                <select style={{ ...inputStyle(false), cursor: 'pointer' }}
                  value={form.unite}
                  onChange={e => set('unite', e.target.value)}>
                  <option value="">— Sélectionner —</option>
                  <option value="paquet">Paquet</option>
                  <option value="carton">Carton</option>
                  <option value="lot">Lot</option>
                  <option value="boite">Boîte</option>
                </select>
              </div>

              {/* Dimension */}
              <div style={{ gridColumn: '1 / -1' }}>
                <Label>Dimension / Contenance</Label>
                <input style={inputStyle(false)} placeholder="Ex: 30 comprimés, 500ml…"
                  value={form.dimension} onChange={e => set('dimension', e.target.value)} />
              </div>

              {/* Statut */}
              <div style={{ gridColumn: '1 / -1' }}>
                <Label>Statut</Label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {[{ val: true, label: '✅ Actif' }, { val: false, label: '⛔ Inactif' }].map(opt => (
                    <button key={String(opt.val)} onClick={() => set('statut', opt.val)}
                      style={{ padding: '9px 20px', borderRadius: '10px',
                        border: `1.5px solid ${form.statut === opt.val ? C.greenMid : C.border}`,
                        background: form.statut === opt.val ? C.greenPale : '#fff',
                        color: form.statut === opt.val ? C.greenDeep : C.textMuted,
                        fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                        fontFamily: 'inherit', transition: 'all 0.15s' }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Section>
        </div>

        {/* ── Section Prix ── */}
        <Section title="Prix"
          icon="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2M12 6v6l4 2">
          <Label required>Prix unitaire (FCFA)</Label>
          <input style={inputStyle(errors.prix)} type="number" min="0"
            placeholder="Ex: 2500"
            value={form.prix} onChange={e => set('prix', e.target.value)} />
          <ErrorMsg msg={errors.prix} />

          <Label>Prix promotionnel (FCFA)</Label>
          <input style={inputStyle(errors.prix_promo)} type="number" min="0"
            placeholder="Laisser vide si aucun"
            value={form.prix_promo} onChange={e => set('prix_promo', e.target.value)} />
          <ErrorMsg msg={errors.prix_promo} />

          {/* Aperçu économie */}
          {form.prix && form.prix_promo && Number(form.prix_promo) < Number(form.prix) && (
            <div style={{ padding: '10px 14px', background: C.greenPale,
              borderRadius: '10px', marginTop: '4px' }}>
              <p style={{ fontSize: '0.8rem', color: C.greenDeep, fontWeight: 600 }}>
                💰 Remise de{' '}
                <strong>
                  {Math.round((1 - Number(form.prix_promo) / Number(form.prix)) * 100)}%
                </strong>{' '}
                sur le prix normal
              </p>
            </div>
          )}
        </Section>

        {/* ── Section Stock ── */}
        <Section title="Stock"
          icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4">
          <Label>Quantité en stock</Label>
          <input style={inputStyle(errors.stock)} type="number" min="0"
            placeholder="Ex: 1500"
            value={form.stock} onChange={e => set('stock', e.target.value)} />
          <ErrorMsg msg={errors.stock} />

          {/* Indicateur visuel stock */}
          {form.stock !== '' && !isNaN(form.stock) && (
            <div style={{ marginTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between',
                marginBottom: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: C.textMuted }}>Niveau de stock</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700,
                  color: Number(form.stock) < 500 ? '#d97706'
                    : Number(form.stock) < 2000 ? C.greenMid : C.greenDeep }}>
                  {Number(form.stock) < 500 ? '⚠ Faible'
                    : Number(form.stock) < 2000 ? 'Moyen' : 'Bon'}
                </span>
              </div>
              <div style={{ height: '8px', background: '#e5e7eb',
                borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: '4px',
                  transition: 'width 0.4s ease',
                  width: `${Math.min((Number(form.stock) / 5000) * 100, 100)}%`,
                  background: Number(form.stock) < 500 ? '#d97706'
                    : Number(form.stock) < 2000
                      ? `linear-gradient(90deg,${C.greenMid},${C.greenBright})`
                      : `linear-gradient(90deg,${C.greenDeep},${C.greenBright})`,
                }} />
              </div>
            </div>
          )}
        </Section>

        {/* ── Section Image ── */}
        <div style={{ gridColumn: '1 / -1' }}>
          <Section title="Image du produit"
            icon="M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2l1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px',
              alignItems: 'flex-start' }}>

              <div>
                {/* Zone de dépôt / clic */}
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <label htmlFor="image-upload"
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', gap: '10px',
                    padding: '28px 20px',
                    border: `2px dashed ${preview ? C.greenMid : C.border}`,
                    borderRadius: '14px',
                    background: preview ? C.greenPale : '#fafafa',
                    cursor: 'pointer', transition: 'all 0.2s',
                    textAlign: 'center',
                  }}>
                  {preview ? (
                    <>
                      <Icon d="M5 13l4 4L19 7" size={22} stroke={C.greenMid} />
                      <p style={{ fontSize: '0.85rem', fontWeight: 700, color: C.greenDeep }}>
                        {form.image}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: C.textMuted }}>
                        Cliquez pour changer l'image
                      </p>
                    </>
                  ) : (
                    <>
                      <div style={{ width: '44px', height: '44px', borderRadius: '12px',
                        background: C.greenPale, display: 'flex', alignItems: 'center',
                        justifyContent: 'center' }}>
                        <Icon d="M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2l1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"
                          size={22} stroke={C.greenMid} />
                      </div>
                      <div>
                        <p style={{ fontSize: '0.88rem', fontWeight: 700, color: C.textDark }}>
                          Choisir une image
                        </p>
                        <p style={{ fontSize: '0.75rem', color: C.textMuted, marginTop: '2px' }}>
                          PNG, JPG, WEBP · max 5 Mo
                        </p>
                      </div>
                    </>
                  )}
                </label>

                {/* Bouton supprimer image */}
                {preview && (
                  <button onClick={removeImage}
                    style={{ marginTop: '10px', padding: '7px 14px', border: 'none',
                      borderRadius: '8px', background: '#fee2e2', color: '#dc2626',
                      fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                      fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Icon d="M18 6L6 18M6 6l12 12" size={13} stroke="#dc2626" />
                    Supprimer l'image
                  </button>
                )}
              </div>

              {/* Aperçu */}
              <div style={{ width: '120px', height: '120px', borderRadius: '14px',
                border: `2px solid ${preview ? C.greenBorder : C.border}`,
                overflow: 'hidden', display: 'flex', alignItems: 'center',
                justifyContent: 'center', background: C.greenPale, flexShrink: 0,
                transition: 'border-color 0.2s' }}>
                {preview ? (
                  <img src={preview} alt="aperçu"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '2.5rem' }}>💊</span>
                )}
              </div>
            </div>
          </Section>
        </div>
      </div>

      {/* ── Actions ── */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end',
        padding: '20px', background: '#fff', borderRadius: '16px',
        border: `1px solid ${C.border}`,
        boxShadow: '0 2px 8px rgba(13,92,58,0.05)',
        position: 'sticky', bottom: '16px' }}>
        <button onClick={onBack}
          style={{ padding: '12px 24px', border: `1.5px solid ${C.border}`,
            borderRadius: '12px', background: '#fff', color: C.textDark,
            fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
            fontFamily: 'inherit' }}>
          Annuler
        </button>
        <button onClick={handleSubmit} disabled={loading}
          style={{ padding: '12px 28px', border: 'none', borderRadius: '12px',
            background: loading
              ? '#9ca3af'
              : `linear-gradient(135deg,${C.greenDeep},${C.greenMid})`,
            color: '#fff', fontWeight: 700, fontSize: '0.9rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: loading ? 'none' : '0 4px 14px rgba(13,92,58,0.3)',
            transition: 'all 0.15s' }}>
          {loading ? (
            <>
              <span style={{ display: 'inline-block', width: '16px', height: '16px',
                border: '2px solid rgba(255,255,255,0.4)',
                borderTopColor: '#fff', borderRadius: '50%',
                animation: 'spin 0.7s linear infinite' }} />
              Enregistrement…
            </>
          ) : (
            <>
              <Icon d="M5 13l4 4L19 7" size={16} stroke="#fff" />
              Ajouter le produit
            </>
          )}
        </button>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '28px', right: '28px', zIndex: 1000,
          background: toast.type === 'error' ? '#dc2626' : C.greenDeep,
          color: '#fff', padding: '12px 22px', borderRadius: '14px',
          fontSize: '0.875rem', fontWeight: 600,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          animation: 'fadeUp 0.3s ease both' }}>
          {toast.msg}
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}