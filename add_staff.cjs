const fs = require('fs');

// 1. Update upgrades.js
let upgradesPath = 'src/data/upgrades.js';
let upgradesContent = fs.readFileSync(upgradesPath, 'utf8');

const staffUpgrades = `
  // 👷 Nhân sự
  {
    id: 'staff_cashier',
    name: 'Nhân Viên Thu Ngân',
    category: 'staff',
    cost: 5000000,
    description: 'Tự động thanh toán tiền máy cho khách, tự động nhập nguyên liệu khi sắp hết.',
    effect: (scene) => { scene.hasCashierStaff = true; scene.reputation += 0.2; }
  },
  {
    id: 'staff_kitchen',
    name: 'Nhân Viên Bếp & Pha Chế',
    category: 'staff',
    cost: 8000000,
    description: 'Tự động nấu ăn và pha nước phục vụ tận răng cho khách.',
    effect: (scene) => { scene.hasKitchenStaff = true; scene.reputation += 0.3; }
  }
];`;
upgradesContent = upgradesContent.replace('];', staffUpgrades);
fs.writeFileSync(upgradesPath, upgradesContent, 'utf8');

// 2. Update ShopScene.js
let shopPath = 'src/scenes/ShopScene.js';
let shopContent = fs.readFileSync(shopPath, 'utf8');
shopContent = shopContent.replace("{ id: 'services', icon: '💎', name: 'Dịch Vụ' }", "{ id: 'services', icon: '💎', name: 'Dịch Vụ' },\n      { id: 'staff', icon: '👷', name: 'Nhân Sự' }");
fs.writeFileSync(shopPath, shopContent, 'utf8');

console.log('Added staff data and shop tabs');

