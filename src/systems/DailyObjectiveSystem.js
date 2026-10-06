// Daily objectives system - generates objectives at the start of each day
// and tracks progress during gameplay

export const OBJECTIVE_TEMPLATES = [
  {
    id: 'serve_customers',
    name: 'Phục vụ {target} khách hàng',
    type: 'customers_served',
    targetMin: 3,
    targetMax: 8,
    rewardMoney: 50000,
    rewardRep: 0.1
  },
  {
    id: 'earn_revenue',
    name: 'Kiếm {target}đ doanh thu',
    type: 'revenue',
    targetMin: 100000,
    targetMax: 500000,
    rewardMoney: 30000,
    rewardRep: 0.1
  },
  {
    id: 'cook_noodles',
    name: 'Nấu {target} tô mì',
    type: 'noodles_cooked',
    targetMin: 1,
    targetMax: 3,
    rewardMoney: 40000,
    rewardRep: 0.15
  },
  {
    id: 'perfect_change',
    name: 'Trả tiền thối đúng {target} lần',
    type: 'perfect_payments',
    targetMin: 2,
    targetMax: 5,
    rewardMoney: 30000,
    rewardRep: 0.1
  },
  {
    id: 'no_customer_leave',
    name: 'Không để khách bỏ về vì hết máy',
    type: 'no_lost_customers',
    targetMin: 1,
    targetMax: 1,
    rewardMoney: 80000,
    rewardRep: 0.2
  },
  {
    id: 'serve_drinks',
    name: 'Pha {target} ly nước',
    type: 'drinks_served',
    targetMin: 1,
    targetMax: 3,
    rewardMoney: 25000,
    rewardRep: 0.1
  },
  {
    id: 'clean_pcs',
    name: 'Dọn dẹp {target} máy tính',
    type: 'pcs_cleaned',
    targetMin: 2,
    targetMax: 5,
    rewardMoney: 20000,
    rewardRep: 0.05
  }
];

export default class DailyObjectiveSystem {
  constructor(scene) {
    this.scene = scene;
    this.objectives = [];
    this.progress = {};
  }

  generateObjectives(day) {
    // Pick 2-3 random non-duplicate objectives
    const count = day <= 2 ? 2 : 3;
    const shuffled = [...OBJECTIVE_TEMPLATES].sort(() => Math.random() - 0.5);
    
    // Filter out food-related objectives if food isn't unlocked
    const available = shuffled.filter(t => {
      if (t.type === 'noodles_cooked' && !this.scene.hasFood) return false;
      if (t.type === 'drinks_served' && !this.scene.hasDrinks) return false;
      return true;
    });

    this.objectives = available.slice(0, count).map(template => {
      const target = template.targetMin === template.targetMax
        ? template.targetMin
        : Math.floor(Math.random() * (template.targetMax - template.targetMin + 1)) + template.targetMin;
      
      // Scale rewards with day
      const dayMultiplier = 1 + (day - 1) * 0.1;
      
      return {
        ...template,
        target,
        displayName: template.name.replace('{target}', target.toLocaleString()),
        rewardMoney: Math.floor(template.rewardMoney * dayMultiplier),
        rewardRep: template.rewardRep,
        completed: false,
        claimed: false
      };
    });

    // Reset progress
    this.progress = {
      customers_served: 0,
      revenue: 0,
      noodles_cooked: 0,
      drinks_served: 0,
      perfect_payments: 0,
      no_lost_customers: 1, // starts at 1, set to 0 if a customer leaves angry
      pcs_cleaned: 0
    };

    // Load or generate weekly objective
    this.weeklyObjective = this.scene.stats?.weeklyObjective;
    if (!this.weeklyObjective || this.weeklyObjective.claimed || day % 7 === 1) {
      this.generateWeeklyObjective(day);
    }
  }

