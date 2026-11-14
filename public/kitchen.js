// ดึงพาร์ท URL มาแยกส่วน
const pathSegments = window.location.pathname.split('/').filter(Boolean);
const shopId = (pathSegments.length > 0 && pathSegments[0] !== 'kitchen' && !pathSegments[0].includes('.html')) 
  ? pathSegments[0] 
  : null;

const cfg = window.APP_CONFIG;
const $ = id => document.getElementById(id);

// ดักจับ Error ไว้ป้องกันเว็บค้าง กรณีลืมใส่ id="brand" หรือยังไม่ตั้งค่า SHOPS
if ($("brand") && cfg.SHOPS) {
    $("brand").textContent = cfg.SHOPS[shopId] || "ไม่พบข้อมูลร้าน";
}

let db = null;
let channel = null;

// ===== ระบบเสียงแจ้งเตือน =====
let kitchenAudio = null;
let soundEnabled = false;

$("enableSound").onclick = async () => {
  try {
    if (!kitchenAudio) {
      kitchenAudio = new (
        window.AudioContext || window.webkitAudioContext
      )();
    }

    await kitchenAudio.resume();

    soundEnabled = true;

    $("soundStatus").textContent = "เปิดเสียงแล้ว";
    $("enableSound").textContent = "🔔 เสียงเปิดอยู่";

    // ทดลองเสียงเมื่อกดเปิด
    playNewOrderAlert();

  } catch (e) {
    $("soundStatus").textContent = "เปิดเสียงไม่สำเร็จ";
    console.error(e);
  }
};

// เสียงเตือน 5 ครั้ง
function playNewOrderAlert() {
  if (!soundEnabled || !kitchenAudio) return;

  const now = kitchenAudio.currentTime;

  // เสียงปี๊บ 5 ครั้ง
  for (let i = 0; i < 8; i++) {
    const delay = i * 0.35;

    const oscillator = kitchenAudio.createOscillator();
    const gain = kitchenAudio.createGain();

    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(1100, now + delay);

    oscillator.connect(gain);
    gain.connect(kitchenAudio.destination);

    gain.gain.setValueAtTime(0.0001, now + delay);
    gain.gain.exponentialRampToValueAtTime(0.18, now + delay + 0.02);
    gain.gain.setValueAtTime(0.18, now + delay + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.16);

    oscillator.start(now + delay);
    oscillator.stop(now + delay + 0.18);
  }
}

// ===== เชื่อมต่อ Supabase =====
function connect() {
  if (
    !cfg.SUPABASE_URL.startsWith("https://") ||
    cfg.SUPABASE_ANON_KEY.includes("ใส่_")
  ) {
    throw Error("ตั้งค่า Supabase ใน config.js ก่อน");
  }

  db = window.supabase.createClient(
    cfg.SUPABASE_URL,
    cfg.SUPABASE_ANON_KEY
  );
}

// ===== เข้าสู่หน้าครัว =====  
$("login").onclick = async () => {  
 try {  
 // เพิ่มการเช็คว่ามี shopId ไหม
 if (!shopId) {
     throw Error("ไม่พบรหัสร้านใน URL กรุณาเข้าผ่านลิงก์ร้านตัวเอง เช่น /shop01/kitchen");
 }
 if ($("pin").value !== cfg.KITCHEN_PIN) {  
     throw Error("รหัสไม่ถูกต้อง");  
 }  
  
 connect();  
 $("board").classList.remove("hidden");  
 $("msg").textContent = "";  
 await load();  
  
 // ปรับแก้ Channel ให้กรองรับเฉพาะออเดอร์ร้านตัวเอง (shopId)
 channel = db.channel(`kitchen-orders-${shopId}`)  
 .on(  
 "postgres_changes",  
 {  
 event: "INSERT",  
 schema: "public",  
 table: "orders",
 filter: `shop_id=eq.${shopId}` // <--- จุดที่เพิ่ม: กรองเอาเฉพาะที่ตรงกับร้านนี้
 },  
 payload => {  
 console.log("ออเดอร์ใหม่:", payload.new);  
 playNewOrderAlert();  
 load();  
 }  
 )  
 .subscribe();  
  
 } catch (e) {  
 $("msg").textContent = e.message;  
 }  
};  

