import React, { useState } from "react";
import { View, Alert, ScrollView } from "react-native";
import {
  Button,
  CategoryIcon,
  Field,
  Header,
  Icon,
  Screen,
  Tap,
  Txt,
  s,
} from "../components/ui";
import { C } from "../constants/colors";
import { useLanguage } from "../contexts/languageContext";

const ICONS = [
  "fast-food-outline",
  "car-outline",
  "cart-outline",
  "receipt-outline",
  "restaurant-outline",
  "bus-outline",
  "bag-handle-outline",
  "home-outline",
  "cafe-outline",
  "heart-outline",
  "book-outline",
  "gift-outline",
  "briefcase-outline",
  "ellipse-outline",
];

const COLORS = [
  "#174B39",
  "#699F77",
  "#A5BD8B",
  "#BF9D60",
  "#8F9C92",
  "#AC7C6B",
];

export default function CategoryScreen({
  initialData,
  onBack,
  onSave,
  onDelete,
}: {
  initialData?: any;
  onBack?: () => void;
  onSave?: (data: any) => void;
  onDelete?: (id: string | number) => void;
}) {
  const { t } = useLanguage();
  const [name, setName] = useState(initialData?.name || "");
  const [icon, setIcon] = useState(initialData?.icon || ICONS[0]);
  const [color, setColor] = useState(initialData?.color || COLORS[0]);

  function handleSave() {
    if (!name.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên danh mục!");
      return;
    }

    if (onSave) {
      onSave({
        id: initialData?.id, // Giữ nguyên ID khi sửa
        name: name.trim(),
        icon,
        color,
        customer_id: initialData?.customer_id,
      });
    } else {
      onBack?.();
    }
  }

  function handleDelete() {
    if (!initialData?.id) return;

    Alert.alert("Xác nhận xóa", `Bạn có chắc muốn xóa danh mục "${name}"?`, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () => {
          onDelete?.(initialData.id);
        },
      },
    ]);
  }

  return (
    <Screen>
      <Header
        back
        title={
          initialData
            ? t("category_form.edit_title") || "Sửa danh mục"
            : t("category_form.add_title") || "Thêm danh mục"
        }
        onBack={onBack}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 20, paddingBottom: 40 }}
      >
        {/* Preview icon lớn */}
        <View style={{ alignItems: "center", paddingVertical: 12 }}>
          <CategoryIcon category={{ name, icon, color }} size={90} />
        </View>

        {/* Nhập tên */}
        <Field
          label={t("category_form.name_label") || "Tên danh mục"}
          placeholder={
            t("category_form.name_placeholder") || "Nhập tên danh mục..."
          }
          value={name}
          onChangeText={setName}
          maxLength={40}
        />

        {/* Chọn Icon */}
        <View style={{ gap: 12 }}>
          <Txt weight="semibold">
            {t("category_form.icon_label") || "Biểu tượng"}
          </Txt>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 11 }}>
            {ICONS.map((value) => (
              <Tap
                key={value}
                onPress={() => setIcon(value)}
                style={{
                  height: 48,
                  width: 48,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 16,
                  backgroundColor: icon === value ? C.green : "#fff",
                }}
              >
                <Icon name={value} color={icon === value ? "#fff" : C.muted} />
              </Tap>
            ))}
          </View>
        </View>

        {/* Chọn Màu sắc (Đã sửa lỗi text code thô) */}
        <View style={{ gap: 12 }}>
          <Txt weight="semibold">Màu sắc</Txt>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 11 }}>
            {COLORS.map((value) => (
              <Tap
                key={value}
                onPress={() => setColor(value)}
                style={{
                  height: 44,
                  width: 44,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 22,
                  backgroundColor: value,
                }}
              >
                {color === value && <Icon name="checkmark" color="#fff" />}
              </Tap>
            ))}
          </View>
        </View>

        {/* Các nút bấm hành động */}
        <View style={{ gap: 12, marginTop: 10 }}>
          <Button
            title={t("category_form.save") || "Lưu danh mục"}
            onPress={handleSave}
            icon="checkmark"
          />

          {initialData && (
            <Button
              title={t("category_form.delete") || "Xóa danh mục"}
              onPress={handleDelete}
              icon="trash-outline"
              danger
            />
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}
