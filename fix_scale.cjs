const fs = require('fs');
let content = fs.readFileSync('src/scenes/GameScene.js', 'utf-8');
content = content.replace(/btn\.setScale\([\d.]+\); \/\/ Scale down slightly to fit better/g, 'btn.setScale(0.85); // Scale down slightly to fit better');
content = content.replace(/scale: 0\.95, duration: 100/g, 'scale: 0.9, duration: 100');
content = content.replace(/scale: 0\.9, duration: 100/g, 'scale: 0.85, duration: 100');
content = content.replace(/scale: 0\.85, duration: 50/g, 'scale: 0.8, duration: 50');
fs.writeFileSync('src/scenes/GameScene.js', content, 'utf-8');
console.log('Scale fixed');

