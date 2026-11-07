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
import AnalyticsScreen from "./src/screens/AnalyticsScreen";
import CategoriesScreen from "./src/screens/CategoriesScreen";
import CategoryScreen from "./src/screens/CategoryScreen";
import DepositScreen from "./src/screens/DepositScreen";
import TransactionsDetailsScreen from "./src/screens/TransactionDetailsScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import { TransactionForm } from "./src/components/transaction-form";
import { AuthScreen } from "./src/components/auth-screen";
import { BottomTabBar, TabKey } from "./src/components/bottom-tab-bar";
import { LanguageProvider } from "./src/contexts/languageContext";
import { useAppInterstitialAd } from "./src/hooks/useInterstitialAd";
import { AdBanner } from "./src/components/AdBanner";
import {
  User,
  addTransaction,
  depositToWallet,
  getTransactions,
  setSpendLimit,
} from "./src/utils/storage";

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
  // ─── Auth State ─────────────────────────────────
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // ─── Navigation State ───────────────────────────
  const [stack, setStack] = useState<ScreenType[]>(["auth_login"]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  // ─── Refresh trigger (dùng để force re-render khi dữ liệu thay đổi) ──
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  const currentScreen = stack[stack.length - 1];
  const { navigateWithAd } = useAppInterstitialAd();

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

  // ─── Xử lý đăng nhập / đăng ký thành công ─────
  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    triggerRefresh();
    setStack(["home"]);
  };

  // ─── Xử lý đăng xuất ──────────────────────────
  const handleLogout = () => {
    setCurrentUser(null);
    setStack(["auth_login"]);
  };

  // ─── Xử lý nạp tiền ───────────────────────────
  const handleDeposit = async (amount: number) => {
    if (currentUser) {
      try {
        // 1. Nhận số dư mới nhất từ API backend
        const newBalance = await depositToWallet(currentUser.id, amount);

        // 2. Cập nhật lại state currentUser với số dư mới
        setCurrentUser((prev) =>
          prev ? { ...prev, walletBalance: newBalance } : prev,
        );

        // 3. Trigger làm mới dữ liệu
        triggerRefresh();

        // 4. Quay lại HomeScreen
        goBack();
      } catch (err) {
        console.error("Lỗi khi nạp tiền trong App.tsx:", err);
      }
    }
  };

  // ─── Xử lý thêm giao dịch ─────────────────────
  const handleSaveTransaction = async (data: any) => {
    await addTransaction(
      {
        title: data.name,
        amount: data.amount,
        type: data.type || "expense",
        category: data.category,
        date:
          data.date instanceof Date
            ? data.date.toISOString().split("T")[0]
            : data.date,
        note: data.note,
      },
      currentUser?.id,
    );
    triggerRefresh();
    goBack();
  };

  // ─── Xử lý thay đổi hạn mức ──────────────────
  const handleSetSpendLimit = async (limit: number) => {
    if (currentUser) {
      await setSpendLimit(currentUser.id, limit);
      triggerRefresh();
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "onboarding":
        return <OnboardingScreen onFinish={() => setStack(["auth_login"])} />;

      case "auth_register":
        return (
          <AuthScreen
            register={true}
            onSubmit={handleAuthSuccess}
            onSwitchMode={() => setStack(["auth_login"])}
          />
        );

      case "auth_login":
        return (
          <AuthScreen
            register={false}
            onSubmit={handleAuthSuccess}
            onSwitchMode={() => setStack(["auth_register"])}
          />
        );

      case "add":
        return (
          <TransactionForm
            onBack={goBack}
            onSave={(data) => navigateWithAd(() => handleSaveTransaction(data))}
          />
        );

      case "deposit":
        return (
          <DepositScreen
            onBack={goBack}
            onSave={(amount) => navigateWithAd(() => handleDeposit(amount))}
          />
        );

      case "categories":
        return (
          <CategoriesScreen
            onAddCategory={() => {
              setSelectedCategory(null);
              pushScreen("category_edit");
            }}
            onSelectCategory={(item) => {
              setSelectedCategory(item);
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
        return (
          <AnalyticsScreen
            userId={currentUser?.id || 0}
            refreshKey={refreshKey}
          />
        );

      case "settings":
        return (
          <SettingsScreen
            onBack={goBack}
            onResetToOnboarding={() => pushScreen("onboarding")}
            onLogout={handleLogout}
            userId={currentUser?.id || 0}
            userName={currentUser?.name}
            userEmail={currentUser?.email}
            onSetSpendLimit={handleSetSpendLimit}
          />
        );

      case "home":
      default:
        return (
          <HomeScreen
            userName={currentUser?.name || "Người dùng"}
            userId={currentUser?.id || 0}
            refreshKey={refreshKey}
            onAdd={() => pushScreen("add")}
            onCategories={() => pushScreen("categories")}
            onHistory={() => pushScreen("history")}
            onSettings={() => navigateWithAd(() => pushScreen("settings"))}
            onDeposit={() => pushScreen("deposit")}
          />
        );
    }
  };

  const isMainTabScreen = [
    "home",
    "history",
    "analytics",
    "categories",
  ].includes(currentScreen);

  const handleTabPress = (tab: TabKey) => {
    if (tab === currentScreen) return;

    if (tab === "analytics") {
      navigateWithAd(() => setStack(["analytics"]));
    } else if (tab === "add") {
      pushScreen("add");
    } else {
      setStack([tab]);
    }
  };

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <View style={{ flex: 1, backgroundColor: "#F7F7F0" }}>
          {/* Nội dung màn hình */}
          <View style={{ flex: 1 }}>{renderScreen()}</View>

          {/* Đặt Banner ở đây (ngay trên TabBar) */}
          {isMainTabScreen && <AdBanner />}

          {/* Thanh TabBar ở dưới cùng */}
          {isMainTabScreen && (
            <BottomTabBar
              currentTab={currentScreen as TabKey}
              onSelectTab={handleTabPress}
            />
          )}
        </View>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
