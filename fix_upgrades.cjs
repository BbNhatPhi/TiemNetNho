const fs = require('fs');
let content = fs.readFileSync('src/data/upgrades.js', 'utf-8');

// Regex to remove decor_led object from array
content = content.replace(/\s*\{\s*id:\s*'decor_led'[\s\S]*?effect:\s*\([^)]*\)\s*=>\s*\{[^}]*\}\s*\},/, '');

fs.writeFileSync('src/data/upgrades.js', content, 'utf-8');
console.log('Upgrades updated');

