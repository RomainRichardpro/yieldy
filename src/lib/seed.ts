import { supabase } from './supabase';

export async function seedDatabase(seasonId: number) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const uid = user.id;

  await supabase.from('legumes').upsert([
    { id: 'tomate',    user_id: uid, nom: 'Tomate',       prix: 2.50, unite: 'pièce',   source: 'Leclerc',  color: '#c2403a', maj: '2026-01-01' },
    { id: 'courgette', user_id: uid, nom: 'Courgette',    prix: 1.80, unite: 'pièce',   source: 'Marché',   color: '#5a8f3c', maj: '2026-01-01' },
    { id: 'haricot',   user_id: uid, nom: 'Haricot vert', prix: 4.50, unite: '100g',    source: 'Bio c bon',color: '#3f8f5a', maj: '2026-01-01' },
    { id: 'laitue',    user_id: uid, nom: 'Laitue',       prix: 2.20, unite: 'pièce',   source: 'Leclerc',  color: '#6d4a8f', maj: '2026-01-01' },
    { id: 'radis',     user_id: uid, nom: 'Radis',        prix: 2.80, unite: 'botte',   source: 'Marché',   color: '#d2596b', maj: '2026-01-01' },
    { id: 'basilic',   user_id: uid, nom: 'Basilic',      prix: 1.90, unite: 'bouquet', source: 'Leclerc',  color: '#3d7a8f', maj: '2026-01-01' },
  ]);

  await supabase.from('bacs').upsert([
    { id: 'bac-sud',       user_id: uid, nom: 'Bac Sud',          larg: 120, long: 60 },
    { id: 'bac-est',       user_id: uid, nom: 'Bac Est',          larg: 80,  long: 40 },
    { id: 'jardinierebal', user_id: uid, nom: 'Jardinière balcon', larg: 100, long: 25 },
  ]);

  await supabase.from('bac_legumes').upsert([
    { user_id: uid, bac_id: 'bac-sud',       legume_id: 'tomate' },
    { user_id: uid, bac_id: 'bac-sud',       legume_id: 'basilic' },
    { user_id: uid, bac_id: 'bac-est',       legume_id: 'courgette' },
    { user_id: uid, bac_id: 'bac-est',       legume_id: 'haricot' },
    { user_id: uid, bac_id: 'jardinierebal', legume_id: 'laitue' },
    { user_id: uid, bac_id: 'jardinierebal', legume_id: 'radis' },
  ]);

  await supabase.from('season_legumes').upsert([
    { user_id: uid, season_id: seasonId, legume_id: 'tomate' },
    { user_id: uid, season_id: seasonId, legume_id: 'courgette' },
    { user_id: uid, season_id: seasonId, legume_id: 'haricot' },
    { user_id: uid, season_id: seasonId, legume_id: 'laitue' },
    { user_id: uid, season_id: seasonId, legume_id: 'radis' },
    { user_id: uid, season_id: seasonId, legume_id: 'basilic' },
  ]);

  await supabase.from('harvests').upsert([
    { id: 'h01', user_id: uid, date: '2026-05-12', legume_id: 'radis',     qty: 1,  season_id: seasonId, bac_id: 'jardinierebal', notes: 'Premiers radis de la saison !' },
    { id: 'h02', user_id: uid, date: '2026-05-15', legume_id: 'laitue',    qty: 2,  season_id: seasonId, bac_id: 'jardinierebal' },
    { id: 'h03', user_id: uid, date: '2026-05-20', legume_id: 'radis',     qty: 1,  season_id: seasonId, bac_id: 'jardinierebal' },
    { id: 'h04', user_id: uid, date: '2026-05-28', legume_id: 'laitue',    qty: 3,  season_id: seasonId, bac_id: 'jardinierebal' },
    { id: 'h05', user_id: uid, date: '2026-06-03', legume_id: 'courgette', qty: 2,  season_id: seasonId, bac_id: 'bac-est', variete: 'Black Beauty' },
    { id: 'h06', user_id: uid, date: '2026-06-08', legume_id: 'haricot',   qty: 4,  season_id: seasonId, bac_id: 'bac-est', poids: 320 },
    { id: 'h07', user_id: uid, date: '2026-06-10', legume_id: 'tomate',    qty: 5,  season_id: seasonId, bac_id: 'bac-sud', variete: 'Coeur de boeuf' },
    { id: 'h08', user_id: uid, date: '2026-06-12', legume_id: 'basilic',   qty: 2,  season_id: seasonId, bac_id: 'bac-sud' },
    { id: 'h09', user_id: uid, date: '2026-06-15', legume_id: 'courgette', qty: 3,  season_id: seasonId, bac_id: 'bac-est' },
    { id: 'h10', user_id: uid, date: '2026-06-18', legume_id: 'tomate',    qty: 8,  season_id: seasonId, bac_id: 'bac-sud' },
    { id: 'h11', user_id: uid, date: '2026-06-20', legume_id: 'haricot',   qty: 3,  season_id: seasonId, bac_id: 'bac-est', poids: 280 },
    { id: 'h12', user_id: uid, date: '2026-06-22', legume_id: 'laitue',    qty: 2,  season_id: seasonId, bac_id: 'jardinierebal' },
    { id: 'h13', user_id: uid, date: '2026-06-25', legume_id: 'tomate',    qty: 12, season_id: seasonId, bac_id: 'bac-sud', variete: 'Coeur de boeuf', notes: 'Belle récolte !' },
    { id: 'h14', user_id: uid, date: '2026-06-27', legume_id: 'courgette', qty: 4,  season_id: seasonId, bac_id: 'bac-est' },
    { id: 'h15', user_id: uid, date: '2026-06-30', legume_id: 'basilic',   qty: 3,  season_id: seasonId, bac_id: 'bac-sud' },
    { id: 'h16', user_id: uid, date: '2026-07-02', legume_id: 'tomate',    qty: 10, season_id: seasonId, bac_id: 'bac-sud' },
    { id: 'h17', user_id: uid, date: '2026-07-02', legume_id: 'haricot',   qty: 5,  season_id: seasonId, bac_id: 'bac-est', poids: 450 },
    { id: 'h18', user_id: uid, date: '2026-07-02', legume_id: 'courgette', qty: 2,  season_id: seasonId, bac_id: 'bac-est', variete: 'Black Beauty' },
  ]);

  await supabase.from('invest').upsert([
    { id: 'inv01', user_id: uid, type: 'initial',   libelle: 'Construction des bacs', montant: 180, season_id: null },
    { id: 'inv02', user_id: uid, type: 'initial',   libelle: 'Terreau premium',       montant: 45,  season_id: null },
    { id: 'inv03', user_id: uid, type: 'initial',   libelle: 'Semences et plants',    montant: 28,  season_id: null },
    { id: 'inv04', user_id: uid, type: 'recurrent', libelle: 'Eau et arrosage',       montant: 12,  season_id: seasonId },
    { id: 'inv05', user_id: uid, type: 'recurrent', libelle: 'Engrais liquide',       montant: 15,  season_id: seasonId },
  ]);
}
