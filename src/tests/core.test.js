// Simple unit tests using Vitest for critical game systems
// Run with: npm test

import { describe, it, expect, beforeEach } from 'vitest';
import SaveSystem from '../systems/SaveSystem';
import EconomySystem from '../systems/EconomySystem';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();
global.localStorage = localStorageMock;

// ---- SaveSystem Tests ----
describe('SaveSystem', () => {
  beforeEach(() => localStorage.clear());

  it('isValidGameSave rejects null', () => {
    expect(SaveSystem.isValidGameSave(null)).toBe(false);
  });

  it('isValidGameSave rejects achievement-only save', () => {
    expect(SaveSystem.isValidGameSave({ achievements: ['first_blood'] })).toBe(false);
  });

  it('isValidGameSave accepts full game save', () => {
    expect(SaveSystem.isValidGameSave({ money: 5000000, day: 1, reputation: 0.1 })).toBe(true);
  });

  it('migrate returns null for achievement-only saves', () => {
    expect(SaveSystem.migrate({ achievements: ['first_blood'] })).toBe(null);
  });

  it('migrate fills missing arrays', () => {
    const result = SaveSystem.migrate({ money: 1000, day: 1, reputation: 0.1 });
    expect(result.pcs).toEqual([]);
    expect(result.upgrades).toEqual([]);
    expect(result.achievements).toEqual([]);
  });

  it('saveAchievements does not wipe existing game data', () => {
    SaveSystem.save({ money: 9999, day: 5, reputation: 2.0 });
    SaveSystem.saveAchievements(['first_blood']);
    const loaded = SaveSystem.load();
    expect(loaded.money).toBe(9999);
    expect(loaded.achievements).toEqual(['first_blood']);
  });

  it('loadAchievements returns [] when no save', () => {
    expect(SaveSystem.loadAchievements()).toEqual([]);
  });

  it('save and load roundtrip', () => {
    const data = { money: 12345, day: 3, reputation: 1.5, pcs: [], upgrades: ['net_business'] };
    SaveSystem.save(data);
    const loaded = SaveSystem.load();
    expect(loaded.money).toBe(12345);
    expect(loaded.day).toBe(3);
    expect(loaded.upgrades).toContain('net_business');
  });

  it('migrate adds parts if missing', () => {
    const data = { money: 1000, day: 1, reputation: 0.1, pcs: [{ id: 0, tier: 2 }] };
    const result = SaveSystem.migrate(data);
    expect(result.pcs[0].parts).toEqual({ cpu: 2, gpu: 2, ram: 2, monitor: 2, network: 2 });
  });
});

import { calculatePCStats } from '../data/computers';

describe('calculatePCStats', () => {
  it('calculates stats correctly', () => {
    const parts = { cpu: 1, gpu: 2, ram: 1, monitor: 1, network: 1 };
    const stats = calculatePCStats(parts);
    // base cpu(1000) + gpu2(2500) + ram1(500) + mon1(500) + net1(500) = 5000
    expect(stats.hourlyRate).toBe(5000);
    // totalLevel = 1+2+1+1+1 = 6. 6/5 = 1.2 => floor => 1
    expect(stats.tier).toBe(1);
  });
});

