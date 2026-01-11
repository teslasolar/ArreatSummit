import { readFileSync, existsSync } from 'fs';

export function checkCompleteness(manifestPath, dataRoot) {
  const errors = [];

  if (!existsSync(manifestPath)) {
    return [{
      type: 'missing_manifest',
      message: `Manifest not found: ${manifestPath}`
    }];
  }

  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));

    if (!manifest.entries || !Array.isArray(manifest.entries)) {
      errors.push({
        type: 'invalid_manifest',
        message: 'Manifest missing entries array'
      });
      return errors;
    }

    for (const entry of manifest.entries) {
      const entityPath = `${dataRoot}/${entry.path}`;
      if (!existsSync(entityPath)) {
        errors.push({
          type: 'missing_entity',
          id: entry.id,
          path: entry.path,
          message: `Entity file not found: ${entry.path}`
        });
      }
    }
  } catch (error) {
    errors.push({
      type: 'manifest_error',
      message: error.message
    });
  }

  return errors;
}
