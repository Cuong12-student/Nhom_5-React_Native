import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { getTransactions, Transaction } from "../utils/storage";
import { useLanguage } from "../contexts/languageContext";

interface HomeScreenProps {
  userName?: string;
  balance?: number;
  initialBudget?: number;
  recentTransactions?: any[];
  onAdd?: () => void;
  onCategories?: () => void;
  onHistory?: () => void;
  onSettings?: () => void;
  onDeposit?: () => void;
}

export default function HomeScreen({
  onAdd,
  onCategories,
  onHistory,
  onSettings,
  onDeposit,
}: HomeScreenProps) {
  const { t } = useLanguage();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await getTransactions();
    setTransactions(data);
  };

  const totalBalance = transactions.reduce((acc, item) => {
    return item.type === "income" ? acc + item.amount : acc - item.amount;
  }, 0);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      {/* Lời chào & Nút cài đặt */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greeting}>{t("home.greeting")} ✨</Text>
          <Text style={styles.subGreeting}>{t("home.subtitle")}</Text>
        </View>
        <TouchableOpacity onPress={onSettings} style={styles.settingsBtn}>
          <Text style={{ fontSize: 18 }}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Thẻ số dư ví */}
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Text style={styles.cardLabel}>💼 {t("home.available_balance")}</Text>
          <TouchableOpacity onPress={onDeposit} style={styles.depositBtn}>
            <Text style={styles.depositText}>+ {t("home.deposit")}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.cardBalance}>
          {totalBalance.toLocaleString("vi-VN")} đ
        </Text>

        <View style={styles.cardBottom}>
          <Text style={styles.cardSub}>• {t("home.wallet_name")}</Text>
          <Text style={styles.brandText}>mint.</Text>
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

      {/* Danh sách giao dịch gần đây */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t("home.recent_title")}</Text>
        <TouchableOpacity onPress={onHistory}>
          <Text style={styles.seeAllText}>{t("home.see_all")}</Text>
        </TouchableOpacity>
      </View>

      {transactions.slice(0, 5).map((item) => (
        <View key={item.id} style={styles.txItem}>
          <Text style={styles.txTitle}>{item.title}</Text>
          <Text
            style={[
              styles.txAmount,
              { color: item.type === "income" ? "#16a34a" : "#dc2626" },
            ]}
          >
            {item.type === "income" ? "+" : "-"}
            {item.amount.toLocaleString("vi-VN")} đ
          </Text>
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
  card: {
    backgroundColor: "#123F30",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#1f2937" },
  seeAllText: { fontSize: 13, color: "#2563eb" },
  txItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  txTitle: { fontSize: 14, fontWeight: "500", color: "#1f2937" },
  txAmount: { fontSize: 14, fontWeight: "700" },
  emptyText: { textAlign: "center", color: "#9ca3af", marginTop: 20 },
});
