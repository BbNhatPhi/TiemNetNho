const fs = require('fs');

function addInteractiveToBg(filePath, regexStr, replacement) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    const regex = new RegExp(regexStr, 'g');
    content = content.replace(regex, replacement);
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Updated ' + filePath);
  }
}

// 1. ShopScene
addInteractiveToBg(
  'src/scenes/ShopScene.js',
  `const overlay = this.add.rectangle\\(0, 0, width, height, 0x4a3b32, 0\\).setOrigin\\(0\\);`,
  `const overlay = this.add.rectangle(0, 0, width, height, 0x4a3b32, 0).setOrigin(0).setInteractive();`
);

// 2. CashierScene
addInteractiveToBg(
  'src/scenes/CashierScene.js',
  `const bg = this.add.rectangle\\(0, 0, width, height, 0x000000, 0.7\\).setOrigin\\(0\\);`,
  `const bg = this.add.rectangle(0, 0, width, height, 0x000000, 0.7).setOrigin(0).setInteractive();`
);

// 3. KitchenScene
addInteractiveToBg(
  'src/scenes/KitchenScene.js',
  `this.add.rectangle\\(0, 0, width, height, 0x000000, 0.7\\).setOrigin\\(0\\);`,
  `this.add.rectangle(0, 0, width, height, 0x000000, 0.7).setOrigin(0).setInteractive();`
);

// 4. PCManagementScene
addInteractiveToBg(
  'src/scenes/PCManagementScene.js',
  `const bg = this.add.rectangle\\(0, 0, width, height, 0x000000, 0.6\\).setOrigin\\(0\\);`,
  `const bg = this.add.rectangle(0, 0, width, height, 0x000000, 0.6).setOrigin(0).setInteractive();`
);


