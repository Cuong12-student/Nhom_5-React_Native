import React, { useState, useEffect } from "react";
import { View, TextInput, Alert } from "react-native";
import {
  Button,
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
import { getSpendLimit, setSpendLimit } from "../utils/storage";

const languages = [
  { id: "vi", name: "Tiếng Việt" },
  { id: "en", name: "English" },
  { id: "fr", name: "Français" },
];

const spendLimitOptions = [
  { value: 3_000_000, label: "3.000.000 ₫" },
  { value: 5_000_000, label: "5.000.000 ₫" },
  { value: 7_000_000, label: "7.000.000 ₫" },
  { value: 10_000_000, label: "10.000.000 ₫" },
  { value: 15_000_000, label: "15.000.000 ₫" },
  { value: 20_000_000, label: "20.000.000 ₫" },
];

export default function SettingsScreen({
  onBack,
  onResetToOnboarding,
  onLogout,
  userId,
  userName,
  userEmail,
  onSetSpendLimit,
}: {
  onBack?: () => void;
  onResetToOnboarding?: () => void;
  onLogout?: () => void;
  userId?: number;
  userName?: string;
  userEmail?: string;
  onSetSpendLimit?: (limit: number) => void;
}) {
  const { language, setLanguage, t } = useLanguage();
  const [selectedLimit, setSelectedLimit] = useState(5_000_000);
  const [isCustom, setIsCustom] = useState(false);
  const [customInput, setCustomInput] = useState("");

  // Load current limit từ storage
  useEffect(() => {
    if (userId) {
      getSpendLimit(userId).then((limit) => {
        setSelectedLimit(limit);
        const isPreset = spendLimitOptions.some((opt) => opt.value === limit);
        if (!isPreset) {
          setIsCustom(true);
          setCustomInput(limit.toLocaleString("vi-VN"));
        } else {
          setIsCustom(false);
        }
      });
    }
  }, [userId]);

  // Chọn các mốc có sẵn
  async function handleLimitChange(value: number) {
    setIsCustom(false);
    setSelectedLimit(value);
    if (userId) {
      await setSpendLimit(userId, value);
    }
    if (onSetSpendLimit) onSetSpendLimit(value);
  }

  // Chọn mục "Khác"
  function handleSelectCustom() {
    setIsCustom(true);
    const isPreset = spendLimitOptions.some(
      (opt) => opt.value === selectedLimit,
    );
    if (!isPreset && selectedLimit > 0) {
      setCustomInput(selectedLimit.toLocaleString("vi-VN"));
    }
  }

  // Lưu số tiền tự nhập
  async function handleSaveCustom() {
    const rawNum = Number(customInput.replace(/[^0-9]/g, ""));
    if (!rawNum || rawNum <= 0) {
      Alert.alert("Thông báo", "Vui lòng nhập số tiền hợp lệ");
      return;
    }

    setSelectedLimit(rawNum);
    if (userId) {
      await setSpendLimit(userId, rawNum);
    }
    if (onSetSpendLimit) onSetSpendLimit(rawNum);
    Alert.alert(
      "Thành công",
      `Đã lưu hạn mức: ${rawNum.toLocaleString("vi-VN")} ₫`,
    );
  }

  return (
    <Screen>
      <Header title={t("settings.title")} back onBack={onBack} />

      {/* App brand card */}
      <View style={[s.card, { backgroundColor: C.green, gap: 13 }]}>
        <Icon name="leaf-outline" color={C.lime} size={32} />
        <Txt
          weight="extra"
          style={{ color: "#fff", fontSize: 23, letterSpacing: 2 }}
        >
          mint.
        </Txt>
        <Txt style={{ color: "#A7F3D0", fontSize: 12 }}>
          {t("settings.app_desc")}
        </Txt>
      </View>

      {/* ─── Giới hạn chi tiêu ─── */}
      <View style={{ gap: 10 }}>
        <Txt weight="bold">{t("settings.spend_limit")}</Txt>
        <Txt style={{ fontSize: 12, color: C.muted }}>
          {t("settings.spend_limit_desc")}
        </Txt>
        <View style={{ gap: 8 }}>
          {spendLimitOptions.map((opt) => (
            <Tap
              key={opt.value}
              onPress={() => handleLimitChange(opt.value)}
              style={[
                s.card,
                s.row,
                {
                  justifyContent: "space-between",
                  minHeight: 52,
                  paddingVertical: 10,
                  borderWidth: 2,
                  borderColor:
                    selectedLimit === opt.value ? C.green : "transparent",
                },
              ]}
            >
              <Txt
                weight={selectedLimit === opt.value ? "bold" : "regular"}
                style={{ fontSize: 14 }}
              >
                {opt.label}
              </Txt>
              <Icon
                name={
                  selectedLimit === opt.value
                    ? "checkmark-circle"
                    : "ellipse-outline"
                }
                color={selectedLimit === opt.value ? C.green : C.line}
              />
            </Tap>
          ))}
          {/* Mục Khác */}
          <Tap
            onPress={handleSelectCustom}
            style={[
              s.card,
              s.row,
              {
                justifyContent: "space-between",
                minHeight: 52,
                paddingVertical: 10,
                borderWidth: 2,
                borderColor: isCustom ? C.green : "transparent",
              },
            ]}
          >
            <Txt
              weight={isCustom ? "bold" : "regular"}
              style={{ fontSize: 14 }}
            >
              {isCustom &&
              !spendLimitOptions.some((o) => o.value === selectedLimit)
                ? `Khác (${selectedLimit.toLocaleString("vi-VN")} ₫)`
                : "Khác (Tự nhập)"}
            </Txt>
            <Icon
              name={isCustom ? "checkmark-circle" : "ellipse-outline"}
              color={isCustom ? C.green : C.line}
            />
          </Tap>
          {/* Ô nhập số tiền khi chọn Khác */}
          {isCustom && (
            <View
              style={[
                s.card,
                s.row,
                {
                  gap: 10,
                  marginTop: 2,
                  borderColor: C.green,
                  borderWidth: 1,
                  backgroundColor: "#fff",
                },
              ]}
            >
              <TextInput
                value={customInput}
                onChangeText={(text) => {
                  const raw = text.replace(/[^0-9]/g, "");
                  setCustomInput(
                    raw ? Number(raw).toLocaleString("vi-VN") : "",
                  );
                }}
                keyboardType="numeric"
                placeholder="Nhập số tiền (VD: 4.500.000)..."
                placeholderTextColor={C.muted}
                style={{
                  flex: 1,
                  fontSize: 15,
                  fontWeight: "600",
                  color: "#1E293B",
                  paddingVertical: 4,
                }}
              />
              <Tap
                onPress={handleSaveCustom}
                style={{
                  backgroundColor: C.green,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 10,
                }}
              >
                <Txt weight="bold" style={{ color: "#fff", fontSize: 13 }}>
                  Lưu
                </Txt>
              </Tap>
            </View>
          )}
        </View>
      </View>

      {/* ─── Về màn hình chào ─── */}
      {onResetToOnboarding && (
        <Button
          light
          title={t("settings.welcome_screen")}
          onPress={() => onResetToOnboarding?.()}
        />
      )}

      {/* ─── Đăng xuất ─── */}
      {onLogout && (
        <Button
          danger
          title={t("settings.logout")}
          icon="log-out-outline"
          onPress={onLogout}
        />
      )}

      {/* THÔNG TIN TÀI KHOẢN */}
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 20,
          padding: 18,
          gap: 12,
          marginTop: 10,
          borderWidth: 1,
          borderColor: "#E5E7EB",
        }}
      >
        <Txt weight="bold" style={{ fontSize: 15, color: "#123F30" }}>
          Thông tin tài khoản
        </Txt>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          {/* Avatar chữ cái đầu */}
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: "#E8F5E9",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Txt weight="bold" style={{ fontSize: 20, color: "#2E7D32" }}>
              {(userName || "U").charAt(0).toUpperCase()}
            </Txt>
          </View>

          {/* Họ tên và Email */}
          <View style={{ flex: 1, gap: 2 }}>
            <Txt weight="bold" style={{ fontSize: 16, color: "#1F2937" }}>
              {userName || "Người dùng"}
            </Txt>
            <Txt style={{ fontSize: 13, color: "#6B7280" }}>
              {userEmail || "Chưa có email"}
            </Txt>
          </View>
        </View>

        {/* Dòng phân cách nhẹ */}
        <View
          style={{ height: 1, backgroundColor: "#F3F4F6", marginVertical: 4 }}
        />

        {/* ID tài khoản */}
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Txt style={{ fontSize: 13, color: "#6B7280" }}>
            Mã khách hàng (ID):
          </Txt>
          <Txt weight="semibold" style={{ fontSize: 13, color: "#111827" }}>
            #{userId || "---"}
          </Txt>
        </View>
      </View>
    </Screen>
  );
}
