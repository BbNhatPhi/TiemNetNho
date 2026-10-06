const fs = require('fs');

let gameContent = fs.readFileSync('src/scenes/GameScene.js', 'utf-8');

// Use regex to find and replace createHUD
const createHUD_regex = /createHUD\(\) \{[\s\S]*?this\.layerUI\.add\(\[.*?\]\);\s*\}/;
const createHUD_new = `createHUD() {
    const width = this.cameras.main.width;
    const panel = this.add.nineslice(width / 2, 40, 'ui_panel', 0, 800, 70, 24, 24, 24, 24);
    this.layerUI.add(panel);

    const style = { font: '700 20px Nunito', fill: '#4a3b32' };
    this.moneyText = this.add.text(width / 2 - 300, 40, \`💰 \${this.formatMoney(this.economy.money)}\`, { font: '800 22px Nunito', fill: '#c25953' }).setOrigin(0, 0.5);
    this.dayText = this.add.text(width / 2 - 50, 40, \`📅 Ngày \${this.day}\`, style).setOrigin(0.5);
    this.timeText = this.add.text(width / 2 + 120, 40, \`🕒 08:00\`, style).setOrigin(0.5);
    this.repText = this.add.text(width / 2 + 280, 40, \`⭐ \${this.reputation.toFixed(1)}\`, { font: '800 22px Nunito', fill: '#e88d72' }).setOrigin(0, 0.5);
    this.layerUI.add([this.moneyText, this.dayText, this.timeText, this.repText]);
  }`;

gameContent = gameContent.replace(createHUD_regex, createHUD_new);

// Use regex to find and replace updateHUD
const updateHUD_regex = /updateHUD\(\) \{[\s\S]*?this\.achievementSystem\.checkAchievements\(this\.stats\);\s*\}/;
const updateHUD_new = `updateHUD() {
    if (this.moneyText) this.moneyText.setText(\`💰 \${this.formatMoney(this.economy.money)}\`);
    if (this.repText) this.repText.setText(\`⭐ \${this.reputation.toFixed(1)}\`);
    if (this.dayText) this.dayText.setText(\`📅 Ngày \${this.day}\`);
    if (this.timeText && this.daySystem) this.timeText.setText(\`🕒 \${this.daySystem.getFormattedTime()}\`);

    if (this.achievementSystem) {
      this.achievementSystem.checkAchievements(this.stats);
    }
  }`;

gameContent = gameContent.replace(updateHUD_regex, updateHUD_new);

fs.writeFileSync('src/scenes/GameScene.js', gameContent, 'utf-8');
console.log('GameScene HUD updated');

