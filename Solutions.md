# Solutions

เอกสารสรุปฟีเจอร์และ API ที่มีในระบบจัดการรถ Haupcar

## ภาพรวมระบบ

- Backend: Node.js, Express และ Prisma ORM
- Database: PostgreSQL
- Frontend: React และ Vite แบบหลายหน้า
- รูปแบบคำตอบ API: `{ "Status": 200, "Data": {} }` โดย `Status` ตรงกับ HTTP status code
- ID ของข้อมูลที่เป็น `BigInt` จะส่งกลับเป็น string เพื่อให้ JSON รองรับ

## เริ่มต้นใช้งาน

### Backend

1. สร้างฐานข้อมูล PostgreSQL และตั้งค่า `DATABASE_URL` กับ `JWT_SECRET` ใน `backend/.env` โดย JWT secret ต้องมีความยาวอย่างน้อย 32 bytes
2. ติดตั้ง dependencies และสร้าง Prisma Client:

   ```bash
   cd backend
   npm install
   npm run db:generate
   ```

3. ใช้ migrations และ seed ข้อมูลเริ่มต้น:

   ```bash
   npm run db:deploy
   npm run db:seed
   ```

4. เริ่ม Backend:

   ```bash
   npm run dev
   ```

Backend เปิดที่ `http://localhost:5000` โดยปกติ

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Vite แสดง URL สำหรับเปิดเว็บ โดย `/` จะนำไปหน้า Login ส่วนหน้า HTML โดยตรงคือ `/login.html` และ `/dashboard.html` โดย Dashboard ต้องเข้าสู่ระบบก่อน

### บัญชีสำหรับ Development

Seeder สร้างบัญชี `Somchai` รหัสผ่าน `1234` สำหรับ Development เท่านั้น Seeder ไม่ทำงานเมื่อ `NODE_ENV=production` และควรเปลี่ยนข้อมูลบัญชีก่อน deploy

## Authentication

### เข้าสู่ระบบ

`POST /api/auth/login` รับ JSON:

```json
{
  "username": "Somchai",
  "password": "1234"
}
```

เมื่อล็อกอินสำเร็จจะได้ JWT อายุ 1 ชั่วโมง:

```json
{
  "Status": 200,
  "Data": {
    "token": "<JWT_TOKEN>",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "user": {
      "id": "1",
      "username": "Somchai"
    }
  }
}
```

Login จำกัด 10 ครั้งต่อ IP ใน 15 นาที API ของ Vehicle และ VehicleBrand ต้องส่ง token ผ่าน header:

```http
Authorization: Bearer <JWT_TOKEN>
```

## Folder API

เส้นทาง `/api/folders` ปัจจุบันไม่ได้บังคับ JWT

| Method | Path | รายละเอียด |
| --- | --- | --- |
| `GET` | `/api/folders` | แสดงโฟลเดอร์ทั้งหมด |
| `GET` | `/api/folders/:id` | แสดงโฟลเดอร์ตาม ID |
| `POST` | `/api/folders` | เพิ่มโฟลเดอร์ |
| `PUT` | `/api/folders/:id` | แก้ไขชื่อโฟลเดอร์ |
| `DELETE` | `/api/folders/:id` | ลบโฟลเดอร์ |

ตัวอย่าง body สำหรับเพิ่ม:

```json
{ "name": "Documents" }
```

ตัวอย่าง body สำหรับแก้ไข:

```json
{ "name": "Archive" }
```

ชื่อโฟลเดอร์ห้ามว่างและยาวได้ไม่เกิน 255 ตัวอักษร ข้อมูลที่ตอบกลับมี `id`, `name`, `created_at` และ `updated_at`

## VehicleBrand API

ทุก endpoint ต้องส่ง JWT

