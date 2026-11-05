/* GoldGame — کمک‌کنندهٔ مشترک ورود/ثبت‌نام (Supabase) */
(() => {
  'use strict';
  const CDNS = [
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
    'https://unpkg.com/@supabase/supabase-js@2'
  ];
  const USER_RE = /^[A-Za-z0-9_]{3,16}$/;

  const cfg = () => ({
    url: String(window.GOLDGAME_SUPABASE_URL || '').trim().replace(/\/+$/, ''),
    key: String(window.GOLDGAME_SUPABASE_ANON_KEY || '').trim()
  });

  function decodeRole(key) {
    try {
      const part = key.split('.')[1];
      if (!part) return '';
      const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(json).role || '';
    } catch (_) { return ''; }
  }

  /** وضعیت تنظیمات: { ok, problem } */
  function configState() {
    const { url, key } = cfg();
    if (!url || !key || /PASTE_YOUR/i.test(url + key)) {
      return { ok: false, kind: 'missing', problem: 'آدرس و کلید Supabase هنوز داخل فایل assets/supabase-config.js گذاشته نشده.' };
    }
    if (!/^https:\/\/[a-z0-9.-]+$/i.test(url)) {
      return { ok: false, kind: 'url', problem: 'Project URL درست نیست. باید شبیه https://xxxx.supabase.co باشد (بدون / و مسیر اضافه).' };
    }
    if (/^sb_secret_/i.test(key) || decodeRole(key) === 'service_role') {
      return { ok: false, kind: 'secret', problem: 'این کلید «secret / service_role» است و نباید داخل سایت بیاید! کلید anon (publishable) را بگذار و کلید فعلی را در Supabase بازسازی (rotate) کن.' };
    }
    return { ok: true };
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src; s.async = true;
      s.onload = () => resolve();
      s.onerror = () => { s.remove(); reject(new Error('load-failed')); };
      document.head.appendChild(s);
    });
  }

  let clientPromise = null;
  function getClient() {
    if (clientPromise) return clientPromise;
    clientPromise = (async () => {
      const st = configState();
      if (!st.ok) { const e = new Error(st.problem); e.setup = true; throw e; }
      if (!window.supabase) {
        let loaded = false;
        for (const src of CDNS) {
          try { await loadScript(src); if (window.supabase) { loaded = true; break; } } catch (_) {}
        }
        if (!loaded) { const e = new Error('library-failed'); e.lib = true; throw e; }
      }
      const { url, key } = cfg();
      return window.supabase.createClient(url, key, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });
    })();
    clientPromise.catch(() => { clientPromise = null; });
    return clientPromise;
  }

  /** بررسی در دسترس‌بودن سرور Supabase */
  async function ping() {
    const st = configState();
    if (!st.ok) return { ok: false, reason: st.problem };
    const { url, key } = cfg();
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 9000);
    try {
      const res = await fetch(url + '/auth/v1/health', { headers: { apikey: key }, signal: ctrl.signal });
      if (res.status === 401 || res.status === 403) return { ok: false, reason: 'کلید عمومی (anon key) اشتباه است.' };
      if (!res.ok) return { ok: false, reason: 'سرور پاسخ نامعتبر داد (کد ' + res.status + '). Project URL را بررسی کن.' };
      return { ok: true };
    } catch (e) {
      return { ok: false, reason: 'به سرور Supabase وصل نشد. اینترنت/فیلترشکن را بررسی کن و مطمئن شو Project URL درست است.' };
    } finally { clearTimeout(timer); }
  }

  /** ترجمهٔ خطاها به فارسی */
  function fa(err) {
    if (!err) return 'خطایی رخ داد. دوباره تلاش کن.';
    if (err.setup) return err.message;
    if (err.lib || err.message === 'library-failed') return 'کتابخانهٔ ورود بارگذاری نشد. اینترنت/فیلترشکن را بررسی کن و صفحه را دوباره باز کن.';
    const m = String(err.message || '').toLowerCase();
    const code = String(err.code || err.error_code || '').toLowerCase();
    if (m.includes('invalid login credentials')) return 'ایمیل یا رمز عبور اشتباه است.';
    if (m.includes('email not confirmed') || code === 'email_not_confirmed') return 'ایمیلت هنوز تأیید نشده. لینک تأیید را در صندوق ورودی (یا اسپم) باز کن.';
    if (m.includes('already registered') || code === 'user_already_exists') return 'با این ایمیل قبلاً حساب ساخته شده. وارد شو یا رمز را بازیابی کن.';
    if (m.includes('password should be') || code === 'weak_password') return 'رمز عبور ضعیف است. حداقل ۸ کاراکتر و ترکیبی از حرف و عدد بگذار.';
    if (m.includes('rate limit') || code.includes('rate_limit') || err.status === 429) return 'تعداد درخواست‌ها زیاد بود. چند دقیقه صبر کن و دوباره تلاش کن.';
    if (m.includes('database error saving new user')) return 'ثبت‌نام ذخیره نشد: نام کاربری تکراری/نامعتبر است یا فایل supabase-setup.sql هنوز اجرا نشده.';
    if (m.includes('signups not allowed') || code === 'signup_disabled') return 'ثبت‌نام در Supabase غیرفعال است (Authentication ← Sign In / Providers ← Email).';
    if (m.includes('invalid api key') || m.includes('apikey')) return 'کلید عمومی (anon key) اشتباه است.';
    if (m.includes('unable to validate email') || m.includes('invalid format') || (m.includes('email') && m.includes('invalid'))) return 'ایمیل نامعتبر است.';
    if (m.includes('same password') || code === 'same_password') return 'رمز جدید باید با رمز قبلی فرق داشته باشد.';
    if (m.includes('failed to fetch') || m.includes('networkerror') || m.includes('load failed') || m.includes('network request failed')) return 'اتصال به دیتابیس برقرار نشد. اینترنت/فیلترشکن را بررسی کن.';
    if (m.includes('relation') && m.includes('does not exist')) return 'جدول‌های دیتابیس ساخته نشده‌اند؛ فایل supabase-setup.sql را در SQL Editor اجرا کن.';
    return err.message || 'خطایی رخ داد. دوباره تلاش کن.';
  }

  window.GG = { configState, getClient, ping, fa, USER_RE, cfg };
})();
