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
            {register ? "Bắt đầu hành trình mới." : "Chào mừng trở lại."}
          </Txt>
          <Txt style={{ color: C.muted, marginTop: 10, lineHeight: 23 }}>
            Quản lý chi tiêu, nhẹ nhàng hơn mỗi ngày.
          </Txt>
        </View>

        <View style={{ gap: 18 }}>
          {register && (
            <Field
              label="Họ và tên"
              value={name}
              onChangeText={setName}
              autoComplete="off"
              maxLength={80}
            />
          )}
          <Field
            label="Email hoặc tên đăng nhập"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="off"
            maxLength={100}
          />
          <View>
            <Field
              label="Mật khẩu"
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
              label="Nhập lại mật khẩu"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry={!show}
              autoComplete="off"
            />
          )}
          {register && (
            <Field
              label="Số tiền ví ban đầu (₫)"
              value={initialBalance}
              onChangeText={setInitialBalance}
              keyboardType="number-pad"
              maxLength={14}
            />
          )}

          <Button
            title={register ? "Đăng ký" : "Đăng nhập"}
            onPress={handlePress}
          />

          <View
            style={[
              s.row,
              { justifyContent: "center", flexWrap: "wrap", gap: 6 },
            ]}
          >
            <Txt style={{ color: C.muted, fontSize: 12 }}>
              {register ? "Đã có tài khoản?" : "Chưa có tài khoản?"}
            </Txt>
            <Tap
              onPress={() => router.replace(register ? "/login" : "/register")}
            >
              <Txt weight="bold" style={{ fontSize: 12 }}>
                {register ? "Đăng nhập" : "Đăng ký"}
              </Txt>
            </Tap>
          </View>
        </View>
      </Enter>
    </Screen>
  );
}
