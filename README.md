# Tiệm Net Nhỏ (Small Net Cafe)

Một web game mô phỏng quản lý tiệm net phong cách casual/pixel-art.
Từ 2 bộ PC cũ và 5 triệu đồng, bạn sẽ nâng cấp và mở rộng tiệm thành một gaming center lớn nhất.

## Cách cài đặt
1. Cài đặt Node.js
2. Clone/Mở project và chạy `npm install`
3. Chạy `npm run dev` để chạy bản dev
4. Chạy `npm run build` để build bản production

## Công nghệ sử dụng
- JavaScript (ES6 Modules)
- Phaser 3 (Game Engine)
- HTML5 / CSS3
- Vite (Bundler)

## Cấu trúc thư mục
- `public/`: Chứa các asset tĩnh (ảnh, âm thanh)
- `src/`: Mã nguồn chính
  - `scenes/`: Chứa các màn hình (Menu, Game, Shop...)
  - `entities/`: Chứa các object trong game (PC, Customer, Furniture)
  - `systems/`: Chứa logic điều khiển (Economy, Time, Upgrade)
  - `data/`: Dữ liệu cấu hình game (Loại khách, máy, nâng cấp)
  - `ui/`: Các thành phần giao diện
  - `utils/`: Hàm tiện ích
- `docs/`: Tài liệu dự án

## Cách thêm dữ liệu mới (Modding cơ bản)
- Thêm Customer: Chỉnh sửa `src/data/customers.js`
- Thêm Event: Chỉnh sửa `src/data/events.js`
- Thêm Upgrade: Chỉnh sửa `src/data/upgrades.js`
