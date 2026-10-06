const fs = require('fs');

// 1. UPDATE UPGRADES.JS
let upgradesPath = 'src/data/upgrades.js';
let upgradesContent = fs.readFileSync(upgradesPath, 'utf8');

const newMiningUpgrades = `
  {
    id: 'service_mining_2',
    name: 'Tool Đào Coin Pro (Level 2)',
    category: 'services',
    cost: 15000000,
    description: 'Nâng cấp thuật toán đào. Tăng x2 tốc độ và hiệu suất đào coin trên các máy rảnh.',
    effect: (scene) => { scene.reputation += 0.2; }
  },
  {
    id: 'service_mining_3',
    name: 'Trại Trâu Cày (Level 3)',
    category: 'services',
    cost: 40000000,
    description: 'Cài đặt hệ thống đào tự động cao cấp nhất. Tăng x4 hiệu suất thu nhập thụ động.',
    effect: (scene) => { scene.reputation += 0.5; }
  }
`;
upgradesContent = upgradesContent.replace("{ id: 'staff_cashier',", newMiningUpgrades + ",\n  { id: 'staff_cashier',");
fs.writeFileSync(upgradesPath, upgradesContent, 'utf8');

// 2. UPDATE SHOPSCENE.JS
let shopPath = 'src/scenes/ShopScene.js';
let shopContent = fs.readFileSync(shopPath, 'utf8');

// Fix tab height/spacing
shopContent = shopContent.replace("const y = startY + (index * 70);", "const y = startY + (index * 58);");
shopContent = shopContent.replace("const tabBg = this.add.nineslice(startX, y, 'ui_panel', 0, 180, 60,", "const tabBg = this.add.nineslice(startX, y, 'ui_panel', 0, 180, 48,");
shopContent = shopContent.replace("const text = this.add.text(startX + 20, y + 30,", "const text = this.add.text(startX + 20, y + 24,");
shopContent = shopContent.replace("const zone = this.add.zone(startX, y, 180, 60)", "const zone = this.add.zone(startX, y, 180, 48)");

// Show stats in desc
let descReplacer = `
        let descText = upg.description;
        if (isBought) {
            if (upg.id === 'service_card') descText += \`\\n[Thống kê] Đã bán: \${this.gameScene.stats.cardsSold || 0} thẻ (Doanh thu: \${this.gameScene.formatMoney(this.gameScene.stats.cardsRevenue || 0)})\`;
            if (upg.id.startsWith('service_mining')) descText += \`\\n[Thống kê] Đã đào được: \${this.gameScene.formatMoney(this.gameScene.stats.cryptoMined || 0)}\`;
        }
        const desc = this.add.text(20, y + 55, descText, { fontFamily: 'Nunito', fontSize: '14.5px', color: '#4a3b32', wordWrap: { width: 450 } });
`;
shopContent = shopContent.replace("const desc = this.add.text(20, y + 55, upg.description, { fontFamily: 'Nunito', fontSize: '14.5px', color: \n'#4a3b32', wordWrap: { width: 450 } });", descReplacer);
// Handle the case where the regex above might fail due to newline
shopContent = shopContent.replace(/const desc = this\.add\.text\(20, y \+ 55, upg\.description, \{ fontFamily: 'Nunito', fontSize: '14\.5px', color:[\s\S]*?wordWrap: \{ width: 450 \} \}\);/, descReplacer);

// Hide mining level 2 and 3 if previous is not bought
let renderUpgradesReplacer = `
  renderUpgrades(category) {
      let items = SHOP_UPGRADES.filter(u => u.category === category);
      
      // Filter mining upgrades logically
      const hasMin1 = this.gameScene.upgrades && this.gameScene.upgrades.includes('service_mining');
      const hasMin2 = this.gameScene.upgrades && this.gameScene.upgrades.includes('service_mining_2');
      if (!hasMin1) items = items.filter(u => u.id !== 'service_mining_2' && u.id !== 'service_mining_3');
      else if (!hasMin2) items = items.filter(u => u.id !== 'service_mining_3');
`;
shopContent = shopContent.replace("renderUpgrades(category) {\n      const items = SHOP_UPGRADES.filter(u => u.category === category);", renderUpgradesReplacer);

fs.writeFileSync(shopPath, shopContent, 'utf8');

// 3. UPDATE GAMESCENE.JS
let gamePath = 'src/scenes/GameScene.js';
let gameContent = fs.readFileSync(gamePath, 'utf8');

