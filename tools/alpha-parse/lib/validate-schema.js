import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { loadSchema, getSchemaRoot } from './load-schema.js';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

const ajv = new Ajv({
  allErrors: true,
  verbose: true,
  strict: false
});
addFormats(ajv);

// Pre-load all schemas into AJV
function loadAllSchemas() {
  const schemaRoot = getSchemaRoot();

  function scan(dir) {
    const items = readdirSync(dir);
    for (const item of items) {
      const fullPath = join(dir, item);
      const stats = statSync(fullPath);

      if (stats.isDirectory()) {
        scan(fullPath);
      } else if (item.endsWith('.schema.json')) {
        try {
          const relativePath = fullPath.replace(schemaRoot + '/', '');
          const schema = loadSchema(relativePath);
          // Only add if not already present
          if (!ajv.getSchema(schema.$id)) {
            ajv.addSchema(schema);
          }
        } catch (error) {
          // Skip invalid schemas
        }
      }
    }
  }

  scan(schemaRoot);
}

// Load schemas once on module load
loadAllSchemas();

export function validateSchema(data, schemaPath) {
  try {
    const schema = loadSchema(schemaPath);
    // Check if we already have a validator for this schema
    let validate = ajv.getSchema(schema.$id);
    if (!validate) {
      validate = ajv.compile(schema);
    }

    const valid = validate(data);

    if (!valid) {
      return {
        valid: false,
        errors: validate.errors
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      errors: [{ message: error.message }]
    };
  }
}

export function formatErrors(errors) {
  return errors.map(err => {
    const path = err.instancePath || '/';
    return `  ${path}: ${err.message}`;
  }).join('\n');
}
