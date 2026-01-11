#!/usr/bin/env node

import { readdirSync, readFileSync, statSync, existsSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { validateSchema, formatErrors } from './lib/validate-schema.js';
import { buildEntityIndex, validateReferences } from './lib/validate-refs.js';
import { checkCompleteness } from './lib/check-complete.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');

const args = process.argv.slice(2);
const command = args[0];
const flags = args.slice(1);

async function validateSchemas() {
  console.log('🔍 Validating schemas...');
  const schemaRoot = join(PROJECT_ROOT, 'schemas');
  let hasErrors = false;

  function scanSchemas(dir, basePath = '') {
    const items = readdirSync(dir);
    for (const item of items) {
      const fullPath = join(dir, item);
      const relativePath = join(basePath, item);
      const stats = statSync(fullPath);

      if (stats.isDirectory()) {
        scanSchemas(fullPath, relativePath);
      } else if (item.endsWith('.schema.json')) {
        try {
          JSON.parse(readFileSync(fullPath, 'utf-8'));
          console.log(`  ✓ ${relativePath}`);
        } catch (error) {
          console.error(`  ✗ ${relativePath}: ${error.message}`);
          hasErrors = true;
        }
      }
    }
  }

  scanSchemas(schemaRoot);
  return !hasErrors;
}

async function validateData() {
  console.log('📋 Validating data entities...');
  const dataRoot = join(PROJECT_ROOT, 'data');
  let hasErrors = false;

  function scanData(dir, basePath = '') {
    if (!existsSync(dir)) {
      return;
    }

    const items = readdirSync(dir);
    for (const item of items) {
      const fullPath = join(dir, item);
      const relativePath = join(basePath, item);
      const stats = statSync(fullPath);

      if (stats.isDirectory()) {
        scanData(fullPath, relativePath);
      } else if (item.endsWith('.json') && !item.endsWith('.patch.json')) {
        try {
          const content = JSON.parse(readFileSync(fullPath, 'utf-8'));

          if (content.$schema) {
            const schemaPath = content.$schema.replace('https://arreatsummit.com/schemas/', '');
            const result = validateSchema(content, schemaPath);

            if (!result.valid) {
              console.error(`  ✗ ${relativePath}:`);
              console.error(formatErrors(result.errors));
              hasErrors = true;
            } else {
              console.log(`  ✓ ${relativePath}`);
            }
          }
        } catch (error) {
          console.error(`  ✗ ${relativePath}: ${error.message}`);
          hasErrors = true;
        }
      }
    }
  }

  scanData(dataRoot);
  return !hasErrors;
}

async function main() {
  if (command === 'validate') {
    let success = true;

    if (flags.includes('--schemas-only') || flags.includes('--all')) {
      success = await validateSchemas() && success;
    }

    if (flags.includes('--data-only') || flags.includes('--all')) {
      success = await validateData() && success;
    }

    if (!flags.length || flags.includes('--all')) {
      success = await validateSchemas() && success;
    }

    process.exit(success ? 0 : 1);
  } else {
    console.log('Usage: alpha-parse validate [--schemas-only|--data-only|--all]');
    process.exit(1);
  }
}

main();
