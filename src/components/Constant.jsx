/* ─── COLORS ──────────────────────────────────────────────────── */
export const C = {
  greenDeep:  '#0d5c3a',
  greenMid:   '#1a7d52',
  greenBright:'#22a96b',
  greenLight: '#d4f0e3',
  greenPale:  '#f0faf5',
  white:      '#ffffff',
  textDark:   '#0a2e1e',
  textMuted:  '#5a8a72',
  border:     '#b8dece',
  bg:         '#f4faf7',
  blue:       '#2563eb',
  amber:      '#d97706',
  red:        '#dc2626',
  purple:     '#7c3aed',
};

/* ─── MOCK DATA ───────────────────────────────────────────────── */
export const pharmacies = [
  { id:1, name:'Pharmacie Centrale',    city:'Dakar',  manager:'Dr. Aminata Diallo',  phone:'+221 77 123 45 67', email:'centrale@pharma.sn',   status:'active',   stock:94, ca:1250000, joined:'Jan 2024', level:'gold',   remises:105000 },
  { id:2, name:'Pharmacie du Plateau',  city:'Dakar',  manager:'Dr. Ibrahima Sow',    phone:'+221 76 234 56 78', email:'plateau@pharma.sn',    status:'active',   stock:78, ca:820000,  joined:'Mar 2024', level:'silver', remises:62000  },
  { id:3, name:'Pharmacie Liberté',     city:'Thiès',  manager:'Dr. Fatou Ndiaye',    phone:'+221 70 345 67 89', email:'liberte@pharma.sn',    status:'inactive', stock:55, ca:430000,  joined:'Fév 2024', level:'bronze', remises:28000  },
  { id:4, name:'Pharmacie Grand Yoff',  city:'Dakar',  manager:'Dr. Moussa Ba',       phone:'+221 78 456 78 90', email:'grandyoff@pharma.sn',  status:'active',   stock:88, ca:960000,  joined:'Avr 2024', level:'silver', remises:74000  },
  { id:5, name:'Pharmacie Mermoz',      city:'Dakar',  manager:'Dr. Rokhaya Cissé',   phone:'+221 77 567 89 01', email:'mermoz@pharma.sn',     status:'active',   stock:67, ca:540000,  joined:'Mai 2024', level:'bronze', remises:38000  },
  { id:6, name:'Pharmacie Almadies',    city:'Dakar',  manager:'Dr. Omar Dieng',      phone:'+221 76 678 90 12', email:'almadies@pharma.sn',   status:'pending',  stock:42, ca:210000,  joined:'Jun 2024', level:'bronze', remises:12000  },
  { id:7, name:'Pharmacie Médina',      city:'Dakar',  manager:'Dr. Aïda Sarr',       phone:'+221 70 789 01 23', email:'medina@pharma.sn',     status:'active',   stock:81, ca:710000,  joined:'Fév 2024', level:'silver', remises:55000  },
  { id:8, name:'Pharmacie Ouakam',      city:'Dakar',  manager:'Dr. Cheikh Fall',     phone:'+221 78 890 12 34', email:'ouakam@pharma.sn',     status:'active',   stock:73, ca:580000,  joined:'Mar 2024', level:'bronze', remises:40000  },
];

export const orders = [
  { id:'#CMD-2041', pharmacy:'Pharmacie Centrale',   items:12, total:248500,  status:'livré',      date:'27 Mar 2026', livraison:'Livraison' },
  { id:'#CMD-2040', pharmacy:'Pharmacie du Plateau', items:7,  total:135000,  status:'en cours',   date:'27 Mar 2026', livraison:'Livraison' },
  { id:'#CMD-2039', pharmacy:'Pharmacie Liberté',    items:3,  total:62000,   status:'en attente', date:'26 Mar 2026', livraison:'Retrait'   },
  { id:'#CMD-2038', pharmacy:'Pharmacie Grand Yoff', items:18, total:410200,  status:'livré',      date:'26 Mar 2026', livraison:'Livraison' },
  { id:'#CMD-2037', pharmacy:'Pharmacie Mermoz',     items:5,  total:98750,   status:'annulé',     date:'25 Mar 2026', livraison:'Livraison' },
  { id:'#CMD-2036', pharmacy:'Pharmacie Almadies',   items:9,  total:187300,  status:'en cours',   date:'25 Mar 2026', livraison:'Retrait'   },
  { id:'#CMD-2035', pharmacy:'Pharmacie Centrale',   items:14, total:320000,  status:'livré',      date:'24 Mar 2026', livraison:'Livraison' },
  { id:'#CMD-2034', pharmacy:'Pharmacie Médina',     items:6,  total:115000,  status:'livré',      date:'24 Mar 2026', livraison:'Livraison' },
  { id:'#CMD-2033', pharmacy:'Pharmacie Ouakam',     items:11, total:220000,  status:'en cours',   date:'23 Mar 2026', livraison:'Retrait'   },
  { id:'#CMD-2032', pharmacy:'Pharmacie Mermoz',     items:4,  total:78500,   status:'livré',      date:'23 Mar 2026', livraison:'Livraison' },
];

