import React from "react";
import { View } from "react-native";
import { Button, Header, Icon, Screen, Tap, Txt, s } from "../components/ui";
import { C } from "../constants/colors";
import { useLanguage } from "../contexts/languageContext";

const languages = [
  { id: "vi", name: "Tiếng Việt" },
  { id: "en", name: "English" },
  { id: "fr", name: "Français" },
];

export default function SettingsScreen({
  onBack,
  onResetToOnboarding,
}: {
  onBack?: () => void;
  onResetToOnboarding?: () => void;
}) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <Screen>
      <Header title={t("settings.title")} back onBack={onBack} />
      <View style={[s.card, { backgroundColor: C.green, gap: 13 }]}>
        <Icon name="leaf-outline" color={C.lime} size={32} />
        <Txt
          weight="extra"
          style={{ color: "#fff", fontSize: 23, letterSpacing: 2 }}
        >
          {t("common.app_name")}
        </Txt>
        <Txt style={{ color: "#D3E0CA", fontSize: 12, lineHeight: 21 }}>
          {t("common.app_desc")}
        </Txt>
      </View>

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

      {onResetToOnboarding && (
        <Button
          light
          title={t("settings.welcome_screen")}
          onPress={() => onResetToOnboarding?.()}
        />
      )}

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
