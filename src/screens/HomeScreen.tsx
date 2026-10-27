import React, { useState } from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Empty,
  Enter,
  Icon,
  Screen,
  Section,
  Tap,
  TransactionRow,
  Txt,
  s,
} from "../components/ui";
import { C } from "../constants/colors";
import { useLanguage } from "../contexts/languageContext";

export default function HomeScreen({
  userName = "Khiêm",
  balance = 0,
  initialBudget = 0,
  recentTransactions = [],
  onAdd,
  onCategories,
  onHistory,
  onSettings,
  onDeposit,
}: {
  userName?: string;
  balance?: number;
  initialBudget?: number;
  recentTransactions?: any[];
  onAdd?: () => void;
  onCategories?: () => void;
  onHistory?: () => void;
  onSettings?: () => void;
  onDeposit?: () => void;
}) {
  const [visible, setVisible] = useState(true);
  const { t } = useLanguage();

  return (
    <Screen>
      <View style={[s.row, { justifyContent: "space-between", gap: 8 }]}>
        <View style={{ flex: 1 }}>
          <Txt style={{ color: C.muted, fontSize: 11, letterSpacing: 2 }}>
            {t("home.brand")}
          </Txt>
          <Txt
            weight="extra"
            style={{ fontSize: 23, letterSpacing: -0.8, marginTop: 7 }}
          >
            {t("home.greeting")}, {userName}{" "}
            <Txt style={{ color: C.gold }}>✦</Txt>
          </Txt>
          <Txt style={{ color: C.muted, fontSize: 11, marginTop: 5 }}>
            {t("home.subtitle")}
          </Txt>
        </View>
        <Tap
          onPress={onSettings}
          style={{
            width: 43,
            height: 43,
            borderRadius: 22,
            backgroundColor: "#E6EBDA",
            alignItems: "center",
          }}
        >
          <Txt weight="bold">K</Txt>
          <View
            style={{
              position: "absolute",
              right: -1,
              bottom: 0,
              borderWidth: 2,
              borderColor: C.bg,
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: C.green2,
            }}
          />
        </Tap>
      </View>

      <Enter>
        <LinearGradient
          colors={["#1C513C", "#0C3426"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 26,
            padding: 18,
            minHeight: 158,
            overflow: "hidden",
          }}
        >
          <View style={[s.row, { justifyContent: "space-between" }]}>
            <View style={[s.row, { gap: 7 }]}>
              <Icon name="wallet-outline" size={16} color={C.lime} />
              <Txt style={{ color: "#D0DFCA", fontSize: 12 }}>
                {t("home.available_balance")}
              </Txt>
            </View>

            <View style={[s.row, { gap: 10 }]}>
              <Tap
                onPress={onDeposit}
                style={{
                  backgroundColor: "rgba(218, 233, 174, 0.2)",
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Icon name="add-circle-outline" size={15} color={C.lime} />
                <Txt weight="bold" style={{ color: C.lime, fontSize: 11 }}>
                  {t("home.deposit")}
                </Txt>
              </Tap>

              <Tap
                onPress={() => setVisible(!visible)}
                style={{ minHeight: 26, minWidth: 26, alignItems: "center" }}
              >
                <Icon
                  name={visible ? "eye-outline" : "eye-off-outline"}
                  color="#DAE9CC"
                  size={18}
                />
              </Tap>
            </View>
          </View>

          <View style={{ marginTop: 12, marginBottom: 10 }}>
            <Txt
              weight="extra"
              adjustsFontSizeToFit
              numberOfLines={1}
              style={{ color: "#fff", fontSize: 34, letterSpacing: -1.3 }}
            >
              {visible
                ? balance > 0
                  ? `${balance.toLocaleString()} ₫`
                  : "--- ₫"
                : "••••••••"}
            </Txt>
          </View>

          <View style={[s.row, { justifyContent: "space-between" }]}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
            >
              <View
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: C.lime,
                }}
              />
              <Txt style={{ color: "#B8D0B6", fontSize: 11 }}>
                {t("home.wallet_name")}
              </Txt>
            </View>
            <Txt
              weight="extra"
              style={{ color: "#A9C799", letterSpacing: 3, fontSize: 12 }}
            >
              mint.
            </Txt>
          </View>
        </LinearGradient>
      </Enter>

      <Enter delay={160}>
        <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
          <Tap onPress={onAdd} style={{ alignItems: "center", gap: 8 }}>
            <View
              style={{
                height: 48,
                width: 58,
                backgroundColor: C.pale,
                borderRadius: 18,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Icon name="add" size={24} />
            </View>
            <Txt weight="semibold" style={{ fontSize: 11 }}>
              {t("home.add_expense")}
            </Txt>
          </Tap>

          <Tap onPress={onCategories} style={{ alignItems: "center", gap: 8 }}>
            <View
              style={{
                height: 48,
                width: 58,
                backgroundColor: C.pale,
                borderRadius: 18,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Icon name="grid-outline" size={24} />
            </View>
            <Txt weight="semibold" style={{ fontSize: 11 }}>
              {t("home.categories")}
            </Txt>
          </Tap>

          <Tap onPress={onHistory} style={{ alignItems: "center", gap: 8 }}>
            <View
              style={{
                height: 48,
                width: 58,
                backgroundColor: C.pale,
                borderRadius: 18,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Icon name="time-outline" size={24} />
            </View>
            <Txt weight="semibold" style={{ fontSize: 11 }}>
              {t("home.history")}
            </Txt>
          </Tap>
        </View>
      </Enter>

      <Enter delay={210}>
        <Section
          title={t("home.recent_title")}
          action={t("home.see_all")}
          onPress={onHistory}
        />
        <View style={{ marginTop: 3 }}>
          {recentTransactions.map((tx) => (
            <TransactionRow key={tx.id} tx={tx} />
          ))}
          {!recentTransactions.length && (
            <Empty
              title={t("home.empty_title")}
              body={t("home.empty_body")}
              action={t("home.add_button")}
              onPress={onAdd}
            />
          )}
        </View>
      </Enter>

      <View style={[s.card, { gap: 13 }]}>
        <View style={[s.row, { justifyContent: "space-between" }]}>
          <Txt weight="bold" style={{ fontSize: 12 }}>
            {t("home.budget_progress")}
          </Txt>
          <Txt weight="extra" style={{ color: C.green }}>
            ---%
          </Txt>
        </View>
        <View
          style={{
            height: 7,
            borderRadius: 4,
            backgroundColor: C.pale,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              height: 7,
              width: "0%",
              backgroundColor: C.green2,
              borderRadius: 4,
            }}
          />
        </View>
        <Txt style={{ fontSize: 11, color: C.muted }}>
          {t("home.budget_initial")}: --- ₫
        </Txt>
        <Txt style={{ fontSize: 11, color: C.muted }}>
          {t("home.budget_spent")}: --- ₫
        </Txt>
      </View>
    </Screen>
  );
}
