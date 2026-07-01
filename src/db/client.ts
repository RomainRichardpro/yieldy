import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

// Opens (or creates) the SQLite database file on device.
const sqlite = SQLite.openDatabaseSync('glean.db');

// Drizzle instance — import this everywhere you need DB access.
export const db = drizzle(sqlite, { schema });
