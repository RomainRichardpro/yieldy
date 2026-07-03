import { db } from './client';
import { seasons, legumes } from './schema';
import { seedDatabase } from './seed';

// Called once after migrations run.
// Creates the current season if no season exists yet, then seeds dev data if empty.
export async function initDatabase() {
  const existing = await db.select().from(seasons);

  let seasonId: number;
  if (existing.length === 0) {
    const currentYear = new Date().getFullYear();
    await db.insert(seasons).values({
      id:     currentYear,
      label:  `Saison ${currentYear}`,
      active: 1,
    });
    seasonId = currentYear;
  } else {
    seasonId = existing.find(s => s.active === 1)?.id ?? existing[0].id;
  }

  // Seed only if the catalogue is empty (fresh install / simulator reset)
  const existingLegumes = await db.select().from(legumes);
  if (existingLegumes.length === 0) {
    await seedDatabase(seasonId);
  }
}
