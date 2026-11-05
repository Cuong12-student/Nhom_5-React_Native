// ────────────────────────────────────────────────
// storage.ts  –  In-memory data store for the app
// Handles: Users, Wallet, Transactions, Spending Limit
// ────────────────────────────────────────────────

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string; // ISO date string e.g. "2026-11-01"
  note?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  walletBalance: number;       // Số dư ví hiện tại
  monthlySpendLimit: number;   // Giới hạn chi tiêu tháng (mặc định 5.000.000)
}

// ─── Seed users ──────────────────────────────────
let memoryUsers: User[] = [
  {
    id: 1,
    name: "Người dùng test",
    email: "test@gmail.com",
    password: "123",
    walletBalance: 2_000_000,
    monthlySpendLimit: 5_000_000,
  },
];

// ─── Seed transactions ───────────────────────────
let memoryTransactions: Transaction[] = [
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

// ─── Auth ─────────────────────────────────────────

export async function registerUser(
  name: string,
  email: string,
  password: string,
): Promise<User> {
  if (!name.trim()) throw new Error("Vui lòng nhập họ và tên!");
  if (!email.trim()) throw new Error("Vui lòng nhập email!");
  if (!password.trim()) throw new Error("Vui lòng nhập mật khẩu!");
  if (password.length < 3)
    throw new Error("Mật khẩu phải có ít nhất 3 ký tự!");

  const existing = memoryUsers.find(
    (u) => u.email.toLowerCase() === email.toLowerCase(),
  );
  if (existing) throw new Error("Email đã được đăng ký!");

  const newUser: User = {
    id: Date.now(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
    walletBalance: 0,
    monthlySpendLimit: 5_000_000,
  };
  memoryUsers.push(newUser);
  return newUser;
}

export async function loginUser(
  email: string,
  password: string,
): Promise<User> {
  if (!email.trim()) throw new Error("Vui lòng nhập email!");
  if (!password.trim()) throw new Error("Vui lòng nhập mật khẩu!");

  const user = memoryUsers.find(
    (u) =>
      u.email.toLowerCase() === email.toLowerCase() && u.password === password,
  );
  if (!user) throw new Error("Email hoặc mật khẩu không chính xác!");
  return user;
}

// ─── Wallet ───────────────────────────────────────

export async function getWalletBalance(userId: number): Promise<number> {
  const user = memoryUsers.find((u) => u.id === userId);
  return user?.walletBalance ?? 0;
}

export async function depositToWallet(
  userId: number,
  amount: number,
): Promise<number> {
  if (amount <= 0) throw new Error("Số tiền nạp phải lớn hơn 0!");
  const user = memoryUsers.find((u) => u.id === userId);
  if (!user) throw new Error("Không tìm thấy tài khoản!");
  user.walletBalance += amount;
  return user.walletBalance;
}

// ─── Spending Limit ───────────────────────────────

export async function getSpendLimit(userId: number): Promise<number> {
  const user = memoryUsers.find((u) => u.id === userId);
  return user?.monthlySpendLimit ?? 5_000_000;
}

export async function setSpendLimit(
  userId: number,
  limit: number,
): Promise<number> {
  const user = memoryUsers.find((u) => u.id === userId);
  if (!user) throw new Error("Không tìm thấy tài khoản!");
  user.monthlySpendLimit = limit;
  return user.monthlySpendLimit;
}

// ─── Transactions ─────────────────────────────────

export const getTransactions = async (): Promise<Transaction[]> => {
  return [...memoryTransactions];
};

export const addTransaction = async (
  newTx: Omit<Transaction, "id">,
  userId?: number,
): Promise<Transaction> => {
  const itemToAdd: Transaction = {
    ...newTx,
    id: Date.now().toString(),
  };
  memoryTransactions = [itemToAdd, ...memoryTransactions];

  // Nếu là chi tiêu, trừ tiền khỏi ví
  if (userId && newTx.type === "expense") {
    const user = memoryUsers.find((u) => u.id === userId);
    if (user) {
      user.walletBalance -= newTx.amount; // Cho phép âm
    }
  }
  // Nếu là thu nhập, cộng tiền vào ví
  if (userId && newTx.type === "income") {
    const user = memoryUsers.find((u) => u.id === userId);
    if (user) {
      user.walletBalance += newTx.amount;
    }
  }

  return itemToAdd;
};

export const deleteTransaction = async (id: string) => {
  memoryTransactions = memoryTransactions.filter((item) => item.id !== id);
};

// ─── Statistics Helpers ───────────────────────────

/** Lấy tất cả giao dịch trong 1 tháng cụ thể */
export function getTransactionsByMonth(
  year: number,
  month: number,
): Transaction[] {
  return memoryTransactions.filter((t) => {
    const d = new Date(t.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });
}

/** Tổng chi trong tháng */
export function getMonthlyExpense(year: number, month: number): number {
  return getTransactionsByMonth(year, month)
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
}

/** Tổng thu trong tháng */
export function getMonthlyIncome(year: number, month: number): number {
  return getTransactionsByMonth(year, month)
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
}

/** Chi tiêu theo từng danh mục trong tháng */
export function getExpenseByCategory(
  year: number,
  month: number,
): { category: string; amount: number; fraction: number }[] {
  const monthTx = getTransactionsByMonth(year, month).filter(
    (t) => t.type === "expense",
  );
  const totalExpense = monthTx.reduce((sum, t) => sum + t.amount, 0);
  const categoryMap = new Map<string, number>();

  for (const tx of monthTx) {
    categoryMap.set(tx.category, (categoryMap.get(tx.category) || 0) + tx.amount);
  }

  return Array.from(categoryMap.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      fraction: totalExpense > 0 ? amount / totalExpense : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

/** Tổng chi 6 tháng gần nhất (cho biểu đồ xu hướng) */
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

/** Số tiền còn lại trong hạn mức = limit - totalExpense (có thể âm) */
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
