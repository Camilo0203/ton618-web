// Simple key-comparison audit for en.ts vs es.ts
// Uses regex instead of eval/import to avoid TS parsing issues

import { readFileSync, readdirSync } from 'fs';
import { join, extname } from 'path';

// Extract quoted keys from the locale source via regex
// This finds every `key: ` or `'key':` pattern and builds a flat list
function extractKeysFromSource(src) {
  const keys = new Set();
  // Match any key pattern: identifier or quoted string followed by colon
  // We'll do a simple depth-tracking scan
  const lines = src.split('\n');
  const keyStack = []; // tracks current nesting path
  let depth = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    // Detect closing braces — pop stack
    const closes = (trimmed.match(/}/g) || []).length;
    const opens = (trimmed.match(/{/g) || []).length;

    // Try to extract a key from this line
    // Match: `someKey:` or `'some.key':` or `"someKey":` at the start
    const keyMatch = trimmed.match(/^(?:'([^']+)'|"([^"]+)"|([a-zA-Z_$][a-zA-Z0-9_$]*))\s*:/);
    if (keyMatch) {
      const key = keyMatch[1] || keyMatch[2] || keyMatch[3];
      // Determine if value is an object (has { on same line without closing string/array value)
      const isObject = trimmed.includes('{') && !trimmed.match(/:\s*['"`\[]/);
      const isSingleLineObj = isObject && trimmed.includes('}');

      if (isObject && !isSingleLineObj) {
        // Opening an object — push this key
        keyStack.push(key);
      } else {
        // Leaf value — record the full dotted path
        const fullKey = [...keyStack, key].join('.');
        keys.add(fullKey);
      }
    }

    // Adjust depth and pop stack on net closes
    if (closes > opens && keyStack.length > 0) {
      const net = closes - opens;
      for (let i = 0; i < net; i++) {
        keyStack.pop();
      }
    }
  }

  return keys;
}

// ── Collect all .tsx / .ts source files ───────────────────────────────────────
function getAllFiles(dir, exts = ['.tsx', '.ts']) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', 'dist', '.git'].includes(entry.name)) continue;
      results.push(...getAllFiles(full, exts));
    } else if (entry.isFile() && exts.includes(extname(entry.name))) {
      results.push(full);
    }
  }
  return results;
}

// ── Load and parse ─────────────────────────────────────────────────────────────
const enSrc = readFileSync('./src/locales/en.ts', 'utf8');
const esSrc = readFileSync('./src/locales/es.ts', 'utf8');

// For a more reliable count, count unique `t('key')` call patterns in all source files
const srcFiles = getAllFiles('./src').filter(f => !f.includes('\\locales\\'));

const usedKeysInCode = new Set();
const tCallRe = /\bt\(\s*['"`]([^'"`]+)['"`]/g;

let hardcodedCandidates = [];
const jsxTextRe = />\s*([A-Z][a-zA-Z\s,.'!?\-:]{9,})\s*</g;

for (const file of srcFiles) {
  const rel = file.replace(process.cwd(), '').replace(/\\/g, '/');
  if (['/config/', '/lib/', '/utils/', '.test.', '__tests__'].some(p => rel.includes(p))) continue;

  const content = readFileSync(file, 'utf8');

  // Collect used t() keys
  let m;
  tCallRe.lastIndex = 0;
  while ((m = tCallRe.exec(content)) !== null) {
    // Strip any interpolation suffix like .title
    usedKeysInCode.add(m[1]);
  }

  // Check for hardcoded JSX strings
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('import ')) return;
    if (line.includes("t('") || line.includes('t("') || line.includes('t(`')) return;
    if (trimmed.startsWith('type ') || trimmed.startsWith('interface ')) return;

    jsxTextRe.lastIndex = 0;
    let match;
    while ((match = jsxTextRe.exec(line)) !== null) {
      const text = match[1].trim();
      if (text.length < 10) continue;
      if (text.startsWith('http') || text.startsWith('mailto')) continue;
      // Skip obvious code patterns
      if (/^[\w.]+\s*\(/.test(text)) continue;
      hardcodedCandidates.push({ file: rel, line: i + 1, text: text.slice(0, 80) });
    }
  });
}

// ── Line counts as proxy for key counts ───────────────────────────────────────
const enLines = enSrc.split('\n').length;
const esLines = esSrc.split('\n').length;
const diff = enLines - esLines;

console.log(`\n📊 Locale file sizes`);
console.log(`   en.ts : ${enLines} lines`);
console.log(`   es.ts : ${esLines} lines`);
console.log(`   Delta : ${diff > 0 ? '+' : ''}${diff} lines ${diff > 50 ? '⚠️  (significant gap)' : diff > 10 ? '⚠️  (minor gap)' : '✅'}`);
console.log(`\n📌 Unique t() keys used in source code: ${usedKeysInCode.size}`);

// ── Check used keys against EN locale ─────────────────────────────────────────
// Simple presence check — does each used key appear textually in en.ts?
const missingFromEn = [];
const missingFromEs = [];

for (const key of usedKeysInCode) {
  const keyEnd = key.split('.').pop();
  if (!enSrc.includes(`'${keyEnd}'`) && !enSrc.includes(`${keyEnd}:`)) {
    missingFromEn.push(key);
  }
  if (!esSrc.includes(`'${keyEnd}'`) && !esSrc.includes(`${keyEnd}:`)) {
    missingFromEs.push(key);
  }
}

// ── Structural diff: find top-level sections only ─────────────────────────────
const enTopLevel = [...enSrc.matchAll(/^\s{4}([a-zA-Z_$][a-zA-Z0-9_$]*):\s*\{/gm)].map(m => m[1]);
const esTopLevel = [...esSrc.matchAll(/^\s{4}([a-zA-Z_$][a-zA-Z0-9_$]*):\s*\{/gm)].map(m => m[1]);
const enTopSet = new Set(enTopLevel);
const esTopSet = new Set(esTopLevel);

const sectionsOnlyInEn = enTopLevel.filter(k => !esTopSet.has(k));
const sectionsOnlyInEs = esTopLevel.filter(k => !enTopSet.has(k));

if (sectionsOnlyInEn.length) {
  console.log(`\n🔴 Top-level sections in EN but NOT in ES:`);
  sectionsOnlyInEn.forEach(k => console.log(`   - ${k}`));
}
if (sectionsOnlyInEs.length) {
  console.log(`\n🟡 Top-level sections in ES but NOT in EN:`);
  sectionsOnlyInEs.forEach(k => console.log(`   - ${k}`));
}
if (!sectionsOnlyInEn.length && !sectionsOnlyInEs.length) {
  console.log(`\n✅ All top-level sections match between EN and ES`);
}

// ── Hardcoded strings ─────────────────────────────────────────────────────────
if (hardcodedCandidates.length) {
  console.log(`\n⚠️  Potential hardcoded UI strings (${hardcodedCandidates.length}):`);
  const byFile = {};
  hardcodedCandidates.forEach(h => { (byFile[h.file] ??= []).push(h); });
  for (const [file, items] of Object.entries(byFile).sort()) {
    console.log(`\n  📄 ${file}`);
    items.slice(0, 5).forEach(h => console.log(`     L${h.line}: "${h.text}"`));
    if (items.length > 5) console.log(`     ... and ${items.length - 5} more in this file`);
  }
} else {
  console.log(`\n✅ No obvious hardcoded UI strings detected`);
}

console.log('\n── Audit complete ──\n');
