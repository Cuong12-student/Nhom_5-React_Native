import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Button, Chip, Field, Header, Icon, Screen, Tap, Txt, s } from "./ui";
import { C } from "../constants/colors";
import { CATEGORIES } from "../constants/categories";

export function TransactionForm({
  id,
  initialData,
  onBack,
  onSave,
}: {
  id?: string;
  initialData?: any;
  onBack?: () => void;
  onSave?: (data: any) => void;
}) {
  const [name, setName] = useState(initialData?.title || "");
  const [amount, setAmount] = useState(
    initialData?.amount ? String(initialData.amount) : "",
  );
  const [note, setNote] = useState(initialData?.note || "");
  const [category, setCategory] = useState(
    initialData?.categoryId || CATEGORIES[0].id,
  );
  const [date, setDate] = useState(new Date());
  const [picker, setPicker] = useState<"date" | null>(null);

  function handleSubmit() {
    if (onSave) {
      onSave({ name, amount: Number(amount), category, date, note });
    } else {
      onBack?.();
    }
  }

  return (
    <Screen>
      <Header
        back
        title={id ? "Sửa khoản chi" : "Thêm khoản chi"}
        onBack={onBack}
      />
      <View
        style={{
          backgroundColor: C.pale,
          borderRadius: 24,
          padding: 22,
          gap: 12,
        }}
      >
        <Field
          label="Số tiền (₫)"
          placeholder="0"
          value={amount}
          onChangeText={setAmount}
          keyboardType="number-pad"
          style={{
            fontSize: 30,
            paddingLeft: 0,
            backgroundColor: "transparent",
            borderWidth: 0,
            paddingVertical: 2,
            minHeight: 50,
          }}
        />
      </View>

      <Field
        label="Tên khoản chi"
        placeholder="Ví dụ: Ăn trưa"
        value={name}
        onChangeText={setName}
      />

      <View style={{ gap: 10 }}>
        <Txt weight="semibold" style={{ fontSize: 12 }}>
          Danh mục
        </Txt>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 7 }}
        >
          {CATEGORIES.map((c) => (
            <Chip
              key={c.id}
              title={c.name}
              dot={c.color}
              selected={category === c.id}
              onPress={() => setCategory(c.id)}
            />
          ))}
        </ScrollView>
      </View>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1, gap: 9 }}>
          <Txt weight="semibold" style={{ fontSize: 12 }}>
            Ngày chi
          </Txt>
          <Tap
            onPress={() => setPicker("date")}
            style={[s.input, s.row, { paddingHorizontal: 12, gap: 7 }]}
          >
            <Icon name="calendar-outline" size={17} />
            <Txt style={{ fontSize: 11 }}>
              {date.toLocaleDateString("vi-VN")}
            </Txt>
          </Tap>
        </View>
      </View>

      {picker && (
        <DateTimePicker
          value={date}
          mode="date"
          onChange={(event, val) => {
            setPicker(null);
            if (val) setDate(val);
          }}
        />
      )}

      <Field
        label="Ghi chú"
        placeholder="Không bắt buộc"
        value={note}
        onChangeText={setNote}
        multiline
        style={{ minHeight: 90 }}
      />
      <Button title="Lưu khoản chi" onPress={handleSubmit} icon="checkmark" />
    </Screen>
  );
}
