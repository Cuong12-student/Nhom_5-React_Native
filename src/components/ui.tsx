import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  PressableProps,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextProps,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { C, font } from "../constants/colors";

export function Txt({
  style,
  weight = "regular",
  ...props
}: TextProps & { weight?: keyof typeof font }) {
  return (
    <Text
      {...props}
      style={[{ fontFamily: font[weight], fontSize: 14, color: C.ink }, style]}
    />
  );
}

export function Icon({
  name,
  size = 22,
  color = C.ink,
}: {
  name: string;
  size?: number;
  color?: string;
}) {
  return (
    <Ionicons
      name={name as React.ComponentProps<typeof Ionicons>["name"]}
      size={size}
      color={color}
    />
  );
}

export function Tap({
  children,
  style,
  ...props
}: Omit<PressableProps, "style"> & { style?: StyleProp<ViewStyle> }) {
  const [scale] = useState(() => new Animated.Value(1));
  const animate = (toValue: number) => {
    Animated.spring(scale, {
      toValue,
      speed: 35,
      bounciness: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={{ transform: [{ scale }], opacity: props.disabled ? 0.45 : 1 }}
    >
      <Pressable
        accessibilityRole="button"
        {...props}
        onPressIn={(e) => {
          animate(0.96);
          props.onPressIn?.(e);
        }}
        onPressOut={(e) => {
          animate(1);
          props.onPressOut?.(e);
        }}
        style={[{ minHeight: 44, justifyContent: "center" }, style]}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

export function Button({
  title,
  onPress,
  icon = "arrow-forward",
  light = false,
  busy = false,
  danger = false,
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  icon?: string;
  light?: boolean;
  busy?: boolean;
  danger?: boolean;
  disabled?: boolean;
}) {
  const color = light ? C.ink : "#fff";
  return (
    <Tap
      disabled={busy || disabled}
      accessibilityLabel={title}
      onPress={onPress}
      style={[
        s.button,
        { backgroundColor: danger ? C.red : light ? C.pale : C.green },
      ]}
    >
      {busy ? (
        <ActivityIndicator color={color} />
      ) : (
        <>
          <Txt weight="bold" style={{ color, fontSize: 15, flexShrink: 1 }}>
            {title}
          </Txt>
          {icon ? <Icon name={icon} color={color} size={20} /> : null}
        </>
      )}
    </Tap>
  );
}

export function IconButton({
  icon,
  onPress,
  label,
  dark = false,
}: {
  icon: string;
  onPress: () => void;
  label: string;
  dark?: boolean;
}) {
  return (
    <Tap
      accessibilityLabel={label}
      onPress={onPress}
      style={[s.iconButton, dark && { backgroundColor: C.green }]}
    >
      <Icon name={icon} color={dark ? "#fff" : C.ink} size={21} />
    </Tap>
  );
}

export function Screen({
  children,
  scroll = true,
  style,
}: React.PropsWithChildren<{
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
}>) {
  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ flex: 1, backgroundColor: C.bg }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        {scroll ? (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[s.screen, style]}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[s.screen, { flex: 1 }, style]}>{children}</View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function Enter({
  children,
  delay = 0,
  style,
}: React.PropsWithChildren<{ delay?: number; style?: StyleProp<ViewStyle> }>) {
  const [value] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const animation = Animated.timing(value, {
      toValue: 1,
      delay,
      duration: 550,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [value, delay]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: value,
          transform: [
            {
              translateY: value.interpolate({
                inputRange: [0, 1],
                outputRange: [18, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

export function Header({
  title,
  subtitle,
  back = false,
  right,
  onBack,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: React.ReactNode;
  onBack?: () => void;
}) {
  function handleBack() {
    if (onBack) {
      onBack();
      return;
    }
    try {
      if (router.canGoBack()) router.back();
      else router.replace("/home");
    } catch {
      // Bắt lỗi nếu chạy ngoài router context
    }
  }
  return (
    <View style={s.header}>
      {back && (
        <IconButton icon="arrow-back" label="Đóng" onPress={handleBack} />
      )}
      <View style={{ flex: 1 }}>
        <Txt
          weight="extra"
          style={{ fontSize: back ? 23 : 28, letterSpacing: -0.9 }}
        >
          {title}
        </Txt>
        {subtitle && (
          <Txt
            style={{
              color: C.muted,
              marginTop: 5,
              fontSize: 12,
              lineHeight: 19,
            }}
          >
            {subtitle}
          </Txt>
        )}
      </View>
      {right}
    </View>
  );
}

export function Section({
  title,
  action,
  onPress,
}: {
  title: string;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <View style={s.section}>
      <Txt weight="bold" style={{ fontSize: 17, flex: 1, letterSpacing: -0.5 }}>
        {title}
      </Txt>
      {action && (
        <Tap
          onPress={onPress}
          style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
        >
          <Txt style={{ fontSize: 12, color: C.muted }}>{action}</Txt>
          <Icon name="arrow-forward" size={16} color={C.muted} />
        </Tap>
      )}
    </View>
  );
}

export function Field({
  label,
  error,
  style,
  ...props
}: TextInputProps & {
  label: string;
  error?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={{ gap: 8 }}>
      <Txt weight="semibold" style={{ fontSize: 12 }}>
        {label}
      </Txt>
      <TextInput
        placeholderTextColor="#9BA398"
        {...props}
        style={[s.input, error ? { borderColor: C.red } : null, style as any]}
      />
      {error ? <Txt style={s.error}>{error}</Txt> : null}
    </View>
  );
}

export function Chip({
  title,
  selected = false,
  onPress,
  dot,
}: {
  title: string;
  selected?: boolean;
  onPress: () => void;
  dot?: string;
}) {
  return (
    <Tap
      onPress={onPress}
      style={[
        s.chip,
        selected && { backgroundColor: C.green, borderColor: C.green },
      ]}
    >
      {dot && (
        <View
          style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: dot }}
        />
      )}
      <Txt
        weight="semibold"
        style={{ color: selected ? "#fff" : C.muted, fontSize: 12 }}
      >
        {title}
      </Txt>
    </Tap>
  );
}

export function Empty({
  title,
  body,
  onPress,
  action,
}: {
  title: string;
  body: string;
  onPress?: () => void;
  action?: string;
}) {
  return (
    <View style={{ paddingVertical: 40, alignItems: "center", gap: 12 }}>
      <View style={[s.iconButton, { width: 64, height: 64, borderRadius: 24 }]}>
        <Icon name="leaf-outline" size={28} color={C.green2} />
      </View>
      <Txt weight="bold" style={{ fontSize: 17 }}>
        {title}
      </Txt>
      <Txt
        style={{
          color: C.muted,
          textAlign: "center",
          lineHeight: 22,
          maxWidth: 260,
        }}
      >
        {body}
      </Txt>
      {action && onPress && <Button title={action} onPress={onPress} light />}
    </View>
  );
}

export function CategoryIcon({
  category,
  size = 46,
}: {
  category?: { icon?: string; color?: string; name?: string };
  size?: number;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.34,
        backgroundColor: `${category?.color ?? C.green}16`,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon
        name={category?.icon ?? "wallet-outline"}
        color={category?.color ?? C.green}
        size={size * 0.47}
      />
    </View>
  );
}

export function TransactionRow({
  tx,
  onPress,
}: {
  tx: any;
  onPress?: () => void;
}) {
  return (
    <Tap
      onPress={
        onPress ||
        (() =>
          router.push({
            pathname: "/transaction/[id]",
            params: { id: tx?.id },
          }))
      }
      style={s.txRow}
    >
      <CategoryIcon category={tx?.category} />
      <View style={{ flex: 1, gap: 4 }}>
        <Txt weight="bold" numberOfLines={1} style={{ fontSize: 13 }}>
          {tx?.title || tx?.name}
        </Txt>
        <Txt style={{ color: C.muted, fontSize: 11 }}>
          {tx?.category?.name || "Khác"}
        </Txt>
      </View>
      <View style={{ alignItems: "flex-end", gap: 5 }}>
        <Txt weight="bold" style={{ fontSize: 12, color: C.ink }}>
          −{Number(tx?.amount || 0).toLocaleString()} ₫
        </Txt>
        <Txt style={{ color: C.muted, fontSize: 11 }}>
          {tx?.date || tx?.occurredAt || ""}
        </Txt>
      </View>
    </Tap>
  );
}

export const s = StyleSheet.create({
  screen: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 36,
    gap: 22,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
  },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  section: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 38,
  },
  button: {
    borderRadius: 19,
    minHeight: 56,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: C.pale,
    justifyContent: "center",
    alignItems: "center",
  },
  card: { backgroundColor: C.paper, borderRadius: 24, padding: 18 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 54,
    fontFamily: font.medium,
    color: C.ink,
    fontSize: 14,
  },
  error: { color: C.red, fontSize: 12, lineHeight: 19 },
  chip: {
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.pale,
    paddingHorizontal: 16,
    borderRadius: 22,
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
  },
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EFF0EA",
  },
});
