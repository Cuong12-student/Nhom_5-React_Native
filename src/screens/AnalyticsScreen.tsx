import React, { useState } from "react";
import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import {
  Empty,
  Enter,
  Header,
  Icon,
  IconButton,
  Screen,
  Section,
  Txt,
  s,
} from "../components/ui";
import { C } from "../constants/colors";
import { useLanguage } from "../contexts/languageContext";
export default function AnalysticScreen({
  slices = [],
  total = 0,
  months = [],
  onPrevMonth,
  onNextMonth,
}: {
  slices?: any[];
  total?: number;
  months?: any[];
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
}) {
  const [date] = useState(new Date());
  const ring = 2 * Math.PI * 82;
  const { language, t } = useLanguage();
  const max = Math.max(...months.map((m) => m.amount), 1);

  return (
    <Screen>
      <Header
        title={t("analytics.title")}
        right={
          <View style={s.iconButton}>
            <Icon name="pie-chart-outline" />
          </View>
        }
      />
      <View
        style={[
          s.row,
          {
            justifyContent: "space-between",
            backgroundColor: C.pale,
            paddingHorizontal: 4,
            borderRadius: 18,
          },
        ]}
      >
        <IconButton
          icon="chevron-back"
          label="Trước"
          onPress={onPrevMonth || (() => {})}
        />
        <Txt weight="bold" style={{ fontSize: 14 }}>
          {`${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`}
        </Txt>
        <IconButton
          icon="chevron-forward"
          label="Sau"
          onPress={onNextMonth || (() => {})}
        />
      </View>

      <Enter>
        <Section title={t("analytics.allocation")} />
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            height: 220,
            marginTop: 4,
          }}
        >
          <Svg width={220} height={220} viewBox="0 0 220 220">
            <Circle
              cx="110"
              cy="110"
              r="82"
              stroke={C.pale}
              strokeWidth={26}
              fill="none"
            />
            {slices.map((c, i) => {
              const start = slices
                .slice(0, i)
                .reduce((sum, item) => sum + item.fraction * ring, 0);
              return (
                <Circle
                  key={c.id || i}
                  cx="110"
                  cy="110"
                  r="82"
                  stroke={c.color}
                  strokeWidth={26}
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={[Math.max(c.fraction * ring - 10, 1), ring]}
                  strokeDashoffset={-start - 5}
                  rotation="-90"
                  origin="110,110"
                />
              );
            })}
          </Svg>
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              alignItems: "center",
              maxWidth: 143,
              gap: 5,
            }}
          >
            <Txt
              weight="extra"
              adjustsFontSizeToFit
              numberOfLines={1}
              style={{ fontSize: 22, letterSpacing: -0.8 }}
            >
              {total.toLocaleString()} ₫
            </Txt>
            <Txt style={{ fontSize: 11, color: C.muted }}>
              {t("analytics.total_spent")}
            </Txt>
          </View>
        </View>

        <View style={{ gap: 12, marginTop: 12 }}>
          {slices.map((c) => (
            <View
              key={c.id}
              style={[s.row, { justifyContent: "space-between" }]}
            >
              <View style={[s.row, { gap: 8, flex: 1 }]}>
                <View
                  style={{
                    height: 9,
                    width: 9,
                    borderRadius: 5,
                    backgroundColor: c.color,
                  }}
                />
                <Txt style={{ fontSize: 12, flexShrink: 1 }}>{c.name}</Txt>
              </View>
              <Txt weight="bold" style={{ fontSize: 12 }}>
                {Math.round(c.fraction * 100)}%
              </Txt>
              <Txt
                style={{
                  fontSize: 11,
                  color: C.muted,
                  minWidth: 90,
                  textAlign: "right",
                }}
              >
                {c.amount.toLocaleString()} ₫
              </Txt>
            </View>
          ))}
        </View>
        {!total && (
          <Empty
            title={t("analytics.empty_title")}
            body={t("analytics.empty_body")}
          />
        )}
      </Enter>

      <View>
        <Section title={t("analytics.trend")} />
        <Txt style={{ fontSize: 11, color: C.muted }}>
          {t("analytics.last_6_months")}
        </Txt>
        <View
          style={{ flexDirection: "row", height: 155, gap: 12, marginTop: 15 }}
        >
          {months.map((m, i) => (
            <View key={i} style={{ flex: 1, alignItems: "center" }}>
              <View
                style={{
                  height: 110,
                  width: "100%",
                  justifyContent: "flex-end",
                }}
              >
                <View
                  style={{
                    height: Math.max(4, (m.amount / max) * 110),
                    width: "100%",
                    backgroundColor:
                      i === months.length - 1 ? C.green : "#A9BBA6",
                    borderTopLeftRadius: 6,
                    borderTopRightRadius: 6,
                  }}
                />
              </View>
              <Txt
                numberOfLines={2}
                style={{
                  height: 36,
                  lineHeight: 16,
                  marginTop: 9,
                  fontSize: 11,
                  color: C.muted,
                  textAlign: "center",
                }}
              >
                {m.label}
              </Txt>
            </View>
          ))}
        </View>
      </View>
    </Screen>
  );
}
