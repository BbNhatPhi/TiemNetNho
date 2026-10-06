export const RECIPE_TYPES = {
  NOODLE: 'noodle',
  DRINK: 'drink',
  RICE: 'rice',
  SNACK: 'snack'
};

export const RECIPES = [
  // NOODLES
  {
    id: 'noodle_egg',
    name: 'Mì Tôm Trứng',
    type: RECIPE_TYPES.NOODLE,
    basePrice: 15000,
    requiredUpgrades: ['food_noodle'],
    masteryId: 'noodle_egg', // to track mastery
    ingredients: ['Nước dùng', 'Mì', 'Trứng']
  },
  {
    id: 'noodle_beef',
    name: 'Mì Bò Bầm',
    type: RECIPE_TYPES.NOODLE,
    basePrice: 25000,
    requiredUpgrades: ['food_noodle'],
    masteryCondition: { id: 'noodle_egg', level: 2 }, // Must reach level 2 mastery in egg noodle to unlock
    ingredients: ['Nước dùng', 'Mì', 'Bò Bầm']
  },
  {
    id: 'noodle_seafood',
    name: 'Mì Hải Sản Cay',
    type: RECIPE_TYPES.NOODLE,
    basePrice: 35000,
    requiredUpgrades: ['food_noodle'],
    masteryCondition: { id: 'noodle_beef', level: 2 },
    ingredients: ['Nước dùng Tomyum', 'Mì', 'Hải Sản']
  },
  
  // DRINKS
  {
    id: 'drink_sting',
    name: 'Sting Dâu Đá',
    type: RECIPE_TYPES.DRINK,
    basePrice: 15000,
    requiredUpgrades: ['food_drink'],
    masteryId: 'drink_sting',
    steps: ['Ly đá', 'Sting', 'Chanh']
  },
  {
    id: 'drink_coffee',
    name: 'Cà phê Sữa Đá',
    type: RECIPE_TYPES.DRINK,
    basePrice: 20000,
    requiredUpgrades: ['food_drink'],
    masteryCondition: { id: 'drink_sting', level: 1 },
    masteryId: 'drink_coffee',
    steps: ['Sữa đặc', 'Cà phê phin', 'Đá']
  },
  {
    id: 'drink_peach_tea',
    name: 'Trà Đào Cam Sả',
    type: RECIPE_TYPES.DRINK,
    basePrice: 30000,
    requiredUpgrades: ['food_drink'],
    masteryCondition: { id: 'drink_coffee', level: 2 },
    masteryId: 'drink_peach_tea',
    steps: ['Trà đen', 'Đào ngâm', 'Sả & Cam']
  },

  // RICE / HOT FOOD
  {
    id: 'rice_fried_egg',
    name: 'Cơm Chiên Trứng',
    type: RECIPE_TYPES.RICE,
    basePrice: 25000,
    requiredUpgrades: ['food_kitchen'],
    masteryId: 'rice_fried_egg',
    ingredients: ['Cơm trắng', 'Trứng', 'Hành lá']
  },
  {
    id: 'rice_fried_beef',
    name: 'Cơm Rang Dưa Bò',
    type: RECIPE_TYPES.RICE,
    basePrice: 45000,
    requiredUpgrades: ['food_kitchen'],
    masteryCondition: { id: 'rice_fried_egg', level: 2 },
    masteryId: 'rice_fried_beef',
    ingredients: ['Cơm trắng', 'Dưa chua', 'Thịt bò']
  },

  // SNACKS (Vietnamese Net Cafe Staples)
  {
    id: 'snack_banh_mi',
    name: 'Bánh Mì Trứng Xúc Xích',
    type: RECIPE_TYPES.SNACK,
    basePrice: 20000,
    requiredUpgrades: ['food_snack'],
    masteryId: 'snack_banh_mi',
    ingredients: ['Bánh mì', 'Trứng', 'Xúc xích']
  },
  {
    id: 'snack_ca_vien',
    name: 'Cá Viên Chiên',
    type: RECIPE_TYPES.SNACK,
    basePrice: 25000,
    requiredUpgrades: ['food_snack'],
    masteryCondition: { id: 'snack_banh_mi', level: 1 },
    masteryId: 'snack_ca_vien',
    ingredients: ['Cá viên', 'Dầu ăn', 'Tương ớt']
  },
  {
    id: 'snack_khoai_tay',
    name: 'Khoai Tây Chiên',
    type: RECIPE_TYPES.SNACK,
    basePrice: 25000,
    requiredUpgrades: ['food_snack'],
    masteryCondition: { id: 'snack_ca_vien', level: 1 },
    masteryId: 'snack_khoai_tay',
    ingredients: ['Khoai tây', 'Dầu ăn', 'Tương ớt']
  }
];
