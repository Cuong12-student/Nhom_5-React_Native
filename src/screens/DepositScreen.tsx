import React, { useState } from "react";
import { View } from "react-native";
import { Button, Field, Header, Screen } from "../components/ui";
import { C } from "../constants/colors";

export default function DepositScreen({
  onBack,
  onSave,
}: {
  onBack?: () => void;
  onSave?: (amount: number) => void;
}) {
  const [amount, setAmount] = useState("");

  return (
    <Screen>
      <Header
        back
        title="Nạp tiền vào ví"
        subtitle="Điều chỉnh ngân sách chi tiêu khả dụng"
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
          label="Số tiền muốn nạp (₫)"
          placeholder="0"
          value={amount}
          onChangeText={setAmount}
          keyboardType="number-pad"
          style={{
            fontSize: 32,
            paddingLeft: 0,
            backgroundColor: "transparent",
            borderWidth: 0,
            paddingVertical: 2,
            minHeight: 50,
          }}
        />
      </View>

      <Button
        title="Xác nhận nạp"
        icon="checkmark"
        onPress={() => (onSave ? onSave(Number(amount)) : onBack?.())}
      />
    </Screen>
  );
}
