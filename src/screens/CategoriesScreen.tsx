import React from "react";
import { View } from "react-native";
import {
  Button,
  CategoryIcon,
  Empty,
  Enter,
  Header,
  Icon,
  Screen,
  Tap,
  Txt,
  s,
} from "../components/ui";
import { C } from "../constants/colors";
import { CATEGORIES } from "../constants/categories";
import { useLanguage } from "../contexts/languageContext";
export default function CategoriesScreen({
  categories = CATEGORIES,
  onAddCategory,
  onSelectCategory,
  onBack,
}: {
  categories?: typeof CATEGORIES;
  onAddCategory?: () => void;
  onSelectCategory?: (category: any) => void;
  onBack?: () => void;
}) {
  const { t } = useLanguage();
  return (
    <Screen>
      <Header
        title={t("categories.title")}
        subtitle={t("categories.subtitle")}
        back={!!onBack}
        onBack={onBack}
      />
      <Enter>
        <View
          style={[
            s.card,
            {
              backgroundColor: C.green,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 22,
            },
          ]}
        >
          <View style={{ gap: 8 }}>
            <Txt style={{ color: "#C7D9BE", fontSize: 12 }}>
              {t("categories.total_count")}
            </Txt>
            <Txt weight="extra" style={{ color: "#fff", fontSize: 38 }}>
              {categories.length.toString().padStart(2, "0")}
            </Txt>
          </View>
          <Icon name="shapes-outline" size={56} color={C.lime} />
        </View>
      </Enter>

      <Button
        title={t("categories.add_new")}
        icon="add"
        onPress={onAddCategory || (() => {})}
      />

      <View style={{ gap: 10 }}>
        {categories.map((c, index) => (
          <Enter key={c.id} delay={index * 40}>
            <Tap
              onPress={() => onSelectCategory?.(c)}
              style={[s.card, s.row, { padding: 16 }]}
            >
              <CategoryIcon category={c} />
              <View style={{ flex: 1, gap: 5 }}>
                <Txt weight="bold">{c.name}</Txt>
              </View>
              <Icon name="chevron-forward" size={18} color={C.muted} />
            </Tap>
          </Enter>
        ))}
        {!categories.length && (
          <Empty
            title={t("categories.empty_title")}
            body={t("categories.empty_body")}
            action={t("categories.add_new")}
            onPress={onAddCategory}
          />
        )}
      </View>
    </Screen>
  );
}
