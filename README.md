# 🏠 Nội Thất 3D – Interactive Showcase

> **Chuyên đề: Thiết kế và Lập trình Đồ họa Nâng cao**  
> Xây dựng ứng dụng Web 3D tương tác với Three.js + Vite, cho phép khám phá và tùy chỉnh không gian nội thất thời gian thực.

---

## 🚀 Demo nhanh

```bash
npm install
npm run dev
```

Mở trình duyệt tại `http://localhost:5173`

---

## 🛠 Công nghệ sử dụng

- **Three.js** – Engine đồ họa 3D (Scene, Camera, Renderer, Lights, Materials)
- **Vite** – Dev server + bundler cực nhanh
- **DRACO Loader** – Giải nén và tải mô hình GLB/GLTF nhanh hơn
- **OrbitControls** – Điều khiển camera xoay/zoom bằng chuột hoặc cảm ứng
- **Blender** – Tạo và xuất mô hình 3D định dạng GLB
- **Lighthouse / Spector.js** – Kiểm tra hiệu năng tải trang và draw calls

---

## 📁 Cấu trúc thư mục

```
3d/
├── index.html              # Entry HTML, chứa toàn bộ UI tĩnh
├── vite.config.js          # Cấu hình Vite
├── public/
│   └── models/             # File mô hình .glb
└── src/
    ├── main.js             # Điểm khởi động ứng dụng
    ├── config/
    │   └── uiGroups.js     # Cấu hình nhóm đối tượng (Sofa, Đèn, Tường…)
    ├── core/
    │   ├── Renderer.js     # Khởi tạo WebGL Renderer
    │   ├── Scene.js        # Khởi tạo Scene + fog/background
    │   └── Camera.js       # PerspectiveCamera
    ├── controls/
    │   └── OrbitControls.js
    ├── lights/
    │   └── LightSystem.js  # Ambient, Directional, Point, Spot
    ├── objects/
    │   └── ObjectManager.js # Tải GLB, phân nhóm, quản lý mesh
    ├── materials/
    │   └── MaterialFactory.js # Tạo các loại vật liệu (Standard, Phong, Toon…)
    ├── ui/
    │   └── UIPanel.js      # Xử lý sự kiện bảng điều khiển
    ├── utils/
    │   ├── Performance.js  # Hiển thị FPS, Draw Calls
    │   └── Picker.js       # Raycasting – click chọn đối tượng
    └── styles/
        └── main.css
```

---

## 🎮 Hướng dẫn sử dụng

### 1. Điều hướng camera

- **Kéo chuột trái** – Xoay góc nhìn quanh cảnh
- **Cuộn chuột giữa** – Zoom in / zoom out
- **Kéo chuột phải** – Di chuyển (pan) điểm nhìn
- **Click vào vật thể** – Chọn và hiển thị tên đối tượng ở thanh đáy

---

### 2. Bảng điều khiển bên phải (⚙ Control Panel)

Nhấn nút **‹ / ›** ở cạnh trái bảng để thu gọn hoặc mở rộng panel.

Panel gồm **3 tab**:

---

#### 📦 Tab "Vật thể" – Bật/tắt nhóm đối tượng

Danh sách các nhóm được cấu hình trong `uiGroups.js`:

- **Bộ Ghế Sofa** – Toàn bộ mesh thuộc bộ ghế sofa
- **Đèn Cây** – Hệ thống đèn trang trí trong phòng
- **Hệ Tường & Sàn** – Tường, sàn nhà
- **Đồ Decor Khác** – Các vật trang trí còn lại

**Cách dùng:** Gạt toggle ☑ cạnh tên nhóm để **hiện / ẩn** toàn bộ nhóm đó trong cảnh.

---

#### 🎨 Tab "Vật liệu" – Thay đổi vật liệu thời gian thực

