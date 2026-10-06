export const PC_TIERS = {
  1: {
    id: 'pc_tier_1',
    name: 'PC Cũ Cùi Bắp',
    level: 1,
    cost: 800000,
    hourlyRate: 5000,
    powerConsumption: 1,
    specs: { cpu: 'Core 2 Duo', ram: '4GB', gpu: 'GT 730' }
  },
  2: {
    id: 'pc_tier_2',
    name: 'PC Phổ Thông',
    level: 2,
    cost: 2000000,
    hourlyRate: 8000,
    powerConsumption: 2,
    specs: { cpu: 'i3 9100F', ram: '8GB', gpu: 'GTX 1050Ti' }
  },
  3: {
    id: 'pc_tier_3',
    name: 'PC Gaming',
    level: 3,
    cost: 5000000,
    hourlyRate: 15000,
    powerConsumption: 3,
    specs: { cpu: 'i5 12400F', ram: '16GB', gpu: 'RTX 3060' }
  },
  4: {
    id: 'pc_tier_4',
    name: 'PC High-End',
    level: 4,
    cost: 12000000,
    hourlyRate: 25000,
    powerConsumption: 4,
    specs: { cpu: 'i7 13700K', ram: '32GB', gpu: 'RTX 4070' }
  },
  5: {
    id: 'pc_tier_5',
    name: 'PC VIP Premium',
    level: 5,
    cost: 30000000,
    hourlyRate: 50000,
    powerConsumption: 5,
    specs: { cpu: 'i9 14900K', ram: '64GB', gpu: 'RTX 4090' }
  }
};

export const PC_PARTS = {
  cpu: {
    1: { name: 'Core 2 Duo', cost: 300000, hourlyRateBonus: 1000 },
    2: { name: 'i3 9100F', cost: 700000, hourlyRateBonus: 2000 },
    3: { name: 'i5 12400F', cost: 1500000, hourlyRateBonus: 4000 },
    4: { name: 'i7 13700K', cost: 3000000, hourlyRateBonus: 7000 },
    5: { name: 'i9 14900K', cost: 6000000, hourlyRateBonus: 12000 },
  },
  gpu: {
    1: { name: 'GT 730', cost: 400000, hourlyRateBonus: 1500 },
    2: { name: 'GTX 1050Ti', cost: 900000, hourlyRateBonus: 2500 },
    3: { name: 'RTX 3060', cost: 2000000, hourlyRateBonus: 5000 },
    4: { name: 'RTX 4070', cost: 4500000, hourlyRateBonus: 8500 },
    5: { name: 'RTX 4090', cost: 9000000, hourlyRateBonus: 18000 },
  },
  ram: {
    1: { name: '4GB', cost: 100000, hourlyRateBonus: 500 },
    2: { name: '8GB', cost: 300000, hourlyRateBonus: 1000 },
    3: { name: '16GB', cost: 800000, hourlyRateBonus: 2000 },
    4: { name: '32GB', cost: 1500000, hourlyRateBonus: 3500 },
    5: { name: '64GB', cost: 3000000, hourlyRateBonus: 6000 },
  },
  monitor: {
    1: { name: '17 inch 60Hz', cost: 200000, hourlyRateBonus: 500 },
    2: { name: '21 inch 75Hz', cost: 500000, hourlyRateBonus: 1000 },
    3: { name: '24 inch 144Hz', cost: 1200000, hourlyRateBonus: 2000 },
    4: { name: '27 inch 240Hz', cost: 3000000, hourlyRateBonus: 3500 },
    5: { name: '32 inch 4K', cost: 6000000, hourlyRateBonus: 7000 },
  },
  network: {
    1: { name: 'LAN 100Mbps', cost: 100000, hourlyRateBonus: 500 },
    2: { name: 'LAN 1Gbps', cost: 300000, hourlyRateBonus: 1000 },
    3: { name: 'LAN 2.5Gbps', cost: 800000, hourlyRateBonus: 2000 },
    4: { name: 'Wifi 6', cost: 1500000, hourlyRateBonus: 3000 },
    5: { name: 'Wifi 7', cost: 3500000, hourlyRateBonus: 6000 },
  },
};

export function calculatePCStats(parts) {
  let hourlyRate = 0;
  let totalLevel = 0;
  let partCount = 0;
  for (const [cat, level] of Object.entries(parts)) {
    if (PC_PARTS[cat] && PC_PARTS[cat][level]) {
      hourlyRate += PC_PARTS[cat][level].hourlyRateBonus;
      totalLevel += level;
      partCount++;
    }
  }
  const tier = Math.max(1, Math.floor(totalLevel / Math.max(1, partCount)));
  return { hourlyRate, tier, powerConsumption: tier };
}
