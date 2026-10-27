import React, { useState } from "react";
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
import { CATEGORIES } from "../constants/categories";
import { useLanguage } from "../contexts/languageContext";
export default function HistoryScreen({
  transactions = [],
  categories = CATEGORIES,
  onAddTransaction,
  onSelectTransaction,
  onBack,
}: {
  transactions?: any[];
  categories?: any[];
  onAddTransaction?: () => void;
  onSelectTransaction?: (tx: any) => void;
  onBack?: () => void;
}) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { t } = useLanguage();
  const filtered = transactions.filter((tx) => {
    const title = tx.title || tx.name || "";
    const matchName = title.toLowerCase().includes(query.toLowerCase());
    const matchCategory =
      selectedCategory === "all" || tx.categoryId === selectedCategory;
    return matchName && matchCategory;
  });

  return (
    <Screen>
      <Header
        title={t("history.title")}
        right={
          <Tap
            onPress={onAddTransaction}
            style={{
              backgroundColor: C.green,
              width: 44,
              borderRadius: 16,
              alignItems: "center",
            }}
          >
            <Icon name="add" color="#fff" />
          </Tap>
        }
      />
      <Field
        label={t("history.search_placeholder")}
        placeholder="Nhập tên khoản chi..."
        value={query}
        onChangeText={setQuery}
        autoCorrect={false}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 7 }}
      >
        <Chip
          title={t("history.all")}
          selected={selectedCategory === "all"}
          onPress={() => setSelectedCategory("all")}
        />
        {categories.map((c) => (
          <Chip
            key={c.id}
            title={c.name}
            dot={c.color}
            selected={selectedCategory === c.id}
            onPress={() => setSelectedCategory(c.id)}
          />
        ))}
      </ScrollView>

      <View style={[s.row, { justifyContent: "space-between" }]}>
        <Txt style={{ fontSize: 11, color: C.muted }}>
          {filtered.length} {t("history.results")}
        </Txt>
      </View>

      <View style={{ marginTop: 5 }}>
        {filtered.map((tx) => (
          <TransactionRow key={tx.id} tx={tx} />
        ))}
        {!filtered.length && (
          <Empty
            title={t("history.empty_title")}
            body={t("history.empty_body")}
            action={t("history.add_new")}
            onPress={onAddTransaction}
          />
        )}
      </View>
    </Screen>
  );
}