1. **Chọn đối tượng** trong dropdown (hoặc click trực tiếp lên mesh trong cảnh).
2. **Chọn loại vật liệu**:
   - 🔄 **Gốc (Original)** – Giữ nguyên vật liệu gốc từ file GLB
   - **Standard (PBR)** – Vật liệu vật lý thực tế, hỗ trợ Roughness & Metalness
   - **Phong (Shiny)** – Bề mặt bóng kiểu cổ điển
   - **Toon (Cel-shading)** – Hiệu ứng hoạt hình / cartoon
   - **Wireframe** – Hiển thị khung lưới tam giác
   - **Normal Map** – Hiển thị bản đồ pháp tuyến (debug)
3. **Chỉnh màu sắc** bằng color picker.
4. Với loại **Standard / Phong**, điều chỉnh thêm:
   - **Roughness** (0 = bóng loáng → 1 = mờ đục)
   - **Metalness** (0 = nhựa → 1 = kim loại)
5. Nhấn **✓ Áp dụng vật liệu** để xác nhận.

---

#### 💡 Tab "Ánh sáng" – Điều chỉnh hệ thống đèn

Có **4 loại đèn** độc lập:

- 🌐 **Ambient Light** – Ánh sáng môi trường, chiếu đều toàn cảnh
- ☀️ **Directional Light** – Ánh sáng mặt trời (song song, có phương)
- 💡 **Point Light** – Đèn điểm tỏa ra mọi hướng (như bóng đèn)
- 🔦 **Spot Light** – Đèn rọi theo hình nón (như đèn sân khấu)

Với mỗi đèn có thể:

- **Bật / tắt** bằng toggle switch.
- **Kéo slider Cường độ** để thay đổi độ sáng.
- **Chọn màu** đèn bằng color picker (trừ Ambient).

---

### 3. Thanh thông tin phía trên (Top Bar)

Góc trên phải hiển thị chỉ số hiệu năng thời gian thực:

- **FPS** – Số khung hình mỗi giây (≥ 45 FPS là đạt yêu cầu).
- **DC** – Số Draw Calls (mục tiêu ≤ 300).

---

### 4. Thanh trạng thái phía dưới (Bottom Bar)

- Nhắc nhở thao tác chuột.
- Hiển thị **tên đối tượng đang được chọn** sau khi click vào mesh.

---

## 📋 Checklist yêu cầu chuyên đề

- ✅ **Website 3D có bảng điều khiển UI** – Panel bên phải với 3 tab
- ✅ **Thay đổi vật liệu theo thời gian thực** – Tab Vật liệu, 5 loại vật liệu
- ✅ **Thay đổi ánh sáng theo thời gian thực** – Tab Ánh sáng, 4 loại đèn
- ✅ **Thời gian tải < 5s (mạng 20 Mbps)** – DRACO + GLB tối ưu
- ✅ **Cảnh ≥ 10 đối tượng** – Hàng trăm mesh được quản lý qua `ObjectManager`
- ✅ **≥ 3 loại vật liệu** – Standard, Phong, Toon, Wireframe, Normal
- ✅ **≥ 2 kiểu ánh sáng (Directional + Point/Spot)** – Có đủ 4 loại
- ✅ **Tương tác: xoay/zoom, bật/tắt layer** – OrbitControls + Tab Vật thể
- ✅ **Hiệu năng ≥ 45 FPS** – Shadow tắt, vật liệu Lambert/Standard
- ⚠️ **Draw calls ≤ 300** – Phụ thuộc độ phức tạp mô hình
- 📌 **Code demo (GitHub Pages/Netlify)** – Deploy sau khi hoàn thiện
- 📌 **Video demo 2–3 phút** – Quay màn hình thao tác đầy đủ
- ✅ **Tài liệu hướng dẫn** – File này

---

## ⚡ Build & Deploy

```bash
# Build production
npm run build

# Preview bản build
npm run preview
```

Thư mục `dist/` chứa toàn bộ static files, có thể deploy lên **GitHub Pages** hoặc **Netlify** trực tiếp.

---

## 👥 Nhóm thực hiện

> Chuyên đề: **Thiết kế và Lập trình Đồ họa Nâng cao**
> Thành viên:
>
> - Nguyễn Ngọc Hải Đăng - 2115244
> - Trần Quốc Khánh - 2115244
>
> Công cụ: Three.js · Vite · GLTF/GLB · Blender · Lighthouse · Spector.js
