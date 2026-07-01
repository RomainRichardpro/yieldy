import { db } from './client';
import { seasons } from './schema';
import { eq } from 'drizzle-orm';

// Called once after migrations run.
// Creates the current season if no season exists yet.
export async function initDatabase() {
  const existing = await db.select().from(seasons);

  if (existing.length === 0) {
    const currentYear = new Date().getFullYear();
    await db.insert(seasons).values({
      id:     currentYear,
      label:  `Saison ${currentYear}`,
      active: 1,
    });
  }
}
