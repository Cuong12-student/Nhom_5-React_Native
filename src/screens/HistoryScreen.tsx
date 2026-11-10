import React, { useState, useEffect, useCallback } from "react";
import { ScrollView, View } from "react-native";
import {
  Chip,
  Empty,
  Field,
  Header,
  Icon,
  Screen,
  Tap,
  TransactionRow,
  Txt,
  s,
} from "../components/ui";
import { C } from "../constants/colors";
import { useLanguage } from "../contexts/languageContext";
import { getTransactions, getCategories } from "../utils/storage";

export default function HistoryScreen({
  userId,
  refreshKey = 0,
  onAddTransaction,
  onSelectTransaction,
  onBack,
}: {
  userId?: number;
  refreshKey?: number;
  onAddTransaction?: () => void;
  onSelectTransaction?: (tx: any) => void;
  onBack?: () => void;
}) {
  const { t } = useLanguage();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Tải trực tiếp dữ liệu từ MySQL theo userId
  const loadData = useCallback(async () => {
    if (!userId) return;
    try {
      const [txList, catList] = await Promise.all([
        getTransactions(userId),
        getCategories(userId),
      ]);
      setTransactions(txList || []);
      setCategories(catList || []);
    } catch (err) {
      console.warn("Lỗi tải lịch sử giao dịch:", err);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshKey]);

  // Bộ lọc tìm kiếm và danh mục (hỗ trợ cả category_id, category, id dạng số/chuỗi)
  const filtered = transactions.filter((tx) => {
    const title = tx.title || tx.name || "";
    const matchName = title.toLowerCase().includes(query.trim().toLowerCase());

    const itemCatId = String(tx.category_id || tx.category || "");
    const matchCategory =
      selectedCategory === "all" || itemCatId === String(selectedCategory);

    return matchName && matchCategory;
  });

  return (
    <Screen>
      <Header
        title={t("history.title") || "Lịch sử chi tiêu"}
        back={!!onBack}
        onBack={onBack}
        right={
          <Tap
            onPress={onAddTransaction}
            style={{
              backgroundColor: C.green,
              width: 44,
              height: 44,
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="add" color="#fff" />
          </Tap>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40, gap: 14 }}
      >
        {/* Tìm kiếm */}
        <Field
          label={t("history.search_placeholder") || "Tìm kiếm"}
          placeholder="Nhập tên khoản chi..."
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
        />

        {/* Thanh cuộn danh mục động từ MySQL */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          <Chip
            title={t("history.all") || "Tất cả"}
            selected={selectedCategory === "all"}
            onPress={() => setSelectedCategory("all")}
          />
          {categories.map((c) => {
            const catIdStr = String(c.id);
            return (
              <Chip
                key={catIdStr}
                title={c.name}
                dot={c.color || C.green}
                selected={selectedCategory === catIdStr}
                onPress={() => setSelectedCategory(catIdStr)}
              />
            );
          })}
        </ScrollView>

        {/* Số kết quả */}
        <View style={[s.row, { justifyContent: "space-between" }]}>
          <Txt style={{ fontSize: 12, color: C.muted }}>
            {filtered.length} {t("history.results") || "kết quả"}
          </Txt>
        </View>

        {/* Danh sách giao dịch */}
        <View style={{ gap: 10 }}>
          {filtered.map((tx) => (
            <TransactionRow
              key={String(tx.id)}
              tx={tx}
              onPress={() => onSelectTransaction?.(tx)}
            />
          ))}

          {filtered.length === 0 && (
            <Empty
              title={t("history.empty_title") || "Không tìm thấy chi tiêu"}
              body={
                t("history.empty_body") ||
                "Thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn danh mục lọc."
              }
              action={t("history.add_new") || "Thêm chi tiêu mới"}
              onPress={onAddTransaction}
            />
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}
