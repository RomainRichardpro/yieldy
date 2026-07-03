import { db } from './client';
import { legumes, bacs, bac_legumes, season_legumes, harvests, invest } from './schema';

export async function seedDatabase(seasonId: number) {
  // ── Légumes ──────────────────────────────────────────────────────────────
  await db.insert(legumes).values([
    { id: 'tomate',    nom: 'Tomate',       prix: 2.50, unite: 'pièce', source: 'Leclerc', color: '#c2403a', maj: '2026-01-01' },
    { id: 'courgette', nom: 'Courgette',    prix: 1.80, unite: 'pièce', source: 'Marché',  color: '#5a8f3c', maj: '2026-01-01' },
    { id: 'haricot',   nom: 'Haricot vert', prix: 4.50, unite: '100g',  source: 'Bio c bon',color: '#3f8f5a', maj: '2026-01-01' },
    { id: 'laitue',    nom: 'Laitue',       prix: 2.20, unite: 'pièce', source: 'Leclerc', color: '#6d4a8f', maj: '2026-01-01' },
    { id: 'radis',     nom: 'Radis',        prix: 2.80, unite: 'botte', source: 'Marché',  color: '#d2596b', maj: '2026-01-01' },
    { id: 'basilic',   nom: 'Basilic',      prix: 1.90, unite: 'bouquet',source: 'Leclerc',color: '#3d7a8f', maj: '2026-01-01' },
  ]).onConflictDoNothing();

  // ── Bacs ─────────────────────────────────────────────────────────────────
  await db.insert(bacs).values([
    { id: 'bac-sud',      nom: 'Bac Sud',          larg: 120, long: 60 },
    { id: 'bac-est',      nom: 'Bac Est',           larg: 80,  long: 40 },
    { id: 'jardinierebal',nom: 'Jardinière balcon', larg: 100, long: 25 },
  ]).onConflictDoNothing();

  // ── Contenu des bacs ─────────────────────────────────────────────────────
  await db.insert(bac_legumes).values([
    { bac_id: 'bac-sud',       legume_id: 'tomate' },
    { bac_id: 'bac-sud',       legume_id: 'basilic' },
    { bac_id: 'bac-est',       legume_id: 'courgette' },
    { bac_id: 'bac-est',       legume_id: 'haricot' },
    { bac_id: 'jardinierebal', legume_id: 'laitue' },
    { bac_id: 'jardinierebal', legume_id: 'radis' },
  ]).onConflictDoNothing();

  // ── Légumes actifs cette saison ───────────────────────────────────────────
  await db.insert(season_legumes).values([
    { season_id: seasonId, legume_id: 'tomate' },
    { season_id: seasonId, legume_id: 'courgette' },
    { season_id: seasonId, legume_id: 'haricot' },
    { season_id: seasonId, legume_id: 'laitue' },
    { season_id: seasonId, legume_id: 'radis' },
    { season_id: seasonId, legume_id: 'basilic' },
  ]).onConflictDoNothing();

  // ── Récoltes ─────────────────────────────────────────────────────────────
  await db.insert(harvests).values([
    { id: 'h01', date: '2026-05-12', legume_id: 'radis',     qty: 1,  season_id: seasonId, bac_id: 'jardinierebal', notes: 'Premiers radis de la saison !' },
    { id: 'h02', date: '2026-05-15', legume_id: 'laitue',    qty: 2,  season_id: seasonId, bac_id: 'jardinierebal' },
    { id: 'h03', date: '2026-05-20', legume_id: 'radis',     qty: 1,  season_id: seasonId, bac_id: 'jardinierebal' },
    { id: 'h04', date: '2026-05-28', legume_id: 'laitue',    qty: 3,  season_id: seasonId, bac_id: 'jardinierebal' },
    { id: 'h05', date: '2026-06-03', legume_id: 'courgette', qty: 2,  season_id: seasonId, bac_id: 'bac-est', variete: 'Black Beauty' },
    { id: 'h06', date: '2026-06-08', legume_id: 'haricot',   qty: 4,  season_id: seasonId, bac_id: 'bac-est', poids: 320 },
    { id: 'h07', date: '2026-06-10', legume_id: 'tomate',    qty: 5,  season_id: seasonId, bac_id: 'bac-sud', variete: 'Coeur de boeuf' },
    { id: 'h08', date: '2026-06-12', legume_id: 'basilic',   qty: 2,  season_id: seasonId, bac_id: 'bac-sud' },
    { id: 'h09', date: '2026-06-15', legume_id: 'courgette', qty: 3,  season_id: seasonId, bac_id: 'bac-est' },
    { id: 'h10', date: '2026-06-18', legume_id: 'tomate',    qty: 8,  season_id: seasonId, bac_id: 'bac-sud' },
    { id: 'h11', date: '2026-06-20', legume_id: 'haricot',   qty: 3,  season_id: seasonId, bac_id: 'bac-est', poids: 280 },
    { id: 'h12', date: '2026-06-22', legume_id: 'laitue',    qty: 2,  season_id: seasonId, bac_id: 'jardinierebal' },
    { id: 'h13', date: '2026-06-25', legume_id: 'tomate',    qty: 12, season_id: seasonId, bac_id: 'bac-sud', variete: 'Coeur de boeuf', notes: 'Belle récolte !' },
    { id: 'h14', date: '2026-06-27', legume_id: 'courgette', qty: 4,  season_id: seasonId, bac_id: 'bac-est' },
    { id: 'h15', date: '2026-06-30', legume_id: 'basilic',   qty: 3,  season_id: seasonId, bac_id: 'bac-sud' },
    { id: 'h16', date: '2026-07-02', legume_id: 'tomate',    qty: 10, season_id: seasonId, bac_id: 'bac-sud' },
    { id: 'h17', date: '2026-07-02', legume_id: 'haricot',   qty: 5,  season_id: seasonId, bac_id: 'bac-est', poids: 450 },
    { id: 'h18', date: '2026-07-02', legume_id: 'courgette', qty: 2,  season_id: seasonId, bac_id: 'bac-est', variete: 'Black Beauty' },
  ]).onConflictDoNothing();

  // ── Investissements ───────────────────────────────────────────────────────
  await db.insert(invest).values([
    { id: 'inv01', type: 'initial',   libelle: 'Construction des bacs',  montant: 180, season_id: null },
    { id: 'inv02', type: 'initial',   libelle: 'Terreau premium',        montant: 45,  season_id: null },
    { id: 'inv03', type: 'initial',   libelle: 'Semences et plants',     montant: 28,  season_id: null },
    { id: 'inv04', type: 'recurrent', libelle: 'Eau et arrosage',        montant: 12,  season_id: seasonId },
    { id: 'inv05', type: 'recurrent', libelle: 'Engrais liquide',        montant: 15,  season_id: seasonId },
  ]).onConflictDoNothing();
}
