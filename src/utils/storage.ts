import { API_BASE_URL } from "../constants/api";

const memoryStore: Record<string, string> = {};

const AsyncStorage = {
  getItem: async (key: string): Promise<string | null> => {
    return Object.prototype.hasOwnProperty.call(memoryStore, key)
      ? memoryStore[key]
      : null;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    memoryStore[key] = value;
  },
  removeItem: async (key: string): Promise<void> => {
    delete memoryStore[key];
  },
};

const TX_STORAGE_KEY = "@app_transactions";
const CAT_STORAGE_KEY = "@app_categories";
const USER_STORAGE_KEY = "@app_current_user";

/* ===================================================
   1. ĐỊNH NGHĨA KIỂU DỮ LIỆU (TYPES)
=================================================== */

export interface Transaction {
  id: number | string;
  customer_id?: number;
  wallet_id?: number;
  category_id?: number;
  title: string;
  amount: number;
  type: "expense" | "income"; // Giữ tương thích giao diện (mặc định expense)
  category?: string;
  category_icon?: string;
  category_color?: string;
  date: string;
  note?: string;
}

export interface Category {
  id: number | string;
  customer_id?: number | null;
  name: string;
  icon?: string;
  color?: string;
  type?: "expense" | "income";
}

export interface Wallet {
  id: number | string;
  customer_id?: number;
  name: string;
  balance: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  initial_balance?: number;
  walletBalance: number;
  monthlySpendLimit: number;
}

let memoryTransactions: Transaction[] = [];

/* ===================================================
   2. AUTHENTICATION (KẾT NỐI API BACKEND)
=================================================== */

export async function loginUser(
  email: string,
  password: string,
): Promise<User> {
  const trimmedEmail = email.trim().toLowerCase();

  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: trimmedEmail, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || "Đăng nhập thất bại!");
  }

  // Lấy dữ liệu user an toàn (chấp nhận cả data.user hoặc data)
  const loggedInUser: User = data.user || data;

  if (!loggedInUser || !loggedInUser.id) {
    throw new Error("Dữ liệu phản hồi từ máy chủ không hợp lệ!");
  }

  await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));
  return loggedInUser;
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
): Promise<User> {
  const trimmedEmail = email.trim().toLowerCase();

  const baseUrl = API_BASE_URL.endsWith("/api")
    ? API_BASE_URL
    : `${API_BASE_URL}/api`;

  const response = await fetch(`${baseUrl}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: name.trim(),
      email: trimmedEmail,
      password: password,
    }),
  });

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const rawText = await response.text();
    console.error("Lỗi kết nối server đăng ký:", rawText);
    throw new Error("Không thể kết nối đến máy chủ đăng ký!");
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Đăng ký không thành công!");
  }

  const newUser: User = data.user || data;

  // Lưu thông tin người dùng có ID thực tế từ MySQL vào máy
  await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
  return newUser;
}

/* ===================================================
   3. QUẢN LÝ VÍ & SỐ DƯ
=================================================== */

// 1. Lấy số dư ví (chỉ giữ 1 hàm duy nhất)
export async function getWalletBalance(customerId?: number): Promise<number> {
  if (!customerId) return 0;
  try {
    const res = await fetch(
      `${API_BASE_URL}/wallets?customer_id=${customerId}`,
    );
    if (res.ok) {
      const wallets = await res.json();
      if (Array.isArray(wallets) && wallets.length > 0) {
        return Number(wallets[0].balance) || 0;
      }
    }
  } catch (error) {
    console.warn("Lỗi lấy số dư ví, dùng fallback:", error);
  }
  return 0;
}

// 2. Nạp tiền vào ví và cập nhật lại bộ nhớ máy
export async function depositToWallet(
  customerId: number,
  amount: number,
): Promise<number> {
  const safeAmount = Number(amount);
  if (Number.isNaN(safeAmount) || safeAmount <= 0) {
    throw new Error("Số tiền nạp phải lớn hơn 0!");
  }

  // Tự động kiểm tra để tránh trùng lặp chữ /api
  const baseUrl = API_BASE_URL.endsWith("/api")
    ? API_BASE_URL
    : `${API_BASE_URL}/api`;

  const response = await fetch(`${baseUrl}/wallets/deposit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customer_id: customerId,
      amount: safeAmount,
    }),
  });

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const rawText = await response.text();
    console.error("Server không trả về JSON:", rawText);
    throw new Error(
      "Không kết nối được tới API nạp tiền (404/500). Hãy kiểm tra lại node server.js đã restart chưa!",
    );
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Không thể nạp tiền!");
  }

  const newBalance = Number(data.newBalance);

  // Cập nhật số dư mới vào AsyncStorage
  try {
    const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      parsedUser.walletBalance = newBalance;
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(parsedUser));
    }
  } catch (e) {
    console.warn("Lỗi lưu số dư mới vào AsyncStorage:", e);
  }

  return newBalance;
}