  generateWeeklyObjective(day) {
    const templates = [
      { type: 'revenue', name: 'Thử thách Tuần: Kiếm {target}đ', target: 2000000, rewardMoney: 500000, rewardRep: 1.0 },
      { type: 'customers_served', name: 'Thử thách Tuần: Phục vụ {target} khách', target: 50, rewardMoney: 300000, rewardRep: 0.8 },
      { type: 'perfect_payments', name: 'Thử thách Tuần: Trả đúng {target} lần', target: 30, rewardMoney: 200000, rewardRep: 0.5 }
    ];
    const template = templates[Math.floor(Math.random() * templates.length)];
    // Scale target with week
    const week = Math.ceil(day / 7);
    const multiplier = 1 + (week - 1) * 0.5;

    this.weeklyObjective = {
      type: template.type,
      target: Math.floor(template.target * multiplier),
      name: template.name.replace('{target}', Math.floor(template.target * multiplier).toLocaleString()),
      rewardMoney: Math.floor(template.rewardMoney * multiplier),
      rewardRep: template.rewardRep,
      current: 0,
      completed: false,
      claimed: false
    };
    if (this.scene.stats) this.scene.stats.weeklyObjective = this.weeklyObjective;
  }

  trackProgress(type, amount = 1) {
    if (type === 'no_lost_customers') {
      this.progress.no_lost_customers = 0; // Failed
    } else {
      this.progress[type] = (this.progress[type] || 0) + amount;
      
      // Update weekly objective
      if (this.weeklyObjective && this.weeklyObjective.type === type && !this.weeklyObjective.completed) {
        this.weeklyObjective.current += amount;
      }
    }
    this.checkCompletion();
    if (this.scene && this.scene.updateObjectivesHUD) {
      this.scene.updateObjectivesHUD();
    }
  }

  checkCompletion() {
    this.objectives.forEach(obj => {
      if (obj.completed) return;
      const current = this.progress[obj.type] || 0;
      if (current >= obj.target) {
        obj.completed = true;
        this.showObjectiveComplete(obj);
      }
    });

    if (this.weeklyObjective && !this.weeklyObjective.completed) {
      if (this.weeklyObjective.current >= this.weeklyObjective.target) {
        this.weeklyObjective.completed = true;
        this.showObjectiveComplete({ ...this.weeklyObjective, displayName: this.weeklyObjective.name });
      }
    }
  }

  showObjectiveComplete(obj) {
    if (!this.scene?.cameras?.main) return;
    const width = this.scene.cameras.main.width;

    const toastX = width - 210;
    const toast = this.scene.add.container(toastX, -60).setDepth(9000);
    const bg = this.scene.add.nineslice(0, 0, 'ui_panel', 0, 360, 56, 16, 16, 16, 16);
    const text = this.scene.add.text(0, 0, `🎯 ${obj.displayName} ✓`, {
      font: '800 15px Nunito', fill: '#2e7d32', wordWrap: { width: 330 }, align: 'center'
    }).setOrigin(0.5);
    toast.add([bg, text]);

    this.scene.tweens.add({
      targets: toast, y: 70, duration: 500, ease: 'Back.easeOut',
      onComplete: () => {
        this.scene.time.delayedCall(2200, () => {
          this.scene.tweens.add({
            targets: toast, y: -70, alpha: 0, duration: 350,
            onComplete: () => toast.destroy()
          });
        });
      }
    });
  }

  claimRewards() {
    let totalMoney = 0;
    let totalRep = 0;
    this.objectives.forEach(obj => {
      if (obj.completed && !obj.claimed) {
        obj.claimed = true;
        totalMoney += obj.rewardMoney;
        totalRep += obj.rewardRep;
      }
    });

    if (this.weeklyObjective && this.weeklyObjective.completed && !this.weeklyObjective.claimed) {
      this.weeklyObjective.claimed = true;
      totalMoney += this.weeklyObjective.rewardMoney;
      totalRep += this.weeklyObjective.rewardRep;
    }

    return { money: totalMoney, rep: totalRep };
  }

  getStatus() {
    const status = this.objectives.map(obj => ({
      ...obj,
      current: this.progress[obj.type] || 0
    }));

    if (this.weeklyObjective) {
      status.push({
        ...this.weeklyObjective,
        displayName: this.weeklyObjective.name
      });
    }

    return status;
  }
}

