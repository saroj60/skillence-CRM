import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the existing SQLite database
const dbPath = path.resolve(__dirname, '../database/database.sqlite');

let db = null;

export async function initDb() {
  if (!db) {
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
