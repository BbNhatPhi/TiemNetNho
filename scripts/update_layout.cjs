const fs = require('fs');

let code = fs.readFileSync('src/scenes/GameScene.js', 'utf8');

// 1. Update shop bounds
code = code.replace(/const shopW = 1200;\n\s*const shopH = 600;/m, 'const shopW = 800;\n    const shopH = 500;');
code = code.replace(/this\.physics\.world\.setBounds\(100, 100, 1200, 600\);/m, 'this.physics.world.setBounds(100, 100, 800, 500);');

// 2. Update Door Mat
code = code.replace(/const doorMat = this\.add\.rectangle\(shopX \+ 50, shopY \+ shopH - 20, 120, 40, 0xc25953, 0\.8\)\.setOrigin\(0\.5\);\n\s+doorMat\.setStrokeStyle\(4, 0x4a3b32\);/m, 
  "const doorMat = this.add.image(shopX + 80, shopY + shopH - 20, 'door_mat').setOrigin(0.5);");

// 3. Update Cashier
code = code.replace(/const cashierDesk = this\.add\.image\(shopX \+ 1000, shopY \+ 100, 'cashier'\)/m, 
  "const cashierDesk = this.add.image(shopX + 650, shopY + 80, 'cashier')");
code = code.replace(/this\.add\.text\(shopX \+ 1000, shopY \+ 100 - 30/m,
  "this.add.text(shopX + 650, shopY + 80 - 60");
code = code.replace(/const cashierCollider = this\.add\.rectangle\(shopX \+ 1000, shopY \+ 100, 150, 60\);/m,
  "const cashierCollider = this.add.rectangle(shopX + 650, shopY + 80, 150, 60);");

// 4. Update Kitchen
code = code.replace(/const kitchenDesk = this\.add\.image\(shopX \+ 1000, shopY \+ 250, 'kitchen'\)/m,
  "const kitchenDesk = this.add.image(shopX + 650, shopY + 220, 'kitchen')");
code = code.replace(/this\.add\.text\(shopX \+ 1000, shopY \+ 250 - 30/m,
  "this.add.text(shopX + 650, shopY + 220 - 60");
code = code.replace(/const kitchenCollider = this\.add\.rectangle\(shopX \+ 1000, shopY \+ 250, 150, 60\);/m,
  "const kitchenCollider = this.add.rectangle(shopX + 650, shopY + 220, 150, 60);");

// 5. Update Router
code = code.replace(/const router = this\.add\.rectangle\(shopX \+ 1150, shopY \+ 80, 40, 20, 0xfff8f2\)\.setOrigin\(0\.5\);\n\s*router\.setStrokeStyle\(3, 0x4a3b32\);/m,
  "const router = this.add.image(shopX + 760, shopY + 60, 'router').setOrigin(0.5);");
code = code.replace(/const routerGlow = this\.add\.ellipse\(shopX \+ 1150, shopY \+ 80, 10, 10, 0x85a98f, 1\);/m,
  "const routerGlow = this.add.ellipse(shopX + 760, shopY + 60, 10, 10, 0x85a98f, 1);");

// 6. Update Customer Spawning
code = code.replace(/const startX = 150;\s*\n\s*const startY = 700;/m,
  "const startX = 180;\n    const startY = 650;");
// 6.b Update Customer Target Cashier pos
code = code.replace(/x: 1000, \/\/ cashier X/g, "x: 750,");
code = code.replace(/y: 200, \/\/ cashier Y/g, "y: 180,"); // Cashier is at 100+80=180, wait, world coords: shopX+650 = 750, shopY+80 = 180. Customer should stand at 750, 260.
code = code.replace(/x: 750,\n\s*y: 180/g, "x: 750,\n              y: 240"); // just a rough patch

fs.writeFileSync('src/scenes/GameScene.js', code);
