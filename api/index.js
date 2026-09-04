export default async function handler(req, res) {
  const { user } = req.query;

  // ۱. دیتابیس کاربران و تاریخ انقضا (سال-ماه-روز)
  const users = {
    "majid": "2024-01-01",
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

  // بررسی وجود نام کاربری در سیستم
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
  const expireTimestamp = Math.floor(expireDate.getTime() / 1000);
  const totalBytes = 1000 * 1024 * 1024 * 1024; // ۱۰۰۰ گیگابایت

  // =======================================================
  // ⛔ ۳. بررسی اعتبار زمانی (منقضی شده: ۰ روز یا کمتر)
  // =======================================================
  if (diffDays <= 0) {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Subscription-Userinfo", `upload=0; download=${totalBytes}; total=${totalBytes}; expire=${expireTimestamp}`);
    res.setHeader("Profile-Title", `⛔ EXPIRED | ${user}`);
    res.setHeader("Profile-Update-Interval", "1");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    // ارسال کانفیگ نمایشی انقضا برای پاک شدن تمام سرورهای قبلی
    const expiredConfig = `vless://00000000-0000-0000-0000-000000000000@127.0.0.1:443?encryption=none&security=none#%E2%9B%94%EF%B8%8F%20EXPIRED`;

    return res.status(200).send(expiredConfig);
  }

  // =======================================================
  // 🟢 ۴. کاربر هنوز اعتبار دارد -> دریافت و ارسال کانفیگ‌ها
  // =======================================================
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

    // کانفیگ مجازی برای نمایش روزهای باقی‌مانده بالای لیست
    const infoConfig = `vless://00000000-0000-0000-0000-000000000000@127.0.0.1:443?encryption=none&security=none#%E2%8F%B3%20${diffDays}%20Days%20Left%20%7C%20Exp:%20${expiryDateStr}`;

    const finalOutput = `${infoConfig}\n${configs.trim()}`;
    return res.status(200).send(finalOutput);

  } catch (error) {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.status(500).send("Error fetching configs from source.");
  }
}
