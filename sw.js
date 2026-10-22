// نسخه کش را هر بار که index.html تغییر می‌کند بالا ببرید (مثلاً v4)
const CACHE = 'wecando-v4';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // درخواست‌های Supabase و CDN را دست نمی‌زنیم؛ داده‌ها همیشه از شبکه می‌آیند
  if (url.origin !== self.location.origin || e.request.method !== 'GET') return;
  // اول شبکه (تا تغییرات جدید دیده شوند)، اگر نبود کش
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