| Method | Path | รายละเอียด |
| --- | --- | --- |
| `GET` | `/api/vehicle-brands` | แสดงยี่ห้อทั้งหมด เรียงตามชื่อ |
| `GET` | `/api/vehicle-brands/:id` | แสดงยี่ห้อตาม ID |
| `POST` | `/api/vehicle-brands` | เพิ่มยี่ห้อ |
| `PUT` | `/api/vehicle-brands/:id` | แก้ไขชื่อยี่ห้อ |
| `DELETE` | `/api/vehicle-brands/:id` | ลบยี่ห้อที่ไม่มีรถใช้งาน |

ตัวอย่าง body สำหรับเพิ่มหรือแก้ไข:

```json
{ "name": "Toyota" }
```

ชื่อยี่ห้อต้องไม่ว่าง ยาวไม่เกิน 100 ตัวอักษร และห้ามซ้ำ หากยี่ห้อยังถูกใช้โดยรถอยู่จะลบไม่ได้

## Vehicle API

ทุก endpoint ต้องส่ง JWT

| Method | Path | รายละเอียด |
| --- | --- | --- |
| `GET` | `/api/vehicles` | แสดงรถ และค้นหาหรือกรองข้อมูล |
| `POST` | `/api/vehicles` | เพิ่มรถ |
| `PUT` | `/api/vehicles/:id` | แก้ไขข้อมูลรถ |
| `DELETE` | `/api/vehicles/:id` | ลบรถ |

ตัวอย่าง body สำหรับเพิ่มและแก้ไข:

```json
{
  "licensePlate": "NEW-123",
  "brandId": 1,
  "model": "Corolla",
  "vehicleType": "Gasoline",
  "notes": "Company vehicle"
}
```

- `licensePlate`: ต้องระบุ ไม่เกิน 20 ตัวอักษร และห้ามซ้ำ
- `brandId`: ID ยี่ห้อรถที่มีอยู่
- `model`: ต้องระบุ ไม่เกิน 100 ตัวอักษร
- `vehicleType`: เลือก `Electric`, `Gasoline` หรือ `Hybrid`
- `notes`: ไม่บังคับ ส่งเป็น string หรือ `null`

พารามิเตอร์ค้นหาของ `GET /api/vehicles`:

| Parameter | รายละเอียด |
| --- | --- |
| `search` | ค้นหาบางส่วนแบบไม่แยกตัวพิมพ์ในทะเบียน รุ่น หรือชื่อยี่ห้อ |
| `licensePlate` | ค้นหาบางส่วนในทะเบียน |
| `brandId` | กรองด้วย ID ยี่ห้อ |
| `model` | ค้นหาบางส่วนในชื่อรุ่น |
| `vehicleType` | กรองตามชนิด `Electric`, `Gasoline` หรือ `Hybrid` |

รวมตัวกรองได้ เช่น:

```text
GET /api/vehicles?search=toy&vehicleType=Hybrid
```

## HTTP Status ที่พบบ่อย

| Status | ความหมาย |
| --- | --- |
| `200` | อ่าน แก้ไข หรือลบสำเร็จ |
| `201` | สร้างข้อมูลสำเร็จ |
| `400` | ข้อมูลหรือ ID ไม่ถูกต้อง |
| `401` | ไม่มี JWT หรือ JWT ไม่ถูกต้อง/หมดอายุ |
| `404` | ไม่พบข้อมูล |
| `409` | ข้อมูลซ้ำ หรือมีความสัมพันธ์ที่ป้องกันการลบ |
| `429` | Login เกินจำนวนครั้งที่กำหนด |

## Frontend Dashboard

- หน้า Login แยกเป็น `frontend/login.html`
- หน้า Dashboard แยกเป็น `frontend/dashboard.html` และต้องเข้าสู่ระบบก่อน
- JWT เก็บใน `sessionStorage` และถูกลบเมื่อออกจากระบบหรือ token หมดอายุ
- หน้า Vehicles รองรับค้นหา กรองชนิดรถ แบ่งหน้า เพิ่มรถ แก้ไขรถ และลบรถพร้อมยืนยัน
- หน้า Brands รองรับแสดง เพิ่ม แก้ไข และลบยี่ห้อ
- แสดง Toast แจ้งผลเมื่อเพิ่ม แก้ไข หรือลบข้อมูลสำเร็จ
