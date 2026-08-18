import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the existing SQLite database
const defaultDbPath = path.resolve(__dirname, '../database/database.sqlite');
const dbPath = process.env.DATABASE_PATH || defaultDbPath;

let db = null;

export async function initDb() {
  if (!db) {
    // If a custom DATABASE_PATH is provided and it doesn't exist yet,
    // copy the seeded SQLite template from the codebase to the persistent disk path.
    if (process.env.DATABASE_PATH && !fs.existsSync(dbPath)) {
      console.log(`Copying database template from ${defaultDbPath} to persistent storage at ${dbPath}...`);
      try {
        const dir = path.dirname(dbPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.copyFileSync(defaultDbPath, dbPath);
        console.log('✅ Seeded database successfully copied to persistent disk.');
      } catch (err) {
        console.error('❌ Failed to copy seeded database:', err);
      }
    }

    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    // Enable foreign key support
    await db.run('PRAGMA foreign_keys = ON;');
  }
  return db;
}

export async function query(sql, params = []) {
  const database = await initDb();
  return database.all(sql, params);
}

export async function queryOne(sql, params = []) {
  const database = await initDb();
  return database.get(sql, params);
}

export async function execute(sql, params = []) {
  const database = await initDb();
  return database.run(sql, params);
}
