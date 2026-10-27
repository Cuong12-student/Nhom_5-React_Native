import React, { useState } from "react";
import { View } from "react-native";
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

const ICONS = [
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
  onDelete?: (id: string) => void;
}) {
  const [name, setName] = useState(initialData?.name || "");
  const [icon, setIcon] = useState(initialData?.icon || ICONS[0]);
  const [color, setColor] = useState(initialData?.color || COLORS[0]);

  return (
    <Screen>
      <Header
        back
        title={initialData ? "Sửa danh mục" : "Thêm danh mục"}
        onBack={onBack}
      />
      <View style={{ alignItems: "center", paddingVertical: 12 }}>
        <CategoryIcon category={{ name, icon, color }} size={90} />
      </View>

      <Field
        label="Tên danh mục"
        placeholder="Ví dụ: Cà phê, Học tập..."
        value={name}
        onChangeText={setName}
        maxLength={40}
      />

      <View style={{ gap: 14 }}>
        <Txt weight="semibold">Biểu tượng</Txt>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 11 }}>
          {ICONS.map((value) => (
            <Tap
              key={value}
              onPress={() => setIcon(value)}
              style={{
                height: 48,
                width: 48,
                alignItems: "center",
                borderRadius: 16,
                backgroundColor: icon === value ? C.green : "#fff",
              }}
            >
              <Icon name={value} color={icon === value ? "#fff" : C.muted} />
            </Tap>
          ))}
        </View>
      </View>

      <View style={{ gap: 14 }}>
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
                borderRadius: 22,
                backgroundColor: value,
              }}
            >
              {color === value && <Icon name="checkmark" color="#fff" />}
            </Tap>
          ))}
        </View>
      </View>

      <Button
        title="Lưu danh mục"
        onPress={() => (onSave ? onSave({ name, icon, color }) : onBack?.())}
        icon="checkmark"
      />
      {initialData && (
        <Button
          title="Xóa danh mục"
          onPress={() => (onDelete ? onDelete(initialData.id) : onBack?.())}
          icon="trash-outline"
          danger
        />
      )}
    </Screen>
  );
}
