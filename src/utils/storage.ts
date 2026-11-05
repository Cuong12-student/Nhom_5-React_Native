import { API_BASE_URL } from "../constants/api";

// Bộ nhớ đệm thay thế AsyncStorage không cần native build
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
const USERS_STORAGE_KEY = "@app_users";

/* ===================================================
   1. ĐỊNH NGHĨA KIỂU DỮ LIỆU (TYPES)
=================================================== */

export interface Transaction {
  id: number | string;
  user_id?: number;
  wallet_id?: number;
  category_id?: number;
  title: string;
  amount: number;
  type: "income" | "expense";
  category?: string;
  category_icon?: string;
  category_color?: string;
  date: string; // ISO date string e.g. "2026-11-01"
  note?: string;
}

export interface Category {
  id: number | string;
  user_id?: number;
  name: string;
  type: "income" | "expense";
  icon?: string;
  color?: string;
}

export interface Wallet {
  id: number | string;
  user_id?: number;
  name: string;
  balance: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  walletBalance: number;
  monthlySpendLimit: number;
}

/* ===================================================
   2. DỮ LIỆU MẶC ĐỊNH & KHỞI TẠO
=================================================== */

const initialUsers: User[] = [
  {
    id: 1,
    name: "Người dùng test",
    email: "test@gmail.com",
    password: "123",
    walletBalance: 2_000_000,
    monthlySpendLimit: 5_000_000,
  },
];

const initialTransactions: Transaction[] = [
  {
    id: "1",
    title: "Cà phê sáng",
    amount: 45_000,
    type: "expense",
    category: "food",
    date: "2026-11-01",
  },
  {
    id: "2",
    title: "Grab về nhà",
    amount: 62_000,
    type: "expense",
    category: "travel",
    date: "2026-11-02",
  },
  {
    id: "3",
    title: "Lương tháng 11",
    amount: 15_000_000,
    type: "income",
    category: "other",
    date: "2026-11-01",
  },
  {
    id: "4",
    title: "Tiền điện",
    amount: 425_000,
    type: "expense",
    category: "living",
    date: "2026-11-03",
  },
  {
    id: "5",
    title: "Mua sách mới",
    amount: 189_000,
    type: "expense",
    category: "shopping",
    date: "2026-11-04",
  },
];

const memoryUsers: User[] = [...initialUsers];
let memoryTransactions: Transaction[] = [...initialTransactions];

/* ===================================================
   3. AUTHENTICATION (ĐĂNG KÝ / ĐĂNG NHẬP)
=================================================== */

export async function registerUser(
  name: string,
  email: string,
  password: string,
): Promise<User> {
  const trimmedName = name.trim();
  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedName) throw new Error("Vui lòng nhập họ và tên!");
  if (!trimmedEmail) throw new Error("Vui lòng nhập email!");
  if (!password || password.length < 3) {
    throw new Error("Mật khẩu phải có ít nhất 3 ký tự!");
  }

  const existing = memoryUsers.find(
    (u) => u.email.toLowerCase() === trimmedEmail,
  );
  if (existing) throw new Error("Email đã được đăng ký!");

  const newUser: User = {
    id: Date.now(),
    name: trimmedName,
    email: trimmedEmail,
    password,
    walletBalance: 0,
    monthlySpendLimit: 5_000_000,
  };

  memoryUsers.push(newUser);
  await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(memoryUsers));
  return newUser;
}

export async function loginUser(
  email: string,
  password: string,
): Promise<User> {
  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedEmail) throw new Error("Vui lòng nhập email!");
  if (!password) throw new Error("Vui lòng nhập mật khẩu!");

  const user = memoryUsers.find(
    (u) =>
      u.email.toLowerCase() === trimmedEmail && u.password === password,
  );
  if (!user) throw new Error("Email hoặc mật khẩu không chính xác!");
  return user;
}

/* ===================================================
   4. QUẢN LÝ VÍ & NẠP TIỀN
=================================================== */

export async function getWalletBalance(userId?: number): Promise<number> {
  if (userId) {
    const user = memoryUsers.find((u) => u.id === userId);
    if (user) return user.walletBalance;
  }

  // Thử kết nối API server nếu có
  try {
    const res = await fetch(`${API_BASE_URL}/wallets`);
    if (res.ok) {
      const wallets = await res.json();
      if (Array.isArray(wallets) && wallets.length > 0) {
        return Number(wallets[0].balance) || 0;
      }
    }
  } catch {
    // Dự phòng offline
  }

  const txList = await getTransactions();
  return txList.reduce((total, item) => {
    return item.type === "income" ? total + item.amount : total - item.amount;
  }, 0);
}

