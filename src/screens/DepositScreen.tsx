import React, { useState } from "react";
import { View } from "react-native";
import { Button, Field, Header, Screen } from "../components/ui";
import { C } from "../constants/colors";
import { useLanguage } from "../contexts/languageContext";
export default function DepositScreen({
  onBack,
  onSave,
}: {
  onBack?: () => void;
  onSave?: (amount: number) => void;
}) {
  const { t } = useLanguage();
  const [amount, setAmount] = useState("");

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
        title={t("deposit.confirm")}
        icon="checkmark"
        onPress={() => (onSave ? onSave(Number(amount)) : onBack?.())}
      />
    </Screen>
  );
}
