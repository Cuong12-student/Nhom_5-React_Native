import React from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon, Tap, Txt } from "./ui";
import { C } from "../constants/colors";

export type TabKey = "home" | "history" | "add" | "analytics" | "categories";

export function BottomTabBar({
  currentTab,
  onSelectTab,
}: {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, 10) }]}
    >
      {/* Trang chủ */}
      <Tap onPress={() => onSelectTab("home")} style={styles.tabItem}>
        <Icon
          name={currentTab === "home" ? "home" : "home-outline"}
          size={24}
          color={currentTab === "home" ? C.green : C.muted}
        />
        <Txt
          weight={currentTab === "home" ? "bold" : "regular"}
          style={[
            styles.tabLabel,
            { color: currentTab === "home" ? C.green : C.muted },
          ]}
        >
          Trang chủ
        </Txt>
      </Tap>

      {/* Lịch sử */}
      <Tap onPress={() => onSelectTab("history")} style={styles.tabItem}>
        <Icon
          name={currentTab === "history" ? "receipt" : "receipt-outline"}
          size={24}
          color={currentTab === "history" ? C.green : C.muted}
        />
        <Txt
          weight={currentTab === "history" ? "bold" : "regular"}
          style={[
            styles.tabLabel,
            { color: currentTab === "history" ? C.green : C.muted },
          ]}
        >
          Lịch sử
        </Txt>
      </Tap>

      {/* Nút tròn Thêm (+) ở giữa */}
      <Tap onPress={() => onSelectTab("add")} style={styles.centerItem}>
        <View style={styles.addCircle}>
          <Icon name="add" size={32} color="#FFFFFF" />
        </View>
      </Tap>

      {/* Thống kê */}
      <Tap onPress={() => onSelectTab("analytics")} style={styles.tabItem}>
        <Icon
          name={currentTab === "analytics" ? "pie-chart" : "pie-chart-outline"}
          size={24}
          color={currentTab === "analytics" ? C.green : C.muted}
        />
        <Txt
          weight={currentTab === "analytics" ? "bold" : "regular"}
          style={[
            styles.tabLabel,
            { color: currentTab === "analytics" ? C.green : C.muted },
          ]}
        >
          Thống kê
        </Txt>
      </Tap>

      {/* Danh mục */}
      <Tap onPress={() => onSelectTab("categories")} style={styles.tabItem}>
        <Icon
          name={currentTab === "categories" ? "grid" : "grid-outline"}
          size={24}
          color={currentTab === "categories" ? C.green : C.muted}
        />
        <Txt
          weight={currentTab === "categories" ? "bold" : "regular"}
          style={[
            styles.tabLabel,
            { color: currentTab === "categories" ? C.green : C.muted },
          ]}
        >
          Danh mục
        </Txt>
      </Tap>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#FAF9F5",
    borderTopWidth: 1,
    borderTopColor: "#EAECE3",
    paddingTop: 8,
    minHeight: 65,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    minHeight: 48,
  },
  tabLabel: {
    fontSize: 11,
  },
  centerItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  addCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: C.green,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
});
