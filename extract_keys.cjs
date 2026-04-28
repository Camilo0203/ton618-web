const fs = require('fs');
const path = require('path');

const keys = new Set();

function walk(dir) {
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      walk(p);
    } else if (p.endsWith('.tsx')) {
      const content = fs.readFileSync(p, 'utf-8');
      const matches = content.match(/t\(['"]([^'"]+)['"]/g);
      if (matches) {
        matches.forEach(m => {
          const k = m.slice(2, -1).replace(/['"]/g, '');
          keys.add(k);
        });
      }
    }
  });
}

walk('src/dashboard');
fs.writeFileSync('dashboard_keys.txt', Array.from(keys).sort().join('\n'), 'utf-8');
console.log('Extracted ' + keys.size + ' keys');
