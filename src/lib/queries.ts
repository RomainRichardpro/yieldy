import { supabase } from './supabase';
import type { Legume, Bac, Season, Harvest, Invest } from '../types';
import { todayISO } from '../utils/format';

async function uid(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return user.id;
}

// ─── Legumes ──────────────────────────────────────────────────────────────────

export async function getLegumes(): Promise<Legume[]> {
  const { data, error } = await supabase.from('legumes').select('*');
  if (error) throw error;
  return data as Legume[];
}

export async function upsertLegume(data: Omit<Legume, 'maj'>): Promise<void> {
  const user_id = await uid();
  const { error } = await supabase.from('legumes').upsert({ ...data, user_id, maj: todayISO() });
  if (error) throw error;
}

export async function deleteLegume(id: string): Promise<void> {
  const user_id = await uid();
  await supabase.from('season_legumes').delete().match({ user_id, legume_id: id });
  await supabase.from('bac_legumes').delete().match({ user_id, legume_id: id });
  const { error } = await supabase.from('legumes').delete().match({ user_id, id });
  if (error) throw error;
}

// ─── Season legumes ───────────────────────────────────────────────────────────

export async function getSeasonLegumeIds(seasonId: number): Promise<string[]> {
  const { data, error } = await supabase
    .from('season_legumes')
    .select('legume_id')
    .eq('season_id', seasonId);
  if (error) throw error;
  return data.map((r: any) => r.legume_id);
}

export async function toggleSeasonLegume(seasonId: number, legumeId: string): Promise<void> {
  const user_id = await uid();
  const { data } = await supabase
    .from('season_legumes')
    .select('*')
    .match({ user_id, season_id: seasonId, legume_id: legumeId });

  if (data && data.length > 0) {
    await supabase.from('season_legumes').delete().match({ user_id, season_id: seasonId, legume_id: legumeId });
  } else {
    await supabase.from('season_legumes').insert({ user_id, season_id: seasonId, legume_id: legumeId });
  }
}

// ─── Bacs ─────────────────────────────────────────────────────────────────────

export async function getBacs(): Promise<Bac[]> {
  const { data: bacsData, error } = await supabase.from('bacs').select('*');
  if (error) throw error;
  const { data: contenuData } = await supabase.from('bac_legumes').select('*');
  return (bacsData as any[]).map(b => ({
    ...b,
    larg: b.larg ?? 0,
    long: b.long ?? 0,
    contenu: (contenuData ?? []).filter((c: any) => c.bac_id === b.id).map((c: any) => c.legume_id),
  }));
}

export async function upsertBac(data: Bac): Promise<void> {
  const user_id = await uid();
  const { error } = await supabase.from('bacs').upsert({ id: data.id, user_id, nom: data.nom, larg: data.larg, long: data.long });
  if (error) throw error;
  await supabase.from('bac_legumes').delete().match({ user_id, bac_id: data.id });
  for (const lid of data.contenu) {
    await supabase.from('bac_legumes').insert({ user_id, bac_id: data.id, legume_id: lid });
  }
}

export async function deleteBac(id: string): Promise<void> {
  const user_id = await uid();
  await supabase.from('bac_legumes').delete().match({ user_id, bac_id: id });
  const { error } = await supabase.from('bacs').delete().match({ user_id, id });
  if (error) throw error;
}

// ─── Seasons ──────────────────────────────────────────────────────────────────

export async function getSeasons(): Promise<Season[]> {
  const { data, error } = await supabase.from('seasons').select('*');
  if (error) throw error;
  return (data as any[]).map(r => ({ ...r, active: r.active ?? 0 })) as Season[];
}

export async function getActiveSeason(): Promise<Season | null> {
  const { data, error } = await supabase.from('seasons').select('*').eq('active', 1).limit(1);
  if (error) throw error;
  if (!data || data.length === 0) return null;
  return { ...data[0], active: data[0].active ?? 0 } as Season;
}

export async function setActiveSeason(id: number): Promise<void> {
  const user_id = await uid();
  await supabase.from('seasons').update({ active: 0 }).eq('user_id', user_id);
  await supabase.from('seasons').update({ active: 1 }).match({ user_id, id });
}

export async function createSeason(year: number): Promise<void> {
  const user_id = await uid();
  const { error } = await supabase.from('seasons').insert({ id: year, user_id, label: `Saison ${year}`, active: 0 });
  if (error) throw error;
}

// ─── Harvests ─────────────────────────────────────────────────────────────────

export async function getHarvests(seasonId: number): Promise<Harvest[]> {
  const { data, error } = await supabase
    .from('harvests')
    .select('*')
    .eq('season_id', seasonId)
    .order('date', { ascending: false });
  if (error) throw error;
  return data as Harvest[];
}

export async function upsertHarvest(data: Harvest): Promise<void> {
  const user_id = await uid();
  const { error } = await supabase.from('harvests').upsert({ ...data, user_id });
  if (error) throw error;
}

export async function deleteHarvest(id: string): Promise<void> {
  const user_id = await uid();
  const { error } = await supabase.from('harvests').delete().match({ user_id, id });
  if (error) throw error;
}

// ─── Invest ───────────────────────────────────────────────────────────────────

export async function getInvest(): Promise<Invest[]> {
  const { data, error } = await supabase.from('invest').select('*');
  if (error) throw error;
  return data as Invest[];
}

export async function upsertInvest(data: Invest): Promise<void> {
  const user_id = await uid();
  const { error } = await supabase.from('invest').upsert({ ...data, user_id });
  if (error) throw error;
}

export async function deleteInvest(id: string): Promise<void> {
  const user_id = await uid();
  const { error } = await supabase.from('invest').delete().match({ user_id, id });
  if (error) throw error;
}
