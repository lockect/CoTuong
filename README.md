# ⚔️ CHIẾN TƯỚNG – ANCIENT CHINESE CHESS BATTLE

![Chiến Tướng - Ancient Chinese Chess Battle](../assets/icon.png)

> **CHIẾN TƯỚNG** là tựa game Cờ Tướng chiến thuật thế hệ mới kết hợp giữa Luật cờ truyền thống, Động cơ AI Minimax thông minh, Hoạt ảnh chiến đấu 2.5D sống động và Đồ họa 3D Action Cam cận cảnh khi ăn quân.

---

## 👨‍💻 THÔNG TIN TÁC GIẢ & LIÊN HỆ

* **Tác giả:** Chiến Tướng Studio
* **Zalo / Momo / Phone:** `0907.900.506`
* **Phiên bản:** `2.0.0 Hybrid Engine (2.5D & 3D)`
* **Nền tảng hỗ trợ:** Web (Chrome, Edge, Safari, Firefox) & Mobile App (Android/iOS via Capacitor)

---

## 🌟 TÍNH NĂNG NỔI BẬT

### 1. 💃 Vũ Nữ Mỹ Nhân Nhảy Múa (`Dancer.js`)
* Khi quân Tướng (`帥` / `將`) vung kiếm ăn quân đối phương, một **Vũ Nữ Mỹ Nhân Khổng Lồ (To gấp 2 lần)** sẽ xuất hiện ở **Chính Giữa Bàn Cờ (Sở Hà - Hán Giới)**.
* Vũ Nữ khoác lên mình trang phục lụa xẻ tà quyến rũ, vung dải lụa mềm mại nhảy múa ăn mừng chiến thắng kéo dài thong thả trong bầu không khí tinh vân ánh sao lấp lánh.

### 2. 🚜 Chiến Xa Biến Hình Gai Khổng Lồ (`ChariotRenderer.js`)
* Quân Xe (`俥` / `車`) trước khi tấn công sẽ kích hoạt cơ cấu cơ khí phóng to **3.0 lần**, biến hình thành **Xe Thiết Giáp Gai Khổng Lồ** càn quét đè bẹp đối thủ với bánh xe gai xoay xé gió.

### 3. 🐎 Thần Mã Đâm Liên Hoàn 3 Phát (`HorseRenderer.js`)
* Quân Mã (`傌` / `馬`) thực hiện cú đâm **Liên Hoàn 3 Phát Thần Tốc** bằng trường thương xé gió, tung ra bão ánh sao 4 cánh tỏa sáng rực rỡ.

### 4. 🐘 Chiến Tượng Giẫm Đạp Đại Địa (`ElephantRenderer.js`)
* Quân Tượng (`相` / `象`) hóa thân thành **Voi Chiến Khổng Lồ (3.2x)** chồm vó dậm mạnh xuống đất đè bẹp đối thủ và tỏa sóng chấn động vầng hào quang.

### 5. 💣 Pháo Bắn Đạn Ma Thuật Tầm Xa (`CannonRenderer.js`)
* Quân Pháo (`炮` / `砲`) tập trung năng lượng bắn đạn ma thuật bay cầu vồng nổ tung đối thủ từ xa trước khi di chuyển tới vị trí.

### 6. 🏯 Chiến Trường Ngũ Hành (`BattlefieldRenderer.js`)
* Tùy chọn 5 phong cách chiến trường biến hóa theo Ngũ Hành: **Thổ (Hoàng Thổ)**, **Kim (Bạch Kim)**, **Mộc (Cổ Mộc)**, **Thủy (Hàn Băng)**, và **Hỏa (Xích Diễm)**.

### 7. 🧠 Trí Tuệ Nhân Tạo & Chế Độ Chơi
* **Người vs Máy (PvE):** Tích hợp thuật toán AI Minimax kết hợp bảng điểm PST (Piece-Square Table) với 3 độ khó: **Dễ**, **Vừa**, và **Khó**.
* **Hai Người (PvP):** Thi đấu đối kháng 2 người trên cùng một thiết bị.

### 8. ⚙️ Nút Cài Đặt Game (⚙️) & Chế Độ Tốc Độ
* Nút cài đặt (⚙️) nằm ở góc trên bên phải giúp tùy chỉnh mượt mà:
  * **Chế độ Tốc độ:** Thêm lựa chọn `0.5x (Chậm)` cho phép xem lại toàn bộ trận đánh ở chế độ Cinematic Slow-Motion.
  * **Góc nhìn:** Tự do chuyển đổi giữa `2.5D Cổ điển` và `3D Chiến trường`.

---

## 📁 CẤU TRÚC THƯ MỤC DỰ ÁN

```text
ChienTuong/
├── www/
│   ├── index.html              # Giao diện HTML chính & Modal Cài đặt
│   ├── style.css               # Bảng phong cách mỹ thuật UI/UX & CSS Animations
│   ├── game.js                 # Động cơ Game Engine chính (Rules, AI, SoundFX, 3D Renderer)
│   ├── dancer.js               # Module Vũ Nữ Mỹ Nhân nhảy múa lộn lẫy
│   ├── GeneralRenderer.js      # Module dựng hình 2.5D Tướng (帥 / 將)
│   ├── AdvisorRenderer.js      # Module dựng hình 2.5D Sĩ (仕 / 士)
│   ├── ElephantRenderer.js     # Module dựng hình 2.5D Tượng (相 / 象)
│   ├── ChariotRenderer.js      # Module dựng hình 2.5D Xe (俥 / 車)
│   ├── HorseRenderer.js        # Module dựng hình 2.5D Mã (傌 / 馬)
│   ├── CannonRenderer.js       # Module dựng hình 2.5D Pháo (炮 / 砲)
│   ├── PawnRenderer.js         # Module dựng hình 2.5D Tốt (兵 / 卒)
│   └── BattlefieldRenderer.js  # Module vẽ Bàn cờ Chiến Trường Ngũ Hành
├── assets/                     # Tài nguyên hình ảnh, Biểu tượng app
├── android/                    # Mã nguồn dự án Android Native (Capacitor)
├── package.json                # Cấu hình dự án & Dependencies
└── README.md                   # Tài liệu giới thiệu game & Thông tin tác giả
```

---

## 🚀 HƯỚNG DẪN KHỞI CHẠY GAME

1. **Chạy trực tiếp trên Web Browser:**
   * Mở trực tiếp file `index.html` bằng bất kỳ trình duyệt web nào (Google Chrome, Microsoft Edge, Safari, Firefox).

2. **Chạy trên thiết bị Android / Simulator:**
   ```bash
   npx cap sync android
   npx cap open android
   ```

---

## 📜 GIẤY PHÉP & BẢN QUYỀN

* Bản quyền thuộc về **Mê Cafe**.
* Hotline / Zalo hỗ trợ kỹ thuật: **0907.900.506**.