// ---- EconomySystem Tests ----
describe('EconomySystem', () => {
  it('initializes with given money', () => {
    const eco = new EconomySystem(5000000);
    expect(eco.money).toBe(5000000);
  });

  it('addMoney increases balance and daily revenue', () => {
    const eco = new EconomySystem(0);
    eco.addMoney(30000);
    expect(eco.money).toBe(30000);
    expect(eco.dailyRevenue).toBe(30000);
  });

  it('spendMoney returns true when sufficient', () => {
    const eco = new EconomySystem(100000);
    expect(eco.spendMoney(50000)).toBe(true);
    expect(eco.money).toBe(50000);
  });

  it('spendMoney returns false when insufficient', () => {
    const eco = new EconomySystem(10000);
    expect(eco.spendMoney(50000)).toBe(false);
    expect(eco.money).toBe(10000);
  });

  it('addExpense deducts money and tracks expense', () => {
    const eco = new EconomySystem(200000);
    eco.addExpense(50000);
    expect(eco.money).toBe(150000);
    expect(eco.dailyExpenses).toBe(50000);
  });

  it('addExpense can go negative (end-of-day cost)', () => {
    const eco = new EconomySystem(1000);
    eco.addExpense(50000);
    expect(eco.money).toBe(-49000);
  });

  it('getDailyProfit is correct', () => {
    const eco = new EconomySystem(0);
    eco.addMoney(100000);
    eco.addExpense(30000);
    expect(eco.getDailyProfit()).toBe(70000);
  });

  it('resetDailyStats clears revenue and expenses', () => {
    const eco = new EconomySystem(100000);
    eco.addMoney(50000);
    eco.addExpense(20000);
    eco.resetDailyStats();
    expect(eco.dailyRevenue).toBe(0);
    expect(eco.dailyExpenses).toBe(0);
    expect(eco.money).toBe(130000); // Balance unchanged
  });

  it('ignores NaN inputs', () => {
    const eco = new EconomySystem(50000);
    eco.addMoney(NaN);
    expect(eco.money).toBe(50000);
    eco.spendMoney(undefined);
    expect(eco.money).toBe(50000);
  });
});


import MasterySystem from '../systems/MasterySystem';
import DailyObjectiveSystem from '../systems/DailyObjectiveSystem';

// ---- MasterySystem Tests ----
describe('MasterySystem', () => {
  beforeEach(() => localStorage.clear());

  it('addMastery records mastery and saves correctly', () => {
    const sys = new MasterySystem(null);
    sys.addMastery('noodle_egg', 1);
    expect(sys.masteryData['noodle_egg']).toBe(1);
    
    // Check loading
    const sys2 = new MasterySystem(null);
    expect(sys2.masteryData['noodle_egg']).toBe(1);
  });

  it('getLevel scales points properly', () => {
    const sys = new MasterySystem(null);
    sys.addMastery('test', 2);
    expect(sys.getLevel('test')).toBe(0);
    sys.addMastery('test', 1); // total 3
    expect(sys.getLevel('test')).toBe(1);
    sys.addMastery('test', 7); // total 10
    expect(sys.getLevel('test')).toBe(2);
    sys.addMastery('test', 10); // total 20
    expect(sys.getLevel('test')).toBe(3);
  });

  it('isRecipeUnlocked returns true when requirements met', () => {
    const fakeScene = { upgrades: ['food_noodle'], cameras: { main: { width: 800 } }, showFloatText: () => {} };
    const sys = new MasterySystem(fakeScene);
    sys.addMastery('noodle_egg', 10); // level 2

    const recipe = {
      id: 'noodle_beef',
      requiredUpgrades: ['food_noodle'],
      masteryCondition: { id: 'noodle_egg', level: 2 }
    };
    expect(sys.isRecipeUnlocked(recipe)).toBe(true);

    const recipeLocked = {
      id: 'noodle_seafood',
      requiredUpgrades: ['food_noodle'],
      masteryCondition: { id: 'noodle_beef', level: 2 }
    };
    expect(sys.isRecipeUnlocked(recipeLocked)).toBe(false);
  });
});

// ---- DailyObjectiveSystem Tests ----
describe('DailyObjectiveSystem', () => {
  let sys, fakeScene;
  
  beforeEach(() => {
    fakeScene = { stats: {} };
    sys = new DailyObjectiveSystem(fakeScene);
  });

  it('tracks progress and check completion', () => {
    sys.objectives = [{
      type: 'customers_served',
      target: 5,
      completed: false,
      claimed: false,
      rewardMoney: 100,
      rewardRep: 0.1
    }];
    sys.progress = { customers_served: 0 };
    sys.trackProgress('customers_served', 5);
    expect(sys.objectives[0].completed).toBe(true);
  });

  it('claimRewards gives rewards only once', () => {
    sys.generateObjectives(1);
    const obj = sys.objectives[0];
    obj.completed = true;
    obj.rewardMoney = 1000;
    obj.rewardRep = 0.5;

    const r1 = sys.claimRewards();
    expect(r1.money).toBe(1000);
    expect(r1.rep).toBe(0.5);
    expect(obj.claimed).toBe(true);

    const r2 = sys.claimRewards(); // Second time
    expect(r2.money).toBe(0);
    expect(r2.rep).toBe(0);
  });
});
