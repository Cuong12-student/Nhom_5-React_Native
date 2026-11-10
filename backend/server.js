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
    const trimmedEmail = email ? email.trim().toLowerCase() : "";

    // Lấy thông tin khách hàng kèm ví từ MySQL
    const [rows] = await db.query(
      `SELECT c.id, c.name, c.email, c.password, c.status,
              w.id AS wallet_id, COALESCE(w.balance, 0) AS wallet_balance
       FROM customers c
       LEFT JOIN wallets w ON c.id = w.customer_id
       WHERE c.email = ?
       LIMIT 1`,
      [trimmedEmail],
    );

    if (rows.length === 0) {
      return res
        .status(401)
        .json({ error: "Email không tồn tại trong hệ thống!" });
    }

    const user = rows[0];

    if (user.password !== password) {
      return res.status(401).json({ error: "Mật khẩu không chính xác!" });
    }

    if (user.status === "blocked") {
      return res.status(403).json({ error: "Tài khoản của bạn đã bị khóa!" });
    }

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      walletId: user.wallet_id || null,
      walletBalance: Number(user.wallet_balance || 0),
      monthlySpendLimit: 5000000,
    };

    // Trả về cả hai kiểu (user và trực tiếp) để app đọc kiểu nào cũng có 'id'
    res.json({
      message: "Đăng nhập thành công!",
      user: userData,
      ...userData,
    });
  } catch (err) {
    console.error("Lỗi login customer:", err);
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "Vui lòng nhập đầy đủ email và mật khẩu!" });
  }

  const trimmedEmail = email.trim().toLowerCase();
  const displayName = name ? name.trim() : trimmedEmail.split("@")[0];

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Kiểm tra email đã tồn tại trong DB chưa
    const [existing] = await conn.query(
      "SELECT id FROM customers WHERE email = ? LIMIT 1",
      [trimmedEmail],
    );

    if (existing.length > 0) {
      await conn.rollback();
      return res.status(400).json({ error: "Email này đã được sử dụng!" });
    }

    // 2. Thêm khách hàng vào bảng customers
    const [custResult] = await conn.query(
      "INSERT INTO customers (name, email, password, status) VALUES (?, ?, ?, 'active')",
      [displayName, trimmedEmail, password],
    );
    const newCustomerId = custResult.insertId;

    // 3. TẠO VÍ CHO KHÁCH HÀNG MỚI (Bỏ cột 'status' để không bị lỗi ER_BAD_FIELD_ERROR)
    const [walletResult] = await conn.query(
      "INSERT INTO wallets (customer_id, balance) VALUES (?, 0.00)",
      [newCustomerId],
    );

    // 4. COMMIT BẮT BUỘC để MySQL lưu dữ liệu thực tế
    await conn.commit();

    const newUserData = {
      id: newCustomerId,
      name: displayName,
      email: trimmedEmail,
      walletId: walletResult.insertId,
      walletBalance: 0,
      monthlySpendLimit: 5000000,
    };

    return res.status(201).json({
      message: "Đăng ký tài khoản thành công!",
      user: newUserData,
      ...newUserData,
    });
  } catch (err) {
    await conn.rollback();
    console.error("Lỗi khi đăng ký:", err);
    return res.status(500).json({ error: err.message || "Lỗi tạo tài khoản!" });
  } finally {
    conn.release();
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

// 1. Lấy danh sách giao dịch chi tiêu
app.get("/api/transactions", async (req, res) => {
  const { customer_id } = req.query;
  try {
    const [rows] = await db.query(
      `SELECT t.id, t.customer_id, t.wallet_id, t.category_id, t.title, t.amount, t.date, t.note,
              c.name AS category_name, c.icon AS category_icon, c.color AS category_color,
              w.name AS wallet_name
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       LEFT JOIN wallets w ON t.wallet_id = w.id
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

// 2. Thêm giao dịch chi tiêu mới & Trừ số dư ví (Dùng Transaction)
app.post("/api/transactions", async (req, res) => {
  const { customer_id, category_id, title, amount, date, note } = req.body;
  let { wallet_id } = req.body;

  try {
    // 1. Kiểm tra xem wallet_id có tồn tại trong bảng wallets không
    let validWallet = false;
    if (wallet_id) {
      const [check] = await db.query("SELECT id FROM wallets WHERE id = ?", [
        wallet_id,
      ]);
      if (check.length > 0) validWallet = true;
    }

    // 2. Nếu không có hoặc wallet_id không hợp lệ, tự tìm ví của customer này
    if (!validWallet) {
      const [userWallets] = await db.query(
        "SELECT id FROM wallets WHERE customer_id = ? LIMIT 1",
        [customer_id],
      );

      if (userWallets.length > 0) {
        wallet_id = userWallets[0].id;
      } else {
        // Nếu user này chưa có ví nào trong MySQL, tự động tạo ví mới cho họ
        const [newWallet] = await db.query(
          "INSERT INTO wallets (customer_id, balance) VALUES (?, 0.00)",
          [customer_id],
        );
        wallet_id = newWallet.insertId;
      }
    }

    // 3. Tiến hành insert giao dịch với wallet_id hợp lệ
    const [result] = await db.query(
      `INSERT INTO transactions (customer_id, wallet_id, category_id, title, amount, date, note)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        customer_id,
        wallet_id,
        category_id || 1,
        title,
        amount,
        date || new Date(),
        note || null,
      ],
    );

    res.status(201).json({
      message: "Thêm giao dịch thành công!",
      insertId: result.insertId,
      wallet_id: wallet_id,
    });
  } catch (err) {
    console.error("Lỗi thêm giao dịch:", err);
    res.status(500).json({ error: err.message || "Lỗi tạo chi tiêu!" });
  }
});

