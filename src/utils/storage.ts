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

// Bộ nhớ đệm tạm trong RAM để các màn hình đọc đồng bộ tức thì không bị giật lag
const limitCache: Record<number, number> = {};

/**
 * Lấy hạn mức chi tiêu của người dùng
 */
export async function getSpendLimit(userId: number): Promise<number> {
  if (limitCache[userId] !== undefined) {
    return limitCache[userId];
  }
  try {
    const saved = await AsyncStorage.getItem(`@limit_${userId}`);
    const limit = saved ? Number(saved) : 5_000_000; // Mặc định 5 triệu
    limitCache[userId] = limit;
    return limit;
  } catch {
    return 5_000_000;
  }
}

/**
 * Cập nhật hạn mức chi tiêu mới (Hỗ trợ cả mốc có sẵn và số tiền tự nhập ở mục "Khác")
 */
export async function setSpendLimit(
  userId: number,
  limit: number,
): Promise<number> {
  const safeLimit = Math.max(0, Math.floor(Number(limit) || 0));
  limitCache[userId] = safeLimit;
  try {
    await AsyncStorage.setItem(`@limit_${userId}`, String(safeLimit));
  } catch (e) {
    console.warn("Lỗi lưu hạn mức:", e);
  }
  return safeLimit;
}

/**
 * Tính toán hạn mức còn lại:
 * 1. Tự động reset khi bước sang tháng mới (chỉ lọc chi tiêu đúng tháng/năm truyền vào).
 * 2. Khi chi tiêu vượt mức (spent > limit), remaining sẽ ra số ÂM (ví dụ: -430.000 đ).
 */
export async function getRemainingBudget(
  userId: number,
  year: number,
  month: number, // 0 - 11 (theo getMonth() của JS)
) {
  // 1. Lấy hạn mức
  const limit = await getSpendLimit(userId);

  // 2. Lấy danh sách giao dịch
  const transactions: Transaction[] = await getTransactions(userId);

  // 3. Lọc chi tiêu chỉ trong đúng tháng và năm yêu cầu (Tự động reset khi sang tháng khác)
  const monthlyExpense = transactions.reduce((total, tx: any) => {
    // Chỉ tính giao dịch chi tiêu (expense)
    if (tx.type !== "expense") return total;

    const txDate = new Date(tx.date);
    const txYear = txDate.getFullYear();
    const txMonth = txDate.getMonth();

    if (txYear === year && txMonth === month) {
      return total + Number(tx.amount || 0);
    }
    return total;
  }, 0);

  // 4. Tính số tiền còn lại (cho phép ra số âm khi vượt mức)
  const remaining = limit - monthlyExpense;

  return {
    limit,
    spent: monthlyExpense,
    remaining, // Số âm nếu vượt mức
  };
}

/* ===================================================
   5. QUẢN LÝ GIAO DỊCH CHI TIÊU (TRANSACTIONS)
=================================================== */

export const getTransactions = async (
  customerId?: number,
): Promise<Transaction[]> => {
  const currentKey = customerId
    ? `${TX_STORAGE_KEY}_${customerId}`
    : TX_STORAGE_KEY;

  try {
    const url = customerId
      ? `${API_BASE_URL}/transactions?customer_id=${customerId}`
      : `${API_BASE_URL}/transactions`;

    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        const formatted: Transaction[] = data
          .filter(
            (item: any) =>
              !customerId || Number(item.customer_id) === Number(customerId),
          )
          .map((item: any) => ({
            id: item.id,
            customer_id: item.customer_id,
            wallet_id: item.wallet_id,
            category_id: item.category_id,
            title: item.title || "",
            amount: Number(item.amount) || 0,
            type: "expense",
            category: item.category_name || item.category || "other",
            category_icon: item.category_icon || "tag",
            category_color: item.category_color || "#EF4444",
            date: item.date
              ? String(item.date).slice(0, 10)
              : new Date().toISOString().slice(0, 10),
            note: item.note || "",
          }));

        // Lưu cache riêng theo từng customerId
        await AsyncStorage.setItem(currentKey, JSON.stringify(formatted));
        memoryTransactions = formatted;
        return formatted;
      }
    }
  } catch {
    // Fallback offline
  }

  // Đọc từ key cache riêng của user
  const localData = await AsyncStorage.getItem(currentKey);
  if (localData) {
    try {
      const parsed = JSON.parse(localData);
      if (Array.isArray(parsed)) {
        memoryTransactions = parsed;
        return memoryTransactions;
      }
    } catch {}
  }

  memoryTransactions = [];
  return [];
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