export const avantages = [
  { id:1, pharmacy:'Pharmacie Centrale',   type:'Remise volume',    montant:45000,  date:'Mar 2026', statut:'disponible' },
  { id:2, pharmacy:'Pharmacie Centrale',   type:'Bonus fidélité',   montant:20000,  date:'Mar 2026', statut:'disponible' },
  { id:3, pharmacy:'Pharmacie Centrale',   type:'RFA annuelle',     montant:40000,  date:'Jan 2026', statut:'utilisé'    },
  { id:4, pharmacy:'Pharmacie du Plateau', type:'Remise volume',    montant:22000,  date:'Mar 2026', statut:'disponible' },
  { id:5, pharmacy:'Pharmacie du Plateau', type:'Bonus fidélité',   montant:10000,  date:'Fév 2026', statut:'disponible' },
  { id:6, pharmacy:'Pharmacie Grand Yoff', type:'Remise volume',    montant:34000,  date:'Mar 2026', statut:'disponible' },
  { id:7, pharmacy:'Pharmacie Mermoz',     type:'Bonus fidélité',   montant:8000,   date:'Fév 2026', statut:'en attente' },
  { id:8, pharmacy:'Pharmacie Médina',     type:'Remise volume',    montant:25000,  date:'Mar 2026', statut:'disponible' },
  { id:9, pharmacy:'Pharmacie Liberté',    type:'RFA annuelle',     montant:12000,  date:'Jan 2026', statut:'utilisé'    },
  { id:10,pharmacy:'Pharmacie Ouakam',     type:'Bonus fidélité',   montant:15000,  date:'Mar 2026', statut:'disponible' },
];

export const produits = [
  { id:1, nom:'Sac kraft petit',          categorie:'Sacs kraft',         prix:350,   stock:2400, unite:'sac',    photo:'🛍️' },
  { id:2, nom:'Sac kraft moyen',          categorie:'Sacs kraft',         prix:520,   stock:1800, unite:'sac',    photo:'🛍️' },
  { id:3, nom:'Sac kraft grand',          categorie:'Sacs kraft',         prix:750,   stock:1200, unite:'sac',    photo:'🛍️' },
  { id:4, nom:'Pochette à ordonnances',   categorie:'Pochettes',          prix:180,   stock:5000, unite:'pièce',  photo:'📋' },
  { id:5, nom:'Sachet biodégradable S',   categorie:'Biodégradables',     prix:420,   stock:3200, unite:'sachet', photo:'♻️' },
  { id:6, nom:'Sachet biodégradable L',   categorie:'Biodégradables',     prix:680,   stock:2100, unite:'sachet', photo:'♻️' },
  { id:7, nom:'Sticker personnalisé',     categorie:'Stickers',           prix:95,    stock:8000, unite:'pièce',  photo:'🏷️' },
  { id:8, nom:'Boîte parapharmacie',      categorie:'Boîtes',             prix:1200,  stock:600,  unite:'boîte',  photo:'📦' },
];

/* ─── STATUS BADGES ───────────────────────────────────────────── */
export const statusMap = {
  active:        { bg:'#d1fae5', color:'#065f46', label:'Actif'       },
  inactive:      { bg:'#fee2e2', color:'#991b1b', label:'Inactif'     },
  pending:       { bg:'#fef3c7', color:'#92400e', label:'En attente'  },
  'livré':       { bg:'#d1fae5', color:'#065f46', label:'Livré'       },
  'en cours':    { bg:'#dbeafe', color:'#1e40af', label:'En cours'    },
  'en attente':  { bg:'#fef3c7', color:'#92400e', label:'En attente'  },
  'annulé':      { bg:'#fee2e2', color:'#991b1b', label:'Annulé'      },
  disponible:    { bg:'#d1fae5', color:'#065f46', label:'Disponible'  },
  utilisé:       { bg:'#f3f4f6', color:'#6b7280', label:'Utilisé'     },
};

export const levelMap = {
  bronze: { color:'#b45309', bg:'#fef3c7', label:'Bronze' },
  silver: { color:'#475569', bg:'#f1f5f9', label:'Silver' },
  gold:   { color:'#92400e', bg:'#fef9c3', label:'Gold'   },
};

export const fmt = (n) => n?.toLocaleString('fr-FR') + ' FCFA';