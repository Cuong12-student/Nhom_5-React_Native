import { API_BASE_URL } from "../constants/api";

// Bộ nhớ đệm thay thế AsyncStorage không cần native build
const memoryStore: Record<string, string> = {};

const AsyncStorage = {
  getItem: async (key: string): Promise<string | null> => {
    return memoryStore[key] || null;
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
const WALLET_STORAGE_KEY = "@app_wallets";

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
  date: string;
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

/* ===================================================
   2. QUẢN LÝ GIAO DỊCH (TRANSACTIONS)
=================================================== */

export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/transactions`);
    if (res.ok) {
      const data = await res.json();
      const formatted: Transaction[] = data.map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        wallet_id: item.wallet_id,
        category_id: item.category_id,
        title: item.title,
        amount: Number(item.amount),
        type: item.type,
        category: item.category_name || item.category || "General",
        category_icon: item.category_icon || "tag",
        category_color: item.category_color || "#3B82F6",
        date: item.date
          ? item.date.slice(0, 10)
          : new Date().toISOString().slice(0, 10),
        note: item.note || "",
      }));

      await AsyncStorage.setItem(TX_STORAGE_KEY, JSON.stringify(formatted));
      return formatted;
    }
  } catch (error) {
    console.warn("Lỗi kết nối server, lấy dữ liệu tạm:", error);
  }

  const localData = await AsyncStorage.getItem(TX_STORAGE_KEY);
  return localData ? JSON.parse(localData) : [];
};

export const addTransaction = async (newTx: Omit<Transaction, "id">) => {
  const payload = {
    user_id: newTx.user_id || 1,
    wallet_id: newTx.wallet_id || 1,
    category_id: newTx.category_id || 1,
    title: newTx.title,
    amount: Number(newTx.amount),
    type: newTx.type,
    date: newTx.date.includes(" ") ? newTx.date : `${newTx.date} 00:00:00`,
    note: newTx.note || "",
  };

  let createdId: number | string = Date.now();

  try {
    const res = await fetch(`${API_BASE_URL}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const result = await res.json();
      if (result.insertId) createdId = result.insertId;
    }
  } catch (error) {
    console.warn("Lưu MySQL lỗi, lưu tạm máy:", error);
  }

  const createdItem: Transaction = { ...newTx, id: createdId };
  const localData = await AsyncStorage.getItem(TX_STORAGE_KEY);
  const currentList: Transaction[] = localData ? JSON.parse(localData) : [];
  await AsyncStorage.setItem(
    TX_STORAGE_KEY,
    JSON.stringify([createdItem, ...currentList]),
  );

  return createdItem;
};

export const updateTransaction = async (tx: Transaction): Promise<void> => {
  try {
    await fetch(`${API_BASE_URL}/transactions/${tx.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tx),
    });
  } catch (error) {
    console.warn("Sửa transaction lỗi:", error);
  }

  const localData = await AsyncStorage.getItem(TX_STORAGE_KEY);
  if (localData) {
    const list: Transaction[] = JSON.parse(localData);
    const updated = list.map((item) =>
      String(item.id) === String(tx.id) ? tx : item,
    );
    await AsyncStorage.setItem(TX_STORAGE_KEY, JSON.stringify(updated));
  }
};

export const deleteTransaction = async (id: number | string): Promise<void> => {
  try {
    await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.warn("Xóa transaction lỗi:", error);
  }

  const localData = await AsyncStorage.getItem(TX_STORAGE_KEY);
  if (localData) {
    const list: Transaction[] = JSON.parse(localData);
    const updated = list.filter((item) => String(item.id) !== String(id));
    await AsyncStorage.setItem(TX_STORAGE_KEY, JSON.stringify(updated));
  }
};

/* ===================================================
   3. QUẢN LÝ DANH MỤC (CATEGORIES)
=================================================== */

export const getCategories = async (): Promise<Category[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/categories`);
    if (res.ok) {
      const data: Category[] = await res.json();
      await AsyncStorage.setItem(CAT_STORAGE_KEY, JSON.stringify(data));
      return data;
    }
  } catch (error) {
    console.warn("Lỗi tải categories:", error);
  }

  const localData = await AsyncStorage.getItem(CAT_STORAGE_KEY);
  if (localData) return JSON.parse(localData);

  return [
    {
      id: 1,
      name: "Ăn uống",
      type: "expense",
      icon: "fast-food",
      color: "#EF4444",
    },
    {
      id: 2,
      name: "Di chuyển",
      type: "expense",
      icon: "car",
      color: "#F59E0B",
    },
    { id: 3, name: "Lương", type: "income", icon: "cash", color: "#10B981" },
    { id: 4, name: "Thưởng", type: "income", icon: "gift", color: "#3B82F6" },
  ];
};

export const addCategory = async (
  newCat: Omit<Category, "id">,
): Promise<Category> => {
  let createdId: number | string = Date.now();

  try {
    const res = await fetch(`${API_BASE_URL}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCat),
    });

    if (res.ok) {
      const result = await res.json();
      if (result.insertId) createdId = result.insertId;
    }
  } catch (error) {
    console.warn("Lưu category lỗi:", error);
  }

  const createdCategory: Category = { ...newCat, id: createdId };
  const localData = await AsyncStorage.getItem(CAT_STORAGE_KEY);
  const currentList: Category[] = localData ? JSON.parse(localData) : [];
  await AsyncStorage.setItem(
    CAT_STORAGE_KEY,
    JSON.stringify([...currentList, createdCategory]),
  );

  return createdCategory;
};

export const updateCategory = async (cat: Category): Promise<void> => {
  try {
    await fetch(`${API_BASE_URL}/categories/${cat.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cat),
    });
  } catch (error) {
    console.warn("Sửa category lỗi:", error);
  }

  const localData = await AsyncStorage.getItem(CAT_STORAGE_KEY);
  if (localData) {
    const list: Category[] = JSON.parse(localData);
    const updated = list.map((item) =>
      String(item.id) === String(cat.id) ? cat : item,
    );
    await AsyncStorage.setItem(CAT_STORAGE_KEY, JSON.stringify(updated));
  }
};

export const deleteCategory = async (id: number | string): Promise<void> => {
  try {
    await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.warn("Xóa category lỗi:", error);
  }

  const localData = await AsyncStorage.getItem(CAT_STORAGE_KEY);
  if (localData) {
    const list: Category[] = JSON.parse(localData);
    const updated = list.filter((item) => String(item.id) !== String(id));
    await AsyncStorage.setItem(CAT_STORAGE_KEY, JSON.stringify(updated));
  }
};

/* ===================================================
   4. QUẢN LÝ VÍ & SỐ DƯ (WALLETS)
=================================================== */

export const getWalletBalance = async (): Promise<number> => {
  try {
    const res = await fetch(`${API_BASE_URL}/wallets`);
    if (res.ok) {
      const wallets = await res.json();
      if (wallets.length > 0) {
        return Number(wallets[0].balance);
      }
    }
  } catch (error) {
    console.warn("Không lấy được số dư từ server, tự tính toán:", error);
  }

  const txList = await getTransactions();
  return txList.reduce((total, item) => {
    return item.type === "income" ? total + item.amount : total - item.amount;
  }, 0);
};
