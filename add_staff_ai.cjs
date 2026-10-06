const fs = require('fs');
const path = 'src/scenes/GameScene.js';
let content = fs.readFileSync(path, 'utf8');

// Insert startStaffAI
content = content.replace('this.startCustomerSpawner();', 'this.startCustomerSpawner();\n    this.startStaffAI();');

// Define startStaffAI
const staffAILogic = `
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
              this.showFloatText(this.cashierDesk.x, this.cashierDesk.y - 40, \`+\${this.formatMoney(bill)}\`, '#64c48a');
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
          const INGREDIENTS = require('../data/ingredients').INGREDIENTS;
          for (const key in INGREDIENTS) {
            if ((this.inventory[key] || 0) <= 0) {
              const packCost = INGREDIENTS[key].cost * 10;
              if (this.economy.money >= packCost) {
                this.economy.spendMoney(packCost);
                this.inventory[key] = 10;
                this.showFloatText(this.cashierDesk.x, this.cashierDesk.y - 60, \`- Nhập \${key}!\`, '#c25953');
                this.updateHUD();
              }
            }
          }
        }
        
        // 2. Bếp & Pha chế
        if (this.upgrades.includes('staff_kitchen')) {
          this.customers.forEach(cust => {
             if (cust.state === 'REQUESTING' && cust.foodBubble) {
                 const RECIPES = require('../data/recipes').RECIPES;
                 const recipe = RECIPES.find(r => r.id === cust.recipeId);
                 if (recipe) {
                     // Try to auto consume ingredients if possible (simple version: just give the base price profit)
                     const profit = recipe.basePrice || 15000;
                     this.economy.addMoney(profit);
                     this.showFloatText(cust.targetPC.x, cust.targetPC.y - 70, \`+\${this.formatMoney(profit)}\`, '#64c48a');
                     
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
`;

content = content.replace('startCustomerSpawner() {', staffAILogic + '\n  startCustomerSpawner() {');

// Render Staff visual sprites in applyVisualUpgrades
const renderStaffLogic = `
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
`;

content = content.replace('// 5. Kitchen and Food setups', renderStaffLogic + '\n    // 5. Kitchen and Food setups');

fs.writeFileSync(path, content, 'utf8');
console.log('Added staff AI and visuals!');

