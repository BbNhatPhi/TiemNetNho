const fs = require('fs');

// 1. Update main.js
let mainContent = fs.readFileSync('src/main.js', 'utf-8');
if (!mainContent.includes("import CryptoScene")) {
    mainContent = mainContent.replace(
        "import TutorialScene from './scenes/TutorialScene';",
        "import TutorialScene from './scenes/TutorialScene';\nimport CryptoScene from './scenes/CryptoScene';"
    );
    mainContent = mainContent.replace(
        "this.scene.add('Tutorial', TutorialScene);",
        "this.scene.add('Tutorial', TutorialScene);\n    this.scene.add('Crypto', CryptoScene);"
    );
    fs.writeFileSync('src/main.js', mainContent, 'utf-8');
}

// 2. Update GameScene.js
let gameContent = fs.readFileSync('src/scenes/GameScene.js', 'utf-8');

// A. createHUD
const createHUD_old = `  createHUD() {
    const width = this.cameras.main.width;
    const panel = this.add.nineslice(width / 2, 40, 'ui_panel', 0, 800, 70, 24, 24, 24, 24);
    this.layerUI.add(panel);

    const style = { font: '700 20px Nunito', fill: '#4a3b32' };
    this.cryptoText = this.add.text(width / 2 - 170, 40, \`₿ 0\`, { font: '800 22px Nunito', fill: '#f1c40f' }).setOrigin(0, 0.5);
    this.moneyText = this.add.text(width / 2 - 350, 40, \`💰 \${this.formatMoney(this.economy.money)}\`, { font: '800 22px Nunito', fill: '#c25953' }).setOrigin(0, 0.5);
    this.dayText = this.add.text(width / 2 - 50, 40, \`📅 Ngày \${this.day}\`, style).setOrigin(0.5);
    this.timeText = this.add.text(width / 2 + 120, 40, \`🕒 08:00\`, style).setOrigin(0.5);
    this.repText = this.add.text(width / 2 + 280, 40, \`⭐ \${this.reputation.toFixed(1)}\`, { font: '800 22px Nunito', fill: '#e88d72' }).setOrigin(0, 0.5);
    this.layerUI.add([this.moneyText, this.cryptoText, this.dayText, this.timeText, this.repText]);
  }`;

const createHUD_new = `  createHUD() {
    const width = this.cameras.main.width;
    const panel = this.add.nineslice(width / 2, 40, 'ui_panel', 0, 840, 70, 24, 24, 24, 24);
    this.layerUI.add(panel);

    const style = { font: '700 20px Nunito', fill: '#4a3b32' };
    this.moneyText = this.add.text(width / 2 - 390, 40, \`💰 \${this.formatMoney(this.economy.money)}\`, { font: '800 22px Nunito', fill: '#c25953' }).setOrigin(0, 0.5);
    this.cryptoText = this.add.text(width / 2 - 180, 40, \`₿ 0\`, { font: '800 20px Nunito', fill: '#f1c40f' }).setOrigin(0, 0.5);
    this.dayText = this.add.text(width / 2 + 10, 40, \`📅 Ngày \${this.day}\`, style).setOrigin(0.5);
    this.timeText = this.add.text(width / 2 + 150, 40, \`🕒 08:00\`, style).setOrigin(0.5);
    this.repText = this.add.text(width / 2 + 300, 40, \`⭐ \${this.reputation.toFixed(1)}\`, { font: '800 22px Nunito', fill: '#e88d72' }).setOrigin(0.5, 0.5);
    this.layerUI.add([this.moneyText, this.cryptoText, this.dayText, this.timeText, this.repText]);
  }`;
