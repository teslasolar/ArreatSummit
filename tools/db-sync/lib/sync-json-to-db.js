import Database from 'better-sqlite3';
import { readFileSync, existsSync } from 'fs';

export function syncJsonToDb(jsonPath, dbPath, schemaPath) {
  // Read JSON entity
  const entity = JSON.parse(readFileSync(jsonPath, 'utf-8'));

  // Open/create database
  const db = new Database(dbPath);

  // Initialize schema if needed
  if (schemaPath && existsSync(schemaPath)) {
    const schema = readFileSync(schemaPath, 'utf-8');
    db.exec(schema);
  }

  try {
    db.prepare('BEGIN TRANSACTION').run();

    // Insert into entities table
    const insertEntity = db.prepare(`
      INSERT OR REPLACE INTO entities (id, udt, patch, created, updated, data_json)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertEntity.run(
      entity.meta.id,
      entity.meta.udt,
      entity.meta.patch || null,
      entity.meta.created || null,
      entity.meta.updated || null,
      JSON.stringify(entity.data)
    );

    // Handle type-specific tables
    if (entity.meta.udt === 'Runeword') {
      syncRuneword(db, entity);
    } else if (entity.meta.udt === 'Unique') {
      syncUnique(db, entity);
    }

    // Sync stats
    syncStats(db, entity);

    // Sync requirements
    if (entity.data.req) {
      syncRequirements(db, entity);
    }

    db.prepare('COMMIT').run();
    return { success: true, id: entity.meta.id };
  } catch (error) {
    db.prepare('ROLLBACK').run();
    return { success: false, error: error.message };
  } finally {
    db.close();
  }
}

function syncRuneword(db, entity) {
  const { id } = entity.meta;
  const { name, slug, runes, sockets, types, req, ladder, notes } = entity.data;

  const insert = db.prepare(`
    INSERT OR REPLACE INTO runewords
    (id, name, slug, runes, sockets, types, req_level, ladder, patch, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insert.run(
    id,
    name,
    slug,
    JSON.stringify(runes),
    sockets,
    JSON.stringify(types),
    req?.level || null,
    ladder ? 1 : 0,
    entity.meta.patch,
    notes || null
  );
}

function syncUnique(db, entity) {
  const { id } = entity.meta;
  const { name, slug, base, tc, qlvl, req } = entity.data;

  const insert = db.prepare(`
    INSERT OR REPLACE INTO uniques
    (id, name, slug, base, tc, qlvl, req_level, req_str, patch)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insert.run(
    id,
    name,
    slug,
    base,
    tc || null,
    qlvl || null,
    req?.level || null,
    req?.str || null,
    entity.meta.patch
  );
}

function syncStats(db, entity) {
  if (!entity.data.stats) return;

  // Clear existing stats
  db.prepare('DELETE FROM stats WHERE entity_id = ?').run(entity.meta.id);

  const insert = db.prepare(`
    INSERT INTO stats
    (entity_id, text, type, stat, value_min, value_max, value_varies, condition)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const stat of entity.data.stats) {
    const value = stat.value;
    const isRange = typeof value === 'object' && value.min !== undefined;

    insert.run(
      entity.meta.id,
      stat.text,
      stat.type,
      stat.stat,
      isRange ? value.min : value,
      isRange ? value.max : value,
      isRange ? (value.varies ? 1 : 0) : 0,
      stat.condition || null
    );
  }
}

function syncRequirements(db, entity) {
  const { req } = entity.data;

  const insert = db.prepare(`
    INSERT OR REPLACE INTO requirements
    (entity_id, level, str, dex, class)
    VALUES (?, ?, ?, ?, ?)
  `);

  insert.run(
    entity.meta.id,
    req.level || null,
    req.str || null,
    req.dex || null,
    req.class || null
  );
}
