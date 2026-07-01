export type Unite = 'pièce' | 'kg' | '100g' | 'botte' | 'bouquet';
export type InvestType = 'initial' | 'recurrent';

export interface Legume {
  id: string;
  nom: string;
  prix: number;
  unite: Unite;
  source?: string | null;
  color: string;
  maj: string;
}

export interface Bac {
  id: string;
  nom: string;
  l: number;
  L: number;
  contenu: string[]; // legume ids
}

export interface Season {
  id: number;
  label: string;
  active: number;
}

export interface Harvest {
  id: string;
  date: string;
  legume_id: string;
  qty: number;
  poids?: number | null;
  longueur?: number | null;
  variete?: string | null;
  bac_id?: string | null;
  notes?: string | null;
  season_id: number;
}

export interface Invest {
  id: string;
  type: InvestType;
  libelle: string;
  montant: number;
  season_id?: number | null;
}
