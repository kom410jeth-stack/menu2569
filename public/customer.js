const cfg=window.APP_CONFIG, menu=window.MENU_ITEMS.filter(x=>x.active);
const params=new URLSearchParams(location.search); const table=Number(params.get("table"));
const cart={}; const $=id=>document.getElementById(id);
$("brand").textContent=cfg.RESTAURANT_NAME;
$("tableLabel").textContent=Number.isInteger(table)&&table>=1&&table<=5?`โต๊ะ ${table}`:"ไม่พบหมายเลขโต๊ะ กรุณาสแกน QR ประจำโต๊ะอีกครั้ง";
function client(){if(!cfg.SUPABASE_URL.startsWith("https://")||cfg.SUPABASE_ANON_KEY.includes("ใส่_"))throw Error("ยังไม่ได้ตั้งค่า Supabase ในไฟล์ public/config.js");return window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY)}
function render(){
 $("menu").innerHTML=menu.map(m=>`<article class="item">

<img
      src="${esc(m.image || '/images/no-image.jpg')}"
      alt="${esc(m.name)}"
      class="menu-image"
      onerror="this.src='/images/no-image.jpg'"
    >
 
 <h3>${esc(m.name)}</h3><div class="price">${m.price} บาท</div><div class="controls"><button class="secondary" onclick="change('${m.id}',-1)">−</button><input id="q-${m.id}" value="${cart[m.id]||0}" readonly><button onclick="change('${m.id}',1)">+</button></div></article>`).join("");
 const lines=menu.filter(m=>cart[m.id]>0);$("cartLines").innerHTML=lines.length?lines.map(m=>`<div class="row"><span>${esc(m.name)} × ${cart[m.id]}</span><b>${m.price*cart[m.id]} บาท</b></div>`).join(""):"ยังไม่มีรายการ";
 $("total").textContent=lines.reduce((s,m)=>s+m.price*cart[m.id],0)+" บาท";
}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
window.change=(id,d)=>{cart[id]=Math.max(0,(cart[id]||0)+d);render()};
$("send").onclick=async()=>{const msg=$("message");msg.textContent="";
 try{if(!(table>=1&&table<=5))throw Error("หมายเลขโต๊ะไม่ถูกต้อง");
 const lines=menu.filter(m=>cart[m.id]>0).map(m=>({menu_id:m.id,name:m.name,qty:cart[m.id],unit_price:m.price}));
 if(!lines.length)throw Error("กรุณาเลือกอาหารอย่างน้อย 1 รายการ");
 const db=client();const total=lines.reduce((s,x)=>s+x.qty*x.unit_price,0);
 const {error}=await db.from("orders").insert({table_no:table,items:lines,total_amount:total,note:$("note").value,status:"new"});
 if(error)throw error;Object.keys(cart).forEach(k=>cart[k]=0);$("note").value="";render();msg.className="success";msg.textContent="ส่งออเดอร์เรียบร้อยแล้ว ขอบคุณครับ";
 }catch(e){msg.className="error";msg.textContent="ส่งออเดอร์ไม่สำเร็จ: "+e.message}};
render();

