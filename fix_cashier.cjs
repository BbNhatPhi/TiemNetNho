const fs = require('fs');
let content = fs.readFileSync('src/scenes/CashierScene.js', 'utf-8');

const oldDenomCode = `    // Denomination buttons
    const denominations = [1000, 2000, 5000, 10000, 20000, 50000];
    const btnStartX = width/2 - 220;
    const btnY = height/2 + 120;
    const btnSpaceX = 88;

    denominations.forEach((denom, i) => {
        const btnX = btnStartX + i * btnSpaceX;
        const dBtn = this.add.rectangle(btnX, btnY, 80, 50, 0xfff8f2).setInteractive({ useHandCursor: true });
        dBtn.setStrokeStyle(3, 0x4a3b32);
        
        const dTxt = this.add.text(btnX, btnY, (denom/1000) + 'k', { font: '800 20px Nunito', fill: '#4a3b32' }).setOrigin(0.5);
        
        dBtn.on('pointerdown', () => {
            this.currentChange += denom;
            this.selectedText.setText(this.formatMoney(this.currentChange));
            this.msgText.setText('');
            this.tweens.add({ targets: [dBtn, dTxt], scale: 0.9, duration: 50, yoyo: true });
        });
        dBtn.on('pointerover', () => dBtn.setFillStyle(0xeaddd0));
        dBtn.on('pointerout', () => dBtn.setFillStyle(0xfff8f2));
    });`;

const newDenomCode = `    // Denomination buttons
    const denominations = [1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000];
    const btnStartX = width/2 - 220;
    const btnY1 = height/2 + 100;
    const btnY2 = height/2 + 160;
    const btnSpaceX = 88;

    denominations.forEach((denom, i) => {
        const row = Math.floor(i / 5);
        const col = i % 5;
        // Center the second row (which has 4 buttons instead of 5)
        const offsetX = (row === 1) ? btnSpaceX / 2 : 0;
        const btnX = btnStartX + col * btnSpaceX + offsetX;
        const btnY = row === 0 ? btnY1 : btnY2;

        const dBtn = this.add.rectangle(btnX, btnY, 80, 50, 0xfff8f2).setInteractive({ useHandCursor: true });
        dBtn.setStrokeStyle(3, 0x4a3b32);
        
        const dTxt = this.add.text(btnX, btnY, (denom/1000) + 'k', { font: '800 20px Nunito', fill: '#4a3b32' }).setOrigin(0.5);
        
        dBtn.on('pointerdown', () => {
            this.currentChange += denom;
            this.selectedText.setText(this.formatMoney(this.currentChange));
            this.msgText.setText('');
            this.tweens.add({ targets: [dBtn, dTxt], scale: 0.9, duration: 50, yoyo: true });
        });
        dBtn.on('pointerover', () => dBtn.setFillStyle(0xeaddd0));
        dBtn.on('pointerout', () => dBtn.setFillStyle(0xfff8f2));
    });`;

content = content.replace(oldDenomCode, newDenomCode);

// Also need to push Action Buttons down slightly since we added a row of denominations
content = content.replace(`height/2 + 200, 200, 50`, `height/2 + 220, 200, 50`);
content = content.replace(`height/2 + 200, 200, 50`, `height/2 + 220, 200, 50`);

fs.writeFileSync('src/scenes/CashierScene.js', content, 'utf-8');
console.log('CashierScene updated');

