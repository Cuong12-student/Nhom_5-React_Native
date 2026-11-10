import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Header, Screen } from "../components/ui";
import { Ionicons } from "@expo/vector-icons";
import { useLanguage } from "../contexts/languageContext";
import { getCategories, deleteCategory } from "../utils/storage";

const AVAILABLE_ICONS = [
  { id: "fast-food-outline", name: "Ăn uống", color: "#EF4444", bg: "#FEE2E2" },
  { id: "car-outline", name: "Đi lại", color: "#F59E0B", bg: "#FEF3C7" },
  { id: "cart-outline", name: "Mua sắm", color: "#8B5CF6", bg: "#EDE9FE" },
  {
    id: "receipt-outline",
    name: "Hóa đơn & Tiện ích",
    color: "#10B981",
    bg: "#D1FAE5",
  },
  { id: "restaurant-outline", color: "#174B39", bg: "#FEE2E2" },
  { id: "bus-outline", color: "#699F77", bg: "#FEF3C7" },
  { id: "bag-handle-outline", color: "#A5BD8B", bg: "#EDE9FE" },
  { id: "home-outline", color: "#BF9D60", bg: "#E0E7FF" },
  { id: "cafe-outline", color: "#D97706", bg: "#FEF9C3" },
  { id: "medkit-outline", color: "#EF4444", bg: "#FEE2E2" },
  { id: "book-outline", color: "#3B82F6", bg: "#DBEAFE" },
  { id: "game-controller-outline", color: "#10B981", bg: "#D1FAE5" },
  { id: "airplane-outline", color: "#06B6D4", bg: "#CFFAFE" },
  { id: "ellipse-outline", color: "#8F9C92", bg: "#F3F4F6" },
];

export default function CategoriesScreen({
  userId,
  onAddCategory,
  onSelectCategory,
  onBack,
}: {
  userId?: number;
  onAddCategory?: () => void;
  onSelectCategory?: (category: any) => void;
  onBack?: () => void;
}) {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    try {
      const data = await getCategories(userId);
      setCategories(data || []);
    } catch (err) {
      console.warn("Lỗi tải danh mục từ MySQL:", err);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleDelete(cat: any) {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa danh mục "${cat.name}"?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCategory(cat.id, userId);
              setCategories((prev) =>
                prev.filter((item) => item.id !== cat.id),
              );
              Alert.alert("Thành công", "Đã xóa danh mục!");
            } catch (err: any) {
              Alert.alert("Lỗi xóa", err.message || "Không thể xóa danh mục!");
            }
          },
        },
      ],
    );
  }

  const getCatDisplay = (cat: any) => {
    const rawIcon = cat?.icon || "ellipse-outline";
    const matched = AVAILABLE_ICONS.find(
      (i) =>
        i.id === rawIcon ||
        i.id === `${rawIcon}-outline` ||
        rawIcon.includes(i.id),
    );
    const iconName = (matched?.id ||
      (rawIcon.endsWith("-outline") ? rawIcon : `${rawIcon}-outline`)) as any;
    const color = cat?.color || "#174B39";
    return {
      iconName,
      color,

      bg: `${color}18`,
    };
  };

  return (
    <Screen>
      <Header
        title={t("categories.title") || "Danh mục chi tiêu"}
        subtitle={
          t("categories.subtitle") || "Phân loại để quản lý dòng tiền chi tiết"
        }
        back={!!onBack}
        onBack={onBack}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50, paddingHorizontal: 16 }}
      >
        {/* Thẻ xanh tổng số lượng danh mục */}
        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.summaryLabel}>
              {t("categories.total_count") || "Tổng số danh mục"}
            </Text>
            <Text style={styles.summaryNumber}>
              {categories.length.toString().padStart(2, "0")}
            </Text>
          </View>
          <Ionicons name="shapes-outline" size={54} color="#D1FAE5" />
        </View>

        {/* Nút thêm danh mục mới: Điều hướng sang CategoryScreen */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => onAddCategory?.()}
        >
          <Text style={styles.addButtonText}>
            {t("categories.add_new") || "Thêm danh mục mới"}
          </Text>
          <Ionicons name="add" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Danh sách danh mục */}
        <View style={{ gap: 12, marginTop: 12 }}>
          {categories.map((c) => {
            const display = getCatDisplay(c);

            return (
              <View key={String(c.id)} style={styles.catCard}>
                <TouchableOpacity
                  style={styles.catInfoBtn}
                  onPress={() => onSelectCategory?.(c)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[styles.iconCircle, { backgroundColor: display.bg }]}
                  >
                    <Ionicons
                      name={display.iconName}
                      size={22}
                      color={display.color}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.catTitle}>{c.name}</Text>
                  </View>
                </TouchableOpacity>

                {/* Xóa trực tiếp hoặc điều hướng */}
                {c.customer_id ? (
                  <TouchableOpacity
                    onPress={() => handleDelete(c)}
                    style={styles.trashBtn}
                  >
                    <Ionicons name="trash-outline" size={18} color="#DC2626" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => onSelectCategory?.(c)}>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: "#123F30",
    borderRadius: 20,
    padding: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  summaryLabel: {
    color: "#C7D9BE",
    fontSize: 13,
    marginBottom: 6,
  },
  summaryNumber: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "800",
  },
  addButton: {
    backgroundColor: "#123F30",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  catCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  catInfoBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  catTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  trashBtn: {
    padding: 8,
    backgroundColor: "#FEE2E2",
    borderRadius: 10,
  },
});
