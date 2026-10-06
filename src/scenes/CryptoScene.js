import Phaser from 'phaser';

export default class CryptoScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Crypto' });
  }

  init(data) {
    this.gameScene = data.gameScene;
    this.stats = this.gameScene.stats;
    if (!this.stats.crypto) {
        this.stats.crypto = {
            balance: { BTC: 0, ETH: 0, DOGE: 0 },
            selectedCoin: 'BTC'
        };
    }
    if (!this.stats.cryptoPrices) {
        this.stats.cryptoPrices = { BTC: 1000000, ETH: 80000, DOGE: 2000 };
    }
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const bg = this.add.rectangle(0, 0, width, height, 0x000000, 0.7).setOrigin(0).setInteractive();
    
    const panelW = 800;
    const panelH = 500;
    this.add.nineslice(width/2, height/2, 'ui_panel', 0, panelW, panelH, 32, 32, 32, 32).setInteractive();

    this.add.text(width/2, height/2 - 210, '📈 SÀN GIAO DỊCH CRYPTO', { font: '900 28px Nunito', fill: '#c25953' }).setOrigin(0.5);

    const coins = ['BTC', 'ETH', 'DOGE'];
    const names = { BTC: 'Bitcoin', ETH: 'Ethereum', DOGE: 'Dogecoin' };
    const colors = { BTC: '#f39c12', ETH: '#9b59b6', DOGE: '#e67e22' };

    let startY = height/2 - 120;
    
    this.uiElements = [];

    coins.forEach((coin, i) => {
        const y = startY + (i * 100);
        
        // Row background
        const rowBg = this.add.rectangle(width/2, y, 700, 80, 0xfff8f2).setInteractive();
        rowBg.setStrokeStyle(3, 0x4a3b32);

        // Coin Icon/Name
        this.add.text(width/2 - 320, y - 20, `${coin} - ${names[coin]}`, { font: 'bold 22px Nunito', fill: colors[coin] }).setOrigin(0, 0.5);
        
        // Price
        this.add.text(width/2 - 320, y + 15, `Giá: ${this.gameScene.formatMoney(this.stats.cryptoPrices[coin])}`, { font: 'bold 18px Nunito', fill: '#e88d72' }).setOrigin(0, 0.5);
        
        // Balance
        const balText = this.add.text(width/2 - 100, y, `Số dư: ${this.stats.crypto.balance[coin].toFixed(6)}`, { font: 'bold 20px Nunito', fill: '#4a3b32' }).setOrigin(0, 0.5);
        this.uiElements.push({ type: 'balance', coin, textObj: balText });

        // Mine Button
        const isMining = this.stats.crypto.selectedCoin === coin;
        const mineBtnColor = isMining ? 0x64c48a : 0xeaddd0;
        const mineBtnTxt = isMining ? 'ĐANG ĐÀO' : 'CHỌN ĐÀO';
        const mineBtn = this.add.rectangle(width/2 + 150, y, 120, 50, mineBtnColor).setInteractive({ useHandCursor: true });
        mineBtn.setStrokeStyle(2, 0x4a3b32);
        const mineTxt = this.add.text(width/2 + 150, y, mineBtnTxt, { font: 'bold 16px Nunito', fill: isMining ? '#ffffff' : '#4a3b32' }).setOrigin(0.5);
        this.uiElements.push({ type: 'mineBtn', coin, bg: mineBtn, txt: mineTxt });

        mineBtn.on('pointerdown', () => {
            this.stats.crypto.selectedCoin = coin;
            this.updateUI();
            this.gameScene.updateHUD();
        });
        mineBtn.on('pointerover', () => { if(this.stats.crypto.selectedCoin !== coin) mineBtn.setAlpha(0.8) });
        mineBtn.on('pointerout', () => mineBtn.setAlpha(1));

        // Sell Button
        const sellBtn = this.add.rectangle(width/2 + 280, y, 100, 50, 0xc25953).setInteractive({ useHandCursor: true });
        sellBtn.setStrokeStyle(2, 0x4a3b32);
        this.add.text(width/2 + 280, y, 'BÁN HẾT', { font: 'bold 16px Nunito', fill: '#ffffff' }).setOrigin(0.5);
        
        sellBtn.on('pointerdown', () => {
            const bal = this.stats.crypto.balance[coin];
            if (bal > 0) {
                const revenue = Math.floor(bal * this.stats.cryptoPrices[coin]);
                this.gameScene.economy.addMoney(revenue);
                this.stats.crypto.balance[coin] = 0;
                this.gameScene.showFloatText(width/2, y, `+${this.gameScene.formatMoney(revenue)}`, '#64c48a');
                this.updateUI();
                this.gameScene.updateHUD();
            } else {
                this.gameScene.showFloatText(width/2, y, `Chưa có coin!`, '#c25953');
            }
        });
        sellBtn.on('pointerover', () => sellBtn.setAlpha(0.8));
        sellBtn.on('pointerout', () => sellBtn.setAlpha(1));
    });

    // Close Button
    const closeBtn = this.add.text(width/2 + panelW/2 - 40, height/2 - panelH/2 + 40, '❌', { font: '900 26px Arial', fill: '#c25953' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerover', () => closeBtn.setScale(1.2));
    closeBtn.on('pointerout', () => closeBtn.setScale(1.0));
    closeBtn.on('pointerdown', () => {
        this.scene.stop();
    });
  }

  updateUI() {
    this.uiElements.forEach(el => {
        if (el.type === 'balance') {
            el.textObj.setText(`Số dư: ${this.stats.crypto.balance[el.coin].toFixed(6)}`);
        } else if (el.type === 'mineBtn') {
            const isMining = this.stats.crypto.selectedCoin === el.coin;
            el.bg.setFillStyle(isMining ? 0x64c48a : 0xeaddd0);
            el.txt.setText(isMining ? 'ĐANG ĐÀO' : 'CHỌN ĐÀO');
            el.txt.setColor(isMining ? '#ffffff' : '#4a3b32');
        }
    });
  }
}

