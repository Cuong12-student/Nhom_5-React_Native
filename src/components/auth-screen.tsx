import React, { useState } from "react";
import { View, Alert } from "react-native";
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
import { registerUser, loginUser, User } from "../utils/storage";

export interface AuthScreenProps {
  register?: boolean;
  onSwitchMode?: () => void;
  onSubmit?: (userData: User) => void;
}

export function AuthScreen({
  register = false,
  onSubmit,
  onSwitchMode,
}: AuthScreenProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { t } = useLanguage();

  async function handlePress() {
    setError("");
    setBusy(true);

    try {
      if (register) {
        // Validate
        if (!name.trim()) {
          setError("Vui lòng nhập họ và tên!");
          setBusy(false);
          return;
        }
        if (!email.trim()) {
          setError("Vui lòng nhập email!");
          setBusy(false);
          return;
        }
        if (!password.trim()) {
          setError("Vui lòng nhập mật khẩu!");
          setBusy(false);
          return;
        }
        if (password !== confirm) {
          setError("Mật khẩu nhập lại không khớp!");
          setBusy(false);
          return;
        }

        const user = await registerUser(name, email, password);
        if (onSubmit) onSubmit(user);
      } else {
        // Login
        if (!email.trim()) {
          setError("Vui lòng nhập email!");
          setBusy(false);
          return;
        }
        if (!password.trim()) {
          setError("Vui lòng nhập mật khẩu!");
          setBusy(false);
          return;
        }

        const user = await loginUser(email, password);
        if (onSubmit) onSubmit(user);
      }
    } catch (e: any) {
      setError(e.message || "Đã xảy ra lỗi!");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <View style={[s.row, { justifyContent: "space-between" }]}>
        <View />
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
            value={email}
            onChangeText={setEmail}
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

          {/* Error message */}
          {error !== "" && (
            <View
              style={{
                backgroundColor: "#FEE2E2",
                borderRadius: 12,
                padding: 12,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Icon name="alert-circle-outline" size={18} color={C.red} />
              <Txt style={{ color: C.red, fontSize: 13, flex: 1 }}>
                {error}
              </Txt>
            </View>
          )}

          <Button
            title={register ? t("auth.register_btn") : t("auth.login_btn")}
            onPress={handlePress}
            busy={busy}
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
            <Tap onPress={onSwitchMode}>
              <Txt weight="bold" style={{ fontSize: 12, color: C.green }}>
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
