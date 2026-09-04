export default async function handler(req, res) {
  const { user } = req.query;

  // ۱. دیتابیس کاربران و تاریخ انقضا (سال-ماه-روز)
  const users = {
    "majid": "2025-01-01",
    "tohid": "2030-01-01",
    "roja": "2030-01-01",
    "vida": "2030-01-01",
    "mehrang": "2030-01-01",
    "user1": "2027-09-01",
    "user2": "2027-09-01",
    "user3": "2027-09-01",
    "user4": "2027-09-01",
    "user5": "2027-09-01",
    "user6": "2027-09-01",
    "user7": "2027-09-01",
    "user8": "2027-09-01",
    "user9": "2027-09-01",
    "user10": "2027-09-01"
  };

  // اگر کاربر توی لیست نبود
  if (!user || !users[user]) {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.status(403).send("⚠️ User not found or unauthorized.");
  }

  // ۲. محاسبه تاریخ و روزهای باقی‌مانده
  const expiryDateStr = users[user];
  const expireDate = new Date(`${expiryDateStr}T23:59:59Z`);
  const today = new Date();
  const diffTime = expireDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const totalBytes = 1000 * 1024 * 1024 * 1024; // ۱۰۰۰ گیگابایت

  // =======================================================
  // ⛔ ۳. اگر اعتبار تمام شده باشد (۰ روز یا کمتر)
  // =======================================================
  if (diffDays <= 0) {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    // هدر بدون بلاک کردن کاربر فرستاده میشه تا هیدیفای حتماً لیست رو آپدیت کنه
    res.setHeader("Profile-Title", `⛔ EXPIRED | ${user}`);
    res.setHeader("Profile-Update-Interval", "1");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

    // کانفیگ مجازی استاندارد
    const expiredVirtualConfig = `vless://11111111-1111-1111-1111-111111111111@1.1.1.1:443?encryption=none&security=none&type=tcp#%E2%9B%94%EF%B8%8F%20EXPIRED`;

    return res.status(200).send(expiredVirtualConfig);
  }

  // =======================================================
  // 🟢 ۴. کاربر هنوز معتبر است -> دریافت و ارسال کانفیگ‌ها
  // =======================================================
  const expireTimestamp = Math.floor(expireDate.getTime() / 1000);
  const GITHUB_RAW_URL = "https://raw.githubusercontent.com/majid1361/SUB/main/sub.txt";

  try {
    const fetchHeaders = {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    };

    const response = await fetch(`${GITHUB_RAW_URL}?t=${Date.now()}`, { headers: fetchHeaders });
    if (!response.ok) throw new Error("Fetch Error");
    
    const configs = await response.text();

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Subscription-Userinfo", `upload=0; download=0; total=${totalBytes}; expire=${expireTimestamp}`);
    res.setHeader("Profile-Title", `Sub: ${user}`);
    res.setHeader("Profile-Update-Interval", "12");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

    // روزشمار بالای لیست
    const infoVirtualConfig = `vless://11111111-1111-1111-1111-111111111111@1.1.1.1:443?encryption=none&security=none&type=tcp#%E2%8F%B3%20${diffDays}%20Days%20Left%20%7C%20Exp:%20${expiryDateStr}`;

    const finalOutput = `${infoVirtualConfig}\n${configs.trim()}`;
    return res.status(200).send(finalOutput);

  } catch (error) {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.status(500).send("Error fetching configs from source.");
  }
}
