const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Logger request đặt ngay đầu để theo dõi toàn bộ yêu cầu đến server
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

// Phục vụ giao diện Web Admin tĩnh
app.use("/admin", express.static(path.join(__dirname, "public/admin")));

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
   1. ROUTE ĐĂNG NHẬP (AUTH)
=================================================== */

// Đăng nhập cho App di động (Bảng customers, kiểm tra trạng thái khóa)
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query(
      "SELECT id, name, email, password, initial_balance, status FROM customers WHERE email = ?",
      [email],
    );

    if (rows.length === 0 || rows[0].password !== password) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không chính xác" });
    }

    const customer = rows[0];
    if (customer.status === "blocked") {
      return res
        .status(403)
        .json({ message: "Tài khoản của bạn đã bị khóa bởi quản trị viên." });
    }

    res.json({
      message: "Đăng nhập thành công",
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        initial_balance: customer.initial_balance,
      },
    });
  } catch (err) {
    console.error("Lỗi login customer:", err);
    res.status(500).json({ message: "Lỗi server khi đăng nhập" });
  }
});

// Đăng nhập cho Web Dashboard (Bảng admins)
app.post("/api/admin/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query(
      "SELECT id, name, email, password FROM admins WHERE email = ?",
      [email],
    );

    if (rows.length === 0 || rows[0].password !== password) {
      return res
        .status(401)
        .json({ message: "Tài khoản hoặc mật khẩu không đúng" });
    }

    res.json({
      message: "Đăng nhập trang quản trị thành công",
      admin: { id: rows[0].id, name: rows[0].name, email: rows[0].email },
    });
  } catch (err) {
    console.error("Lỗi login admin:", err);
    res.status(500).json({ message: "Lỗi server khi đăng nhập admin" });
  }
});

/* ===================================================
   2. CÁC API DÀNH CHO GIAO DỊCH (TRANSACTIONS - CHỈ CHI TIÊU)
=================================================== */

// Lấy danh sách giao dịch chi tiêu (JOIN lấy thêm tên ví và icon danh mục)
app.get("/api/transactions", async (req, res) => {
  const { customer_id } = req.query;
  try {
    const [rows] = await db.query(
      `SELECT t.id, t.customer_id, t.wallet_id, t.category_id, t.title, t.amount, t.date, t.note,
              c.name AS category_name, c.icon AS category_icon, c.color AS category_color,
              w.name AS wallet_name
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       JOIN wallets w ON t.wallet_id = w.id
       WHERE (? IS NULL OR t.customer_id = ?)
       ORDER BY t.date DESC`,
      [customer_id || null, customer_id || null],
    );
    res.json(rows);
  } catch (err) {
    console.error("Lỗi lấy danh sách transactions:", err);
    res.status(500).json({ error: err.message });
  }
});

// Thêm giao dịch chi tiêu mới & Trừ số dư ví
app.post("/api/transactions", async (req, res) => {
  const { customer_id, wallet_id, category_id, title, amount, date, note } =
    req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO transactions (customer_id, wallet_id, category_id, title, amount, date, note)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        customer_id,
        wallet_id,
        category_id,
        title,
        Number(amount),
        date || new Date(),
        note || null,
      ],
    );

    // Trừ số dư ví
    await db.query(
      "UPDATE wallets SET balance = balance - ? WHERE id = ? AND customer_id = ?",
      [Number(amount), wallet_id, customer_id],
    );

    res.status(201).json({
      message: "Ghi nhận chi tiêu thành công",
      insertId: result.insertId,
    });
  } catch (err) {
    console.error("Lỗi tạo transaction:", err);
    res.status(500).json({ error: err.message });
  }
});

// Sửa giao dịch chi tiêu & Cập nhật chênh lệch số dư ví
app.put("/api/transactions/:id", async (req, res) => {
  const { id } = req.params;
  const { title, amount, category_id, date, note } = req.body;

  try {
    // 1. Lấy thông tin giao dịch cũ
    const [oldRows] = await db.query(
      "SELECT * FROM transactions WHERE id = ?",
      [id],
    );
    if (oldRows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy giao dịch" });
    }
    const oldTx = oldRows[0];
    const oldAmount = Number(oldTx.amount);
    const newAmount = Number(amount);

    // 2. Cập nhật bảng transactions
    await db.query(
      `UPDATE transactions 
       SET title = ?, amount = ?, category_id = ?, date = ?, note = ?
       WHERE id = ?`,
      [title, newAmount, category_id, date, note || null, id],
    );

    // 3. Tính toán chênh lệch số dư ví:
    // Nếu tiền chi tăng lên (newAmount > oldAmount) -> ví bị trừ thêm
    // Nếu tiền chi giảm đi (newAmount < oldAmount) -> ví được cộng lại
    const diff = newAmount - oldAmount;
    await db.query("UPDATE wallets SET balance = balance - ? WHERE id = ?", [
      diff,
      oldTx.wallet_id,
    ]);

    res.json({ message: "Cập nhật giao dịch thành công" });
  } catch (err) {
    console.error("Lỗi cập nhật transaction:", err);
    res.status(500).json({ error: err.message });
  }
});

