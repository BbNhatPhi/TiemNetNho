const fs = require('fs');

let code = fs.readFileSync('src/scenes/SummaryScene.js', 'utf8');

code = code.replace(/0x000000, 0/g, '0x4a3b32, 0');
code = code.replace(/fillAlpha: 0\.8/g, 'fillAlpha: 0.6');
code = code.replace(/0x1e1e28/g, '0xfff8f2');
code = code.replace(/0x3c3c50/g, '0xe6d5c3');
code = code.replace(/color: '#ffffff'/g, "color: '#4a3b32'");
code = code.replace(/color: '#a0a0b0'/g, "color: '#85a98f'");
code = code.replace(/color: '#4dffda'/g, "color: '#85a98f'"); // profit
code = code.replace(/color: '#ff5555'/g, "color: '#e88d72'"); // expense
code = code.replace(/color: '#00ffcc'/g, "color: '#c25953'"); // total
code = code.replace(/color: '#ffdd00'/g, "color: '#e88d72'"); // reputation

fs.writeFileSync('src/scenes/SummaryScene.js', code);
