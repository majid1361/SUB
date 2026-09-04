export default async function handler(req, res) {
  const { user } = req.query;

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

  if (!user || !users[user]) {
    return res.status(403).send("⚠️ Unauthorized");
  }

  const expiryDateStr = users[user];
  const expireDate = new Date(`${expiryDateStr}T23:59:59Z`);
  const today = new Date();
  const diffDays = Math.ceil((expireDate - today) / (1000 * 60 * 60 * 24));
  const REPO_BASE = "https://raw.githubusercontent.com/majid1361/SUB/main";

  // ==========================================
  // ⛔ منطق انقضا: خوندن expired.txt
  // ==========================================
  if (diffDays <= 0) {
    try {
      const response = await fetch(`${REPO_BASE}/expired.txt?t=${Date.now()}`);
      const content = response.ok ? await response.text() : "vless://00000000-0000-0000-0000-000000000000@1.1.1.1:443?security=none#%E2%9B%94%EF%B8%8F%20EXPIRED";
      
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Profile-Title", `⛔ EXPIRED | ${user}`);
      // ارسال 200 OK برای اینکه کلاینت حتما لیست رو آپدیت کنه
      return res.status(200).send(content); 
    } catch (e) {
      return res.status(200).send("vless://00000000-0000-0000-0000-000000000000@1.1.1.1:443?security=none#%E2%9B%94%EF%B8%8F%20EXPIRED");
    }
  }

  // ==========================================
  // 🟢 منطق فعال: خوندن فایل‌های فعال
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
    const totalBytes = 1000 * 1024 * 1024 * 1024; 

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Subscription-Userinfo", `upload=0; download=0; total=${totalBytes}; expire=${expireTimestamp}`);
    res.setHeader("Profile-Title", `Sub: ${user}`);
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

    const infoConfig = `vless://00000000-0000-0000-0000-000000000000@1.1.1.1:443?security=none#%E2%8F%B3%20${diffDays}%20Days%20Left%20%7C%20Exp:%20${expiryDateStr}`;
    
    return res.status(200).send(`${infoConfig}\n${configs.trim()}`);

  } catch (error) {
    // باز هم 200 برمی‌گردونیم تا کلاینت قفل نکنه
    return res.status(200).send("vless://00000000-0000-0000-0000-000000000000@1.1.1.1:443?security=none#⚠️%20Error%20Fetching%20Configs");
  }
}
