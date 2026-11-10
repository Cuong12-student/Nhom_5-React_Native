import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getTransactions,
  Transaction,
  getWalletBalance,
  getRemainingBudget,
  getCategories,
} from "../utils/storage";
import { useLanguage } from "../contexts/languageContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
interface HomeScreenProps {
  userName?: string;
  userId?: number;
  onAdd?: () => void;
  onSelectTransaction?: (tx: any) => void;
  onCategories?: () => void;
  onHistory?: () => void;
  onSettings?: () => void;
  onDeposit?: () => void;
  refreshKey?: number;
}

// Bảng ánh xạ icon thông minh cho các trường hợp tên danh mục hoặc mã viết tắt
const ICON_MAP: Record<string, string> = {
  food: "fast-food-outline",
  "ăn uống": "fast-food-outline",
  transport: "car-outline",
  "đi lại": "car-outline",
  shopping: "cart-outline",
  "mua sắm": "cart-outline",
  bills: "receipt-outline",
  "hóa đơn & tiện ích": "receipt-outline",
  "hóa đơn": "receipt-outline",
  entertainment: "game-controller-outline",
  "giải trí": "game-controller-outline",
  game: "game-controller-outline",
};

export default function HomeScreen({
  userName = "Người dùng",
  userId = 0,
  onAdd,
  onSelectTransaction,
  onCategories,
  onHistory,
  onSettings,
  onDeposit,
  refreshKey = 0,
}: HomeScreenProps) {
  const topInset =
    Platform.OS === "android" ? (StatusBar.currentHeight || 24) + 38 : 56;
  const { t } = useLanguage();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [monthlyExpense, setMonthlyExpense] = useState(0);
  const insets = useSafeAreaInsets();
  const [budgetInfo, setBudgetInfo] = useState({
    limit: 5_000_000,
    spent: 0,
    remaining: 5_000_000,
  });

  const loadData = useCallback(async () => {
    if (!userId) return;

    try {
      // 1. Tải song song danh mục, giao dịch và số dư ví
      const [cats, txs, balance] = await Promise.all([
        getCategories(userId),
        getTransactions(userId),
        getWalletBalance(userId),
      ]);

      setCategories(cats || []);
      setTransactions(txs || []);
      setWalletBalance(balance || 0);

      // 2. Tính toán hạn mức chi tiêu tháng
      const now = new Date();
      const budget = getRemainingBudget(
        userId,
        now.getFullYear(),
        now.getMonth(),
      );
      setBudgetInfo(budget);
      setMonthlyExpense(budget.spent);
    } catch (e) {
      console.warn("Lỗi tải dữ liệu HomeScreen:", e);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshKey]);

  const isOverBudget = budgetInfo.remaining < 0;
  const progressPercent = Math.min(
    (budgetInfo.spent / (budgetInfo.limit || 1)) * 100,
    100,
  );

  // Tìm thông tin danh mục theo ID hoặc Tên, tự động tạo màu nền đồng bộ
  const getCategoryDetails = (catIdentifier?: any) => {
    if (!catIdentifier) {
      return {
        name: "Khác",
        icon: "ellipse-outline",
        color: "#8F9C92",
        bg: "#F3F4F6",
      };
    }

    const found = categories.find(
      (c) =>
        String(c.id) === String(catIdentifier) ||
        String(c.name).trim().toLowerCase() ===
          String(catIdentifier).trim().toLowerCase(),
    );

    if (found) {
      const color = found.color || "#10B981";
      let icon = found.icon || "pricetag-outline";
      if (!icon.endsWith("-outline") && icon !== "ellipse-outline") {
        icon = `${icon}-outline`;
      }

      return {
        name: found.name,
        icon,
        color,
        bg: `${color}18`, // Tạo nền pastel mờ 10% ăn khớp theo màu danh mục
      };
    }

    const fallbackName = String(catIdentifier);
    const mappedIcon =
      ICON_MAP[fallbackName.toLowerCase()] || "pricetag-outline";
    const defaultColor = "#10B981";

    return {
      name: fallbackName,
      icon: mappedIcon,
      color: defaultColor,
      bg: `${defaultColor}18`,
    };
  };

  const userTransactions = transactions
    .filter((t: any) => !userId || Number(t.customer_id) === Number(userId))
    .slice(0, 5);

  return (
    <View style={styles.rootContainer}>
      {/* 1. Thanh chặn cố định bên trên camera (luôn có màu nền kem #F7F7F0) */}
      <View style={{ height: topInset, backgroundColor: "#F7F7F0" }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={[
            styles.headerRow,
            { marginTop: Math.max(insets.top, 16) + 8 },
          ]}
        >
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text numberOfLines={1} style={styles.greeting}>
              {t("home.greeting")}, {userName} ✨
            </Text>
            <Text style={styles.subGreeting}>{t("home.subtitle")}</Text>
          </View>
          <TouchableOpacity onPress={onSettings} style={styles.settingsBtn}>
            <Text style={{ fontSize: 18 }}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Thẻ Ví */}
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <Text style={styles.cardLabel}>
              💼 {t("home.available_balance")}
            </Text>
            <TouchableOpacity onPress={onDeposit} style={styles.depositBtn}>
              <Text style={styles.depositText}>+ {t("home.deposit")}</Text>
            </TouchableOpacity>
          </View>

          <Text
            style={[
              styles.cardBalance,
              walletBalance < 0 && { color: "#FF6B6B" },
            ]}
          >
            {walletBalance.toLocaleString("vi-VN")} đ
          </Text>

          <View style={styles.cardBottom}>
            <Text style={styles.cardSub}>{t("home.wallet_name")}</Text>
            <Text style={styles.brandText}>mint.</Text>
          </View>
        </View>

        {/* Giới hạn chi tiêu */}
        <View style={styles.budgetCard}>
          <View style={styles.budgetHeader}>
            <Text style={styles.budgetTitle}>🎯 {t("home.spend_limit")}</Text>
            <Text
              style={[
                styles.budgetStatus,
                isOverBudget
                  ? { color: "#DC2626", backgroundColor: "#FEE2E2" }
                  : { color: "#16A34A", backgroundColor: "#ECFDF5" },
              ]}
            >
              {isOverBudget ? t("home.over_budget") : t("home.within_budget")}
            </Text>
          </View>

          <View style={styles.progressBg}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progressPercent}%`,
                  backgroundColor: isOverBudget ? "#DC2626" : "#16A34A",
                },
              ]}
            />
          </View>

          <View style={styles.budgetDetails}>
            <View>
              <Text style={styles.budgetLabel}>{t("home.budget_spent")}</Text>
              <Text
                style={[
                  styles.budgetAmount,
                  isOverBudget && { color: "#DC2626" },
                ]}
              >
                {monthlyExpense.toLocaleString("vi-VN")} đ
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.budgetLabel}>{t("home.budget_limit")}</Text>
              <Text style={styles.budgetAmount}>
                {budgetInfo.limit.toLocaleString("vi-VN")} đ
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.remainingBox,
              isOverBudget
                ? { backgroundColor: "#FEE2E2" }
                : { backgroundColor: "#ECFDF5" },
            ]}
          >
            <Text style={styles.remainingLabel}>
              {t("home.budget_remaining")}
            </Text>
            <Text
              style={[
                styles.remainingAmount,
                { color: isOverBudget ? "#DC2626" : "#16A34A" },
              ]}
            >
              {budgetInfo.remaining.toLocaleString("vi-VN")} đ
            </Text>
          </View>
        </View>

        {/* 3 nút thao tác nhanh */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={onAdd}>
            <Text style={styles.actionIcon}>➕</Text>
            <Text style={styles.actionLabel}>{t("home.add_expense")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={onCategories}>
            <Text style={styles.actionIcon}>🗂️</Text>
            <Text style={styles.actionLabel}>{t("home.categories")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={onHistory}>
            <Text style={styles.actionIcon}>🕒</Text>
            <Text style={styles.actionLabel}>{t("home.history")}</Text>
          </TouchableOpacity>
        </View>

        {/* Giao dịch gần đây */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t("home.recent_title")}</Text>
          <TouchableOpacity onPress={onHistory}>
            <Text style={styles.seeAllText}>{t("home.see_all")}</Text>
          </TouchableOpacity>
        </View>

        {userTransactions.length === 0 ? (
          <Text style={styles.emptyText}>{t("home.empty_title")}</Text>
        ) : (
          userTransactions.map((item: any) => {
            const catInfo = getCategoryDetails(
              item.category_id || item.category,
            );

            return (
              <TouchableOpacity
                key={item.id}
                style={styles.txItem}
                activeOpacity={0.7}
                onPress={() => onSelectTransaction?.(item)}
              >
                <View style={styles.txLeft}>
                  <View
                    style={[
                      styles.txIconContainer,
                      { backgroundColor: catInfo.bg },
                    ]}
                  >
                    <Ionicons
                      name={catInfo.icon as any}
                      size={22}
                      color={catInfo.color}
                    />
                  </View>
                  <View style={{ gap: 2 }}>
                    <Text style={styles.txTitle}>{item.title}</Text>
                    <Text style={styles.txCategory}>{catInfo.name}</Text>
                  </View>
                </View>
                <View style={{ alignItems: "flex-end", gap: 2 }}>
                  <Text
                    style={[
                      styles.txAmount,
                      {
                        color: item.type === "income" ? "#16A34A" : "#DC2626",
                      },
                    ]}
                  >
                    {item.type === "income" ? "+" : "-"}
                    {Number(item.amount).toLocaleString("vi-VN")} đ
                  </Text>
                  <Text style={styles.txDate}>
                    {String(item.date).slice(0, 10)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: "#F7F7F0", // Đồng bộ màu nền toàn màn hình
  },
  container: {
    flex: 1,
    backgroundColor: "#F7F7F0",
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 16,
  },
  greeting: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#163A2E",
  },
  subGreeting: {
    fontSize: 13,
    color: "#7D887D",
    marginTop: 2,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#163A2E",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardLabel: {
    color: "#DAE9AE",
    fontSize: 13,
    fontWeight: "600",
  },
  depositBtn: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  depositText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  cardBalance: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardSub: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
  },
  brandText: {
    color: "#DAE9AE",
    fontSize: 14,
    fontWeight: "bold",
  },
  budgetCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  budgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  budgetTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#163A2E",
  },
  budgetStatus: {
    fontSize: 11,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  progressBg: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },
  budgetDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  budgetLabel: {
    fontSize: 11,
    color: "#7D887D",
  },
  budgetAmount: {
    fontSize: 13,
    fontWeight: "600",
    color: "#163A2E",
    marginTop: 2,
  },
  remainingBox: {
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  remainingLabel: {
    fontSize: 11,
    color: "#7D887D",
  },
  remainingAmount: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 2,
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    gap: 6,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#163A2E",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#163A2E",
  },
  seeAllText: {
    fontSize: 13,
    color: "#276249",
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    color: "#7D887D",
    marginVertical: 20,
    fontSize: 13,
  },
  txItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  txLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  txIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  txTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#163A2E",
  },
  txCategory: {
    fontSize: 12,
    color: "#7D887D",
  },
  txAmount: {
    fontSize: 14,
    fontWeight: "bold",
  },
  txDate: {
    fontSize: 11,
    color: "#9CA3AF",
  },
});
