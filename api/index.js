export default async function handler(req, res) {
  // ⛔ هدرهای ضد کش برای کلاینت (هیدیفای/v2rayNG) و ورسل
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const { user } = req.query;
  const REPO_BASE = 'https://raw.githubusercontent.com/majid1361/SUB/main';

  // 🕒 تولید تایم‌استمپ یکتا برای دور زدن کامل کش CDN گیت‌هاب
  const timestamp = Date.now();

  // 👥 ۱. خواندن آنی و بدون کش کاربران از users.json
  let users = {};
  try {
    const usersRes = await fetch(`${REPO_BASE}/users.json?_t=${timestamp}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
    if (usersRes.ok) {
      users = await usersRes.json();
    }
  } catch (e) {
    console.error("Error fetching users.json:", e);
  }

  // 🔒 ۲. احراز هویت کاربر
  if (!user || !users[user]) {
    return res.status(403).send("403 Unauthorized: Invalid or missing user token.");
  }

  const expiryDateStr = users[user];
  const expiryDate = new Date(expiryDateStr);
  const today = new Date();
  
  // محاسبه روزهای باقی‌مانده
  const diffTime = expiryDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const expiryTimestamp = Math.floor(expiryDate.getTime() / 1000);

  // ⌛ ۳. سناریوی کاربر منقضی شده
  if (diffDays <= 0) {
    res.setHeader('Profile-Title', `⛔ EXPIRED | ${user}`);
    res.setHeader('Subscription-Userinfo', `upload=0; download=0; total=10737418240; expire=${expiryTimestamp}`);
    try {
      const expRes = await fetch(`${REPO_BASE}/expired.txt?_t=${timestamp}`, { cache: 'no-store' });
      const expText = await expRes.text();
      return res.status(200).send(expText.trim());
    } catch {
      return res.status(200).send("vless://00000000-0000-0000-0000-000000000000@127.0.0.1:80?security=none&type=tcp#⛔+Account+Expired");
    }
  }

  // ✅ ۴. کاربر فعال: تنظیم هدرها
  res.setHeader('Profile-Title', `⏳ ${diffDays} Days Left | ${user}`);
  res.setHeader('Subscription-Userinfo', `upload=0; download=0; total=10995116277760; expire=${expiryTimestamp}`);

  // 📥 ۵. دریافت کانفیگ‌ها (ابتدا اختصاصی، سپس عمومی)
  let configText = "";
  try {
    const userRes = await fetch(`${REPO_BASE}/${user}.txt?_t=${timestamp}`, { cache: 'no-store' });
    if (userRes.ok) {
      configText = await userRes.text();
    } else {
      const subRes = await fetch(`${REPO_BASE}/sub.txt?_t=${timestamp}`, { cache: 'no-store' });
      configText = await subRes.text();
    }
  } catch (err) {
    return res.status(200).send("vless://00000000-0000-0000-0000-000000000000@127.0.0.1:80?security=none&type=tcp#❌+Server+Connection+Error");
  }

  // 🏷️ ۶. افزودن کانفیگ وضعیت انقضا در بالای لیست
  const infoConfig = `vless://00000000-0000-0000-0000-000000000000@127.0.0.1:80?security=none&type=tcp#⏳+${diffDays}+Days+Left+|+Exp:+${expiryDateStr}`;
  const finalResponse = `${infoConfig}\n${configText.trim()}`;

  return res.status(200).send(finalResponse);
}
