export default async function handler(req, res) {
  const { user } = req.query;

  // ۱. دیتابیس کاربران و تاریخ انقضا (سال-ماه-روز)
  const users = {
    "majid": "2030-01-01",
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

  // اگر کاربر پیدا نشد
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
  // ⛔ ۳. اگر اشتراک منقضی شده باشد -> فقط ارسال یک کانفیگ مجازی انقضا
  // =======================================================
  if (diffDays <= 0) {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Subscription-Userinfo", `upload=0; download=${totalBytes}; total=${totalBytes}; expire=${expireTimestamp}`);
    res.setHeader("Profile-Title", `⛔ EXPIRED | ${user}`);
    res.setHeader("Profile-Update-Interval", "1");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    // تک کانفیگ مجازی استاندارد که فقط پیام انقضا رو نشون میده
    const expiredVirtualConfig = `trojan://expired@1.1.1.1:443?security=tls&sni=cloudflare.com#%E2%9B%94%EF%B8%8F%20EXPIRED`;

    return res.status(200).send(expiredVirtualConfig);
  }

  // =======================================================
  // 🟢 ۴. کاربر معتبر است -> دریافت سرورها از گیت‌هاب + روزشمار مجازی
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

    // کانفیگ مجازی روزشمار بالای لیست
    const infoVirtualConfig = `trojan://info@1.1.1.1:443?security=tls&sni=cloudflare.com#%E2%8F%B3%20${diffDays}%20Days%20Left%20%7C%20Exp:%20${expiryDateStr}`;

    const finalOutput = `${infoVirtualConfig}\n${configs.trim()}`;
    return res.status(200).send(finalOutput);

  } catch (error) {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.status(500).send("Error fetching configs from source.");
  }
}
