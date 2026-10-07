import Phaser from 'phaser';
import { PC_TIERS } from '../data/computers';
import { SHOP_UPGRADES } from '../data/upgrades';
import { GAME_CONSTANTS } from '../utils/constants';
import { INGREDIENTS, INGREDIENT_PACK_SIZE } from '../data/ingredients';

export default class ShopScene extends Phaser.Scene {
  constructor() {
    super('Shop');
    this.currentCategory = 'pc';
  }

  init(data) {
    this.gameScene = data.gameScene;
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Overlay animation
    const overlay = this.add.rectangle(0, 0, width, height, 0x4a3b32, 0).setOrigin(0).setInteractive();
    this.tweens.add({ targets: overlay, fillAlpha: 0.6, duration: 200 });

    const modalWidth = 900;
    const modalHeight = 650;
    const modalX = width / 2;
    const modalY = height / 2;

    this.modal = this.add.container(modalX, modalY + 50);
    this.modal.alpha = 0;
    this.tweens.add({ targets: this.modal, y: modalY, alpha: 1, duration: 300, ease: 'Back.easeOut' });

    // Background NineSlice
    const bg = this.add.nineslice(0, 0, 'ui_panel', 0, modalWidth, modalHeight, 24, 24, 24, 24).setInteractive();
    
    // Header
    const title = this.add.text(-modalWidth/2 + 30, -modalHeight/2 + 25, '🛒 CỬA HÀNG', { fontFamily: 'Nunito', fontSize: '28px', color: '#4a3b32', fontStyle: 'bold' }).setOrigin(0, 0.5);
    
    this.moneyText = this.add.text(modalWidth/2 - 80, -modalHeight/2 + 25, `${this.formatMoney(this.gameScene.economy.money)}`, { fontFamily: 'Nunito', fontSize: '24px', color: '#c25953', fontStyle: 'bold' }).setOrigin(1, 0.5);

    // Close button
    const closeBtn = this.add.text(modalWidth/2 - 30, -modalHeight/2 + 25, '✖', { fontFamily: 'Nunito', fontSize: '28px', color: '#e88d72', fontStyle: 'bold' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => {
      this.tweens.add({
        targets: [this.modal, overlay], alpha: 0, y: modalY + 50, duration: 200,
        onComplete: () => {
          this.scene.stop();
          this.gameScene.scene.resume();
        }
      });
    });
    closeBtn.on('pointerover', () => closeBtn.setScale(1.2));
    closeBtn.on('pointerout', () => closeBtn.setScale(1));

    this.modal.add([bg, title, this.moneyText, closeBtn]);

    // Categories
    this.categories = [
      { id: 'pc', icon: '🖥️', name: 'Máy Tính' },
      { id: 'ingredients', icon: '📦', name: 'Nguyên Liệu' },
      { id: 'food', icon: '🍜', name: 'Bếp & Ăn' },
      { id: 'gear', icon: '🖱️', name: 'Phụ Kiện' },
      { id: 'furniture', icon: '🪑', name: 'Nội Thất' },
      { id: 'ac', icon: '❄️', name: 'Điều Hòa' },
      { id: 'internet', icon: '🌐', name: 'Internet' },
      { id: 'services', icon: '💎', name: 'Dịch Vụ' },
      { id: 'staff', icon: '👷', name: 'Nhân Sự' }
    ];

    this.tabButtons = [];
    this.createTabs(modalWidth, modalHeight);
    
    // Content Container
    this.contentContainer = this.add.container(-modalWidth/2 + 230, -modalHeight/2 + 80);
    this.modal.add(this.contentContainer);

    this.renderContent();
  }

  createTabs(modalWidth, modalHeight) {
    let startY = -modalHeight/2 + 80;
    let startX = -modalWidth/2 + 20;
    
    this.categories.forEach((cat, index) => {
      const y = startY + (index * 58);
      
      const tabBg = this.add.nineslice(startX, y, 'ui_panel', 0, 180, 48, 16, 16, 16, 16).setOrigin(0);
      const text = this.add.text(startX + 20, y + 24, `${cat.icon} ${cat.name}`, { fontFamily: 'Nunito', fontSize: '18px', color: '#4a3b32', fontStyle: 'bold' }).setOrigin(0, 0.5);
      
      const zone = this.add.zone(startX, y, 180, 48).setOrigin(0).setInteractive({ useHandCursor: true });
      
      const tabObj = { id: cat.id, bg: tabBg, text: text, zone: zone };
      
      zone.on('pointerdown', () => {
        this.currentCategory = cat.id;
        this.updateTabs();
        this.renderContent();
      });

      this.tabButtons.push(tabObj);
      this.modal.add([tabBg, text, zone]);
    });

    this.updateTabs();
  }

  updateTabs() {
    this.tabButtons.forEach(tab => {
      if (tab.id === this.currentCategory) {
        tab.bg.setTint(0xffffff);
        tab.text.setColor('#c25953');
      } else {
        tab.bg.setTint(0xdddddd);
        tab.text.setColor('#7d6b5e');
      }
    });
  }

  renderContent() {
    // Clear old content
    this.contentContainer.removeAll(true);

    if (this.currentCategory === 'pc') {
      this.renderPCs();
    } else if (this.currentCategory === 'ingredients') {
      this.renderIngredients(0);
    } else {
      this.renderUpgrades(this.currentCategory);
    }
  }

  renderIngredients(page = 0) {
    const keys = Object.keys(INGREDIENTS);
    const itemsPerPage = 8;
    const maxPage = Math.ceil(keys.length / itemsPerPage) - 1;
    
    const startIdx = page * itemsPerPage;
    const itemsToRender = keys.slice(startIdx, startIdx + itemsPerPage);

    let y = 0;
    
    // Header for ingredients
    const headerBg = this.add.rectangle(0, y, 630, 40, 0xeaddd0, 1).setOrigin(0);
    headerBg.setStrokeStyle(2, 0x4a3b32);
    const headerTxt = this.add.text(20, y + 20, `Gói nguyên liệu (${INGREDIENT_PACK_SIZE} món/gói)`, { fontFamily: 'Nunito', fontSize: '18px', color: '#4a3b32', fontStyle: 'bold' }).setOrigin(0, 0.5);
    this.contentContainer.add([headerBg, headerTxt]);
    
    y += 50;

    itemsToRender.forEach((key, index) => {
        const item = INGREDIENTS[key];
        const cost = item.cost * INGREDIENT_PACK_SIZE;
        const currentStock = this.gameScene.inventory[key] || 0;
        
        const cardW = 305;
        const cardH = 90;
        const col = index % 2;
        const row = Math.floor(index / 2);
        
        const cardX = col * 325;
        const cardY = y + row * 105;

        const itemBg = this.add.rectangle(cardX, cardY, cardW, cardH, 0xfff8f2, 1).setOrigin(0);
        itemBg.setStrokeStyle(2.5, 0x4a3b32);
        
        const nameTxt = this.add.text(cardX + 15, cardY + 20, item.name, { fontFamily: 'Nunito', fontSize: '18px', color: '#c25953', fontStyle: 'bold' });
        const stockTxt = this.add.text(cardX + 15, cardY + 45, `Tồn kho: ${currentStock}`, { fontFamily: 'Nunito', fontSize: '14px', color: '#4a3b32' });
        const packTxt = this.add.text(cardX + 15, cardY + 65, `(x${INGREDIENT_PACK_SIZE})`, { fontFamily: 'Nunito', fontSize: '14px', color: '#6b5c52' });

        const btnW = 100;
        const btnH = 40;
        const btnX = cardX + 240;
        const btnY = cardY + 45;
        
        const canAfford = this.gameScene.economy.money >= cost;
        const btnColor = canAfford ? 0x64c48a : 0xeaddd0;
        const textColor = canAfford ? '#ffffff' : '#c25953';
        const btnLabel = canAfford ? `MUA\n${this.formatMoney(cost)}` : `THIẾU\n${this.formatMoney(cost)}`;

        const buyBg = this.add.rectangle(btnX, btnY, btnW, btnH, btnColor, 1);
        buyBg.setStrokeStyle(2, 0x4a3b32);
        const buyTxt = this.add.text(btnX, btnY, btnLabel, { fontFamily: 'Nunito', fontSize: '12px', color: textColor, fontStyle: 'bold', align: 'center' }).setOrigin(0.5);

        if (canAfford) {
            buyBg.setInteractive({ useHandCursor: true });
            buyBg.on('pointerover', () => buyBg.setFillStyle(0x51ab75));
            buyBg.on('pointerout', () => buyBg.setFillStyle(0x64c48a));
            buyBg.on('pointerdown', () => {
                if (this.gameScene.economy.spendMoney(cost)) {
                    this.updateMoney();
                    this.gameScene.inventory[key] = (this.gameScene.inventory[key] || 0) + INGREDIENT_PACK_SIZE;
                    this.gameScene.saveGame();
                    this.showFloat(btnX, btnY, `+${INGREDIENT_PACK_SIZE} ${item.name}`, '#2e7d32');
                    
                    // Render again to update stock locally
                    this.renderIngredients(page);
                }
            });
        }

        this.contentContainer.add([itemBg, nameTxt, stockTxt, packTxt, buyBg, buyTxt]);
    });

    // Pagination
    const pageY = y + 4 * 105 + 10;
    const pageTxt = this.add.text(315, pageY, `Trang ${page + 1}/${maxPage + 1}`, { fontFamily: 'Nunito', fontSize: '16px', color: '#4a3b32', fontStyle: 'bold' }).setOrigin(0.5);
    this.contentContainer.add(pageTxt);

    if (page > 0) {
        const prevBtn = this.add.text(200, pageY, '◀ TRƯỚC', { fontFamily: 'Nunito', fontSize: '16px', color: '#c25953', fontStyle: '900' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        prevBtn.on('pointerdown', () => {
            this.contentContainer.removeAll(true);
            this.renderIngredients(page - 1);
        });
        this.contentContainer.add(prevBtn);
    }

    if (page < maxPage) {
        const nextBtn = this.add.text(430, pageY, 'SAU ▶', { fontFamily: 'Nunito', fontSize: '16px', color: '#c25953', fontStyle: '900' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        nextBtn.on('pointerdown', () => {
            this.contentContainer.removeAll(true);
            this.renderIngredients(page + 1);
        });
        this.contentContainer.add(nextBtn);
    }
  }

  renderPCs() {
    let y = 10;
    const currentCount = this.gameScene.pcs ? this.gameScene.pcs.length : 0;
    const maxCount = GAME_CONSTANTS.MAX_PCS;
    const isFull = currentCount >= maxCount;
    const cost = 800000;
    const canAfford = this.gameScene.economy.money >= cost;

    // Card background
    const cardW = 630;
    const cardH = 120;
    const itemBg = this.add.rectangle(0, y, cardW, cardH, 0xfff8f2, 1).setOrigin(0);
    itemBg.setStrokeStyle(2.5, 0x4a3b32);

    const preview = this.add.image(60, y + 60, 'pc_1').setScale(1.3);

    const name = this.add.text(120, y + 20, '🖥️ MÁY TÍNH CƠ BẢN', {
      fontFamily: 'Nunito', fontSize: '20px', color: '#c25953', fontStyle: 'bold'
    });

    const specs = this.add.text(120, y + 48, `Linh kiện khởi điểm Cấp 1 (Core 2 Duo • GT 730 • 4GB RAM)`, {
      fontFamily: 'Nunito', fontSize: '13.5px', color: '#4a3b32', fontStyle: '600'
    });

    const earn = this.add.text(120, y + 72, `Doanh thu cơ bản: 5.000đ / giờ  •  Tiệm hiện có: ${currentCount}/${maxCount} máy`, {
      fontFamily: 'Nunito', fontSize: '13.5px', color: '#7d6b5e', fontStyle: 'bold'
    });

    // Buy Button
    const btnW = 140;
    const btnH = 50;
    const btnX = 540;
    const btnY = y + 35;

    let btnColor = 0x64c48a;
    let btnLabel = `MUA MÁY\n${this.formatMoney(cost)}`;
    let textColor = '#ffffff';

    if (isFull) {
      btnColor = 0xdddddd;
      btnLabel = `HẾT CHỖ\n(${maxCount}/${maxCount})`;
      textColor = '#888888';
    } else if (!canAfford) {
      btnColor = 0xeaddd0;
      btnLabel = `THIẾU TIỀN\n${this.formatMoney(cost)}`;
      textColor = '#c25953';
    }

    const buyBg = this.add.rectangle(btnX + btnW/2, btnY + btnH/2, btnW, btnH, btnColor, 1);
    buyBg.setStrokeStyle(2, 0x4a3b32);

    const buyTxt = this.add.text(btnX + btnW/2, btnY + btnH/2, btnLabel, {
      fontFamily: 'Nunito', fontSize: '13px', color: textColor, fontStyle: 'bold', align: 'center'
    }).setOrigin(0.5);

    if (!isFull && canAfford) {
      buyBg.setInteractive({ useHandCursor: true });
      buyBg.on('pointerover', () => buyBg.setFillStyle(0x51ab75));
      buyBg.on('pointerout', () => buyBg.setFillStyle(0x64c48a));
      buyBg.on('pointerdown', () => {
        const newId = this.gameScene.pcs.length;
        if (newId >= GAME_CONSTANTS.MAX_PCS) {
          this.showFloat(btnX + btnW/2, btnY, 'Hết chỗ trống!', '#c25953');
          return;
        }
        if (this.gameScene.economy.spendMoney(cost)) {
          this.updateMoney();

          const row = Math.floor(newId / 5);
          const col = newId % 5;
          const pcX = 180 + col * 180;
          const pcY = 260 + row * 150;

          const parts = { cpu: 1, gpu: 1, ram: 1, monitor: 1, network: 1 };
          this.gameScene.pcConfigs.push({ id: newId, parts, x: pcX, y: pcY });
          this.gameScene.addPC(newId, parts, pcX, pcY);
          this.gameScene.saveGame();
          this.showFloat(btnX + btnW/2, btnY, '✓ Mua máy thành công!', '#2e7d32');

          // Refresh content
          this.renderPCs();
        } else {
          this.showFloat(btnX + btnW/2, btnY, 'Không đủ tiền!', '#c25953');
        }
      });
    }

    this.contentContainer.add([itemBg, preview, name, specs, earn, buyBg, buyTxt]);
  }

  renderUpgrades(category) {
    const items = SHOP_UPGRADES.filter(u => u.category === category);
    
    if (items.length === 0) {
      const emptyTxt = this.add.text(315, 200, 'Chưa có mặt hàng nào trong mục này.', { fontFamily: 'Nunito', fontSize: '18px', color: '#7d6b5e' }).setOrigin(0.5);
      this.contentContainer.add(emptyTxt);
      return;
    }

    let y = 0;
    items.forEach((upg) => {
      const isBought = this.gameScene.upgrades && this.gameScene.upgrades.includes(upg.id);
      const canAfford = this.gameScene.economy.money >= upg.cost;

      // Card background
      const cardW = 630;
      const cardH = 110;
      const itemBg = this.add.rectangle(0, y, cardW, cardH, 0xfff8f2, 1).setOrigin(0);
      itemBg.setStrokeStyle(2.5, 0x4a3b32);
      
      const name = this.add.text(20, y + 20, upg.name, { fontFamily: 'Nunito', fontSize: '20px', color: '#c25953', fontStyle: 'bold' });
      
        let descText = upg.description;
        if (isBought) {
            if (upg.id === 'service_card') descText += `\n[Thống kê] Đã bán: ${this.gameScene.stats.cardsSold || 0} thẻ (Doanh thu: ${this.gameScene.formatMoney(this.gameScene.stats.cardsRevenue || 0)})`;
            if (upg.id.startsWith('service_mining')) descText += `\n[Thống kê] Đã đào được: ${this.gameScene.formatMoney(this.gameScene.stats.cryptoMined || 0)}`;
        }
        const desc = this.add.text(20, y + 55, descText, { fontFamily: 'Nunito', fontSize: '14.5px', color: '#4a3b32', wordWrap: { width: 450 } });

      
      // Buy Button
      const btnW = 120;
      const btnH = 50;
      const btnX = 550;
      const btnY = y + 30;

      let btnColor = 0x64c48a;
      let btnLabel = `MUA\n${this.formatMoney(upg.cost)}`;
      let textColor = '#ffffff';

      if (isBought) {
        btnColor = 0xdddddd;
        btnLabel = 'ĐÃ MUA';
        textColor = '#888888';
      } else if (!canAfford) {
        btnColor = 0xeaddd0;
        btnLabel = `THIẾU TIỀN\n${this.formatMoney(upg.cost)}`;
        textColor = '#c25953';
      }

      const buyBg = this.add.rectangle(btnX + btnW/2, btnY + btnH/2, btnW, btnH, btnColor, 1);
      buyBg.setStrokeStyle(2, 0x4a3b32);

      const buyTxt = this.add.text(btnX + btnW/2, btnY + btnH/2, btnLabel, {
        fontFamily: 'Nunito', fontSize: '13px', color: textColor, fontStyle: 'bold', align: 'center'
      }).setOrigin(0.5);

      if (!isBought) {
        if (canAfford) {
          buyBg.setInteractive({ useHandCursor: true });
          buyBg.on('pointerover', () => buyBg.setFillStyle(0x51ab75));
          buyBg.on('pointerout', () => buyBg.setFillStyle(0x64c48a));
          buyBg.on('pointerdown', () => {
            if (this.gameScene.economy.spendMoney(upg.cost)) {
              this.updateMoney();
              if (!this.gameScene.upgrades) this.gameScene.upgrades = [];
              this.gameScene.upgrades.push(upg.id);
              upg.effect(this.gameScene);
              this.gameScene.saveGame();
              
              if (typeof this.gameScene.applyVisualUpgrades === 'function') {
                this.gameScene.applyVisualUpgrades();
              }

              this.showFloat(btnX + btnW/2, btnY, '✓ Đã nâng cấp!', '#2e7d32');
              
              // Refresh content to update button states
              this.renderContent();
            } else {
              this.showFloat(btnX + btnW/2, btnY, 'Không đủ tiền!', '#c25953');
            }
          });
        } else {
          // Can't afford - show tooltip on click maybe, or just no-op since it says THIẾU TIỀN
          buyBg.setInteractive({ useHandCursor: true });
          buyBg.on('pointerdown', () => {
            this.showFloat(btnX + btnW/2, btnY, 'Không đủ tiền!', '#c25953');
          });
        }
      }

      this.contentContainer.add([itemBg, name, desc, buyBg, buyTxt]);
      y += 125; // Spacing between items
    });
  }

  updateMoney() {
    this.moneyText.setText(`${this.formatMoney(this.gameScene.economy.money)}`);
    this.gameScene.updateHUD();
  }

  showFloat(x, y, text, color = '#00ffcc') {
    const floatText = this.add.text(x, y - 20, text, { fontFamily: 'Nunito', fontSize: '16px', color: color, fontStyle: 'bold' }).setOrigin(0.5);
    this.contentContainer.add(floatText);
    this.tweens.add({
      targets: floatText, y: y - 50, alpha: 0, duration: 1000,
      onComplete: () => floatText.destroy()
    });
  }

  formatMoney(amount) {
    if (amount >= 1000000) return (amount / 1000000).toFixed(1) + "Tr";
    if (amount >= 1000) return (amount / 1000).toFixed(0) + "K";
    return amount.toString();
  }
}
