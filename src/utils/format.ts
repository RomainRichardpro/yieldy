import type { Harvest, Legume } from '../types';

export function fmt(n: number): string {
  return (Math.round(n * 100) / 100).toFixed(2).replace('.', ',') + ' €';
}

export function fmt0(n: number): string {
  return Math.round(n).toLocaleString('fr-FR') + ' €';
}

export function initial(nom: string): string {
  return (nom || '?').trim().charAt(0).toUpperCase();
}

export function valeurRecolte(h: Harvest, l: Legume): number {
  if (l.unite === 'kg') return ((h.poids ?? 0) / 1000) * l.prix;
  if (l.unite === '100g') return ((h.poids ?? 0) / 100) * l.prix;
  return (h.qty ?? 0) * l.prix;
}

export function qtyLabel(h: Harvest, l: Legume): string {
  if (l.unite === 'botte') return h.qty + (h.qty > 1 ? ' bottes' : ' botte');
  if (l.unite === 'bouquet') return h.qty + (h.qty > 1 ? ' bouquets' : ' bouquet');
  if ((l.unite === 'kg' || l.unite === '100g') && h.poids) return h.poids + ' g';
  return h.qty + (h.qty > 1 ? ' pièces' : ' pièce');
}

export function relDate(isoDate: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dt = new Date(isoDate);
  dt.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - dt.getTime()) / 86400000);
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return 'Hier';
  if (diff < 7) return `Il y a ${diff} j`;
  const mois = ['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
  return `${dt.getDate()} ${mois[dt.getMonth()]}`;
}

export function longDate(isoDate: string): string {
  const mois = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
  const dt = new Date(isoDate);
  return `${dt.getDate()} ${mois[dt.getMonth()]} ${dt.getFullYear()}`;
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function guessColor(name: string): string {
  const n = name.toLowerCase();
  const map: [RegExp, string][] = [
    [/(tomate|fraise|framboise|cerise|piment|poivron rouge)/, '#c2403a'],
    [/(aubergine|prune|myrtille|cassis|chou rouge|figue)/, '#6d4a8f'],
    [/(carotte|potiron|courge|potimarron|abricot|orange)/, '#d98a2b'],
    [/(radis|betterave|rhubarbe|oignon rouge)/, '#d2596b'],
    [/(citron|maïs|poivron jaune|banane|courgette jaune)/, '#e0b53c'],
    [/(courgette|concombre|haricot|salade|laitue|épinard|basilic|poireau|petit pois|brocoli|chou|menthe|persil|céleri|asperge)/, '#5a8f3c'],
    [/(myrtille|prunelle|bleuet)/, '#3d7a8f'],
    [/(pomme de terre|patate|champignon|oignon|navet|panais|ail)/, '#9a7b3c'],
  ];
  for (const [re, c] of map) { if (re.test(n)) return c; }
  return '#5a8f3c';
}
