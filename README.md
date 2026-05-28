# Biexce CRM Admin Backend

Dự án Backend cho hệ thống Biexce CRM Admin, được xây dựng bằng **NestJS**, **TypeORM** và **MySQL**.

---

## 🚀 Hướng dẫn khởi chạy dự án

### 1. Yêu cầu hệ thống
- Máy tính đã cài đặt **Node.js** (khuyên dùng bản LTS từ v18 trở lên).
- Đã cài đặt package manager **Yarn**.
- Đã có sẵn dịch vụ **MySQL** (hoặc MariaDB) đang chạy.

### 2. Cài đặt thư viện
Mở terminal tại thư mục dự án và chạy lệnh sau để tải các gói phụ thuộc:
```bash
yarn install
```

### 3. Cấu hình môi trường
Tạo hoặc mở file **`.env`** tại thư mục gốc của dự án. Đảm bảo bạn đã điền đúng thông tin kết nối Database của máy bạn:
```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=mat_khau_cua_ban
DB_NAME=ten_database_cua_ban
DB=mysql

# JWT Auth
JWT_SECRET=chuoi_bi_mat_cua_ban
JWT_EXPIRES_IN=1d
```

### 4. Cập nhật Database (Migration)
Trước khi chạy ứng dụng lần đầu, bạn cần đồng bộ cấu trúc bảng vào MySQL bằng lệnh:
```bash
yarn m:r
```
*(Lệnh này sẽ tự động chạy các file đã được code sẵn trong `src/database/migrations` vào DB của bạn).*

### 5. Khởi chạy ứng dụng

**Môi trường phát triển (Development):**
Khuyên dùng khi đang code, hệ thống sẽ tự khởi động lại khi bạn lưu file.
```bash
yarn dev
```

**Môi trường thực tế (Production):**
Khuyên dùng khi triển khai lên server thật.
```bash
yarn build
yarn start:prod
```

---

## 🛠 Hướng dẫn thao tác với Database (Dành cho Dev)

Khi bạn chỉnh sửa hoặc tạo mới file Entity (ví dụ `user.entity.ts`), bạn phải làm 2 bước để cập nhật Database:

1. **Sinh file Migration tự động:**
   ```bash
   yarn m:g TenMoTaSuThayDoi
   ```
   *(Ví dụ: `yarn m:g AddUserTable`)*
2. **Áp dụng vào Database:**
   ```bash
   yarn m:r
   ```

**Nếu lỡ làm sai và muốn quay lại (Undo):**
```bash
yarn m:rv
```
