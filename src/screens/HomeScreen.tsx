import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import {
  getTransactions,
  Transaction,
  getWalletBalance,
  getMonthlyExpense,
  getMonthlyIncome,
  getRemainingBudget,
} from "../utils/storage";
import { useLanguage } from "../contexts/languageContext";
import { CATEGORIES } from "../constants/categories";

interface HomeScreenProps {
  userName?: string;
  userId?: number;
  onAdd?: () => void;
  onCategories?: () => void;
  onHistory?: () => void;
  onSettings?: () => void;
  onDeposit?: () => void;
  refreshKey?: number; // Dùng để trigger refresh khi dữ liệu thay đổi
}

export default function HomeScreen({
  userName = "Người dùng",
  userId = 0,
  onAdd,
  onCategories,
  onHistory,
  onSettings,
  onDeposit,
  refreshKey = 0,
}: HomeScreenProps) {
  const { t } = useLanguage();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [monthlyExpense, setMonthlyExpense] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [budgetInfo, setBudgetInfo] = useState({
    limit: 5_000_000,
    spent: 0,
    remaining: 5_000_000,
  });

  const loadData = useCallback(async () => {
    const data = await getTransactions();
    setTransactions(data);

    if (userId) {
      const balance = await getWalletBalance(userId);
      setWalletBalance(balance);
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    setMonthlyExpense(getMonthlyExpense(year, month));
    setMonthlyIncome(getMonthlyIncome(year, month));

    if (userId) {
      setBudgetInfo(getRemainingBudget(userId, year, month));
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshKey]);

  const now = new Date();
  const currentMonthLabel = `Tháng ${now.getMonth() + 1}/${now.getFullYear()}`;
  const isOverBudget = budgetInfo.remaining < 0;
  const progressPercent = Math.min(
    (budgetInfo.spent / budgetInfo.limit) * 100,
    100,
  );

  // Lấy category name
  const getCategoryName = (catId?: string) => {
    if (!catId) return "Khác";
    const cat = CATEGORIES.find((c) => c.id === catId);
    return cat?.name || "Khác";
  };

  const getCategoryIcon = (catId?: string) => {
    if (!catId) return "📦";
    const icons: Record<string, string> = {
      food: "🍔",
      travel: "🚗",
      shopping: "🛍️",
      living: "🏠",
      other: "📦",
    };
    return icons[catId] || "📦";
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      {/* Header: Lời chào & Cài đặt */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greeting}>
            {t("home.greeting")}, {userName} ✨
          </Text>
          <Text style={styles.subGreeting}>{t("home.subtitle")}</Text>
        </View>
        <TouchableOpacity onPress={onSettings} style={styles.settingsBtn}>
          <Text style={{ fontSize: 18 }}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* ─── Thẻ Ví ─── */}
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Text style={styles.cardLabel}>💼 {t("home.available_balance")}</Text>
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
          <Text style={styles.cardSub}>• {t("home.wallet_name")}</Text>
          <Text style={styles.brandText}>mint.</Text>
        </View>
      </View>

      {/* ─── Thống kê Thu Chi tháng ─── */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: "#ECFDF5" }]}>
          <Text style={styles.statLabel}>📈 {t("home.monthly_income")}</Text>
          <Text style={[styles.statValue, { color: "#16A34A" }]}>
            +{monthlyIncome.toLocaleString("vi-VN")} đ
          </Text>
          <Text style={styles.statMonth}>{currentMonthLabel}</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: "#FEF2F2" }]}>
          <Text style={styles.statLabel}>📉 {t("home.monthly_expense")}</Text>
          <Text style={[styles.statValue, { color: "#DC2626" }]}>
            -{monthlyExpense.toLocaleString("vi-VN")} đ
          </Text>
          <Text style={styles.statMonth}>{currentMonthLabel}</Text>
        </View>
      </View>

      {/* ─── Giới hạn chi tiêu ─── */}
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

        {/* Progress bar */}
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
          <Text style={styles.remainingLabel}>{t("home.budget_remaining")}</Text>
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

      {/* ─── 3 nút thao tác nhanh ─── */}
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

      {/* ─── Giao dịch gần đây ─── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t("home.recent_title")}</Text>
        <TouchableOpacity onPress={onHistory}>
          <Text style={styles.seeAllText}>{t("home.see_all")}</Text>
        </TouchableOpacity>
      </View>

      {transactions.slice(0, 5).map((item) => (
        <View key={item.id} style={styles.txItem}>
          <View style={styles.txLeft}>
            <Text style={styles.txCatIcon}>
              {getCategoryIcon(item.category)}
            </Text>
            <View>
              <Text style={styles.txTitle}>{item.title}</Text>
              <Text style={styles.txCategory}>
                {getCategoryName(item.category)}
              </Text>
            </View>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text
              style={[
                styles.txAmount,
                { color: item.type === "income" ? "#16a34a" : "#dc2626" },
              ]}
            >
              {item.type === "income" ? "+" : "-"}
              {item.amount.toLocaleString("vi-VN")} đ
            </Text>
            <Text style={styles.txDate}>{item.date}</Text>
          </View>
        </View>
      ))}

      {transactions.length === 0 && (
        <Text style={styles.emptyText}>{t("home.empty_title")}</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F0",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: { fontSize: 20, fontWeight: "700", color: "#111827" },
  subGreeting: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  settingsBtn: {
    padding: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 20,
  },

  // ── Card Ví ──
  card: {
    backgroundColor: "#123F30",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardLabel: { color: "#D1FAE5", fontSize: 13 },
  depositBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  depositText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  cardBalance: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "800",
    marginVertical: 18,
  },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardSub: { color: "#A7F3D0", fontSize: 12 },
  brandText: { color: "#A7F3D0", fontSize: 14, fontWeight: "700" },

  // ── Stats Row ──
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "800",
  },
  statMonth: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 4,
  },

  // ── Budget Card ──
  budgetCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  budgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  budgetTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
  },
  budgetStatus: {
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: "hidden",
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
    marginBottom: 12,
  },
  budgetLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    marginBottom: 2,
  },
  budgetAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
  },
  remainingBox: {
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  remainingLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  remainingAmount: {
    fontSize: 16,
    fontWeight: "800",
  },

  // ── Quick Actions ──
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
  },
  actionBtn: { alignItems: "center" },
  actionIcon: {
    fontSize: 22,
    backgroundColor: "#E5E7EB",
    padding: 14,
    borderRadius: 16,
    overflow: "hidden",
  },
  actionLabel: {
    fontSize: 12,
    color: "#374151",
    marginTop: 6,
    fontWeight: "500",
  },

  // ── Section ──
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#1f2937" },
  seeAllText: { fontSize: 13, color: "#2563eb" },

  // ── Transaction Item ──
  txItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  txLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  txCatIcon: {
    fontSize: 22,
    width: 40,
    height: 40,
    textAlign: "center",
    lineHeight: 40,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    overflow: "hidden",
  },
  txTitle: { fontSize: 14, fontWeight: "600", color: "#1f2937" },
  txCategory: { fontSize: 11, color: "#9CA3AF", marginTop: 2 },
  txAmount: { fontSize: 14, fontWeight: "700" },
  txDate: { fontSize: 11, color: "#9CA3AF", marginTop: 2 },
  emptyText: { textAlign: "center", color: "#9ca3af", marginTop: 20 },
});
