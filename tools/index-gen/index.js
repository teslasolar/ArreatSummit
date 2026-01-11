#!/usr/bin/env node

import { readdirSync, readFileSync, writeFileSync, statSync, existsSync } from 'fs';
import { join, resolve, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');

const args = process.argv.slice(2);
const command = args[0];

/**
 * Recursively scan a directory and find all entity JSON files
 * @param {string} dir - Directory to scan
 * @param {string} rootDir - Root directory for relative path calculation
 * @returns {Array} Array of entity metadata
 */
function scanEntities(dir, rootDir) {
  const entities = [];
  
  if (!existsSync(dir)) {
    return entities;
  }

  const items = readdirSync(dir);
  
  for (const item of items) {
    const fullPath = join(dir, item);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      // Recurse into subdirectories
      entities.push(...scanEntities(fullPath, rootDir));
    } else if (item.endsWith('.json') && !item.endsWith('.patch.json')) {
      try {
        const content = JSON.parse(readFileSync(fullPath, 'utf-8'));
        
        // Check if it's an entity (has meta.type === 'ENTITY')
        if (content.meta && content.meta.type === 'ENTITY') {
          const relativePath = relative(rootDir, fullPath);
          
          entities.push({
            id: content.meta.id,
            udt: content.meta.udt,
            patch: content.meta.patch || 'base',
            path: relativePath,
            name: content.data.name,
            fullPath
          });
        }
      } catch (error) {
        console.warn(`  ⚠ Skipping invalid JSON: ${item}`);
      }
    }
  }

  return entities;
}

/**
 * Group entities by UDT type
 * @param {Array} entities - Array of entity metadata
 * @returns {Object} Entities grouped by UDT type
 */
function groupByUDT(entities) {
  const grouped = {};
  
  for (const entity of entities) {
    const udtLower = entity.udt.toLowerCase();
    if (!grouped[udtLower]) {
      grouped[udtLower] = [];
    }
    grouped[udtLower].push(entity);
  }

  return grouped;
}

/**
 * Generate collection manifest for a UDT type
 * @param {string} udtType - UDT type (e.g., 'runeword', 'unique')
 * @param {Array} entities - Entities of this type
 * @returns {Object} Manifest object
 */
function generateManifest(udtType, entities) {
  // Sort entities by id for consistency
  const sorted = entities.sort((a, b) => a.id.localeCompare(b.id));

  return {
    $schema: 'https://arreatsummit.com/schemas/composite/manifest.schema.json',
    meta: {
      type: 'MANIFEST',
      collection: udtType + 's',
      count: sorted.length,
      generated: new Date().toISOString().split('T')[0]
    },
    entries: sorted.map(e => ({
      id: e.id,
      patch: e.patch,
      path: e.path
    }))
  };
}

/**
 * Index a directory and generate/update manifests
 * @param {string} targetDir - Directory to index (relative to project root)
 * @param {boolean} dryRun - If true, only show what would be generated
 */
async function indexDirectory(targetDir, dryRun = false) {
  const dataRoot = join(PROJECT_ROOT, 'data');
  const fullTargetPath = join(PROJECT_ROOT, targetDir);
  
  console.log(`🔍 Scanning: ${targetDir}`);
  
  // Scan for entities
  const entities = scanEntities(fullTargetPath, dataRoot);
  console.log(`  Found ${entities.length} entities`);

  if (entities.length === 0) {
    console.log('  No entities found');
    return;
  }

  // Group by UDT
  const grouped = groupByUDT(entities);
  
  console.log('\n📊 Entity breakdown:');
  for (const [udt, items] of Object.entries(grouped)) {
    console.log(`  ${udt}: ${items.length} entities`);
  }

  // Generate manifests
  const collectionsDir = join(dataRoot, 'collections');
  
  console.log('\n📝 Generating manifests:');
  for (const [udt, items] of Object.entries(grouped)) {
    const manifest = generateManifest(udt, items);
    const manifestPath = join(collectionsDir, `${udt}s.json`);
    
    if (dryRun) {
      console.log(`  [DRY RUN] Would write: ${manifestPath}`);
      console.log(`    Entries: ${items.map(i => i.id).join(', ')}`);
    } else {
      writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
      console.log(`  ✓ ${manifestPath}`);
    }
  }

  if (!dryRun) {
    console.log('\n✅ Manifests generated successfully');
  }
}

/**
 * Show index stats for a directory
 * @param {string} targetDir - Directory to analyze
 */
async function showStats(targetDir) {
  const dataRoot = join(PROJECT_ROOT, 'data');
  const fullTargetPath = join(PROJECT_ROOT, targetDir);
  
  console.log(`📊 Index Statistics for: ${targetDir}\n`);
  
  const entities = scanEntities(fullTargetPath, dataRoot);
  const grouped = groupByUDT(entities);
  
  // By UDT type
  console.log('By Type:');
  for (const [udt, items] of Object.entries(grouped)) {
    console.log(`  ${udt.padEnd(15)} ${items.length.toString().padStart(3)} entities`);
  }
  
  // By patch
  const byPatch = {};
  for (const entity of entities) {
    if (!byPatch[entity.patch]) {
      byPatch[entity.patch] = 0;
    }
    byPatch[entity.patch]++;
  }
  
  console.log('\nBy Patch:');
  for (const [patch, count] of Object.entries(byPatch).sort()) {
    console.log(`  ${patch.padEnd(15)} ${count.toString().padStart(3)} entities`);
  }
  
  console.log(`\nTotal: ${entities.length} entities`);
}

async function main() {
  if (command === 'scan') {
    const targetDir = args[1] || 'data';
    const dryRun = args.includes('--dry-run');
    await indexDirectory(targetDir, dryRun);
  } else if (command === 'stats') {
    const targetDir = args[1] || 'data';
    await showStats(targetDir);
  } else {
    console.log(`
Index Generator - Auto-generate collection manifests

Usage:
  index-gen scan [directory] [--dry-run]
    Scan directory and generate/update collection manifests
    
  index-gen stats [directory]
    Show statistics about entities in directory

Examples:
  index-gen scan data
  index-gen scan data/patches/2.4
  index-gen scan data --dry-run
  index-gen stats data
    `);
    process.exit(1);
  }
}

main();
