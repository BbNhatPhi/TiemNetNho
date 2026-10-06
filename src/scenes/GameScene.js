import Phaser from 'phaser';
import EconomySystem from '../systems/EconomySystem';
import DaySystem from '../systems/DaySystem';
import SaveSystem from '../systems/SaveSystem';
import EventSystem from '../systems/EventSystem';
import AchievementSystem from '../systems/AchievementSystem';
import DailyObjectiveSystem from '../systems/DailyObjectiveSystem';
import { GAME_CONSTANTS, PC_STATES, CUSTOMER_STATES } from '../utils/constants';
import { PC_TIERS, PC_PARTS, calculatePCStats } from '../data/computers';
import { CUSTOMER_TYPES } from '../data/customers';
import { SHOP_UPGRADES } from '../data/upgrades';
import { INGREDIENTS } from '../data/ingredients';
import { RECIPES } from '../data/recipes';
import Player from '../entities/Player';
import InteractionSystem from '../systems/InteractionSystem';
import TaskSystem from '../systems/TaskSystem';
import InteractiveTask from '../systems/InteractiveTask';
import MasterySystem from '../systems/MasterySystem';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  init(data) {
    this.loadSave = data.loadSave || false;
  }

  create() {
    this.cameras.main.fadeIn(500, 0, 0, 0);

    // ---- Default state ----
    this.economy = new EconomySystem(GAME_CONSTANTS.STARTING_MONEY, this);
    this.reputation = GAME_CONSTANTS.STARTING_REPUTATION;
    this.day = 1;
    this.pcConfigs = [];
    this.upgrades = [];
    this.stats = { totalCustomers: 0, totalEvents: 0, totalSpent: 0, maxPcCount: 0, cardsSold: 0, cardsRevenue: 0, cryptoMined: 0 };

    // ---- Load save ----
    if (this.loadSave) {
      const raw = SaveSystem.load();
      const saveData = SaveSystem.migrate(raw);
      if (saveData) {
        this.economy.money = saveData.money;
        this.reputation = saveData.reputation ?? GAME_CONSTANTS.STARTING_REPUTATION;
        this.day = saveData.day ?? 1;
        this.pcConfigs = saveData.pcs || [];
        this.upgrades = saveData.upgrades || [];
        this.stats = saveData.stats || this.stats;
        this.inventory = saveData.inventory || {};
      } else {
        // Invalid save — start fresh but preserve achievements
        console.warn('Invalid save detected, starting new game');
        this.inventory = {};
      }
    } else {
        this.inventory = {};
    }

    // Default PCs if none saved
    if (this.pcConfigs.length === 0) {
      this.pcConfigs.push({ id: 0, parts: { cpu: 1, gpu: 1, ram: 1, monitor: 1, network: 1 }, x: 250, y: 350 });
      this.pcConfigs.push({ id: 1, parts: { cpu: 1, gpu: 1, ram: 1, monitor: 1, network: 1 }, x: 400, y: 350 });
    }

    this.pcs = [];
    this.customers = [];
    this.cashierQueue = [];

    // Physics static group for collisions
    this.walls = this.physics.add.staticGroup();

    // Background outside
    this.cameras.main.setBackgroundColor('#faf6f0');

    // Depth sorting layers
    this.layerFloor = this.add.layer();
    this.layerDecor = this.add.layer();
    this.layerCharactersBehind = this.add.layer();
    this.layerFurniture = this.add.layer();
    this.layerCharacters = this.add.layer();
    this.layerEffects = this.add.layer();
    this.layerUI = this.add.layer();
    this.layerUI.setDepth(100);

    // Player (hidden, used as reference point for some calculations)
    this.player = new Player(this, 500, 400, 'char_player');
    this.layerCharacters.add(this.player);
    this.player.setVisible(false);
    this.player.body.enable = false;
    this.player.x = 600;
    this.player.y = 300;
    this.player.hasFood = false;

    // Interaction and Task Systems
    this.interactionSystem = new InteractionSystem(this, this.player);
    this.taskSystem = new TaskSystem(this);

    this.createShopInterior();
    this.createDecorations();
    this.createLighting();
    this.createHUD();
    this.createBottomUI();

    this.daySystem = new DaySystem(this, () => this.handleDayEnd());
    this.eventSystem = new EventSystem(this);
    this.achievementSystem = new AchievementSystem(this);

    // Daily objectives
    this.dailyObjectives = new DailyObjectiveSystem(this);
    this.dailyObjectives.generateObjectives(this.day);
    this.createObjectivesHUD();

    this.masterySystem = new MasterySystem(this);

    // ---- Restore upgrade side-effects (no re-applying money/rep bonuses) ----
    this._restoreUpgradeState();

    this.pcConfigs.forEach((conf, index) => {
      const col = index % 5;
      const row = Math.floor(index / 5);
      conf.x = 220 + col * 175; // match ShopScene
      conf.y = 260 + row * 150; // match ShopScene
      this.addPC(conf.id, conf.parts, conf.x, conf.y);
    });

    this.startCustomerSpawner();
    this.startStaffAI();

    this.cameras.main.setZoom(1);
    this.cameras.main.setBounds(0, 0, 1280, 720);
    this.physics.world.setBounds(40, 110, 1200, 500);

    // Tutorial for first-time players (after everything is set up)
    if (!this.loadSave) {
      try {
        const tutorialDone = localStorage.getItem('tiemnetnho_tutorial_done');
        if (!tutorialDone) {
          this.time.delayedCall(500, () => {
            this.scene.launch('Tutorial', { gameScene: this });
            this.scene.pause();
          });
        }
      } catch (e) {}
    }
  }

  // Restore boolean flags from upgrades without re-applying stat bonuses
  _restoreUpgradeState() {
    if (this.upgrades.includes('ac_2hp') || this.upgrades.includes('ac_inverter')) {
      this.hasAC = true;
    }
    if (this.upgrades.includes('net_business') || this.upgrades.includes('net_fiber_pro')) {
      this.hasFastInternet = true;
    }
    if (this.upgrades.includes('food_noodle')) {
      this.hasFood = true;
    }
    if (this.upgrades.includes('food_drink')) {
      this.hasDrinks = true;
    }
    if (this.upgrades.includes('food_kitchen')) {
      this.hasKitchen = true;
    }
    if (this.upgrades.includes('food_snack')) {
      this.hasSnacks = true;
    }
    if (this.upgrades.includes('decor_vip_room')) {
      this.hasVIP = true;
    }
    if (this.upgrades.includes('service_card')) {
      this.hasCardService = true;
    }
    if (this.upgrades.includes('service_mining')) {
      this.hasMiningService = true;
    }
  }

  createShopInterior() {
    const shopX = 40;
    const shopY = 110;
    const shopW = 1200;
    const shopH = 500;

    // Floor
    const floor = this.add.tileSprite(shopX, shopY, shopW, shopH, 'floor').setOrigin(0);
    this.layerFloor.add(floor);

    // Walls
    const wallTop = this.add.tileSprite(shopX, shopY - 128, shopW, 128, 'wall').setOrigin(0);
    this.layerFloor.add(wallTop);
    const shadowTop = this.add.rectangle(shopX, shopY, shopW, 20, 0x4a3b32, 0.15).setOrigin(0);
    this.layerFloor.add(shadowTop);

    // Collision for top wall
    const wallCollider = this.add.rectangle(shopX + shopW / 2, shopY - 10, shopW, 20);
    this.physics.add.existing(wallCollider, true);
    this.walls.add(wallCollider);

    // Entrance (Cửa ra vào & Thảm chào mừng)
    const entranceX = 120;
    const entranceY = shopY + shopH - 12;

    // Warm floor light coming through the doorway
    const doorLight = this.add.ellipse(entranceX, entranceY - 25, 170, 50, 0xfff2df, 0.35);
    this.layerFloor.add(doorLight);

    // Welcome door mat
    const doorMat = this.add.image(entranceX, entranceY - 26, 'door_mat').setScale(0.85);
    this.layerFloor.add(doorMat);

    // Entrance glass doors assembly
    const entranceDoor = this.add.image(entranceX, entranceY + 6, 'entrance_door').setOrigin(0.5, 0.7);
    this.layerFurniture.add(entranceDoor);

    // Decorative entrance plant
    const doorPlant = this.add.image(shopX + 26, entranceY - 30, 'plant').setScale(0.85);
    this.layerDecor.add(doorPlant);

    // Cashier (Quầy Thu Ngân)
    const cashierX = shopX + 1000;
    const cashierY = shopY + 80;

    const cashierShadow = this.add.ellipse(cashierX, cashierY + 45, 170, 24, 0x4a3b32, 0.2);
    this.layerFloor.add(cashierShadow);

    const cashierDesk = this.add.image(cashierX, cashierY, 'cashier').setOrigin(0.5);
    this.layerFurniture.add([cashierDesk]);
    this.physics.add.existing(cashierDesk, true);
    if (cashierDesk.body) {
      cashierDesk.body.setSize(160, 50).setOffset(10, 30);
    }
    this.walls.add(cashierDesk);
    this.cashierDesk = cashierDesk;

    // Stylish signboard badge
    const cashierSignBg = this.add.nineslice(cashierX, cashierY - 65, 'ui_panel', 0, 130, 32, 10, 10, 10, 10);
    const cashierSignTxt = this.add.text(cashierX, cashierY - 65, '💰 THU NGÂN', {
      font: '900 13.5px Nunito', fill: '#c25953'
    }).setOrigin(0.5);
    this.layerDecor.add([cashierSignBg, cashierSignTxt]);

    cashierDesk.setInteractive({ useHandCursor: true });
    cashierDesk.on('pointerover', () => {
      this.tweens.add({ targets: cashierDesk, scale: 1.03, duration: 100 });
      cashierSignBg.setTint(0xffede1);
    });
    cashierDesk.on('pointerout', () => {
      this.tweens.add({ targets: cashierDesk, scale: 1.0, duration: 100 });
      cashierSignBg.clearTint();
    });
    cashierDesk.on('pointerdown', () => {
      if (this.cashierQueue.length > 0) {
        const firstCust = this.cashierQueue[0];
        if (firstCust.state === 'WAITING_TO_PAY') {
          this.scene.launch('Cashier', { gameScene: this, customer: firstCust });
          return;
        }
      }
      this.scene.launch('Shop', { gameScene: this });
    });

    cashierDesk.canInteract = true;
    cashierDesk.interactionRange = 100;
    cashierDesk.promptText = 'CỬA HÀNG';
    cashierDesk.onInteract = () => {
      this.scene.launch('Shop', { gameScene: this });
    };
    this.interactionSystem.addObject(cashierDesk);

    // Kitchen Counter (Quầy Bếp & Pha Chế)
    const kitchenX = shopX + 1000;
    const kitchenY = shopY + 225;

    const kitchenShadow = this.add.ellipse(kitchenX, kitchenY + 45, 170, 24, 0x4a3b32, 0.2);
    this.layerFloor.add(kitchenShadow);

    const kitchenDesk = this.add.image(kitchenX, kitchenY, 'kitchen').setOrigin(0.5);
    this.layerFurniture.add([kitchenDesk]);
    this.physics.add.existing(kitchenDesk, true);
    if (kitchenDesk.body) {
      kitchenDesk.body.setSize(160, 50).setOffset(10, 30);
    }
    this.walls.add(kitchenDesk);

    // Stylish signboard badge
    const kitchenSignBg = this.add.nineslice(kitchenX, kitchenY - 65, 'ui_panel', 0, 150, 32, 10, 10, 10, 10);
    const kitchenSignTxt = this.add.text(kitchenX, kitchenY - 65, '🍳 BẾP & PHA CHẾ', {
      font: '900 13.5px Nunito', fill: '#c25953'
    }).setOrigin(0.5);
    this.layerDecor.add([kitchenSignBg, kitchenSignTxt]);

    kitchenDesk.setInteractive({ useHandCursor: true });
    kitchenDesk.on('pointerover', () => {
      this.tweens.add({ targets: kitchenDesk, scale: 1.03, duration: 100 });
      kitchenSignBg.setTint(0xffede1);
    });
    kitchenDesk.on('pointerout', () => {
      this.tweens.add({ targets: kitchenDesk, scale: 1.0, duration: 100 });
      kitchenSignBg.clearTint();
    });
    kitchenDesk.on('pointerdown', () => {
      this.scene.launch('Kitchen', { gameScene: this });
    });

    kitchenDesk.canInteract = true;
    kitchenDesk.interactionRange = 100;
    kitchenDesk.promptText = 'BẾP / PHA CHẾ';
    kitchenDesk.onInteract = () => {
      this.scene.launch('Kitchen', { gameScene: this });
    };
    this.kitchenDesk = kitchenDesk;
    this.interactionSystem.addObject(kitchenDesk);

    // Subtle steam effect rising from kitchen stove
    this.createKitchenSteam(kitchenX - 56, kitchenY - 36);

    // Router Station (Trạm Modem Mạng Gaming)
    this.createRouterStation(shopX, shopY);
  }

  createKitchenSteam(x, y) {
    this.time.addEvent({
      delay: 700,
      loop: true,
      callback: () => {
        if (!this.scene.isActive('Game')) return;
        const puff = this.add.circle(x + Phaser.Math.Between(-6, 6), y, Phaser.Math.Between(3, 6), 0xffffff, 0.4);
        this.layerEffects.add(puff);
        this.tweens.add({
          targets: puff,
          y: y - 26,
          x: puff.x + Phaser.Math.Between(-4, 4),
          scale: 1.8,
          alpha: 0,
          duration: 1300,
          ease: 'Sine.easeOut',
          onComplete: () => puff.destroy()
        });
      }
    });
  }

  createRouterStation(shopX, shopY) {
    const rx = shopX + 1125;
    const ry = shopY + 65;

    // 1. Cute Wooden Wall Shelf (Matching the wooden trim of cashier counter)
    const shelfShadow = this.add.ellipse(rx, ry + 18, 62, 10, 0x4a3b32, 0.18);
    const shelf = this.add.rectangle(rx, ry + 14, 58, 8, 0xe8cfb5).setOrigin(0.5);
    shelf.setStrokeStyle(2, 0x4a3b32);

    // Cute small wooden brackets underneath
    const bracketL = this.add.rectangle(rx - 18, ry + 19, 3, 6, 0xc9aa8b);
    bracketL.setStrokeStyle(1.5, 0x4a3b32);
    const bracketR = this.add.rectangle(rx + 18, ry + 19, 3, 6, 0xc9aa8b);
    bracketR.setStrokeStyle(1.5, 0x4a3b32);

    this.layerDecor.add([shelfShadow, shelf, bracketL, bracketR]);

    // 2. Main Router Sprite (Clean cartoon style matching the game)
    const router = this.add.image(rx, ry, 'router').setOrigin(0.5);
    this.layerFurniture.add(router);
    this.physics.add.existing(router, true);
    if (router.body) {
      router.body.setSize(50, 35).setOffset(3, 8);
    }
    this.walls.add(router);

    // 3. Subtle status indicator light
    const routerGlow = this.add.circle(rx + 9, ry + 8, 2.2, 0x64c48a, 1);
    this.layerFurniture.add(routerGlow);

    this.tweens.add({
      targets: routerGlow,
      alpha: { from: 0.35, to: 1 },
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    // 4. OFFLINE Alert Warning Bubble (Only shows when disconnected)
    const alertBubble = this.add.text(rx, ry - 22, '⚠️', {
      font: '16px Arial'
    }).setOrigin(0.5);
    alertBubble.setVisible(false);
    this.layerEffects.add(alertBubble);

    this.tweens.add({
      targets: alertBubble,
      y: ry - 26,
      duration: 450,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // State object for Game & Events
    this.router = {
      obj: router,
      glow: routerGlow,
      state: 'ONLINE',
      alertBubble: alertBubble
    };

    // 5. Direct Mouse Click & Hover
    router.setInteractive({ useHandCursor: true });
    router.on('pointerover', () => {
      this.tweens.add({ targets: router, scale: 1.08, duration: 100 });
    });
    router.on('pointerout', () => {
      this.tweens.add({ targets: router, scale: 1.0, duration: 100 });
    });
    router.on('pointerdown', () => {
      if (this.router.state === 'OFFLINE') {
        this.restartRouterTask(router);
      } else {
        this.showFloatText(rx, ry - 20, 'Wi-Fi ổn định ✓', '#2e7d32');
      }
    });

    // 6. Player walking interaction
    router.canInteract = false;
    router.interactionRange = 85;
    router.promptText = 'SỬA MẠNG';
    router.onInteract = () => {
      if (this.router.state === 'OFFLINE') {
        this.restartRouterTask(router);
      }
    };
    this.interactionSystem.addObject(router);
  }

  restartRouterTask(router) {
    if (!this.router) return;
    router.canInteract = false;
    router.promptText = '';
    const task = new InteractiveTask(this, 'restart_router', 'KHỞI ĐỘNG LẠI MODEM', 3000, () => {
      this.setRouterOnline();
    
    // Randomize crypto prices
    if (!this.stats.crypto) {
        this.stats.crypto = { balance: { BTC: 0, ETH: 0, DOGE: 0 }, selectedCoin: 'BTC' };
    }
    if (!this.stats.cryptoPrices) {
        this.stats.cryptoPrices = { BTC: 1000000, ETH: 80000, DOGE: 2000 };
    }
    this.stats.cryptoPrices.BTC = Math.floor(1000000 * (0.8 + Math.random() * 0.4));
    this.stats.cryptoPrices.ETH = Math.floor(80000 * (0.7 + Math.random() * 0.6));
    this.stats.cryptoPrices.DOGE = Math.floor(2000 * (0.5 + Math.random() * 1.0));
      this.showFloatText(router.x, router.y - 20, 'Mạng đã kết nối lại ✓', '#2e7d32');
    });
    this.taskSystem.addTask(task, router.x, router.y - 30);
  }

  setRouterOnline() {
    if (!this.router) return;
    this.router.state = 'ONLINE';
    if (this.router.glow) {
      this.router.glow.fillColor = 0x64c48a;
      this.router.glow.alpha = 1;
    }
    if (this.router.alertBubble) {
      this.router.alertBubble.setVisible(false);
    }
    if (this.router.obj) {
      this.router.obj.canInteract = false;
      this.router.obj.clearTint();
    }
  }

  setRouterOffline() {
    if (!this.router) return;
    this.router.state = 'OFFLINE';
    if (this.router.glow) {
      this.router.glow.fillColor = 0xe74c3c;
      this.router.glow.alpha = 1;
    }
    if (this.router.alertBubble) {
      this.router.alertBubble.setVisible(true);
    }
    if (this.router.obj) {
      this.router.obj.canInteract = true;
      this.router.obj.setTint(0xffaaaa);
    }
  }

  createDecorations() {
    const poster1 = this.add.image(150, 60, 'poster').setOrigin(0.5);
    const poster2 = this.add.image(1120, 60, 'poster').setOrigin(0.5).setTint(0xaaffaa);
    const plant1 = this.add.image(1250, 120, 'plant').setOrigin(0.5);
    this.layerDecor.add([poster1, poster2, plant1]);
    
    this.applyVisualUpgrades();
  }

  applyVisualUpgrades() {
    if (this.visualUpgradeObjs) {
      this.visualUpgradeObjs.forEach(obj => obj.destroy());
    }
    if (this.acTimer) this.acTimer.remove();
    this.visualUpgradeObjs = [];

    const shopX = 40;
    const shopY = 110;
    const shopW = 1200;

    // 1. AC Upgrades
    if (this.upgrades.includes('ac_inverter')) {
      const acBg = this.add.nineslice(shopX + shopW / 2, shopY + 60, 'ui_panel', 0, 160, 40, 10, 10, 10, 10).setTint(0xeeeeee);
      const acVent = this.add.rectangle(shopX + shopW / 2, shopY + 60, 120, 6, 0x444444);
      this.layerFurniture.add([acBg, acVent]);
      this.visualUpgradeObjs.push(acBg, acVent);
      
      this.acTimer = this.time.addEvent({ delay: 500, loop: true, callback: () => {
         const drop = this.add.circle(shopX + shopW / 2 + Phaser.Math.Between(-60, 60), shopY + 65, 2, 0xddffff, 0.6);
         this.layerEffects.add(drop);
         this.tweens.add({ targets: drop, y: shopY + 120, alpha: 0, duration: 1500, onComplete: () => drop.destroy() });
      }});
    } else if (this.upgrades.includes('ac_2hp')) {
      const acBg = this.add.nineslice(shopX + shopW / 2, shopY - 20, 'ui_panel', 0, 120, 35, 10, 10, 10, 10).setTint(0xffffff);
      const tempTxt = this.add.text(shopX + shopW / 2 + 35, shopY - 20, '18°', { font: 'bold 12px Arial', fill: '#00ddff' }).setOrigin(0.5);
      this.layerDecor.add([acBg, tempTxt]);
      this.visualUpgradeObjs.push(acBg, tempTxt);
    } else if (this.upgrades.includes('ac_fan')) {
      const fanBase = this.add.circle(shopX + 800, shopY + 80, 12, 0x555555);
      const fanBlades = this.add.text(shopX + 800, shopY + 80, '☢️', { fontSize: '24px' }).setOrigin(0.5);
      this.layerFurniture.add([fanBase, fanBlades]);
      this.visualUpgradeObjs.push(fanBase, fanBlades);
      this.tweens.add({ targets: fanBlades, angle: 360, duration: 500, repeat: -1 });
    }

    // 2. LED Decor

    // 3. Plants
    if (this.upgrades.includes('decor_plant')) {
      const p2 = this.add.image(shopX + 400, shopY - 10, 'plant').setOrigin(0.5);
      const p3 = this.add.image(shopX + 850, shopY + 400, 'plant').setOrigin(0.5).setScale(1.2);
      this.layerDecor.add([p2, p3]);
      this.visualUpgradeObjs.push(p2, p3);
    }

    // 4. VIP Room
    if (this.upgrades.includes('decor_vip_room')) {
      const partition = this.add.rectangle(shopX + 450, shopY + 200, 10, 400, 0x88ccff, 0.3).setOrigin(0.5);
      partition.setStrokeStyle(2, 0x555555);
      this.layerEffects.add(partition);
      
      const vipBg = this.add.rectangle(shopX + 225, shopY - 25, 120, 40, 0x000000, 0.6).setOrigin(0.5);
      const vipText = this.add.text(shopX + 225, shopY - 25, 'V I P', { font: '900 24px Arial', fill: '#ffaa00' }).setOrigin(0.5);
      this.layerDecor.add([partition, vipBg, vipText]);
      this.visualUpgradeObjs.push(partition, vipBg, vipText);
    }
    
    
    // 6. Staff Sprites
    if (this.upgrades.includes('staff_cashier')) {
       const cashierStaff = this.add.image(shopX + 1000, shopY + 15, 'char_default').setOrigin(0.5);
       this.layerCharactersBehind.add(cashierStaff);
       this.visualUpgradeObjs.push(cashierStaff);
    }
    if (this.upgrades.includes('staff_kitchen')) {
       const kitchenStaff = this.add.image(shopX + 1160, shopY - 45, 'char_default').setOrigin(0.5);
       this.layerCharactersBehind.add(kitchenStaff);
       this.visualUpgradeObjs.push(kitchenStaff);
    }

    // 5. Kitchen and Food setups
    if (this.upgrades.includes('food_noodle') && !this.upgrades.includes('food_kitchen')) {
      const pot = this.add.text(shopX + 960, shopY + 220, '🍜', { fontSize: '24px' }).setOrigin(0.5);
      this.layerFurniture.add(pot);
      this.visualUpgradeObjs.push(pot);
    }
    if (this.upgrades.includes('food_drink')) {
      const fridge = this.add.rectangle(shopX + 1150, shopY + 225, 60, 90, 0xffffff, 0.9).setOrigin(0.5);
      fridge.setStrokeStyle(3, 0xaaaaaa);
      const fridgeGlass = this.add.rectangle(shopX + 1150, shopY + 225, 40, 70, 0x88ccff, 0.5).setOrigin(0.5);
      this.layerFurniture.add([fridge, fridgeGlass]);
      this.visualUpgradeObjs.push(fridge, fridgeGlass);
    }
    if (this.upgrades.includes('food_snack')) {
      const snackStand = this.add.rectangle(shopX + 920, shopY + 225, 50, 40, 0xffddaa, 1).setOrigin(0.5);
      snackStand.setStrokeStyle(2, 0xaa7744);
      const fries = this.add.text(shopX + 920, shopY + 220, '🍟', { fontSize: '20px' }).setOrigin(0.5);
      this.layerFurniture.add([snackStand, fries]);
      this.visualUpgradeObjs.push(snackStand, fries);
    }
  }

  createLighting() {
    this.ambientLight = this.add.rectangle(0, 0, 3000, 3000, 0x4a3b32, 0.05).setOrigin(0);
    this.ambientLight.setBlendMode(Phaser.BlendModes.MULTIPLY);
    this.layerEffects.add(this.ambientLight);
  }

  createHUD() {
    const width = this.cameras.main.width;
    const panel = this.add.nineslice(width / 2, 40, 'ui_panel', 0, 800, 70, 24, 24, 24, 24);
    this.layerUI.add(panel);

    const style = { font: '700 20px Nunito', fill: '#4a3b32' };
    this.moneyText = this.add.text(width / 2 - 300, 40, `💰 ${this.formatMoney(this.economy.money)}`, { font: '800 22px Nunito', fill: '#c25953' }).setOrigin(0, 0.5);
    this.dayText = this.add.text(width / 2 - 50, 40, `📅 Ngày ${this.day}`, style).setOrigin(0.5);
    this.timeText = this.add.text(width / 2 + 120, 40, `🕒 08:00`, style).setOrigin(0.5);
    this.repText = this.add.text(width / 2 + 280, 40, `⭐ ${this.reputation.toFixed(1)}`, { font: '800 22px Nunito', fill: '#e88d72' }).setOrigin(0, 0.5);
    
    const cloudBtn = this.add.text(width / 2 + 370, 40, '☁', { font: '900 24px Nunito', fill: '#5599ff' }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    
    cloudBtn.on('pointerdown', () => {
        import('../ui/SyncUI').then(({ syncUI }) => {
            syncUI.show();
        });
    });

    this.layerUI.add([this.moneyText, this.dayText, this.timeText, this.repText, cloudBtn]);
  }


  createBottomUI() {
    const height = this.cameras.main.height;
    const width = this.cameras.main.width;
    const panel = this.add.nineslice(width / 2, height - 40, 'ui_panel', 0, 800, 70, 24, 24, 24, 24);
    this.layerUI.add(panel);

    const createBtn = (xOffset, text, callback) => {
      const btn = this.add.image(width / 2 + xOffset, height - 40, 'btn_normal').setInteractive({ useHandCursor: true });
      btn.setScale(0.85); // Scale down slightly to fit better
      const txt = this.add.text(width / 2 + xOffset, height - 40, text, { font: '800 16px Nunito', fill: '#ffffff' }).setOrigin(0.5);
      
      btn.on('pointerover', () => { btn.setTexture('btn_hover'); this.tweens.add({ targets: [btn, txt], scale: 0.85, duration: 100 }); });
      btn.on('pointerout', () => { btn.setTexture('btn_normal'); this.tweens.add({ targets: [btn, txt], scale: 0.85, duration: 100 }); });
      btn.on('pointerdown', () => { this.tweens.add({ targets: [btn, txt], scale: 0.8, duration: 50, yoyo: true, onComplete: callback }); });
      this.layerUI.add([btn, txt]);
    };

    // Use 280px spacing for wider gaps between buttons
    createBtn(-285, '🛒 CỬA HÀNG', () => { this.scene.launch('Shop', { gameScene: this }); });
    createBtn(-95, '💻 QUẢN LÝ MÁY', () => { this.scene.launch('PCManagement', { gameScene: this }); });
    createBtn(95, '📈 SÀN CRYPTO', () => { this.scene.launch('Crypto', { gameScene: this }); });
    createBtn(285, '🌙 KẾT THÚC NGÀY', () => this.daySystem.endDay());
  }

  createObjectivesHUD() {
    const width = this.cameras.main.width;
    // We place it on the left side, below the top HUD.
    this.objectivesContainer = this.add.container(20, 90);
    this.layerUI.add(this.objectivesContainer);

    this.isObjectivesOpen = true;

    // Initial render
    this.updateObjectivesHUD();
  }

  updateObjectivesHUD() {
    if (!this.objectivesContainer || !this.dailyObjectives) return;
    
    // Clear previous
    this.objectivesContainer.removeAll(true);
    
    const objectives = this.dailyObjectives.getStatus();
    if (objectives.length === 0) return;

    if (!this.isObjectivesOpen) {
      const bg = this.add.nineslice(0, 0, 'ui_panel', 0, 130, 44, 16, 16, 16, 16).setOrigin(0);
      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerdown', () => {
        this.isObjectivesOpen = true;
        this.updateObjectivesHUD();
      });
      bg.on('pointerover', () => bg.setTint(0xeaddd0));
      bg.on('pointerout', () => bg.clearTint());

      const icon = this.add.text(65, 22, '📋 MỤC TIÊU', {
        font: '800 13px Nunito', fill: '#4a3b32'
      }).setOrigin(0.5);
      this.objectivesContainer.add([bg, icon]);
      return;
    }

    // Expanded mode: width 290
    const PANEL_WIDTH = 290;

    // Create texts first to measure their heights dynamically
    const textObjects = [];
    let currentY = 46;

    objectives.forEach((obj) => {
      const isDone = obj.completed;
      const progressText = isDone ? '✓ Hoàn thành' : `${Math.min(obj.current, obj.target)}/${obj.target}`;
      const color = isDone ? '#2e7d32' : '#4a3b32';
      const bullet = isDone ? '✓' : '•';

      const txt = this.add.text(15, currentY, `${bullet} ${obj.displayName}\n  (${progressText})`, {
        font: '700 13px Nunito', fill: color, wordWrap: { width: PANEL_WIDTH - 30 }
      });
      textObjects.push(txt);
      currentY += txt.height + 10;
    });

    const panelHeight = Math.max(84, currentY + 12);

    const bg = this.add.nineslice(0, 0, 'ui_panel', 0, PANEL_WIDTH, panelHeight, 16, 16, 16, 16).setOrigin(0);
    this.objectivesContainer.add(bg);

    const title = this.add.text(15, 20, '📋 MỤC TIÊU NGÀY', {
      font: '900 15px Nunito', fill: '#c25953'
    }).setOrigin(0, 0.5);

    const toggleBtn = this.add.text(PANEL_WIDTH - 20, 20, '▲', {
      font: '800 14px Arial', fill: '#8c7a6b'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    toggleBtn.on('pointerover', () => toggleBtn.setColor('#c25953'));
    toggleBtn.on('pointerout', () => toggleBtn.setColor('#8c7a6b'));
    toggleBtn.on('pointerdown', () => {
      this.isObjectivesOpen = false;
      this.updateObjectivesHUD();
    });
    this.objectivesContainer.add([title, toggleBtn]);

    // Add texts to container after bg
    textObjects.forEach(txt => this.objectivesContainer.add(txt));
  }

  formatMoney(amount) {
    if (typeof amount !== 'number' || isNaN(amount)) return '0đ';
    return Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';
  }

  updateHUD() {
    if (this.moneyText) this.moneyText.setText(`💰 ${this.formatMoney(this.economy.money)}`);
    if (this.repText) this.repText.setText(`⭐ ${this.reputation.toFixed(1)}`);
    if (this.dayText) this.dayText.setText(`📅 Ngày ${this.day}`);
    if (this.timeText && this.daySystem) this.timeText.setText(`🕒 ${this.daySystem.getFormattedTime()}`);

    if (this.achievementSystem) {
      this.achievementSystem.checkAchievements(this.stats);
    }
  }

  addPC(id, parts, x, y) {
    if (!parts) {
      parts = { cpu: 1, gpu: 1, ram: 1, monitor: 1, network: 1 };
    }
    const pcStats = calculatePCStats(parts);
    const tier = pcStats.tier;
    const spriteKey = tier > 4 ? 'pc_5' : `pc_${tier}`;

    const shadow = this.add.ellipse(x, y + 45, 110, 40, 0x4a3b32, 0.2);
    const desk = this.add.image(x, y, 'desk').setOrigin(0.5);
    const monitor = this.add.image(x, y - 5, spriteKey).setOrigin(0.5);

    this.physics.add.existing(desk, true);
    desk.body.setSize(100, 50);
    desk.body.setOffset(20, 20);
    this.walls.add(desk);

    const glowColor = tier >= 3 ? (tier === 4 ? 0xff00ff : 0xff3366) : 0x00ffcc;
    const glow = this.add.ellipse(x, y - 10, 100, 60, glowColor, 0.0);
    glow.setBlendMode(Phaser.BlendModes.ADD);

    this.layerFurniture.add([shadow, desk, glow, monitor]);

    const pc = {
      id, tier, parts, data: pcStats, state: PC_STATES.READY,
      desk, monitor, glow, customer: null, x, y, spriteKey
    };
    this.pcs.push(pc);

    desk.canInteract = false;

    pc.glow.fillAlpha = 0.4;
    monitor.clearTint();
  }

  
  startStaffAI() {
    if (this.staffTimer) this.staffTimer.remove();
    this.staffTimer = this.time.addEvent({
      delay: 2000,
      loop: true,
      callback: () => {
        // 1. Thu ngân & Nhập hàng
        if (this.upgrades.includes('staff_cashier')) {
          // Auto pay queue
          if (this.cashierQueue.length > 0) {
            const cust = this.cashierQueue[0];
            if (cust.state === 'WAITING_TO_PAY') {
              const bill = cust.amountToPay || 0;
              this.economy.addMoney(bill);
              this.showFloatText(this.cashierDesk.x, this.cashierDesk.y - 40, `+${this.formatMoney(bill)}`, '#64c48a');
              if (cust.payBubble) {
                cust.payBubble.bg?.destroy();
                cust.payBubble.txt?.destroy();
                cust.payBubble = null;
              }
              cust.state = 'LEAVING';
              this.cashierQueue.shift();
            }
          }
          // Auto restock
          if (!this.inventory) this.inventory = {};
          
          for (const key in INGREDIENTS) {
            if ((this.inventory[key] || 0) <= 0) {
              const packCost = INGREDIENTS[key].cost * 10;
              if (this.economy.money >= packCost) {
                this.economy.spendMoney(packCost);
                this.inventory[key] = 10;
                this.showFloatText(this.cashierDesk.x, this.cashierDesk.y - 60, `- Nhập ${key}!`, '#c25953');
                this.updateHUD();
              }
            }
          }
        }
        
        
        // Cashier Staff auto sell cards
        if (this.upgrades.includes('staff_cashier')) {
          this.customers.forEach(cust => {
             if (cust.state === 'REQUESTING' && cust.orderType === 'card' && cust.foodBubble) {
                 const profit = Math.floor(Math.random() * 41 + 10) * 1000;
                 this.economy.addMoney(profit);
                 this.stats.cardsSold = (this.stats.cardsSold || 0) + 1;
                 this.stats.cardsRevenue = (this.stats.cardsRevenue || 0) + profit;
                 this.showFloatText(cust.sprite.x, cust.sprite.y - 40, `+${this.formatMoney(profit)}`, '#2e7d32');
                 
                 cust.foodBubble.bg?.destroy();
                 cust.foodBubble.txt?.destroy();
                 cust.foodBubble = null;
                 cust.state = 'PLAYING';
             }
          });
        }

        // 2. Bếp & Pha chế
        if (this.upgrades.includes('staff_kitchen')) {
          this.customers.forEach(cust => {
             if (cust.state === 'REQUESTING' && cust.foodBubble) {
                 
                 const recipe = RECIPES.find(r => r.id === cust.recipeId);
                 if (recipe) {
                     // Try to auto consume ingredients if possible (simple version: just give the base price profit)
                     const profit = recipe.basePrice || 15000;
                     this.economy.addMoney(profit);
                     this.showFloatText(cust.targetPC.x, cust.targetPC.y - 70, `+${this.formatMoney(profit)}`, '#64c48a');
                     
                     // Play cooking effect
                     const steam = this.add.circle(this.kitchenDesk.x, this.kitchenDesk.y - 30, 10, 0xffffff, 0.5);
                     this.tweens.add({ targets: steam, y: steam.y - 30, alpha: 0, scale: 2, duration: 800, onComplete: () => steam.destroy() });

                     cust.foodBubble.bg?.destroy();
                     cust.foodBubble.txt?.destroy();
                     cust.foodBubble = null;
                     cust.state = 'PLAYING';
                 }
             }
          });
        }
      }
    });
  }

  startCustomerSpawner() {
    if (this.customerTimer) this.customerTimer.remove();
    const baseDelay = 6000;
    const delay = Math.max(2000, baseDelay - (this.reputation * 1000));
    this.customerTimer = this.time.addEvent({ delay, callback: this.spawnCustomer, callbackScope: this, loop: true });
  }

  spawnCustomer() {
    if (!this.daySystem.isDayActive) return;
    if (this.pcs.filter(pc => pc.state !== PC_STATES.OCCUPIED).length === 0) return;

    const rand = Math.random() * 100;
    let acc = 0, type = CUSTOMER_TYPES[0];
    for (let t of CUSTOMER_TYPES) {
      acc += t.spawnWeight;
      if (rand <= acc) { type = t; break; }
    }

    const startX = 120;
    const startY = 640;
    let spriteKey = 'char_default';
    if (type.id === 'student_kid' || type.id === 'student_high') spriteKey = 'char_student';
    if (type.id === 'tryhard_gamer') spriteKey = 'char_gamer';

    const shadow = this.add.ellipse(startX, startY + 30, 30, 10, 0x4a3b32, 0.2);
    const customerSprite = this.add.image(startX, startY, spriteKey);
    this.layerCharacters.add([shadow, customerSprite]);

    const customer = {
      data: type, sprite: customerSprite, shadow,
      state: CUSTOMER_STATES.ENTERING,
      targetPC: null,
      playTimeLeft: type.playDurationMin + Math.random() * (type.playDurationMax - type.playDurationMin),
      patience: type.patience,
      foodBubble: null,
      orderType: null
    };
    this.customers.push(customer);
    this.stats.totalCustomers++;
  }

  showFloatText(x, y, text, color = '#4dffda') {
    const floatText = this.add.text(x, y, text, { font: 'bold 24px Nunito', fill: color }).setOrigin(0.5);
    floatText.setStroke('#1a1a24', 4);
    this.layerUI.add(floatText);
    this.tweens.add({ targets: floatText, y: y - 60, alpha: 0, duration: 2000, ease: 'Cubic.easeOut', onComplete: () => floatText.destroy() });
  }

  // Remove a random playing customer (for events)
  kickRandomCustomer() {
    const playingCusts = this.customers.filter(c => c.state === CUSTOMER_STATES.PLAYING || c.state === CUSTOMER_STATES.REQUESTING);
    if (playingCusts.length === 0) return;
    const target = playingCusts[Math.floor(Math.random() * playingCusts.length)];
    this._cleanupCustomer(target, false);
    target.state = CUSTOMER_STATES.LEAVING;
  }

  // Clean up a customer's PC, food bubble, pay bubble references
  _cleanupCustomer(cust, collectPayment = false) {
    if (cust.targetPC) {
      const pc = cust.targetPC;
      if (collectPayment && pc.data) {
        const modifier = pc.tier < cust.data.preferredPCLevel ? 0.8 : 1;
        const earn = Math.floor(2 * pc.data.hourlyRate * modifier);
        this.economy.addMoney(earn);
      }
      pc.state = PC_STATES.DIRTY;
      pc.glow.fillAlpha = 0;
      pc.customer = null;
      cust.targetPC = null;
    }
    if (cust.foodBubble) {
      try { cust.foodBubble.bg?.destroy(); cust.foodBubble.txt?.destroy(); } catch (e) {}
      cust.foodBubble = null;
    }
    if (cust.payBubble) {
      try { cust.payBubble.bg?.destroy(); cust.payBubble.txt?.destroy(); } catch (e) {}
      cust.payBubble = null;
    }
  }

  forceAllCustomersLeave() {
    // Clear cashier queue
    this.cashierQueue.forEach(cust => {
      this._cleanupCustomer(cust, false);
    });
    this.cashierQueue = [];

    this.customers.forEach(cust => {
      this._cleanupCustomer(cust, false);
      try { cust.sprite?.destroy(); cust.shadow?.destroy(); } catch (e) {}
    });
    this.customers = [];

    this.pcs.forEach(pc => {
      pc.state = PC_STATES.OFF;
      if (pc.monitor) pc.monitor.setTint(0x555555);
      if (pc.glow) pc.glow.fillAlpha = 0;
      pc.customer = null;
    });

    // Reset kitchen
    if (this.kitchenDesk) {
      this.kitchenDesk.canInteract = true;
      this.kitchenDesk.promptText = 'BẾP / PHA CHẾ';
    }

    // Reset cashier
    if (this.cashierDesk) {
      this.cashierDesk.canInteract = true;
      this.cashierDesk.promptText = 'CỬA HÀNG';
      this.cashierDesk.onInteract = () => {
        this.scene.launch('Shop', { gameScene: this });
      };
    }
  }

  handleDayEnd() {
    if (this.customerTimer) this.customerTimer.remove();
    if (this.eventSystem) this.eventSystem.destroy();

    // Collect earnings from still-playing customers before they leave
    this.customers.forEach(cust => {
      if (cust.state === CUSTOMER_STATES.PLAYING || cust.state === CUSTOMER_STATES.REQUESTING) {
        this._cleanupCustomer(cust, true);
      }
    });
    this.forceAllCustomersLeave();

    // Calculate expenses THEN save (so save reflects post-expense balance)
    let dailyElectricity = 0;
    this.pcs.forEach(pc => { dailyElectricity += pc.data.powerConsumption * 1500; });
    const totalExpenses = dailyElectricity + 50000;
    this.economy.addExpense(totalExpenses); // This deducts from money

    const revenue = this.economy.dailyRevenue;
    const profit = revenue - totalExpenses;

    this.updateHUD();
    this.saveGame(); // Save AFTER expenses are deducted

    this.scene.launch('Summary', {
      day: this.day,
      revenue: revenue,
      expenses: totalExpenses,
      profit: profit,
      reputation: this.reputation,
      gameScene: this
    });
    this.scene.pause();
  }

  saveGame() {
    const pcConfigs = this.pcs.map(pc => ({ id: pc.id, tier: pc.tier, parts: pc.parts, x: pc.x, y: pc.y }));
    const achievements = this.achievementSystem ? this.achievementSystem.unlocked : SaveSystem.loadAchievements();
    SaveSystem.save({
      money: this.economy.money,
      day: this.day,
      reputation: this.reputation,
      pcs: pcConfigs,
      upgrades: this.upgrades,
      stats: this.stats,
      inventory: this.inventory || {},
      achievements
    });
  }

  startNextDay() {
    this.day++;
    this.economy.resetDailyStats();
    this.daySystem = new DaySystem(this, () => this.handleDayEnd());
    this.eventSystem = new EventSystem(this);

    // Turn all PCs back on for new day
    this.pcs.forEach(pc => {
      pc.state = PC_STATES.READY;
      if (pc.monitor) pc.monitor.clearTint();
      if (pc.glow) pc.glow.fillAlpha = 0.4;
    });

    this.setRouterOnline();

    this.updateHUD();
    this.startCustomerSpawner();
    this.saveGame();
  }

  update(time, delta) {
    if (this.daySystem) this.daySystem.update(delta);
    this.updateHUD();

    if (this.interactionSystem) this.interactionSystem.update();
    if (this.taskSystem) this.taskSystem.update(delta);

    // Sync router offline alert if triggered by events
    if (this.router && this.router.state === 'OFFLINE' && this.router.alertBubble && !this.router.alertBubble.visible) {
      this.setRouterOffline();
    }

    // Passive mining income
    
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
          let totalValueMined = 0;
          
          if (!this.stats.crypto) {
              this.stats.crypto = { balance: { BTC: 0, ETH: 0, DOGE: 0 }, selectedCoin: 'BTC' };
          }
          if (!this.stats.cryptoPrices) {
              this.stats.cryptoPrices = { BTC: 1000000, ETH: 80000, DOGE: 2000 };
          }
          
          const coin = this.stats.crypto.selectedCoin;
          const price = this.stats.cryptoPrices[coin];
          const colors = { BTC: '#f1c40f', ETH: '#9b59b6', DOGE: '#e67e22' };
          const symbols = { BTC: '₿', ETH: 'Ξ', DOGE: 'Ð' };
          
          this.pcs.forEach(pc => {
            if (pc.state === PC_STATES.READY) {
              const tickEarn = 150 * (pc.tier || 1) * miningLevel;
              totalValueMined += tickEarn;
              
              if (Math.random() < 0.4) {
                  const floatText = this.add.text(pc.x, pc.y - 30, `+${symbols[coin]}`, { font: 'bold 16px Nunito', fill: colors[coin] }).setOrigin(0.5);
                  this.layerUI.add(floatText);
                  this.tweens.add({ targets: floatText, y: pc.y - 50, alpha: 0, duration: 1000, onComplete: () => floatText.destroy() });
              }
            }
          });
          
          if (totalValueMined > 0) {
            const amountMined = totalValueMined / price;
            this.stats.crypto.balance[coin] += amountMined;
            this.stats.cryptoMined = (this.stats.cryptoMined || 0) + totalValueMined;
          }
        }
      }

    for (let i = this.customers.length - 1; i >= 0; i--) {
      const cust = this.customers[i];

      switch (cust.state) {
        case CUSTOMER_STATES.ENTERING:
          cust.state = CUSTOMER_STATES.LOOKING_FOR_PC;
          break;

        case CUSTOMER_STATES.LOOKING_FOR_PC: {
          const emptyPCs = this.pcs.filter(pc => pc.state === PC_STATES.READY);
          const targetPC = emptyPCs.find(pc => pc.tier >= cust.data.preferredPCLevel) || emptyPCs[0];

          if (targetPC) {
            targetPC.state = PC_STATES.OCCUPIED;
            targetPC.customer = cust;
            targetPC.glow.fillAlpha = 0.2;
            cust.targetPC = targetPC;
            cust.state = CUSTOMER_STATES.WAITING;

            this.tweens.add({
              targets: [cust.sprite, cust.shadow],
              x: targetPC.x,
              y: targetPC.y - 5,
              duration: 2000,
              ease: 'Sine.easeInOut',
              onUpdate: () => {
                if (cust.sprite?.active) {
                  cust.sprite.y = cust.shadow.y - 20 - Math.abs(Math.sin(this.time.now / 150)) * 10;
                }
              },
              onComplete: () => {
                if (!cust.sprite?.active) return;
                cust.sprite.y = cust.shadow.y - 20;
                cust.state = CUSTOMER_STATES.PLAYING;
                this.layerCharacters.remove(cust.sprite);
                this.layerCharacters.remove(cust.shadow);
                this.layerCharactersBehind.add([cust.shadow, cust.sprite]);
              }
            });
          } else {
            this.showFloatText(cust.sprite.x, cust.sprite.y - 20, 'Hết máy...', '#e88d72');
            cust.state = CUSTOMER_STATES.LEAVING;
            if (this.dailyObjectives) this.dailyObjectives.trackProgress('no_lost_customers', 1); // Track failure
          }
          break;
        }

        case CUSTOMER_STATES.PLAYING: {
          if (this.router?.state === 'OFFLINE') {
            cust.playTimeLeft -= delta * 5;
            if (Math.random() < 0.05) {
              this.showFloatText(cust.sprite.x, cust.sprite.y - 30, 'Mạng lag quá!!', '#ff5555');
            }
          } else {
            cust.playTimeLeft -= delta;
          }

          // Randomly trigger food order
          const wantsFood = cust.data.foodPreference && cust.data.foodPreference !== 'none';
          if (!cust.foodBubble && wantsFood && Math.random() < 0.001) {
            const unlockedRecipes = this.masterySystem.getUnlockedRecipes();
            let validRecipes = unlockedRecipes.filter(r => r.type === cust.data.foodPreference);
            
            if (validRecipes.length === 0) {
              validRecipes = unlockedRecipes; // fallback to anything available
            }

            if (validRecipes.length > 0) {
              const chosen = validRecipes[Math.floor(Math.random() * validRecipes.length)];
              cust.state = CUSTOMER_STATES.REQUESTING;
              cust.orderType = chosen.type;
              cust.recipeId = chosen.id;

              const bubble = this.add.nineslice(cust.sprite.x + 30, cust.sprite.y - 40, 'ui_panel', 0, 70, 40, 10, 10, 10, 10);
              let bubbleEmoji = '🍔';
              if (chosen.type === 'noodle') bubbleEmoji = '🍜';
              if (chosen.type === 'drink') bubbleEmoji = '🍹';
              if (chosen.type === 'rice') bubbleEmoji = '🍛';
              if (chosen.type === 'snack') bubbleEmoji = '🍟';
              
              if (chosen.type === 'noodle') {
                  cust.spiceLevel = Phaser.Math.Between(0, cust.data.spiceTolerance || 0);
              }
              if (chosen.type === 'drink') {
                  cust.drinkSize = Math.random() > 0.5 ? 'M' : 'L';
                  cust.drinkSugar = [0, 50, 100][Phaser.Math.Between(0, 2)];
                  cust.drinkIce = [0, 50, 100][Phaser.Math.Between(0, 2)];
                  cust.drinkTopping = ['Không', 'Trân châu trắng', 'Thạch trái cây'][Phaser.Math.Between(0, 2)];
              }
              const txtStr = chosen.type === 'noodle' ? `${bubbleEmoji} lv${cust.spiceLevel}` : bubbleEmoji;

              const bubbleTxt = this.add.text(cust.sprite.x + 30, cust.sprite.y - 40, txtStr, { font: 'bold 16px Arial', fill: '#c25953' }).setOrigin(0.5);
              bubble.setInteractive({ useHandCursor: true });
              bubble.on('pointerdown', () => {
                  this.scene.launch('Kitchen', { gameScene: this, recipeId: chosen.id, orderType: chosen.type, customer: cust });
              });
              this.layerUI.add([bubble, bubbleTxt]);
              cust.foodBubble = { bg: bubble, txt: bubbleTxt };
            }
          }

          // Randomly trigger card order
          if (!cust.foodBubble && this.hasCardService && Math.random() < 0.0008) {
            cust.state = CUSTOMER_STATES.REQUESTING;
            cust.orderType = 'card';
            
            const bubble = this.add.nineslice(cust.sprite.x + 45, cust.sprite.y - 40, 'ui_panel', 0, 90, 40, 10, 10, 10, 10);
            const cardTypes = ['💳 Garena', '💳 Zing', '💳 Viettel'];
            const bubbleEmoji = cardTypes[Math.floor(Math.random() * cardTypes.length)];
            
            const bubbleTxt = this.add.text(cust.sprite.x + 45, cust.sprite.y - 40, bubbleEmoji, { font: 'bold 13px Nunito', fill: '#c25953' }).setOrigin(0.5);
            bubble.setInteractive({ useHandCursor: true });
            
              bubble.on('pointerdown', () => {
                  const profit = Math.floor(Math.random() * 41 + 10) * 1000; // 10k to 50k
                  this.economy.addMoney(profit);
                  this.stats.cardsSold = (this.stats.cardsSold || 0) + 1;
                  this.stats.cardsRevenue = (this.stats.cardsRevenue || 0) + profit;
                  this.showFloatText(cust.sprite.x, cust.sprite.y - 40, `+${this.formatMoney(profit)}`, '#2e7d32');

                
                if (cust.foodBubble) {
                  cust.foodBubble.bg?.destroy();
                  cust.foodBubble.txt?.destroy();
                  cust.foodBubble = null;
                }
                cust.state = CUSTOMER_STATES.PLAYING;
            });
            this.layerUI.add([bubble, bubbleTxt]);
            cust.foodBubble = { bg: bubble, txt: bubbleTxt };
          }

          if (cust.playTimeLeft <= 0) {
            if (cust.foodBubble) { cust.foodBubble.bg?.destroy(); cust.foodBubble.txt?.destroy(); cust.foodBubble = null; }
            cust.state = CUSTOMER_STATES.PAYING;
          }
          break;
        }

        case CUSTOMER_STATES.REQUESTING: {
          cust.playTimeLeft -= delta;
          if (cust.playTimeLeft <= 0) {
            if (cust.foodBubble) { cust.foodBubble.bg?.destroy(); cust.foodBubble.txt?.destroy(); cust.foodBubble = null; }
            cust.state = CUSTOMER_STATES.PAYING;
          }
          // Update bubble position
          if (cust.foodBubble && cust.sprite?.active) {
            cust.foodBubble.bg.x = cust.sprite.x + 30;
            cust.foodBubble.bg.y = cust.sprite.y - 40;
            cust.foodBubble.txt.x = cust.sprite.x + 30;
            cust.foodBubble.txt.y = cust.sprite.y - 40;
          }
          break;
        }

        case CUSTOMER_STATES.PAYING: {
          const pc = cust.targetPC;
          const modifier = pc.tier < cust.data.preferredPCLevel ? 0.8 : 1;
          cust.amountToPay = Math.floor(2 * pc.data.hourlyRate * modifier);

          // Free up PC
          pc.state = PC_STATES.DIRTY;
          pc.glow.fillAlpha = 0;
          pc.customer = null;

          cust.state = 'WALKING_TO_CASHIER';
          this.layerCharactersBehind.remove(cust.sprite);
          this.layerCharactersBehind.remove(cust.shadow);
          this.layerCharacters.add([cust.shadow, cust.sprite]);
          this.cashierQueue.push(cust);
          const qIndex = this.cashierQueue.length - 1;

          this.tweens.add({
            targets: [cust.sprite, cust.shadow],
            x: 750,
            y: 250 + (qIndex * 40),
            duration: 1500,
            ease: 'Sine.easeInOut',
            onUpdate: () => {
              if (cust.sprite?.active) {
                cust.sprite.y = cust.shadow.y - Math.abs(Math.sin(this.time.now / 150)) * 10;
              }
            },
            onComplete: () => {
              if (!cust.sprite?.active) return;
              cust.state = 'WAITING_TO_PAY';
              const bubble = this.add.nineslice(cust.sprite.x + 30, cust.sprite.y - 40, 'ui_panel', 0, 60, 40, 10, 10, 10, 10);
              const bubbleTxt = this.add.text(cust.sprite.x + 30, cust.sprite.y - 40, '💰', { font: '20px Arial' }).setOrigin(0.5);
              this.layerUI.add([bubble, bubbleTxt]);
              cust.payBubble = { bg: bubble, txt: bubbleTxt };

              if (this.cashierDesk) {
                this.cashierDesk.promptText = 'TÍNH TIỀN';
                this.cashierDesk.canInteract = true;
                this.cashierDesk.onInteract = () => {
                  if (this.cashierQueue.length > 0) {
                    const firstCust = this.cashierQueue[0];
                    if (firstCust.state === 'WAITING_TO_PAY') {
                      this.scene.launch('Cashier', { gameScene: this, customer: firstCust });
                    }
                  } else {
                    this.scene.launch('Shop', { gameScene: this });
                  }
                };
              }
            }
          });
          break;
        }

        case CUSTOMER_STATES.LEAVING:
          this.tweens.add({
            targets: [cust.sprite, cust.shadow],
            x: 120, y: 640,
            duration: 1000,
            ease: 'Sine.easeInOut',
            onUpdate: () => {
              if (cust.sprite?.active) {
                cust.sprite.y = cust.shadow.y - Math.abs(Math.sin(this.time.now / 150)) * 10;
              }
            },
            onComplete: () => {
              try { cust.sprite?.destroy(); cust.shadow?.destroy(); } catch (e) {}
              const idx = this.customers.indexOf(cust);
              if (idx >= 0) this.customers.splice(idx, 1);
            }
          });
          cust.state = 'GONE';
          break;
      }
    }
  }
}
