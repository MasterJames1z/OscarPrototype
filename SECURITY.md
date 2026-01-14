# Security Checklist for GitHub Deployment

## ✅ ก่อน Push ขึ้น GitHub

### 1. ตรวจสอบ .gitignore
- [x] ไฟล์ `.env` ถูก ignore แล้ว
- [x] ไฟล์ `backend/.env` ถูก ignore แล้ว
- [x] `node_modules` ถูก ignore แล้ว

### 2. ตรวจสอบไฟล์ที่จะ Commit
```bash
# ดูว่ามีไฟล์อะไรบ้างที่จะถูก commit
git status

# ตรวจสอบว่าไม่มี .env ในรายการ
git ls-files | grep .env
```

### 3. ลบ .env ออกจาก Git History (ถ้าเคย commit ไปแล้ว)
```bash
# ลบไฟล์ออกจาก Git แต่เก็บไว้ใน local
git rm --cached backend/.env

# Commit การเปลี่ยนแปลง
git commit -m "Remove .env from version control"
```

### 4. สร้าง .env.example
- [x] สร้างไฟล์ `backend/.env.example` แล้ว
- [x] ใส่ค่า placeholder แทนข้อมูลจริง

## 🚀 ขั้นตอนการ Deploy

### สำหรับ Backend (Railway, Render, Heroku)

1. **Push โค้ดขึ้น GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **ตั้งค่า Environment Variables ใน Platform**
   - ไปที่ Dashboard ของ Platform
   - เพิ่ม Environment Variables:
     ```
     PORT=5000
     DB_USER=<your_actual_username>
     DB_PASSWORD=<your_actual_password>
     DB_SERVER=<your_actual_server>
     DB_DATABASE=<your_actual_database>
     DB_PORT=1433
     DB_ENCRYPT=true
     DB_TRUST_SERVER_CERTIFICATE=true
     ```

3. **Deploy**
   - Platform จะ auto-deploy จาก GitHub
   - ตรวจสอบ logs ว่า connect database สำเร็จ

### สำหรับ Frontend (Vercel, Netlify)

1. **อัปเดต API URL**
   - สร้างไฟล์ `.env` ใน root (ถ้าจำเป็น)
   ```env
   VITE_API_URL=https://your-backend-url.com
   ```

2. **Build และ Deploy**
   ```bash
   npm run build
   # Upload โฟลเดอร์ dist/ ไปยัง Platform
   ```

## ⚠️ สิ่งที่ต้องระวัง

### ❌ ห้ามทำ
- ❌ Commit ไฟล์ `.env` ขึ้น GitHub
- ❌ Hard-code password หรือ API keys ในโค้ด
- ❌ Share screenshot ที่มี credentials
- ❌ Commit database dumps ที่มีข้อมูลจริง

### ✅ ควรทำ
- ✅ ใช้ Environment Variables เสมอ
- ✅ ตรวจสอบ .gitignore ก่อน commit
- ✅ ใช้ .env.example เป็นตัวอย่าง
- ✅ เปลี่ยน credentials ก่อน deploy production
- ✅ ใช้ secrets management ของ Platform

## 🔍 ตรวจสอบความปลอดภัย

### ตรวจสอบว่า .env ไม่ถูก track
```bash
git ls-files | grep .env
# ถ้าไม่มีผลลัพธ์ = ปลอดภัย ✅
```

### ตรวจสอบ Git History
```bash
git log --all --full-history -- "*/.env"
# ถ้าไม่มีผลลัพธ์ = ปลอดภัย ✅
```

### ลบ Sensitive Data จาก History (ถ้าจำเป็น)
```bash
# ใช้ BFG Repo-Cleaner หรือ git filter-branch
# คำเตือน: อันตราย! ควรปรึกษาผู้เชี่ยวชาญก่อน
```

## 📚 Resources

- [GitHub: Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [Railway Environment Variables](https://docs.railway.app/develop/variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

## 🆘 ถ้าเผลอ Commit .env ไปแล้ว

1. **ลบออกจาก Git ทันที**
   ```bash
   git rm --cached backend/.env
   git commit -m "Remove .env"
   git push --force
   ```

2. **เปลี่ยน Credentials ทั้งหมดทันที**
   - เปลี่ยน Database password
   - เปลี่ยน API keys ทั้งหมด
   - Revoke tokens ที่อาจถูกเปิดเผย

3. **ตรวจสอบ Repository**
   - ตั้งค่า Repository เป็น Private (ถ้าเป็น Public)
   - ตรวจสอบ commit history

---

**สร้างโดย:** Antigravity AI Assistant
**วันที่:** 2026-01-14
