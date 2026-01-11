const fs = require('fs');
const path = require('path');

module.exports = function() {
  const manifestPath = path.join(__dirname, '../../data/collections/runewords.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

  const runewords = [];

  for (const entry of manifest.entries) {
    const entityPath = path.join(__dirname, '../../data', entry.path);
    const entity = JSON.parse(fs.readFileSync(entityPath, 'utf-8'));

    runewords.push({
      ...entity.data,
      _meta: entity.meta,
      _id: entity.meta.id
    });
  }

  return runewords.sort((a, b) => a.name.localeCompare(b.name));
};
