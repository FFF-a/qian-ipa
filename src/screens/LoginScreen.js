import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppButton from "../components/AppButton";
import AppInput from "../components/AppInput";
import { useAuth } from "../context/AuthContext";
import { colors, radius, shadow, spacing, typography } from "../theme";

export default function LoginScreen() {
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      Alert.alert("提示", "请输入用户名和密码");
      return;
    }
    setLoading(true);
    try {
      await login(username.trim(), password);
    } catch (err) {
      Alert.alert("登录失败", err.message || "请检查账号密码");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.hero, { paddingTop: insets.top + spacing.xxxl }]}>
        <View style={styles.logo}>
          <Text style={styles.logoLetter}>O</Text>
        </View>
        <Text style={styles.brand}>Office Manage</Text>
        <Text style={styles.tagline}>智能办公 · 员工与设备一体化管理</Text>
      </View>

      <View style={[styles.card, shadow.card, { marginBottom: insets.bottom + spacing.lg }]}>
        <Text style={styles.cardTitle}>管理员登录</Text>
        <Text style={styles.cardSub}>使用后台账号进入管理系统</Text>

        <AppInput
          label="用户名"
          placeholder="请输入用户名"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <AppInput
          label="密码"
          placeholder="请输入密码"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <AppButton title="登 录" onPress={handleLogin} loading={loading} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hero: {
    backgroundColor: colors.header,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl + 8,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  logoLetter: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  brand: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  tagline: {
    ...typography.caption,
    color: "rgba(255,255,255,0.75)",
    marginTop: spacing.sm,
  },
  card: {
    flex: 1,
    marginHorizontal: spacing.lg,
    marginTop: -spacing.xxl,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    ...typography.title,
    marginBottom: spacing.xs,
  },
  cardSub: {
    ...typography.caption,
    marginBottom: spacing.xl,
  },
});
