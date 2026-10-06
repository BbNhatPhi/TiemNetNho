const fs = require('fs');

let code = fs.readFileSync('src/scenes/ShopScene.js', 'utf8');

// Update overlay
code = code.replace(/0x000000, 0/g, '0x4a3b32, 0');
code = code.replace(/fillAlpha: 0\.8/g, 'fillAlpha: 0.6');

// Header Text
code = code.replace(/color: '#ffffff'/g, "color: '#4a3b32'");
code = code.replace(/color: '#00ffcc'/g, "color: '#c25953'");
code = code.replace(/color: '#ff5555'/g, "color: '#e88d72'");

// Fix text emojis if corrupted
code = code.replace(/dY> C.*A HA\?NG/g, "🛒 CỬA HÀNG");
code = code.replace(/o-/g, "✖");
code = code.replace(/dY-,\?/g, "🖥️");
code = code.replace(/dY-,\?/g, "🖱️");
code = code.replace(/dY`/g, "🪑");

// Update category button colors in renderCategories
code = code.replace(/0x444455/g, '0xe6d5c3');
code = code.replace(/0x00a884/g, '0xc25953');
code = code.replace(/color: '#888899'/g, "color: '#c9b7a3'");
// Text colors for categories are already caught by #ffffff replacement but wait
code = code.replace(/color: isActive \? '#ffffff' : '#888899'/g, "color: isActive ? '#ffffff' : '#c9b7a3'");

// Items list styling
code = code.replace(/0x1e1e28/g, '0xfff8f2'); // item background
code = code.replace(/itemBg\.setStrokeStyle\(2, 0x333344\);/g, 'itemBg.setStrokeStyle(4, 0xe6d5c3);');
code = code.replace(/color: '#ffaa00'/g, "color: '#e88d72'"); // level text
code = code.replace(/color: '#8888aa'/g, "color: '#85a98f'"); // desc text
code = code.replace(/color: '#4dffda'/g, "color: '#c25953'"); // price text

fs.writeFileSync('src/scenes/ShopScene.js', code);
