const fs = require('fs');
let content = fs.readFileSync('src/scenes/GameScene.js', 'utf-8');

// 1. Change PC positions
content = content.replace('conf.x = 180 + col * 180;', 'conf.x = 220 + col * 175;');

// 2. Remove decor_led
// Using a simpler regex that matches from `if (this.upgrades.includes('decor_led')) {` to `    // 3.` if there's a 3, or just manually remove.
const decorLedIndex = content.indexOf(`if (this.upgrades.includes('decor_led')) {`);
if (decorLedIndex !== -1) {
  const endLedIndex = content.indexOf(`    }`, decorLedIndex + 150); // It's about 10 lines
  if (endLedIndex !== -1) {
    content = content.substring(0, decorLedIndex) + content.substring(endLedIndex + 5);
  }
}

// 3. Update createHUD to add Crypto
content = content.replace(
  "this.moneyText = this.add.text(width / 2 - 300, 40",
  "this.cryptoText = this.add.text(width / 2 - 170, 40, `₿ 0`, { font: '800 22px Nunito', fill: '#f1c40f' }).setOrigin(0, 0.5);\n    this.moneyText = this.add.text(width / 2 - 350, 40"
);
content = content.replace(
  "this.layerUI.add([this.moneyText, this.dayText, this.timeText, this.repText]);",
  "this.layerUI.add([this.moneyText, this.cryptoText, this.dayText, this.timeText, this.repText]);"
);

// Update updateHUD
content = content.replace(
  "if (this.moneyText) this.moneyText.setText(`💰 ${this.formatMoney(this.economy.money)}`);",
  "if (this.moneyText) this.moneyText.setText(`💰 ${this.formatMoney(this.economy.money)}`);\n    if (this.cryptoText) this.cryptoText.setText(`₿ ${this.formatMoney(this.stats.cryptoMined || 0)}`);"
);

// 4. Don't pause game when opening modal scenes
content = content.replace(/this\.scene\.launch\('Shop', \{ gameScene: this \}\);\s*this\.scene\.pause\(\);/g, "this.scene.launch('Shop', { gameScene: this });");
content = content.replace(/this\.scene\.launch\('Kitchen', \{ gameScene: this \}\);\s*this\.scene\.pause\(\);/g, "this.scene.launch('Kitchen', { gameScene: this });");
content = content.replace(/this\.scene\.launch\('PCManagement', \{ gameScene: this \}\);\s*this\.scene\.pause\(\);/g, "this.scene.launch('PCManagement', { gameScene: this });");
content = content.replace(/this\.scene\.launch\('Cashier', \{ gameScene: this, customer: firstCust \}\);\s*this\.scene\.pause\(\);/g, "this.scene.launch('Cashier', { gameScene: this, customer: firstCust });");
content = content.replace(/this\.scene\.launch\('Kitchen', \{ gameScene: this, recipeId: chosen\.id, orderType: chosen\.type, customer: cust \}\);\s*this\.scene\.pause\(\);/g, "this.scene.launch('Kitchen', { gameScene: this, recipeId: chosen.id, orderType: chosen.type, customer: cust });");

fs.writeFileSync('src/scenes/GameScene.js', content, 'utf-8');
console.log('GameScene updated');
