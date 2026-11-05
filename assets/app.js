/* GoldGame — اسکریپت اصلی سایت */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const activePage = file === 'account.html' || file === 'reset-password.html' ? 'auth.html' : file;

  /* ---------- پیام کوتاه (toast) ---------- */
  const toast = $('.toast');
  let toastTimer;
  function notify(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  }
  window.GG_notify = notify;

  /* ---------- کپی ---------- */
  async function copyText(value) {
    try { await navigator.clipboard.writeText(value); return true; }
    catch (e) {
      const t = document.createElement('textarea');
      t.value = value; t.setAttribute('readonly', '');
      t.style.cssText = 'position:fixed;opacity:0;top:0';
      document.body.appendChild(t); t.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (_) {}
      t.remove();
      return ok;
    }
  }
  document.addEventListener('click', async e => {
    const b = e.target.closest('[data-copy]');
    if (!b) return;
    const value = b.dataset.copy;
    const ok = await copyText(value);
    notify(ok ? 'کپی شد: ' + value : 'کپی نشد؛ دستی کپی کن.');
    if (ok) { b.classList.add('copied'); setTimeout(() => b.classList.remove('copied'), 1300); }
  });

  /* ---------- منوی کشویی سمت چپ ---------- */
  const ICON = {
    home: '<path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    shop: '<path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    support: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="13" width="4" height="6" rx="1.6"/><rect x="17" y="13" width="4" height="6" rx="1.6"/><path d="M19 19v.5a2.5 2.5 0 0 1-2.5 2.5H13"/>',
    rules: '<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z"/><path d="m9 12 2 2 4-4"/>',
    launcher: '<path d="M12 4v11"/><path d="m7 11 5 5 5-5"/><path d="M5 20h14"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'
  };
  const MENU = [
    ['index.html', 'خانه', 'home'],
    ['shop.html', 'فروشگاه', 'shop'],
    ['support.html', 'پشتیبانی', 'support'],
    ['rules.html', 'قوانین', 'rules'],
    ['launcher.html', 'دانلود لانچر', 'launcher'],
    ['auth.html', 'ورود / ثبت‌نام', 'user']
  ];
  const menuBtn = $('.menu-btn');
  let lastFocus = null;
  if (menuBtn) {
    const wrap = document.createElement('div');
    wrap.innerHTML =
      '<div class="drawer-overlay" data-drawer-close></div>' +
      '<aside class="drawer" role="dialog" aria-modal="true" aria-label="منوی سایت" tabindex="-1">' +
        '<div class="drawer-head"><a class="brand" href="index.html"><img src="assets/logo.png" alt=""><span>GOLD<span class="gold">GAME</span></span></a>' +
        '<button type="button" class="drawer-close" aria-label="بستن منو" data-drawer-close>×</button></div>' +
        '<div class="drawer-links">' +
        MENU.map(([href, label, ic], i) =>
          '<a href="' + href + '" style="--i:' + i + '"' + (href === activePage ? ' class="active" aria-current="page"' : '') + '>' +
          '<span class="ico"><svg viewBox="0 0 24 24" aria-hidden="true">' + ICON[ic] + '</svg></span><span>' + label + '</span><span class="chev">‹</span></a>'
        ).join('') +
        '</div>' +
        '<div class="drawer-foot"><button type="button" class="drawer-ip" data-copy="Play.GoldGameMC.IR"><div><small>آدرس سرور ماینکرفت</small><strong>Play.GoldGameMC.IR</strong></div><em>کپی</em></button></div>' +
      '</aside>';
    while (wrap.firstChild) document.body.appendChild(wrap.firstChild);
    const drawer = $('.drawer');
    menuBtn.setAttribute('aria-haspopup', 'dialog');
    menuBtn.setAttribute('aria-expanded', 'false');

    const openDrawer = () => {
      lastFocus = document.activeElement;
      document.body.classList.add('drawer-open');
      menuBtn.setAttribute('aria-expanded', 'true');
      setTimeout(() => (drawer.querySelector('a.active') || drawer.querySelector('a'))?.focus({ preventScroll: true }), 380);
    };
    const closeDrawer = () => {
      if (!document.body.classList.contains('drawer-open')) return;
      document.body.classList.remove('drawer-open');
      menuBtn.setAttribute('aria-expanded', 'false');
      lastFocus?.focus?.({ preventScroll: true });
    };
    menuBtn.addEventListener('click', openDrawer);
    document.addEventListener('click', e => { if (e.target.closest('[data-drawer-close]')) closeDrawer(); });
    drawer.addEventListener('click', e => { if (e.target.closest('.drawer-links a')) document.body.classList.remove('drawer-open'); });
    document.addEventListener('keydown', e => {
      if (!document.body.classList.contains('drawer-open')) return;
      if (e.key === 'Escape') { closeDrawer(); return; }
      if (e.key === 'Tab') {
        const f = $$('a,button', drawer);
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    matchMedia('(min-width: 981px)').addEventListener?.('change', ev => { if (ev.matches) closeDrawer(); });
  }

  /* ---------- دکمهٔ شناور پشتیبانی: یک بار راهنما نشان بده ---------- */
  const fab = $('.support-fab');
  if (fab && !reduce) {
    try {
      if (!sessionStorage.getItem('gg_fab_hint')) {
        sessionStorage.setItem('gg_fab_hint', '1');
        setTimeout(() => fab.classList.add('hint'), 1800);
        setTimeout(() => fab.classList.remove('hint'), 5800);
      }
    } catch (_) {}
  }

  /* ---------- ظاهر شدن هنگام اسکرول ---------- */
  if (!reduce && 'IntersectionObserver' in window) {
    const targets = $$('.mode-card,.rank-card,.rule-group>header,.rule,.support-card,.step,.steps-title,.join-banner,.support-strip,.section-head,.rules-side,.launcher-box,.auth-card,.account-card,.fine-print,.rules-end');
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target;
        io.unobserve(el);
        el.classList.add('in');
        setTimeout(() => { el.classList.remove('reveal', 'in'); el.style.removeProperty('--d'); }, 1300);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    const seen = new Map();
    targets.forEach(el => {
      const key = el.parentElement;
      const n = seen.get(key) || 0;
      seen.set(key, n + 1);
      el.style.setProperty('--d', Math.min(n * 0.07, 0.35) + 's');
      el.classList.add('reveal');
      io.observe(el);
    });
  }

  /* ---------- جرقه‌های طلایی پس‌زمینه ---------- */
  if (!reduce) {
    const holder = document.createElement('div');
    holder.className = 'sparks';
    holder.setAttribute('aria-hidden', 'true');
    const count = innerWidth < 650 ? 9 : 16;
    for (let i = 0; i < count; i++) {
      const s = document.createElement('i');
      s.className = 'spark';
      const t = 14 + Math.random() * 16;
      s.style.cssText = '--x:' + (Math.random() * 100).toFixed(1) + '%;--s:' + (3 + Math.random() * 5).toFixed(1) + 'px;--t:' + t.toFixed(1) + 's;--dl:-' + (Math.random() * t).toFixed(1) + 's;--dx:' + ((Math.random() - .5) * 120).toFixed(0) + 'px';
      holder.appendChild(s);
    }
    const shade = $('.shade');
    shade ? shade.after(holder) : document.body.prepend(holder);
  }

  /* ---------- درخشش دنبال‌کنندهٔ موس روی کارت‌ها ---------- */
  document.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    const c = e.target.closest('.mode-card,.rank-card,.support-card,.rule');
    if (!c) return;
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });

  /* ---------- قوانین: مشخص‌کردن بخش فعال در کنار صفحه ---------- */
  const sideLinks = $$('.side-links a');
  if (sideLinks.length && 'IntersectionObserver' in window) {
    const map = new Map(sideLinks.map(a => [a.getAttribute('href').slice(1), a]));
    const spy = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          sideLinks.forEach(a => a.classList.remove('on'));
          map.get(en.target.id)?.classList.add('on');
        }
      });
    }, { rootMargin: '-20% 0px -65% 0px' });
    $$('.rule-group').forEach(g => spy.observe(g));
  }

  /* ---------- فروشگاه: پنجرهٔ راهنمای خرید ---------- */
  const dialog = $('#buyDialog');
  if (dialog) {
    $$('.rank-buy').forEach(b => b.addEventListener('click', () => {
      const rank = b.dataset.rank;
      $('#dialogTitle').textContent = 'رنک ' + rank;
      $('#dialogPrice').textContent = b.dataset.price;
      $('#stepRank').textContent = rank;
      $('#goSupport').href = 'support.html?rank=' + encodeURIComponent(rank);
      if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
    }));
    dialog.addEventListener('click', e => {
      const r = dialog.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close();
    });
  }

  /* ---------- پشتیبانی: اگر از فروشگاه آمده باشد، رنک را نشان بده ---------- */
  const banner = $('#rankBanner');
  if (banner) {
    const ranks = ['Plus', 'Vip', 'MVP', 'Premium', 'Sponsor'];
    const q = new URLSearchParams(location.search).get('rank');
    const found = ranks.find(r => r.toLowerCase() === (q || '').toLowerCase());
    if (found) {
      $('#rankBannerName').textContent = found;
      banner.hidden = false;
    }
  }
})();
