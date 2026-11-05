import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Button, Chip, Field, Header, Icon, Screen, Tap, Txt, s } from "./ui";
import { C } from "../constants/colors";
import { CATEGORIES } from "../constants/categories";
import { useLanguage } from "../contexts/languageContext";

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
  const { language, t } = useLanguage();
  const [name, setName] = useState(initialData?.title || "");
  const [amount, setAmount] = useState(
    initialData?.amount ? String(initialData.amount) : "",
  );
  const [note, setNote] = useState(initialData?.note || "");
  const [category, setCategory] = useState(
    initialData?.categoryId || CATEGORIES[0].id,
  );
  const [type, setType] = useState<"expense" | "income">(
    initialData?.type || "expense",
  );
  const [date, setDate] = useState(new Date());
  const [picker, setPicker] = useState<"date" | null>(null);
  const [error, setError] = useState("");

  function handleSubmit() {
    // Validate
    if (!name.trim()) {
      setError("Vui lòng nhập tên khoản chi!");
      return;
    }
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setError("Vui lòng nhập số tiền hợp lệ!");
      return;
    }

    setError("");
    if (onSave) {
      onSave({
        name: name.trim(),
        amount: numAmount,
        category,
        date,
        note,
        type,
      });
    } else {
      onBack?.();
    }
  }

  return (
    <Screen>
      <Header
        back
        title={
          id
            ? t("transaction_form.edit_title")
            : t("transaction_form.add_title")
        }
        onBack={onBack}
      />

      {/* Chọn loại giao dịch: Chi tiêu / Thu nhập */}
      <View style={{ gap: 8 }}>
        <Txt weight="semibold" style={{ fontSize: 12 }}>
          {t("transaction_form.type_label")}
        </Txt>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Tap
            onPress={() => setType("expense")}
            style={{
              flex: 1,
              backgroundColor: type === "expense" ? "#FEE2E2" : "#fff",
              borderWidth: 2,
              borderColor: type === "expense" ? "#DC2626" : C.line,
              borderRadius: 16,
              paddingVertical: 14,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Txt style={{ fontSize: 18 }}>📉</Txt>
            <Txt
              weight={type === "expense" ? "bold" : "regular"}
              style={{
                color: type === "expense" ? "#DC2626" : C.muted,
                fontSize: 14,
              }}
            >
              {t("transaction_form.type_expense")}
            </Txt>
          </Tap>

          <Tap
            onPress={() => setType("income")}
            style={{
              flex: 1,
              backgroundColor: type === "income" ? "#ECFDF5" : "#fff",
              borderWidth: 2,
              borderColor: type === "income" ? "#16A34A" : C.line,
              borderRadius: 16,
              paddingVertical: 14,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Txt style={{ fontSize: 18 }}>📈</Txt>
            <Txt
              weight={type === "income" ? "bold" : "regular"}
              style={{
                color: type === "income" ? "#16A34A" : C.muted,
                fontSize: 14,
              }}
            >
              {t("transaction_form.type_income")}
            </Txt>
          </Tap>
        </View>
      </View>

      {/* Số tiền */}
      <View
        style={{
          backgroundColor: type === "expense" ? "#FEF2F2" : "#ECFDF5",
          borderRadius: 24,
          padding: 22,
          gap: 12,
        }}
      >
        <Field
          label={t("transaction_form.amount_label")}
          placeholder="0"
          value={amount}
          onChangeText={(text) => {
            setAmount(text.replace(/\D/g, ""));
            setError("");
          }}
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
        {amount !== "" && Number(amount) > 0 && (
          <Txt
            style={{
              color: type === "expense" ? "#DC2626" : "#16A34A",
              fontSize: 14,
              fontWeight: "600",
            }}
          >
            {type === "expense" ? "−" : "+"}{" "}
            {Number(amount).toLocaleString("vi-VN")} ₫
          </Txt>
        )}
      </View>

      {/* Tên khoản chi */}
      <Field
        label={t("transaction_form.name_label")}
        placeholder={t("transaction_form.name_placeholder")}
        value={name}
        onChangeText={(text) => {
          setName(text);
          setError("");
        }}
      />

      {/* Danh mục */}
      <View style={{ gap: 10 }}>
        <Txt weight="semibold" style={{ fontSize: 12 }}>
          {t("transaction_form.category_label")}
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

      {/* Ngày */}
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1, gap: 9 }}>
          <Txt weight="semibold" style={{ fontSize: 12 }}>
            {t("transaction_form.date_label")}
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

      {/* Ghi chú */}
      <Field
        label={t("transaction_form.note_label")}
        placeholder="Không bắt buộc"
        value={note}
        onChangeText={setNote}
        multiline
        style={{ minHeight: 90 }}
      />

      {/* Error message */}
      {error !== "" && (
        <View
          style={{
            backgroundColor: "#FEE2E2",
            borderRadius: 12,
            padding: 12,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Icon name="alert-circle-outline" size={18} color={C.red} />
          <Txt style={{ color: C.red, fontSize: 13, flex: 1 }}>{error}</Txt>
        </View>
      )}

      <Button
        title={t("transaction_form.submit")}
        onPress={handleSubmit}
        icon="checkmark"
      />
    </Screen>
  );
}
