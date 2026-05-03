const fs = require('fs');
const en = fs.readFileSync('src/locales/en.ts', 'utf8');
const es = fs.readFileSync('src/locales/es.ts', 'utf8');

// Find the billing section inside the dashboard namespace in EN
// The structure is: translation > dashboard > billing
const enDashStart = en.indexOf('        dashboard:');
const enDashText = en.slice(enDashStart, enDashStart + 120000);
const enBillingStart = enDashText.indexOf('        billing:');
const enBillingText = enDashText.slice(enBillingStart, enBillingStart + 60000);

// Same for ES
const esDashStart = es.indexOf('        dashboard:');
const esDashText = es.slice(esDashStart, esDashStart + 120000);
const esBillingStart = esDashText.indexOf('        billing:');
const esBillingText = esDashText.slice(esBillingStart, esBillingStart + 60000);

// Count lines
const enBLines = enBillingText.split('\n').length;
const esBLines = esBillingText.split('\n').length;
console.log('EN dashboard.billing lines:', enBLines);
console.log('ES dashboard.billing lines:', esBLines);
console.log('Delta:', enBLines - esBLines, 'lines\n');

// Find all subsections (8-space indent inside billing = 16 chars total but relative)
// en billing keys at depth+1
function getSubsections(text) {
  const keys = [];
  const re = /^(\s+)([a-zA-Z_][a-zA-Z0-9_]*):\s*\{/gm;
  let m;
  while ((m = re.exec(text)) !== null) {
    keys.push({ indent: m[1].length, key: m[2] });
  }
  return keys;
}

const enSubs = getSubsections(enBillingText);
const esSubs = getSubsections(esBillingText);
const esSubKeys = new Set(esSubs.map(s => s.key));
const enSubKeys = new Set(enSubs.map(s => s.key));

const missingInEs = enSubs.filter(s => !esSubKeys.has(s.key)).map(s => s.key);
const missingInEn = esSubs.filter(s => !enSubKeys.has(s.key)).map(s => s.key);

console.log('Subsections in EN billing but NOT in ES billing:');
console.log([...new Set(missingInEs)].sort().join('\n') || '(none)');
console.log('\nSubsections in ES billing but NOT in EN billing:');
console.log([...new Set(missingInEn)].sort().join('\n') || '(none)');

// Also check for specific known sections
const knownSections = ['hero', 'manual', 'auth', 'toggle', 'plans', 'billingInfo', 'socialProof',
  'foundingOffer', 'lifetimeUrgency', 'steps', 'serverSelection', 'checkout', 'trustSignals',
  'faq', 'success', 'cancel', 'toasts', 'trust', 'config', 'mutationBanner', 'inbox',
  'overview', 'tickets', 'general', 'serverRoles', 'welcome', 'verification', 'suggestions',
  'modlogs', 'commands', 'system', 'activity', 'analytics', 'shell', 'actions', 'states', 'sections'];

console.log('\n--- Section presence check ---');
for (const sec of knownSections) {
  const inEn = enBillingText.includes(sec + ':');
  const inEs = esBillingText.includes(sec + ':');
  if (inEn !== inEs) {
    console.log((inEn ? 'EN only' : 'ES only') + ': ' + sec);
  }
}
