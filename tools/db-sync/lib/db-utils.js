import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';

let SQL = null;

export async function initSQL() {
  if (!SQL) {
    SQL = await initSqlJs();
  }
  return SQL;
}

export async function openDatabase(dbPath, schemaPath = null) {
  const SQL = await initSQL();

  let db;
  if (existsSync(dbPath)) {
    const buffer = readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
    if (schemaPath && existsSync(schemaPath)) {
      const schema = readFileSync(schemaPath, 'utf-8');
      db.exec(schema);
    }
  }

  return db;
}

export function saveDatabase(db, dbPath) {
  const data = db.export();
  const buffer = Buffer.from(data);
  writeFileSync(dbPath, buffer);
}

export function closeDatabase(db) {
  db.close();
}
