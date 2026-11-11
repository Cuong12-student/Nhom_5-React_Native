import React, { useState, useEffect, useCallback } from "react";
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
import { CATEGORIES } from "../constants/categories";
import {
  getMonthlyExpense,
  getMonthlyIncome,
  getExpenseByCategory,
  getLast6MonthsExpense,
  getRemainingBudget,
  getTransactions,
  getCategories,
} from "../utils/storage";
const FALLBACK_COLORS = [
  "#10B981", // Xanh lá
  "#F59E0B", // Cam
  "#8B5CF6", // Tím
  "#EF4444", // Đỏ
  "#3B82F6", // Xanh dương
  "#EC4899", // Hồng
  "#14B8A6", // Xanh ngọc
  "#F97316", // Cam đậm
];
export default function AnalyticsScreen({
  userId = 0,
  refreshKey = 0,
}: {
  userId?: number;
  refreshKey?: number;
}) {
  const { t } = useLanguage();
  const [viewDate, setViewDate] = useState(new Date());
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [categoryBreakdown, setCategoryBreakdown] = useState<any[]>([]);
  const [last6Months, setLast6Months] = useState<any[]>([]);
  const [budgetInfo, setBudgetInfo] = useState({
    limit: 5_000_000,
    spent: 0,
    remaining: 5_000_000,
  });

  const loadData = useCallback(async () => {
    // 1. Tải và đồng bộ danh sách giao dịch của riêng user này
    let dbCategories: any[] = [];
    if (userId) {
      const [, fetchedCats] = await Promise.all([
        getTransactions(userId),
        getCategories(userId),
      ]);
      dbCategories = fetchedCats || [];
    }

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    // 2. Truyền userId vào các hàm thống kê để chỉ tính riêng cho user này
    const expense = getMonthlyExpense(year, month, userId);
    const income = getMonthlyIncome(year, month, userId);
    const breakdown = getExpenseByCategory(year, month, userId);
    const trend = getLast6MonthsExpense(viewDate, userId);

    setTotalExpense(expense);
    setTotalIncome(income);
    setLast6Months(trend);

    if (userId) {
      const budget = await getRemainingBudget(userId, year, month);
      setBudgetInfo(budget);
    }

    // Map category info
    const mappedBreakdown = breakdown.map((item, index) => {
      const cat = dbCategories.find(
        (c) =>
          String(c.id) === String(item.category) ||
          c.name?.toLowerCase() === String(item.category).toLowerCase(),
      );
      return {
        id: item.category,
        name: cat?.name || item.category || "Khác",
        icon: cat?.icon || "pricetag-outline",
        color: cat?.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length],
        amount: item.amount,
        fraction: item.fraction,
      };
    });
    setCategoryBreakdown(mappedBreakdown);
  }, [viewDate, userId]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshKey]);

  const ring = 2 * Math.PI * 82;
  const max = Math.max(...last6Months.map((m) => m.amount), 1);

  const monthLabel = `${String(viewDate.getMonth() + 1).padStart(2, "0")}/${viewDate.getFullYear()}`;
  const isOverBudget = budgetInfo.remaining < 0;

  function goNextMonth() {
    setViewDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  }

  function goPrevMonth() {
    setViewDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  }

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

      {/* Chọn tháng */}
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
        <IconButton icon="chevron-back" label="Trước" onPress={goPrevMonth} />
        <Txt weight="bold" style={{ fontSize: 14 }}>
          {monthLabel}
        </Txt>
        <IconButton icon="chevron-forward" label="Sau" onPress={goNextMonth} />
      </View>

      {/* ─── Giới hạn chi tiêu tháng ─── */}
      <View
        style={{
          backgroundColor: isOverBudget ? "#FEF2F2" : "#F0FDF4",
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: isOverBudget ? "#FECACA" : "#BBF7D0",
          marginBottom: 16,
        }}
      >
        <View
          style={[s.row, { justifyContent: "space-between", marginBottom: 10 }]}
        >
          <Txt weight="bold" style={{ fontSize: 13 }}>
            🎯 {t("analytics.budget_title")}
          </Txt>
          <Txt
            weight="bold"
            style={{
              fontSize: 12,
              color: isOverBudget ? "#DC2626" : "#16A34A",
            }}
          >
            {isOverBudget
              ? t("analytics.over_budget")
              : t("analytics.within_budget")}
          </Txt>
        </View>

        {/* Progress bar - Có phòng ngừa budgetInfo.limit = 0 */}
        <View
          style={{
            height: 10,
            backgroundColor: "#E5E7EB",
            borderRadius: 5,
            overflow: "hidden",
            marginBottom: 10,
          }}
        >
          <View
            style={{
              height: 10,
              borderRadius: 5,
              width: `${Math.min(
                ((budgetInfo.spent || 0) / (budgetInfo.limit || 1)) * 100,
                100,
              )}%`,
              backgroundColor: isOverBudget ? "#DC2626" : "#16A34A",
            }}
          />
        </View>

        <View style={[s.row, { justifyContent: "space-between" }]}>
          <Txt style={{ fontSize: 12, color: "#6B7280" }}>
            {t("analytics.spent")}:{" "}
            {Number(budgetInfo.spent || 0).toLocaleString("vi-VN")} ₫
          </Txt>
          <Txt style={{ fontSize: 12, color: "#6B7280" }}>
            {t("analytics.limit")}:{" "}
            {Number(budgetInfo.limit || 0).toLocaleString("vi-VN")} ₫
          </Txt>
        </View>

        {/* Khối hiển thị số tiền còn lại (Hiện dấu âm và màu đỏ đậm khi vượt mức) */}
        <View
          style={{
            marginTop: 10,
            backgroundColor: isOverBudget ? "#FEE2E2" : "#ECFDF5",
            borderRadius: 10,
            padding: 10,
            alignItems: "center",
          }}
        >
          <Txt
            style={{
              fontSize: 11,
              color: isOverBudget ? "#991B1B" : "#6B7280",
            }}
          >
            {t("analytics.remaining")}
          </Txt>
          <Txt
            weight="extra"
            style={{
              fontSize: 20,
              color: isOverBudget ? "#DC2626" : "#16A34A",
              marginTop: 2,
            }}
          >
            {Number(budgetInfo.remaining || 0).toLocaleString("vi-VN")} ₫
          </Txt>
        </View>
      </View>

      {/* ─── Biểu đồ tròn ─── */}
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
            {categoryBreakdown.map((c, i) => {
              const start = categoryBreakdown
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
              {totalExpense.toLocaleString()} ₫
            </Txt>
            <Txt style={{ fontSize: 11, color: C.muted }}>
              {t("analytics.total_spent")}
            </Txt>
          </View>
        </View>

        {/* Danh sách phân bổ */}
        <View style={{ gap: 12, marginTop: 12 }}>
          {categoryBreakdown.map((c) => (
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
        {!totalExpense && (
          <Empty
            title={t("analytics.empty_title")}
            body={t("analytics.empty_body")}
          />
        )}
      </Enter>

      {/* ─── Xu hướng 6 tháng ─── */}
      <View>
        <Section title={t("analytics.trend")} />
        <Txt style={{ fontSize: 11, color: C.muted }}>
          {t("analytics.last_6_months")}
        </Txt>
        <View
          style={{ flexDirection: "row", height: 155, gap: 12, marginTop: 15 }}
        >
          {last6Months.map((m, i) => (
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
                      i === last6Months.length - 1 ? C.green : "#A9BBA6",
                    borderTopLeftRadius: 6,
                    borderTopRightRadius: 6,
                  }}
                />
              </View>
              {/* Hiện số tiền trên cột */}
              <Txt
                numberOfLines={1}
                style={{
                  fontSize: 8,
                  color: C.muted,
                  marginTop: 2,
                  textAlign: "center",
                }}
              >
                {m.amount > 0 ? `${(m.amount / 1_000_000).toFixed(1)}tr` : "0"}
              </Txt>
              <Txt
                numberOfLines={2}
                style={{
                  height: 30,
                  lineHeight: 14,
                  marginTop: 3,
                  fontSize: 10,
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