// Xóa giao dịch chi tiêu & Hoàn trả tiền vào ví
app.delete("/api/transactions/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [txs] = await db.query("SELECT * FROM transactions WHERE id = ?", [
      id,
    ]);
    if (txs.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy giao dịch" });
    }

    const tx = txs[0];
    // Hoàn lại tiền chi tiêu vào ví
    await db.query("UPDATE wallets SET balance = balance + ? WHERE id = ?", [
      Number(tx.amount),
      tx.wallet_id,
    ]);

    await db.query("DELETE FROM transactions WHERE id = ?", [id]);
    res.json({ message: "Xóa giao dịch thành công" });
  } catch (err) {
    console.error("Lỗi xóa transaction:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ===================================================
   3. CÁC API DÀNH CHO DANH MỤC (CATEGORIES - ĐÃ BỎ CỘT TYPE)
=================================================== */

// Lấy danh mục chi tiêu (Mặc định hệ thống + Danh mục riêng của customer)
app.get("/api/categories", async (req, res) => {
  const { customer_id } = req.query;
  try {
    const [rows] = await db.query(
      "SELECT id, customer_id, name, icon, color FROM categories WHERE customer_id IS NULL OR customer_id = ? ORDER BY id ASC",
      [customer_id || 0],
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Thêm danh mục chi tiêu mới
app.post("/api/categories", async (req, res) => {
  const { customer_id, name, icon, color } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO categories (customer_id, name, icon, color) VALUES (?, ?, ?, ?)",
      [
        customer_id || null,
        name,
        icon || "pricetag-outline",
        color || "#EF4444",
      ],
    );
    res.json({
      message: "Thêm danh mục thành công",
      insertId: result.insertId,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sửa danh mục chi tiêu
app.put("/api/categories/:id", async (req, res) => {
  const { id } = req.params;
  const { name, icon, color } = req.body;
  try {
    await db.query(
      "UPDATE categories SET name = ?, icon = ?, color = ? WHERE id = ?",
      [name, icon || "pricetag-outline", color || "#EF4444", id],
    );
    res.json({ message: "Cập nhật danh mục thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Xóa danh mục chi tiêu
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
   4. CÁC API DÀNH CHO VÍ (WALLETS)
=================================================== */

// Lấy danh sách ví theo customer_id
app.get("/api/wallets", async (req, res) => {
  const { customer_id } = req.query;
  try {
    const [rows] = await db.query(
      "SELECT * FROM wallets WHERE (? IS NULL OR customer_id = ?) ORDER BY id ASC",
      [customer_id || null, customer_id || null],
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===================================================
   5. CÁC API DÀNH CHO WEB ADMIN DASHBOARD
=================================================== */

// Thống kê trang chủ Admin (index.html)
app.get("/api/admin/dashboard", async (req, res) => {
  try {
    const [[{ usersCount }]] = await db.query(
      "SELECT COUNT(*) AS usersCount FROM customers",
    );
    const [[{ transactionsCount }]] = await db.query(
      "SELECT COUNT(*) AS transactionsCount FROM transactions",
    );

    // Đếm số lượng tài khoản theo trạng thái
    const [[{ activeCount }]] = await db.query(
      "SELECT COUNT(*) AS activeCount FROM customers WHERE status = 'active'",
    );
    const [[{ blockedCount }]] = await db.query(
      "SELECT COUNT(*) AS blockedCount FROM customers WHERE status = 'blocked'",
    );

    res.json({
      usersCount,
      transactionsCount,
      activeCount,
      blockedCount,
    });
  } catch (err) {
    console.error("Lỗi truy vấn dashboard:", err);
    res.status(500).json({ error: "Lỗi truy vấn dashboard" });
  }
});

// Danh sách khách hàng (users.html)
app.get("/api/admin/users", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email, initial_balance, status, created_at FROM customers ORDER BY id ASC",
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Lỗi lấy danh sách khách hàng" });
  }
});

// Khóa / Mở khóa khách hàng (users.html)
app.patch("/api/admin/users/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await db.query("UPDATE customers SET status = ? WHERE id = ?", [
      status,
      id,
    ]);
    res.json({ message: "Cập nhật trạng thái thành công" });
  } catch (err) {
    res.status(500).json({ error: "Lỗi cập nhật trạng thái" });
  }
});
// Lấy danh sách cấu hình
app.get("/api/admin/configs", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM system_configs ORDER BY id ASC",
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Lỗi lấy cấu hình hệ thống" });
  }
});
// Cấu hình hệ thống (system.html)
app.put("/api/admin/configs/:key", async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;
  try {
    await db.query(
      "UPDATE system_configs SET config_value = ? WHERE config_key = ?",
      [value, key],
    );
    res.json({ message: "Cập nhật cấu hình thành công" });
  } catch (err) {
    res.status(500).json({ error: "Lỗi cập nhật cấu hình" });
  }
});

// Nhật ký hệ thống (system.html)
app.get("/api/admin/logs", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT l.id, l.action, l.level, l.details, l.created_at, c.email AS customer_email 
       FROM system_logs l
       LEFT JOIN customers c ON l.customer_id = c.id
       ORDER BY l.created_at DESC LIMIT 50`,
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Lỗi lấy nhật ký hệ thống" });
  }
});

/* ===================================================
   6. KHỞI CHẠY SERVER
=================================================== */
const PORT = 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
  console.log(`Web Admin: http://localhost:${PORT}/admin`);
});
