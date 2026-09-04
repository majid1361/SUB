export default async function handler(req, res) {
  const { user } = req.query;

  // ۱. دیتابیس کاربران (همان لیست خودت)
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

  if (!user || !users[user]) {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.status(403).send("⚠️ User not found.");
  }

  const expiryDateStr = users[user];
  const expireDate = new Date(`${expiryDateStr}T23:59:59Z`);
  const today = new Date();
  const diffTime = expireDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const totalBytes = 1000 * 1024 * 1024 * 1024; 

  // =======================================================
  // ⛔ حالت انقضا: هدف = جایگزینی کامل لیست قدیمی با پیام انقضا
  // =======================================================
  if (diffDays <= 0) {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    
    // نکته حیاتی: اینجا هیچ هدر Subscription-Userinfo که حاوی تاریخ گذشته باشد نمی‌فرستیم!
    // فقط هدرهای مربوط به کش و عنوان پروفایل را می‌فرستیم تا کلاینت مجبور به آپدیت شود.
    res.setHeader("Profile-Title", `⛔ EXPIRED | ${user}`);
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");

    // یک کانفیگ استاندارد و ساده برای اینکه هیدیفای آن را به عنوان "یک کانفیگ جدید" بشناسد و جایگزین کند
    const expiredVirtualConfig = `vless://11111111-1111-1111-1111-111111111111@1.1.1.1:443?encryption=none&security=none&type=tcp#%E2%9B%94%EF%B8%8F%20EXPIRED%20%7C%20Please%20Renew`;

    return res.status(200).send(expiredVirtualConfig);
  }

  // =======================================================
  // 🟢 حالت فعال: ارسال کانفیگ‌های واقعی + هدرهای اطلاعاتی
  // =======================================================
  const expireTimestamp = Math.floor(expireDate.getTime() / 1000);
  const GITHUB_RAW_URL = "https://raw.githubusercontent.com/majid1361/SUB/main/sub.txt";

  try {
    // تلاش برای پیدا کردن فایل اختصاصی کاربر [username].txt
    let configUrl = `https://raw.githubusercontent.com/majid1361/SUB/main/${user}.txt?t=${Date.now()}`;
    let response = await fetch(configUrl);

    // اگر فایل اختصاصی نبود (404)، برو سراغ فایل عمومی sub.txt
    if (!response.ok) {
      configUrl = `https://raw.githubusercontent.com/majid1361/SUB/main/sub.txt?t=${Date.now()}`;
      response = await fetch(configUrl);
    }

    if (!response.ok) throw new Error("GitHub Fetch Error");
    
    const configs = await response.text();

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    // در حالت عادی، تمام اطلاعات حجم و تاریخ را ارسال می‌کنیم
    res.setHeader("Subscription-Userinfo", `upload=0; download=0; total=${totalBytes}; expire=${expireTimestamp}`);
    res.setHeader("Profile-Title", `Sub: ${user}`);
    res.setHeader("Profile-Update-Interval", "12");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

    // کانفیگ مجازی برای نمایش روزهای باقی‌مانده در بالای لیست
    const infoVirtualConfig = `vless://11111111-1111-1111-1111-111111111111@1.1.1.1:443?encryption=none&security=none&type=tcp#%E2%8F%B3%20${diffDays}%20Days%20Left%20%7C%20Exp:%20${expiryDateStr}`;

    const finalOutput = `${infoVirtualConfig}\n${configs.trim()}`;
    return res.status(200).send(finalOutput);

  } catch (error) {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.status(500).send("Error fetching configs.");
  }
}
