/**
 * Database module
 * 
 * For quick testing: Uses simple in-memory database
 * For production: Install better-sqlite3 and uncomment below
 */

// Production version (requires Visual Studio Build Tools on Windows):
/*
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = process.env.DATABASE_PATH || join(__dirname, '../../data/gitwork.db');

const dataDir = dirname(dbPath);
try {
  mkdirSync(dataDir, { recursive: true });
} catch (err) {}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

export default db;
*/

// Persistent SQLite database
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create data directory if it doesn't exist
import fs from 'fs';
const dataDir = join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = join(dataDir, 'gitwork.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

console.log(`📊 Database connected: ${dbPath}`);

export default db;