/* ===================================================
   4. QUẢN LÝ GIỚI HẠN CHI TIÊU (SPEND LIMIT)
=================================================== */

export async function getSpendLimit(userId: number): Promise<number> {
  const saved = await AsyncStorage.getItem(`@limit_${userId}`);
  return saved ? Number(saved) : 5_000_000;
}

export async function setSpendLimit(
  userId: number,
  limit: number,
): Promise<number> {
  const safeLimit = Number(limit);
  await AsyncStorage.setItem(`@limit_${userId}`, String(safeLimit));
  return safeLimit;
}

/* ===================================================
   5. QUẢN LÝ GIAO DỊCH CHI TIÊU (TRANSACTIONS)
=================================================== */

export const getTransactions = async (
  customerId?: number,
): Promise<Transaction[]> => {
  try {
    const url = customerId
      ? `${API_BASE_URL}/transactions?customer_id=${customerId}`
      : `${API_BASE_URL}/transactions`;

    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        const formatted: Transaction[] = data.map((item: any) => ({
          id: item.id,
          customer_id: item.customer_id,
          wallet_id: item.wallet_id,
          category_id: item.category_id,
          title: item.title || "",
          amount: Number(item.amount) || 0,
          type: "expense", // Hệ thống mới chuyên quản lý chi tiêu
          category: item.category_name || item.category || "other",
          category_icon: item.category_icon || "tag",
          category_color: item.category_color || "#EF4444",
          date: item.date
            ? String(item.date).slice(0, 10)
            : new Date().toISOString().slice(0, 10),
          note: item.note || "",
        }));

        await AsyncStorage.setItem(TX_STORAGE_KEY, JSON.stringify(formatted));
        memoryTransactions = formatted;
        return formatted;
      }
    }
  } catch {
    // Fallback offline
  }

  const localData = await AsyncStorage.getItem(TX_STORAGE_KEY);
  if (localData) {
    try {
      const parsed = JSON.parse(localData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryTransactions = parsed;
        return memoryTransactions;
      }
    } catch {}
  }

  return [...memoryTransactions];
};

export const addTransaction = async (
  newTx: Omit<Transaction, "id">,
  customerId?: number,
): Promise<Transaction> => {
  const safeAmount = Number(newTx.amount) || 0;

  // Lấy category_id tương ứng hoặc mặc định là 1 (Ăn uống)
  const categoryId =
    typeof newTx.category_id === "number" ? newTx.category_id : 1;

  const payload = {
    customer_id: customerId || 1,
    wallet_id: newTx.wallet_id,
    category_id: categoryId,
    title: newTx.title,
    amount: safeAmount,
    date: newTx.date.includes(" ") ? newTx.date : `${newTx.date} 00:00:00`,
    note: newTx.note || "",
  };

  const response = await fetch(`${API_BASE_URL}/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || "Lỗi tạo khoản chi tiêu");
  }

  const itemToAdd: Transaction = {
    ...newTx,
    id: data.insertId || Date.now().toString(),
    amount: safeAmount,
    type: "expense",
  };

  memoryTransactions = [itemToAdd, ...memoryTransactions];
  await AsyncStorage.setItem(
    TX_STORAGE_KEY,
    JSON.stringify(memoryTransactions),
  );
  return itemToAdd;
};

export const updateTransaction = async (tx: Transaction): Promise<void> => {
  memoryTransactions = memoryTransactions.map((item) =>
    String(item.id) === String(tx.id) ? tx : item,
  );
  await AsyncStorage.setItem(
    TX_STORAGE_KEY,
    JSON.stringify(memoryTransactions),
  );

  await fetch(`${API_BASE_URL}/transactions/${tx.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: tx.title,
      amount: tx.amount,
      category_id: tx.category_id || 1,
      date: tx.date,
      note: tx.note || null,
    }),
  });
};

