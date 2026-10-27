export type CategoryItem = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

export const CATEGORIES: CategoryItem[] = [
  { id: "food", name: "Ăn uống", icon: "restaurant-outline", color: "#174B39" },
  { id: "travel", name: "Đi lại", icon: "bus-outline", color: "#699F77" },
  { id: "shopping", name: "Mua sắm", icon: "bag-handle-outline", color: "#A5BD8B" },
  { id: "living", name: "Sinh hoạt", icon: "home-outline", color: "#BF9D60" },
  { id: "other", name: "Khác", icon: "ellipse-outline", color: "#8F9C92" },
];