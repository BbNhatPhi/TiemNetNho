export const GAME_EVENTS = [
  {
    id: 'power_outage',
    name: 'Cúp điện khu phố',
    description: 'Khu phố đột ngột bị cúp điện. Tất cả khách hàng đều bỏ về!',
    probability: 0.05,
    duration: 0,
    choices: [
      {
        text: 'Chịu trận (Mất khách)',
        cost: 0,
        effect: (scene) => {
          scene.reputation = Math.max(0, (scene.reputation ?? 0) - 0.2);
          if (scene.forceAllCustomersLeave) scene.forceAllCustomersLeave();
        }
      },
      {
        text: 'Chạy máy phát điện (500k)',
        cost: 500000,
        effect: (scene) => {
          scene.reputation = Math.min(5, (scene.reputation ?? 0) + 0.1);
        }
      }
    ]
  },
  {
    id: 'internet_down',
    name: 'Đứt cáp quang / Rớt mạng',
    description: 'Mạng bị rớt, các game thủ đang la ó! Hãy chạy đi restart Router!',
    probability: 0.1,
    duration: 0,
    choices: [
      {
        text: 'Chạy đi sửa',
        cost: 0,
        effect: (scene) => {
          if (scene.router) {
            scene.router.state = 'OFFLINE';
            if (scene.router.glow) scene.router.glow.fillColor = 0xff0000;
            if (scene.router.obj) scene.router.obj.canInteract = true;
          }
        }
      }
    ]
  },
  {
    id: 'noisy_customer',
    name: 'Khách trẩu tre làm ồn',
    description: 'Một khách hàng đang chửi thề rất to khi chơi Yasuo.',
    probability: 0.15,
    duration: 0,
    choices: [
      {
        text: 'Mặc kệ (Uy tín -0.2)',
        cost: 0,
        effect: (scene) => {
          scene.reputation = Math.max(0, (scene.reputation ?? 0) - 0.2);
        }
      },
      {
        text: 'Nhắc nhở nhẹ nhàng',
        cost: 0,
        effect: (scene) => {
          if (Math.random() > 0.5) {
            scene.reputation = Math.min(5, (scene.reputation ?? 0) + 0.1);
          } else {
            scene.reputation = Math.max(0, (scene.reputation ?? 0) - 0.1);
          }
        }
      },
      {
        text: 'Đuổi cổ (Uy tín +0.2, mất doanh thu)',
        cost: 0,
        effect: (scene) => {
          scene.reputation = Math.min(5, (scene.reputation ?? 0) + 0.2);
          if (scene.kickRandomCustomer) scene.kickRandomCustomer();
        }
      }
    ]
  },
  {
    id: 'police_check',
    name: 'Công an phường kiểm tra',
    description: 'Có đoàn kiểm tra hành chính bất ngờ.',
    probability: 0.08,
    duration: 0,
    choices: [
      {
        text: 'Chấp hành kiểm tra',
        cost: 0,
        effect: (scene) => {
          if (Math.random() < 0.2) {
            scene.economy.addExpense(1000000);
            if (scene.showFloatText) scene.showFloatText(640, 360, 'Bị phạt 1.000.000đ vì lỗi PCCC!', '#ff5555');
          } else {
            if (scene.showFloatText) scene.showFloatText(640, 360, 'Mọi thứ ổn thỏa ✓', '#64c48a');
          }
        }
      },
      {
        text: '"Linh động" (500k)',
        cost: 500000,
        effect: (scene) => {
          if (scene.showFloatText) scene.showFloatText(640, 360, 'Đã giải quyết êm xuôi ✓', '#64c48a');
        }
      }
    ]
  },
  {
    id: 'robbery',
    name: 'Trộm vặt',
    description: 'Một kẻ khả nghi lảng vảng gần quầy thu ngân.',
    probability: 0.05,
    duration: 0,
    choices: [
      {
        text: 'Hô hoán (Uy tín +0.1)',
        cost: 0,
        effect: (scene) => {
          scene.reputation = Math.min(5, (scene.reputation ?? 0) + 0.1);
          if (scene.showFloatText) scene.showFloatText(640, 360, 'Đuổi được trộm!', '#64c48a');
        }
      },
      {
        text: 'Lờ đi (Mất 200k)',
        cost: 0,
        effect: (scene) => {
          scene.economy.addExpense(200000);
          if (scene.showFloatText) scene.showFloatText(640, 360, 'Mất 200.000đ!', '#ff5555');
        }
      }
    ]
  },
  {
    id: 'pc_broken',
    name: 'Máy tính bị hỏng',
    description: 'Một trong các máy tính phát ra tiếng kêu khạc khào và tắt ngay!',
    probability: 0.1,
    duration: 0,
    choices: [
      {
        text: 'Gọi thợ sửa (300k)',
        cost: 300000,
        effect: (scene) => {
          const brokenPc = scene.pcs?.find(pc => pc.state === 'OCCUPIED' || pc.state === 'READY');
          if (brokenPc) {
            brokenPc.state = 'OFF';
            if (brokenPc.monitor) brokenPc.monitor.setTint(0x555555);
            if (brokenPc.glow) brokenPc.glow.fillAlpha = 0;
          }
          if (scene.showFloatText) scene.showFloatText(640, 360, 'Đã sửa máy tính ✓', '#64c48a');
        }
      },
      {
        text: 'Để tự tắt (Uy tín -0.3)',
        cost: 0,
        effect: (scene) => {
          scene.reputation = Math.max(0, (scene.reputation ?? 0) - 0.3);
          const brokenPc = scene.pcs?.find(pc => pc.state === 'OCCUPIED' || pc.state === 'READY');
          if (brokenPc) {
            brokenPc.state = 'OFF';
            if (brokenPc.monitor) brokenPc.monitor.setTint(0x555555);
            if (brokenPc.glow) brokenPc.glow.fillAlpha = 0;
            if (brokenPc.customer) {
              brokenPc.customer.state = 'LEAVING';
              brokenPc.customer = null;
            }
          }
        }
      }
    ]
  },
  {
    id: 'loyal_customer',
    name: 'Khách ruột quay lại',
    description: 'Một khách quen mang bạn bè đến và còn tip thêm!',
    probability: 0.12,
    duration: 0,
    choices: [
      {
        text: 'Chào đón nồng nhiệt (+200k, +0.2 uy tín)',
        cost: 0,
        effect: (scene) => {
          scene.economy.addMoney(200000);
          scene.reputation = Math.min(5, (scene.reputation ?? 0) + 0.2);
        }
      },
      {
        text: 'Cảm ơn bình thường',
        cost: 0,
        effect: (scene) => {
          scene.economy.addMoney(50000);
        }
      }
    ]
  },
  {
    id: 'love_story',
    name: 'Tỏ tình tại tiệm',
    description: 'Một nam game thủ tỏ tình với nữ game thủ.',
    probability: 0.05,
    duration: 0,
    choices: [
      {
        text: 'Hỗ trợ nhạc lãng mạn (+0.3 uy tín)',
        cost: 0,
        effect: (scene) => {
          scene.reputation = Math.min(5, (scene.reputation ?? 0) + 0.3);
        }
      },
      {
        text: 'Nhắc giữ trật tự (-0.1 uy tín)',
        cost: 0,
        effect: (scene) => {
          scene.reputation = Math.max(0, (scene.reputation ?? 0) - 0.1);
        }
      }
    ]
  },
  {
    id: 'lost_dog',
    name: 'Chó lạc',
    description: 'Có con chó Husky chạy vào tiệm cần phải.',
    probability: 0.06,
    duration: 0,
    choices: [
      {
        text: 'Cứu lại chờ chủ (-100k, +500k tiền hậu tạ)',
        cost: 100000,
        effect: (scene) => {
          scene.reputation = Math.min(5, (scene.reputation ?? 0) + 0.4);
          scene.economy.addMoney(500000);
          if (scene.showFloatText) scene.showFloatText(640, 360, 'Chủ đến nhận, hậu tạ 500.000đ!', '#64c48a');
        }
      },
      {
        text: 'Đuổi đi',
        cost: 0,
        effect: (scene) => {}
      }
    ]
  },
  {
    id: 'new_game',
    name: 'Bom tấn ra mắt',
    description: 'GTA VI ra mắt, khách đổi tới game.',
    probability: 0.02,
    duration: 0,
    choices: [
      {
        text: 'Mua bản quyền cài cho khách (-2.000.000đ, +2 uy tín)',
        cost: 2000000,
        effect: (scene) => {
          scene.reputation = Math.min(5, (scene.reputation ?? 0) + 2.0);
        }
      },
      {
        text: 'Không có tiền (-0.5 uy tín)',
        cost: 0,
        effect: (scene) => {
          scene.reputation = Math.max(0, (scene.reputation ?? 0) - 0.5);
        }
      }
    ]
  },
  {
    id: 'sale_off',
    name: 'Khuyến mãi nước ngọt',
    description: 'Đại lý nước ngọt giảm giá. Cơ hội nhập hàng!',
    probability: 0.07,
    duration: 0,
    choices: [
      {
        text: 'Nhập số lượng lớn (-1.000.000đ, +2.000.000đ lợi nhuận)',
        cost: 1000000,
        effect: (scene) => {
          scene.economy.addMoney(2000000);
          if (scene.showFloatText) scene.showFloatText(640, 360, 'Lợi 1.000.000đ nhờ bán nước!', '#64c48a');
        }
      },
      {
        text: 'Bỏ qua',
        cost: 0,
        effect: (scene) => {}
      }
    ]
  },
  {
    id: 'sleeping_guest',
    name: 'Khách ngủ quên',
    description: 'Khách chơi xuyên đêm và ngủ ngáy to.',
    probability: 0.08,
    duration: 0,
    choices: [
      {
        text: 'Đánh thức (-0.1 uy tín)',
        cost: 0,
        effect: (scene) => {
          scene.reputation = Math.max(0, (scene.reputation ?? 0) - 0.1);
        }
      },
      {
        text: 'Lấy mền đắp cho khách (+0.2 uy tín)',
        cost: 0,
        effect: (scene) => {
          scene.reputation = Math.min(5, (scene.reputation ?? 0) + 0.2);
        }
      }
    ]
  }
];
