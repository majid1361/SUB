export default async function handler(req, res) {
  // 1. دریافت نام کاربر از پارامتر URL
  const { user } = req.query;

  // 2. دیتابیسِ کاربرا (در آینده می‌تونی وصلش کنی به دیتابیس واقعی)
  const users = {
    "majid": "2025-01-01",
    "tohid": "2030-01-01",
    "roja": "2030-01-01",
    "vida": "2030-01-01",
    "mehrang": "2030-01-01",
    "user1": "2027-09-01"
  };

  // 3. بررسی امنیت: اگه کاربر تو لیست نبود، اجازه دسترسی نده
  if (!user || !users[user]) {
    return res.status(403).send("⚠️ Unauthorized: User not found");
  }

  // 4. محاسبه تاریخ انقضا
  const expiryDateStr = users[user];
  const expireDate = new Date(`${expiryDateStr}T23:59:59Z`);
  const today = new Date();
  const diffDays = Math.ceil((expireDate - today) / (1000 * 60 * 60 * 24));
  
  const REPO_BASE = "https://raw.githubusercontent.com/majid1361/SUB/main";

  // ---------------------------------------------------------
  // 5. سناریو الف: اشتراک منقضی شده است
  // ---------------------------------------------------------
  if (diffDays <= 0) {
    try {
      // تلاش برای گرفتن فایل سفارشی انقضا (اگه وجود داشته باشه)
      const response = await fetch(`${REPO_BASE}/expired.txt?t=${Date.now()}`);
      const content = response.ok ? await response.text() : "vless://00000000-0000-0000-0000-000000000000@1.1.1.1:443?security=none#%E2%9B%94%EF%B8%8F%20EXPIRED";
      
      // پاسخ 200 ارسال می‌کنیم تا کلاینت حتما لیست قبلی رو پاک و با این جایگزین کنه
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Profile-Title", "⛔ EXPIRED"); // اسم تایتل کلاینت تغییر می‌کنه
      return res.status(200).send(content);
    } catch (e) {
      // در صورت خطای شبکه، کانفیگ پیش‌فرض انقضا رو بفرست
      return res.status(200).send("vless://00000000-0000-0000-0000-000000000000@1.1.1.1:443?security=none#%E2%9B%94%EF%B8%8F%20EXPIRED");
    }
  }

  // ---------------------------------------------------------
  // 6. سناریو ب: اشتراک فعال است
  // ---------------------------------------------------------
  try {
    const fetchHeaders = { 'Cache-Control': 'no-cache, no-store, must-revalidate' };
    
    // تلاش برای دریافت فایل کانفیگ اختصاصی کاربر، اگه نبود فایل عمومی
    let response = await fetch(`${REPO_BASE}/${user}.txt?t=${Date.now()}`, { headers: fetchHeaders });
    
    if (!response.ok) {
      response = await fetch(`${REPO_BASE}/sub.txt?t=${Date.now()}`, { headers: fetchHeaders });
    }

    if (!response.ok) throw new Error("Could not fetch configs");
    
    const configs = await response.text();

    // تنظیم هدرهای مهم برای کلاینت
    const expireTimestamp = Math.floor(expireDate.getTime() / 1000);
    const totalBytes = 1000 * 1024 * 1024 * 1024; // میزان ترافیک (سمبلیک)

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Subscription-Userinfo", `upload=0; download=0; total=${totalBytes}; expire=${expireTimestamp}`);
    res.setHeader("Profile-Title", `Sub: ${user}`); // اسم تایتل کلاینت فعال
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

    // کانفیگ اطلاع‌رسانی (روز شمار) که همیشه بالای لیست میاد
    const infoConfig = `vless://00000000-0000-0000-0000-000000000000@1.1.1.1:443?security=none#%E2%8F%B3%20${diffDays}%20Days%20Left%20%7C%20Exp:%20${expiryDateStr}`;
    
    return res.status(200).send(`${infoConfig}\n${configs.trim()}`);

  } catch (error) {
    // در صورت بروز خطا در دریافت فایل، یک پیام هشدار می‌فرستیم تا کاربر بفهمه مشکل از سمت سروره
    return res.status(200).send("vless://00000000-0000-0000-0000-000000000000@1.1.1.1:443?security=none#⚠️%20System%20Maintenance");
  }
}
