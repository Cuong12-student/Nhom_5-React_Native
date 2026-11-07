import React, { useState } from "react";
import { View, Alert } from "react-native";
import { Button, Field, Header, Screen, Txt, s } from "../components/ui";
import { C } from "../constants/colors";
import { useLanguage } from "../contexts/languageContext";

export default function DepositScreen({
  onBack,
  onSave,
}: {
  onBack?: () => void;
  onSave?: (amount: number) => Promise<any> | void;
}) {
  const { t } = useLanguage();
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const quickAmounts = [
    100_000, 200_000, 500_000, 1_000_000, 2_000_000, 5_000_000,
  ];

  async function handleDeposit() {
    const numAmount = Number(amount.replace(/\D/g, ""));
    if (!numAmount || numAmount <= 0) {
      setError("Vui lòng nhập số tiền hợp lệ!");
      return;
    }
    setError("");
    if (onSave) {
      try {
        setLoading(true);
        // Gọi hàm từ App.tsx và chờ lưu DB + cập nhật xong
        await onSave(numAmount);
      } catch (err: any) {
        Alert.alert("Lỗi", err.message || "Không thể thực hiện nạp tiền!");
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <Screen>
      <Header
        back
        title={t("deposit.title")}
        subtitle={t("deposit.subtitle")}
        onBack={onBack}
      />

      <View
        style={{
          backgroundColor: C.pale,
          borderRadius: 24,
          padding: 22,
          gap: 12,
          marginTop: 10,
        }}
      >
        <Field
          label={t("deposit.amount_label")}
          placeholder="0"
          value={amount}
          onChangeText={(text) => {
            setAmount(text.replace(/\D/g, ""));
            setError("");
          }}
          keyboardType="number-pad"
          style={{
            fontSize: 32,
            paddingLeft: 0,
            backgroundColor: "transparent",
            borderWidth: 0,
            paddingVertical: 2,
            minHeight: 50,
          }}
          error={error}
        />

        {/* Hiển thị số tiền đã format */}
        {amount !== "" && Number(amount) > 0 && (
          <Txt style={{ color: C.green2, fontSize: 14, fontWeight: "600" }}>
            = {Number(amount).toLocaleString("vi-VN")} ₫
          </Txt>
        )}
      </View>

      {/* Nạp nhanh */}
      <View style={{ gap: 10 }}>
        <Txt weight="semibold" style={{ fontSize: 12 }}>
          {t("deposit.quick_amount")}
        </Txt>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {quickAmounts.map((qa) => (
            <View
              key={qa}
              style={{
                borderWidth: 1,
                borderColor: amount === String(qa) ? C.green : C.line,
                backgroundColor: amount === String(qa) ? C.green : "#fff",
                borderRadius: 14,
                paddingHorizontal: 14,
                paddingVertical: 10,
              }}
            >
              <Txt
                weight="semibold"
                onPress={() => setAmount(String(qa))}
                style={{
                  fontSize: 13,
                  color: amount === String(qa) ? "#fff" : C.ink,
                }}
              >
                {qa.toLocaleString("vi-VN")} ₫
              </Txt>
            </View>
          ))}
        </View>
      </View>

      {/* Phương thức nạp */}
      <View style={{ gap: 10 }}>
        <Txt weight="semibold" style={{ fontSize: 12 }}>
          {t("deposit.method")}
        </Txt>
        {[
          {
            icon: "🏦",
            name: t("deposit.bank_transfer"),
            desc: "Chuyển khoản ngân hàng",
          },
          { icon: "💳", name: t("deposit.card"), desc: "Visa / Mastercard" },
          {
            icon: "📱",
            name: t("deposit.e_wallet"),
            desc: "MoMo, ZaloPay, VNPay",
          },
        ].map((method, idx) => (
          <View
            key={idx}
            style={[
              s.card,
              s.row,
              {
                paddingVertical: 14,
                paddingHorizontal: 16,
                gap: 12,
                borderWidth: idx === 0 ? 2 : 1,
                borderColor: idx === 0 ? C.green : C.line,
              },
            ]}
          >
            <Txt style={{ fontSize: 24 }}>{method.icon}</Txt>
            <View style={{ flex: 1 }}>
              <Txt weight="bold" style={{ fontSize: 13 }}>
                {method.name}
              </Txt>
              <Txt style={{ fontSize: 11, color: C.muted }}>{method.desc}</Txt>
            </View>
            {idx === 0 && (
              <View
                style={{
                  backgroundColor: "#ECFDF5",
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 6,
                }}
              >
                <Txt
                  style={{ fontSize: 10, color: "#16A34A", fontWeight: "700" }}
                >
                  Mặc định
                </Txt>
              </View>
            )}
          </View>
        ))}
      </View>

      <Button
        title={loading ? "Đang xử lý..." : t("deposit.confirm")}
        icon={loading ? undefined : "checkmark"}
        disabled={loading}
        onPress={handleDeposit}
      />
    </Screen>
  );
}