export const updateTransaction = async (
  tx: Transaction,
  customerId?: number,
): Promise<{ newBalance?: number }> => {
  const targetCustomerId = customerId || tx.customer_id;

  const baseUrl = API_BASE_URL.endsWith("/api")
    ? API_BASE_URL
    : `${API_BASE_URL}/api`;

  // 1. Chuẩn hóa chuỗi ngày an toàn (cast sang any để tránh lỗi never/instanceof)
  const rawDate: any = tx.date;
  let formattedDate: string;
  if (!rawDate) {
    formattedDate = new Date().toISOString().slice(0, 19).replace("T", " ");
  } else if (typeof rawDate === "string") {
    formattedDate = rawDate.includes("T")
      ? rawDate.slice(0, 19).replace("T", " ")
      : rawDate.includes(" ")
        ? rawDate
        : `${rawDate} 00:00:00`;
  } else if (rawDate instanceof Date) {
    formattedDate = rawDate.toISOString().slice(0, 19).replace("T", " ");
  } else {
    formattedDate = String(rawDate);
  }

  // Chuẩn hóa category_id luôn về kiểu số (number)
  const anyTx = tx as any;
  const parsedCategoryId = Number(tx.category_id || anyTx.category || 1);

  // 2. Gửi request cập nhật lên Backend
  const response = await fetch(`${baseUrl}/transactions/${tx.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: tx.title || anyTx.name,
      amount: Number(tx.amount) || 0,
      category_id: parsedCategoryId,
      date: formattedDate,
      note: tx.note !== undefined ? tx.note : null,
      customer_id: targetCustomerId,
    }),
  });

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const rawText = await response.text();
    console.error("Lỗi cập nhật chi tiêu:", rawText);
    throw new Error("Không thể kết nối đến máy chủ để cập nhật!");
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      data.error || data.message || "Cập nhật chi tiêu thất bại!",
    );
  }

  // 3. Cập nhật dữ liệu vào bộ nhớ đệm
  memoryTransactions = memoryTransactions.map((item) =>
    String(item.id) === String(tx.id)
      ? {
          ...item,
          ...tx,
          amount: Number(tx.amount),
          date: formattedDate,
          category_id: parsedCategoryId,
        }
      : item,
  );

  await AsyncStorage.setItem(
    TX_STORAGE_KEY,
    JSON.stringify(memoryTransactions),
  );

  // 4. Cập nhật số dư ví mới vào Storage
  if (data.newBalance !== undefined) {
    try {
      const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        parsedUser.walletBalance = Number(data.newBalance);
        parsedUser.balance = Number(data.newBalance);
        await AsyncStorage.setItem(
          USER_STORAGE_KEY,
          JSON.stringify(parsedUser),
        );
      }
    } catch (e) {
      console.warn("Lỗi cập nhật số dư ví:", e);
    }
  }

  return data;
};
export const deleteTransaction = async (
  id: number | string,
  customerId?: number,
): Promise<{ newBalance?: number }> => {
  const baseUrl = API_BASE_URL.endsWith("/api")
    ? API_BASE_URL
    : `${API_BASE_URL}/api`;

  const url = customerId
    ? `${baseUrl}/transactions/${id}?customer_id=${customerId}`
    : `${baseUrl}/transactions/${id}`;

  const response = await fetch(url, {
    method: "DELETE",
  });

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const rawText = await response.text();
    console.error("Lỗi xóa chi tiêu:", rawText);
    throw new Error("Không thể kết nối đến máy chủ để xóa!");
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || "Xóa chi tiêu thất bại!");
  }

  // Xóa khỏi cache và storage
  memoryTransactions = memoryTransactions.filter(
    (item) => String(item.id) !== String(id),
  );
  await AsyncStorage.setItem(
    TX_STORAGE_KEY,
    JSON.stringify(memoryTransactions),
  );

  if (data.newBalance !== undefined) {
    try {
      const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        parsedUser.walletBalance = Number(data.newBalance);
        parsedUser.balance = Number(data.newBalance);
        await AsyncStorage.setItem(
          USER_STORAGE_KEY,
          JSON.stringify(parsedUser),
        );
      }
    } catch (e) {
      console.warn("Lỗi cập nhật số dư ví sau khi xóa:", e);
    }
  }

  return data;
};

/* ===================================================
   6. QUẢN LÝ DANH MỤC (CATEGORIES)
=================================================== */
// 1. LẤY DANH MỤC
export const getCategories = async (
  customerId?: number,
): Promise<Category[]> => {
  const baseUrl = API_BASE_URL.endsWith("/api")
    ? API_BASE_URL
    : `${API_BASE_URL}/api`;
  const url = customerId
    ? `${baseUrl}/categories?customer_id=${customerId}`
    : `${baseUrl}/categories`;

  try {
    const res = await fetch(url);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn("Lỗi tải danh mục:", e);
  }
  return [];
};

// 2. THÊM DANH MỤC
export const createCategory = async (
  category: { name: string; icon: string; color: string },
  customerId?: number,
): Promise<Category> => {
  const baseUrl = API_BASE_URL.endsWith("/api")
    ? API_BASE_URL
    : `${API_BASE_URL}/api`;
  const res = await fetch(`${baseUrl}/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...category, customer_id: customerId }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Thêm danh mục thất bại!");
  return data.category;
};

// 3. SỬA DANH MỤC
export const updateCategory = async (
  id: number | string,
  category: { name: string; icon: string; color: string },
  customerId?: number,
): Promise<void> => {
  const baseUrl = API_BASE_URL.endsWith("/api")
    ? API_BASE_URL
    : `${API_BASE_URL}/api`;
  const res = await fetch(`${baseUrl}/categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...category,
      customer_id: customerId,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Không thể cập nhật danh mục!");
  }
};

// 4. XÓA DANH MỤC
export const deleteCategory = async (
  id: number | string,
  customerId?: number,
): Promise<void> => {
  const baseUrl = API_BASE_URL.endsWith("/api")
    ? API_BASE_URL
    : `${API_BASE_URL}/api`;
  const url = customerId
    ? `${baseUrl}/categories/${id}?customer_id=${customerId}`
    : `${baseUrl}/categories/${id}`;

  const res = await fetch(url, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Không thể xóa danh mục!");
  }
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
