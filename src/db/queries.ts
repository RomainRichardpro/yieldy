import { eq, desc, and } from 'drizzle-orm';
import { db } from './client';
import { legumes, bacs, bac_legumes, seasons, season_legumes, harvests, invest } from './schema';
import type { Legume, Bac, Season, Harvest, Invest, Unite, InvestType } from '../types';
import { todayISO } from '../utils/format';

// ─── Legumes ──────────────────────────────────────────────────────────────────

export async function getLegumes(): Promise<Legume[]> {
  const rows = await db.select().from(legumes);
  return rows as Legume[];
}

export async function upsertLegume(data: Omit<Legume, 'maj'>): Promise<void> {
  await db.insert(legumes).values({ ...data, maj: todayISO() })
    .onConflictDoUpdate({ target: legumes.id, set: { ...data, maj: todayISO() } });
}

export async function deleteLegume(id: string): Promise<void> {
  await db.delete(season_legumes).where(eq(season_legumes.legume_id, id));
  await db.delete(bac_legumes).where(eq(bac_legumes.legume_id, id));
  await db.delete(legumes).where(eq(legumes.id, id));
}

// ─── Season legumes ───────────────────────────────────────────────────────────

export async function getSeasonLegumeIds(seasonId: number): Promise<string[]> {
  const rows = await db.select().from(season_legumes).where(eq(season_legumes.season_id, seasonId));
  return rows.map(r => r.legume_id);
}

export async function toggleSeasonLegume(seasonId: number, legumeId: string): Promise<void> {
  const existing = await db.select().from(season_legumes)
    .where(and(eq(season_legumes.season_id, seasonId), eq(season_legumes.legume_id, legumeId)));
  if (existing.length > 0) {
    await db.delete(season_legumes)
      .where(and(eq(season_legumes.season_id, seasonId), eq(season_legumes.legume_id, legumeId)));
  } else {
    await db.insert(season_legumes).values({ season_id: seasonId, legume_id: legumeId });
  }
}

// ─── Bacs ─────────────────────────────────────────────────────────────────────

export async function getBacs(): Promise<Bac[]> {
  const bacsData = await db.select().from(bacs);
  const contenuData = await db.select().from(bac_legumes);
  return bacsData.map(b => ({
    ...b,
    l: b.l ?? 0,
    L: b.L ?? 0,
    contenu: contenuData.filter(c => c.bac_id === b.id).map(c => c.legume_id),
  }));
}

export async function upsertBac(data: Bac): Promise<void> {
  await db.insert(bacs).values({ id: data.id, nom: data.nom, l: data.l, L: data.L })
    .onConflictDoUpdate({ target: bacs.id, set: { nom: data.nom, l: data.l, L: data.L } });
  await db.delete(bac_legumes).where(eq(bac_legumes.bac_id, data.id));
  for (const lid of data.contenu) {
    await db.insert(bac_legumes).values({ bac_id: data.id, legume_id: lid });
  }
}

export async function deleteBac(id: string): Promise<void> {
  await db.delete(bac_legumes).where(eq(bac_legumes.bac_id, id));
  await db.delete(bacs).where(eq(bacs.id, id));
}

// ─── Seasons ──────────────────────────────────────────────────────────────────

export async function getSeasons(): Promise<Season[]> {
  const rows = await db.select().from(seasons);
  return rows.map(r => ({ ...r, active: r.active ?? 0 })) as Season[];
}

export async function getActiveSeason(): Promise<Season | null> {
  const rows = await db.select().from(seasons).where(eq(seasons.active, 1));
  if (!rows[0]) return null;
  return { ...rows[0], active: rows[0].active ?? 0 } as Season;
}

export async function setActiveSeason(id: number): Promise<void> {
  await db.update(seasons).set({ active: 0 });
  await db.update(seasons).set({ active: 1 }).where(eq(seasons.id, id));
}

export async function createSeason(year: number): Promise<void> {
  await db.insert(seasons).values({ id: year, label: `Saison ${year}`, active: 0 });
}

// ─── Harvests ─────────────────────────────────────────────────────────────────

export async function getHarvests(seasonId: number): Promise<Harvest[]> {
  return db.select().from(harvests)
    .where(eq(harvests.season_id, seasonId))
    .orderBy(desc(harvests.date));
}

export async function upsertHarvest(data: Harvest): Promise<void> {
  await db.insert(harvests).values(data)
    .onConflictDoUpdate({ target: harvests.id, set: data });
}

export async function deleteHarvest(id: string): Promise<void> {
  await db.delete(harvests).where(eq(harvests.id, id));
}

// ─── Invest ───────────────────────────────────────────────────────────────────

export async function getInvest(): Promise<Invest[]> {
  const rows = await db.select().from(invest);
  return rows as unknown as Invest[];
}

export async function upsertInvest(data: Invest): Promise<void> {
  await db.insert(invest).values(data)
    .onConflictDoUpdate({ target: invest.id, set: data });
}

export async function deleteInvest(id: string): Promise<void> {
  await db.delete(invest).where(eq(invest.id, id));
}
