import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

export function buildEntityIndex(dataRoot) {
  const entities = new Map();

  function scanDirectory(dir) {
    const items = readdirSync(dir);
    for (const item of items) {
      const fullPath = join(dir, item);
      const stats = statSync(fullPath);

      if (stats.isDirectory()) {
        scanDirectory(fullPath);
      } else if (item.endsWith('.json') && !item.endsWith('.patch.json')) {
        try {
          const content = JSON.parse(readFileSync(fullPath, 'utf-8'));
          if (content.meta && content.meta.id) {
            entities.set(content.meta.id, {
              type: content.meta.udt,
              path: fullPath,
              data: content.data
            });
          }
        } catch (error) {
          // Skip invalid JSON
        }
      }
    }
  }

  scanDirectory(dataRoot);
  return entities;
}

export function validateReferences(entity, entityIndex) {
  const errors = [];
  // Add specific validation logic based on entity type
  return errors;
}