// 3. Sửa giao dịch chi tiêu & Cập nhật chênh lệch số dư ví (Dùng Transaction)
app.put("/api/transactions/:id", async (req, res) => {
  const { id } = req.params;
  const { title, amount, category_id, date, note, customer_id } = req.body;
  const newAmount = Number(amount);

  if (isNaN(newAmount) || newAmount <= 0) {
    return res.status(400).json({ error: "Số tiền không hợp lệ!" });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    let checkSql = "SELECT * FROM transactions WHERE id = ?";
    let checkParams = [id];
    if (customer_id) {
      checkSql += " AND customer_id = ?";
      checkParams.push(customer_id);
    }

    const [oldRows] = await conn.query(checkSql, checkParams);
    if (oldRows.length === 0) {
      await conn.rollback();
      return res
        .status(404)
        .json({ message: "Không tìm thấy giao dịch hoặc không có quyền sửa!" });
    }

    const oldTx = oldRows[0];
    const oldAmount = Number(oldTx.amount);
    const diff = newAmount - oldAmount;

    // Xác định đúng wallet_id (phòng trường hợp bản ghi cũ null wallet_id)
    let targetWalletId = oldTx.wallet_id;
    if (!targetWalletId) {
      const [wDefault] = await conn.query(
        "SELECT id, balance FROM wallets WHERE customer_id = ? LIMIT 1",
        [oldTx.customer_id],
      );
      targetWalletId = wDefault[0]?.id;
    }

    // Nếu chi tiêu tăng lên, kiểm tra xem ví có đủ tiền không
    if (diff > 0 && targetWalletId && oldTx.type !== "income") {
      const [wCheck] = await conn.query(
        "SELECT balance FROM wallets WHERE id = ?",
        [targetWalletId],
      );
      if (wCheck.length === 0 || Number(wCheck[0].balance) < diff) {
        await conn.rollback();
        return res.status(400).json({
          error: "Số dư trong ví không đủ để cập nhật khoản chi tiêu này!",
        });
      }
    }

    const formattedDate = date
      ? String(date).slice(0, 19).replace("T", " ")
      : oldTx.date;

    // Cập nhật transactions
    await conn.query(
      `UPDATE transactions 
       SET title = ?, amount = ?, category_id = ?, date = ?, note = ?
       WHERE id = ?`,
      [
        title || oldTx.title,
        newAmount,
        category_id !== undefined ? category_id : oldTx.category_id,
        formattedDate,
        note !== undefined ? note : oldTx.note,
        id,
      ],
    );

    // Cập nhật ví nếu có chênh lệch và có ví
    if (diff !== 0 && targetWalletId) {
      const walletDiff = oldTx.type === "income" ? -diff : diff;
      await conn.query(
        "UPDATE wallets SET balance = balance - ? WHERE id = ?",
        [walletDiff, targetWalletId],
      );
    }

    let currentBalance = 0;
    if (targetWalletId) {
      const [wRows] = await conn.query(
        "SELECT balance FROM wallets WHERE id = ?",
        [targetWalletId],
      );
      currentBalance = Number(wRows[0]?.balance || 0);
    }

    await conn.commit();
    res.json({
      message: "Cập nhật giao dịch thành công",
      newBalance: currentBalance,
    });
  } catch (err) {
    await conn.rollback();
    console.error("Lỗi cập nhật transaction:", err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// 4. Xóa giao dịch chi tiêu & Hoàn trả tiền vào ví (Dùng Transaction)
app.delete("/api/transactions/:id", async (req, res) => {
  const { id } = req.params;
  const { customer_id } = req.query;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    let checkSql = "SELECT * FROM transactions WHERE id = ?";
    let checkParams = [id];
    if (customer_id) {
      checkSql += " AND customer_id = ?";
      checkParams.push(customer_id);
    }

    const [txs] = await conn.query(checkSql, checkParams);
    if (txs.length === 0) {
      await conn.rollback();
      return res
        .status(404)
        .json({ message: "Không tìm thấy giao dịch hoặc không có quyền xóa!" });
    }

    const tx = txs[0];
    let targetWalletId = tx.wallet_id;
    if (!targetWalletId) {
      const [wDefault] = await conn.query(
        "SELECT id FROM wallets WHERE customer_id = ? LIMIT 1",
        [tx.customer_id],
      );
      targetWalletId = wDefault[0]?.id;
    }

    // Hoàn tiền vào ví: nếu là chi tiêu thì +amount, nếu là thu nhập thì -amount
    if (targetWalletId) {
      const amountToRevert =
        tx.type === "income" ? -Number(tx.amount) : Number(tx.amount);

      await conn.query(
        "UPDATE wallets SET balance = balance + ? WHERE id = ?",
        [amountToRevert, targetWalletId],
      );
    }

    // Xóa giao dịch
    await conn.query("DELETE FROM transactions WHERE id = ?", [id]);

    let currentBalance = 0;
    if (targetWalletId) {
      const [wRows] = await conn.query(
        "SELECT balance FROM wallets WHERE id = ?",
        [targetWalletId],
      );
      currentBalance = Number(wRows[0]?.balance || 0);
    }

    await conn.commit();
    res.json({
      message: "Xóa giao dịch thành công",
      newBalance: currentBalance,
    });
  } catch (err) {
    await conn.rollback();
    console.error("Lỗi xóa transaction:", err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

/* ===================================================
   3. CÁC API DÀNH CHO DANH MỤC (CATEGORIES - ĐÃ BỎ CỘT TYPE)
=================================================== */
// 1. LẤY DANH SÁCH DANH MỤC (Mặc định hệ thống + Danh mục riêng của User)
app.get("/api/categories", async (req, res) => {
  const { customer_id } = req.query;
  try {
    let sql = "SELECT * FROM categories";
    const params = [];

    if (customer_id) {
      // Lấy danh mục hệ thống (NULL) HOẶC danh mục của chính user đó
      sql += " WHERE customer_id IS NULL OR customer_id = ?";
      params.push(customer_id);
    } else {
      sql += " WHERE customer_id IS NULL";
    }

    sql += " ORDER BY id ASC";
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Lỗi lấy danh mục:", err);
    res.status(500).json({ error: err.message });
  }
});

// 2. TẠO MỚI DANH MỤC
app.post("/api/categories", async (req, res) => {
  const { name, icon, color, customer_id } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Tên danh mục không được để trống!" });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO categories (name, icon, color, customer_id) VALUES (?, ?, ?, ?)",
      [name.trim(), icon || "📦", color || "#6B7280", customer_id || null],
    );

    res.status(201).json({
      message: "Tạo danh mục thành công!",
      category: {
        id: result.insertId,
        name: name.trim(),
        icon: icon || "📦",
        color: color || "#6B7280",
        customer_id: customer_id || null,
      },
    });
  } catch (err) {
    console.error("Lỗi tạo danh mục:", err);
    res.status(500).json({ error: err.message || "Không thể tạo danh mục!" });
  }
});

// CẬP NHẬT DANH MỤC
app.put("/api/categories/:id", async (req, res) => {
  const { id } = req.params;
  const { name, icon, color } = req.body;

  console.log(`[UPDATE] Yêu cầu sửa ID: ${id}, Name: ${name}`);

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Tên danh mục không được để trống!" });
  }

  try {
    const [result] = await db.query(
      "UPDATE categories SET name = ?, icon = ?, color = ? WHERE id = ?",
      [name.trim(), icon || "pricetag-outline", color || "#174B39", id],
    );

    console.log(`[UPDATE RESULT] Affected rows: ${result.affectedRows}`);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: `Không tìm thấy danh mục có ID = ${id} trong database!`,
      });
    }

    res.json({ success: true, message: "Cập nhật danh mục thành công!" });
  } catch (err) {
    console.error("[UPDATE ERROR]:", err);
    res.status(500).json({ error: err.message || "Lỗi server khi sửa!" });
  }
});

// XÓA DANH MỤC
app.delete("/api/categories/:id", async (req, res) => {
  const { id } = req.params;
  console.log(`[DELETE] Yêu cầu xóa ID: ${id}`);

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Tạm gỡ khóa ngoại ở các giao dịch (set về NULL hoặc ID 1) để không bị lỗi Foreign key constraint
    await conn.query(
      "UPDATE transactions SET category_id = NULL WHERE category_id = ?",
      [id],
    );

    // 2. Thực hiện xóa danh mục
    const [result] = await conn.query("DELETE FROM categories WHERE id = ?", [
      id,
    ]);
    console.log(`[DELETE RESULT] Affected rows: ${result.affectedRows}`);

    if (result.affectedRows === 0) {
      await conn.rollback();
      return res
        .status(404)
        .json({ error: `Không tìm thấy danh mục ID = ${id} để xóa!` });
    }

    await conn.commit();
    res.json({ success: true, message: "Đã xóa danh mục thành công!" });
  } catch (err) {
    await conn.rollback();
    console.error("[DELETE ERROR]:", err);
    res.status(500).json({ error: err.message || "Lỗi server khi xóa!" });
  } finally {
    conn.release();
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
app.post("/api/wallets/deposit", async (req, res) => {
  const { customer_id, amount } = req.body;
  const depositAmount = Number(amount);

  if (!customer_id || isNaN(depositAmount) || depositAmount <= 0) {
    return res.status(400).json({ error: "Số tiền nạp không hợp lệ!" });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Cộng tiền vào ví của khách hàng
    await conn.query(
      "UPDATE wallets SET balance = balance + ? WHERE customer_id = ?",
      [depositAmount, customer_id],
    );

    // 2. Lấy số dư mới nhất
    const [wallets] = await conn.query(
      "SELECT balance FROM wallets WHERE customer_id = ? LIMIT 1",
      [customer_id],
    );

    if (wallets.length === 0) {
      throw new Error("Không tìm thấy ví cho người dùng này!");
    }

    const newBalance = Number(wallets[0].balance);

    // 3. Ghi log hệ thống
    await conn.query(
      "INSERT INTO system_logs (customer_id, action, level, details) VALUES (?, 'WALLET_DEPOSIT', 'INFO', ?)",
      [customer_id, `Nạp ${depositAmount.toLocaleString("vi-VN")} đ vào ví`],
    );

    await conn.commit();
    res.json({
      message: "Nạp tiền thành công!",
      newBalance: newBalance,
    });
  } catch (err) {
    await conn.rollback();
    console.error("Lỗi nạp tiền:", err);
    res.status(500).json({ error: err.message || "Lỗi xử lý nạp tiền!" });
  } finally {
    conn.release();
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
    // Lấy thông tin khách hàng kèm số dư từ bảng wallets và tổng tiền đã tiêu
    const [users] = await db.query(
      `SELECT c.id, c.name, c.email, c.status, c.created_at,
              COALESCE(w.balance, 0) AS wallet_balance,
              COALESCE(SUM(t.amount), 0) AS total_spent
       FROM customers c
       LEFT JOIN wallets w ON c.id = w.customer_id
       LEFT JOIN transactions t ON c.id = t.customer_id
       GROUP BY c.id, w.id
       ORDER BY c.created_at DESC`,
    );

    res.json(users);
  } catch (err) {
    console.error("Lỗi lấy danh sách khách hàng cho admin:", err);
    res.status(500).json({ error: err.message });
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
