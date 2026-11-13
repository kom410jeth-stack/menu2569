# ระบบสั่งอาหาร QR — ซะป๊ะกุ้งแซ่บ & แซ่บนัวชัวลี่

## โครงสร้าง
- `public/index.html` หน้าเมนูลูกค้า (ต้องอยู่ตรงนี้เพื่อให้ Netlify หา index.html เจอ)
- `public/kitchen.html` หน้าครัว เปิดด้วย `/kitchen`
- `public/config.js` URL / anon key ของ Supabase และรหัสเข้าครัว
- `public/menu.js` รายการเมนูและราคา 14 รายการตัวอย่าง
- `supabase/schema.sql` สร้างตารางออเดอร์และ policy สำหรับทดลอง
- `netlify.toml` ตั้ง Publish directory เป็น `public`

## ขั้นตอนติดตั้ง

### A. ตั้งฐานข้อมูล Supabase
1. สมัคร/เข้าสู่ระบบ https://supabase.com แล้วสร้าง Project
2. เปิด SQL Editor > New query
3. คัดลอกเนื้อหา `supabase/schema.sql` ทั้งหมดไป Run
4. ไป Project Settings > API แล้วคัดลอก Project URL และ anon/public key

### B. ตั้งค่าเว็บไซต์
1. เปิด `public/config.js`
2. ใส่ค่า `SUPABASE_URL` และ `SUPABASE_ANON_KEY`
3. เปลี่ยน `KITCHEN_PIN` เป็นรหัสใหม่ของร้าน
4. เปิด `public/menu.js` แก้ชื่อและราคาเมนูให้ตรงร้าน

### C. Deploy Netlify
1. แตก ZIP
2. เข้า https://app.netlify.com/drop
3. ลากโฟลเดอร์ `public` ไปวางเพื่อทดสอบหน้าเว็บแบบ static
4. สำหรับ deploy ผ่าน Git ให้เชื่อม Git repository ที่เก็บทั้งโปรเจกต์ แล้วใช้ Build command `npm run build` และ Publish directory `public`
5. หลังได้ URL เช่น `https://ชื่อเว็บ.netlify.app` ให้เปิดลิงก์ทดสอบ

### D. QR Code โต๊ะ 1–5
สร้าง QR Code จาก URL เหล่านี้ โดยแทน `ชื่อเว็บ.netlify.app` ด้วยโดเมน Netlify จริง:
- `https://ชื่อเว็บ.netlify.app/?table=1`
- `https://ชื่อเว็บ.netlify.app/?table=2`
- `https://ชื่อเว็บ.netlify.app/?table=3`
- `https://ชื่อเว็บ.netlify.app/?table=4`
- `https://ชื่อเว็บ.netlify.app/?table=5`

### E. หน้าครัว
เปิด `https://ชื่อเว็บ.netlify.app/kitchen` บนโทรศัพท์ครัว แล้วกรอกรหัส `KITCHEN_PIN` ที่ตั้งไว้ใน config.js
กดรับออเดอร์ / กำลังทำ / เสร็จแล้ว หรือพิมพ์ใบออเดอร์แต่ละใบ

## ข้อควรทราบด้านความปลอดภัยและการพิมพ์
- ชุดนี้เป็นต้นแบบเพื่อทดสอบการไหลของออเดอร์ ไม่ควรเปิดใช้งานรับเงินจริงก่อนปรับสิทธิ์ฐานข้อมูลและระบบยืนยันตัวตนครัว
- `KITCHEN_PIN` ที่อยู่ในไฟล์ JavaScript มองเห็นได้จากผู้ใช้เว็บไซต์ จึงเป็นเพียงการซ่อนหน้าจอเบื้องต้น ไม่ใช่ความปลอดภัยจริง
- SQL policy ที่ให้มามีสิทธิ์อ่าน/แก้ไขออเดอร์แบบเปิดเพื่อการทดลองเท่านั้น ต้องจำกัดสิทธิ์ก่อนใช้งานจริง
- พิมพ์ผ่านหน้าต่าง Print ของโทรศัพท์/คอมพิวเตอร์ ต้องเลือกเครื่องพิมพ์เอง; ยังไม่ใช่ระบบพิมพ์อัตโนมัติเมื่อออเดอร์เข้า
- ต้องใช้อินเทอร์เน็ตทั้งลูกค้าและอุปกรณ์ครัว
- ราคา/ชื่อเมนูใน `menu.js` เป็นตัวอย่าง ต้องแก้เป็นเมนูจริงก่อนเปิดร้าน
