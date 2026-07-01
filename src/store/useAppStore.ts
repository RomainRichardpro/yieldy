import { create } from 'zustand';
import type { InvestType } from '../types';
import { todayISO } from '../utils/format';
import { guessColor } from '../utils/format';

// ─── Harvest form ─────────────────────────────────────────────────────────────

export interface HarvestForm {
  date: string;
  legume_id: string | null;
  qty: number;
  poids: string;
  longueur: string;
  variete: string;
  bac_id: string | null;
  notes: string;
}

function blankHarvestForm(): HarvestForm {
  return { date: todayISO(), legume_id: null, qty: 1, poids: '', longueur: '', variete: '', bac_id: null, notes: '' };
}

// ─── Legume form ──────────────────────────────────────────────────────────────

export interface LegumeForm {
  nom: string;
  prix: string;
  unite: string;
  source: string;
  color: string;
  colorTouched: boolean;
}

function blankLegumeForm(): LegumeForm {
  return { nom: '', prix: '', unite: 'pièce', source: '', color: '#5a8f3c', colorTouched: false };
}

// ─── Bac form ─────────────────────────────────────────────────────────────────

export interface BacForm {
  nom: string;
  larg: string;
  long: string;
  contenu: string[];
}

function blankBacForm(index: number): BacForm {
  return { nom: `Bac ${index}`, larg: '', long: '', contenu: [] };
}

// ─── Invest form ──────────────────────────────────────────────────────────────

export interface InvestForm {
  type: InvestType;
  libelle: string;
  montant: string;
}

function blankInvestForm(type: InvestType = 'initial'): InvestForm {
  return { type, libelle: '', montant: '' };
}

// ─── Store ────────────────────────────────────────────────────────────────────

interface AppStore {
  activeSeason: number | null;
  setActiveSeason: (id: number) => void;

  // Harvest sheet
  harvestOpen: boolean;
  harvestEditId: string | null;
  harvestForm: HarvestForm;
  openHarvest: (editId?: string, prefill?: Partial<HarvestForm>) => void;
  closeHarvest: () => void;
  setHarvestForm: (patch: Partial<HarvestForm>) => void;
  incQty: (d: number) => void;

  // Legume sheet
  legumeOpen: boolean;
  legumeEditId: string | null;
  legumeForm: LegumeForm;
  openLegume: (editId?: string, prefill?: Partial<LegumeForm>) => void;
  closeLegume: () => void;
  setLegumeForm: (patch: Partial<LegumeForm>) => void;
  onLegumeNom: (v: string) => void;

  // Bac sheet
  bacOpen: boolean;
  bacEditId: string | null;
  bacForm: BacForm;
  openBac: (editId?: string, prefill?: Partial<BacForm>, bacCount?: number) => void;
  closeBac: () => void;
  setBacForm: (patch: Partial<BacForm>) => void;
  toggleBacContenu: (id: string) => void;

  // Invest sheet
  investOpen: boolean;
  investEditId: string | null;
  investForm: InvestForm;
  openInvest: (type?: InvestType, editId?: string, prefill?: Partial<InvestForm>) => void;
  closeInvest: () => void;
  setInvestForm: (patch: Partial<InvestForm>) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  activeSeason: null,
  setActiveSeason: (id) => set({ activeSeason: id }),

  // ── Harvest ──
  harvestOpen: false,
  harvestEditId: null,
  harvestForm: blankHarvestForm(),
  openHarvest: (editId, prefill) => set({
    harvestOpen: true,
    harvestEditId: editId ?? null,
    harvestForm: { ...blankHarvestForm(), ...prefill },
  }),
  closeHarvest: () => set({ harvestOpen: false, harvestEditId: null }),
  setHarvestForm: (patch) => set(s => ({ harvestForm: { ...s.harvestForm, ...patch } })),
  incQty: (d) => set(s => ({ harvestForm: { ...s.harvestForm, qty: Math.max(1, s.harvestForm.qty + d) } })),

  // ── Legume ──
  legumeOpen: false,
  legumeEditId: null,
  legumeForm: blankLegumeForm(),
  openLegume: (editId, prefill) => set({
    legumeOpen: true,
    legumeEditId: editId ?? null,
    legumeForm: { ...blankLegumeForm(), ...prefill },
  }),
  closeLegume: () => set({ legumeOpen: false, legumeEditId: null }),
  setLegumeForm: (patch) => set(s => ({ legumeForm: { ...s.legumeForm, ...patch } })),
  onLegumeNom: (v) => set(s => {
    const f = { ...s.legumeForm, nom: v };
    if (!f.colorTouched) f.color = guessColor(v);
    return { legumeForm: f };
  }),

  // ── Bac ──
  bacOpen: false,
  bacEditId: null,
  bacForm: blankBacForm(1),
  openBac: (editId, prefill, bacCount = 1) => set({
    bacOpen: true,
    bacEditId: editId ?? null,
    bacForm: { ...blankBacForm(bacCount + 1), ...prefill },
  }),
  closeBac: () => set({ bacOpen: false, bacEditId: null }),
  setBacForm: (patch) => set(s => ({ bacForm: { ...s.bacForm, ...patch } })),
  toggleBacContenu: (id) => set(s => {
    const cur = s.bacForm.contenu;
    return { bacForm: { ...s.bacForm, contenu: cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id] } };
  }),

  // ── Invest ──
  investOpen: false,
  investEditId: null,
  investForm: blankInvestForm(),
  openInvest: (type = 'initial', editId, prefill) => set({
    investOpen: true,
    investEditId: editId ?? null,
    investForm: { ...blankInvestForm(type), ...prefill },
  }),
  closeInvest: () => set({ investOpen: false, investEditId: null }),
  setInvestForm: (patch) => set(s => ({ investForm: { ...s.investForm, ...patch } })),
}));
