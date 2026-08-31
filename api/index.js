export default async function handler(req, res) {
  const { user } = req.query;

  // ==========================================
  // 📋 دیتابیس کاربران و تاریخ انقضا (سال-ماه-روز)
  // ==========================================
  const users = {
    "majid": "2027-09-01",  // کاربرها 
    "tohid": "2027-09-01",
    "roja": "2027-09-01",
    "vida": "2027-09-01",
    "mehrang": "2027-09-01",
    "user": "2027-09-01",
    "user": "2027-09-01",
    "user": "2027-09-01",
    "user": "2027-09-01",
    "user": "2027-09-01",
    "user": "2027-09-01",
    "user": "2027-09-01",
    "user": "2027-09-01",
    "user": "2027-09-01",
    "user": "2027-09-01",
    "user": "2027-09-01",
  };

  // بررسی وجود کاربر
  if (!user || !users[user]) {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.status(403).send("⚠️ کاربر یافت نشد یا دسترسی غیرمجاز است.");
  }

  // بررسی تاریخ انقضا
  const expireDate = new Date(users[user]);
  const today = new Date();

  if (today > expireDate) {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.status(403).send("⛔ اعتبار اشتراک شما به پایان رسیده است.");
  }

  // دریافت کانفیگ‌ها از فایل sub.txt
  const GITHUB_RAW_URL = "https://raw.githubusercontent.com/majid1361/SUB/main/sub.txt";

  try {
    const response = await fetch(GITHUB_RAW_URL);
    if (!response.ok) throw new Error("Fetch Error");
    const configs = await response.text();

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.status(200).send(configs);
  } catch (error) {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.status(500).send("خطا در برقراری ارتباط با سرور");
  }
}
