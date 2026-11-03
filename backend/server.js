const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 1. Cấu hình kết nối MySQL Pool
const db = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: "Cuong126@", // Mật khẩu của bạn
  database: "finance_management",
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
});

// Kiểm tra kết nối khi khởi động
db.getConnection()
  .then((conn) => {
    console.log("===> Đã kết nối thành công tới MySQL (finance_management)");
    conn.release();
  })
  .catch((err) => console.error("===> Lỗi kết nối MySQL:", err.message));

/* ===================================================
   A. CÁC API DÀNH CHO GIAO DỊCH (TRANSACTIONS)
=================================================== */

// 1. Lấy danh sách giao dịch (JOIN lấy kèm tên và icon của Danh mục)
app.get("/api/transactions", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        t.*, 
        c.name AS category_name, 
        c.icon AS category_icon, 
        c.color AS category_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      ORDER BY t.date DESC, t.id DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Thêm giao dịch mới & Cập nhật số dư ví
app.post("/api/transactions", async (req, res) => {
  const { user_id, wallet_id, category_id, title, amount, type, date, note } =
    req.body;
  try {
    const targetUserId = user_id || 1;
    const targetWalletId = wallet_id || 1;
    const targetCategoryId = category_id || 1;

    const [result] = await db.query(
      `INSERT INTO transactions (user_id, wallet_id, category_id, title, amount, type, date, note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        targetUserId,
        targetWalletId,
        targetCategoryId,
        title,
        amount,
        type,
        date,
        note || null,
      ],
    );

    // Cập nhật số dư ví: Thu (+) / Chi (-)
    const change = type === "income" ? Number(amount) : -Number(amount);
    await db.query("UPDATE wallets SET balance = balance + ? WHERE id = ?", [
      change,
      targetWalletId,
    ]);

    res.json({
      message: "Thêm giao dịch thành công",
      insertId: result.insertId,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Sửa thông tin giao dịch
app.put("/api/transactions/:id", async (req, res) => {
  const { id } = req.params;
  const { title, amount, type, category_id, date, note } = req.body;
  try {
    await db.query(
      `UPDATE transactions 
       SET title = ?, amount = ?, type = ?, category_id = ?, date = ?, note = ?
       WHERE id = ?`,
      [title, amount, type, category_id || 1, date, note || null, id],
    );
    res.json({ message: "Cập nhật giao dịch thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Xóa giao dịch & Hoàn tác lại số dư ví
app.delete("/api/transactions/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Tìm giao dịch trước để biết số tiền và loại nhằm hoàn tiền ví
    const [txs] = await db.query("SELECT * FROM transactions WHERE id = ?", [
      id,
    ]);
    if (txs.length > 0) {
      const tx = txs[0];
      // Đảo ngược lại số tiền: Đã thu thì trừ đi, đã chi thì cộng lại
      const rollbackAmount =
        tx.type === "income" ? -Number(tx.amount) : Number(tx.amount);
      await db.query("UPDATE wallets SET balance = balance + ? WHERE id = ?", [
        rollbackAmount,
        tx.wallet_id,
      ]);
    }

    await db.query("DELETE FROM transactions WHERE id = ?", [id]);
    res.json({ message: "Xóa giao dịch thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===================================================
   B. CÁC API DÀNH CHO DANH MỤC (CATEGORIES)
=================================================== */

// 1. Lấy danh sách danh mục
app.get("/api/categories", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM categories ORDER BY id ASC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Thêm danh mục mới
app.post("/api/categories", async (req, res) => {
  const { user_id, name, type, icon, color } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO categories (user_id, name, type, icon, color) VALUES (?, ?, ?, ?, ?)",
      [user_id || 1, name, type, icon || "tag", color || "#3B82F6"],
    );
    res.json({
      message: "Thêm danh mục thành công",
      insertId: result.insertId,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Sửa danh mục
app.put("/api/categories/:id", async (req, res) => {
  const { id } = req.params;
  const { name, type, icon, color } = req.body;
  try {
    await db.query(
      "UPDATE categories SET name = ?, type = ?, icon = ?, color = ? WHERE id = ?",
      [name, type, icon || "tag", color || "#3B82F6", id],
    );
    res.json({ message: "Cập nhật danh mục thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Xóa danh mục
app.delete("/api/categories/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM categories WHERE id = ?", [id]);
    res.json({ message: "Xóa danh mục thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===================================================
   C. CÁC API DÀNH CHO VÍ (WALLETS)
=================================================== */

// Lấy danh sách ví & số dư
app.get("/api/wallets", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM wallets ORDER BY id ASC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===================================================
   D. KHỞI CHẠY SERVER
=================================================== */
const PORT = 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});
