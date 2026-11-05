import React, { useState } from "react";
import { View } from "react-native";
import { Button, Field, Header, Icon, Screen, Tap, Txt, s } from "../components/ui";
import { C } from "../constants/colors";
import { useLanguage } from "../contexts/languageContext";
import { getSpendLimit } from "../utils/storage";

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
  onSetSpendLimit,
}: {
  onBack?: () => void;
  onResetToOnboarding?: () => void;
  onLogout?: () => void;
  userId?: number;
  onSetSpendLimit?: (limit: number) => void;
}) {
  const { language, setLanguage, t } = useLanguage();
  const [selectedLimit, setSelectedLimit] = useState(5_000_000);

  // Load current limit
  React.useEffect(() => {
    if (userId) {
      getSpendLimit(userId).then((limit) => setSelectedLimit(limit));
    }
  }, [userId]);

  function handleLimitChange(value: number) {
    setSelectedLimit(value);
    if (onSetSpendLimit) onSetSpendLimit(value);
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
        </View>
      </View>

      {/* ─── Ngôn ngữ ─── */}
      <Txt weight="bold">{t("settings.language")}</Txt>
      <View style={{ gap: 9 }}>
        {languages.map((lang) => (
          <Tap
            key={lang.id}
            onPress={() => setLanguage(lang.id as any)}
            style={[
              s.card,
              s.row,
              {
                justifyContent: "space-between",
                minHeight: 58,
                paddingVertical: 12,
              },
            ]}
          >
            <Txt weight={language === lang.id ? "bold" : "regular"}>
              {lang.name}
            </Txt>
            <Icon
              name={
                language === lang.id ? "checkmark-circle" : "ellipse-outline"
              }
              color={language === lang.id ? C.green : C.line}
            />
          </Tap>
        ))}
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

      {/* ─── Team ─── */}
      <View style={[s.card, { gap: 10 }]}>
        <Txt weight="bold">{t("settings.team")}</Txt>
        {[
          "Nguyễn Xuân Cường",
          "Ngô Tuấn Hùng",
          "Nguyễn An Nam",
          "Nguyễn Đức Khiêm",
          "Trần Gia Khánh",
        ].map((name) => (
          <Txt key={name} style={{ fontSize: 12, color: C.muted }}>
            {name}
          </Txt>
        ))}
      </View>
    </Screen>
  );
}
