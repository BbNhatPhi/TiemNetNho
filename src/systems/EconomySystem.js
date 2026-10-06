export default class EconomySystem {
  constructor(initialMoney, scene) {
    this.money = typeof initialMoney === 'number' ? initialMoney : 0;
    this.scene = scene;
    this.dailyRevenue = 0;
    this.dailyExpenses = 0;
  }

  addMoney(amount) {
    if (typeof amount !== 'number' || isNaN(amount)) return;
    this.money += amount;
    this.dailyRevenue += amount;
    if (this.scene && this.scene.dailyObjectives) {
      this.scene.dailyObjectives.trackProgress('revenue', amount);
    }
  }

  spendMoney(amount) {
    if (typeof amount !== 'number' || isNaN(amount) || amount < 0) return false;
    if (this.money >= amount) {
      this.money -= amount;
      return true;
    }
    return false;
  }

  addExpense(amount) {
    if (typeof amount !== 'number' || isNaN(amount)) return false;
    // Allow going negative for end-of-day expenses (rent/electricity)
    this.money -= amount;
    this.dailyExpenses += amount;
    return true;
  }

  resetDailyStats() {
    this.dailyRevenue = 0;
    this.dailyExpenses = 0;
  }

  getDailyProfit() {
    return this.dailyRevenue - this.dailyExpenses;
  }
}