export async function depositToWallet(
  userId: number,
  amount: number,
): Promise<number> {
  const safeAmount = Number(amount);
  if (Number.isNaN(safeAmount) || safeAmount <= 0) {
    throw new Error("Số tiền nạp phải lớn hơn 0!");
  }

  const user = memoryUsers.find((u) => u.id === userId);
  if (!user) throw new Error("Không tìm thấy tài khoản!");

  user.walletBalance += safeAmount;
  await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(memoryUsers));
  return user.walletBalance;
}

/* ===================================================
   5. QUẢN LÝ GIỚI HẠN CHI TIÊU (MONTHLY SPEND LIMIT)
=================================================== */

export async function getSpendLimit(userId: number): Promise<number> {
  const user = memoryUsers.find((u) => u.id === userId);
  return user?.monthlySpendLimit ?? 5_000_000;
}

export async function setSpendLimit(
  userId: number,
  limit: number,
): Promise<number> {
  const safeLimit = Number(limit);
  if (Number.isNaN(safeLimit) || safeLimit <= 0) {
    throw new Error("Hạn mức chi tiêu không hợp lệ!");
  }

  const user = memoryUsers.find((u) => u.id === userId);
  if (!user) throw new Error("Không tìm thấy tài khoản!");

  user.monthlySpendLimit = safeLimit;
  await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(memoryUsers));
  return user.monthlySpendLimit;
}

/* ===================================================
   6. QUẢN LÝ GIAO DỊCH (TRANSACTIONS)
=================================================== */

export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/transactions`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        const formatted: Transaction[] = data.map((item: any) => ({
          id: item.id,
          user_id: item.user_id,
          wallet_id: item.wallet_id,
          category_id: item.category_id,
          title: item.title || "",
          amount: Number(item.amount) || 0,
          type: item.type === "income" ? "income" : "expense",
          category: item.category_name || item.category || "other",
          category_icon: item.category_icon || "tag",
          category_color: item.category_color || "#3B82F6",
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
    // Offline fallback
  }

  const localData = await AsyncStorage.getItem(TX_STORAGE_KEY);
  if (localData) {
    try {
      const parsed = JSON.parse(localData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryTransactions = parsed;
        return memoryTransactions;
      }
    } catch {
      // Ignored
    }
  }

  return [...memoryTransactions];
};

export const addTransaction = async (
  newTx: Omit<Transaction, "id">,
  userId?: number,
): Promise<Transaction> => {
  const safeAmount = Number(newTx.amount) || 0;
  const itemToAdd: Transaction = {
    ...newTx,
    amount: safeAmount,
    id: Date.now().toString(),
  };

  memoryTransactions = [itemToAdd, ...memoryTransactions];

  // Trừ/cộng số dư ví của user nếu có
  if (userId) {
    const user = memoryUsers.find((u) => u.id === userId);
    if (user) {
      if (newTx.type === "expense") {
        user.walletBalance -= safeAmount; // Có thể âm nếu chi vượt số dư
      } else if (newTx.type === "income") {
        user.walletBalance += safeAmount;
      }
      await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(memoryUsers));
    }
  }

  await AsyncStorage.setItem(TX_STORAGE_KEY, JSON.stringify(memoryTransactions));

  // Gửi API ngầm (nếu có server backend)
  try {
    const payload = {
      user_id: userId || 1,
      wallet_id: 1,
      category_id: 1,
      title: newTx.title,
      amount: safeAmount,
      type: newTx.type,
      date: newTx.date.includes(" ") ? newTx.date : `${newTx.date} 00:00:00`,
      note: newTx.note || "",
    };
    await fetch(`${API_BASE_URL}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // Không gián đoạn app khi offline
  }

  return itemToAdd;
};

