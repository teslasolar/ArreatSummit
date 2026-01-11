#!/usr/bin/env node

import { readdirSync, readFileSync, statSync, existsSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { syncJsonToDb } from './lib/sync-json-to-db.js';
import { syncDbToJson } from './lib/sync-db-to-json.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');
const SCHEMA_PATH = join(__dirname, 'schema.sql');

const args = process.argv.slice(2);
const command = args[0];

async function syncAllToDb() {
  console.log('🔄 Syncing JSON → SQLite...');
  const dataRoot = join(PROJECT_ROOT, 'data');

  let synced = 0;
  let errors = 0;

  function scanAndSync(dir, dbPath = null) {
    if (!existsSync(dir)) return;

    const items = readdirSync(dir);
    const localDbPath = dbPath || join(dir, 'entities.db');

    for (const item of items) {
      const fullPath = join(dir, item);
      const stats = statSync(fullPath);

      if (stats.isDirectory()) {
        // Recurse with new DB path for subdirectory
        scanAndSync(fullPath, join(fullPath, 'entities.db'));
      } else if (item.endsWith('.json') && !item.endsWith('.patch.json')) {
        try {
          const result = syncJsonToDb(fullPath, localDbPath, SCHEMA_PATH);
          if (result.success) {
            console.log(`  ✓ ${item} → ${localDbPath}`);
            synced++;
          } else {
            console.error(`  ✗ ${item}: ${result.error}`);
            errors++;
          }
        } catch (error) {
          console.error(`  ✗ ${item}: ${error.message}`);
          errors++;
        }
      }
    }
  }

  scanAndSync(dataRoot);

  console.log(`\nSynced: ${synced} | Errors: ${errors}`);
  return errors === 0;
}

async function main() {
  if (command === 'sync') {
    const direction = args[1];

    if (direction === 'to-db' || !direction) {
      const success = await syncAllToDb();
      process.exit(success ? 0 : 1);
    } else {
      console.log('Usage: db-sync sync [to-db]');
      process.exit(1);
    }
  } else {
    console.log('Usage: db-sync sync [to-db]');
    process.exit(1);
  }
}

main();
