// ตั้งค่า Supabase ของร้านที่ไฟล์นี้
// 1) สร้าง Project ที่ https://supabase.com
// 2) คัดลอก Project URL และ anon/public key จาก Project Settings > API
// 3) วางค่าลงด้านล่าง ห้ามใส่ service_role key ในเว็บไซต์เด็ดขาด
window.APP_CONFIG = {
  SUPABASE_URL: "https://icsvbgedqxkfmudplxdk.supabase.co", 
  SUPABASE_ANON_KEY: "sb_publishable_68Y8UnxmgomI60q3eoVnsw_sTPwpnWH",
  RESTAURANT_NAME: "ซะป๊ะกุ้งแซ่บ & แซ่บนัวชัวลี่",
  KITCHEN_PIN: "199199",
   // ต้องมีชุดข้อมูลตรงนี้ โค้ดถึงจะแปลง shop01 เป็นชื่อร้านได้ครับ
 SHOPS: {
   "shop01": "ซะป๊ะกุ้งแซ่บ",
   "shop02": "แซ่บนัว",
   "shop03": "แซ่บsomuch",
   "shop04": "CHI'll",
 }
}
