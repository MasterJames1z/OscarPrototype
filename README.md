# OscarPrototype - Weighbridge Management System

โปรเจคระบบจัดการตั๋วชั่งน้ำหนักและราคาสินค้า พัฒนาด้วย React + TypeScript (Frontend) และ Node.js + Express + MSSQL (Backend)

## 🚀 Features

- **ระบบตั๋วชั่งน้ำหนัก (Weighbridge Tickets)**
  - สร้างและจัดการตั๋วชั่งน้ำหนัก
  - คำนวณน้ำหนักสุทธิ ความชื้น และสิ่งเจือปน
  - ดึงราคาสินค้าอัตโนมัติจากฐานข้อมูล
  - อนุมัติตั๋วและติดตามสถานะ

- **ระบบจัดการราคาสินค้า (Product Pricing)**
  - กำหนดราคาสินค้าตามช่วงวันที่
  - แสดงผลในรูปแบบ Timeline และ Card View
  - รองรับการตั้งราคาแบบวันเดียวหรือช่วงเวลา

- **Master Data Management**
  - จัดการข้อมูลสินค้า (Products)
  - จัดการข้อมูลผู้ขาย (Vendors)
  - จัดการข้อมูลรถ (Vehicles)

## 📋 Prerequisites

- Node.js (v18 หรือสูงกว่า)
- SQL Server Database
- npm หรือ yarn

## 🛠️ Installation

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/OscarPrototype.git
cd OscarPrototype
```

### 2. ติดตั้ง Dependencies

#### Frontend
```bash
npm install
```

#### Backend
```bash
cd backend
npm install
```

### 3. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` ในโฟลเดอร์ `backend/` โดยคัดลอกจาก `.env.example`:

```bash
cd backend
cp .env.example .env
```

แก้ไขไฟล์ `.env` ให้ตรงกับข้อมูล Database ของคุณ:

```env
PORT=5000
DB_USER=your_database_username
DB_PASSWORD=your_database_password
DB_SERVER=your_database_server_ip
DB_DATABASE=your_database_name
DB_PORT=1433
DB_ENCRYPT=true
DB_TRUST_SERVER_CERTIFICATE=true
```

### 4. ตั้งค่า Database

ตรวจสอบให้แน่ใจว่า SQL Server Database มีตารางต่อไปนี้:

- `S6_WeightBridge_Products` - ข้อมูลสินค้า
- `S6_WeightBridge_Vendors` - ข้อมูลผู้ขาย
- `S6_WeightBridge_Vehicles` - ข้อมูลรถ
- `S6_WeightBridge_ProductPrices` - ราคาสินค้า
- `S6_WeightBridge_WeighTickets` - ตั๋วชั่งน้ำหนัก

## 🚀 Running the Application

### Development Mode

#### 1. เริ่ม Backend Server
```bash
cd backend
npm run dev
```
Backend จะรันที่ `http://localhost:5000`

#### 2. เริ่ม Frontend (Terminal ใหม่)
```bash
npm run dev
```
Frontend จะรันที่ `http://localhost:5173`

### Production Build

#### Frontend
```bash
npm run build
npm run preview
```

#### Backend
```bash
cd backend
npm start
```

## 📁 Project Structure

```
OscarPrototype/
├── backend/
│   ├── .env.example          # ตัวอย่างการตั้งค่า environment
│   ├── db.js                 # Database connection
│   ├── server.js             # Express server & API endpoints
│   └── package.json
├── src/
│   ├── components/           # React components
│   ├── hooks/                # Custom React hooks
│   ├── pages/                # Page components
│   ├── types/                # TypeScript type definitions
│   ├── utils/                # Utility functions
│   └── context/              # React context
├── public/                   # Static assets
└── package.json
```

## 🔒 Security Notes

**⚠️ สำคัญมาก:**
- **ห้าม commit ไฟล์ `.env`** ขึ้น Git
- ไฟล์ `.env` ถูก ignore โดย `.gitignore` แล้ว
- ใช้ `.env.example` เป็นตัวอย่างเท่านั้น
- เปลี่ยน Database credentials ทุกครั้งก่อน deploy production

## 🌐 Deployment

### Backend Deployment (เช่น Railway, Render, Heroku)

1. Push โค้ดขึ้น GitHub
2. เชื่อมต่อ Repository กับ Platform
3. ตั้งค่า Environment Variables ใน Platform Dashboard:
   - `PORT`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_SERVER`
   - `DB_DATABASE`
   - `DB_PORT`
   - `DB_ENCRYPT`
   - `DB_TRUST_SERVER_CERTIFICATE`

### Frontend Deployment (เช่น Vercel, Netlify)

1. Build โปรเจค: `npm run build`
2. Deploy โฟลเดอร์ `dist/`
3. ตั้งค่า Environment Variable สำหรับ API URL (ถ้าจำเป็น)

## 🔧 API Endpoints

### Products
- `GET /api/products` - ดึงรายการสินค้าทั้งหมด

### Vendors
- `GET /api/vendors` - ดึงรายการผู้ขายทั้งหมด

### Vehicles
- `GET /api/vehicles` - ดึงรายการรถทั้งหมด

### Product Prices
- `GET /api/product-prices` - ดึงรายการราคาทั้งหมด
- `GET /api/product-prices/active/:productId?date=YYYY-MM-DD` - ดึงราคาที่ใช้งานอยู่
- `POST /api/product-prices` - สร้าง/อัปเดตราคา
- `DELETE /api/product-prices/:id` - ลบราคา

### Tickets
- `GET /api/tickets` - ดึงรายการตั๋วทั้งหมด
- `POST /api/tickets` - สร้างตั๋วใหม่
- `PATCH /api/tickets/:id/approve` - อนุมัติตั๋ว

## 📝 License

This project is private and proprietary.

## 👥 Contributors

- Your Name - Initial work

## 📞 Support

หากมีปัญหาหรือข้อสงสัย กรุณาติดต่อ: your-email@example.com
