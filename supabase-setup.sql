-- GoldGame — راه‌اندازی دیتابیس (یک‌بار در Supabase > SQL Editor اجرا کن)
-- ------------------------------------------------------------------

-- جدول پروفایل بازیکنان (هر حساب = یک ردیف)
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  username   text not null,
  rank       text not null default 'Member',
  created_at timestamptz not null default now(),
  constraint username_format check (username ~ '^[A-Za-z0-9_]{3,16}$')
);

-- نام کاربری یکتا (بدون توجه به بزرگ/کوچک بودن حروف)
create unique index if not exists profiles_username_lower_idx
  on public.profiles (lower(username));

-- امنیت: هر کاربر فقط پروفایل خودش را می‌بیند.
-- هیچ سیاست insert/update/delete برای کاربران نیست؛ پس کسی نمی‌تواند
-- رنک یا نام کاربری را از داخل مرورگر دستکاری کند.
alter table public.profiles enable row level security;

drop policy if exists "own profile is readable" on public.profiles;
create policy "own profile is readable"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

-- با ساخته‌شدن هر حساب، پروفایل به‌صورت خودکار ساخته می‌شود
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- بررسی آزاد بودن نام کاربری (برای پیام «نام کاربری قبلاً گرفته شده»)
create or replace function public.username_available(name text)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select not exists (select 1 from public.profiles where lower(username) = lower(name));
$$;

grant execute on function public.username_available(text) to anon, authenticated;