export const updateTransaction = async (tx: Transaction): Promise<void> => {
  memoryTransactions = memoryTransactions.map((item) =>
    String(item.id) === String(tx.id) ? tx : item,
  );
  await AsyncStorage.setItem(TX_STORAGE_KEY, JSON.stringify(memoryTransactions));

  try {
    await fetch(`${API_BASE_URL}/transactions/${tx.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tx),
    });
  } catch {
    // Ignore offline error
  }
};

export const deleteTransaction = async (
  id: number | string,
): Promise<void> => {
  memoryTransactions = memoryTransactions.filter(
    (item) => String(item.id) !== String(id),
  );
  await AsyncStorage.setItem(TX_STORAGE_KEY, JSON.stringify(memoryTransactions));

  try {
    await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: "DELETE",
    });
  } catch {
    // Ignore offline error
  }
};

/* ===================================================
   7. QUẢN LÝ DANH MỤC (CATEGORIES)
=================================================== */

export const getCategories = async (): Promise<Category[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/categories`);
    if (res.ok) {
      const data: Category[] = await res.json();
      if (Array.isArray(data)) {
        await AsyncStorage.setItem(CAT_STORAGE_KEY, JSON.stringify(data));
        return data;
      }
    }
  } catch {
    // Fallback local
  }

  const localData = await AsyncStorage.getItem(CAT_STORAGE_KEY);
  if (localData) {
    try {
      return JSON.parse(localData);
    } catch {
      // Ignored
    }
  }

  return [
    { id: 1, name: "Ăn uống", type: "expense", icon: "fast-food", color: "#EF4444" },
    { id: 2, name: "Di chuyển", type: "expense", icon: "car", color: "#F59E0B" },
    { id: 3, name: "Lương", type: "income", icon: "cash", color: "#10B981" },
    { id: 4, name: "Thưởng", type: "income", icon: "gift", color: "#3B82F6" },
  ];
};

export const addCategory = async (
  newCat: Omit<Category, "id">,
): Promise<Category> => {
  const createdCategory: Category = { ...newCat, id: Date.now() };
  const currentList = await getCategories();
  await AsyncStorage.setItem(
    CAT_STORAGE_KEY,
    JSON.stringify([...currentList, createdCategory]),
  );

  try {
    await fetch(`${API_BASE_URL}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCat),
    });
  } catch {
    // Ignored
  }

  return createdCategory;
};

export const updateCategory = async (cat: Category): Promise<void> => {
  const list = await getCategories();
  const updated = list.map((item) =>
    String(item.id) === String(cat.id) ? cat : item,
  );
  await AsyncStorage.setItem(CAT_STORAGE_KEY, JSON.stringify(updated));

  try {
    await fetch(`${API_BASE_URL}/categories/${cat.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cat),
    });
  } catch {
    // Ignored
  }
};

export const deleteCategory = async (id: number | string): Promise<void> => {
  const list = await getCategories();
  const updated = list.filter((item) => String(item.id) !== String(id));
  await AsyncStorage.setItem(CAT_STORAGE_KEY, JSON.stringify(updated));

  try {
    await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: "DELETE",
    });
  } catch {
    // Ignored
  }
};

/* ===================================================
   8. THỐNG KÊ THU CHI & TÍNH TOÁN THEO THÁNG
=================================================== */

/** Lấy tất cả giao dịch trong 1 tháng cụ thể */
export function getTransactionsByMonth(
  year: number,
  month: number,
): Transaction[] {
  return memoryTransactions.filter((t) => {
    const d = new Date(t.date);
    if (Number.isNaN(d.getTime())) return false;
    return d.getFullYear() === year && d.getMonth() === month;
  });
}

/** Tổng chi trong tháng */
export function getMonthlyExpense(year: number, month: number): number {
  return getTransactionsByMonth(year, month)
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
}

/** Tổng thu trong tháng */
export function getMonthlyIncome(year: number, month: number): number {
  return getTransactionsByMonth(year, month)
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
}

/** Chi tiêu theo từng danh mục trong tháng */
export function getExpenseByCategory(
  year: number,
  month: number,
): { category: string; amount: number; fraction: number }[] {
  const monthTx = getTransactionsByMonth(year, month).filter(
    (t) => t.type === "expense",
  );
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

/** Tổng chi 6 tháng gần nhất */
export function getLast6MonthsExpense(now = new Date()): {
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
    const expense = getMonthlyExpense(year, month);
    result.push({
      label: `T${month + 1}\n${year}`,
      amount: expense,
      year,
      month,
    });
  }
  return result;
}

/** Số tiền còn lại trong hạn mức = limit - totalExpense (có thể âm nếu vượt) */
export function getRemainingBudget(
  userId: number,
  year: number,
  month: number,
): { limit: number; spent: number; remaining: number } {
  const user = memoryUsers.find((u) => u.id === userId);
  const limit = user?.monthlySpendLimit ?? 5_000_000;
  const spent = getMonthlyExpense(year, month);
  return { limit, spent, remaining: limit - spent };
}
