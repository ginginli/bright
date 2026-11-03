#!/usr/bin/env node
/**
 * Batch-update "Other Stands" column in each Stand detail page footer.
 * Handles both original and previously-broken states.
 */

const fs = require('fs');
const path = require('path');

const STANDS_DIR = path.join(__dirname, '..', 'stands');

const STAND_DATA = {
  'the-world':        { name: 'The World', rarity: 'Rare',    type: 'Humanoid',     tags: ['time-stop', 'combat'] },
  'king-crimson':     { name: 'King Crimson', rarity: 'Rare', type: 'Humanoid',     tags: ['time-rewind', 'combat'] },
  'star-platinum':    { name: 'Star Platinum', rarity: 'Rare', type: 'Humanoid',   tags: ['time-stop', 'combat', 'evolves'] },
  'twau':             { name: 'TWAU', rarity: 'Rare',          type: 'Humanoid',     tags: ['time-stop', 'combat'] },
  'mandom':           { name: 'Mandom', rarity: 'Rare',       type: 'Non-Humanoid', tags: ['time-rewind', 'utility'] },
  'whitesnake':       { name: 'Whitesnake', rarity: 'Rare',   type: 'Humanoid',     tags: ['utility', 'pilot'] },
  'star-platinum-the-world': { name: 'Star Platinum | The World', rarity: 'Default', type: 'Humanoid', tags: ['time-stop', 'combat', 'evolved'] },
  'd4c':              { name: 'D4C', rarity: 'Default',        type: 'Humanoid',     tags: ['dimension', 'combat'] },
  'killer-queen':     { name: 'Killer Queen', rarity: 'Default', type: 'Humanoid',   tags: ['bombs', 'combat'] },
  'gold-experience':  { name: 'Gold Experience', rarity: 'Default', type: 'Humanoid', tags: ['healing', 'combat'] },
  'crazy-diamond':    { name: 'Crazy Diamond', rarity: 'Default', type: 'Humanoid', tags: ['healing', 'combat'] },
  'stone-free':       { name: 'Stone Free', rarity: 'Default', type: 'Humanoid',     tags: ['combat'] },
  'tusk-acts':        { name: 'Tusk Acts 1-3', rarity: 'Default', type: 'Humanoid', tags: ['special-acquire', 'combat'] },
  'hierophant-green': { name: 'Hierophant Green', rarity: 'Default', type: 'Humanoid', tags: ['projectile', 'pilot', 'combat'] },
  'silver-chariot':   { name: 'Silver Chariot', rarity: 'Default', type: 'Humanoid', tags: ['combat', 'speed'] },
  'magicians-red':    { name: 'Magicians Red', rarity: 'Default', type: 'Humanoid', tags: ['fire', 'combat'] },
  'purple-haze':      { name: 'Purple Haze', rarity: 'Default', type: 'Humanoid',     tags: ['poison', 'pilot', 'combat'] },
  'gold-experience-requiem': { name: 'Gold Experience Requiem', rarity: 'Unobtainable', type: 'Humanoid', tags: [] },
  'hermit-purple':    { name: 'Hermit Purple', rarity: 'Default', type: 'Non-Humanoid', tags: ['mobility', 'utility'] },
  'tubular-bells':    { name: 'Tubular Bells', rarity: 'Default', type: 'Non-Humanoid', tags: ['balloons', 'utility'] },
  'hey-ya':           { name: 'Hey Ya', rarity: 'Default',     type: 'Non-Humanoid', tags: ['buffs', 'utility'] },
  '20th-century-boy': { name: '20th Century Boy', rarity: 'Default', type: 'Non-Humanoid', tags: ['defense', 'utility'] },
};

const ALL_SLUGS = Object.keys(STAND_DATA);

function findSimilarStands(slug, count = 4) {
  const t = STAND_DATA[slug];
  if (!t) return [];

  // Special evolve pairs first
  if (slug === 'star-platinum') return ['star-platinum-the-world', 'the-world', 'twau', 'king-crimson'];
  if (slug === 'star-platinum-the-world') return ['star-platinum', 'the-world', 'twau', 'king-crimson'];

  // Rare time-manipulating Humanoids (5)
  const rareCombat = ['the-world', 'king-crimson', 'star-platinum', 'twau', 'whitesnake'];
  if (rareCombat.includes(slug)) {
    return rareCombat.filter(s => s !== slug).slice(0, count);
  }

  // Rare Non-Humanoid (1): Mandom → rare time-manips + non-humanoids
  if (slug === 'mandom') return ['the-world', 'king-crimson', 'hermit-purple', 'tubular-bells'];

  // Default Non-Humanoid Utility (4)
  const nonHuman = ['hermit-purple', 'tubular-bells', 'hey-ya', '20th-century-boy'];
  if (nonHuman.includes(slug)) {
    const base = nonHuman.filter(s => s !== slug);
    return [...base, 'gold-experience'].slice(0, count);
  }

  // Default Humanoid Combat (10) — recommend other Humanoid combat Stands
  const humanCombat = ['d4c', 'killer-queen', 'gold-experience', 'crazy-diamond', 'stone-free', 
                       'tusk-acts', 'hierophant-green', 'silver-chariot', 'magicians-red', 'purple-haze'];
  if (humanCombat.includes(slug)) {
    return humanCombat.filter(s => s !== slug).slice(0, count);
  }

  return ALL_SLUGS.filter(s => s !== slug).slice(0, count);
}

function updateStandFile(slug) {
  const filePath = path.join(STANDS_DIR, slug, 'index.html');
  if (!fs.existsSync(filePath)) return false;

  let content = fs.readFileSync(filePath, 'utf8');

  // Match: anything from <h4>Other Stands</h4> up to (but not including) the next </div> that closes the column
  // We'll replace the whole "Other Stands" column block
  const colPattern = /\s*<h4>Other Stands<\/h4>\s*[\s\S]*?(?=\s*<\/div>\s*\n\s*<div class="footer-col">)/m;

  const newLinks = findSimilarStands(slug, 4)
    .map(s => `                <a href="/stands/${s}/">${STAND_DATA[s].name}</a>`)
    .join('\n');
  const replacement = `                <h4>Other Stands</h4>\n${newLinks}`;

  if (!colPattern.test(content)) {
    console.log(`SKIP ${slug}: pattern not found`);
    return false;
  }

  content = content.replace(colPattern, replacement);

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`OK   ${slug.padEnd(25)} → ${findSimilarStands(slug).map(s => STAND_DATA[s].name).join(', ')}`);
  return true;
}

// Main
console.log('\n=== Updating "Other Stands" columns (similarity-based) ===\n');

let success = 0, skipped = 0;
for (const slug of ALL_SLUGS) {
  if (updateStandFile(slug)) success++;
  else skipped++;
}

console.log(`\nDone: ${success} updated, ${skipped} skipped.\n`);