$("refresh").onclick = load;  


// ===== โหลดรายการออเดอร์ =====
async function load() {  
 if (!db || !shopId) return;  
  
 const { data, error } = await db  
 .from("orders")  
 .select("*")  
 .eq("shop_id", shopId) // <--- จุดที่เพิ่ม: ฟิลเตอร์ดึงออเดอร์เฉพาะร้านตัวเอง
 .order("created_at", { ascending: false })  
 .limit(100);  

  if (error) {
    $("orders").textContent = error.message;
    return;
  }

  $("orders").innerHTML = (data || []).map(o => `
    <article class="order">
      <div class="row">
        <h3>
          โต๊ะ ${o.table_no} ·
          ${new Date(o.created_at).toLocaleString("th-TH")}
        </h3>
        <span class="status">${statusName(o.status)}</span>
      </div>

      ${(o.items || []).map(i => `
        <div class="row">
          <span>${esc(i.name)} × ${i.qty}</span>
          <b>${i.qty * i.unit_price} บาท</b>
        </div>
      `).join("")}

      <div class="muted">
        หมายเหตุ: ${esc(o.note || "-")}
      </div>

      <div class="row">
        <b>รวม ${o.total_amount} บาท</b>
      </div>

      <div class="actions no-print">
        <button class="btn"
          onclick="setStatus('${o.id}','accepted')">
          รับออเดอร์
        </button>

        <button class="btn"
          onclick="setStatus('${o.id}','cooking')">
          กำลังทำ
        </button>

        <button class="btn"
          onclick="setStatus('${o.id}','completed')">
          เสร็จแล้ว
        </button>

        <button class="btn secondary"
          onclick="printOne('${o.id}')">
          พิมพ์ใบนี้
        </button>
      </div>
    </article>
  `).join("") || "ยังไม่มีออเดอร์";
}

// ===== ชื่อสถานะ =====
function statusName(s) {
  return ({
    new: "ออเดอร์ใหม่",
    accepted: "รับออเดอร์แล้ว",
    cooking: "กำลังทำ",
    completed: "เสร็จแล้ว",
    cancelled: "ยกเลิก"
  })[s] || s;
}

// ===== ป้องกัน HTML แปลกปลอม =====
function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

// ===== เปลี่ยนสถานะ =====
window.setStatus = async (id, status) => {
  const { error } = await db
    .from("orders")
    .update({ status })
    .eq("id", id);

  if (error) alert(error.message);
  else load();
};

// ===== พิมพ์ใบออเดอร์ =====
window.printOne = async (id) => {
  const { data, error } = await db
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return alert(error.message);

  const w = window.open(
    "",
    "_blank",
    "width=420,height=650"
  );

  if (!w) {
    return alert("อนุญาตหน้าต่างป๊อปอัปเพื่อพิมพ์");
  }

  w.document.write(`
    <html>
    <meta charset="utf-8">
    <body style="font-family:sans-serif">
      <h2>ซะป๊ะกุ้งแซ่บ</h2>
      <h3>โต๊ะ ${data.table_no}</h3>
      <p>${new Date(data.created_at).toLocaleString("th-TH")}</p>

      ${(data.items || []).map(i => `
        <p>
          ${esc(i.name)} × ${i.qty}
          = ${i.qty * i.unit_price} บาท
        </p>
      `).join("")}

      <hr>
      <b>รวม ${data.total_amount} บาท</b>
      <p>หมายเหตุ: ${esc(data.note || "-")}</p>

      <script>
        window.onload = () => window.print()
      <\/script>
    </body>
    </html>
  `);

  w.document.close();
};