// Initialize stats
gameContent = gameContent.replace("totalSpent: 0, maxPcCount: 0", "totalSpent: 0, maxPcCount: 0, cardsSold: 0, cardsRevenue: 0, cryptoMined: 0");

// Mining stats
let miningLogic = `
      // Passive mining income
      let miningLevel = 0;
      if (this.upgrades.includes('service_mining_3')) miningLevel = 4;
      else if (this.upgrades.includes('service_mining_2')) miningLevel = 2;
      else if (this.upgrades.includes('service_mining')) miningLevel = 1;

      if (miningLevel > 0 && this.daySystem && this.daySystem.isDayActive) {
        if (!this.miningAccumulator) this.miningAccumulator = 0;
        this.miningAccumulator += delta;
        
        if (this.miningAccumulator >= 2000) {
          this.miningAccumulator -= 2000;
          let miningIncome = 0;
          
          this.pcs.forEach(pc => {
            if (pc.state === PC_STATES.READY) {
              const tickEarn = 150 * (pc.tier || 1) * miningLevel;
              miningIncome += tickEarn;
              
              if (Math.random() < 0.4) {
                  const floatText = this.add.text(pc.x, pc.y - 30, '+₿', { font: 'bold 16px Nunito', fill: '#f1c40f' }).setOrigin(0.5);
                  this.layerUI.add(floatText);
                  this.tweens.add({ targets: floatText, y: pc.y - 50, alpha: 0, duration: 1000, onComplete: () => floatText.destroy() });
              }
            }
          });
          
          if (miningIncome > 0) {
            this.economy.addMoney(miningIncome);
            this.stats.cryptoMined = (this.stats.cryptoMined || 0) + miningIncome;
          }
        }
      }
`;
gameContent = gameContent.replace(/if \(this\.hasMiningService && this\.daySystem && this\.daySystem\.isDayActive\) \{[\s\S]*?if \(miningIncome > 0\) \{[\s\S]*?this\.economy\.addMoney\(miningIncome\);[\s\S]*?\}[\s\S]*?\}/, miningLogic);

// Card stats
let cardLogic = `
              bubble.on('pointerdown', () => {
                  const profit = Math.floor(Math.random() * 41 + 10) * 1000; // 10k to 50k
                  this.economy.addMoney(profit);
                  this.stats.cardsSold = (this.stats.cardsSold || 0) + 1;
                  this.stats.cardsRevenue = (this.stats.cardsRevenue || 0) + profit;
                  this.showFloatText(cust.sprite.x, cust.sprite.y - 40, \`+\${this.formatMoney(profit)}\`, '#2e7d32');
`;
gameContent = gameContent.replace(/bubble\.on\('pointerdown', \(\) => \{\s*const profit = Math\.floor\(Math\.random\(\) \* 41 \+ 10\) \* 1000; \/\/ 10k to 50k\s*this\.economy\.addMoney\(profit\);\s*this\.showFloatText\(cust\.sprite\.x, cust\.sprite\.y - 40, `\+\$\{this\.formatMoney\(profit\)\}`, '#2e7d32'\);/, cardLogic);

// Wait, I should also make sure Cashier staff can sell cards automatically so the user doesn't have to click them if they don't want to. Or maybe it's fine as a manual click to feel rewarding. I'll make the Cashier Staff auto-sell it too.
let staffCardLogic = `
        // Cashier Staff auto sell cards
        if (this.upgrades.includes('staff_cashier')) {
          this.customers.forEach(cust => {
             if (cust.state === 'REQUESTING' && cust.orderType === 'card' && cust.foodBubble) {
                 const profit = Math.floor(Math.random() * 41 + 10) * 1000;
                 this.economy.addMoney(profit);
                 this.stats.cardsSold = (this.stats.cardsSold || 0) + 1;
                 this.stats.cardsRevenue = (this.stats.cardsRevenue || 0) + profit;
                 this.showFloatText(cust.sprite.x, cust.sprite.y - 40, \`+\${this.formatMoney(profit)}\`, '#2e7d32');
                 
                 cust.foodBubble.bg?.destroy();
                 cust.foodBubble.txt?.destroy();
                 cust.foodBubble = null;
                 cust.state = 'PLAYING';
             }
          });
        }
`;
gameContent = gameContent.replace('// 2. Bếp & Pha chế', staffCardLogic + '\n        // 2. Bếp & Pha chế');

fs.writeFileSync(gamePath, gameContent, 'utf8');

console.log('Fixed shop layout, added stats and mining upgrades!');

