import SaveSystem from './SaveSystem';
import { CUSTOMER_STATES, PC_STATES } from '../utils/constants';
import { SHOP_UPGRADES } from '../data/upgrades';

export const ACHIEVEMENTS = [
  { id: 'first_blood', name: 'Mở bát', description: 'Đón khách hàng đầu tiên', type: 'customers', target: 1 },
  { id: 'rich_kid', name: 'Khởi nghiệp', description: 'Kiếm được 1.000.000đ', type: 'money', target: 1000000 },
  { id: 'millionaire', name: 'Ông chủ nhỏ', description: 'Kiếm được 10.000.000đ', type: 'money', target: 10000000 },
  { id: 'billionaire', name: 'Đại gia', description: 'Kiếm được 100.000.000đ', type: 'money', target: 100000000 },
  { id: 'pc_beginner', name: 'Net cỏ', description: 'Sở hữu 5 máy tính', type: 'pc', target: 5 },
  { id: 'pc_mid', name: 'Cyber Mini', description: 'Sở hữu 10 máy tính', type: 'pc', target: 10 },
  { id: 'pc_master', name: 'Cyber Core', description: 'Sở hữu 20 máy tính', type: 'pc', target: 20 },
  { id: 'star_3', name: 'Tiệm Net 3 Sao', description: 'Đạt 3.0 sao uy tín', type: 'reputation', target: 3.0 },
  { id: 'star_4', name: 'Tiệm Net 4 Sao', description: 'Đạt 4.0 sao uy tín', type: 'reputation', target: 4.0 },
  { id: 'star_5', name: 'Tiệm Net 5 Sao', description: 'Đạt 5.0 sao uy tín (Tối đa)', type: 'reputation', target: 5.0 },
  { id: 'day_7', name: 'Sống sót 1 tuần', description: 'Kinh doanh qua 7 ngày', type: 'days', target: 7 },
  { id: 'day_30', name: 'Đầy tháng', description: 'Kinh doanh qua 30 ngày', type: 'days', target: 30 },
  { id: 'day_100', name: 'Lão làng', description: 'Kinh doanh qua 100 ngày', type: 'days', target: 100 },
  { id: 'cust_100', name: 'Quán quen', description: 'Phục vụ 100 khách hàng', type: 'customers', target: 100 },
  { id: 'cust_500', name: 'Tấp nập', description: 'Phục vụ 500 khách hàng', type: 'customers', target: 500 },
  { id: 'cust_1000', name: 'Điểm đến tin cậy', description: 'Phục vụ 1000 khách hàng', type: 'customers', target: 1000 },
  { id: 'upgrade_max', name: 'Max Level', description: 'Sở hữu 1 máy tính Level 5', type: 'max_pc', target: 1 },
  { id: 'upgrade_all', name: 'Phòng VIP', description: 'Sở hữu 10 máy tính Level 5', type: 'max_pc', target: 10 },
  { id: 'event_5', name: 'Quen với rắc rối', description: 'Gặp 5 sự kiện ngẫu nhiên', type: 'events', target: 5 },
  { id: 'event_20', name: 'Người giải quyết', description: 'Gặp 20 sự kiện ngẫu nhiên', type: 'events', target: 20 },
  { id: 'event_50', name: 'Sóng gió', description: 'Gặp 50 sự kiện ngẫu nhiên', type: 'events', target: 50 },
  { id: 'food_1', name: 'Căn tin', description: 'Bán được 100 món đồ ăn/nước uống', type: 'food', target: 100 },
  { id: 'food_2', name: 'Nhà hàng 5 sao', description: 'Bán được 500 món đồ ăn/nước uống', type: 'food', target: 500 },
  { id: 'spend_10m', name: 'Nhà đầu tư', description: 'Tiêu tổng cộng 10.000.000đ', type: 'spend', target: 10000000 },
  { id: 'spend_100m', name: 'Vung tiền như nước', description: 'Tiêu tổng cộng 100.000.000đ', type: 'spend', target: 100000000 },
  { id: 'decor_5', name: 'Mới mẻ', description: 'Mua 5 vật phẩm trang trí', type: 'decor', target: 5 },
  { id: 'decor_20', name: 'Thiết kế nội thất', description: 'Mua 20 vật phẩm trang trí', type: 'decor', target: 20 },
  { id: 'ac_on', name: 'Mát lạnh', description: 'Mua điều hòa đầu tiên', type: 'ac', target: 1 },
  { id: 'fiber_net', name: 'Cáp quang 1000Mbps', description: 'Nâng cấp mạng lên mức cao nhất', type: 'network', target: 5 },
  { id: 'no_sleep', name: 'Xuyên đêm', description: 'Có khách hàng chơi liên tục qua ngày', type: 'night_owl', target: 1 }
];

