// Service Worker برای فعال‌سازی قابلیت PWA
const CACHE_NAME = 'turbo-admin-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// مهندسی معکوس و نکته مهم: ما درخواست‌های گیت‌هاب رو کش نمی‌کنیم تا همیشه دیتای زنده بگیریم!
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
