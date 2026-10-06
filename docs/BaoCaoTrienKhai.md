# Báo cáo Triển khai: Tối ưu Mobile & Đồng bộ Cloud

## 1. Các file đã sửa hoặc thêm
- `index.html`: Thêm nút cảnh báo hướng dẫn xoay ngang nhưng cho phép ẩn đi để tiếp tục chơi ở chế độ màn hình dọc (portrait). Thêm overlay HTML cho tính năng Đăng nhập/Đồng bộ.
- `src/services/SupabaseService.js` (Mới): Tích hợp Supabase Client (`@supabase/supabase-js`), quản lý đăng nhập, đăng ký, đăng xuất, lưu và tải dữ liệu lên database (`upsert` và `select`).
- `src/systems/SaveSystem.js`: Tích hợp với `SupabaseService`. Mỗi khi game lưu (local), nó sẽ tạo tiến trình đồng bộ ngầm lên Cloud nếu người chơi đang đăng nhập. Thêm timestamp `updated_at` để giải quyết xung đột.
- `src/ui/SyncUI.js` (Mới): Quản lý giao diện xác thực và đồng bộ. Lắng nghe các sự kiện `online` và `visibilitychange` để kích hoạt đồng bộ khi có mạng lại hoặc khi mở lại game. Giao diện cũng cho phép chọn lựa bản lưu để tránh ghi đè dữ liệu.
- `src/scenes/MenuScene.js`: Thêm nút "☁ ĐỒNG BỘ CLOUD" để gọi giao diện quản lý Cloud Save.
- `src/scenes/GameScene.js`: Thêm biểu tượng ☁ ở thanh HUD phía trên để người chơi có thể vào cài đặt đồng bộ hoặc kiểm tra trạng thái bất kì lúc nào.

## 2. Cách cấu hình backend (Supabase) và biến môi trường

Dự án hiện đang sử dụng Supabase để cung cấp dịch vụ Database & Authentication.

**Bước 1: Cấu hình biến môi trường**
Trong thư mục gốc của dự án, tạo file `.env` hoặc `.env.local` và thêm các khóa sau (chỉ dùng Anon Key, **tuyệt đối không dùng Service Role Key** ở frontend):
```
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

**Bước 2: Cấu hình bảng dữ liệu Database**
Chạy câu lệnh SQL sau trên cửa sổ SQL Editor của Supabase để tạo bảng `saves` và bật Row Level Security (RLS).
```sql
CREATE TABLE public.saves (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  save_data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bật bảo mật dòng (Row Level Security)
ALTER TABLE public.saves ENABLE ROW LEVEL SECURITY;

-- Chính sách: Người dùng chỉ được SELECT dữ liệu của chính mình
CREATE POLICY "Users can view their own save"
  ON public.saves
  FOR SELECT
  USING (auth.uid() = user_id);

-- Chính sách: Người dùng chỉ được INSERT/UPDATE (UPSERT) dữ liệu của chính mình
CREATE POLICY "Users can upsert their own save"
  ON public.saves
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own save"
  ON public.saves
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

## 3. Các trường hợp đã kiểm tra và kết quả

- **Màn hình desktop và điện thoại (ngang/dọc):** Tính năng Scale FIT của Phaser tự động co bóp giao diện vừa vặn màn hình mà không làm tràn hay che khuất nút (đã kiểm tra giả lập di động bằng DevTools). Lời nhắc Landscape có thể tắt trên màn hình dọc.
- **Thao tác chạm, kéo thả:** Phaser `pointerup` và `pointerdown` được hỗ trợ tốt bằng cảm ứng, KitchenScene.js cũng đã cấu hình `this.input.on('pointerup')` để ngắt thao tác Rót Nước khi thả tay ngoài nút bấm.
- **Đăng nhập trên thiết bị mới / Tải save Cloud:** Tính năng có hiển thị màn hình chọn xung đột giữa "Save máy" và "Save Cloud" cùng với chỉ số tiền/ngày. Khi tải Save Cloud, dữ liệu Local bị ghi đè an toàn và reload trang để áp dụng.
- **Liên kết Save khách vào tài khoản có sẵn:** Cảnh báo Conflict (xung đột) hiển thị. Dữ liệu của khách được lưu dự phòng bằng `tiemnetnho_save_backup` trước khi bị thay thế. Nếu người chơi chọn giữ máy (Local), Save cũ sẽ được đồng bộ đè lên Cloud.
- **Chơi Offline / Mất mạng:** Game chơi bình thường, dữ liệu được ghi vào `localStorage`. Khi kết nối mạng quay lại (event `online`) và focus lại vào tab, Game tự động upload bản save hiện tại lên Cloud.
- **Không xảy ra lỗi mất đồ (Migration):** Các dữ liệu cũ từ phiên bản trước vẫn chạy ngầm qua `SaveSystem.migrate()` để nạp vào đúng định dạng, giữ nguyên tiền và nâng cấp.

## 4. Những vấn đề còn lại hoặc cần thử trên điện thoại thật

- **Thử nghiệm Cảm ứng (Touch) thực tế:** Các thao tác spam-click ở bếp gas đôi khi bị "dblclick" zoom màn hình ở các trình duyệt iOS cũ, cần kiểm chứng thực tế xem lệnh meta chặn zoom (`user-scalable=no`) có hoạt động chính xác chưa.
- **Kích thước font chữ và độ nhạy nút:** Một số nút điều hướng chuyển trang trong PCManagement và Cửa hàng (`◀ TRƯỚC / SAU ▶`) có thể hơi khó bấm nếu ngón tay người dùng to. Nên đánh giá lại trên thiết bị có độ phân giải <375px.
- **Bàn phím ảo:** Form đăng nhập HTML khi focus có thể đẩy game lên (layout shift) ở Android/iOS. Tuy không ảnh hưởng vì đang ở Modal Đăng nhập, nhưng cần test cảm giác thực tế.
