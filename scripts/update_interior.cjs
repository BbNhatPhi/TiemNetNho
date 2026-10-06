const fs = require('fs');
let code = fs.readFileSync('src/scenes/GameScene.js', 'utf8');

// Replace shadowTop
code = code.replace(/0x000000, 0\.3/g, '0x4a3b32, 0.15');
// Replace entrance light
code = code.replace(/0xffffff, 0\.1/g, '0xc25953, 0.4');

// Replace cashier
code = code.replace(
  /const cashierDesk = this\.add\.rectangle\(shopX \+ 1000, shopY \+ 100, 200, 80, 0x734b35\)\.setOrigin\(0\.5\);\n\s+cashierDesk\.setStrokeStyle\(4, 0x4a3020\);\n\s+this\.add\.text\(shopX \+ 1000, shopY \+ 100, [^;]+;/m,
  "const cashierDesk = this.add.image(shopX + 1000, shopY + 100, 'cashier').setOrigin(0.5);\n    this.add.text(shopX + 1000, shopY + 100 - 30, 'THU NGÂN', { font: '800 16px Nunito', fill: '#4a3b32' }).setOrigin(0.5);"
);
code = code.replace(/\[E\] QU.*LA\?/g, "[E] THU NGÂN");

// Replace kitchen
code = code.replace(
  /const kitchenDesk = this\.add\.rectangle\(shopX \+ 1000, shopY \+ 250, 200, 80, 0x555555\)\.setOrigin\(0\.5\);\n\s+kitchenDesk\.setStrokeStyle\(4, 0x222222\);\n\s+this\.add\.text\(shopX \+ 1000, shopY \+ 250, [^;]+;/m,
  "const kitchenDesk = this.add.image(shopX + 1000, shopY + 250, 'kitchen').setOrigin(0.5);\n    this.add.text(shopX + 1000, shopY + 250 - 30, 'BẾP', { font: '800 16px Nunito', fill: '#4a3b32' }).setOrigin(0.5);"
);
code = code.replace(/\[E\] N.*U MAO/g, "[E] NẤU MÌ");

// Replace router
code = code.replace(
  /const router = this\.add\.rectangle\(shopX \+ 1150, shopY \+ 80, 40, 20, 0x111111\)\.setOrigin\(0\.5\);/m,
  "const router = this.add.rectangle(shopX + 1150, shopY + 80, 40, 20, 0xfff8f2).setOrigin(0.5);\n    router.setStrokeStyle(3, 0x4a3b32);"
);
code = code.replace(/\[E\] RESTART M.*NG/g, "[E] SỬA MẠNG");
code = code.replace(/router\.glow\.fillColor = 0x00ffcc/g, "router.glow.fillColor = 0x85a98f");

fs.writeFileSync('src/scenes/GameScene.js', code);
console.log('Done');
