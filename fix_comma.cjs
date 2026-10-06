const fs = require('fs');
let upgradesPath = 'src/data/upgrades.js';
let upgradesContent = fs.readFileSync(upgradesPath, 'utf8');

upgradesContent = upgradesContent.replace("// 👷 Nhân sự", ", // 👷 Nhân sự");
fs.writeFileSync(upgradesPath, upgradesContent, 'utf8');
console.log('Fixed missing comma');

