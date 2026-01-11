import Database from 'better-sqlite3';
import { writeFileSync } from 'fs';

export function syncDbToJson(dbPath, entityId, outputPath) {
  const db = new Database(dbPath, { readonly: true });

  try {
    // Get entity
    const entity = db.prepare('SELECT * FROM entities WHERE id = ?').get(entityId);

    if (!entity) {
      return { success: false, error: 'Entity not found' };
    }

    // Get stats
    const stats = db.prepare('SELECT * FROM stats WHERE entity_id = ?').all(entityId);

    // Get requirements
    const req = db.prepare('SELECT * FROM requirements WHERE entity_id = ?').get(entityId);

    // Parse base data
    const data = JSON.parse(entity.data_json);

    // Add stats
    if (stats.length > 0) {
      data.stats = stats.map(s => ({
        text: s.text,
        type: s.type,
        stat: s.stat,
        value: s.value_varies
          ? { min: s.value_min, max: s.value_max, varies: true }
          : s.value_min,
        condition: s.condition
      }));
    }

    // Add requirements
    if (req) {
      data.req = {};
      if (req.level) data.req.level = req.level;
      if (req.str) data.req.str = req.str;
      if (req.dex) data.req.dex = req.dex;
      if (req.class) data.req.class = req.class;
    }

    // Build full entity
    const fullEntity = {
      $schema: `https://arreatsummit.com/schemas/composite/${entity.udt.toLowerCase()}-full.schema.json`,
      meta: {
        type: 'ENTITY',
        udt: entity.udt,
        id: entity.id,
        patch: entity.patch,
        created: entity.created,
        updated: entity.updated
      },
      data
    };

    // Write to file
    writeFileSync(outputPath, JSON.stringify(fullEntity, null, 2));

    return { success: true, path: outputPath };
  } catch (error) {
    return { success: false, error: error.message };
  } finally {
    db.close();
  }
}