export const deleteTransaction = async (id: number | string): Promise<void> => {
  memoryTransactions = memoryTransactions.filter(
    (item) => String(item.id) !== String(id),
  );
  await AsyncStorage.setItem(
    TX_STORAGE_KEY,
    JSON.stringify(memoryTransactions),
  );

  await fetch(`${API_BASE_URL}/transactions/${id}`, {
    method: "DELETE",
  });
};

/* ===================================================
   6. QUẢN LÝ DANH MỤC (CATEGORIES)
=================================================== */

export const getCategories = async (
  customerId?: number,
): Promise<Category[]> => {
  try {
    const url = customerId
      ? `${API_BASE_URL}/categories?customer_id=${customerId}`
      : `${API_BASE_URL}/categories`;

    const res = await fetch(url);
    if (res.ok) {
      const data: Category[] = await res.json();
      if (Array.isArray(data)) {
        await AsyncStorage.setItem(CAT_STORAGE_KEY, JSON.stringify(data));
        return data;
      }
    }
  } catch {}

  return [
    { id: 1, name: "Ăn uống", icon: "fast-food", color: "#EF4444" },
    { id: 2, name: "Đi lại", icon: "car", color: "#F59E0B" },
    { id: 3, name: "Mua sắm", icon: "cart", color: "#8B5CF6" },
    { id: 4, name: "Hóa đơn & Điện nước", icon: "receipt", color: "#3B82F6" },
  ];
};

export const addCategory = async (
  newCat: Omit<Category, "id">,
): Promise<Category> => {
  const res = await fetch(`${API_BASE_URL}/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newCat),
  });
  const data = await res.json();
  return { ...newCat, id: data.insertId || Date.now() };
};

export const deleteCategory = async (id: number | string): Promise<void> => {
  await fetch(`${API_BASE_URL}/categories/${id}`, {
    method: "DELETE",
  });
};

/* ===================================================
   7. THỐNG KÊ CHI TIÊU THEO THÁNG
=================================================== */

export function getTransactionsByMonth(
  year: number,
  month: number,
  customerId?: number,
): Transaction[] {
  return memoryTransactions.filter((t) => {
    // 1. Lọc theo User: Nếu có truyền customerId thì chỉ lấy giao dịch của user đó
    if (
      customerId &&
      t.customer_id &&
      Number(t.customer_id) !== Number(customerId)
    ) {
      return false;
    }

    // 2. Lọc theo Năm & Tháng
    const d = new Date(t.date);
    if (Number.isNaN(d.getTime())) return false;
    return d.getFullYear() === year && d.getMonth() === month;
  });
}

export function getMonthlyExpense(
  year: number,
  month: number,
  customerId?: number,
): number {
  return getTransactionsByMonth(year, month, customerId).reduce(
    (sum, t) => sum + (Number(t.amount) || 0),
    0,
  );
}

export function getMonthlyIncome(
  year: number,
  month: number,
  customerId?: number,
): number {
  return 0; // Hệ thống chuyên biệt quản lý chi tiêu
}

export function getExpenseByCategory(
  year: number,
  month: number,
  customerId?: number,
): { category: string; amount: number; fraction: number }[] {
  const monthTx = getTransactionsByMonth(year, month, customerId);
  const totalExpense = monthTx.reduce(
    (sum, t) => sum + (Number(t.amount) || 0),
    0,
  );
  const categoryMap = new Map<string, number>();

  for (const tx of monthTx) {
    const cat = tx.category || "other";
    const current = categoryMap.get(cat) || 0;
    categoryMap.set(cat, current + (Number(tx.amount) || 0));
  }

  return Array.from(categoryMap.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      fraction: totalExpense > 0 ? amount / totalExpense : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function getLast6MonthsExpense(
  now = new Date(),
  customerId?: number,
): {
  label: string;
  amount: number;
  year: number;
  month: number;
}[] {
  const result = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const expense = getMonthlyExpense(year, month, customerId);
    result.push({
      label: `T${month + 1}\n${year}`,
      amount: expense,
      year,
      month,
    });
  }
  return result;
}

export function getRemainingBudget(
  userId: number,
  year: number,
  month: number,
): { limit: number; spent: number; remaining: number } {
  // ĐÃ SỬA: Truyền userId vào getMonthlyExpense để tính đúng chi tiêu của người dùng hiện tại
  const spent = getMonthlyExpense(year, month, userId);
  const limit = 5_000_000;
  return { limit, spent, remaining: limit - spent };
}
