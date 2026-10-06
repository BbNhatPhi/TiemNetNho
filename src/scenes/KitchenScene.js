import Phaser from 'phaser';
import { RECIPES, RECIPE_TYPES } from '../data/recipes';

export default class KitchenScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Kitchen' });
  }

  init(data) {
    this.gameScene = data.gameScene;
    this.recipeId = data.recipeId;
    this.orderType = data.orderType;
    this.customer = data.customer;
    this.targetSpice = this.customer ? (this.customer.spiceLevel || 0) : 0;
    
    if (this.orderType === 'drink' || (this.recipeId && RECIPES.find(r => r.id === this.recipeId)?.type === RECIPE_TYPES.DRINK)) {
        if (this.customer && this.customer.drinkSize) {
            this.drinkOrder = {
                size: this.customer.drinkSize,
                sugar: this.customer.drinkSugar,
                ice: this.customer.drinkIce,
                topping: this.customer.drinkTopping
            };
        } else {
            this.drinkOrder = {
                size: Math.random() > 0.5 ? 'M' : 'L',
                sugar: [0, 50, 100][Math.floor(Math.random() * 3)],
                ice: [0, 50, 100][Math.floor(Math.random() * 3)],
                topping: ['Không', 'Trân châu trắng', 'Thạch trái cây'][Math.floor(Math.random() * 3)]
            };
        }
    }
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.add.rectangle(0, 0, width, height, 0x000000, 0.7).setOrigin(0).setInteractive();

    const panelW = 740;
    const panelH = 500;
    this.add.nineslice(width/2, height/2, 'ui_panel', 0, panelW, panelH, 32, 32, 32, 32).setInteractive();

    const closeBtn = this.add.text(width/2 + panelW/2 - 40, height/2 - panelH/2 + 35, '✖', {
        font: '900 24px Arial', fill: '#c25953'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    closeBtn.on('pointerdown', () => {
        this.scene.resume('Game');
        this.scene.stop();
    });

    if (!this.recipeId) {
        this.createMenuMode(width, height);
    } else {
          const recipe = RECIPES.find(r => r.id === this.recipeId);
          if (recipe) {
              const req = this.getRequiredIngredients(recipe, this.drinkOrder);
              const missing = this.getMissingIngredients(req);
              if (missing.length > 0 && this.customer) {
                  // Show error and close
                  this.gameScene.showFloatText(this.gameScene.kitchenDesk.x, this.gameScene.kitchenDesk.y - 40, `Thiếu: ${missing[0]}`, '#c25953');
                  this.scene.resume('Game');
                  this.scene.stop();
              } else {
                  this.startMinigame(width, height, recipe);
              }
          } else {
              this.scene.resume('Game');
              this.scene.stop();
          }
      }
  }

  getRequiredIngredients(recipe, drinkOrder) {
    let required = [];
    if (recipe.ingredients) required.push(...recipe.ingredients);
    else if (recipe.steps) {
      required.push(...recipe.steps);
      if (drinkOrder && drinkOrder.topping && drinkOrder.topping !== 'Không' && drinkOrder.topping !== 'Không Topping') {
        required.push(drinkOrder.topping);
      }
    }
    return required;
  }

  getMissingIngredients(required) {
    const missing = [];
    const inventory = this.gameScene.inventory || {};
    required.forEach(req => {
      if ((inventory[req] || 0) < 1) missing.push(req);
    });
    return missing;
  }

  consumeIngredients(required) {
    if (!this.gameScene.inventory) this.gameScene.inventory = {};
    required.forEach(req => {
      if (this.gameScene.inventory[req] > 0) {
        this.gameScene.inventory[req]--;
      }
    });
    this.gameScene.saveGame();
  }

  createMenuMode(width, height) {
    this.menuTab = this.menuTab || 'food'; // 'food' or 'drink'

    this.add.text(width/2, height/2 - 210, '📖 THỰC ĐƠN QUÁN', {
        font: '900 28px Nunito', fill: '#c25953'
    }).setOrigin(0.5);

    this.menuContainer = this.add.container(0, 0);
    this.renderMenu(width, height);
  }

  renderMenu(width, height) {
    this.menuContainer.removeAll(true);

    const tabY = height/2 - 150;
    
    // Food Tab
    const foodBtn = this.add.rectangle(width/2 - 100, tabY, 150, 40, this.menuTab === 'food' ? 0x64c48a : 0xeaddd0).setInteractive({ useHandCursor: true });
    foodBtn.setStrokeStyle(2, 0x4a3b32);
    const foodTxt = this.add.text(width/2 - 100, tabY, '🍔 ĐỒ ĂN', { font: 'bold 16px Nunito', fill: this.menuTab === 'food' ? '#ffffff' : '#4a3b32' }).setOrigin(0.5);
    foodBtn.on('pointerdown', () => {
        if (this.menuTab !== 'food') {
            this.menuTab = 'food';
            this.renderMenu(width, height);
        }
    });

    // Drink Tab
    const drinkBtn = this.add.rectangle(width/2 + 100, tabY, 150, 40, this.menuTab === 'drink' ? 0x64c48a : 0xeaddd0).setInteractive({ useHandCursor: true });
    drinkBtn.setStrokeStyle(2, 0x4a3b32);
    const drinkTxt = this.add.text(width/2 + 100, tabY, '🍹 ĐỒ UỐNG', { font: 'bold 16px Nunito', fill: this.menuTab === 'drink' ? '#ffffff' : '#4a3b32' }).setOrigin(0.5);
    drinkBtn.on('pointerdown', () => {
        if (this.menuTab !== 'drink') {
            this.menuTab = 'drink';
            this.renderMenu(width, height);
        }
    });

    this.menuContainer.add([foodBtn, foodTxt, drinkBtn, drinkTxt]);

    const filteredRecipes = RECIPES.filter(r => 
        this.menuTab === 'food' ? (r.type !== RECIPE_TYPES.DRINK) : (r.type === RECIPE_TYPES.DRINK)
    );

    filteredRecipes.forEach((recipe, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = width/2 - 180 + col * 360;
        const y = height/2 - 90 + row * 90;

        const isUnlocked = this.gameScene.masterySystem.isRecipeUnlocked(recipe);
        const level = this.gameScene.masterySystem.getLevel(recipe.id);

        const btn = this.add.rectangle(x, y, 330, 74, isUnlocked ? 0xfff8f2 : 0xeaddd0).setInteractive({ useHandCursor: isUnlocked });
        btn.setStrokeStyle(2.5, isUnlocked ? 0x4a3b32 : 0x8c7a6b);

        const titleText = isUnlocked ? recipe.name : `🔒 ${recipe.name}`;
        const titleColor = isUnlocked ? '#c25953' : '#6b5c52';
        this.menuContainer.add(this.add.text(x - 145, y - 16, titleText, { font: '800 17px Nunito', fill: titleColor }).setOrigin(0, 0.5));

        if (isUnlocked) {
            this.menuContainer.add(this.add.text(x + 145, y - 16, `Cấp ${level}`, { font: '800 15px Nunito', fill: '#2e7d32' }).setOrigin(1, 0.5));
            this.menuContainer.add(this.add.text(x - 145, y + 14, `Nhấn để làm món • Luyện thành thạo`, { font: '700 13px Nunito', fill: '#4a3b32' }).setOrigin(0, 0.5));

            btn.on('pointerdown', () => {
                const req = this.getRequiredIngredients(recipe, null);
                const missing = this.getMissingIngredients(req);
                if (missing.length > 0) {
                    this.gameScene.showFloatText(this.gameScene.kitchenDesk.x, this.gameScene.kitchenDesk.y - 40, `Thiếu: ${missing[0]}`, '#c25953');
                    this.scene.resume('Game');
                    this.scene.stop();
                    return;
                }
                this.recipeId = recipe.id;
                this.scene.restart({ gameScene: this.gameScene, recipeId: recipe.id });
            });
            btn.on('pointerover', () => btn.setFillStyle(0xe8dcd0));
            btn.on('pointerout', () => btn.setFillStyle(0xfff8f2));
        } else {
            let lockReason = 'Chưa mở khóa';
            if (recipe.masteryCondition) {
                const reqName = this.gameScene.masterySystem.getRecipeName(recipe.masteryCondition.id);
                lockReason = `Cần: Cấp ${recipe.masteryCondition.level} ${reqName}`;
            } else if (recipe.requiredUpgrades) {
                const missingUpgId = recipe.requiredUpgrades.find(req => !this.gameScene.upgrades.includes(req));
                if (missingUpgId) {
                  const upgNames = {
                    'food_noodle': 'Quầy Mì Tôm Trứng',
                    'food_drink': 'Tủ Lạnh Nước Ngọt',
                    'food_kitchen': 'Bếp Cơm Chiên',
                    'food_snack': 'Tủ Kính & Bếp Chiên'
                  };
                  lockReason = `Cần mua: ${upgNames[missingUpgId] || missingUpgId}`;
                } else {
                  lockReason = 'Cần nâng cấp cơ sở vật chất';
                }
            }
            this.menuContainer.add(this.add.text(x - 145, y + 14, lockReason, { font: '800 13px Nunito', fill: '#c25953' }).setOrigin(0, 0.5));
        }
        this.menuContainer.addAt(btn, 0); // Put btn behind texts
    });
  }

  startMinigame(width, height, recipe) {
    this.add.text(width/2, height/2 - 220, `🍳 ĐANG LÀM: ${recipe.name.toUpperCase()}`, {
        font: '900 28px Nunito', fill: '#c25953'
    }).setOrigin(0.5);

    if (recipe.type === RECIPE_TYPES.DRINK) {
        this.createDrinkMinigame(width, height, recipe);
    } else {
        this.createNoodleMinigame(width, height, recipe);
    }
  }

  // --- DRINK MINIGAME ---
  createDrinkMinigame(width, height, recipe) {
    this.drinkState = 'SIZE';
    this.playerCup = { size: null, fillPercent: 0, sugar: null, ice: null, topping: null, mixins: [] };
    this.pourTween = null;
    this.isPouring = false;

    // --- LEFT PANEL: Ticket & Cup ---
    const ticketX = width/2 - 220;
    const ticketY = height/2 - 100;
    
    // Ticket UI
    const ticketBg = this.add.rectangle(ticketX, ticketY, 220, 140, 0xfff8f2).setStrokeStyle(3, 0x4a3b32);
    this.add.text(ticketX, ticketY - 50, `ĐƠN HÀNG:`, { font: 'bold 16px Nunito', fill: '#c25953' }).setOrigin(0.5);
    this.add.text(ticketX, ticketY - 25, `${recipe.name.toUpperCase()}`, { font: '900 18px Nunito', fill: '#4a3b32', align: 'center', wordWrap: { width: 200 } }).setOrigin(0.5);
    
    const ticketLines = [
        `Size: ${this.drinkOrder.size}`,
        `Đường: ${this.drinkOrder.sugar}%`,
        `Đá: ${this.drinkOrder.ice}%`,
        `Topping: ${this.drinkOrder.topping}`
    ];
    ticketLines.forEach((text, i) => {
        this.add.text(ticketX - 90, ticketY - 5 + i * 20, text, { font: 'bold 15px Nunito', fill: '#6b5c52' }).setOrigin(0, 0.5);
    });

    // Cup Graphics
    const cupX = width/2 - 220;
    const cupY = height/2 + 90;
    this.cupBg = this.add.graphics();
    this.cupLiquid = this.add.graphics();
    this.cupTargetLine = this.add.graphics();
    
    this.drawCup = () => {
        this.cupBg.clear();
        this.cupLiquid.clear();
        this.cupTargetLine.clear();
        
        // Base cup outline
        this.cupBg.lineStyle(4, 0x4a3b32, 1);
        this.cupBg.fillStyle(0xffffff, 0.5);
        this.cupBg.beginPath();
        this.cupBg.moveTo(cupX - 40, cupY - 70);
        this.cupBg.lineTo(cupX - 30, cupY + 70);
        this.cupBg.lineTo(cupX + 30, cupY + 70);
        this.cupBg.lineTo(cupX + 40, cupY - 70);
        this.cupBg.closePath();
        this.cupBg.fillPath();
        this.cupBg.strokePath();

        if (this.drinkState !== 'SIZE') {
            // Draw liquid
            if (this.playerCup.fillPercent > 0) {
                const fillP = Math.min(this.playerCup.fillPercent, 110);
                const liquidH = 140 * (fillP / 100);
                const liqTopW = 30 + (10 * (fillP / 100)); // interpolated width
                const liqBotW = 30;
                
                this.cupLiquid.fillStyle(0xe88d72, 0.8);
                this.cupLiquid.beginPath();
                this.cupLiquid.moveTo(cupX - liqTopW, cupY + 70 - liquidH);
                this.cupLiquid.lineTo(cupX - liqBotW, cupY + 70);
                this.cupLiquid.lineTo(cupX + liqBotW, cupY + 70);
                this.cupLiquid.lineTo(cupX + liqTopW, cupY + 70 - liquidH);
                this.cupLiquid.closePath();
                this.cupLiquid.fillPath();
            }

            // Draw target line
            const targetFill = this.drinkOrder.size === 'M' ? 60 : 85;
            const targetH = 140 * (targetFill / 100);
            const targetW = 30 + (10 * (targetFill / 100));
            this.cupTargetLine.lineStyle(3, 0x64c48a, 1);
            this.cupTargetLine.beginPath();
            this.cupTargetLine.moveTo(cupX - targetW - 10, cupY + 70 - targetH);
            this.cupTargetLine.lineTo(cupX + targetW + 10, cupY + 70 - targetH);
            this.cupTargetLine.strokePath();
        }
    };
    this.drawCup();

    // --- RIGHT PANEL: Interactive Controls ---
    const panelX = width/2 + 80;
    
    // Containers for different states
    this.containerSize = this.add.container(0, 0);
    this.containerPour = this.add.container(0, 0).setVisible(false);
    this.containerMix = this.add.container(0, 0).setVisible(false);

    // BỎ LY (Trash) button, available in all steps after SIZE
    const trashBtn = this.add.rectangle(panelX + 200, height/2 + 200, 100, 40, 0xc25953).setInteractive({ useHandCursor: true }).setStrokeStyle(2, 0x4a3b32);
    const trashTxt = this.add.text(trashBtn.x, trashBtn.y, '🗑️ BỎ LY', { font: 'bold 16px Nunito', fill: '#ffffff' }).setOrigin(0.5);
    const trashContainer = this.add.container(0, 0, [trashBtn, trashTxt]).setVisible(false);
    
    trashBtn.on('pointerdown', () => {
        this.tweens.add({ targets: [trashBtn, trashTxt], scale: 0.9, duration: 50, yoyo: true });
        this.playerCup = { size: null, fillPercent: 0, sugar: null, ice: null, topping: null, mixins: [] };
        if (this.pourTween) this.pourTween.stop();
        this.isPouring = false;
        this.switchDrinkState('SIZE');
    });

    // === STATE: SIZE ===
    const sizeTitle = this.add.text(panelX, height/2 - 120, '1. CHỌN SIZE LY', { font: '900 22px Nunito', fill: '#4a3b32' }).setOrigin(0.5);
    this.containerSize.add(sizeTitle);

    ['M', 'L'].forEach((sz, i) => {
        const btn = this.add.rectangle(panelX - 70 + i*140, height/2 - 30, 120, 100, 0xfff8f2).setInteractive({ useHandCursor: true }).setStrokeStyle(3, 0x4a3b32);
        const txt = this.add.text(btn.x, btn.y, `Size ${sz}`, { font: 'bold 24px Nunito', fill: '#4a3b32' }).setOrigin(0.5);
        btn.on('pointerover', () => btn.setFillStyle(0xe8dcd0));
        btn.on('pointerout', () => btn.setFillStyle(0xfff8f2));
        btn.on('pointerdown', () => {
            this.tweens.add({ targets: [btn, txt], scale: 0.9, duration: 50, yoyo: true });
            this.playerCup.size = sz;
            this.switchDrinkState('POUR');
        });
        this.containerSize.add([btn, txt]);
    });

    // === STATE: POUR ===
    const pourTitle = this.add.text(panelX, height/2 - 120, '2. RÓT NƯỚC', { font: '900 22px Nunito', fill: '#4a3b32' }).setOrigin(0.5);
    const pourDesc = this.add.text(panelX, height/2 - 80, 'Giữ nút để rót, nhả ra để dừng.\nCanh đúng vạch màu xanh lá!', { font: 'bold 15px Nunito', fill: '#c25953', align: 'center' }).setOrigin(0.5);
    
    const pourBtn = this.add.rectangle(panelX, height/2 + 20, 200, 80, 0x64c48a).setInteractive({ useHandCursor: true }).setStrokeStyle(4, 0x4a3b32);
    const pourTxt = this.add.text(panelX, height/2 + 20, 'GIỮ ĐỂ RÓT', { font: '900 24px Nunito', fill: '#ffffff' }).setOrigin(0.5);
    
    this.containerPour.add([pourTitle, pourDesc, pourBtn, pourTxt]);

    const stopPouring = () => {
        if (this.isPouring) {
            this.isPouring = false;
            pourBtn.setFillStyle(0x64c48a);
            pourBtn.setScale(1); pourTxt.setScale(1);
            if (this.pourTween) this.pourTween.stop();
            if (this.playerCup.fillPercent > 0) {
                this.time.delayedCall(300, () => this.switchDrinkState('MIX'));
            }
        }
    };

    pourBtn.on('pointerdown', () => {
        if (this.playerCup.fillPercent >= 110) return;
        this.isPouring = true;
        pourBtn.setFillStyle(0x4ca871);
        pourBtn.setScale(0.95); pourTxt.setScale(0.95);
        
        this.pourTween = this.tweens.addCounter({
            from: this.playerCup.fillPercent,
            to: 110,
            duration: (110 - this.playerCup.fillPercent) * 20,
            onUpdate: (tween) => {
                this.playerCup.fillPercent = tween.getValue();
                this.drawCup();
                if (this.playerCup.fillPercent >= 110) stopPouring();
            }
        });
    });
    pourBtn.on('pointerup', stopPouring);
    pourBtn.on('pointerout', stopPouring);
    this.input.on('pointerup', stopPouring);

    // === STATE: MIX ===
    const mixTitle = this.add.text(panelX, height/2 - 200, '3. THÊM NGUYÊN LIỆU & ĐÓNG GÓI', { font: '900 18px Nunito', fill: '#4a3b32' }).setOrigin(0.5);
    this.containerMix.add(mixTitle);

    const createToggleGroup = (x, y, label, options, field) => {
        this.containerMix.add(this.add.text(x, y - 25, label, { font: 'bold 15px Nunito', fill: '#c25953' }).setOrigin(0.5));
        const btns = [];
        options.forEach((opt, i) => {
            const btnW = 50;
            const btnX = x + (i - (options.length-1)/2) * (btnW + 10);
            const btnBg = this.add.rectangle(btnX, y + 10, btnW, 35, 0xfff8f2).setInteractive({ useHandCursor: true }).setStrokeStyle(2, 0x4a3b32);
            const btnTxt = this.add.text(btnX, y + 10, opt, { font: 'bold 14px Nunito', fill: '#4a3b32' }).setOrigin(0.5);
            this.containerMix.add([btnBg, btnTxt]);
            
            btnBg.on('pointerdown', () => {
                btns.forEach(b => {
                    b.bg.setFillStyle(0xfff8f2);
                    b.txt.setColor('#4a3b32');
                });
                btnBg.setFillStyle(0x64c48a);
                btnTxt.setColor('#ffffff');
                this.playerCup[field] = opt;
                this.tweens.add({ targets: [btnBg, btnTxt], scale: 0.9, duration: 50, yoyo: true });
            });
            btns.push({ bg: btnBg, txt: btnTxt });
        });
        return btns;
    };

    this.mixToggles = [];
    this.mixToggles.push(...createToggleGroup(panelX - 100, height/2 - 140, 'Mức Đường', [0, 50, 100], 'sugar'));
    this.mixToggles.push(...createToggleGroup(panelX + 100, height/2 - 140, 'Lượng Đá', [0, 50, 100], 'ice'));
    
    this.containerMix.add(this.add.text(panelX, height/2 - 70, 'Topping & Thành phần', { font: 'bold 15px Nunito', fill: '#c25953' }).setOrigin(0.5));
    
    const allOptions = ['Không Topping', 'Trân châu trắng', 'Thạch trái cây', 'Sting', 'Chanh', 'Sữa đặc', 'Cà phê phin', 'Trà đen', 'Đào ngâm', 'Sả & Cam', 'Ly đá', 'Đá'];
    
    this.mixinBtns = [];
    allOptions.forEach((opt, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const bx = panelX - 165 + col * 110;
        const by = height/2 - 20 + row * 45;
        
        const btnBg = this.add.rectangle(bx, by, 100, 36, 0xfff8f2).setInteractive({ useHandCursor: true }).setStrokeStyle(2, 0x4a3b32);
        const btnTxt = this.add.text(bx, by, opt, { font: 'bold 12px Nunito', fill: '#4a3b32', wordWrap: { width: 90, useAdvancedWrap: true }, align: 'center' }).setOrigin(0.5);
        this.containerMix.add([btnBg, btnTxt]);

        let isSelected = false;
        btnBg.on('pointerdown', () => {
            isSelected = !isSelected;
            btnBg.setFillStyle(isSelected ? 0xe88d72 : 0xfff8f2);
            btnTxt.setColor(isSelected ? '#ffffff' : '#4a3b32');
            
            if (['Không Topping', 'Trân châu trắng', 'Thạch trái cây'].includes(opt)) {
                let actualTopping = opt === 'Không Topping' ? 'Không' : opt;
                if (isSelected) this.playerCup.topping = actualTopping;
                else if (this.playerCup.topping === actualTopping) this.playerCup.topping = null;
            } else {
                if (isSelected) this.playerCup.mixins.push(opt);
                else this.playerCup.mixins = this.playerCup.mixins.filter(m => m !== opt);
            }
            this.tweens.add({ targets: [btnBg, btnTxt], scale: 0.9, duration: 50, yoyo: true });
        });
        this.mixinBtns.push({ bg: btnBg, txt: btnTxt, opt: opt, reset: () => {
            isSelected = false;
            btnBg.setFillStyle(0xfff8f2);
            btnTxt.setColor('#4a3b32');
        }});
    });

    // Submit button
    const submitBtn = this.add.rectangle(panelX, height/2 + 150, 160, 50, 0xf1c40f).setInteractive({ useHandCursor: true }).setStrokeStyle(3, 0x4a3b32);
    const submitTxt = this.add.text(panelX, height/2 + 150, 'DÁN NẮP & GIAO', { font: '900 18px Nunito', fill: '#4a3b32' }).setOrigin(0.5);
    this.containerMix.add([submitBtn, submitTxt]);

    submitBtn.on('pointerdown', () => {
        this.tweens.add({ targets: [submitBtn, submitTxt], scale: 0.9, duration: 50, yoyo: true, onComplete: () => {
            this.evaluateDrinkOrder(recipe);
        }});
    });

    // --- STATE MANAGER ---
    this.switchDrinkState = (state) => {
        this.drinkState = state;
        this.containerSize.setVisible(state === 'SIZE');
        this.containerPour.setVisible(state === 'POUR');
        this.containerMix.setVisible(state === 'MIX');
        trashContainer.setVisible(state !== 'SIZE');
        this.drawCup();
        
        // Reset Mix buttons visually if going back to SIZE
        if (state === 'SIZE') {
            this.mixToggles.forEach(b => {
                b.bg.setFillStyle(0xfff8f2);
                b.txt.setColor('#4a3b32');
            });
            this.mixinBtns.forEach(b => b.reset());
        }
    };
    
    this.switchDrinkState('SIZE');
  }

  evaluateDrinkOrder(recipe) {
    let feedback = [];
    let qualityMod = 1.0;

    // 1. Check size
    if (this.playerCup.size !== this.drinkOrder.size) {
        feedback.push("Sai size ly");
        qualityMod -= 0.3;
    }

    // 2. Check fill amount
    const targetFill = this.drinkOrder.size === 'M' ? 60 : 85; 
    const fillDiff = this.playerCup.fillPercent - targetFill;
    if (fillDiff < -10) {
        feedback.push("Rót thiếu nước");
        qualityMod -= 0.2;
    } else if (fillDiff > 10) {
        feedback.push("Rót quá đầy");
        qualityMod -= 0.2;
    } else {
        qualityMod += 0.1; // perfect pour bonus
    }

    // 3. Check Sugar & Ice
    if (this.playerCup.sugar !== this.drinkOrder.sugar) {
        if (this.playerCup.sugar == null) feedback.push("Quên chọn đường");
        else feedback.push("Sai mức đường");
        qualityMod -= 0.15;
    }
    if (this.playerCup.ice !== this.drinkOrder.ice) {
        if (this.playerCup.ice == null) feedback.push("Quên chọn đá");
        else feedback.push("Sai lượng đá");
        qualityMod -= 0.15;
    }

    // 4. Check Topping
    if (this.playerCup.topping !== this.drinkOrder.topping) {
        if (this.playerCup.topping == null && this.drinkOrder.topping !== 'Không') feedback.push("Quên topping");
        else if (this.playerCup.topping != null && this.drinkOrder.topping === 'Không') feedback.push("Thêm nhầm topping");
        else feedback.push("Sai loại topping");
        qualityMod -= 0.2;
    }

    // 5. Check Recipe Ingredients
    const reqIngredients = recipe.steps || [];
    const missing = reqIngredients.filter(ing => !this.playerCup.mixins.includes(ing));
    const extra = this.playerCup.mixins.filter(ing => !reqIngredients.includes(ing));
    
    if (missing.length > 0) {
        feedback.push("Thiếu nguyên liệu");
        qualityMod -= 0.2 * missing.length;
    }
    if (extra.length > 0) {
        feedback.push("Thừa nguyên liệu");
        qualityMod -= 0.1 * extra.length;
    }

    qualityMod = Phaser.Math.Clamp(qualityMod, 0, 1.5);

    let finalFeedback = "Pha chuẩn!";
    let color = '#64c48a';
    if (feedback.length > 0) {
        finalFeedback = feedback.slice(0, 2).join(", "); // show max 2 issues
        if (feedback.length > 2) finalFeedback += "...";
        color = qualityMod >= 0.8 ? '#f1c40f' : '#c25953';
    }

    // Cover the panel
    this.add.rectangle(this.cameras.main.width/2, this.cameras.main.height/2, 740, 500, 0x000000, 0.8).setInteractive();
    
    this.add.text(this.cameras.main.width/2, this.cameras.main.height/2 - 20, qualityMod >= 1.0 ? 'TUYỆT VỜI!' : 'HOÀN THÀNH', { font: '900 32px Nunito', fill: '#ffffff' }).setOrigin(0.5);
    this.add.text(this.cameras.main.width/2, this.cameras.main.height/2 + 30, finalFeedback, { font: 'bold 24px Nunito', fill: color }).setOrigin(0.5);

    this.time.delayedCall(1800, () => {
        this.completeOrder(recipe, qualityMod);
    });
  }

  // --- PROCEDURAL FOOD GRAPHICS ---
  createFriedEggItem(x, y, scale = 1) {
    const container = this.add.container(x, y);
    const g = this.add.graphics();

    // 1. Crispy caramelized fried edge (Viền xém giòn)
    g.fillStyle(0x8d4915, 0.6);
    g.fillEllipse(0, 3 * scale, 64 * scale, 48 * scale);
    g.fillStyle(0xc87d1e, 0.88);
    g.fillEllipse(0, 1 * scale, 60 * scale, 44 * scale);

    // 2. Cooked egg white
    g.fillStyle(0xffffff, 1.0);
    g.fillEllipse(0, -1 * scale, 56 * scale, 40 * scale);
    g.fillEllipse(-12 * scale, 6 * scale, 24 * scale, 18 * scale);
    g.fillEllipse(14 * scale, -4 * scale, 26 * scale, 16 * scale);

    // 3. Sunny-side up plump egg yolk
    g.fillStyle(0xd35400, 0.95);
    g.fillEllipse(-4 * scale, 1 * scale, 24 * scale, 20 * scale);
    g.fillStyle(0xf39c12, 1.0);
    g.fillEllipse(-4 * scale, -1 * scale, 22 * scale, 18 * scale);
    g.fillStyle(0xf1c40f, 1.0);
    g.fillEllipse(-4 * scale, -2 * scale, 18 * scale, 14 * scale);
    
    // Highlight
    g.fillStyle(0xffffff, 0.8);
    g.fillEllipse(-8 * scale, -5 * scale, 6 * scale, 3 * scale);

    container.add(g);
    return container;
  }

  createNoodleItem(x, y, scale = 1) {
    const container = this.add.container(x, y);
    const w = 70 * scale;
    const h = 56 * scale;
    const g = this.add.graphics();

    // Base square block (Vắt mì vuông)
    g.fillStyle(0xd68910, 0.95);
    g.fillRoundedRect(-w/2, -h/2 + 2 * scale, w, h, 6 * scale);
    g.fillStyle(0xf5b041, 1.0);
    g.fillRoundedRect(-w/2, -h/2, w, h, 6 * scale);

    // Draw grid of wavy lines
    g.lineStyle(2 * scale, 0xb9770e, 0.7);
    for (let iy = -h/2 + 6 * scale; iy < h/2 - 4 * scale; iy += 6 * scale) {
        g.beginPath();
        g.moveTo(-w/2 + 4 * scale, iy);
        for (let ix = -w/2 + 4 * scale; ix <= w/2 - 4 * scale; ix += 6 * scale) {
            g.lineTo(ix, iy + ((ix + iy) % 12 === 0 ? 3 * scale : -3 * scale));
        }
        g.strokePath();
    }
    
    g.lineStyle(2 * scale, 0xf7dc6f, 0.8);
    for (let ix = -w/2 + 6 * scale; ix < w/2 - 4 * scale; ix += 6 * scale) {
        g.beginPath();
        g.moveTo(ix, -h/2 + 4 * scale);
        for (let iy = -h/2 + 4 * scale; iy <= h/2 - 4 * scale; iy += 6 * scale) {
            g.lineTo(ix + ((ix + iy) % 12 === 0 ? 3 * scale : -3 * scale), iy);
        }
        g.strokePath();
    }

    container.add(g);
    return container;
  }

  createBeefItem(x, y, scale = 1) {
    const container = this.add.container(x, y);
    const g = this.add.graphics();
    
    // Slices of beef
    g.fillStyle(0x4a2311, 0.9);
    g.fillRoundedRect(-20 * scale, -10 * scale, 30 * scale, 20 * scale, 5 * scale);
    g.fillStyle(0x78281f, 1.0);
    g.fillRoundedRect(-18 * scale, -8 * scale, 26 * scale, 16 * scale, 4 * scale);

    g.fillStyle(0x4a2311, 0.9);
    g.fillRoundedRect(-5 * scale, -5 * scale, 30 * scale, 20 * scale, 5 * scale);
    g.fillStyle(0x78281f, 1.0);
    g.fillRoundedRect(-3 * scale, -3 * scale, 26 * scale, 16 * scale, 4 * scale);

    // Texture lines (grains)
    g.lineStyle(1 * scale, 0x4a2311, 0.6);
    g.beginPath();
    g.moveTo(-10 * scale, -5 * scale); g.lineTo(-5 * scale, 5 * scale);
    g.moveTo(10 * scale, 0); g.lineTo(15 * scale, 10 * scale);
    g.strokePath();

    container.add(g);
    return container;
  }

  createScallionItem(x, y, scale = 1) {
    const container = this.add.container(x, y);
    const g = this.add.graphics();
    const bits = [
        { x: -10, y: -4, w: 5, h: 4 },
        { x: -3,  y: 3,  w: 6, h: 3 },
        { x: 5,   y: -5, w: 4, h: 5 },
        { x: 12,  y: 2,  w: 5, h: 4 },
        { x: -14, y: 5,  w: 4, h: 4 },
        { x: 2,   y: -1, w: 5, h: 3 }
    ];
    bits.forEach(b => {
        g.fillStyle(0x196f3d, 1.0);
        g.fillRoundedRect(b.x * scale, b.y * scale, b.w * scale, b.h * scale, 1 * scale);
        g.fillStyle(0x52be80, 0.9);
        g.fillCircle((b.x + b.w / 2) * scale, (b.y + b.h / 2) * scale, 1 * scale);
    });
    container.add(g);
    return container;
  }

  createBaguetteItem(x, y, scale = 1) {
    const container = this.add.container(x, y);
    const w = 70 * scale;
    const h = 30 * scale;
    const g = this.add.graphics();

    // Baguette base
    g.fillStyle(0xc06915, 0.95);
    g.fillRoundedRect(-w/2, -h/2, w, h, 15 * scale);
    g.fillStyle(0xd97e1c, 1.0);
    g.fillRoundedRect(-w/2 + 2*scale, -h/2 + 2*scale, w - 4*scale, h - 4*scale, 13 * scale);

    // Diagonal slash cuts
    g.lineStyle(4 * scale, 0xfcf3cf, 0.9);
    g.beginPath();
    g.moveTo(-15 * scale, -5 * scale);
    g.lineTo(-5 * scale, 5 * scale);
    g.moveTo(5 * scale, -5 * scale);
    g.lineTo(15 * scale, 5 * scale);
    g.strokePath();

    container.add(g);
    return container;
  }

  createSausageItem(x, y, scale = 1) {
    const container = this.add.container(x, y);
    const g = this.add.graphics();
    const w = 50 * scale;
    const h = 20 * scale;

    g.fillStyle(0x801e14, 0.95);
    g.fillRoundedRect(-w/2, -h/2, w, h, 10 * scale);
    g.fillStyle(0xa93226, 1.0);
    g.fillRoundedRect(-w/2 + 2*scale, -h/2 + 2*scale, w - 4*scale, h - 4*scale, 8 * scale);

    // Diagonal cut marks
    g.lineStyle(2 * scale, 0x4a1508, 0.8);
    for (let cx = -15; cx <= 15; cx += 10) {
        g.beginPath();
        g.moveTo((cx - 3) * scale, -5 * scale);
        g.lineTo((cx + 3) * scale, 5 * scale);
        g.strokePath();
    }

    container.add(g);
    return container;
  }

  createSeafoodItem(x, y, scale = 1) {
    const container = this.add.container(x, y);
    const g = this.add.graphics();

    // 1. Cooked Prawn
    const px = -12 * scale;
    const py = 0;
    g.fillStyle(0x641e16, 0.5);
    g.fillEllipse(px, py + 4 * scale, 34 * scale, 22 * scale);

    g.fillStyle(0xc0392b, 0.95);
    g.fillEllipse(px, py, 32 * scale, 20 * scale);
    g.fillStyle(0xe74c3c, 1.0);
    g.fillEllipse(px - 1 * scale, py - 1 * scale, 30 * scale, 18 * scale);
    g.fillStyle(0xf39c12, 0.9);
    g.fillEllipse(px - 3 * scale, py - 2 * scale, 24 * scale, 14 * scale);

    g.lineStyle(1.5 * scale, 0xffffff, 0.7);
    [-8, -2, 4].forEach(bx => {
        g.beginPath();
        g.moveTo((px + bx) * scale, (py - 7) * scale);
        g.lineTo((px + bx - 2) * scale, (py + 7) * scale);
        g.strokePath();
    });

    // Tail fan
    g.fillStyle(0xb03a2e, 1.0);
    g.beginPath();
    g.moveTo((px + 14) * scale, py);
    g.lineTo((px + 22) * scale, (py - 6) * scale);
    g.lineTo((px + 24) * scale, py);
    g.lineTo((px + 22) * scale, (py + 6) * scale);
    g.closePath();
    g.fillPath();

    // 2. Squid Ring
    const sqx = 16 * scale;
    const sqy = 2 * scale;
    g.fillStyle(0x512e5f, 0.5);
    g.fillEllipse(sqx, sqy + 3 * scale, 26 * scale, 22 * scale);
    g.fillStyle(0x884ea0, 0.8);
    g.fillEllipse(sqx, sqy, 25 * scale, 21 * scale);
    g.fillStyle(0xfffdfa, 1.0);
    g.fillEllipse(sqx, sqy - 1 * scale, 23 * scale, 19 * scale);
    g.fillStyle(0xd68910, 0.9);
    g.fillEllipse(sqx, sqy - 1 * scale, 12 * scale, 9 * scale);
    g.fillStyle(0xfffdfa, 1.0);
    g.lineStyle(1.5 * scale, 0xa569bd, 0.6);
    g.strokeEllipse(sqx, sqy - 1 * scale, 12 * scale, 9 * scale);

    // 3. Cilantro
    g.fillStyle(0x27ae60, 0.95);
    g.fillRoundedRect(0, -10 * scale, 6 * scale, 4 * scale, 1 * scale);
    g.fillRoundedRect(5 * scale, -8 * scale, 5 * scale, 3 * scale, 1 * scale);

    container.add(g);
    return container;
  }

  createFishballItem(x, y, scale = 1) {
    const container = this.add.container(x, y);
    const g = this.add.graphics();

    // Bamboo skewer
    g.lineStyle(3 * scale, 0xbcaaa4, 1.0);
    g.beginPath();
    g.moveTo(-42 * scale, 4 * scale);
    g.lineTo(46 * scale, -2 * scale);
    g.strokePath();

    // 3 Golden fried fish balls
    const balls = [
        { x: -24 * scale, y: 3 * scale, r: 12 * scale },
        { x: 0, y: 1 * scale, r: 13 * scale },
        { x: 24 * scale, y: -1 * scale, r: 12 * scale }
    ];

    balls.forEach(b => {
        g.fillStyle(0x784212, 0.4);
        g.fillCircle(b.x, b.y + 3 * scale, b.r);

        g.fillStyle(0xb9770e, 0.95);
        g.fillCircle(b.x, b.y, b.r);
        g.fillStyle(0xd68910, 1.0);
        g.fillCircle(b.x - 1 * scale, b.y - 1 * scale, b.r - 1.5 * scale);
        g.fillStyle(0xf5b041, 1.0);
        g.fillCircle(b.x - 2 * scale, b.y - 2 * scale, b.r - 3 * scale);
        g.fillStyle(0xf9e79f, 0.9);
        g.fillCircle(b.x - 3 * scale, b.y - 3 * scale, b.r - 6 * scale);

        g.fillStyle(0x873600, 0.85);
        g.fillCircle(b.x + 3 * scale, b.y + 2 * scale, 2 * scale);
        g.fillCircle(b.x - 2 * scale, b.y + 4 * scale, 1.8 * scale);
    });

    container.add(g);
    return container;
  }

  createFriesItem(x, y, scale = 1) {
    const container = this.add.container(x, y);
    const g = this.add.graphics();

    g.fillStyle(0x784212, 0.4);
    g.fillEllipse(0, 8 * scale, 68 * scale, 30 * scale);

    const fries = [
        { x: -18, y: 6, w: 26, h: 6 },
        { x: -10, y: -2, w: 32, h: 6.5 },
        { x: 12, y: 4, w: 28, h: 6 },
        { x: 6, y: -6, w: 30, h: 6.5 },
        { x: -4, y: 1, w: 34, h: 7 },
        { x: -16, y: -5, w: 24, h: 6 },
        { x: 14, y: -4, w: 26, h: 6 },
        { x: 0, y: -3, w: 28, h: 6.5 }
    ];

    fries.forEach(f => {
        g.fillStyle(0xb9770e, 0.95);
        g.fillRoundedRect((f.x - f.w/2) * scale, (f.y - f.h/2 + 1) * scale, f.w * scale, f.h * scale, 2.5 * scale);
        g.fillStyle(0xf5b041, 1.0);
        g.fillRoundedRect((f.x - f.w/2) * scale, (f.y - f.h/2) * scale, f.w * scale, f.h * scale, 2.5 * scale);
        g.fillStyle(0xf9e79f, 0.9);
        g.fillRoundedRect((f.x - f.w/2 + 2) * scale, (f.y - f.h/2 + 1) * scale, (f.w - 4) * scale, (f.h - 3) * scale, 1.5 * scale);
    });

    g.fillStyle(0xffffff, 0.9);
    [-12, -4, 6, 14, -8, 2].forEach((sx, idx) => {
        g.fillCircle(sx * scale, (idx % 2 === 0 ? -4 : 2) * scale, 1.2 * scale);
    });

    container.add(g);
    return container;
  }

  createChiliSauceItem(x, y, scale = 1) {
    const container = this.add.container(x, y);
    const g = this.add.graphics();

    g.fillStyle(0x641e16, 0.45);
    g.fillEllipse(0, 3 * scale, 34 * scale, 22 * scale);

    g.fillStyle(0x922b21, 0.95);
    g.fillEllipse(0, 1 * scale, 32 * scale, 20 * scale);
    g.fillStyle(0xc0392b, 1.0);
    g.fillEllipse(-1 * scale, 0, 28 * scale, 17 * scale);
    g.fillStyle(0xe74c3c, 1.0);
    g.fillEllipse(-2 * scale, -1 * scale, 22 * scale, 12 * scale);

    g.lineStyle(2.5 * scale, 0xff8a80, 0.85);
    g.beginPath();
    g.arc(-3 * scale, -2 * scale, 6 * scale, 0.5, Math.PI * 1.4, false);
    g.strokePath();

    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(-6 * scale, -4 * scale, 1.8 * scale);

    container.add(g);
    return container;
  }

  createRiceItem(x, y, scale = 1) {
    const container = this.add.container(x, y);
    const g = this.add.graphics();
    const w = 110 * scale;
    const h = 48 * scale;

    g.fillStyle(0x784212, 0.35);
    g.fillEllipse(0, 6 * scale, w + 4 * scale, h + 2 * scale);

    g.fillStyle(0xd68910, 0.7);
    g.fillEllipse(0, 2 * scale, w, h);
    g.fillStyle(0xf9e79f, 0.95);
    g.fillEllipse(0, 0, w - 2 * scale, h - 3 * scale);
    g.fillStyle(0xfef9e7, 1.0);
    g.fillEllipse(0, -3 * scale, w - 8 * scale, h - 8 * scale);

    for (let i = 0; i < 40; i++) {
        const rx = Phaser.Math.Between(-w/2 + 10, w/2 - 10) * scale;
        const ry = Phaser.Math.Between(-h/2 + 4, h/2 - 6) * scale;
        if (i % 3 === 0) {
            g.fillStyle(0xf39c12, 0.95);
            g.fillEllipse(rx, ry, 3.5 * scale, 2.5 * scale);
        } else if (i % 5 === 0) {
            g.fillStyle(0x27ae60, 0.95);
            g.fillRoundedRect(rx, ry, 3 * scale, 2.5 * scale, 0.5 * scale);
        } else {
            g.fillStyle(0xffffff, 0.9);
            g.fillEllipse(rx, ry, 4 * scale, 2.2 * scale);
        }
    }

    container.add(g);
    return container;
  }

  createPickledGreensItem(x, y, scale = 1) {
    const container = this.add.container(x, y);
    const g = this.add.graphics();

    g.fillStyle(0x3e2723, 0.4);
    g.fillEllipse(0, 3 * scale, 34 * scale, 22 * scale);

    g.fillStyle(0x7d6608, 0.9);
    g.fillEllipse(-2 * scale, 1 * scale, 32 * scale, 18 * scale);
    g.fillStyle(0x9a7d0a, 0.95);
    g.fillEllipse(0, 0, 28 * scale, 16 * scale);
    g.fillStyle(0xb7950b, 1.0);
    g.fillEllipse(2 * scale, -1 * scale, 24 * scale, 13 * scale);

    g.lineStyle(1.8 * scale, 0xd4ac0d, 0.9);
    [-6, 0, 6].forEach(gx => {
        g.beginPath();
        g.moveTo(gx * scale, -5 * scale);
        g.lineTo((gx + 2) * scale, 5 * scale);
        g.strokePath();
    });

    g.fillStyle(0xc0392b, 0.95);
    g.fillRoundedRect(-4 * scale, -2 * scale, 8 * scale, 2.5 * scale, 1 * scale);

    container.add(g);
    return container;
  }

  createOilItem(x, y, scale = 1) {
    const container = this.add.container(x, y);
    const g = this.add.graphics();

    g.fillStyle(0xd68910, 0.35);
    g.fillEllipse(0, 2 * scale, 48 * scale, 26 * scale);
    g.fillStyle(0xf5b041, 0.6);
    g.fillEllipse(0, 0, 42 * scale, 22 * scale);
    g.fillStyle(0xf9e79f, 0.75);
    g.fillEllipse(-2 * scale, -1 * scale, 34 * scale, 16 * scale);

    g.fillStyle(0xffffff, 0.9);
    const bubbles = [
        { x: -10, y: -2, r: 2.2 },
        { x: 4, y: 1, r: 2.5 },
        { x: 12, y: -3, r: 1.8 },
        { x: -4, y: 3, r: 2.0 },
        { x: 8, y: -4, r: 1.5 }
    ];
    bubbles.forEach(b => {
        g.fillCircle(b.x * scale, b.y * scale, b.r * scale);
    });

    container.add(g);
    return container;
  }

  createLadleItem(x, y, scale = 1) {
    const container = this.add.container(x, y);
    const g = this.add.graphics();

    // Splash of golden broth (Giọt nước dùng vàng óng)
    g.fillStyle(0xd35400, 0.8);
    g.fillCircle(0, 6 * scale, 24 * scale);
    g.fillStyle(0xf39c12, 1.0);
    g.fillCircle(0, 4 * scale, 22 * scale);
    
    // Top peak of the drop
    g.beginPath();
    g.moveTo(-20 * scale, 2 * scale);
    g.lineTo(0, -32 * scale);
    g.lineTo(20 * scale, 2 * scale);
    g.fillPath();

    // Core highlight
    g.fillStyle(0xffffff, 0.5);
    g.fillEllipse(-8 * scale, 4 * scale, 6 * scale, 14 * scale);

    container.add(g);
    return container;
  }

  createFoodItem(ing, x, y, scale = 1) {
    if (ing.includes('Nước dùng')) {
        return this.createLadleItem(x, y, scale);
    } else if (ing.includes('Mì')) {
        return this.createNoodleItem(x, y, scale);
    } else if (ing.includes('Trứng')) {
        return this.createFriedEggItem(x, y, scale);
    } else if (ing.includes('Bò') || ing.includes('Thịt')) {
        return this.createBeefItem(x, y, scale);
    } else if (ing.includes('Hải Sản')) {
        return this.createSeafoodItem(x, y, scale);
    } else if (ing.includes('Bánh mì')) {
        return this.createBaguetteItem(x, y, scale);
    } else if (ing.includes('Xúc xích')) {
        return this.createSausageItem(x, y, scale);
    } else if (ing.includes('Cá viên')) {
        return this.createFishballItem(x, y, scale);
    } else if (ing.includes('Khoai tây')) {
        return this.createFriesItem(x, y, scale);
    } else if (ing.includes('Cơm')) {
        return this.createRiceItem(x, y, scale);
    } else if (ing.includes('Dưa chua') || ing.includes('Dưa')) {
        return this.createPickledGreensItem(x, y, scale);
    } else if (ing.includes('Tương ớt')) {
        return this.createChiliSauceItem(x, y, scale);
    } else if (ing.includes('Dầu ăn')) {
        return this.createOilItem(x, y, scale);
    } else if (ing.includes('Hành lá')) {
        return this.createScallionItem(x, y, scale);
    }
    return null;
  }

  // --- NOODLE & HOT FOOD MINIGAME ---
  createNoodleMinigame(width, height, recipe) {
    this.noodleStep = 1;
    this.ingredientsAdded = 0;
    this.selectedSpice = 0;
    this.timingScore = 0;
    this.hasBroth = false;
    this.steamTimer = null;

    // --- LEFT PANEL: Ticket & Bowl/Plate ---
    const ticketX = width/2 - 220;
    const ticketY = height/2 - 100;
    
    // Ticket UI
    const ticketBg = this.add.rectangle(ticketX, ticketY, 220, 140, 0xfff8f2).setStrokeStyle(3, 0x4a3b32);
    this.add.text(ticketX, ticketY - 50, `ĐƠN HÀNG:`, { font: 'bold 16px Nunito', fill: '#c25953' }).setOrigin(0.5);
    this.add.text(ticketX, ticketY - 25, `${recipe.name.toUpperCase()}`, { font: '900 18px Nunito', fill: '#4a3b32', align: 'center', wordWrap: { width: 200 } }).setOrigin(0.5);
    
    let ticketSpiceTxt = this.customer ? `Yêu cầu: Cấp ${this.targetSpice} cay` : `Yêu cầu: Tùy ý`;
    if (recipe.id === 'snack_banh_mi') ticketSpiceTxt = 'Bánh mì đặc ruột';
    else if (recipe.id === 'snack_ca_vien') ticketSpiceTxt = 'Cá viên chiên giòn';
    else if (recipe.id === 'snack_khoai_tay') ticketSpiceTxt = 'Khoai chiên giòn rụm';
    else if (recipe.type === 'rice') ticketSpiceTxt = 'Cơm chiên nóng hổi';
    this.add.text(ticketX, ticketY + 25, ticketSpiceTxt, { font: 'bold 15px Nunito', fill: '#6b5c52' }).setOrigin(0.5);

    // Bowl / Plate Graphics
    const bowlX = width/2 - 220;
    const bowlY = height/2 + 95;
    this.dishBaseY = bowlY;

    this.dishContainer = this.add.container(bowlX, bowlY);

    // Shadow
    const shadow = this.add.ellipse(0, 46, 176, 26, 0x4a3b32, 0.2);
    this.dishContainer.add(shadow);

    const isNoodle = recipe.type === 'noodle';

    if (!isNoodle) {
        // Ceramic plate for Bánh mì, Snacks & Rice
        const plateOuter = this.add.ellipse(0, 16, 186, 76, 0xfffcf7).setStrokeStyle(3.5, 0x4a3b32);
        const plateInner = this.add.ellipse(0, 16, 156, 56, 0xf7ede2).setStrokeStyle(2, 0xdfd3c5);

        // Retro greaseproof paper liner for fried snacks (cá viên chiên & khoai tây chiên)
        const isFriedSnack = recipe.id === 'snack_ca_vien' || recipe.id === 'snack_khoai_tay';
        const paperLiner = this.add.graphics();
        if (isFriedSnack) {
            paperLiner.fillStyle(0xfff9e6, 0.95);
            paperLiner.fillRoundedRect(-68, 0, 136, 40, 10);
            paperLiner.lineStyle(1.5, 0xe74c3c, 0.6);
            paperLiner.strokeRoundedRect(-68, 0, 136, 40, 10);
        }

        this.foodLayersContainer = this.add.container(0, 0);

        // Utensil resting on plate (fork / pair of skewers / spoon)
        const utensilTxt = isFriedSnack ? '🥢' : (recipe.type === 'rice' ? '🥄' : '🍴');
        const utensil = this.add.text(74, 4, utensilTxt, { font: '26px Arial' }).setOrigin(0.5).setRotation(0.4);

        this.dishContainer.add([plateOuter, plateInner, paperLiner, this.foodLayersContainer, utensil]);
    } else {
        // Detailed Ceramic Ramen / Noodle Bowl
        const foot = this.add.ellipse(0, 42, 68, 18, 0xdfd3c5).setStrokeStyle(3.5, 0x4a3b32);

        const bowlBody = this.add.graphics();
        bowlBody.fillStyle(0xfff8f2, 1);
        bowlBody.lineStyle(3.5, 0x4a3b32, 1);
        const curve1 = new Phaser.Curves.CubicBezier(new Phaser.Math.Vector2(-80, -12), new Phaser.Math.Vector2(-80, 25), new Phaser.Math.Vector2(-45, 42), new Phaser.Math.Vector2(-26, 42));
        const curve2 = new Phaser.Curves.CubicBezier(new Phaser.Math.Vector2(26, 42), new Phaser.Math.Vector2(45, 42), new Phaser.Math.Vector2(80, 25), new Phaser.Math.Vector2(80, -12));
        const p1 = curve1.getPoints(16);
        const p2 = curve2.getPoints(16);

        bowlBody.beginPath();
        bowlBody.moveTo(-80, -12);
        p1.forEach(p => bowlBody.lineTo(p.x, p.y));
        bowlBody.lineTo(26, 42);
        p2.forEach(p => bowlBody.lineTo(p.x, p.y));
        bowlBody.closePath();
        bowlBody.fillPath();
        bowlBody.strokePath();

        // Decorative classic red patterned rim band
        bowlBody.lineStyle(4, 0xc25953, 1);
        const curve3 = new Phaser.Curves.CubicBezier(new Phaser.Math.Vector2(-76, 5), new Phaser.Math.Vector2(-50, 24), new Phaser.Math.Vector2(50, 24), new Phaser.Math.Vector2(76, 5));
        const p3 = curve3.getPoints(16);
        bowlBody.beginPath();
        bowlBody.moveTo(-76, 5);
        p3.forEach(p => bowlBody.lineTo(p.x, p.y));
        bowlBody.strokePath();

        // Inner rim cavity
        const innerRim = this.add.ellipse(0, -12, 160, 44, 0xebdccb).setStrokeStyle(3.5, 0x4a3b32);

        // Soup graphics layer inside bowl
        this.soupGfx = this.add.graphics();
        this.drawSoup = (hasBroth = false, spiceLevel = 0) => {
            this.soupGfx.clear();
            if (hasBroth) {
                const isTomyum = recipe.id === 'noodle_seafood';
                const soupColor = isTomyum ? 0xc0392b : (spiceLevel >= 4 ? 0xb03a2e : (spiceLevel >= 2 ? 0xd35400 : 0xe67e22));
                this.soupGfx.fillStyle(soupColor, 0.92);
                this.soupGfx.fillEllipse(0, -11, 148, 36);
                // Glistening broth reflection
                this.soupGfx.fillStyle(0xffffff, 0.3);
                this.soupGfx.fillEllipse(-26, -17, 56, 9);
                if (isTomyum) {
                    this.soupGfx.fillStyle(0xe74c3c, 0.5);
                    this.soupGfx.fillEllipse(20, -10, 40, 8);
                }
            }
        };
        this.drawSoup(false, 0);

        // Toppings container (sits inside soup)
        this.foodLayersContainer = this.add.container(0, 0);

        // Front lip of rim
        const frontRim = this.add.graphics();
        frontRim.lineStyle(3.5, 0x4a3b32, 1);
        frontRim.beginPath();
        frontRim.arc(0, -12, 80, 0, Math.PI, false);
        frontRim.strokePath();

        // Chopsticks resting nicely
        const chopsticks = this.add.text(70, -28, '🥢', { font: '32px Arial' }).setOrigin(0.5).setRotation(0.35);

        this.dishContainer.add([foot, bowlBody, innerRim, this.soupGfx, this.foodLayersContainer, frontRim, chopsticks]);
    }

    // --- RIGHT PANEL: Interactive Controls ---
    const panelX = width/2 + 80;

    this.containerStep1 = this.add.container(0, 0);
    this.containerStep2 = this.add.container(0, 0).setVisible(false);
    this.containerStep3 = this.add.container(0, 0).setVisible(false);

    // STEP 1: Add Ingredients
    const step1TitleTxt = isNoodle ? '1. CHO VÀO TÔ' : '1. CHUẨN BỊ NGUYÊN LIỆU';
    const step1Title = this.add.text(panelX, height/2 - 120, step1TitleTxt, { font: '900 20px Nunito', fill: '#4a3b32' }).setOrigin(0.5);
    this.containerStep1.add(step1Title);
    
    const ings = recipe.ingredients || ['Nước dùng', 'Mì', 'Topping'];
    ings.forEach((ing, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const bx = panelX - 80 + col * 160;
        const by = height/2 - 50 + row * 60;

        const btn = this.add.rectangle(bx, by, 140, 45, 0xfff8f2).setInteractive({ useHandCursor: true }).setStrokeStyle(3, 0x4a3b32);
        const txt = this.add.text(btn.x, btn.y, ing, { font: 'bold 15px Nunito', fill: '#4a3b32', wordWrap: { width: 130 }, align: 'center' }).setOrigin(0.5);
        
        let clicked = false;
        btn.on('pointerdown', () => {
            if (clicked) return;
            clicked = true;
            btn.disableInteractive();
            btn.setFillStyle(0x64c48a);
            txt.setColor('#ffffff');
            this.tweens.add({ targets: [btn, txt], scale: 0.9, duration: 50, yoyo: true });
            
            // Placement offset inside dish
            let offset = { x: 0, y: 0 };
            if (ing.includes('Nước dùng')) {
                offset = { x: 0, y: -12 };
            } else if (ing.includes('Mì')) {
                offset = { x: 0, y: -6 };
            } else if (ing.includes('Cơm')) {
                offset = { x: 0, y: 12 };
            } else if (ing.includes('Bánh mì')) {
                offset = { x: 0, y: 14 };
            } else if (ing.includes('Trứng')) {
                if (isNoodle) offset = { x: -24, y: -9 };
                else if (recipe.id === 'snack_banh_mi') offset = { x: -22, y: 10 };
                else offset = { x: -20, y: 8 }; // on fried rice
            } else if (ing.includes('Bò') || ing.includes('Thịt')) {
                if (isNoodle) offset = { x: 26, y: -10 };
                else offset = { x: 22, y: 8 }; // on fried rice
            } else if (ing.includes('Dưa chua') || ing.includes('Dưa')) {
                offset = { x: -24, y: 8 }; // on fried rice
            } else if (ing.includes('Hải Sản')) {
                offset = { x: 0, y: -14 };
            } else if (ing.includes('Xúc xích')) {
                offset = { x: 22, y: 12 }; // on banh mi
            } else if (ing.includes('Cá viên')) {
                offset = { x: -8, y: 14 };
            } else if (ing.includes('Khoai tây')) {
                offset = { x: -6, y: 14 };
            } else if (ing.includes('Dầu ăn')) {
                offset = { x: 0, y: 16 };
            } else if (ing.includes('Tương ớt')) {
                if (isNoodle) offset = { x: 26, y: -6 };
                else offset = { x: 38, y: 8 };
            } else if (ing.includes('Hành lá')) {
                if (isNoodle) offset = { x: 6, y: -2 };
                else offset = { x: 14, y: 14 };
            }

            const targetX = bowlX + offset.x;
            const targetY = bowlY + offset.y;

            // Spawning toss item at button location
            let flyer = this.createFoodItem(ing, bx, by, 0.75);
            let baseScale = 0.75;
            if (!flyer) {
                flyer = this.add.text(bx, by, '✨', { font: '28px Arial' }).setOrigin(0.5);
                baseScale = 1.0;
            }

            // Parabolic toss flight animation:
            // 1. Move horizontally with ease
            this.tweens.add({
                targets: flyer,
                x: targetX,
                duration: 450,
                ease: 'Quad.easeInOut'
            });

            // 2. Fly up in an arc, then plunge into the bowl
            this.tweens.add({
                targets: flyer,
                y: Math.min(by, targetY) - 70,
                duration: 200,
                ease: 'Cubic.easeOut',
                onComplete: () => {
                    this.tweens.add({
                        targets: flyer,
                        y: targetY,
                        duration: 250,
                        ease: 'Cubic.easeIn',
                        onComplete: () => {
                            flyer.destroy();
                            
                            // LANDING IN THE BOWL: Broth fills the bowl liquid layer
                            if (ing.includes('Nước dùng')) {
                                this.hasBroth = true;
                                this.drawSoup(true, this.selectedSpice);
                                if (this.soupGfx) {
                                    this.soupGfx.scaleY = 0.6;
                                    this.tweens.add({
                                        targets: this.soupGfx,
                                        scaleY: 1.0,
                                        duration: 240,
                                        ease: 'Back.easeOut'
                                    });
                                }
                            }

                            // Permanent item inside bowl / plate (Nước dùng fills the soup layer, NO pot added!)
                            let landed = null;
                            if (!ing.includes('Nước dùng')) {
                                landed = this.createFoodItem(ing, offset.x, offset.y, 1.0);
                                if (landed) {
                                    landed.setRotation(Phaser.Math.FloatBetween(-0.06, 0.06));
                                    const isBase = ing.includes('Mì') || ing.includes('Cơm') || ing.includes('Bánh mì');
                                    if (isBase) {
                                        this.foodLayersContainer.addAt(landed, 0);
                                    } else {
                                        this.foodLayersContainer.add(landed);
                                    }

                                    // Squash & bounce effect on landing
                                    landed.setScale(1.22, 0.78);
                                    this.tweens.add({
                                        targets: landed,
                                        scaleX: 1.0,
                                        scaleY: 1.0,
                                        duration: 260,
                                        ease: 'Back.easeOut'
                                    });
                                }
                            }

                            // Splash particles burst
                            const splashColor = this.hasBroth ? 0xe67e22 : 0xffffff;
                            for (let p = 0; p < 7; p++) {
                                const drop = this.add.circle(targetX, targetY, Phaser.Math.Between(3, 5), splashColor, 0.9);
                                const ang = Phaser.Math.FloatBetween(-Math.PI * 0.85, -Math.PI * 0.15);
                                const dist = Phaser.Math.Between(22, 45);
                                this.tweens.add({
                                    targets: drop,
                                    x: targetX + Math.cos(ang) * dist,
                                    y: targetY + Math.sin(ang) * dist,
                                    scale: 0.2,
                                    alpha: 0,
                                    duration: 320,
                                    ease: 'Cubic.easeOut',
                                    onComplete: () => drop.destroy()
                                });
                            }

                            // Bowl jiggle
                            this.tweens.add({
                                targets: this.dishContainer,
                                y: bowlY + 4,
                                duration: 60,
                                yoyo: true,
                                ease: 'Sine.easeInOut'
                            });

                            // Toast text feedback
                            const toast = this.add.text(targetX, targetY - 24, `+ ${ing}!`, {
                                font: '800 14px Nunito',
                                fill: '#2e7d32'
                            }).setOrigin(0.5);
                            this.tweens.add({
                                targets: toast,
                                y: targetY - 48,
                                alpha: 0,
                                duration: 500,
                                ease: 'Quad.easeOut',
                                onComplete: () => toast.destroy()
                            });

                            this.ingredientsAdded++;
                            if (this.ingredientsAdded === ings.length) {
                                this.time.delayedCall(400, () => this.nextStep(2));
                            }
                        }
                    });
                }
            });

            // Spin & scale pop during throw
            this.tweens.add({
                targets: flyer,
                angle: Phaser.Math.Between(-20, 20),
                scaleX: baseScale * 1.25,
                scaleY: baseScale * 1.25,
                duration: 200,
                yoyo: true,
                ease: 'Quad.easeOut'
            });
        });
        this.containerStep1.add([btn, txt]);
    });

    // STEP 2: Spice / Seasoning / Sauce
    let step2TitleTxt = '2. CHỌN ĐỘ CAY';
    if (recipe.id === 'snack_banh_mi' || recipe.id === 'snack_ca_vien' || recipe.id === 'snack_khoai_tay') {
        step2TitleTxt = '2. THÊM TƯƠNG ỚT';
    } else if (recipe.type === 'rice') {
        step2TitleTxt = '2. GIA VỊ NÊM NẾM';
    }
    const spiceTitle = this.add.text(panelX, height/2 - 120, step2TitleTxt, { font: '900 20px Nunito', fill: '#4a3b32' }).setOrigin(0.5);
    this.containerStep2.add(spiceTitle);

    const spiceText = this.add.text(panelX, height/2 - 30, 'Cấp 0', { font: '900 36px Nunito', fill: '#c25953' }).setOrigin(0.5);
    this.containerStep2.add(spiceText);

    const spiceMinus = this.add.rectangle(panelX - 100, height/2 - 30, 50, 50, 0xfff8f2).setInteractive({ useHandCursor: true }).setStrokeStyle(3, 0x4a3b32);
    const minusTxt = this.add.text(spiceMinus.x, spiceMinus.y, '-', { font: 'bold 36px Nunito', fill: '#4a3b32' }).setOrigin(0.5);
    spiceMinus.on('pointerdown', () => {
        if (this.selectedSpice > 0) {
            this.selectedSpice--;
            spiceText.setText(`Cấp ${this.selectedSpice}`);
            this.tweens.add({ targets: [spiceMinus, minusTxt], scale: 0.8, duration: 50, yoyo: true });
            if (this.hasBroth) this.drawSoup(true, this.selectedSpice);
        }
    });

    const spicePlus = this.add.rectangle(panelX + 100, height/2 - 30, 50, 50, 0xfff8f2).setInteractive({ useHandCursor: true }).setStrokeStyle(3, 0x4a3b32);
    const plusTxt = this.add.text(spicePlus.x, spicePlus.y, '+', { font: 'bold 36px Nunito', fill: '#4a3b32' }).setOrigin(0.5);
    spicePlus.on('pointerdown', () => {
        if (this.selectedSpice < 7) {
            this.selectedSpice++;
            spiceText.setText(`Cấp ${this.selectedSpice}`);
            this.tweens.add({ targets: [spicePlus, plusTxt], scale: 0.8, duration: 50, yoyo: true });
            
            // Intensify broth color
            if (this.hasBroth) this.drawSoup(true, this.selectedSpice);

            // Pop chili flakes into bowl
            const chili = this.add.text(bowlX + Phaser.Math.Between(-30, 30), bowlY - 50, '🌶️', { font: '22px Arial' }).setOrigin(0.5);
            this.tweens.add({
                targets: chili,
                y: bowlY - 12 + Phaser.Math.Between(-6, 6),
                duration: 220,
                ease: 'Cubic.easeIn',
                onComplete: () => {
                    chili.setScale(0.85);
                    this.foodLayersContainer.add(chili);
                    chili.x = chili.x - bowlX;
                    chili.y = chili.y - bowlY;
                }
            });
        }
    });

    const spiceConfirm = this.add.rectangle(panelX, height/2 + 60, 160, 45, 0x64c48a).setInteractive({ useHandCursor: true }).setStrokeStyle(3, 0x4a3b32);
    const confirmTxt = this.add.text(panelX, height/2 + 60, 'XÁC NHẬN', { font: '900 18px Nunito', fill: '#ffffff' }).setOrigin(0.5);
    spiceConfirm.on('pointerdown', () => {
        this.tweens.add({ targets: [spiceConfirm, confirmTxt], scale: 0.9, duration: 50, yoyo: true, onComplete: () => this.nextStep(3) });
    });
    this.containerStep2.add([spiceMinus, minusTxt, spicePlus, plusTxt, spiceConfirm, confirmTxt]);

    // STEP 3: Cooking Timing
    let step3TitleTxt = '3. CANH LỬA';
    let stopBtnTxt = 'TẮT BẾP';
    if (recipe.id === 'snack_banh_mi') {
        step3TitleTxt = '3. NƯỚNG BÁNH MÌ';
        stopBtnTxt = 'LẤY BÁNH';
    } else if (recipe.id === 'snack_ca_vien' || recipe.id === 'snack_khoai_tay') {
        step3TitleTxt = '3. CANH ĐỘ GIÒN';
        stopBtnTxt = 'VỚT RA';
    } else if (recipe.type === 'rice') {
        step3TitleTxt = '3. ĐẢO CHẢO';
        stopBtnTxt = 'TẮT BẾP';
    }
    const timeTitle = this.add.text(panelX, height/2 - 120, step3TitleTxt, { font: '900 20px Nunito', fill: '#4a3b32' }).setOrigin(0.5);
    this.containerStep3.add(timeTitle);

    const barBg = this.add.rectangle(panelX, height/2 - 20, 360, 40, 0xfff8f2).setStrokeStyle(4, 0x4a3b32);
    const greenZone = this.add.rectangle(panelX, height/2 - 20, 70, 36, 0x64c48a);
    const cursor = this.add.rectangle(panelX - 170, height/2 - 20, 10, 48, 0xc25953);
    this.containerStep3.add([barBg, greenZone, cursor]);

    const stopBtn = this.add.rectangle(panelX, height/2 + 70, 160, 50, 0xe88d72).setInteractive({ useHandCursor: true }).setStrokeStyle(3, 0x4a3b32);
    const stopTxt = this.add.text(panelX, height/2 + 70, stopBtnTxt, { font: '900 20px Nunito', fill: '#ffffff' }).setOrigin(0.5);
    this.containerStep3.add([stopBtn, stopTxt]);

    let cursorTween = null;
    let stopped = false;

    stopBtn.on('pointerdown', () => {
        if (stopped) return;
        stopped = true;
        if (cursorTween) cursorTween.stop();
        this.tweens.add({ targets: [stopBtn, stopTxt], scale: 0.9, duration: 50, yoyo: true });
        
        const diff = Math.abs(cursor.x - panelX);
        if (diff <= 35) this.timingScore = 1.0;
        else if (diff <= 75) this.timingScore = 0.6;
        else this.timingScore = 0.2;
        
        this.finishNoodleOrder(recipe);
    });

    this.startTiming = () => {
        cursorTween = this.tweens.add({
            targets: cursor, x: panelX + 170, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });
    };
  }

  nextStep(step) {
    this.noodleStep = step;
    if (step === 2) {
        this.containerStep1.setVisible(false);
        this.containerStep2.setVisible(true);
    } else if (step === 3) {
        this.containerStep2.setVisible(false);
        this.containerStep3.setVisible(true);
        this.startTiming();

        // Steaming hot noodle effect!
        const bowlX = this.cameras.main.width/2 - 220;
        const bowlY = this.dishBaseY || (this.cameras.main.height/2 + 95);
        this.steamTimer = this.time.addEvent({
            delay: 300,
            loop: true,
            callback: () => {
                if (!this.dishContainer || !this.dishContainer.active) return;
                const puff = this.add.circle(
                    bowlX + Phaser.Math.Between(-35, 35),
                    bowlY - 22,
                    Phaser.Math.Between(5, 9),
                    0xffffff,
                    0.4
                );
                this.tweens.add({
                    targets: puff,
                    y: puff.y - 48,
                    x: puff.x + Phaser.Math.Between(-15, 15),
                    scale: 2.2,
                    alpha: 0,
                    duration: 1000,
                    ease: 'Sine.easeOut',
                    onComplete: () => puff.destroy()
                });
            }
        });
    }
  }

  finishNoodleOrder(recipe) {
    if (this.steamTimer) {
        this.steamTimer.remove();
        this.steamTimer = null;
    }
    let qualityMod = this.timingScore;
    if (this.customer) {
        const spiceDiff = Math.abs(this.selectedSpice - this.targetSpice);
        if (spiceDiff === 0) qualityMod *= 1.2;
        else if (spiceDiff === 1) qualityMod *= 0.8;
        else if (spiceDiff >= 2) qualityMod *= 0.4;
    }

    this.add.text(this.cameras.main.width/2, this.cameras.main.height/2 + 120, 
        (qualityMod >= 1.0) ? 'THÀNH CÔNG RỰC RỠ!' : (qualityMod >= 0.5 ? 'KHÁ ỔN' : 'TỆ QUÁ!'), {
        font: '900 28px Nunito', fill: qualityMod >= 1.0 ? '#64c48a' : (qualityMod >= 0.5 ? '#f1c40f' : '#c25953')
    }).setOrigin(0.5);

    this.time.delayedCall(1500, () => {
        this.completeOrder(recipe, qualityMod);
    });
  }

  // --- RICE MINIGAME ---
  createRiceMinigame(width, height, recipe) {
    // Spam click to stir fry, keep bar high but don't let it overflow
    this.add.text(width/2, height/2 - 140, 'Đảo chảo liên tục để giữ lửa (Đừng để quá nhiệt)!', { font: 'bold 20px Nunito', fill: '#4a3b32' }).setOrigin(0.5);

    const barBg = this.add.rectangle(width/2, height/2 - 40, 400, 40, 0xfff8f2).setStrokeStyle(4, 0x4a3b32);
    const fill = this.add.rectangle(width/2 - 198, height/2 - 40, 0, 36, 0xe88d72).setOrigin(0, 0.5);
    const targetZone = this.add.rectangle(width/2 + 50, height/2 - 40, 80, 44).setStrokeStyle(4, 0x64c48a); // Optimal zone

    const stirBtn = this.add.rectangle(width/2, height/2 + 60, 200, 60, 0xf1c40f).setInteractive({ useHandCursor: true }).setStrokeStyle(3, 0x4a3b32);
    const stirTxt = this.add.text(width/2, height/2 + 60, 'ĐẢO CHẢO!', { font: '900 24px Nunito', fill: '#4a3b32' }).setOrigin(0.5);

    let heat = 0;
    let playing = true;
    let score = 0;

    const heatTimer = this.time.addEvent({
        delay: 50,
        loop: true,
        callback: () => {
            if (!playing) return;
            heat -= 1; // Cool down naturally
            if (heat < 0) heat = 0;
            fill.width = (heat / 100) * 396;
            
            // Gain score if in optimal zone
            if (heat >= 60 && heat <= 85) {
                score += 1;
                targetZone.setStrokeStyle(4, 0xffff00);
            } else {
                targetZone.setStrokeStyle(4, 0x64c48a);
            }
            if (heat > 100) {
                // Overheat = burn
                heat = 100;
                score -= 2;
            }
        }
    });

    stirBtn.on('pointerdown', () => {
        if (!playing) return;
        heat += 15;
        this.tweens.add({ targets: [stirBtn, stirTxt], scale: 0.9, duration: 50, yoyo: true });
    });

    // Minigame lasts 5 seconds
    this.time.delayedCall(5000, () => {
        playing = false;
        heatTimer.remove();
        stirBtn.disableInteractive();
        
        let qualityMod = 0.5;
        if (score > 50) qualityMod = 1.2;
        else if (score > 30) qualityMod = 1.0;
        else if (score > 10) qualityMod = 0.8;

        this.add.text(width/2, height/2 + 130, 
            (qualityMod >= 1.0) ? 'THƠM NGON MỜI BẠN ĂN NHA!' : 'HƠI CHÁY CHÚT THÔI', {
            font: '900 24px Nunito', fill: qualityMod >= 1.0 ? '#64c48a' : '#c25953'
        }).setOrigin(0.5);

        this.time.delayedCall(1500, () => {
            this.completeOrder(recipe, qualityMod);
        });
    });
  }

  completeOrder(recipe, qualityMod) {
    // Consume ingredients
    const req = this.getRequiredIngredients(recipe, this.drinkOrder);
    this.consumeIngredients(req);

    // Always add mastery
    this.gameScene.masterySystem.addMastery(recipe.id, 1);

    if (this.customer) {
        if (this.customer.foodBubble) {
            this.customer.foodBubble.bg?.destroy();
            this.customer.foodBubble.txt?.destroy();
            this.customer.foodBubble = null;
        }
        
        const finalEarn = Math.floor(recipe.basePrice * qualityMod);
        this.gameScene.economy.addMoney(finalEarn);
        this.gameScene.showFloatText(this.customer.sprite.x, this.customer.sprite.y - 40, `+${this.gameScene.formatMoney(finalEarn)}`, '#64c48a');
        
        if (this.gameScene.dailyObjectives) {
            if (recipe.type === RECIPE_TYPES.NOODLE) this.gameScene.dailyObjectives.trackProgress('noodles_cooked', 1);
            else if (recipe.type === RECIPE_TYPES.DRINK) this.gameScene.dailyObjectives.trackProgress('drinks_served', 1);
        }
        
        let repChange = 0;
        if (qualityMod >= 1.0) repChange = 0.05;
        else if (qualityMod < 0.5) repChange = -0.05;
        this.gameScene.reputation = Phaser.Math.Clamp((this.gameScene.reputation ?? 0) + repChange, 0, 5);

        this.customer.state = 'PLAYING';
    } else {
        // Menu practice
        this.gameScene.showFloatText(this.gameScene.kitchenDesk.x, this.gameScene.kitchenDesk.y - 40, `+1 Thành thạo ${recipe.name}`, '#f1c40f');
    }
    
    this.scene.resume('Game');
    this.scene.stop();
  }
}
