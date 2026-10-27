import React, { useState } from "react";
import { View } from "react-native";
import { Button, Header, Icon, Screen, Tap, Txt, s } from "../components/ui";
import { C } from "../constants/colors";

const languages = [
  { id: "vi", name: "Tiếng Việt" },
  { id: "en", name: "English" },
  { id: "fr", name: "Français" },
];

export default function SettingsScreen({
  onBack,
  onResetToOnboarding,
  onLanguageChange,
}: {
  onBack?: () => void;
  onResetToOnboarding?: () => void;
  onLanguageChange?: (lang: string) => void;
}) {
  const [currentLang, setCurrentLang] = useState("vi");

  function handleSelect(lang: string) {
    setCurrentLang(lang);
    if (onLanguageChange) onLanguageChange(lang);
  }

  return (
    <Screen>
      <Header title="Cài đặt" back onBack={onBack} />
      <View style={[s.card, { backgroundColor: C.green, gap: 13 }]}>
        <Icon name="leaf-outline" color={C.lime} size={32} />
        <Txt
          weight="extra"
          style={{ color: "#fff", fontSize: 23, letterSpacing: 2 }}
        >
          mint.
        </Txt>
        <Txt style={{ color: "#D3E0CA", fontSize: 12, lineHeight: 21 }}>
          Ghi lại chi tiêu, sắp xếp danh mục và theo dõi ví mỗi ngày.
        </Txt>
      </View>

      <Txt weight="bold">Ngôn ngữ hiển thị</Txt>
      <View style={{ gap: 9 }}>
        {languages.map((lang) => (
          <Tap
            key={lang.id}
            onPress={() => handleSelect(lang.id)}
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
            <Txt weight={currentLang === lang.id ? "bold" : "regular"}>
              {lang.name}
            </Txt>
            <Icon
              name={
                currentLang === lang.id ? "checkmark-circle" : "ellipse-outline"
              }
              color={currentLang === lang.id ? C.green : C.line}
            />
          </Tap>
        ))}
      </View>

      <Button
        light
        title="Về màn hình chào"
        onPress={() => onResetToOnboarding?.()}
      />

      <View style={[s.card, { gap: 10 }]}>
        <Txt weight="bold">Nhóm thực hiện · 05</Txt>
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
