const fs = require('fs');
const path = 'src/scenes/GameScene.js';
let content = fs.readFileSync(path, 'utf8');

// Change ac_2hp position
content = content.replace(/shopY - 80/g, 'shopY - 20');
// Change vip text position
content = content.replace(/shopY - 120/g, 'shopY - 25');

// Make decor_led thicker and visible
content = content.replace(/shopY - 128, shopW, 4/g, 'shopY - 25, shopW, 6');

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed positions!');

