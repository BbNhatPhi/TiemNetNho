const fs = require('fs');

let code = fs.readFileSync('src/scenes/GameScene.js', 'utf8');

// 1. Center and resize the shop to fit 1280x720 better
code = code.replace(/const shopX = [0-9]+;/m, 'const shopX = 40;');
code = code.replace(/const shopY = [0-9]+;/m, 'const shopY = 110;');
code = code.replace(/const shopW = [0-9]+;/m, 'const shopW = 1200;');
code = code.replace(/const shopH = [0-9]+;/m, 'const shopH = 500;');
code = code.replace(/this\.physics\.world\.setBounds\([^)]+\);/m, 'this.physics.world.setBounds(40, 110, 1200, 500);');

// Fix camera bounds to match config
code = code.replace(/this\.cameras\.main\.setBounds\(0, 0, 1920, 1080\);/m, 'this.cameras.main.setBounds(0, 0, 1280, 720);');

// 2. Adjust Furniture Positions based on shopX=40, shopY=110
// Cashier: shopX + 1000, shopY + 80
code = code.replace(/const cashierDesk = this\.add\.image\(shopX \+ [0-9]+, shopY \+ [0-9]+, 'cashier'\)/m, "const cashierDesk = this.add.image(shopX + 1000, shopY + 80, 'cashier')");
code = code.replace(/this\.add\.text\(shopX \+ [0-9]+, shopY \+ [0-9]+ - 60, 'THU NGÂN'/m, "this.add.text(shopX + 1000, shopY + 80 - 60, 'THU NGÂN'");
code = code.replace(/const cashierCollider = this\.add\.rectangle\(shopX \+ [0-9]+, shopY \+ [0-9]+, 150, 60\);/m, "const cashierCollider = this.add.rectangle(shopX + 1000, shopY + 80, 150, 60);");

// Kitchen: shopX + 1000, shopY + 220
code = code.replace(/const kitchenDesk = this\.add\.image\(shopX \+ [0-9]+, shopY \+ [0-9]+, 'kitchen'\)/m, "const kitchenDesk = this.add.image(shopX + 1000, shopY + 220, 'kitchen')");
code = code.replace(/this\.add\.text\(shopX \+ [0-9]+, shopY \+ [0-9]+ - 60, 'BẾP'/m, "this.add.text(shopX + 1000, shopY + 220 - 60, 'BẾP'");
code = code.replace(/const kitchenCollider = this\.add\.rectangle\(shopX \+ [0-9]+, shopY \+ [0-9]+, 150, 60\);/m, "const kitchenCollider = this.add.rectangle(shopX + 1000, shopY + 220, 150, 60);");

// Router: shopX + 1100, shopY + 60
code = code.replace(/const router = this\.add\.image\(shopX \+ [0-9]+, shopY \+ [0-9]+, 'router'\)/m, "const router = this.add.image(shopX + 1120, shopY + 60, 'router')");
code = code.replace(/const routerGlow = this\.add\.ellipse\(shopX \+ [0-9]+, shopY \+ [0-9]+, 10, 10/m, "const routerGlow = this.add.ellipse(shopX + 1120, shopY + 60, 10, 10");

// Door mat: shopX + 80, shopY + shopH - 20
code = code.replace(/const doorMat = this\.add\.image\(shopX \+ [0-9]+, shopY \+ shopH - 20, 'door_mat'\)/m, "const doorMat = this.add.image(shopX + 80, shopY + shopH - 20, 'door_mat')");

// 3. Fix Bottom UI missing buttons
const bottomUI = `createBottomUI() {
    const height = this.cameras.main.height;
    const width = this.cameras.main.width;

    const panel = this.add.nineslice(width / 2, height - 40, 'ui_panel', 0, 800, 70, 24, 24, 24, 24);
    this.layerUI.add(panel);
    
    const createBtn = (xOffset, text, callback) => {
        const btn = this.add.image(width / 2 + xOffset, height - 40, 'btn_normal').setInteractive({ useHandCursor: true });
        const txt = this.add.text(width / 2 + xOffset, height - 40, text, { font: '800 16px Nunito', fill: '#ffffff' }).setOrigin(0.5);
        
        btn.on('pointerover', () => { 
            btn.setTexture('btn_hover'); 
            this.tweens.add({targets: [btn, txt], scale: 1.05, duration: 100}); 
        });
        btn.on('pointerout', () => { 
            btn.setTexture('btn_normal'); 
            this.tweens.add({targets: [btn, txt], scale: 1, duration: 100}); 
        });
        btn.on('pointerdown', () => {
            this.tweens.add({targets: [btn, txt], scale: 0.95, duration: 50, yoyo: true, onComplete: callback});
        });
        this.layerUI.add([btn, txt]);
    };

    createBtn(-200, '🛒 CỬA HÀNG', () => { this.scene.launch('Shop', { gameScene: this }); this.scene.pause(); });
    createBtn(0, '👥 KHÁCH HÀNG', () => { this.showFloatText(width/2, height/2, 'Tính năng đang phát triển', '#e88d72'); });
    createBtn(200, '🌙 KẾT THÚC NGÀY', () => this.daySystem.endDay());
  }
`;
code = code.replace(/createBottomUI\(\) \{[\s\S]*?\n  \}\n/m, bottomUI);

// 4. Fix Customer Spawn and Waiting
code = code.replace(/const startX = [0-9]+;\n\s*const startY = [0-9]+;/m, "const startX = 120;\n    const startY = 640;");
// Make customers leave immediately if no PC, instead of standing outside
const lookingForPC = `        case CUSTOMER_STATES.LOOKING_FOR_PC:
          let emptyPCs = this.pcs.filter(pc => pc.state === 'READY');
          let targetPC = emptyPCs.find(pc => pc.tier >= cust.data.preferredPCLevel) || emptyPCs[0];

          if (targetPC) {
            targetPC.state = 'OCCUPIED';
            targetPC.customer = cust;
            targetPC.glow.fillAlpha = 0.2;
            
            cust.targetPC = targetPC;
            cust.state = CUSTOMER_STATES.WAITING;
            
            this.tweens.add({
              targets: [cust.sprite, cust.shadow],
              x: targetPC.x,
              y: targetPC.y + 20,
              duration: 2000,
              ease: 'Sine.easeInOut',
              onUpdate: () => { cust.sprite.y = cust.shadow.y - 20 - Math.abs(Math.sin(this.time.now/150)) * 10; },
              onComplete: () => {
                cust.sprite.y = cust.shadow.y - 20;
                cust.state = CUSTOMER_STATES.PLAYING;
              }
            });
          } else {
             // Leave immediately if no PC
             this.showFloatText(cust.sprite.x, cust.sprite.y - 20, 'Hết máy...', '#e88d72');
             cust.state = CUSTOMER_STATES.LEAVING;
          }
          break;`;
code = code.replace(/case CUSTOMER_STATES\.LOOKING_FOR_PC:[\s\S]*?break;/m, lookingForPC);

// Change `cashier target` x and y
code = code.replace(/x: 750,\n\s*y: 240/g, "x: 950,\n              y: 160");

// Fix any corrupted Vietnamese text in GameScene
code = code.replace(/THU NGA,N/g, 'THU NGÂN');
code = code.replace(/B_P/g, 'BẾP');
code = code.replace(/B\?T MA\?Y/g, 'BẬT MÁY');
code = code.replace(/TINH TI\?N/g, 'TÍNH TIỀN');
code = code.replace(/QU\?N LY/g, 'THU NGÂN');
code = code.replace(/S\?A M\?NG/g, 'SỬA MẠNG');

fs.writeFileSync('src/scenes/GameScene.js', code);
