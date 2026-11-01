export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
}

// Lưu tạm trong bộ nhớ RAM của ứng dụng
let memoryTransactions: Transaction[] = [
  {
    id: "1",
    title: "Ăn trưa",
    amount: 35000,
    type: "expense",
    category: "Food",
    date: "2026-11-01",
  },
  {
    id: "2",
    title: "Lương",
    amount: 15000000,
    type: "income",
    category: "Salary",
    date: "2026-11-01",
  },
];

export const getTransactions = async (): Promise<Transaction[]> => {
  return [...memoryTransactions];
};

export const addTransaction = async (newTx: Omit<Transaction, "id">) => {
  const itemToAdd: Transaction = {
    ...newTx,
    id: Date.now().toString(),
  };
  memoryTransactions = [itemToAdd, ...memoryTransactions];
  return itemToAdd;
};

export const deleteTransaction = async (id: string) => {
  memoryTransactions = memoryTransactions.filter((item) => item.id !== id);
};
