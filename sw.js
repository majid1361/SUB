// Service Worker اختصاصی برای پنل SUB-Users
const CACHE_NAME = 'sub-users-v1';

// لیست فایل‌های استاتیک که باید آفلاین دردسترس باشن
const ASSETS_TO_CACHE = [
  './admin.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest'
];

// ۱. مرحله نصب: کش کردن فایل‌های حیاتی UI
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // استفاده از allSettled تا اگر یک فونت یا آیکون لود نشد کل ورکر کرش نکنه
      return Promise.allSettled(
        ASSETS_TO_CACHE.map((url) => cache.add(url).catch((err) => console.warn('Cache bypass for:', url, err))
      );
    })
  );
  self.skipWaiting();
});

// ۲. مرحله فعال‌سازی: پاکسازی کش‌های تاریخ‌گذشته ورژن‌های قبل
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ۳. استراتژی واکشی (Fetch):
// - درخواست‌های گیت‌هاب و متدهای غیر GET همیشه زنده و مستقیم رد می‌شن (بدون کش)
// - فایل‌های UI اول از شبکه، در صورت نبود اینترنت از کش لود می‌شن (Network First, Cache Fallback)
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // الف) درخواست‌های غیر GET (مثل ذخیره یوزر و آپدیت گیت‌هاب با PUT) به هیچ‌وجه نباید وارد کش بشن
  if (request.method !== 'GET') {
    return;
  }

  // ب) تمام درخواست‌ها به API گیت‌هاب و خام فایل‌ها باید ۱۰۰٪ زنده دریافت بشن
  if (url.hostname.includes('github.com') || url.hostname.includes('githubusercontent.com')) {
    event.respondWith(
      fetch(request).catch(() => {
        // در صورت قطعی نت موقع فراخوانی گیت‌هاب، ریسپانس خطای شبکه به جاوااسکریپت پس داده بشه
        return new Response(JSON.stringify({ error: 'Network Error: آفلاین هستید یا ارتباط با گیت‌هاب قطع است.' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 503
        });
      })
    );
    return;
  }

  // ج) برای بقیه فایل‌های استاتیک برنامه (HTML، Tailwind، آیکون‌ها)
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        // اگر پاسخ اوکی بود یه کپی تو کش ذخیره/آپدیت کن
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        }
        return networkResponse;
      })
      .catch(() => {
        // اگه نت قطع بود یا لود نشد، مستقیم از حافظه آفلاین بکش بیرون!
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // در بدترین حالت اگر آدرس ناشناخته بود به صفحه اصلی برگرده
          if (request.mode === 'navigate') {
            return caches.match('./admin.html');
          }
        });
      })
  );
});
