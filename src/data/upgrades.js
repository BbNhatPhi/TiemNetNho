export const SHOP_UPGRADES = [
  // 🖱️ Gear
  {
    id: 'gear_mechanical',
    name: 'Phím cơ & Chuột Gaming',
    category: 'gear',
    cost: 1500000,
    description: 'Trang bị phím cơ quang học. Giảm 20% khả năng khách đập phím.',
    effect: (scene) => { scene.reputation += 0.2; }
  },
  {
    id: 'gear_headset',
    name: 'Tai nghe 7.1',
    category: 'gear',
    cost: 2000000,
    description: 'Trải nghiệm âm thanh vòm. Tăng thời gian chơi của khách Tryhard.',
    effect: (scene) => { scene.reputation += 0.3; }
  },
  {
    id: 'gear_mousepad',
    name: 'Lót chuột RGB size XL',
    category: 'gear',
    cost: 500000,
    description: 'Êm ái, mượt mà. Tăng 5% doanh thu giờ chơi.',
    effect: (scene) => { scene.reputation += 0.1; }
  },
  
  // 🪑 Nội thất
  {
    id: 'decor_chair',
    name: 'Ghế Gaming êm ái',
    category: 'furniture',
    cost: 3000000,
    description: 'Giúp khách ngồi lâu hơn mà không đau lưng.',
    effect: (scene) => { scene.reputation += 0.4; }
  },
  {
    id: 'decor_plant',
    name: 'Cây cảnh lọc không khí',
    category: 'furniture',
    cost: 400000,
    description: 'Không gian xanh mát, bớt mùi khói thuốc.',
    effect: (scene) => { scene.reputation += 0.1; }
  },
  {
    id: 'decor_vip_room',
    name: 'Cải tạo Phòng VIP',
    category: 'furniture',
    cost: 15000000,
    description: 'Mở khóa khu vực VIP. Khách trả x2 tiền nhưng yêu cầu máy mạnh.',
    effect: (scene) => { 
      scene.reputation += 1.0; 
      scene.hasVIP = true;
    }
  },

  // ❄️ Điều hòa
  {
    id: 'ac_fan',
    name: 'Quạt công nghiệp',
    category: 'ac',
    cost: 800000,
    description: 'Giải pháp chống cháy mùa hè, hơi ồn.',
    effect: (scene) => { scene.reputation += 0.1; }
  },
  {
    id: 'ac_2hp',
    name: 'Máy Lạnh 2 HP',
    category: 'ac',
    cost: 6500000,
    description: 'Mát lạnh toàn phòng máy. Khách hàng hài lòng.',
    effect: (scene) => { scene.reputation += 0.5; scene.hasAC = true; }
  },
  {
    id: 'ac_inverter',
    name: 'Máy Lạnh Âm Trần',
    category: 'ac',
    cost: 12000000,
    description: 'Siêu mát, siêu tiết kiệm điện, chuẩn Cyber lớn.',
    effect: (scene) => { scene.reputation += 0.8; }
  },

  // 🌐 Internet
  {
    id: 'net_business',
    name: 'Gói Internet Doanh Nghiệp',
    category: 'internet',
    cost: 2000000,
    description: 'Đường truyền 500Mbps. Không còn hiện tượng giật lag.',
    effect: (scene) => { scene.reputation += 0.3; scene.hasFastInternet = true; }
  },
  {
    id: 'net_fiber_pro',
    name: 'Gói Cáp Quang Chuyên Game',
    category: 'internet',
    cost: 4500000,
    description: 'Ping 1ms. Tối ưu hóa cho các giải đấu.',
    effect: (scene) => { scene.reputation += 0.6; }
  },
  {
    id: 'net_router',
    name: 'Router cân bằng tải',
    category: 'internet',
    cost: 1500000,
    description: 'Mạng luôn ổn định kể cả khi full máy.',
    effect: (scene) => { scene.reputation += 0.2; }
  },

  // 🥤 Đồ ăn
  {
    id: 'food_noodle',
    name: 'Quầy Mì Tôm Trứng',
    category: 'food',
    cost: 500000,
    description: 'Món ăn huyền thoại. Tạo thêm nguồn thu từ dịch vụ.',
    effect: (scene) => { scene.reputation += 0.2; scene.hasFood = true; }
  },
  {
    id: 'food_drink',
    name: 'Tủ Lạnh Nước Ngọt',
    category: 'food',
    cost: 1500000,
    description: 'Bán Sting, bò húc, trà đá. Khách ngồi lâu hơn.',
    effect: (scene) => { scene.reputation += 0.3; scene.hasDrinks = true; }
  },
  {
    id: 'food_kitchen',
    name: 'Bếp Cơm Chiên',
    category: 'food',
    cost: 4000000,
    description: 'Phục vụ cơm rang dưa bò, cơm chiên dương châu.',
    effect: (scene) => { scene.reputation += 0.5; scene.hasKitchen = true; }
  },
  {
    id: 'food_snack',
    name: 'Tủ Kính & Bếp Chiên',
    category: 'food',
    cost: 3000000,
    description: 'Bán bánh mì, cá viên chiên, khoai tây chiên (Món ăn vặt).',
    effect: (scene) => { scene.reputation += 0.3; scene.hasSnacks = true; }
  },
  
  // 💎 Dịch vụ & Kiếm tiền thêm
  {
    id: 'service_card',
    name: 'Đại Lý Thẻ Game',
    category: 'services',
    cost: 1500000,
    description: 'Mở khóa bán thẻ Garena, Zing, Viettel. Thu lãi trực tiếp khi khách yêu cầu mua.',
    effect: (scene) => { scene.reputation += 0.2; scene.hasCardService = true; }
  },
  {
    id: 'service_mining',
    name: 'Phần Mềm Đào Coin / Cày Thuê',
    category: 'services',
    cost: 5000000,
    description: 'Tận dụng máy trống để đào coin hoặc treo tool cày thuê kiếm thêm thu nhập thụ động.',
    effect: (scene) => { scene.reputation += 0.1; scene.hasMiningService = true; }
  }

  , // 👷 Nhân sự
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
];
