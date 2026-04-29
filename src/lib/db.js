import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Database file path. In production (Docker), this should point to a mounted volume like /data/estimator.db
const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'estimator.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS pricing_config (
    key TEXT PRIMARY KEY,
    value INTEGER,
    category TEXT,
    label TEXT
  )
`);

const DEFAULT_PRICING = [
  // Bathroom Set Up
  { key: 'setup_bathtub', value: 3000, category: 'Bathroom Set Up', label: 'Bathtub' },
  { key: 'setup_walk_in_shower', value: 4500, category: 'Bathroom Set Up', label: 'Walk-in Shower' },
  { key: 'setup_convert_tub_to_shower', value: 5500, category: 'Bathroom Set Up', label: 'Convert Tub to Walk-in Shower' },
  { key: 'setup_tub_shower_combo', value: 4000, category: 'Bathroom Set Up', label: 'Tub & Walk-in Shower Combo' },

  // Shower Area Tiles
  { key: 'tiles_provide_yes', value: 1500, category: 'Shower Tiles', label: 'Yes, please provide the tiles' },
  { key: 'tiles_provide_no', value: 0, category: 'Shower Tiles', label: 'No, homeowner provides tiles' },

  // Shower Glass Door
  { key: 'glass_regular_frameless', value: 1200, category: 'Shower Door', label: 'Yes, regular frameless glass door' },
  { key: 'glass_none', value: 0, category: 'Shower Door', label: "No, don't need a shower glass door" },
  { key: 'glass_curtain', value: 0, category: 'Shower Door', label: 'No, will provide a shower curtain' },

  // Bathroom Floor
  { key: 'floor_new_tiles', value: 1000, category: 'Bathroom Floor', label: 'Yes, new tiles and baseboards' },
  { key: 'floor_keep_as_is', value: 0, category: 'Bathroom Floor', label: 'No, keep existing floor as is' },

  // Paint
  { key: 'paint_all', value: 600, category: 'Paint', label: 'Paint all walls and ceiling' },
  { key: 'paint_patch', value: 200, category: 'Paint', label: 'Patch and paint around shower area' },

  // Vanity/Sink/Countertop
  { key: 'vanity_single', value: 1800, category: 'Vanity', label: 'Yes, single sink vanity and countertop' },
  { key: 'vanity_double', value: 2500, category: 'Vanity', label: 'Yes, double sink vanity and countertop' },
  { key: 'vanity_own', value: 0, category: 'Vanity', label: 'No, will provide own full vanity' },
  { key: 'vanity_no_work', value: 0, category: 'Vanity', label: 'No work outside the shower area' },

  // Miscellaneous
  { key: 'misc_led_light_per_unit', value: 150, category: 'Miscellaneous', label: 'Cost per new LED light' },
  { key: 'misc_replace_exhaust_fan', value: 350, category: 'Miscellaneous', label: 'Replace exhaust fan' },
  { key: 'misc_new_exhaust_fan_vent', value: 650, category: 'Miscellaneous', label: 'Install new exhaust fan with vent outside' },
  { key: 'misc_raise_light_fixture', value: 250, category: 'Miscellaneous', label: 'Raise light fixture above vanity' },
  { key: 'misc_run_electrical_led_mirror', value: 300, category: 'Miscellaneous', label: 'Run electrical for an LED mirror' }
];

// Seed defaults if empty
const count = db.prepare('SELECT count(*) as count FROM pricing_config').get().count;
if (count === 0) {
  const insert = db.prepare('INSERT INTO pricing_config (key, value, category, label) VALUES (@key, @value, @category, @label)');
  const insertMany = db.transaction((items) => {
    for (const item of items) insert.run(item);
  });
  insertMany(DEFAULT_PRICING);
}

export function getAllPricing() {
  return db.prepare('SELECT * FROM pricing_config').all();
}

export function updatePricing(key, value) {
  const stmt = db.prepare('UPDATE pricing_config SET value = ? WHERE key = ?');
  stmt.run(value, key);
}

export function getPricingMap() {
  const rows = getAllPricing();
  return rows.reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});
}
