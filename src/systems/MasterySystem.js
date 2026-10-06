import SaveSystem from './SaveSystem';
import { RECIPES } from '../data/recipes';

export default class MasterySystem {
  constructor(scene) {
    this.scene = scene;
    // Load from save
    this.masteryData = SaveSystem.loadMastery() || {};
  }

  // Record a successful cooking of a recipe
  addMastery(recipeId, amount = 1) {
    if (!this.masteryData[recipeId]) {
      this.masteryData[recipeId] = 0;
    }
    const oldLevel = this.getLevel(recipeId);
    this.masteryData[recipeId] += amount;
    const newLevel = this.getLevel(recipeId);

    if (newLevel > oldLevel && this.scene && this.scene.cameras && this.scene.cameras.main) {
      this.scene.showFloatText(this.scene.cameras.main.width/2, 200, `Thành thạo ${this.getRecipeName(recipeId)} tăng lên Cấp ${newLevel}!`, '#f1c40f');
    }

    this.save();
  }

  getLevel(recipeId) {
    const points = this.masteryData[recipeId] || 0;
    if (points >= 20) return 3; // Max level
    if (points >= 10) return 2;
    if (points >= 3) return 1;
    return 0;
  }

  getRecipeName(recipeId) {
    const recipe = RECIPES.find(r => r.id === recipeId);
    return recipe ? recipe.name : recipeId;
  }

  isRecipeUnlocked(recipe) {
    // 1. Check shop upgrades
    if (recipe.requiredUpgrades) {
      for (const req of recipe.requiredUpgrades) {
        if (!this.scene.upgrades.includes(req)) return false;
      }
    }
    // 2. Check mastery condition
    if (recipe.masteryCondition) {
      const cond = recipe.masteryCondition;
      const currentLevel = this.getLevel(cond.id);
      if (currentLevel < cond.level) return false;
    }
    return true;
  }

  getUnlockedRecipes(type = null) {
    return RECIPES.filter(r => {
      if (type && r.type !== type) return false;
      return this.isRecipeUnlocked(r);
    });
  }

  save() {
    SaveSystem.saveMastery(this.masteryData);
  }
}
