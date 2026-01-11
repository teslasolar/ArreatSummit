const fs = require('fs');
const path = require('path');

module.exports = function() {
  const manifestPath = path.join(__dirname, '../../data/collections/uniques.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

  const uniques = [];

  for (const entry of manifest.entries) {
    const entityPath = path.join(__dirname, '../../data', entry.path);
    const entity = JSON.parse(fs.readFileSync(entityPath, 'utf-8'));

    uniques.push({
      ...entity.data,
      _meta: entity.meta,
      _id: entity.meta.id
    });
  }

  return uniques.sort((a, b) => a.name.localeCompare(b.name));
};
