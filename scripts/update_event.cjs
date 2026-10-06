const fs = require('fs');

let code = fs.readFileSync('src/scenes/EventPopupScene.js', 'utf8');

code = code.replace(/0x000000, 0/g, '0x4a3b32, 0');
code = code.replace(/fillAlpha: 0\.8/g, 'fillAlpha: 0.6');
code = code.replace(/0x1e1e28/g, '0xfff8f2');
code = code.replace(/0x3c3c50/g, '0xe6d5c3');
code = code.replace(/color: '#ffffff'/g, "color: '#4a3b32'");
code = code.replace(/color: '#ffdd00'/g, "color: '#c25953'");
code = code.replace(/color: '#ff5555'/g, "color: '#e88d72'");
code = code.replace(/color: '#4dffda'/g, "color: '#85a98f'");
code = code.replace(/0x333344/g, '0xc9b7a3');

fs.writeFileSync('src/scenes/EventPopupScene.js', code);
