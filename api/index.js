export default async function handler(req, res) {
  const { user } = req.query;
  const REPO_BASE = "https://raw.githubusercontent.com/majid1361/SUB/main";

  // ==========================================
  // 🔄 ۱. خواندن پویا (Live) کاربران از فایل users.json
  // ==========================================
  let users = {};
  try {
    const usersRes = await fetch(`${REPO_BASE}/users.json?t=${Date.now()}`, {
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' }
    });
    if (usersRes.ok) {
      users = await usersRes.json();
    }
  } catch (e) {
    console.error("Failed to fetch users.json", e);
  }

  // ==========================================
  // 🔒 ۲. بررسی اعتبار کاربر
  // ==========================================
  if (!user || !users[user]) {
    return res.status(403).send("⚠️ Unauthorized");
  }

  const expiryDateStr = users[user];
  const expireDate = new Date(`${expiryDateStr}T23:59:59Z`);
  const today = new Date();
  const diffDays = Math.ceil((expireDate - today) / (1000 * 60 * 60 * 24));

  // ==========================================
  // ⛔ ۳. منطق انقضا: خوندن expired.txt
  // ==========================================
  if (diffDays <= 0) {
    try {
      const response = await fetch(`${REPO_BASE}/expired.txt?t=${Date.now()}`);
      const content = response.ok 
        ? await response.text() 
        : "vless://00000000-0000-0000-0000-000000000000@1.1.1.1:443?security=none#%E2%9B%94%EF%B8%8F%20EXPIRED";
      
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Profile-Title", `⛔ EXPIRED | ${user}`);
      return res.status(200).send(content); 
    } catch (e) {
      return res.status(200).send("vless://00000000-0000-0000-0000-000000000000@1.1.1.1:443?security=none#%E2%9B%94%EF%B8%8F%20EXPIRED");
    }
  }

  // ==========================================
  // 🟢 ۴. منطق فعال: خوندن کانفیگ‌ها
  // ==========================================
  try {
    const fetchHeaders = { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' };
    
    // اول فایل اختصاصی، نبود برو سراغ عمومی
    let response = await fetch(`${REPO_BASE}/${user}.txt?t=${Date.now()}`, { headers: fetchHeaders });
    if (!response.ok) {
      response = await fetch(`${REPO_BASE}/sub.txt?t=${Date.now()}`, { headers: fetchHeaders });
    }

    if (!response.ok) throw new Error("Fetch Error");
    const configs = await response.text();

    const expireTimestamp = Math.floor(expireDate.getTime() / 1000);
    const totalBytes = 100000 * 1024 * 1024 * 1024; 

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Subscription-Userinfo", `upload=0; download=0; total=${totalBytes}; expire=${expireTimestamp}`);
    res.setHeader("Profile-Title", `Sub: ${user}`);
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

    const infoConfig = `vless://00000000-0000-0000-0000-000000000000@1.1.1.1:443?security=none#%E2%8F%B3%20${diffDays}%20Days%20Left%20%7C%20Exp:%20${expiryDateStr}`;
    
    return res.status(200).send(`${infoConfig}\n${configs.trim()}`);

  } catch (error) {
    return res.status(200).send("vless://00000000-0000-0000-0000-000000000000@1.1.1.1:443?security=none#⚠️%20Error%20Fetching%20Configs");
  }
}
