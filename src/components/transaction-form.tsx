import React, { useState, useEffect } from "react";
import { Alert, ScrollView, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Button, Chip, Field, Header, Icon, Screen, Tap, Txt, s } from "./ui";
import { C } from "../constants/colors";
import { useLanguage } from "../contexts/languageContext";
import {
  getCategories,
  updateTransaction,
  deleteTransaction,
} from "../utils/storage";

export function TransactionForm({
  userId,
  initialData,
  onBack,
  onSave,
}: {
  userId?: number;
  initialData?: any;
  onBack?: () => void;
  onSave?: (data: any) => void;
}) {
  const { t } = useLanguage();
  const [name, setName] = useState(
    initialData?.title || initialData?.name || "",
  );
  const [amount, setAmount] = useState(
    initialData?.amount ? String(initialData.amount) : "",
  );
  const [note, setNote] = useState(initialData?.note || "");
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | number>(
    initialData?.category_id || initialData?.category || "",
  );
  const type = "expense";
  const [date, setDate] = useState(
    initialData?.date ? new Date(initialData.date) : new Date(),
  );
  const [picker, setPicker] = useState<"date" | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.title || initialData.name || "");
      setAmount(initialData.amount ? String(initialData.amount) : "");
      setNote(initialData.note || "");
      setSelectedCategory(
        initialData.category_id || initialData.category || "",
      );
      setDate(initialData.date ? new Date(initialData.date) : new Date());
    } else {
      setName("");
      setAmount("");
      setNote("");
      setDate(new Date());
    }
  }, [initialData]);

  // Tải danh mục động theo userId từ MySQL qua API
  useEffect(() => {
    async function loadFormCategories() {
      try {
        const list = await getCategories(userId);
        if (list && list.length > 0) {
          setCategories(list);
          setSelectedCategory((prev) => {
            if (prev) return prev;
            return list[0].id || list[0].name;
          });
        }
      } catch (err) {
        console.warn("Lỗi tải danh mục cho form:", err);
      }
    }
    loadFormCategories();
  }, [userId]);

  function handleSubmit() {
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
        id: initialData?.id,
        name: name.trim(),
        title: name.trim(),
        amount: numAmount,
        category: selectedCategory,
        category_id: selectedCategory,
        date,
        note,
        type: "expense",
      });
    } else {
      onBack?.();
    }
  }

  const handleDelete = () => {
    if (!initialData?.id) return;

    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa khoản chi này không?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await deleteTransaction(initialData.id, userId);
              if (res) {
                onBack?.();
              } else {
                Alert.alert("Lỗi", "Không thể xóa khoản chi này");
              }
            } catch (e: any) {
              Alert.alert("Lỗi", e?.message || "Lỗi kết nối máy chủ");
            }
          },
        },
      ],
    );
  };

  return (
    <Screen>
      <Header
        back
        title={
          initialData?.id
            ? t("transaction_form.edit_title") || "Sửa giao dịch"
            : t("transaction_form.add_title") || "Thêm giao dịch"
        }
        onBack={onBack}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 16, paddingBottom: 40 }}
      >
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

        {/* Danh mục động */}
        <View style={{ gap: 10 }}>
          <Txt weight="semibold" style={{ fontSize: 12 }}>
            {t("transaction_form.category_label")}
          </Txt>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 7 }}
          >
            {categories.map((c) => {
              const catIdentifier = c.id || c.name;
              const isSelected =
                String(selectedCategory) === String(catIdentifier);
              return (
                <Chip
                  key={String(catIdentifier)}
                  title={c.name}
                  dot={c.color || C.green}
                  selected={isSelected}
                  onPress={() => setSelectedCategory(catIdentifier)}
                />
              );
            })}
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

        {/* Báo lỗi nếu có */}
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

        {/* Nút Lưu khoản chi */}
        <Button
          title={
            initialData?.id
              ? t("transaction_form.save_changes") || "Lưu thay đổi"
              : t("transaction_form.submit") || "Lưu khoản chi"
          }
          onPress={handleSubmit}
          icon="checkmark"
        />

        {/* Nút Xóa khoản chi (Chỉ hiện khi sửa) */}
        {Boolean(initialData?.id) && (
          <Button
            title="Xóa khoản chi"
            icon="trash-outline"
            danger
            onPress={handleDelete}
          />
        )}
      </ScrollView>
    </Screen>
  );
}