export default class AchievementSystem {
  constructor(scene) {
    this.scene = scene;
    // Load achievements safely — never depends on full game save
    this.unlocked = SaveSystem.loadAchievements();
  }

  checkAchievements(stats) {
    if (!this.scene) return;

    const currentMoney = this.scene.economy?.money ?? 0;
    const currentRep = this.scene.reputation ?? 0;
    const currentPCs = this.scene.pcs ? this.scene.pcs.length : 0;
    const days = this.scene.day ?? 1;

    const totalCustomers = stats?.totalCustomers ?? 0;
    const totalEvents = stats?.totalEvents ?? 0;
    const totalSpent = stats?.totalSpent ?? 0;
    const maxPcCount = stats?.maxPcCount ?? 0;

    ACHIEVEMENTS.forEach(ach => {
      if (!this.unlocked.includes(ach.id)) {
        let achieved = false;
        switch (ach.type) {
          case 'customers': if (totalCustomers >= ach.target) achieved = true; break;
          case 'money': if (currentMoney >= ach.target) achieved = true; break;
          case 'pc': if (currentPCs >= ach.target) achieved = true; break;
          case 'reputation': if (currentRep >= ach.target) achieved = true; break;
          case 'days': if (days >= ach.target) achieved = true; break;
          case 'events': if (totalEvents >= ach.target) achieved = true; break;
          case 'max_pc': if (maxPcCount >= ach.target) achieved = true; break;
          case 'spend': if (totalSpent >= ach.target) achieved = true; break;
          case 'food':
          case 'decor':
          case 'ac':
          case 'network':
          case 'night_owl':
            break;
        }
        if (achieved) this.unlock(ach);
      }
    });
  }

  unlockById(id) {
    const ach = ACHIEVEMENTS.find(a => a.id === id);
    if (ach && !this.unlocked.includes(id)) {
      this.unlock(ach);
    }
  }

  unlock(achievement) {
    this.unlocked.push(achievement.id);
    this.showNotification(achievement);
    // Save achievements only — never overwrites full game state with partial data
    SaveSystem.saveAchievements(this.unlocked);
  }

  showNotification(achievement) {
    if (!this.scene?.cameras?.main) return;

    const width = this.cameras?.main?.width || this.scene.cameras.main.width;
    // Position at top-right outside the center HUD
    const toastX = width - 210;
    const toast = this.scene.add.container(toastX, -70).setDepth(10000);

    const bg = this.scene.add.nineslice(0, 0, 'ui_panel', 0, 360, 74, 16, 16, 16, 16).setOrigin(0.5);
    const title = this.scene.add.text(0, -14, `🏆 THÀNH TỰU: ${achievement.name}`, {
      font: '900 15px Nunito', fill: '#c25953'
    }).setOrigin(0.5);
    const desc = this.scene.add.text(0, 12, achievement.description, {
      font: '700 13px Nunito', fill: '#4a3b32', wordWrap: { width: 330 }
    }).setOrigin(0.5);

    toast.add([bg, title, desc]);

    this.scene.tweens.add({
      targets: toast,
      y: 80,
      duration: 600,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.scene.time.delayedCall(3200, () => {
          this.scene.tweens.add({
            targets: toast,
            y: -80,
            alpha: 0,
            duration: 400,
            onComplete: () => toast.destroy()
          });
        });
      }
    });
  }
}
