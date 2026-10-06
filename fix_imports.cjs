const fs = require('fs');
const path = 'src/scenes/GameScene.js';
let content = fs.readFileSync(path, 'utf8');

content = content.replace("import { SHOP_UPGRADES } from '../data/upgrades';", "import { SHOP_UPGRADES } from '../data/upgrades';\nimport { INGREDIENTS } from '../data/ingredients';\nimport { RECIPES } from '../data/recipes';");

content = content.replace("const INGREDIENTS = require('../data/ingredients').INGREDIENTS;", "");
content = content.replace("const RECIPES = require('../data/recipes').RECIPES;", "");

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed ES module imports');

