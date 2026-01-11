-- D2R Summit SQLite Schema
-- Each directory stores its entities in a local .db file

-- Meta table: tracks what UDT types are stored
CREATE TABLE IF NOT EXISTS _meta (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  udt_type TEXT NOT NULL,
  entity_count INTEGER DEFAULT 0,
  last_sync TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Generic entity table (stores all entities with JSON blob)
CREATE TABLE IF NOT EXISTS entities (
  id TEXT PRIMARY KEY,
  udt TEXT NOT NULL,
  patch TEXT,
  created TEXT,
  updated TEXT,
  data_json TEXT NOT NULL,
  UNIQUE(id)
);

-- Stats table (normalized stats from entities)
CREATE TABLE IF NOT EXISTS stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_id TEXT NOT NULL,
  text TEXT,
  type TEXT,
  stat TEXT,
  value_min REAL,
  value_max REAL,
  value_varies INTEGER,
  condition TEXT,
  FOREIGN KEY(entity_id) REFERENCES entities(id) ON DELETE CASCADE
);

-- Requirements table
CREATE TABLE IF NOT EXISTS requirements (
  entity_id TEXT PRIMARY KEY,
  level INTEGER,
  str INTEGER,
  dex INTEGER,
  class TEXT,
  FOREIGN KEY(entity_id) REFERENCES entities(id) ON DELETE CASCADE
);

-- Runewords table (denormalized for fast queries)
CREATE TABLE IF NOT EXISTS runewords (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  runes TEXT NOT NULL,
  sockets INTEGER NOT NULL,
  types TEXT NOT NULL,
  req_level INTEGER,
  ladder INTEGER DEFAULT 0,
  patch TEXT,
  notes TEXT,
  FOREIGN KEY(id) REFERENCES entities(id) ON DELETE CASCADE
);

-- Uniques table
CREATE TABLE IF NOT EXISTS uniques (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  base TEXT NOT NULL,
  tc INTEGER,
  qlvl INTEGER,
  req_level INTEGER,
  req_str INTEGER,
  patch TEXT,
  FOREIGN KEY(id) REFERENCES entities(id) ON DELETE CASCADE
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_entities_udt ON entities(udt);
CREATE INDEX IF NOT EXISTS idx_entities_patch ON entities(patch);
CREATE INDEX IF NOT EXISTS idx_stats_entity ON stats(entity_id);
CREATE INDEX IF NOT EXISTS idx_stats_type ON stats(type);
CREATE INDEX IF NOT EXISTS idx_runewords_patch ON runewords(patch);
CREATE INDEX IF NOT EXISTS idx_uniques_patch ON uniques(patch);
