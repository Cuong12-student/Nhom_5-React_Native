import React from "react";
import { View } from "react-native";
import { Button, CategoryIcon, Header, Screen, Txt, s } from "../components/ui";
import { C } from "../constants/colors";
import { CATEGORIES } from "../constants/categories";

export default function TransactionsDetailsScreen({
  transaction,
  onBack,
  onEdit,
  onDelete,
}: {
  transaction?: any;
  onBack?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const item = transaction || {
    id: "tx-1",
    title: "Cà phê sáng",
    amount: 45000,
    category: CATEGORIES[0],
    date: "26/10/2026",
    note: "Gặp bạn bè cuối tuần",
  };

  return (
    <Screen>
      <Header title="Chi tiết khoản chi" back onBack={onBack} />
      <View
        style={[s.card, { alignItems: "center", paddingVertical: 28, gap: 12 }]}
      >
        <CategoryIcon category={item.category} size={70} />
        <Txt
          weight="extra"
          style={{ fontSize: 32, letterSpacing: -1, color: C.ink }}
        >
          −{Number(item.amount).toLocaleString()} ₫
        </Txt>
        <Txt weight="bold" style={{ fontSize: 16 }}>
          {item.title}
        </Txt>
        <Txt style={{ color: C.muted, fontSize: 12 }}>
          {item.category?.name || "Khác"}
        </Txt>
      </View>

      <View style={[s.card, { gap: 14 }]}>
        <View style={[s.row, { justifyContent: "space-between" }]}>
          <Txt style={{ color: C.muted, fontSize: 12 }}>Ngày chi tiêu</Txt>
          <Txt weight="semibold" style={{ fontSize: 12 }}>
            {item.date}
          </Txt>
        </View>

        {item.note ? (
          <View style={{ gap: 6 }}>
            <Txt style={{ color: C.muted, fontSize: 12 }}>Ghi chú</Txt>
            <Txt style={{ fontSize: 13, lineHeight: 20 }}>{item.note}</Txt>
          </View>
        ) : null}
      </View>

      <View style={{ gap: 12, marginTop: 10 }}>
        <Button
          title="Chỉnh sửa khoản chi"
          icon="create-outline"
          light
          onPress={onEdit || (() => {})}
        />
        <Button
          title="Xóa khoản chi"
          icon="trash-outline"
          danger
          onPress={() => (onDelete ? onDelete() : onBack?.())}
        />
      </View>
    </Screen>
  );
}
