import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMA_ROOT = resolve(__dirname, '../../../schemas');

export function loadSchema(schemaPath) {
  const fullPath = resolve(SCHEMA_ROOT, schemaPath);
  try {
    const content = readFileSync(fullPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to load schema ${schemaPath}: ${error.message}`);
  }
}

export function getSchemaRoot() {
  return SCHEMA_ROOT;
}
