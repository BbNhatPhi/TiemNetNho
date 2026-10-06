import fs from 'fs';

let code = fs.readFileSync('src/scenes/GameScene.js', 'utf8');

// Replace shadow color
code = code.replace(/0x000000, 0\.4/g, '0x4a3b32, 0.2');

// Remove monitor.setTint
code = code.replace(/pc\.monitor\.setTint\(0xffffff\); \/\/ Turn screen on/g, 'pc.glow.fillAlpha = 0.4; // Screen on glow');
code = code.replace(/pc\.monitor\.setTint\(0x555555\); \/\/ Screen off/g, 'pc.glow.fillAlpha = 0; // Screen off glow');
code = code.replace(/\/\/ Initially screen is off \(dark\)\s*monitor\.setTint\(0x555555\);/g, '// Initially screen is off\n    pc.glow.fillAlpha = 0;');

// Update interaction text
code = code.replace(/\[E\] B.*T MA\?Y/g, '[E] BẬT MÁY');

fs.writeFileSync('src/scenes/GameScene.js', code);
