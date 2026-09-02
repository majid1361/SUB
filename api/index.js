export default async function handler(req, res) {
  const { user } = req.query;

  // ==========================================
  // 📋 دیتابیس کاربران و تاریخ انقضا (سال-ماه-روز)
  // ==========================================
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

  // ۱. بررسی وجود کاربر
  if (!user || !users[user]) {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.status(403).send("⚠️ کاربر یافت نشد یا دسترسی غیرمجاز است.");
  }

  // ۲گزین کل محتوای `api/index.js` توی گیت‌هاب کن تا درست بشه:
```javascript
export default async function handler(req, res) {
  const { user } = req.query;

  // ==========================================
  // 📋 دیتابیس کاربران و تاریخ انقضا (سال-ماه-روز)
  // ==========================================
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

  // ۱. بررسی وجود کاربر
  if (!user || !users[user]) {
res.setHeader("Content-Type", "text/plain; charset=utf-8");
return res.status(403).send("⚠️ کاربر یافت نشد یا دسترسی غیرمجاز است.");
  }

  // ۲. محاسبه تاریخ و روزهای باقی‌مانده
  const expiryDateStr = users[user];
  const expireDate = new Date-Control", "no-cache, no-store, must-revalidate");

// ۶. ساخت کانفیگ متنی اول لیست برای نمایش سریع روزهای مانده
const infoConfig = `vless://00000000-0000-0000-0000-000000000000@127.0.0.1:443?encryption=none&security=none#%E2%8F%B3%20${diffDays}%20Days%20Left%20%7C%20Exp:%20${expiryDateStr}`;

// ۷. ارسال نهایی
const finalOutput = `${infoConfig}\n${configs.trim()}`;
return res.status(200).send(finalOutput);

  } catch (error) {
res.setHeader("Content-Type", "text/plain; charset=utf-8");
return res.status(500).send("خطا در برقراری ارتباط با سرور");
  }
}
