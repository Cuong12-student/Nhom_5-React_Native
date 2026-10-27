import React, { useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  useFonts,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from "@expo-google-fonts/manrope";

// Screens
import OnboardingScreen from "./src/screens/OnboardingScreen";
import HomeScreen from "./src/screens/HomeScreen";
import HistoryScreen from "./src/screens/HistoryScreen";
import AnalysticScreen from "./src/screens/AnalyticsScreen";
import CategoriesScreen from "./src/screens/CategoriesScreen";
import CategoryScreen from "./src/screens/CategoryScreen";
import DepositScreen from "./src/screens/DepositScreen";
import TransactionsDetailsScreen from "./src/screens/TransactionDetailsScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import { TransactionForm } from "./src/components/transaction-form";
import { AuthScreen } from "./src/components/auth-screen";
import { BottomTabBar, TabKey } from "./src/components/bottom-tab-bar";

type ScreenType =
  | "onboarding"
  | "auth_login"
  | "auth_register"
  | "home"
  | "history"
  | "add"
  | "deposit"
  | "analytics"
  | "categories"
  | "category_edit"
  | "transaction_detail"
  | "settings";

export default function App() {
  const [stack, setStack] = useState<ScreenType[]>(["home"]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const currentScreen = stack[stack.length - 1];

  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#123F30" />
      </View>
    );
  }

  const pushScreen = (screen: ScreenType) => {
    setStack((prev) => [...prev, screen]);
  };

  const goBack = () => {
    setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  };

  const switchTab = (tab: TabKey) => {
    setStack([tab]);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "onboarding":
        return <OnboardingScreen />;
      case "auth_register":
        return (
          <AuthScreen register={true} onSubmit={() => switchTab("home")} />
        );
      case "auth_login":
        return (
          <AuthScreen register={false} onSubmit={() => switchTab("home")} />
        );
      case "add":
        return <TransactionForm onBack={goBack} onSave={goBack} />;
      case "deposit":
        return <DepositScreen onBack={goBack} onSave={goBack} />;
      case "categories":
        return (
          <CategoriesScreen
            onAddCategory={() => {
              setSelectedCategory(null); // Tạo mới: không có dữ liệu ban đầu
              pushScreen("category_edit");
            }}
            onSelectCategory={(item) => {
              setSelectedCategory(item); // Sửa danh mục đã có
              pushScreen("category_edit");
            }}
            onBack={stack.length > 1 ? goBack : undefined}
          />
        );
      case "category_edit":
        return (
          <CategoryScreen
            initialData={selectedCategory}
            onBack={goBack}
            onSave={goBack}
            onDelete={goBack}
          />
        );
      case "history":
        return (
          <HistoryScreen
            onAddTransaction={() => pushScreen("add")}
            onSelectTransaction={() => pushScreen("transaction_detail")}
            onBack={stack.length > 1 ? goBack : undefined}
          />
        );
      case "transaction_detail":
        return (
          <TransactionsDetailsScreen
            onBack={goBack}
            onEdit={() => pushScreen("add")}
            onDelete={goBack}
          />
        );
      case "analytics":
        return <AnalysticScreen />;
      case "settings":
        return (
          <SettingsScreen
            onBack={goBack}
            onResetToOnboarding={() => pushScreen("onboarding")}
          />
        );
      case "home":
      default:
        return (
          <HomeScreen
            userName="Khiêm"
            balance={0}
            initialBudget={0}
            recentTransactions={[]}
            onAdd={() => pushScreen("add")}
            onCategories={() => pushScreen("categories")}
            onHistory={() => pushScreen("history")}
            onSettings={() => pushScreen("settings")}
            onDeposit={() => pushScreen("deposit")}
          />
        );
    }
  };

  // Chỉ hiển thị Bottom Bar ở 4 màn hình chính
  const isTabBarVisible = [
    "home",
    "history",
    "analytics",
    "categories",
  ].includes(currentScreen);

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: "#F7F7F0" }}>
        <View style={{ flex: 1 }}>{renderScreen()}</View>
        {isTabBarVisible && (
          <BottomTabBar
            currentTab={currentScreen as TabKey}
            onSelectTab={switchTab}
          />
        )}
      </View>
    </SafeAreaProvider>
  );
}
