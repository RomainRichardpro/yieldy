import { int, real, text, sqliteTable } from 'drizzle-orm/sqlite-core';

// ─── Légumes ──────────────────────────────────────────────────────────────────
// Catalogue global de légumes, indépendant des saisons.
// Un légume est activé par saison via la table `season_legumes`.
export const legumes = sqliteTable('legumes', {
  id:     text('id').primaryKey(),       // ex: 'tomate'
  nom:    text('nom').notNull(),         // ex: 'Tomate'
  prix:   real('prix').notNull(),        // prix de référence (€)
  unite:  text('unite').notNull(),       // 'pièce' | 'kg' | '100g' | 'botte' | 'bouquet'
  source: text('source'),               // ex: 'Leclerc'
  color:  text('color').notNull(),       // hex color, ex: '#c2403a'
  maj:    text('maj').notNull(),         // date ISO de dernière mise à jour du prix
});

// ─── Bacs ─────────────────────────────────────────────────────────────────────
// Zones de culture physiques.
export const bacs = sqliteTable('bacs', {
  id:  text('id').primaryKey(),
  nom: text('nom').notNull(),
  l:   real('l').default(0),            // largeur en cm
  L:   real('L').default(0),            // longueur en cm
});

// ─── Légumes d'un bac ────────────────────────────────────────────────────────
// Ce qu'on plante dans chaque bac (many-to-many)
export const bac_legumes = sqliteTable('bac_legumes', {
  bac_id:    text('bac_id').notNull().references(() => bacs.id),
  legume_id: text('legume_id').notNull().references(() => legumes.id),
});

// ─── Saisons ──────────────────────────────────────────────────────────────────
// Une saison = une année de jardinage.
export const seasons = sqliteTable('seasons', {
  id:     int('id').primaryKey(),        // ex: 2026
  label:  text('label').notNull(),       // ex: 'Saison 2026'
  active: int('active').default(0),     // 1 = saison courante
});

// ─── Légumes actifs par saison ───────────────────────────────────────────────
// Quels légumes sont dans le potager cette saison ?
export const season_legumes = sqliteTable('season_legumes', {
  season_id: int('season_id').notNull().references(() => seasons.id),
  legume_id: text('legume_id').notNull().references(() => legumes.id),
});

// ─── Récoltes ─────────────────────────────────────────────────────────────────
export const harvests = sqliteTable('harvests', {
  id:        text('id').primaryKey(),
  date:      text('date').notNull(),     // ISO date, ex: '2026-06-30'
  legume_id: text('legume_id').notNull().references(() => legumes.id),
  qty:       int('qty').notNull().default(1),
  poids:     real('poids'),              // grammes (optionnel)
  longueur:  real('longueur'),           // cm (optionnel, courgette/concombre)
  variete:   text('variete'),            // ex: 'Coeur de boeuf'
  bac_id:    text('bac_id').references(() => bacs.id),
  notes:     text('notes'),
  season_id: int('season_id').notNull().references(() => seasons.id),
});

// ─── Investissements ──────────────────────────────────────────────────────────
export const invest = sqliteTable('invest', {
  id:        text('id').primaryKey(),
  type:      text('type').notNull(),    // 'initial' | 'recurrent'
  libelle:   text('libelle').notNull(),
  montant:   real('montant').notNull(),
  season_id: int('season_id'),          // null pour 'initial', saison pour 'recurrent'
});
