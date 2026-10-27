export type Language = "vi" | "en" | "ms" | "fr";
export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  label?: string;
};
export type Transaction = {
  id: string;
  name: string;
  amount: number;
  type: "expense" | "income";
  categoryId: string;
  occurredAt: string;
  note: string;
};
export type FinanceData = {
  version: 1;
  language: Language;
  openingBalance: number;
  categories: Category[];
  transactions: Transaction[];
};
export const COLORS = [
  "#174B39",
  "#699F77",
  "#A5BD8B",
  "#BF9D60",
  "#8F9C92",
  "#AC7C6B",
];
export const ICONS = [
  "restaurant-outline",
  "bus-outline",
  "bag-handle-outline",
  "home-outline",
  "cafe-outline",
  "heart-outline",
  "book-outline",
  "gift-outline",
  "briefcase-outline",
  "ellipse-outline",
];
export const newId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
export function seedData(now = new Date()): FinanceData {
  const date = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    d.setHours(12, 0, 0, 0);
    return d.toISOString();
  };
  const categories: Category[] = [
    {
      id: "food",
      name: "Ăn uống",
      label: "food",
      icon: ICONS[0],
      color: COLORS[0],
    },
    {
      id: "travel",
      name: "Đi lại",
      label: "travel",
      icon: ICONS[1],
      color: COLORS[1],
    },
    {
      id: "shopping",
      name: "Mua sắm",
      label: "shopping",
      icon: ICONS[2],
      color: COLORS[2],
    },
    {
      id: "living",
      name: "Sinh hoạt",
      label: "living",
      icon: ICONS[3],
      color: COLORS[3],
    },
    {
      id: "other",
      name: "Khác",
      label: "other",
      icon: ICONS[9],
      color: COLORS[4],
    },
  ];
  const items: [string, number, string, number][] = [
    ["Cà phê sáng", 45000, "food", 0],
    ["Bữa trưa cùng bạn", 85000, "food", 0],
    ["Grab về nhà", 62000, "travel", 1],
    ["Mua sách mới", 189000, "shopping", 2],
    ["Tiền điện", 425000, "living", 3],
    ["Đi siêu thị", 356000, "living", 4],
    ["Bữa tối cuối tuần", 245000, "food", 5],
    ["Đổ xăng", 70000, "travel", 6],
    ["Áo thun mới", 299000, "shopping", 8],
    ["Cà phê cuối tuần", 55000, "food", 9],
    ["Tiền Internet", 220000, "living", 12],
    ["Vé xem phim", 95000, "other", 14],
  ];
  return {
    version: 1,
    language: "vi",
    openingBalance: 5250000,
    categories,
    transactions: [
      ...items.map(([name, amount, categoryId, days], i) => ({
        id: `sample-${i}`,
        name,
        amount,
        categoryId,
        type: "expense" as const,
        occurredAt: date(days),
        note: "",
      })),
      {
        id: "sample-income",
        name: "Lương tháng này",
        amount: 7500000,
        categoryId: "other",
        type: "income",
        occurredAt: date(15),
        note: "Dữ liệu minh họa",
      },
    ],
  };
}
export function balance(data: FinanceData) {
  return data.transactions.reduce(
    (sum, t) => sum + (t.type === "income" ? t.amount : -t.amount),
    data.openingBalance,
  );
}
export function parseAmount(raw: string): number {
  return /^\d+$/.test(raw.trim()) ? Number(raw.trim()) : NaN;
}
export function validateTransaction(
  t: Omit<Transaction, "id">,
  categories: Category[],
): string | null {
  if (!t.name.trim()) return "nameRequired";
  if (!categories.some((c) => c.id === t.categoryId)) return "categoryRequired";
  if (
    !Number.isSafeInteger(t.amount) ||
    t.amount <= 0 ||
    t.amount > 1_000_000_000_000
  )
    return "amountInvalid";
  if (!t.occurredAt || Number.isNaN(Date.parse(t.occurredAt)))
    return "dateRequired";
  return null;
}
export function saveTransaction(
  data: FinanceData,
  tx: Transaction,
): FinanceData {
  const error = validateTransaction(tx, data.categories);
  if (error) throw new Error(error);
  const exists = data.transactions.some((t) => t.id === tx.id);
  return {
    ...data,
    transactions: exists
      ? data.transactions.map((t) =>
          t.id === tx.id ? { ...tx, name: tx.name.trim() } : t,
        )
      : [{ ...tx, name: tx.name.trim() }, ...data.transactions],
  };
}
export function deleteCategory(data: FinanceData, id: string): FinanceData {
  if (data.transactions.some((t) => t.categoryId === id))
    throw new Error("categoryInUse");
  return { ...data, categories: data.categories.filter((c) => c.id !== id) };
}
export function filterTransactions(
  data: FinanceData,
  query = "",
  category = "all",
  kind = "all",
) {
  const normalize = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase();
  return data.transactions
    .filter(
      (t) =>
        normalize(t.name).includes(normalize(query.trim())) &&
        (category === "all" || t.categoryId === category) &&
        (kind === "all" || t.type === kind),
    )
    .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt));
}
export function pageItems<T>(items: T[], requested: number, size = 6) {
  const pages = Math.max(1, Math.ceil(items.length / size));
  const page = Math.max(1, Math.min(requested, pages));
  return { page, pages, items: items.slice((page - 1) * size, page * size) };
}
export function monthTransactions(data: FinanceData, month: Date) {
  return data.transactions.filter((t) => {
    const d = new Date(t.occurredAt);
    return (
      d.getFullYear() === month.getFullYear() &&
      d.getMonth() === month.getMonth()
    );
  });
}
export function breakdown(data: FinanceData, transactions: Transaction[]) {
  const expenses = transactions.filter((t) => t.type === "expense");
  const total = expenses.reduce((s, t) => s + t.amount, 0);
  return data.categories
    .map((c) => {
      const amount = expenses
        .filter((t) => t.categoryId === c.id)
        .reduce((s, t) => s + t.amount, 0);
      return { ...c, amount, fraction: total ? amount / total : 0 };
    })
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);
}
export function isFinanceData(value: unknown): value is FinanceData {
  if (!value || typeof value !== "object") return false;
  const d = value as FinanceData;
  if (
    d.version !== 1 ||
    !["vi", "en", "ms", "fr"].includes(d.language) ||
    !Number.isSafeInteger(d.openingBalance) ||
    !Array.isArray(d.categories) ||
    !Array.isArray(d.transactions)
  )
    return false;
  if (
    !d.categories.every(
      (c) =>
        c &&
        typeof c.id === "string" &&
        typeof c.name === "string" &&
        typeof c.icon === "string" &&
        typeof c.color === "string",
    )
  )
    return false;
  if (
    !d.transactions.every(
      (t) =>
        t &&
        typeof t.id === "string" &&
        typeof t.name === "string" &&
        typeof t.note === "string" &&
        (t.type === "expense" || t.type === "income") &&
        !validateTransaction(t, d.categories),
    )
  )
    return false;
  return (
    new Set(d.categories.map((c) => c.id)).size === d.categories.length &&
    new Set(d.transactions.map((t) => t.id)).size === d.transactions.length
  );
}
