-- รัน SQL นี้ใน Supabase Dashboard > SQL Editor > New query
create extension if not exists pgcrypto;
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  table_no integer not null check (table_no between 1 and 5),
  items jsonb not null,
  total_amount numeric(10,2) not null default 0,
  note text default '',
  status text not null default 'new' check (status in ('new','accepted','cooking','completed','cancelled')),
  created_at timestamptz not null default now()
);
alter table public.orders enable row level security;
-- นโยบายตัวอย่างสำหรับทดลอง: ผู้ถือ anon key อ่าน/เพิ่ม/แก้ไขได้
-- ก่อนเปิดใช้งานจริงควรเพิ่มระบบยืนยันตัวตนครัวและจำกัดสิทธิ์ UPDATE
drop policy if exists "public insert orders" on public.orders;
create policy "public insert orders" on public.orders for insert to anon with check (table_no between 1 and 5);
drop policy if exists "public read orders demo" on public.orders;
create policy "public read orders demo" on public.orders for select to anon using (true);
drop policy if exists "public update orders demo" on public.orders;
create policy "public update orders demo" on public.orders for update to anon using (true) with check (true);
-- เปิด Realtime ให้ตาราง orders
alter publication supabase_realtime add table public.orders;
