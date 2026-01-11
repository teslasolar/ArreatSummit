# D2R Summit v2.0.0

**Self-Defining D2R Database** with UDT (User Defined Types) architecture

Built for GitHub Pages using 11ty, Tailwind, Alpine, and Lunr.

## What We've Built (Phases 1-3 Complete)

### Architecture Foundation

A **schema-first validation system** where all data must pass validation before build:

```
Data Files → α:parse validation → Schema check → Ref check → 11ty build → Static site
```

### Current Status

✅ **Phase 1: Foundation** (9 files)
- Project setup with npm dependencies
- Meta schemas (Layer 0): STD, UDT, ENTITY, PATCH, TEMPLATE
- α:parse validation tool with schema and data validation

✅ **Phase 2: Base UDTs** (4 files)
- Layer 1 schemas: ID, Range, Req, Stat
- Foundational types used by all other layers

✅ **Phase 3: Item UDTs** (19 files)
- Layer 2 schemas: BaseItem, Rune, Runeword, Unique
- Composite schemas: Full entity schemas with metadata
- Sample data: Spirit, Insight (runewords), Shako (unique)
- Collection manifests for runewords and uniques

**Total: 32 files created**

### Validation Results

All schemas and data entities validate successfully:

```bash
$ node tools/alpha-parse/index.js validate --all

🔍 Validating schemas...
  ✓ 16 schemas validated

📋 Validating data entities...
  ✓ 5 entities validated
```

## Directory Structure

```
/workspaces/ArreatSummit/
├── schemas/                    # Schema domain
│   ├── meta/                   # Layer 0: Core definitions
│   ├── udt/
│   │   ├── layer1/             # Base types
│   │   └── layer2/             # Item types
│   └── composite/              # Full entity schemas
│
├── data/                       # Data domain
│   ├── patches/2.4/
│   │   ├── runewords/          # Spirit, Insight
│   │   └── uniques/            # Shako
│   └── collections/            # Manifests
│
├── tools/alpha-parse/          # Validation agent
│   ├── lib/                    # Validation logic
│   └── index.js                # CLI interface
│
├── package.json
└── .gitignore
```

## Key Features

### Self-Defining UDT System

Each data file is self-contained with metadata:

```json
{
  "$schema": "https://arreatsummit.com/schemas/composite/runeword-full.schema.json",
  "meta": {
    "type": "ENTITY",
    "udt": "Runeword",
    "id": "spirit",
    "patch": "2.4"
  },
  "data": {
    "name": "Spirit",
    "runes": ["Tal", "Thul", "Ort", "Amn"],
    "stats": [...]
  }
}
```

### Modular Architecture

All files kept under 250 tokens:
- Average schema size: ~150 tokens
- Average data entity: ~200 tokens
- Average validation module: ~180 tokens

### Layered Type System

- **Layer 0**: Meta (how D2R data is defined)
- **Layer 1**: Base types (ID, Range, Req, Stat)
- **Layer 2**: Item types (Runeword, Unique, Rune, etc.)
- **Layer 3-7**: Skills, Builds, Areas, Cube, Ladder (future)

## Usage

### Install Dependencies

```bash
npm install
cd tools/alpha-parse && npm install && cd ../..
```

### Validate Schemas

```bash
node tools/alpha-parse/index.js validate --schemas-only
```

### Validate Data

```bash
node tools/alpha-parse/index.js validate --data-only
```

### Validate Everything

```bash
node tools/alpha-parse/index.js validate --all
```

### Auto-Generate Collection Manifests

```bash
# Generate manifests for all entities
npm run index

# Show statistics
npm run index:stats

# Dry run (preview changes)
npm run index:dry

# Parameterize to specific directory
node tools/index-gen/index.js scan data/patches/2.4
node tools/index-gen/index.js stats data/patches/2.4
```

## GitHub Pages Deployment 🚀

The site is configured to auto-deploy to GitHub Pages on every push to `main`.

### Build & Preview

```bash
# Build the site
npm run build

# Preview locally
npm run dev
# Visit http://localhost:8080
```

### Automatic Deployment

1. Push code to `main` branch
2. GitHub Actions validates all data
3. Builds static site with 11ty
4. Deploys to GitHub Pages automatically

**Live Site**: https://teslasolar.github.io/ArreatSummit

## Next Steps

Remaining enhancements:

- **Phase 4**: Validation enhancement (cross-refs, completeness checking)
- **Phase 6**: Search functionality (Lunr integration)
- **Phase 7**: Build guides database
- **Data expansion**: Add more runewords, uniques, sets, gems, etc.

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Schema | JSON Schema | Draft-07 |
| Validation | AJV | ^8.12.0 |
| Build | 11ty | ^2.0.1 |
| Styling | Tailwind CSS | ^3.4.0 |
| Interactivity | Alpine.js | ^3.13.3 |
| Search | Lunr.js | ^2.3.9 |

## Sample Data

### Runewords
- [Spirit](data/patches/2.4/runewords/spirit.json) - Popular caster runeword
- [Insight](data/patches/2.4/runewords/insight.json) - Mercenary mana regen runeword

### Uniques
- [Shako](data/patches/2.4/uniques/shako.json) - Harlequin Crest helm

## Contributing

All data must validate against schemas before being accepted. Run validation before submitting PRs:

```bash
node tools/alpha-parse/index.js validate --all
```

---

**Stay awhile and listen!** 🗡️
