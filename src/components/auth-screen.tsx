import React, { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import {
  Button,
  Enter,
  Field,
  Icon,
  IconButton,
  Screen,
  Tap,
  Txt,
  s,
} from "./ui";
import { C } from "../constants/colors";
import { useLanguage } from "../contexts/languageContext";

export interface AuthScreenProps {
  register?: boolean;
  onSubmit?: (data: {
    username: string;
    password: string;
    name?: string;
    initialBalance?: string;
  }) => void;
}

export function AuthScreen({ register = false, onSubmit }: AuthScreenProps) {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [initialBalance, setInitialBalance] = useState("0");
  const [show, setShow] = useState(false);
  const { t } = useLanguage();

  function handlePress() {
    if (onSubmit) {
      onSubmit({ username, password, name, initialBalance });
    } else {
      try {
        router.replace("/home");
      } catch (e) {
        console.log("Chưa cấu hình router:", e);
      }
    }
  }

  return (
    <Screen>
      <View style={[s.row, { justifyContent: "space-between" }]}>
        <IconButton
          icon="arrow-back"
          label="Đóng"
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/")
          }
        />
        <View style={s.row}>
          <Icon name="leaf" size={18} color={C.green2} />
          <Txt weight="extra" style={{ letterSpacing: 2, fontSize: 22 }}>
            mint.
          </Txt>
        </View>
      </View>

      <Enter>
        <View style={{ marginTop: 14, marginBottom: 24 }}>
          <View
            style={{
              width: 58,
              height: 58,
              backgroundColor: C.pale,
              borderRadius: 22,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 22,
            }}
          >
            <Icon
              name={register ? "sparkles-outline" : "wallet-outline"}
              size={28}
            />
          </View>
          <Txt weight="extra" style={{ fontSize: 31, letterSpacing: -1.3 }}>
            {register ? t("auth.register_title") : t("auth.login_title")}
          </Txt>
          <Txt style={{ color: C.muted, marginTop: 10, lineHeight: 23 }}>
            {register ? t("auth.register_sub") : t("auth.login_sub")}
          </Txt>
        </View>

        <View style={{ gap: 18 }}>
          {register && (
            <Field
              label={t("auth.name")}
              value={name}
              onChangeText={setName}
              autoComplete="off"
              maxLength={80}
            />
          )}
          <Field
            label={t("auth.username")}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="off"
            maxLength={100}
          />
          <View>
            <Field
              label={t("auth.password")}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!show}
              autoComplete="off"
              style={{ paddingRight: 58 }}
            />
            <View style={{ position: "absolute", right: 5, bottom: 5 }}>
              <IconButton
                label="Ẩn hiện"
                icon={show ? "eye-off-outline" : "eye-outline"}
                onPress={() => setShow(!show)}
              />
            </View>
          </View>
          {register && (
            <Field
              label={t("auth.confirm_password")}
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry={!show}
              autoComplete="off"
            />
          )}
          {register && (
            <Field
              label={t("auth.initial_balance")}
              value={initialBalance}
              onChangeText={setInitialBalance}
              keyboardType="number-pad"
              maxLength={14}
            />
          )}

          <Button
            title={register ? t("auth.register_btn") : t("auth.login_btn")}
            onPress={handlePress}
          />

          <View
            style={[
              s.row,
              { justifyContent: "center", flexWrap: "wrap", gap: 6 },
            ]}
          >
            <Txt style={{ color: C.muted, fontSize: 12 }}>
              {register ? t("auth.have_account") : t("auth.no_account")}
            </Txt>
            <Tap
              onPress={() => router.replace(register ? "/login" : "/register")}
            >
              <Txt weight="bold" style={{ fontSize: 12 }}>
                {register
                  ? t("auth.switch_to_login")
                  : t("auth.switch_to_register")}
              </Txt>
            </Tap>
          </View>
        </View>
      </Enter>
    </Screen>
  );
}
