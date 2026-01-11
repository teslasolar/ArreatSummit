const fs = require('fs');
const path = require('path');

module.exports = function() {
  const items = [];

  // Load runewords
  const rwManifest = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../../data/collections/runewords.json'), 'utf-8')
  );

  for (const entry of rwManifest.entries) {
    const entityPath = path.join(__dirname, '../../data', entry.path);
    const entity = JSON.parse(fs.readFileSync(entityPath, 'utf-8'));

    items.push({
      id: entity.meta.id,
      name: entity.data.name,
      type: 'runeword',
      stats: entity.data.stats.map(s => s.text).join(' '),
      notes: entity.data.notes || '',
      url: `/runewords/#${entity.meta.id}`
    });
  }

  // Load uniques
  const uqManifest = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../../data/collections/uniques.json'), 'utf-8')
  );

  for (const entry of uqManifest.entries) {
    const entityPath = path.join(__dirname, '../../data', entry.path);
    const entity = JSON.parse(fs.readFileSync(entityPath, 'utf-8'));

    items.push({
      id: entity.meta.id,
      name: entity.data.name,
      type: 'unique',
      stats: entity.data.stats.map(s => s.text).join(' '),
      notes: '',
      url: `/uniques/#${entity.meta.id}`
    });
  }

  return { items };
};
