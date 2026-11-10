export type CategoryItem = {
  id: string | number;
  name: string;
  icon: string;
  color: string;
  customer_id?: number | null;
};

export const CATEGORIES: CategoryItem[] = [
  { id: "food", name: "Ăn uống", icon: "restaurant-outline", color: "#10B981" },
  { id: "travel", name: "Đi lại", icon: "bus-outline", color: "#F59E0B" },
  {
    id: "shopping",
    name: "Mua sắm",
    icon: "bag-handle-outline",
    color: "#8B5CF6",
  },
  { id: "living", name: "Sinh hoạt", icon: "home-outline", color: "#BF9D60" },
  { id: "other", name: "Khác", icon: "ellipse-outline", color: "#8F9C92" },
];
