# GoldGame — سایت (GitHub Pages + Supabase)

## صفحه‌ها
`index` خانه · `shop` فروشگاه · `support` پشتیبانی · `rules` قوانین · `launcher` لانچر · `auth` ورود/ثبت‌نام · `account` حساب · `reset-password` بازیابی رمز

## راه‌اندازی دیتابیس (ورود / ثبت‌نام)
۱. در https://supabase.com یک پروژه بساز.
۲. **SQL Editor** ← محتوای فایل `supabase-setup.sql` را Paste و Run کن (جدول پروفایل، نام کاربری یکتا و امنیت RLS).
۳. **Project Settings ← API**: مقدار *Project URL* و *anon/publishable key* را داخل `assets/supabase-config.js` بگذار.
۴. **Authentication ← URL Configuration**: *Site URL* را آدرس GitHub Pages خودت بگذار و همان را به *Redirect URLs* هم اضافه کن.
۵. برای تست سریع: در **Authentication ← Sign In / Providers ← Email** گزینهٔ *Confirm email* را موقتاً خاموش کن (وگرنه بعد از ثبت‌نام باید لینک تأیید ایمیل را بزنی).
۶. صفحهٔ `auth.html` بالای کارت وضعیت دیتابیس را نشان می‌دهد: «دیتابیس متصل» یعنی همه‌چیز درست است.

> فقط کلید anon/publishable داخل سایت بگذار. کلید `service_role` / secret هرگز نباید روی GitHub برود.

## پشتیبانی
آیدی بات‌ها در `support.html` است:
روبیکا `@GoldGameSupportBot` · تلگرام `@GoldGameMCSuppBot` · بله `@GoldGameSuppBot` · دیسکورد به‌زودی

## لوگوها
لوگوی سایت: `assets/logo.png` · آیکون روبیکا و بله: `assets/rubika.png` و `assets/bale.png` (برای عوض‌کردن، همین فایل‌ها را جایگزین کن).