gameContent = gameContent.replace(createHUD_old, createHUD_new);
// Fallback if regex slightly mismatch (e.g., from previous fixes)
if (gameContent === fs.readFileSync('src/scenes/GameScene.js', 'utf-8')) {
    // try a more generic replace for HUD texts positions
    gameContent = gameContent.replace(/this\.cryptoText = this\.add\.text\(width \/ 2 - 170, 40, `₿ 0`, \{ font: '800 22px Nunito', fill: '#f1c40f' \}\)\.setOrigin\(0, 0\.5\);/g, `this.cryptoText = this.add.text(width / 2 - 180, 40, \`₿ 0\`, { font: '800 20px Nunito', fill: '#f1c40f' }).setOrigin(0, 0.5);`);
    gameContent = gameContent.replace(/this\.moneyText = this\.add\.text\(width \/ 2 - 350, 40,/g, `this.moneyText = this.add.text(width / 2 - 390, 40,`);
    gameContent = gameContent.replace(/this\.dayText = this\.add\.text\(width \/ 2 - 50, 40,/g, `this.dayText = this.add.text(width / 2 + 10, 40,`);
    gameContent = gameContent.replace(/this\.timeText = this\.add\.text\(width \/ 2 \+ 120, 40,/g, `this.timeText = this.add.text(width / 2 + 150, 40,`);
    gameContent = gameContent.replace(/this\.repText = this\.add\.text\(width \/ 2 \+ 280, 40,/g, `this.repText = this.add.text(width / 2 + 300, 40,`);
}

// B. updateHUD
const updateHUD_old = `  updateHUD() {
    if (this.moneyText) this.moneyText.setText(\`💰 \${this.formatMoney(this.economy.money)}\`);
    if (this.cryptoText) this.cryptoText.setText(\`₿ \${this.formatMoney(this.stats.cryptoMined || 0)}\`);
    if (this.repText) this.repText.setText(\`⭐ \${this.reputation.toFixed(1)}\`);
    if (this.dayText) this.dayText.setText(\`📅 Ngày \${this.day}\`);
    if (this.timeText && this.daySystem) this.timeText.setText(\`🕒 \${this.daySystem.getFormattedTime()}\`);`;
const updateHUD_new = `  updateHUD() {
    if (this.moneyText) this.moneyText.setText(\`💰 \${this.formatMoney(this.economy.money)}\`);
    if (this.cryptoText) {
        if (this.stats.crypto) {
            const coin = this.stats.crypto.selectedCoin || 'BTC';
            const bal = this.stats.crypto.balance[coin] || 0;
            this.cryptoText.setText(\`\${coin}: \${bal.toFixed(4)}\`);
        } else {
            this.cryptoText.setText(\`₿ 0\`);
        }
    }
    if (this.repText) this.repText.setText(\`⭐ \${this.reputation.toFixed(1)}\`);
    if (this.dayText) this.dayText.setText(\`📅 Ngày \${this.day}\`);
    if (this.timeText && this.daySystem) this.timeText.setText(\`🕒 \${this.daySystem.getFormattedTime()}\`);`;
gameContent = gameContent.replace(updateHUD_old, updateHUD_new);

// C. createBottomUI (buttons)
gameContent = gameContent.replace(/const btnBg = this\.add\.rectangle\(x, y, 220, 50, 0xc25953, 1\)/g, "const btnBg = this.add.rectangle(x, y, 180, 50, 0xc25953, 1)");
const oldButtons = `    createBtn(-280, '🛒 CỬA HÀNG', () => { this.scene.launch('Shop', { gameScene: this }); });
    createBtn(0, '💻 QUẢN LÝ MÁY', () => { this.scene.launch('PCManagement', { gameScene: this }); });
    createBtn(280, '🌙 KẾT THÚC NGÀY', () => this.daySystem.endDay());`;
const newButtons = `    createBtn(-285, '🛒 CỬA HÀNG', () => { this.scene.launch('Shop', { gameScene: this }); });
    createBtn(-95, '💻 QUẢN LÝ MÁY', () => { this.scene.launch('PCManagement', { gameScene: this }); });
    createBtn(95, '📈 SÀN CRYPTO', () => { this.scene.launch('Crypto', { gameScene: this }); });
    createBtn(285, '🌙 KẾT THÚC NGÀY', () => this.daySystem.endDay());`;
gameContent = gameContent.replace(oldButtons, newButtons);

// D. startNextDay crypto prices
const startNextDay_hook = `    this.setRouterOnline();`;
const startNextDay_addition = `    this.setRouterOnline();
    
    // Randomize crypto prices
    if (!this.stats.crypto) {
        this.stats.crypto = { balance: { BTC: 0, ETH: 0, DOGE: 0 }, selectedCoin: 'BTC' };
    }
    if (!this.stats.cryptoPrices) {
        this.stats.cryptoPrices = { BTC: 1000000, ETH: 80000, DOGE: 2000 };
    }
    this.stats.cryptoPrices.BTC = Math.floor(1000000 * (0.8 + Math.random() * 0.4));
    this.stats.cryptoPrices.ETH = Math.floor(80000 * (0.7 + Math.random() * 0.6));
    this.stats.cryptoPrices.DOGE = Math.floor(2000 * (0.5 + Math.random() * 1.0));`;
gameContent = gameContent.replace(startNextDay_hook, startNextDay_addition);

// E. Mining logic
const mining_old = `          if (this.miningAccumulator >= 2000) {
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
          }`;
const mining_new = `          if (this.miningAccumulator >= 2000) {
            this.miningAccumulator -= 2000;
            let hashRateVND = 0;
            
            this.pcs.forEach(pc => {
              if (pc.state === PC_STATES.READY) {
                const tickEarn = 150 * (pc.tier || 1) * miningLevel;
                hashRateVND += tickEarn;
                
                if (Math.random() < 0.4) {
                    const floatText = this.add.text(pc.x, pc.y - 30, '+₿', { font: 'bold 16px Nunito', fill: '#f1c40f' }).setOrigin(0.5);
                    this.layerUI.add(floatText);
                    this.tweens.add({ targets: floatText, y: pc.y - 50, alpha: 0, duration: 1000, onComplete: () => floatText.destroy() });
                }
              }
            });
            
            if (hashRateVND > 0) {
              if (!this.stats.crypto) {
                  this.stats.crypto = { balance: { BTC: 0, ETH: 0, DOGE: 0 }, selectedCoin: 'BTC' };
                  this.stats.cryptoPrices = { BTC: 1000000, ETH: 80000, DOGE: 2000 };
              }
              const coin = this.stats.crypto.selectedCoin;
              const amount = hashRateVND / this.stats.cryptoPrices[coin];
              this.stats.crypto.balance[coin] += amount;
              this.stats.cryptoMined = (this.stats.cryptoMined || 0) + hashRateVND;
              this.updateHUD();
            }
          }`;
gameContent = gameContent.replace(mining_old, mining_new);

fs.writeFileSync('src/scenes/GameScene.js', gameContent, 'utf-8');
console.log('Main and GameScene updated');

